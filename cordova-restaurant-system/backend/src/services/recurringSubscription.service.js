const { query, withTransaction } = require('../config/db');
const paymongo = require('./paymongo.service');
const ApiError = require('../utils/apiError');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OPEN = ['creating', 'incomplete', 'active', 'past_due', 'unpaid'];

function testResource(resource, prefix) {
  if (!resource?.id?.startsWith(prefix) || resource.attributes?.livemode !== false) {
    throw ApiError.internal('PayMongo did not return a test resource');
  }
  return resource;
}

function checkSubscription(resource, local) {
  testResource(resource, 'subs_');
  const attributes = resource.attributes;
  const invoice = attributes.latest_invoice;
  if ((attributes.plan?.id || attributes.plan_id) !== local.paymongo_plan_id
    || attributes.customer_id !== local.paymongo_customer_id
    || !invoice || invoice.currency !== local.currency
    || invoice.amount !== local.amount_centavos) {
    throw ApiError.badRequest('Subscription does not match the local plan or customer');
  }
  return attributes;
}

function verifiedStatus(state, current, failedInvoice = false) {
  const latest = state.latest_invoice;
  if (state.status !== 'active') return state.status;
  if (failedInvoice) return 'past_due';
  if (current.status === 'active') return 'active';
  const paid = latest.status === 'paid' && latest.payment_intent?.status === 'succeeded';
  if (!paid) return ['past_due', 'unpaid'].includes(current.status) ? current.status : 'incomplete';
  if (current.status === 'incomplete' && latest.id !== current.first_invoice_id) return 'incomplete';
  return 'active';
}

async function listPlans() {
  const { rows } = await query(
    'SELECT id,name,tier,interval,amount_centavos,currency FROM subscription_plans WHERE active = TRUE ORDER BY amount_centavos'
  );
  return rows;
}

async function start(userId, restaurantId, planId, phone) {
  const publicKey = paymongo.assertRecurringConfigured();
  if (!UUID.test(restaurantId || '') || typeof planId !== 'string' || !/^\+?\d{10,15}$/.test(phone || '')) {
    throw ApiError.badRequest('Restaurant, plan, and a valid phone number are required');
  }
  const local = await withTransaction(async (client) => {
    const { rows: restaurants } = await client.query('SELECT id,owner_id FROM restaurants WHERE id = $1 FOR UPDATE', [restaurantId]);
    if (!restaurants[0]) throw ApiError.notFound('Restaurant not found');
    if (restaurants[0].owner_id !== userId) throw ApiError.forbidden('You do not own this restaurant');
    const { rows: plans } = await client.query('SELECT * FROM subscription_plans WHERE id = $1 AND active = TRUE', [planId]);
    if (!plans[0]) throw ApiError.badRequest('Subscription plan is unavailable');
    const { rows: existing } = await client.query(
      "SELECT * FROM recurring_subscriptions WHERE restaurant_id = $1 AND status = ANY($2::text[]) FOR UPDATE",
      [restaurantId, OPEN]
    );
    if (existing[0]) {
      if (existing[0].plan_id !== planId) throw ApiError.conflict('Another recurring subscription is already open');
      if (existing[0].status === 'active') throw ApiError.conflict('Subscription is already active');
      return existing[0];
    }
    const { rows } = await client.query(
      `INSERT INTO recurring_subscriptions (restaurant_id,user_id,plan_id,amount_centavos,currency)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [restaurantId, userId, planId, plans[0].amount_centavos, plans[0].currency]
    );
    return rows[0];
  });
  if (!local.paymongo_subscription_id && Date.now() - new Date(local.created_at).getTime() > 23 * 3600 * 1000) {
    throw ApiError.conflict('Subscription setup needs reconciliation; contact support');
  }
  if (local.paymongo_subscription_id) {
    const latest = await reconcile(local.id);
    if (['cancelled', 'incomplete_cancelled'].includes(latest.status)) {
      return start(userId, restaurantId, planId, phone);
    }
    if (latest.status === 'active') throw ApiError.conflict('Subscription is already active');
  }
  const provisioned = await withTransaction(async (client) => {
    const { rows: currentRows } = await client.query('SELECT * FROM recurring_subscriptions WHERE id = $1 FOR UPDATE', [local.id]);
    const current = currentRows[0];
    if (current.status === 'active') throw ApiError.conflict('Subscription is already active');
    const { rows: planRows } = await client.query('SELECT * FROM subscription_plans WHERE id = $1 FOR UPDATE', [current.plan_id]);
    const plan = planRows[0];
    const { rows: userRows } = await client.query('SELECT id,email,full_name FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const user = userRows[0];
    let remotePlanId = plan.paymongo_plan_id;
    if (!remotePlanId) {
      const remotePlan = testResource(await paymongo.createPlan(plan), 'plan_');
      if (remotePlan.attributes.amount !== plan.amount_centavos || remotePlan.attributes.currency !== plan.currency) {
        throw ApiError.internal('PayMongo plan amount mismatch');
      }
      remotePlanId = remotePlan.id;
      await client.query('UPDATE subscription_plans SET paymongo_plan_id = $2 WHERE id = $1', [plan.id, remotePlanId]);
    }
    const { rows: customers } = await client.query('SELECT * FROM paymongo_customers WHERE user_id = $1', [userId]);
    let customerId = customers[0]?.paymongo_customer_id;
    if (!customerId) {
      const customer = testResource(await paymongo.createCustomer(user, phone), 'cus_');
      customerId = customer.id;
      await client.query('INSERT INTO paymongo_customers (user_id,paymongo_customer_id) VALUES ($1,$2)', [userId, customerId]);
    }
    let remoteId = current.paymongo_subscription_id;
    if (!remoteId) {
      const created = testResource(await paymongo.createSubscription(current.id, remotePlanId, customerId), 'subs_');
      remoteId = created.id;
    }
    const remote = await paymongo.getSubscription(remoteId);
    const matched = checkSubscription(remote, { ...current, paymongo_plan_id: remotePlanId, paymongo_customer_id: customerId });
    const intentId = matched.latest_invoice?.payment_intent?.id;
    if (!/^pi_[\w-]+$/.test(intentId || '')) throw ApiError.internal('First invoice has no Payment Intent');
    const { rows: updated } = await client.query(
      `UPDATE recurring_subscriptions SET status = 'incomplete', paymongo_plan_id = $2,
       paymongo_customer_id = $3, paymongo_subscription_id = $4,
       first_invoice_id = COALESCE(first_invoice_id,$5), first_payment_intent_id = COALESCE(first_payment_intent_id,$6),
       updated_at = now() WHERE id = $1 RETURNING *`,
      [current.id, remotePlanId, customerId, remoteId, matched.latest_invoice.id, intentId]
    );
    return updated[0];
  });
  const intent = testResource(await paymongo.getPaymentIntent(provisioned.first_payment_intent_id), 'pi_');
  if (intent.attributes.amount !== provisioned.amount_centavos || intent.attributes.currency !== provisioned.currency
    || !intent.attributes.client_key) throw ApiError.internal('First payment intent does not match subscription');
  const { rows: billingUsers } = await query('SELECT email,full_name FROM users WHERE id = $1', [userId]);
  return { id: provisioned.id, status: provisioned.status, paymentIntentId: intent.id,
    clientKey: intent.attributes.client_key, publicKey, amountCentavos: provisioned.amount_centavos,
    currency: provisioned.currency, billingName: billingUsers[0].full_name,
    billingEmail: billingUsers[0].email, billingPhone: phone };
}

async function reconcile(localId, { eventId, eventType, invoiceId } = {}) {
  const { rows: found } = await query('SELECT * FROM recurring_subscriptions WHERE id = $1', [localId]);
  const local = found[0];
  if (!local) throw ApiError.notFound('Subscription not found');
  if (!local.paymongo_subscription_id) return local;
  const remote = await paymongo.getSubscription(local.paymongo_subscription_id);
  const state = checkSubscription(remote, local);
  const latest = state.latest_invoice;
  const failedInvoice = eventType === 'subscription.invoice.payment_failed'
    && invoiceId === latest.id && latest.status !== 'paid';
  return withTransaction(async (client) => {
    const { rows: locked } = await client.query('SELECT * FROM recurring_subscriptions WHERE id = $1 FOR UPDATE', [localId]);
    const current = locked[0];
    if (eventId) {
      const { rows: duplicate } = await client.query('SELECT 1 FROM paymongo_webhook_events WHERE event_id = $1', [eventId]);
      if (duplicate.length) return current;
    }
    const status = verifiedStatus(state, current, failedInvoice);
    if (!['incomplete','active','past_due','unpaid','cancelled','incomplete_cancelled'].includes(status)) {
      throw ApiError.badRequest('Unsupported subscription state');
    }
    const { rows: updated } = await client.query(
      `UPDATE recurring_subscriptions SET status = $2, next_billing_at = $3, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [localId, status, state.next_billing_schedule || null]
    );
    if (status === 'active') {
      await client.query(
        `UPDATE restaurants SET subscription_tier = $2, subscription_expires_at = COALESCE($3::date + INTERVAL '1 day', now() + INTERVAL '32 days'),
         paymongo_recurring_subscription_id = $4 WHERE id = $1`,
        [current.restaurant_id, (await client.query('SELECT tier FROM subscription_plans WHERE id = $1', [current.plan_id])).rows[0].tier,
          state.next_billing_schedule || null, localId]
      );
    } else if (status !== 'incomplete') {
      await client.query(
        `UPDATE restaurants SET subscription_tier = 'none', subscription_expires_at = NULL,
         paymongo_recurring_subscription_id = NULL WHERE id = $1 AND paymongo_recurring_subscription_id = $2`,
        [current.restaurant_id, localId]
      );
    }
    if (eventId) await client.query('INSERT INTO paymongo_webhook_events (event_id,event_type) VALUES ($1,$2)', [eventId, eventType]);
    return updated[0];
  });
}

async function processWebhook(eventId, type, resource) {
  const subscriptionId = type.startsWith('subscription.invoice.')
    ? resource?.attributes?.resource_id : resource?.id;
  if (!/^subs_[\w-]+$/.test(subscriptionId || '')) throw ApiError.badRequest('Invalid subscription event');
  const { rows } = await query('SELECT id FROM recurring_subscriptions WHERE paymongo_subscription_id = $1', [subscriptionId]);
  if (!rows[0]) throw ApiError.notFound('Subscription event is not linked locally');
  return reconcile(rows[0].id, { eventId, eventType: type, invoiceId: resource?.id });
}

async function statusForOwner(userId, id) {
  if (!UUID.test(id || '')) throw ApiError.badRequest('Invalid subscription ID');
  const { rows } = await query('SELECT * FROM recurring_subscriptions WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!rows[0]) throw ApiError.notFound('Subscription not found');
  const state = await reconcile(id);
  return { id: state.id, restaurantId: state.restaurant_id, planId: state.plan_id,
    status: state.status, amountCentavos: state.amount_centavos, currency: state.currency,
    nextBillingAt: state.next_billing_at };
}

async function currentForOwner(userId, restaurantId) {
  if (!UUID.test(restaurantId || '')) throw ApiError.badRequest('Invalid restaurant ID');
  const { rows: owned } = await query('SELECT id FROM restaurants WHERE id = $1 AND owner_id = $2', [restaurantId, userId]);
  if (!owned[0]) throw ApiError.notFound('Restaurant not found');
  const { rows } = await query(`SELECT id FROM recurring_subscriptions WHERE restaurant_id = $1
    ORDER BY created_at DESC LIMIT 1`, [restaurantId]);
  return rows[0] ? statusForOwner(userId, rows[0].id) : null;
}

async function cancelForOwner(userId, id) {
  if (!UUID.test(id || '')) throw ApiError.badRequest('Invalid subscription ID');
  const { rows } = await query('SELECT * FROM recurring_subscriptions WHERE id = $1 AND user_id = $2', [id, userId]);
  if (!rows[0]) throw ApiError.notFound('Subscription not found');
  if (!rows[0].paymongo_subscription_id) throw ApiError.conflict('Subscription is not ready to cancel');
  if (['cancelled','incomplete_cancelled'].includes(rows[0].status)) return statusForOwner(userId, id);
  await paymongo.cancelSubscription(rows[0].paymongo_subscription_id);
  return statusForOwner(userId, id);
}

module.exports = { listPlans, start, reconcile, processWebhook, statusForOwner, currentForOwner, cancelForOwner, checkSubscription, verifiedStatus };
