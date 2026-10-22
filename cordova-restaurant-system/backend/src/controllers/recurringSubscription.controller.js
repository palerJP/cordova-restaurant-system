const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/recurringSubscription.service');
const paymongo = require('../services/paymongo.service');

const plans = asyncHandler(async (_req, res) => {
  let available = true;
  try { paymongo.assertRecurringConfigured(); } catch { available = false; }
  res.json({ success: true, data: { plans: await service.listPlans(), available } });
});

const start = asyncHandler(async (req, res) => {
  const { restaurantId, planId, phone } = req.body || {};
  res.json({ success: true, data: await service.start(req.user.id, restaurantId, planId, phone) });
});

const status = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.statusForOwner(req.user.id, req.params.id) });
});

const cancel = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.cancelForOwner(req.user.id, req.params.id) });
});

const current = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.currentForOwner(req.user.id, req.params.restaurantId) });
});

module.exports = { plans, start, status, cancel, current };
