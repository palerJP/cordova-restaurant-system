const { query, withTransaction } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const evidence = require('../middleware/claimEvidence');
const path = require('node:path');

const OPEN = ['pending', 'info_requested'];
function uuid(value) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || '')) throw ApiError.badRequest('Invalid record ID');
  return value;
}
function text(value, label, min, max) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) throw ApiError.badRequest(`${label} must be between ${min} and ${max} characters`);
  return value.trim();
}
const verifiedApplicant = asyncHandler(async (req, res, next) => {
  const { rows } = await query('SELECT email_verified FROM users WHERE id=$1', [req.user.id]);
  if (!rows[0]?.email_verified) throw ApiError.forbidden('Verify your email before submitting an ownership application');
  next();
});
async function record(client, claim, actor, action, message) {
  await client.query('INSERT INTO business_claim_events(claim_id,actor_id,action,message) VALUES($1,$2,$3,$4)', [claim.id, actor, action, message]);
  await client.query("INSERT INTO notifications(user_id,type,title,body) VALUES($1,'system',$2,$3)", [claim.applicant_id, 'Business claim update', message]);
  await client.query("INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,metadata) VALUES($1,$2,'business_claim',$3,$4)", [actor, `claim.${action}`, claim.id, JSON.stringify({ restaurantId: claim.restaurant_id, message })]);
}
const eligibility = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT id,name,slug,ownership_claimed FROM restaurants WHERE id=$1 AND is_active=TRUE AND status=\'verified\'', [uuid(req.params.id)]);
  if (!rows[0]) throw ApiError.notFound('This establishment is unavailable for ownership applications');
  res.json({ success: true, data: rows[0] });
});
const create = asyncHandler(async (req, res) => {
  const restaurantId = uuid(req.params.id);
  const values = [text(req.body.applicantName, 'Full name', 2, 150), text(req.body.relationship, 'Relationship', 2, 100), text(req.body.phone, 'Contact number', 5, 30), text(req.body.explanation, 'Ownership explanation', 20, 5000)];
  if (req.body.confirmOwnership !== 'true') throw ApiError.badRequest('Confirm that your ownership evidence is truthful');
  let filename;
  try {
    filename = await evidence.saveEvidence(req.file);
    const claim = await withTransaction(async (client) => {
      const { rows } = await client.query('SELECT * FROM restaurants WHERE id=$1 FOR UPDATE', [restaurantId]);
      const restaurant = rows[0];
      if (!restaurant || !restaurant.is_active || restaurant.status !== 'verified') throw ApiError.notFound('Establishment is unavailable');
      if (restaurant.owner_id === req.user.id) throw ApiError.conflict('You already manage this establishment');
      if (restaurant.ownership_claimed && req.body.isDispute !== 'true') throw ApiError.conflict('This business already has an owner. Submit an ownership dispute for admin review.');
      const open = await client.query('SELECT id FROM business_claims WHERE restaurant_id=$1 AND applicant_id=$2 AND status=ANY($3)', [restaurantId, req.user.id, OPEN]);
      if (open.rows.length) throw ApiError.conflict('You already have an open application for this business');
      const inserted = await client.query(`INSERT INTO business_claims(restaurant_id,applicant_id,expected_owner_id,applicant_name,relationship,phone,explanation,is_dispute)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [restaurantId, req.user.id, restaurant.owner_id, ...values, restaurant.ownership_claimed]);
      const result = inserted.rows[0];
      await client.query('INSERT INTO business_claim_documents(claim_id,filename) VALUES($1,$2)', [result.id, filename]);
      await record(client, result, req.user.id, 'submitted', `Your ownership application for ${restaurant.name} is pending admin review.`);
      await client.query("INSERT INTO notifications(user_id,type,title,body) SELECT id,'system','Ownership application received',$1 FROM users WHERE role='admin' AND is_active=TRUE", [`An ownership application for ${restaurant.name} is waiting in Business Verification.`]);
      if (result.is_dispute) await client.query("INSERT INTO notifications(user_id,type,title,body) VALUES($1,'system','Ownership dispute received',$2)", [restaurant.owner_id, `An ownership dispute for ${restaurant.name} has been submitted. Contact support if you need to provide evidence. Your access remains active during review.`]);
      return result;
    });
    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    await evidence.removeEvidence(filename);
    if (error.code === '23505') throw ApiError.conflict('An open application already exists');
    throw error;
  }
});
const listMine = asyncHandler(async (req, res) => {
  const { rows } = await query(`SELECT c.*,r.name AS restaurant_name,r.slug AS restaurant_slug
    FROM business_claims c JOIN restaurants r ON r.id=c.restaurant_id WHERE c.applicant_id=$1 ORDER BY c.created_at DESC`, [req.user.id]);
  res.json({ success: true, data: rows });
});
const listAdmin = asyncHandler(async (req, res) => {
  const status = req.query.status || 'pending';
  if (!['all', ...OPEN, 'approved', 'rejected', 'withdrawn'].includes(status)) throw ApiError.badRequest('Invalid claim status');
  const { rows } = await query(`SELECT c.*,r.name AS restaurant_name,r.slug AS restaurant_slug,u.email AS applicant_email,
    (SELECT COUNT(*)::int FROM business_claims other WHERE other.restaurant_id=c.restaurant_id AND other.status IN ('pending','info_requested')) AS competing_claims
    FROM business_claims c JOIN restaurants r ON r.id=c.restaurant_id JOIN users u ON u.id=c.applicant_id
    WHERE ($1='all' OR c.status=$1) ORDER BY c.created_at LIMIT 200`, [status]);
  res.json({ success: true, data: rows });
});
async function accessibleClaim(id, user) {
  const { rows } = await query('SELECT * FROM business_claims WHERE id=$1', [uuid(id)]);
  const claim = rows[0];
  if (!claim || (user.role !== 'admin' && claim.applicant_id !== user.id)) throw ApiError.notFound('Application not found');
  return claim;
}
const detail = asyncHandler(async (req, res) => {
  const claim = await accessibleClaim(req.params.id, req.user);
  const documents = await query('SELECT id,created_at FROM business_claim_documents WHERE claim_id=$1 ORDER BY created_at', [claim.id]);
  const events = await query('SELECT id,action,message,created_at FROM business_claim_events WHERE claim_id=$1 ORDER BY created_at', [claim.id]);
  res.json({ success: true, data: { claim, documents: documents.rows, events: events.rows } });
});
const download = asyncHandler(async (req, res) => {
  const claim = await accessibleClaim(req.params.id, req.user);
  const { rows } = await query('SELECT filename FROM business_claim_documents WHERE id=$1 AND claim_id=$2', [uuid(req.params.documentId), claim.id]);
  if (!rows[0]) throw ApiError.notFound('Document not found');
  const filename = rows[0].filename;
  if (!/^[0-9a-f-]{36}\.(pdf|webp)$/.test(filename)) throw ApiError.notFound();
  res.set({ 'Cache-Control': 'private, no-store', 'Content-Type': 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
  res.download(path.join(evidence.directory(), filename), `ownership-evidence.${filename.split('.').pop()}`);
});
const respond = asyncHandler(async (req, res) => {
  const id = uuid(req.params.id);
  const message = text(req.body.message, 'Additional information', 10, 5000);
  let filename;
  try {
    if (req.file) filename = await evidence.saveEvidence(req.file);
    await withTransaction(async (client) => {
      const { rows } = await client.query('SELECT * FROM business_claims WHERE id=$1 FOR UPDATE', [id]);
      const claim = rows[0];
      if (!claim || claim.applicant_id !== req.user.id) throw ApiError.notFound();
      if (claim.status !== 'info_requested') throw ApiError.conflict('This application is not awaiting additional information');
      if (filename) await client.query('INSERT INTO business_claim_documents(claim_id,filename) VALUES($1,$2)', [id, filename]);
      await client.query("UPDATE business_claims SET status='pending',updated_at=now() WHERE id=$1", [id]);
      await record(client, claim, req.user.id, 'resubmitted', message);
      await client.query("INSERT INTO notifications(user_id,type,title,body) SELECT id,'system','Claim information received',$1 FROM users WHERE role='admin' AND is_active=TRUE", [`Additional information is ready for ownership application ${id}.`]);
    });
    res.json({ success: true });
  } catch (error) { await evidence.removeEvidence(filename); throw error; }
});
const withdraw = asyncHandler(async (req, res) => {
  await withTransaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM business_claims WHERE id=$1 FOR UPDATE', [uuid(req.params.id)]);
    const claim = rows[0];
    if (!claim || claim.applicant_id !== req.user.id) throw ApiError.notFound();
    if (!OPEN.includes(claim.status)) throw ApiError.conflict('Only open applications can be withdrawn');
    await client.query("UPDATE business_claims SET status='withdrawn',updated_at=now() WHERE id=$1", [claim.id]);
    await record(client, claim, req.user.id, 'withdrawn', 'You withdrew this ownership application.');
  });
  res.json({ success: true });
});
const review = asyncHandler(async (req, res) => {
  const id = uuid(req.params.id), action = req.body.action;
  if (!['approved', 'rejected', 'info_requested'].includes(action)) throw ApiError.badRequest('Invalid review action');
  const note = text(req.body.note, 'Review reason', 10, 2000);
  // Always lock the restaurant before claims so competing approvals serialize.
  await withTransaction(async (client) => {
    const existing = await client.query('SELECT restaurant_id FROM business_claims WHERE id=$1', [id]);
    if (!existing.rows[0]) throw ApiError.notFound();
    const restaurants = await client.query('SELECT * FROM restaurants WHERE id=$1 FOR UPDATE', [existing.rows[0].restaurant_id]);
    const restaurant = restaurants.rows[0];
    const { rows } = await client.query('SELECT * FROM business_claims WHERE id=$1 FOR UPDATE', [id]);
    const claim = rows[0];
    if (!OPEN.includes(claim.status)) throw ApiError.conflict('This application has already been decided');
    if (claim.applicant_id === req.user.id) throw ApiError.forbidden('You cannot review your own ownership application');
    if (action === 'approved') {
      if (claim.status !== 'pending') throw ApiError.conflict('Wait for the requested information before approval');
      if (!restaurant.is_active || restaurant.status !== 'verified') throw ApiError.conflict('Only active verified establishments can be claimed');
      if (restaurant.owner_id !== claim.expected_owner_id) throw ApiError.conflict('Ownership changed since submission. A new application is required.');
      if (claim.is_dispute && req.body.confirmTransfer !== true) throw ApiError.badRequest('Explicitly confirm transferring this business from its current owner');
      const applicant = await client.query('SELECT * FROM users WHERE id=$1 FOR UPDATE', [claim.applicant_id]);
      if (!applicant.rows[0]?.is_active || !applicant.rows[0].email_verified || !['customer','owner'].includes(applicant.rows[0].role)) throw ApiError.conflict('Applicant must be an active, verified customer or owner');
      await client.query("UPDATE users SET role='owner',updated_at=now() WHERE id=$1", [claim.applicant_id]);
      await client.query('UPDATE restaurants SET owner_id=$2,ownership_claimed=TRUE,updated_at=now() WHERE id=$1', [restaurant.id, claim.applicant_id]);
      const others = await client.query("UPDATE business_claims SET status='rejected',review_note=$2,reviewed_by=$3,updated_at=now() WHERE restaurant_id=$1 AND id<>$4 AND status=ANY($5) RETURNING *", [restaurant.id, 'Another ownership application was approved. You may submit an ownership dispute if this is incorrect.', req.user.id, id, OPEN]);
      for (const other of others.rows) await record(client, other, req.user.id, 'rejected', 'Another ownership application was approved. You may submit an ownership dispute if this is incorrect.');
      if (claim.is_dispute) await client.query("INSERT INTO notifications(user_id,type,title,body) VALUES($1,'system','Business ownership changed',$2)", [restaurant.owner_id, `An admin approved an ownership transfer for ${restaurant.name}. Reason: ${note}. Contact support to dispute this decision.`]);
    }
    await client.query('UPDATE business_claims SET status=$2,review_note=$3,reviewed_by=$4,updated_at=now() WHERE id=$1', [id, action, note, req.user.id]);
    await record(client, claim, req.user.id, action, note);
  });
  res.json({ success: true });
});
const notifications = asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT id,title,body,is_read,created_at FROM notifications WHERE user_id=$1 AND type='system' ORDER BY created_at DESC LIMIT 100", [req.user.id]);
  res.json({ success: true, data: rows });
});
const readNotification = asyncHandler(async (req, res) => {
  const result = await query('UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2 RETURNING id', [uuid(req.params.id), req.user.id]);
  if (!result.rows[0]) throw ApiError.notFound();
  res.json({ success: true });
});
const support = asyncHandler(async (req, res) => {
  const message = text(req.body.message, 'Support message', 10, 2000);
  const claim = await accessibleClaim(req.params.id, req.user);
  await withTransaction(async (client) => {
    await record(client, claim, req.user.id, 'support_requested', message);
    await client.query("INSERT INTO notifications(user_id,type,title,body) SELECT id,'system','Ownership support request',$1 FROM users WHERE role='admin' AND is_active=TRUE", [`Support requested for ownership application ${claim.id}: ${message}`]);
  });
  res.json({ success: true });
});
const messageApplicant = asyncHandler(async (req, res) => {
  const message = text(req.body.message, 'Message to applicant', 10, 2000);
  const claim = await accessibleClaim(req.params.id, req.user);
  await withTransaction(client => record(client, claim, req.user.id, 'support_response', message));
  res.json({ success: true });
});
module.exports = { verifiedApplicant, eligibility, create, listMine, listAdmin, detail, download, respond, withdraw, review, notifications, readNotification, support, messageApplicant };
