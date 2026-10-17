const rateLimit = require('express-rate-limit');
const asyncHandler = require('../utils/asyncHandler');
const { lookupAddress } = require('../services/addressLookup.service');

const limiter = rateLimit({
  windowMs: 60 * 1000, max: 15,
  keyGenerator: (req) => req.user.id,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Please wait a minute before looking up more addresses.' },
});

const search = asyncHandler(async (req, res) => {
  const results = await lookupAddress(req.body.address, req.body.barangay ?? '');
  res.set('Cache-Control', 'private, no-store');
  res.json({ success: true, data: { results } });
});

module.exports = { limiter, search };
