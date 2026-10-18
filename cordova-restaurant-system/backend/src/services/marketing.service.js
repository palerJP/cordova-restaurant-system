const crypto = require('node:crypto');
const { query } = require('../config/db');
const env = require('../config/env');
const { sendEmail } = require('./email.service');
const ApiError = require('../utils/apiError');

const CAMPAIGN_ID = 'reservations-owner-tools-2026-10';
const SUBJECT = 'Reservations and business tools on CordovaEats';

function signature(userId) {
  return crypto.createHmac('sha256', env.jwt.accessSecret).update(`marketing-unsubscribe:${userId}`).digest('base64url');
}

function unsubscribeToken(userId) { return `${userId}.${signature(userId)}`; }

function readUnsubscribeToken(token) {
  const [userId, supplied, extra] = String(token || '').split('.');
  if (extra || !/^[0-9a-f-]{36}$/i.test(userId || '') || !supplied) throw ApiError.badRequest('Invalid unsubscribe link');
  const expected = signature(userId);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
    throw ApiError.badRequest('Invalid unsubscribe link');
  }
  return userId;
}

function campaignEmail(user) {
  const root = env.clientUrl;
  const unsubscribe = `${root}/api/marketing/unsubscribe?token=${unsubscribeToken(user.id)}`;
  const text = `Hello from CordovaEats!\n\nPlan your next meal and manage your business in one place.\n\nReservations: request a table at participating restaurants that have enabled online bookings. Your request is subject to the restaurant's availability and confirmation.\n\nBusiness owner tools: manage your establishment details, menus, opening hours, and reservation requests from your dashboard. Business tools require an approved establishment or ownership claim.\n\nExplore CordovaEats: ${root}\nManage your business: ${root}/dashboard\n\nYou received this update because your account is subscribed to CordovaEats marketing emails.\nUnsubscribe: ${unsubscribe}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#1b241f"><h1 style="color:#145c43">CordovaEats</h1><h2>Plan your next meal. Manage your business.</h2><p>Here are two ways to get more from CordovaEats:</p><h3>Request a reservation</h3><p>Request a table at participating restaurants that have enabled online bookings. Requests depend on availability and the restaurant's confirmation.</p><h3>Tools for business owners</h3><p>Manage your establishment details, menus, opening hours, and reservation requests from your dashboard. An approved establishment or ownership claim is required.</p><p style="margin:28px 0"><a href="${root}" style="background:#145c43;color:white;padding:13px 20px;border-radius:6px;text-decoration:none">Explore CordovaEats</a></p><p><a href="${root}/dashboard">Manage your business</a></p><hr style="border:0;border-top:1px solid #ddd;margin-top:32px"><p style="font-size:12px;color:#666">You received this update because your account is subscribed to CordovaEats marketing emails. <a href="${unsubscribe}">Unsubscribe</a></p></div>`;
  return { to: user.email, subject: SUBJECT, text, html, headers: {
    'List-Unsubscribe': `<${unsubscribe}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  } };
}

async function runCampaign({ send = false } = {}) {
  const { rows } = await query(`SELECT id,email FROM users
    WHERE is_active=true AND email_verified=true AND accepts_marketing=true ORDER BY id`);
  const report = { campaign: CAMPAIGN_ID, eligible: rows.length, sent: 0, skipped: 0, failed: 0, dryRun: !send };
  if (!send) return report;
  for (const user of rows) {
    const claim = await query(`INSERT INTO marketing_deliveries(campaign_id,user_id,status)
      SELECT $1,id,'sending' FROM users WHERE id=$2 AND is_active AND email_verified AND accepts_marketing
      ON CONFLICT(campaign_id,user_id) DO NOTHING RETURNING user_id`, [CAMPAIGN_ID, user.id]);
    if (!claim.rowCount) { report.skipped++; continue; }
    try {
      await sendEmail(campaignEmail(user));
      await query("UPDATE marketing_deliveries SET status='sent',sent_at=NOW() WHERE campaign_id=$1 AND user_id=$2", [CAMPAIGN_ID,user.id]);
      report.sent++;
    } catch (_error) {
      await query("UPDATE marketing_deliveries SET status='failed' WHERE campaign_id=$1 AND user_id=$2", [CAMPAIGN_ID,user.id]);
      report.failed++;
    }
  }
  return report;
}

module.exports = { runCampaign, campaignEmail, unsubscribeToken, readUnsubscribeToken, CAMPAIGN_ID };
