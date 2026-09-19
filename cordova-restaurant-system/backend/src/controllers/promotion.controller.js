const promotionModel = require('../models/promotion.model');
const restaurantModel = require('../models/restaurant.model');
const uploadService = require('../services/upload.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { parsePagination, buildPageMeta } = require('../utils/pagination');

async function assertOwnership(restaurantId, userId, userRole) {
  const restaurant = await restaurantModel.findById(restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  if (restaurant.owner_id !== userId && userRole !== 'admin') {
    throw ApiError.forbidden('You do not manage this restaurant');
  }
}

/** GET /api/promotions — public feed of currently active promos */
const listActive = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await promotionModel.listActive({ limit, offset });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

const listForRestaurant = asyncHandler(async (req, res) => {
  const promotions = await promotionModel.listForRestaurant(req.params.restaurantId);
  res.json({ success: true, data: promotions });
});

const create = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);

  let imageUrl;
  if (req.file) {
    const processed = await uploadService.processImage(req.file, { maxWidth: 1000 });
    imageUrl = uploadService.publicUrlFor(processed);
  }

  const { title, description, discountLabel, startDate, endDate, paymentMethod, paymentReference, referenceNo } = req.body;

  const promotion = await promotionModel.create(req.params.restaurantId, {
    title,
    description,
    discountLabel,
    startDate,
    endDate,
    imageUrl,
    paymentMethod: paymentMethod || 'gcash',
    paymentReference: paymentReference || referenceNo || null,
    paymentStatus: 'pending_verification',
    status: 'pending_verification',
  });
  res.status(201).json({ success: true, message: 'Promotion created and pending verification', data: { promotion } });
});

const update = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);

  let updateData = { ...req.body };
  if (req.file) {
    const processed = await uploadService.processImage(req.file, { maxWidth: 1000 });
    updateData.imageUrl = uploadService.publicUrlFor(processed);
  }

  const promotion = await promotionModel.update(req.params.id, req.params.restaurantId, updateData);
  if (!promotion) throw ApiError.notFound('Promotion not found');
  res.json({ success: true, message: 'Promotion updated', data: { promotion } });
});

const remove = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);
  await promotionModel.remove(req.params.id, req.params.restaurantId);
  res.json({ success: true, message: 'Promotion deleted' });
});

/** Admin-specific endpoints */
const adminList = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await promotionModel.listAllAdmin({
    status: req.query.status,
    search: req.query.search,
    limit,
    offset,
  });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

const adminUpdateStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const updatePayload = {};
  if (status) updatePayload.status = status;
  if (paymentStatus) updatePayload.paymentStatus = paymentStatus;

  if (Object.keys(updatePayload).length === 0) {
    throw ApiError.badRequest('Status or paymentStatus is required');
  }

  const promo = await promotionModel.adminUpdate(req.params.id, updatePayload);
  if (!promo) throw ApiError.notFound('Promotion not found');
  res.json({ success: true, message: 'Promotion updated', data: { promotion: promo } });
});

const adminDelete = asyncHandler(async (req, res) => {
  await promotionModel.adminRemove(req.params.id);
  res.json({ success: true, message: 'Promotion permanently deleted' });
});

const adminListSubscriptionTransactions = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await promotionModel.listSubscriptionTransactions({
    status: req.query.status,
    search: req.query.search,
    limit,
    offset,
  });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

const adminUpdateSubscriptionTransactionStatus = asyncHandler(async (req, res) => {
  const { status, durationDays = 30 } = req.body;
  if (!status) throw ApiError.badRequest('Status is required');
  const tx = await promotionModel.updateSubscriptionTransactionStatus(req.params.id, {
    status,
    durationDays,
    verifiedBy: req.user.id,
  });
  if (!tx) throw ApiError.notFound('Transaction not found');
  res.json({ success: true, message: `Transaction marked as ${status}`, data: { transaction: tx } });
});

const adminDeleteSubscriptionTransaction = asyncHandler(async (req, res) => {
  await promotionModel.deleteSubscriptionTransaction(req.params.id);
  res.json({ success: true, message: 'Subscription record deleted successfully' });
});

module.exports = {
  listActive, listForRestaurant, create, update, remove,
  adminList, adminUpdateStatus, adminDelete,
  adminListSubscriptionTransactions, adminUpdateSubscriptionTransactionStatus, adminDeleteSubscriptionTransaction,
};
