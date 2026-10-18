const router = require('express').Router();
const { pipeline } = require('node:stream/promises');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const { openPublicImage } = require('../services/upload.service');

// Only public photo folders are exposed; business permits keep their admin route.
router.get('/:directory/:filename', asyncHandler(async (req, res, next) => {
  if (!env.isProduction) return next();
  const { stream, contentType } = await openPublicImage(req.params.directory, req.params.filename);
  res.set({
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  await pipeline(stream, res);
}));

module.exports = router;
