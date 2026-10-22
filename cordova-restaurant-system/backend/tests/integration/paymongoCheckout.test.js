const request = require('supertest');
const { randomUUID, createHmac } = require('node:crypto');
const describeWithDb = process.env.DATABASE_URL ? describe : describe.skip;

describeWithDb('PayMongo promotion checkout', () => {
  const app = require('../../src/app');
  const { query, pool } = require('../../src/config/db');
  const { signAccessToken } = require('../../src/utils/jwt');
  const env = require('../../src/config/env');
  const ownerId = randomUUID();
  const otherId = randomUUID();
  const restaurantId = randomUUID();
  const promotionId = randomUUID();
  const cancelledPromotionId = randomUUID();
  const sessionId = `cs_${randomUUID().replace(/-/g, '')}`;
  let currentSessionId = sessionId;
  const paymentId = `pay_${randomUUID().replace(/-/g, '')}`;
  const eventId = `evt_${randomUUID().replace(/-/g, '')}`;
  let ownerToken;
  let otherToken;
  let orderId;
  let providerSession;
  let oldPaymongo;
  let oldFetch;

  function signedEvent(id = eventId) {
    const body = JSON.stringify({ data: { id, type: 'event', attributes: { type: 'checkout_session.payment.paid', livemode: false, data: { id: sessionId } } } });
    const t = Math.floor(Date.now() / 1000).toString();
    const te = createHmac('sha256', 'test-webhook-secret').update(`${t}.${body}`).digest('hex');
    return { body, signature: `t=${t},te=${te},li=` };
  }

  beforeAll(async () => {
    await query('INSERT INTO users (id,email,full_name,role,email_verified) VALUES ($1,$2,$3,$4,TRUE),($5,$6,$7,$8,TRUE)',
      [ownerId, `${ownerId}@example.com`, 'Owner', 'owner', otherId, `${otherId}@example.com`, 'Other', 'owner']);
    await query("INSERT INTO restaurants (id,owner_id,name,slug,address,latitude,longitude,status) VALUES ($1,$2,'Payment Test',$3,'Cordova',10,123,'verified')",
      [restaurantId, ownerId, restaurantId]);
    await query("INSERT INTO promotions (id,restaurant_id,title,start_date,end_date,status,payment_method,payment_status) VALUES ($1,$2,'Test Offer',CURRENT_DATE,CURRENT_DATE+7,'pending_verification','paymongo','pending_verification')",
      [promotionId, restaurantId]);
    ownerToken = signAccessToken({ id: ownerId, role: 'owner', email: `${ownerId}@example.com` });
    otherToken = signAccessToken({ id: otherId, role: 'owner', email: `${otherId}@example.com` });
    oldPaymongo = env.paymongo;
    env.paymongo = { secretKey: 'sk_test_fixture', webhookSecret: 'test-webhook-secret' };
    oldFetch = global.fetch;
    global.fetch = jest.fn(async (url, options) => {
      if (String(url).endsWith('/expire')) {
        providerSession = { ...providerSession, attributes: { ...providerSession.attributes, status: 'expired', payments: [] } };
        return { ok: true, json: async () => ({ data: providerSession }) };
      }
      if (options?.method === 'POST') {
        const body = JSON.parse(options.body);
        expect(body.data.attributes.line_items[0].amount).toBe(19900);
        return { ok: true, json: async () => ({ data: { id: currentSessionId, attributes: { checkout_url: 'https://checkout.paymongo.com/test', livemode: false } } }) };
      }
      if (String(url).endsWith(currentSessionId)) return { ok: true, json: async () => ({ data: providerSession }) };
      throw new Error('Unexpected provider request');
    });
  });

  afterAll(async () => {
    global.fetch = oldFetch;
    env.paymongo = oldPaymongo;
    await query('DELETE FROM paymongo_webhook_events WHERE event_id = $1', [eventId]);
    await query('DELETE FROM promotion_payment_orders WHERE promotion_id = $1', [promotionId]);
    await query('DELETE FROM promotion_payment_orders WHERE promotion_id = $1', [cancelledPromotionId]);
    await query('DELETE FROM promotions WHERE id = $1', [promotionId]);
    await query('DELETE FROM promotions WHERE id = $1', [cancelledPromotionId]);
    await query('DELETE FROM restaurants WHERE id = $1', [restaurantId]);
    await query('DELETE FROM users WHERE id = ANY($1::uuid[])', [[ownerId, otherId]]);
    await pool.end();
  });

  test('rejects another owner and inactive packages', async () => {
    const stranger = await request(app).post('/api/payments/promotions/checkout')
      .set('Authorization', `Bearer ${otherToken}`).send({ promotionId, packageId: 'standard-30' });
    expect(stranger.status).toBe(403);
    const missing = await request(app).post('/api/payments/promotions/checkout')
      .set('Authorization', `Bearer ${ownerToken}`).send({ promotionId, packageId: 'unavailable' });
    expect(missing.status).toBe(400);
  });

  test('snapshots server price, reuses pending checkout and isolates order status', async () => {
    const body = { promotionId, packageId: 'standard-30', amount_centavos: 1, price: 0 };
    const first = await request(app).post('/api/payments/promotions/checkout')
      .set('Authorization', `Bearer ${ownerToken}`).send(body);
    expect(first.status).toBe(200);
    orderId = first.body.data.orderId;
    const repeated = await request(app).post('/api/payments/promotions/checkout')
      .set('Authorization', `Bearer ${ownerToken}`).send(body);
    expect(repeated.body.data.orderId).toBe(orderId);
    const { rows } = await query('SELECT amount_centavos,status FROM promotion_payment_orders WHERE id = $1', [orderId]);
    expect(rows[0]).toMatchObject({ amount_centavos: 19900, status: 'pending' });
    expect((await request(app).get(`/api/payments/orders/${orderId}`).set('Authorization', `Bearer ${otherToken}`)).status).toBe(404);
    expect((await query('SELECT status FROM promotions WHERE id = $1', [promotionId])).rows[0].status).toBe('pending_verification');
  });

  test('rejects mismatches, then fulfills once under concurrent duplicate delivery', async () => {
    providerSession = { id: sessionId, attributes: { livemode: false, reference_number: orderId, payments: [
      { id: paymentId, attributes: { status: 'paid', amount: 1, currency: 'PHP', livemode: false } },
    ] } };
    const event = signedEvent();
    const wrong = await request(app).post('/api/payments/paymongo/webhook')
      .set('Content-Type', 'application/json').set('Paymongo-Signature', event.signature).send(event.body);
    expect(wrong.status).toBe(400);
    expect((await query('SELECT status FROM promotion_payment_orders WHERE id = $1', [orderId])).rows[0].status).toBe('pending');
    providerSession.attributes.payments[0].attributes.amount = 19900;
    const [a, b] = await Promise.all([0, 1].map(() => request(app).post('/api/payments/paymongo/webhook')
      .set('Content-Type', 'application/json').set('Paymongo-Signature', event.signature).send(event.body)));
    expect([a.status, b.status]).toEqual([200, 200]);
    const { rows } = await query('SELECT status,paid_at FROM promotion_payment_orders WHERE id = $1', [orderId]);
    expect(rows[0].status).toBe('paid');
    const promo = (await query('SELECT status,payment_status,end_date FROM promotions WHERE id = $1', [promotionId])).rows[0];
    expect(promo.status).toBe('active');
    expect(promo.payment_status).toBe('verified');
    const replay = await request(app).post('/api/payments/paymongo/webhook')
      .set('Content-Type', 'application/json').set('Paymongo-Signature', event.signature).send(event.body);
    expect(replay.status).toBe(200);
    expect((await query('SELECT end_date FROM promotions WHERE id = $1', [promotionId])).rows[0].end_date).toEqual(promo.end_date);
  });

  test('expires a cancelled order only after PayMongo confirms session expiry', async () => {
    currentSessionId = `cs_${randomUUID().replace(/-/g, '')}`;
    await query("INSERT INTO promotions (id,restaurant_id,title,start_date,end_date,status,payment_method,payment_status) VALUES ($1,$2,'Cancel Test',CURRENT_DATE,CURRENT_DATE+7,'pending_verification','paymongo','pending_verification')",
      [cancelledPromotionId, restaurantId]);
    const created = await request(app).post('/api/payments/promotions/checkout')
      .set('Authorization', `Bearer ${ownerToken}`).send({ promotionId: cancelledPromotionId, packageId: 'standard-30' });
    expect(created.status).toBe(200);
    providerSession = { id: currentSessionId, attributes: { livemode: false, status: 'active', reference_number: created.body.data.orderId, payments: [] } };
    const cancelled = await request(app).post(`/api/payments/orders/${created.body.data.orderId}/cancel`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('expired');
    expect((await query('SELECT status FROM promotions WHERE id = $1', [cancelledPromotionId])).rows[0].status).toBe('pending_verification');
  });
});
