const { query, withTransaction } = require('../config/db');
const ApiError = require('../utils/apiError');
const PRICES = { basic: '₱499 / month', premium: '₱999 / month', featured: '₱1,999 / month' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function validId(id) { if (!UUID.test(id || '')) throw ApiError.badRequest('Invalid identifier'); }
async function restaurant(client, id, actor) {
  validId(id);
  const { rows } = await client.query('SELECT * FROM restaurants WHERE id=$1 FOR UPDATE', [id]);
  if (!rows[0]) throw ApiError.notFound('Restaurant not found');
  if (actor && actor.role !== 'admin' && rows[0].owner_id !== actor.id) throw ApiError.forbidden('You do not own this restaurant');
  return rows[0];
}
async function get(id, actor) {
  validId(id);
  return withTransaction(async client => {
    const r = await restaurant(client,id,actor);
    const {rows}=await client.query('SELECT * FROM subscription_transactions WHERE restaurant_id=$1 ORDER BY created_at DESC,id DESC LIMIT 20',[id]);
    const active=r.subscription_expires_at && new Date(r.subscription_expires_at)>new Date();
    return { current_tier: active ? r.subscription_tier : 'none', subscription_expires_at:r.subscription_expires_at,
      transactions:rows, pending_transaction:rows.find(t=>t.status==='pending_verification')||null };
  });
}
async function submit(id, body, actor) {
  validId(id);
  if (typeof body.subscription_tier !== 'string' || !['none',...Object.keys(PRICES)].includes(body.subscription_tier)) throw ApiError.badRequest('Choose a valid subscription tier');
  const tier=body.subscription_tier;
  if (body.durationDays !== undefined && body.durationDays !== 30) throw ApiError.badRequest('Plans last 30 days');
  if (body.subscription_expires_at !== undefined) throw ApiError.badRequest('Expiry is set when the payment is verified');
  const method=body.payment_method;
  const ref=typeof (body.payment_reference ?? body.referenceNo)==='string' ? (body.payment_reference ?? body.referenceNo).trim().toUpperCase() : '';
  if(tier!=='none' && (!['gcash','maya'].includes(method)||! /^[A-Z0-9 -]{6,100}$/.test(ref))) throw ApiError.badRequest('Choose GCash or Maya and enter a valid 6–100 character payment reference');
  return withTransaction(async client=>{
    if(tier!=='none') await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',['subscription-reference:'+method+':'+ref]);
    const r=await restaurant(client,id,actor);
    if(tier==='none') {
      await client.query("UPDATE subscription_transactions SET status='rejected' WHERE restaurant_id=$1 AND status='pending_verification'",[id]);
      const {rows}=await client.query("UPDATE restaurants SET subscription_tier='none',subscription_expires_at=NULL WHERE id=$1 RETURNING *",[id]);
      return {pending:false,current_tier:'none',restaurant:rows[0]};
    }
    const previous=await client.query('SELECT * FROM subscription_transactions WHERE payment_method=$1 AND upper(trim(payment_reference))=$2 ORDER BY created_at DESC LIMIT 1',[method,ref]);
    if(previous.rows[0]) {
      const t=previous.rows[0];
      if(t.restaurant_id===id && t.tier===tier && t.status==='pending_verification') return {pending:true,transaction:t,current_tier:r.subscription_tier,requested_tier:tier};
      throw ApiError.conflict('This payment reference has already been submitted');
    }
    const pending=await client.query("SELECT id FROM subscription_transactions WHERE restaurant_id=$1 AND status='pending_verification'",[id]);
    if(pending.rows.length) throw ApiError.conflict('A payment is already awaiting verification for this restaurant');
    const {rows}=await client.query("INSERT INTO subscription_transactions(restaurant_id,tier,price,payment_method,payment_reference,status,duration_days) VALUES($1,$2,$3,$4,$5,'pending_verification',30) RETURNING *",[id,tier,PRICES[tier],method,ref]);
    return {pending:true,transaction:rows[0],current_tier:r.subscription_tier,requested_tier:tier};
  });
}
async function change(id,{status,verifiedBy,durationDays=30}) {
  validId(id); validId(verifiedBy);
  if(!['verified','rejected','expired','terminated'].includes(status)) throw ApiError.badRequest('Invalid subscription status');
  if(durationDays!==30) throw ApiError.badRequest('Plans last 30 days');
  return withTransaction(async client=>{
    const found=await client.query('SELECT restaurant_id FROM subscription_transactions WHERE id=$1',[id]);
    if(!found.rows[0]) return null;
    const r=await restaurant(client,found.rows[0].restaurant_id);
    const {rows}=await client.query('SELECT * FROM subscription_transactions WHERE id=$1 FOR UPDATE',[id]);const t=rows[0];
    if(!t)return null;
    const target=status==='terminated'?'expired':status;
    if(t.status===target)return t;
    if(target==='verified'||target==='rejected'){
      if(t.status!=='pending_verification')throw ApiError.conflict('Only pending payments can be verified or rejected');
      if(target==='rejected')return (await client.query("UPDATE subscription_transactions SET status='rejected',verified_by=$2 WHERE id=$1 RETURNING *",[id,verifiedBy])).rows[0];
      const now=Date.now();const start=r.subscription_tier===t.tier?Math.max(now,new Date(r.subscription_expires_at||0).getTime()):now;
      const expires=new Date(start+30*86400000);
      const updated=await client.query("UPDATE subscription_transactions SET status='verified',verified_at=NOW(),verified_by=$2,expires_at=$3,duration_days=30 WHERE id=$1 RETURNING *",[id,verifiedBy,expires]);
      await client.query('UPDATE restaurants SET subscription_tier=$2,subscription_expires_at=$3 WHERE id=$1',[r.id,t.tier,expires]);
      return updated.rows[0];
    }
    if(t.status!=='verified')throw ApiError.conflict('Only verified payments can be terminated');
    await client.query("UPDATE restaurants SET subscription_tier='none',subscription_expires_at=NULL WHERE id=$1 AND subscription_tier::text=$2 AND subscription_expires_at=$3",[r.id,t.tier,t.expires_at]);
    return (await client.query("UPDATE subscription_transactions SET status='expired',expires_at=NOW() WHERE id=$1 RETURNING *",[id])).rows[0];
  });
}
async function remove(id){
  validId(id);
  return withTransaction(async client=>{
    const found=await client.query('SELECT restaurant_id FROM subscription_transactions WHERE id=$1',[id]);
    if(!found.rows[0])throw ApiError.notFound('Transaction not found');
    await restaurant(client,found.rows[0].restaurant_id);
    const {rows}=await client.query('SELECT * FROM subscription_transactions WHERE id=$1 FOR UPDATE',[id]);const t=rows[0];
    if(!t)throw ApiError.notFound('Transaction not found');
    if(t.status==='verified')throw ApiError.conflict('Verified payment records must be terminated before deletion');
    await client.query('DELETE FROM subscription_transactions WHERE id=$1',[id]);
  });
}
module.exports={get,submit,change,remove};
