const recommendationService = require('../services/recommendation.service');
const weightsModel = require('../models/recommendationWeights.model');
const analyticsModel = require('../models/analytics.model');
const userModel = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPageMeta } = require('../utils/pagination');

/**
 * POST /api/recommendations
 * Accepts either explicit constraints in the body, or falls back to the
 * logged-in user's saved preferences for any field not supplied.
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const body = req.body || {};
  let preferences = {};

  if (req.user) {
    preferences = (await userModel.getPreferences(req.user.id)) || {};
  }

  const params = {
    userLat: body.lat ?? preferences.home_latitude,
    userLng: body.lng ?? preferences.home_longitude,
    preferredCuisines: body.preferredCuisines ?? preferences.preferred_cuisines ?? [],
    budgetRange: body.budgetRange ?? preferences.budget_range,
    dietaryRestrictions: body.dietaryRestrictions ?? preferences.dietary_restrictions ?? [],
    requiredServices: body.requiredServices ?? preferences.preferred_services ?? [],
    maxDistanceKm: body.maxDistanceKm ?? preferences.max_distance_km ?? 5,
    onlyOpenNow: body.onlyOpenNow ?? false,
    limit: body.limit ?? 10,
  };

  const output = await recommendationService.getRecommendationsAndLog(params, {
    userId: req.user?.id,
    sessionId: req.headers['x-session-id'],
  });

  res.json({
    success: true,
    data: output.results,
    meta: {
      totalCandidatesConsidered: output.totalCandidatesConsidered,
      totalAfterFilters: output.totalAfterFilters,
      weightsUsed: output.weightsUsed,
    },
  });
});

/** GET /api/recommendations/weights — current AI model config (admin view) */
const getWeights = asyncHandler(async (req, res) => {
  const weights = await weightsModel.getActive();
  res.json({ success: true, data: weights });
});

/** PATCH /api/recommendations/weights — admin "Update AI Model" use case */
const updateWeights = asyncHandler(async (req, res) => {
  const updated = await weightsModel.setActive(req.body, req.user.id);
  res.json({ success: true, message: 'Recommendation model weights updated', data: updated });
});

/** GET /api/recommendations/history — the logged-in user's past AI search queries */
const getHistory = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await analyticsModel.getHistoryForUser(req.user.id, { limit, offset });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

module.exports = { getRecommendations, getWeights, updateWeights, getHistory };
