const userModel = require('../models/user.model');
const uploadService = require('../services/upload.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { parsePagination, buildPageMeta } = require('../utils/pagination');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  const { password_hash, ...safeUser } = user;
  res.json({ success: true, data: { user: safeUser } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  let avatarUrl;
  if (req.file) {
    const processed = await uploadService.processImage(req.file, { maxWidth: 400 });
    avatarUrl = uploadService.publicUrlFor(processed);
  }
  const user = await userModel.updateProfile(req.user.id, { fullName, phone, avatarUrl });
  res.json({ success: true, message: 'Profile updated', data: { user } });
});

const getPreferences = asyncHandler(async (req, res) => {
  const prefs = await userModel.getPreferences(req.user.id);
  res.json({ success: true, data: { preferences: prefs } });
});

const updatePreferences = asyncHandler(async (req, res) => {
  const prefs = await userModel.upsertPreferences(req.user.id, req.body);
  res.json({ success: true, message: 'Preferences saved', data: { preferences: prefs } });
});

/** Admin: list/search all users */
const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await userModel.list({
    role: req.query.role,
    search: req.query.search,
    limit,
    offset,
  });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

/** Admin: activate/deactivate a user account */
const setUserActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await userModel.setActive(req.params.id, !!isActive);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}`, data: { user } });
});

module.exports = { getProfile, updateProfile, getPreferences, updatePreferences, listUsers, setUserActive };
