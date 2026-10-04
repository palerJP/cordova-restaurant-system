const asyncHandler = require('../utils/asyncHandler');
const searchModel = require('../models/search.model');
const rankingService = require('../services/rankingService');
const userModel = require('../models/user.model');
const analyticsModel = require('../models/analytics.model');

/**
 * POST /api/search
 * Body: { keyword, cuisine, priceRange, maxDistanceKm, dietaryTags, userLat, userLng, page, limit, applyPreferences, userPreferences }
 */
const searchAndRank = asyncHandler(async (req, res) => {
  const {
    keyword,
    cuisine,
    priceRange,
    maxDistanceKm,
    dietaryTags,
    userLat,
    userLng,
    applyPreferences,
    userPreferences,
  } = req.body || {};

  let prefs = userPreferences || null;
  if (!prefs && req.user && applyPreferences) {
    try {
      prefs = await userModel.getPreferences(req.user.id);
    } catch {
      prefs = null;
    }
  }

  const queryParams = {
    keyword: keyword ? String(keyword).trim() : '',
    cuisine: cuisine ? String(cuisine).trim() : (prefs?.preferred_cuisines?.[0] ? undefined : undefined),
    priceRange: priceRange || (applyPreferences && prefs?.budget_range ? prefs.budget_range : undefined),
    maxDistanceKm: maxDistanceKm != null ? Number(maxDistanceKm) : (applyPreferences && prefs?.max_distance_km ? Number(prefs.max_distance_km) : undefined),
    dietaryTags: Array.isArray(dietaryTags) && dietaryTags.length > 0
      ? dietaryTags
      : (applyPreferences && Array.isArray(prefs?.dietary_restrictions) ? prefs.dietary_restrictions : []),
    preferredCuisines: applyPreferences && Array.isArray(prefs?.preferred_cuisines) ? prefs.preferred_cuisines : undefined,
    userLat: userLat != null ? Number(userLat) : (prefs?.home_latitude != null ? Number(prefs.home_latitude) : undefined),
    userLng: userLng != null ? Number(userLng) : (prefs?.home_longitude != null ? Number(prefs.home_longitude) : undefined),
  };

  // 1. Fetch active candidates
  const candidates = await searchModel.getSearchCandidates();
  const candidateIds = candidates.map((c) => c.id);

  // 2. Fetch menu items
  const menuItemsMap = await searchModel.getMenuItemsForRestaurants(candidateIds);

  // 3. Rank with AI relevance + subscription boost + sponsored slots
  const ranked = rankingService.rankRestaurants(candidates, queryParams, menuItemsMap);

  // 4. Log search query to analytics / search history
  if ((queryParams.keyword || queryParams.cuisine) && ranked.length > 0) {
    analyticsModel.logRecommendationQuery({
      userId: req.user?.id || null,
      queryParams: {
        keyword: queryParams.keyword || undefined,
        cuisines: queryParams.cuisine ? [queryParams.cuisine] : undefined,
        budgetRange: queryParams.priceRange || undefined,
        dietaryRestrictions: queryParams.dietaryTags || undefined,
        maxDistanceKm: queryParams.maxDistanceKm,
      },
      resultIds: ranked.slice(0, 10).map((r) => r.id),
      topResultId: ranked[0]?.id || null,
    }).catch(() => {});
  }

  res.json({
    success: true,
    data: ranked,
    meta: {
      totalCount: ranked.length,
      sponsoredCount: ranked.filter((r) => r.isSponsored).length,
      query: queryParams,
    },
  });
});

module.exports = {
  searchAndRank,
};
