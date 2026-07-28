const menuModel = require('../models/menu.model');
const restaurantModel = require('../models/restaurant.model');
const uploadService = require('../services/upload.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

async function assertOwnership(restaurantId, userId, userRole) {
  const restaurant = await restaurantModel.findById(restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  if (restaurant.owner_id !== userId && userRole !== 'admin') {
    throw ApiError.forbidden('You do not manage this restaurant');
  }
  return restaurant;
}

const listMenu = asyncHandler(async (req, res) => {
  const [categories, items] = await Promise.all([
    menuModel.listCategories(req.params.restaurantId),
    menuModel.listItems(req.params.restaurantId),
  ]);
  res.json({ success: true, data: { categories, items } });
});

const createCategory = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);
  const category = await menuModel.createCategory(req.params.restaurantId, req.body);
  res.status(201).json({ success: true, data: { category } });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);
  await menuModel.deleteCategory(req.params.categoryId, req.params.restaurantId);
  res.json({ success: true, message: 'Category deleted' });
});

const createItem = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);

  let imageUrl;
  if (req.file) {
    const processed = await uploadService.processImage(req.file, { maxWidth: 800 });
    imageUrl = uploadService.publicUrlFor(processed);
  }

  const item = await menuModel.createItem(req.params.restaurantId, { ...req.body, imageUrl });
  res.status(201).json({ success: true, message: 'Menu item added', data: { item } });
});

const updateItem = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);

  let imageUrl;
  if (req.file) {
    const processed = await uploadService.processImage(req.file, { maxWidth: 800 });
    imageUrl = uploadService.publicUrlFor(processed);
  }

  const item = await menuModel.updateItem(req.params.itemId, req.params.restaurantId, { ...req.body, imageUrl });
  if (!item) throw ApiError.notFound('Menu item not found');
  res.json({ success: true, message: 'Menu item updated', data: { item } });
});

const deleteItem = asyncHandler(async (req, res) => {
  await assertOwnership(req.params.restaurantId, req.user.id, req.user.role);
  await menuModel.deleteItem(req.params.itemId, req.params.restaurantId);
  res.json({ success: true, message: 'Menu item deleted' });
});

module.exports = { listMenu, createCategory, deleteCategory, createItem, updateItem, deleteItem };
