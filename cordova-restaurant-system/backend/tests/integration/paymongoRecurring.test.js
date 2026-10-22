const request = require('supertest');
const { randomUUID, createHmac } = require('node:crypto');
const describeWithDb = process.env.DATABASE_URL ? describe : describe.skip;

describeWithDb('PayMongo recurring subscriptions', () => {
  const app = require('../../src/app');
  const { query, pool } = require('../../src/config/db');
  const { signAccessToken } = require('../../src/utils/jwt');
  const env = require('../../src/config/env');
  const ownerId = randomUUID();
  const otherId = randomUUID();
  const restaurantId = randomUUID();
  const planId = `test-${randomUUID()}`;
  const remotePlanId = `plan_${randomUUID().replace(/-/g, '')}`;
  const customerId = `cus_${randomUUID().replace(/-/g, '')}`;
  const remoteSubId = `subs_${randomUUID().replace(/-/g, '')}`;
  const invoiceId = `inv_${randomUUID().replace(/-/g, '')}`;
  const intentId = `pi_${randomUUID().replace(/-/g, '')}`;
  const eventId = `evt_${randomUUID().replace(/-/g, '')}`;
  const ownerToken = signAccessToken({ id: ownerId, role: 'owner', email: `${ownerId}@example.com` });
  const otherToken = signAccessToken({ id: otherId, role: 'owner', email: `${otherId}@example.com` });
  let subscriptionId;
  let providerStatus = 'incomplete';
  let invoiceStatus = 'open';
  let oldEnv;
  let oldFetch;

  function remoteSubscription() {
    return { id: remoteSubId, attributes: { livemode: false, plan: { id: remotePlanId }, customer_id: customerId,
      status: providerStatus, next_billing_schedule: '2026-11-18', latest_invoice: { id: invoiceId,
        amount: 49900, currency: 'PHP', status: invoiceStatus,
        payment_intent: { id: intentId, status: invoiceStatus === 'paid' ? 'succeeded' : 'awaiting_payment_method' } } } };
  }

  beforeAll(async () => {
    await query('INSERT INTO users (id,email,full_name,role,email_verified) VALUES ($1,$2,$3,$4,TRUE),($5,$6,$7,$8,TRUE)',
      [ownerId, `${ownerId}@example.com`, 'Test Owner', 'owner', otherId, `${otherId}@example.com`, 'Other', 'owner']);
    await query("INSERT INTO restaurants (id,owner_id,name,slug,address,latitude,longitude,status) VALUES ($1,$2,'Subscription Test',$3,'Cordova',10,123,'verified')",
      [restaurantId, ownerId, restaurantId]);
    await query('INSERT INTO subscription_plans (id,name,tier,interval,amount_centavos) VALUES ($1,$2,$3,$4,$5)',
      [planId, 'Test monthly', 'basic', 'monthly', 49900]);
    oldEnv = env.paymongo;
    env.paymongo = { secretKey: 'sk_test_fixture', publicKey: 'pk_test_fixture', webhookSecret: 'test-webhook-secret' };
    oldFetch = global.fetch;
    global.fetch = jest.fn(async (url, options) => {
      const path = String(url);
      let data;
      if (path.endsWith('/subscriptions/plans') && options?.method === 'POST') data = { id: remotePlanId, attributes: { livemode: false, amount: 49900, currency: 'PHP' } };
      else if (path.endsWith('/customers') && options?.method === 'POST') data = { id: customerId, attributes: { livemode: false } };
      else if (path.endsWith('/subscriptions') && options?.method === 'POST') data = remoteSubscription();
      else if (path.endsWith(`/subscriptions/${remoteSubId}`) && options?.method === 'DELETE') { providerStatus = 'cancelled'; return { ok: true, status: 204 }; }
      else if (path.endsWith(`/subscriptions/${remoteSubId}`)) data = remoteSubscription();
      else if (path.endsWith(`/payment_intents/${intentId}`)) data = { id: intentId, attributes: { livemode: false, amount: 49900, currency: 'PHP', client_key: 'client_key_test' } };
      else throw new Error(`Unexpected provider request: ${path}`);
      return { ok: true, status: 200, json: async () => ({ data }) };
    });
  });

  afterAll(async () => {
    global.fetch = oldFetch;
    env.paymongo = oldEnv;
    await query('DELETE FROM paymongo_webhook_events WHERE event_id = $1', [eventId]);
    await query('UPDATE restaurants SET paymongo_recurring_subscription_id = NULL WHERE id = $1', [restaurantId]);
    await query('DELETE FROM recurring_subscriptions WHERE restaurant_id = $1', [restaurantId]);
    await query('DELETE FROM paymongo_customers WHERE user_id = $1', [ownerId]);
    await query('DELETE FROM subscription_plans WHERE id = $1', [planId]);
    await query('DELETE FROM restaurants WHERE id = $1', [restaurantId]);
    await query('DELETE FROM users WHERE id = ANY($1::uuid[])', [[ownerId, otherId]]);
    await pool.end();
  });

  test('owner starts at the server price; access waits for a paid first invoice', async () => {
    const body = { restaurantId, planId, phone: '09171234567', amount_centavos: 1 };
    expect((await request(app).post('/api/payments/subscriptions').set('Authorization', `Bearer ${otherToken}`).send(body)).status).toBe(403);
    const started = await request(app).post('/api/payments/subscriptions').set('Authorization', `Bearer ${ownerToken}`).send(body);
    expect(started.status).toBe(200);
    expect(started.body.data).toMatchObject({ status: 'incomplete', amountCentavos: 49900, publicKey: 'pk_test_fixture', paymentIntentId: intentId });
    subscriptionId = started.body.data.id;
    expect((await query('SELECT subscription_tier FROM restaurants WHERE id = $1', [restaurantId])).rows[0].subscription_tier).toBe('none');
    expect((await request(app).get(`/api/payments/subscriptions/${subscriptionId}`).set('Authorization', `Bearer ${otherToken}`)).status).toBe(404);
  });

  test('signed paid event activates once; cancellation removes access', async () => {
    providerStatus = 'active'; invoiceStatus = 'paid';
    const body = JSON.stringify({ data: { id: eventId, type: 'event', attributes: {
      type: 'subscription.invoice.paid', livemode: false,
      data: { id: invoiceId, type: 'invoice', attributes: { livemode: false, resource_id: remoteSubId } },
    } } });
    const t = Math.floor(Date.now() / 1000).toString();
    const signature = `t=${t},te=${createHmac('sha256', 'test-webhook-secret').update(`${t}.${body}`).digest('hex')},li=`;
    for (let i = 0; i < 2; i++) {
      expect((await request(app).post('/api/payments/paymongo/webhook').set('Content-Type', 'application/json')
        .set('Paymongo-Signature', signature).send(body)).status).toBe(200);
    }
    expect((await query('SELECT subscription_tier FROM restaurants WHERE id = $1', [restaurantId])).rows[0].subscription_tier).toBe('basic');
    expect((await query('SELECT COUNT(*)::int AS count FROM paymongo_webhook_events WHERE event_id = $1', [eventId])).rows[0].count).toBe(1);
    const cancelled = await request(app).post(`/api/payments/subscriptions/${subscriptionId}/cancel`).set('Authorization', `Bearer ${ownerToken}`);
    expect(cancelled.body.data.status).toBe('cancelled');
    expect((await query('SELECT subscription_tier FROM restaurants WHERE id = $1', [restaurantId])).rows[0].subscription_tier).toBe('none');
  });
});
