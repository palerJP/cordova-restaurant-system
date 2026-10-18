const router = require('express').Router();
const crypto = require('node:crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { query } = require('../config/db');
const marketing = require('../services/marketing.service');

// An operations credential authorizes only this fixed, consent-filtered campaign.
router.post('/send', asyncHandler(async (req, res) => {
  const expected = process.env.MARKETING_SEND_TOKEN;
  const supplied = req.get('X-Campaign-Token') || '';
  if (!expected || supplied.length !== expected.length
      || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) throw ApiError.unauthorized('Campaign authorization required');
  res.json({ success: true, data: await marketing.runCampaign({ send: req.body?.send === true }) });
}));

router.get('/unsubscribe', asyncHandler(async (req, res) => {
  marketing.readUnsubscribeToken(req.query.token);
  res.set('Cache-Control','no-store');
  res.type('html').send('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CordovaEats email preferences</title><body style="font-family:Arial;padding:32px;max-width:520px;margin:auto"><h1>Email preferences</h1><p>Unsubscribe from CordovaEats marketing updates? Account verification and password reset emails will still be available.</p><form method="post"><button type="submit" style="padding:12px 20px">Unsubscribe</button></form></body></html>');
}));

router.post('/unsubscribe', asyncHandler(async (req, res) => {
  const id = marketing.readUnsubscribeToken(req.query.token || req.body?.token);
  await query('UPDATE users SET accepts_marketing=false WHERE id=$1', [id]);
  res.set('Cache-Control','no-store');
  res.type('html').send('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title><body style="font-family:Arial;padding:32px"><h1>You are unsubscribed</h1><p>You will no longer receive CordovaEats marketing emails.</p></body></html>');
}));

module.exports = router;
