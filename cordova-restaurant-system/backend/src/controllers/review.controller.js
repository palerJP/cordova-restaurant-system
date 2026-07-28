const reviewModel = require('../models/review.model');
const restaurantModel = require('../models/restaurant.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { parsePagination, buildPageMeta } = require('../utils/pagination');
const xss = require('xss');

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

  const review = await reviewModel.create({
    restaurantId: req.params.restaurantId,
    userId: req.user.id,
    rating: req.body.rating,
    comment: req.body.comment ? xss(req.body.comment) : null,
  });
  res.status(201).json({ success: true, message: 'Review submitted', data: { review } });
});

const update = asyncHandler(async (req, res) => {
  const review = await reviewModel.update(req.params.id, req.user.id, {
    rating: req.body.rating,
    comment: req.body.comment ? xss(req.body.comment) : undefined,
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

/** POST /api/reviews/:id/like — toggle a "helpful" like on a review */
const toggleLike = asyncHandler(async (req, res) => {
  const review = await reviewModel.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  const liked = await reviewModel.toggleLike(req.params.id, req.user.id);
  res.json({ success: true, data: { liked } });
});

module.exports = { listForRestaurant, create, update, remove, reply, moderate, listFlagged, toggleLike };
