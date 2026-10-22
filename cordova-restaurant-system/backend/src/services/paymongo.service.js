const crypto = require('node:crypto');
const env = require('../config/env');

function credentials() {
  const key = env.paymongo.secretKey;
  if (!key || !key.startsWith('sk_test_')) throw new Error('PayMongo test secret key is not configured');
  return key;
}

function testPublicKey() {
  const key = env.paymongo.publicKey;
  if (!key || !key.startsWith('pk_test_')) throw new Error('PayMongo test public key is not configured');
  return key;
}

function assertRecurringConfigured() {
  credentials();
  return testPublicKey();
}

async function request(path, options = {}) {
  const response = await fetch(`https://api.paymongo.com${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`${credentials()}:`).toString('base64')}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`PayMongo API returned ${response.status}`);
  if (response.status === 204) return null;
  return response.json();
}

async function createCheckout(order, packageName) {
  const attributes = {
    line_items: [{ name: packageName, amount: order.amount_centavos, currency: 'PHP', quantity: 1 }],
    payment_method_types: ['qrph'],
    success_url: `${env.clientUrl}/dashboard/${order.restaurant_id}?tab=promotions&payment=returned&order=${order.id}`,
    cancel_url: `${env.clientUrl}/dashboard/${order.restaurant_id}?tab=promotions&payment=cancelled&order=${order.id}`,
    reference_number: order.id,
  };
  return (await request('/v2/checkout_sessions', {
    method: 'POST',
    headers: { 'Idempotency-Key': order.id },
    body: JSON.stringify({ data: { attributes } }),
  })).data;
}

async function getCheckout(id) {
  if (!/^cs_[\w-]+$/.test(id)) throw new Error('Invalid checkout session ID');
  return (await request(`/v1/checkout_sessions/${id}`)).data;
}

async function expireCheckout(id) {
  if (!/^cs_[\w-]+$/.test(id)) throw new Error('Invalid checkout session ID');
  return (await request(`/v1/checkout_sessions/${id}/expire`, { method: 'POST' })).data;
}

async function createPlan(plan) {
  return (await request('/v1/subscriptions/plans', {
    method: 'POST', headers: { 'Idempotency-Key': `plan-${plan.id}` },
    body: JSON.stringify({ data: { attributes: {
      name: plan.name, amount: plan.amount_centavos, currency: plan.currency,
      interval: plan.interval, interval_count: 1,
    } } }),
  })).data;
}

async function createCustomer(user, phone) {
  const names = user.full_name.trim().split(/\s+/);
  return (await request('/v1/customers', {
    method: 'POST', headers: { 'Idempotency-Key': `customer-${user.id}` },
    body: JSON.stringify({ data: { attributes: {
      first_name: names[0], last_name: names.slice(1).join(' ') || names[0],
      email: user.email, phone,
    } } }),
  })).data;
}

async function createSubscription(localId, planId, customerId) {
  return (await request('/v1/subscriptions', {
    method: 'POST', headers: { 'Idempotency-Key': `subscription-${localId}` },
    body: JSON.stringify({ data: { attributes: { plan_id: planId, customer_id: customerId } } }),
  })).data;
}

async function getSubscription(id) {
  if (!/^subs_[\w-]+$/.test(id)) throw new Error('Invalid subscription ID');
  return (await request(`/v1/subscriptions/${id}`)).data;
}

async function getPaymentIntent(id) {
  if (!/^pi_[\w-]+$/.test(id)) throw new Error('Invalid payment intent ID');
  return (await request(`/v1/payment_intents/${id}`)).data;
}

async function cancelSubscription(id) {
  if (!/^subs_[\w-]+$/.test(id)) throw new Error('Invalid subscription ID');
  return request(`/v1/subscriptions/${id}`, { method: 'DELETE' });
}

function verifySignature(header, rawBody, secret = env.paymongo.webhookSecret, now = Date.now()) {
  if (!secret || !Buffer.isBuffer(rawBody)) return false;
  const parts = Object.fromEntries(String(header || '').split(',').map((item) => item.trim().split('=')));
  if (!/^\d+$/.test(parts.t || '') || !/^[a-f0-9]{64}$/i.test(parts.te || '') || parts.li) return false;
  if (Math.abs(now / 1000 - Number(parts.t)) > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(parts.t).update('.').update(rawBody).digest();
  return crypto.timingSafeEqual(expected, Buffer.from(parts.te, 'hex'));
}

module.exports = { createCheckout, getCheckout, expireCheckout, createPlan, createCustomer,
  createSubscription, getSubscription, getPaymentIntent, cancelSubscription, testPublicKey,
  assertRecurringConfigured, verifySignature };
