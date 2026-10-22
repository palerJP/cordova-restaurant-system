const { query, withTransaction } = require('../config/db');
const paymongo = require('../services/paymongo.service');
const recurring = require('../services/recurringSubscription.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const crypto = require('node:crypto');
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validatePaidCheckout(session, sessionId, order) {
  const details = session?.attributes;
  const paid = details?.payments?.find((payment) => payment?.attributes?.status === 'paid');
  if (!order || session?.id !== sessionId || order.checkout_session_id !== sessionId
    || details?.livemode !== false || details.reference_number !== order.id
    || paid?.attributes?.amount !== order.amount_centavos
    || paid?.attributes?.currency !== order.currency
    || paid?.attributes?.livemode === true || !/^pay_[\w-]+$/.test(paid?.id || '')) {
    throw ApiError.badRequest('Checkout does not match paid order');
  }
  return paid;
}

const packages = asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT id, name, amount_centavos, currency, duration_days FROM promotion_packages WHERE active = TRUE ORDER BY amount_centavos');
  res.json({ success: true, data: rows });
});

const checkout = asyncHandler(async (req, res) => {
  const { promotionId, packageId } = req.body || {};
  if (!UUID_PATTERN.test(promotionId || '') || typeof packageId !== 'string') {
    throw ApiError.badRequest('Promotion and package are required');
  }
  const order = await withTransaction(async (client) => {
    const { rows: promotions } = await client.query(
      `SELECT p.id, p.restaurant_id, p.status, r.owner_id FROM promotions p
       JOIN restaurants r ON r.id = p.restaurant_id WHERE p.id = $1 FOR UPDATE OF p`, [promotionId]
    );
    const promotion = promotions[0];
    if (!promotion) throw ApiError.notFound('Promotion not found');
    if (promotion.owner_id !== req.user.id) throw ApiError.forbidden('You do not own this promotion');
    if (promotion.status === 'active') throw ApiError.conflict('Promotion is already active');
    const { rows: packs } = await client.query('SELECT * FROM promotion_packages WHERE id = $1 AND active = TRUE', [packageId]);
    if (!packs[0]) throw ApiError.badRequest('Package is unavailable');
    const { rows: existing } = await client.query(
      "SELECT * FROM promotion_payment_orders WHERE promotion_id = $1 AND status = 'pending' FOR UPDATE", [promotionId]
    );
    if (existing[0]) {
      if (existing[0].package_id !== packageId) throw ApiError.conflict('This promotion already has a pending order');
      return { ...existing[0], package_name: packs[0].name };
    }
    const { rows } = await client.query(
      `INSERT INTO promotion_payment_orders
       (promotion_id, restaurant_id, user_id, package_id, amount_centavos, currency, duration_days)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [promotionId, promotion.restaurant_id, req.user.id, packageId, packs[0].amount_centavos, packs[0].currency, packs[0].duration_days]
    );
    return { ...rows[0], package_name: packs[0].name };
  });
  if (order.checkout_url) {
    return res.json({ success: true, data: { orderId: order.id, status: order.status, checkoutUrl: order.checkout_url } });
  }
  // PayMongo idempotency keys expire after 24 hours. Do not risk creating a
  // second remote session for an old order whose first response was lost.
  if (Date.now() - new Date(order.created_at).getTime() > 23 * 60 * 60 * 1000) {
    throw ApiError.conflict('Checkout needs reconciliation; contact support');
  }
  const session = await paymongo.createCheckout(order, order.package_name);
  if (!session?.id || session.attributes?.livemode !== false || !/^https:\/\/checkout\.paymongo\.com\//.test(session.attributes?.checkout_url || '')) {
    throw ApiError.internal('Invalid PayMongo test checkout response');
  }
  await query(
    `UPDATE promotion_payment_orders SET checkout_session_id = $2, checkout_url = $3
     WHERE id = $1 AND status = 'pending'`, [order.id, session.id, session.attributes.checkout_url]
  );
  res.json({ success: true, data: { orderId: order.id, status: 'pending', checkoutUrl: session.attributes.checkout_url } });
});

const orderStatus = asyncHandler(async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) throw ApiError.badRequest('Invalid order ID');
  const { rows } = await query(
    `SELECT id, promotion_id, restaurant_id, package_id, amount_centavos, currency, duration_days, status, paid_at, created_at
     FROM promotion_payment_orders WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]
  );
  if (!rows[0]) throw ApiError.notFound('Order not found');
  res.json({ success: true, data: rows[0] });
});

const cancelOrder = asyncHandler(async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) throw ApiError.badRequest('Invalid order ID');
  const { rows } = await query(
    'SELECT id, checkout_session_id, status FROM promotion_payment_orders WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  const order = rows[0];
  if (!order) throw ApiError.notFound('Order not found');
  if (order.status !== 'pending') return res.json({ success: true, data: { status: order.status } });
  if (!order.checkout_session_id) throw ApiError.conflict('Checkout session is still being prepared');
  try {
    await paymongo.expireCheckout(order.checkout_session_id);
  } catch (_error) {
    // The API refuses expiry for paid or processing attempts. Re-read before
    // touching the local order; a redirect alone cannot prove cancellation.
  }
  const session = await paymongo.getCheckout(order.checkout_session_id);
  if (session?.id !== order.checkout_session_id || session.attributes?.livemode !== false) {
    throw ApiError.internal('Could not verify checkout expiry');
  }
  if (session.attributes.status === 'expired') {
    await query("UPDATE promotion_payment_orders SET status = 'expired' WHERE id = $1 AND status = 'pending'", [order.id]);
  }
  const latest = await query('SELECT status FROM promotion_payment_orders WHERE id = $1', [order.id]);
  res.json({ success: true, data: { status: latest.rows[0].status } });
});

const webhook = asyncHandler(async (req, res) => {
  if (!paymongo.verifySignature(req.get('Paymongo-Signature'), req.body)) {
    throw ApiError.unauthorized('Invalid PayMongo signature');
  }
  let payload;
  try { payload = JSON.parse(req.body.toString('utf8')); } catch { throw ApiError.badRequest('Invalid JSON'); }
  const envelope = payload?.data;
  const attributes = envelope?.attributes || envelope; // PayMongo documents both event envelopes.
  // Hosted Checkout v2 documents an envelope without an event ID; use the signed
  // payload hash for deduplication in that form.
  const eventId = envelope?.id || (payload?.event_type === 'send.webhook'
    ? `sha256_${crypto.createHash('sha256').update(req.body).digest('hex')}` : null);
  const type = attributes?.type;
  if (typeof eventId !== 'string' || (!eventId.startsWith('evt_') && !eventId.startsWith('sha256_'))
    || attributes?.livemode !== false) {
    throw ApiError.badRequest('Invalid test event');
  }
  if (['subscription.activated', 'subscription.past_due', 'subscription.unpaid',
    'subscription.updated', 'subscription.invoice.paid', 'subscription.invoice.payment_failed',
    'subscription.cancelled'].includes(type)) {
    await recurring.processWebhook(eventId, type, attributes.data);
    return res.json({ success: true });
  }
  if (type !== 'checkout_session.payment.paid') return res.json({ success: true });
  const notified = attributes?.data;
  const sessionId = notified?.id;
  if (!/^cs_[\w-]+$/.test(sessionId || '')) throw ApiError.badRequest('Invalid checkout event');
  // A fresh server-to-server read protects against a valid but stale or mismatched event body.
  const session = await paymongo.getCheckout(sessionId);
  await withTransaction(async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM promotion_payment_orders WHERE checkout_session_id = $1 FOR UPDATE', [sessionId]
    );
    const order = rows[0];
    if (!order) throw new ApiError(503, 'Order is not ready; retry webhook');
    const { rows: duplicates } = await client.query('SELECT event_id FROM paymongo_webhook_events WHERE event_id = $1', [eventId]);
    if (duplicates.length) return;
    const paid = validatePaidCheckout(session, sessionId, order);
    if (order.status === 'pending') {
      await client.query(
        `UPDATE promotion_payment_orders SET status = 'paid', paid_at = now(), paymongo_payment_id = $2 WHERE id = $1`,
        [order.id, paid.id]
      );
      await client.query(
        `UPDATE promotions SET status = 'active', payment_status = 'verified', payment_method = 'paymongo',
         payment_reference = $2, start_date = CURRENT_DATE,
         end_date = CURRENT_DATE + ($3::integer - 1) WHERE id = $1`,
        [order.promotion_id, paid.id, order.duration_days]
      );
    }
    await client.query('INSERT INTO paymongo_webhook_events (event_id, event_type) VALUES ($1,$2)', [eventId, type]);
  });
  res.json({ success: true });
});

module.exports = { packages, checkout, orderStatus, cancelOrder, webhook, validatePaidCheckout };
