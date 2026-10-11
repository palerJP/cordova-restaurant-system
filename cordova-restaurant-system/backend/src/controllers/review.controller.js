const reviewModel = require('../models/review.model');
const restaurantModel = require('../models/restaurant.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { parsePagination, buildPageMeta } = require('../utils/pagination');
const xss = require('xss');

const uploadService = require('../services/upload.service');

const listForRestaurant = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const isModerator = req.user?.role === 'admin';
  const { rows, totalCount } = await reviewModel.listForRestaurant(req.params.restaurantId, {
    limit,
    offset,
    includeModerated: isModerator,
    userId: req.user?.id || null,
  });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

const create = asyncHandler(async (req, res) => {
  const restaurant = await restaurantModel.findById(req.params.restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');

  const existing = await reviewModel.findByUserAndRestaurant(req.user.id, req.params.restaurantId);
  if (existing) throw ApiError.conflict('You already reviewed this restaurant. Edit your existing review instead.');

  const photos = [];
  if (req.files && Array.isArray(req.files)) {
    for (const f of req.files) {
      photos.push(await uploadService.publicUrlFor(await uploadService.processImage(f, { maxWidth: 1400 })));
    }
  } else if (req.file) {
    photos.push(await uploadService.publicUrlFor(await uploadService.processImage(req.file, { maxWidth: 1400 })));
  }

  if (req.body.photos) {
    if (Array.isArray(req.body.photos)) {
      photos.push(...req.body.photos);
    } else if (typeof req.body.photos === 'string') {
      try {
        const parsed = JSON.parse(req.body.photos);
        if (Array.isArray(parsed)) photos.push(...parsed);
        else photos.push(req.body.photos);
      } catch {
        photos.push(req.body.photos);
      }
    }
  }

  const review = await reviewModel.create({
    restaurantId: req.params.restaurantId,
    userId: req.user.id,
    rating: parseInt(req.body.rating, 10),
    comment: req.body.comment ? xss(req.body.comment) : null,
    photos,
    reactions: {},
  });
  res.status(201).json({ success: true, message: 'Review submitted', data: { review } });
});

const update = asyncHandler(async (req, res) => {
  const review = await reviewModel.update(req.params.id, req.user.id, {
    rating: req.body.rating ? parseInt(req.body.rating, 10) : undefined,
    comment: req.body.comment ? xss(req.body.comment) : undefined,
    photos: req.body.photos,
  });
  if (!review) throw ApiError.notFound('Review not found or not yours');
  res.json({ success: true, message: 'Review updated', data: { review } });
});

const remove = asyncHandler(async (req, res) => {
  await reviewModel.remove(req.params.id, req.user.id);
  res.json({ success: true, message: 'Review deleted' });
});

/** Owner responds publicly to a review on their restaurant */
const reply = asyncHandler(async (req, res) => {
  const review = await reviewModel.ownerReply(req.params.id, req.user.id, xss(req.body.reply));
  if (!review) throw ApiError.notFound('Review not found or you do not own this restaurant');
  res.json({ success: true, message: 'Reply posted', data: { review } });
});

/** Admin: flag / remove / restore a review */
const moderate = asyncHandler(async (req, res) => {
  const review = await reviewModel.moderate(req.params.id, {
    status: req.body.status,
    flaggedReason: req.body.flaggedReason,
    moderatorId: req.user.id,
  });
  if (!review) throw ApiError.notFound('Review not found');
  res.json({ success: true, message: `Review marked as ${req.body.status}`, data: { review } });
});

/** Admin: content moderation queue */
const listFlagged = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await reviewModel.listFlagged({ limit, offset });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

/** Admin: list reviews with status filtering */
const listAdminReviews = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await reviewModel.listAdminReviews({
    status: req.query.status || 'reported',
    limit,
    offset,
  });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

/** POST /api/reviews/:id/like — toggle a "helpful" like on a review */
const toggleLike = asyncHandler(async (req, res) => {
  const review = await reviewModel.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  const liked = await reviewModel.toggleLike(req.params.id, req.user.id);
  res.json({ success: true, data: { liked } });
});

/** POST /api/reviews/:id/react — add/increment spatial emoji reaction */
const react = asyncHandler(async (req, res) => {
  const review = await reviewModel.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  const emoji = req.body.emoji || '❤️';
  const reactions = await reviewModel.react(req.params.id, emoji);
  res.json({ success: true, data: { reactions } });
});

const report = asyncHandler(async (req, res) => {
 const result = await reviewModel.report(req.params.id, req.user.id, req.body);
 res.status(201).json({success:true, message:'Report submitted for admin review', data:result});
});

const publicStats = asyncHandler(async (req, res) => {
 const {query}=require('../config/db');
 const {rows}=await query("SELECT r.id,r.slug,COUNT(rv.id)::int AS review_count,COALESCE(ROUND(AVG(rv.rating)::numeric,2),0) AS avg_rating,MAX(rv.updated_at) AS revision FROM restaurants r LEFT JOIN reviews rv ON rv.restaurant_id=r.id AND rv.status='visible' WHERE r.status='verified' AND r.is_active=true GROUP BY r.id ORDER BY r.id");
 res.set('Cache-Control','no-store');
 res.json({success:true,data:rows});
});
module.exports = { publicStats, report, listForRestaurant, create, update, remove, reply, moderate, listFlagged, listAdminReviews, toggleLike, react };
