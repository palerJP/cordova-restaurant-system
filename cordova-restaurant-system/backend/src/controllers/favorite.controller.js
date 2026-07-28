const favoriteModel = require('../models/favorite.model');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPageMeta } = require('../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await favoriteModel.listForUser(req.user.id, { limit, offset });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

const add = asyncHandler(async (req, res) => {
  await favoriteModel.add(req.user.id, req.params.restaurantId);
  res.status(201).json({ success: true, message: 'Added to favorites' });
});

const remove = asyncHandler(async (req, res) => {
  await favoriteModel.remove(req.user.id, req.params.restaurantId);
  res.json({ success: true, message: 'Removed from favorites' });
});

module.exports = { list, add, remove };
