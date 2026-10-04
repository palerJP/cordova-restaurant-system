const recommendationService = require('../services/recommendation.service');
const weightsModel = require('../models/recommendationWeights.model');
const analyticsModel = require('../models/analytics.model');
const userModel = require('../models/user.model');
const cuisineModel = require('../models/cuisine.model');
const recommendationFeedbackModel = require('../models/recommendationFeedback.model');
const recommendationTrainingService = require('../services/recommendationTraining.service');
const aiPreferenceInterpreter = require('../services/aiPreferenceInterpreter');
const openaiRecommendationService = require('../services/openaiRecommendation.service');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPageMeta } = require('../utils/pagination');
const logger = require('../utils/logger');

/**
 * POST /api/recommendations
 * Accepts either explicit constraints in the body, or falls back to the
 * logged-in user's saved preferences for any field not supplied.
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const localFilters = aiPreferenceInterpreter.interpretQuery(body.query);
  let preferences = {};

  if (req.user) {
    preferences = (await userModel.getPreferences(req.user.id)) || {};
  }

  let aiFilters = localFilters;
  let externalAiUsed = false;
  if (body.query && openaiRecommendationService.isEnabled()) {
    try {
      const availableCuisines = (await cuisineModel.listAll()).map((cuisine) => cuisine.name);
      const interpreted = await openaiRecommendationService.interpretQuery(body.query, availableCuisines);
      if (interpreted) {
        aiFilters = interpreted;
        externalAiUsed = true;
      }
    } catch (error) {
      openaiRecommendationService.logProviderFailure('preference analysis', error);
    }
  }

  const mergeUnique = (...groups) => [...new Set(groups.flatMap((group) => Array.isArray(group) ? group : []))];
  const params = {
    userLat: body.lat ?? preferences.home_latitude,
    userLng: body.lng ?? preferences.home_longitude,
    preferredCuisines: mergeUnique(
      body.preferredCuisines ?? preferences.preferred_cuisines ?? [],
      aiFilters.preferredCuisines
    ),
    filterCuisines: aiFilters.filterCuisines,
    filterServices: aiFilters.filterServices,
    budgetRange: aiFilters.budgetRange ?? body.budgetRange ?? preferences.budget_range,
    dietaryRestrictions: mergeUnique(
      body.dietaryRestrictions ?? preferences.dietary_restrictions ?? [],
      aiFilters.dietaryRestrictions
    ),
    requiredServices: mergeUnique(
      body.requiredServices ?? preferences.preferred_services ?? [],
      aiFilters.requiredServices
    ),
    maxDistanceKm: aiFilters.maxDistanceKm ?? body.maxDistanceKm ?? preferences.max_distance_km ?? 5,
    onlyOpenNow: aiFilters.onlyOpenNow || body.onlyOpenNow || false,
    limit: body.limit ?? 10,
  };

  const output = await recommendationService.getRecommendationsAndLog(params, {
    userId: req.user?.id,
    sessionId: req.headers['x-session-id'],
  });

  const hasPreferenceInput = Boolean(
    body.query ||
    params.preferredCuisines.length ||
    params.dietaryRestrictions.length ||
    params.requiredServices.length ||
    params.budgetRange
  );
  let suggestions = [];
  if (hasPreferenceInput && output.results.length && openaiRecommendationService.isEnabled()) {
    try {
      suggestions = await openaiRecommendationService.generateSuggestions({
        query: body.query,
        preferences: {
          cuisines: params.preferredCuisines,
          dietaryRestrictions: params.dietaryRestrictions,
          services: params.requiredServices,
          budgetRange: params.budgetRange || null,
          maxDistanceKm: params.maxDistanceKm,
          onlyOpenNow: params.onlyOpenNow,
        },
        candidates: output.results,
      });
      externalAiUsed = true;
    } catch (error) {
      openaiRecommendationService.logProviderFailure('restaurant suggestions', error);
    }
  }

  const suggestionsById = new Map(suggestions.map((item) => [item.restaurantId, item.reason]));
  const results = output.results.map((result) => {
    const aiReason = suggestionsById.get(String(result.restaurant.id));
    return aiReason
      ? { ...result, reason: aiReason, aiSuggested: true }
      : result;
  });

  res.json({
    success: true,
    data: results,
    meta: {
      totalCandidatesConsidered: output.totalCandidatesConsidered,
      totalAfterFilters: output.totalAfterFilters,
      weightsUsed: output.weightsUsed,
      personalization: output.personalization,
      aiProvider: externalAiUsed ? 'openai' : 'local',
      aiSuggestionCount: suggestions.length,
      aiFilters: body.query
        ? {
            summary: aiFilters.summary,
            applied: aiFilters.summary.length > 0,
            filters: {
              preferredCuisines: aiFilters.preferredCuisines,
              budgetRange: aiFilters.budgetRange,
              dietaryRestrictions: aiFilters.dietaryRestrictions,
              requiredServices: aiFilters.requiredServices,
              maxDistanceKm: aiFilters.maxDistanceKm,
            },
          }
        : null,
    },
  });
});

const saveFeedback = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const preferenceSnapshot = {
    preferredCuisines: body.preferredCuisines || [],
    budgetRange: body.budgetRange || null,
    dietaryRestrictions: body.dietaryRestrictions || [],
    requiredServices: body.requiredServices || [],
    maxDistanceKm: body.maxDistanceKm ?? 5,
    userLat: body.lat ?? null,
    userLng: body.lng ?? null,
  };

  const feedback = await recommendationFeedbackModel.save({
    userId: req.user.id,
    restaurantId: body.restaurantId,
    sentiment: body.sentiment,
    preferenceSnapshot,
  });

  res.json({ success: true, message: 'Your feedback was saved for personalized recommendations.', data: feedback });
});

/** GET /api/recommendations/weights — current AI model config (admin view) */
const getWeights = asyncHandler(async (req, res) => {
  const weights = await weightsModel.getActive();
  res.json({ success: true, data: weights });
});

/** PATCH /api/recommendations/weights — admin "Update AI Model" use case */
const updateWeights = asyncHandler(async (req, res) => {
  const updated = await weightsModel.setActive(req.body, req.user.id);
  let training;
  try {
    training = await recommendationTrainingService.trainModel(req.user.id);
  } catch (error) {
    logger.warn('Scoring weights saved, but global recommendation model training failed', {
      error: error.message,
    });
    training = { trained: false, reason: 'training_failed' };
  }
  res.json({
    success: true,
    message: 'Recommendation model weights updated',
    data: updated,
    meta: { training },
  });
});

/** GET /api/recommendations/training — admin global model status */
const getTrainingStatus = asyncHandler(async (req, res) => {
  const status = await recommendationTrainingService.getStatus();
  res.json({ success: true, data: status });
});

/** POST /api/recommendations/training — manually retrain the global scorer */
const trainModel = asyncHandler(async (req, res) => {
  const result = await recommendationTrainingService.trainModel(req.user.id);
  res.json({
    success: true,
    message: result.trained ? 'Global recommendation model trained successfully' : 'Not enough feedback to train the global model',
    data: result,
  });
});

/** GET /api/recommendations/history — the logged-in user's past AI search queries */
const getHistory = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, totalCount } = await analyticsModel.getHistoryForUser(req.user.id, { limit, offset });
  res.json({ success: true, data: rows, meta: buildPageMeta({ page, limit, totalCount }) });
});

/** DELETE /api/recommendations/history — clear all recommendation search history */
const clearHistory = asyncHandler(async (req, res) => {
  await analyticsModel.clearSearchHistoryForUser(req.user.id);
  res.json({ success: true, message: 'Search history cleared' });
});

/** DELETE /api/recommendations/history/:id — delete a specific search history entry */
const deleteHistoryItem = asyncHandler(async (req, res) => {
  await analyticsModel.deleteSearchHistoryItem(req.user.id, req.params.id);
  res.json({ success: true, message: 'Search history entry removed' });
});

module.exports = {
  getRecommendations,
  saveFeedback,
  getWeights,
  updateWeights,
  getTrainingStatus,
  trainModel,
  getHistory,
  clearHistory,
  deleteHistoryItem,
};
