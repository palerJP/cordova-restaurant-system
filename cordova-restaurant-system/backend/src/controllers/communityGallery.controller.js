const fs = require('node:fs/promises');
const sharp = require('sharp');
const { query } = require('../config/db');
const images = require('../models/restaurantImage.model');
const uploads = require('../services/upload.service');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const requireActive = asyncHandler(async (req, res, next) => {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(req.params.restaurantId) || (req.params.imageId && !uuid.test(req.params.imageId))) throw ApiError.badRequest('Invalid gallery identifier');
  const { rows } = await query("SELECT id, owner_id FROM restaurants WHERE id=$1 AND is_active=TRUE AND status='verified'", [req.params.restaurantId]);
  if (!rows[0]) throw ApiError.notFound('Active establishment not found');
  req.galleryRestaurant = rows[0];
  next();
});

const post = asyncHandler(async (req, res) => {
  let processed = req.file;
  let published = false;
  let uploadedUrl;
  try {
    if (!req.file) throw ApiError.badRequest('Choose a photo to post');
    const caption = typeof req.body.caption === 'string' ? req.body.caption.trim() : '';
    if (caption.length > 280) throw ApiError.badRequest('Caption must be 280 characters or fewer');
    // Validate actual pixels before the shared optimization/storage flow.
    try { await sharp(req.file.buffer || req.file.path, { limitInputPixels: 40000000 }).stats(); }
    catch { throw ApiError.badRequest('This photo could not be read. Choose a valid JPEG, PNG or WebP image'); }
    processed = await uploads.processImage(req.file, { maxWidth: 1400 });
    const url = await uploads.publicUrlFor(processed);
    uploadedUrl = url;
    const image = await images.add(req.params.restaurantId, url, { uploadedBy: req.user.id, caption });
    published = true;
    res.status(201).json({ success: true, message: 'Your photo is now visible in the gallery', data: { image: { ...image, uploaded_by: req.user.id, uploader_name: req.user.fullName || 'Community member' } } });
  } finally {
    if (!published && uploadedUrl) await uploads.removeGalleryPhoto(uploadedUrl).catch(() => {});
    if (!published && processed?.path) await fs.unlink(processed.path).catch(() => {});
    if (req.file?.path && req.file.path !== processed?.path) await fs.unlink(req.file.path).catch(() => {});
  }
});

const remove = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT id, uploaded_by, image_url FROM restaurant_images WHERE id=$1 AND restaurant_id=$2', [req.params.imageId, req.params.restaurantId]);
  const image = rows[0];
  if (!image) throw ApiError.notFound('Photo not found');
  if (image.uploaded_by !== req.user.id && req.galleryRestaurant.owner_id !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only remove photos you posted');
  }
  await images.remove(image.id, req.params.restaurantId);
  await uploads.removeGalleryPhoto(image.image_url).catch(() => {});
  res.json({ success: true, message: 'Photo removed from the gallery' });
});

module.exports = { requireActive, post, remove };
