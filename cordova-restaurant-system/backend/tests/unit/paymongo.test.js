const crypto = require('node:crypto');
const request = require('supertest');
const env = require('../../src/config/env');
const paymongo = require('../../src/services/paymongo.service');
const { validatePaidCheckout } = require('../../src/controllers/paymongo.controller');

describe('PayMongo test safeguards', () => {
  const original = env.paymongo;
  afterEach(() => { env.paymongo = original; jest.restoreAllMocks(); });

  test('rejects missing, stale, live and altered signatures', () => {
    const body = Buffer.from('{"data":{"id":"evt_demo"}}');
    const secret = 'test-webhook-secret';
    const now = 1_700_000_000_000;
    const t = '1700000000';
    const te = crypto.createHmac('sha256', secret).update(`${t}.`).update(body).digest('hex');
    expect(paymongo.verifySignature(`t=${t},te=${te},li=`, body, secret, now)).toBe(true);
    expect(paymongo.verifySignature(`t=${t},te=${te},li=`, Buffer.from('{}'), secret, now)).toBe(false);
    expect(paymongo.verifySignature(`t=${t},te=${te},li=`, body, secret, now + 301000)).toBe(false);
    expect(paymongo.verifySignature(`t=${t},te=,li=${te}`, body, secret, now)).toBe(false);
  });

  test('requires a test key and sends the stored amount and order reference', async () => {
    env.paymongo = { secretKey: 'sk_live_forbidden', webhookSecret: null };
    await expect(paymongo.createCheckout({ id: 'order-id' }, 'Package')).rejects.toThrow('test secret key');
    env.paymongo = { secretKey: 'sk_test_example', webhookSecret: null };
    const fakeFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ data: { id: 'cs_test', attributes: { livemode: false, checkout_url: 'https://checkout.paymongo.com/test' } } }),
    });
    await paymongo.createCheckout({ id: 'order-id', restaurant_id: 'restaurant-id', amount_centavos: 19900 }, '30-day promotion');
    const [url, options] = fakeFetch.mock.calls[0];
    expect(url).toBe('https://api.paymongo.com/v2/checkout_sessions');
    expect(options.headers['Idempotency-Key']).toBe('order-id');
    expect(JSON.parse(options.body).data.attributes).toMatchObject({
      reference_number: 'order-id', line_items: [{ amount: 19900, currency: 'PHP', quantity: 1, name: '30-day promotion' }],
    });
    fakeFetch.mockResolvedValueOnce({ ok: false, status: 503 });
    await expect(paymongo.createCheckout({ id: 'retry', restaurant_id: 'restaurant-id', amount_centavos: 19900 }, 'Package'))
      .rejects.toThrow('PayMongo API returned 503');
  });

  test('expires a checkout only through the server API', async () => {
    env.paymongo = { secretKey: 'sk_test_example', webhookSecret: null };
    const fakeFetch = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ data: { id: 'cs_test' } }) });
    await paymongo.expireCheckout('cs_test');
    expect(fakeFetch.mock.calls[0][0]).toBe('https://api.paymongo.com/v1/checkout_sessions/cs_test/expire');
    expect(fakeFetch.mock.calls[0][1].method).toBe('POST');
  });

  test('rejects an unsigned webhook and an unauthenticated checkout', async () => {
    const app = require('../../src/app');
    expect((await request(app).post('/api/payments/paymongo/webhook').set('Content-Type', 'application/json').send('{}')).status).toBe(401);
    expect((await request(app).post('/api/payments/promotions/checkout').send({ promotionId: 'any', packageId: 'standard-30' })).status).toBe(401);
  });

  test('only a matching test checkout with the snapshotted amount can fulfill', () => {
    const order = { id: 'order-1', checkout_session_id: 'cs_1', amount_centavos: 19900, currency: 'PHP' };
    const session = { id: 'cs_1', attributes: { livemode: false, reference_number: 'order-1',
      payments: [{ id: 'pay_1', attributes: { status: 'paid', amount: 19900, currency: 'PHP', livemode: false } }] } };
    expect(validatePaidCheckout(session, 'cs_1', order).id).toBe('pay_1');
    for (const mismatch of [
      { id: 'other' }, { checkout_session_id: 'cs_2' }, { amount_centavos: 9900 }, { currency: 'USD' },
    ]) {
      expect(() => validatePaidCheckout(session, 'cs_1', { ...order, ...mismatch })).toThrow();
    }
    expect(() => validatePaidCheckout({ ...session, attributes: { ...session.attributes, livemode: true } }, 'cs_1', order)).toThrow();
    expect(() => validatePaidCheckout({ ...session, attributes: { ...session.attributes, payments: [] } }, 'cs_1', order)).toThrow();
  });
});
