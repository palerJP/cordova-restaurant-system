const env = require('../../src/config/env');
const paymongo = require('../../src/services/paymongo.service');
const recurring = require('../../src/services/recurringSubscription.service');

describe('PayMongo recurring test safeguards', () => {
  const original = env.paymongo;
  afterEach(() => { env.paymongo = original; jest.restoreAllMocks(); });

  test('requires both test keys', () => {
    env.paymongo = { secretKey: 'sk_live_bad', publicKey: 'pk_test_good' };
    expect(() => paymongo.assertRecurringConfigured()).toThrow();
    env.paymongo = { secretKey: 'sk_test_good', publicKey: 'pk_live_bad' };
    expect(() => paymongo.assertRecurringConfigured()).toThrow();
    env.paymongo = { secretKey: 'sk_test_good', publicKey: 'pk_test_good' };
    expect(paymongo.assertRecurringConfigured()).toBe('pk_test_good');
  });

  test('creates a scheduled monthly plan for the database price', async () => {
    env.paymongo = { secretKey: 'sk_test_good', publicKey: 'pk_test_good' };
    const fake = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ data: { id: 'plan_test', attributes: { livemode: false } } }) });
    await paymongo.createPlan({ id: 'basic-monthly', name: 'Basic monthly', amount_centavos: 49900, currency: 'PHP', interval: 'monthly' });
    const [url, options] = fake.mock.calls[0];
    expect(url).toBe('https://api.paymongo.com/v1/subscriptions/plans');
    expect(options.headers['Idempotency-Key']).toBe('plan-basic-monthly');
    expect(JSON.parse(options.body).data.attributes).toMatchObject({ amount: 49900, currency: 'PHP', interval: 'monthly', interval_count: 1 });
  });

  test('rejects live and mismatched subscriptions', () => {
    const local = { paymongo_plan_id: 'plan_1', paymongo_customer_id: 'cus_1', amount_centavos: 49900, currency: 'PHP' };
    const remote = { id: 'subs_1', attributes: { livemode: false, plan: { id: 'plan_1' }, customer_id: 'cus_1',
      latest_invoice: { id: 'inv_1', amount: 49900, currency: 'PHP' }, status: 'incomplete' } };
    expect(recurring.checkSubscription(remote, local).status).toBe('incomplete');
    expect(() => recurring.checkSubscription({ ...remote, attributes: { ...remote.attributes, livemode: true } }, local)).toThrow();
    expect(() => recurring.checkSubscription(remote, { ...local, amount_centavos: 1 })).toThrow();
    expect(() => recurring.checkSubscription(remote, { ...local, paymongo_customer_id: 'cus_2' })).toThrow();
  });

  test('reactivates after a paid renewal while withholding unpaid first access', () => {
    const current = { status: 'incomplete', first_invoice_id: 'inv_first' };
    const state = { status: 'active', latest_invoice: { id: 'inv_first', status: 'open', payment_intent: { status: 'awaiting_payment_method' } } };
    expect(recurring.verifiedStatus(state, current)).toBe('incomplete');
    expect(recurring.verifiedStatus({ ...state, latest_invoice: { id: 'inv_other', status: 'paid', payment_intent: { status: 'succeeded' } } }, current)).toBe('incomplete');
    expect(recurring.verifiedStatus({ ...state, latest_invoice: { id: 'inv_renewal', status: 'paid', payment_intent: { status: 'succeeded' } } }, { ...current, status: 'past_due' })).toBe('active');
    expect(recurring.verifiedStatus(state, { ...current, status: 'past_due' })).toBe('past_due');
  });
});
