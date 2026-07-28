/**
 * AI Recommendation Engine
 * ------------------------
 * Per the project proposal, this is a LIGHTWEIGHT, EXPLAINABLE engine —
 * rule-based hard filtering followed by weighted scoring — not a ML model.
 * This keeps it deterministic, fast, and tunable by non-technical admins
 * via the `recommendation_weights` table ("Update AI Model" use case).
 *
 * Pipeline:
 *   1. HARD FILTERS (rule-based) — eliminate restaurants that flatly don't
 *      satisfy non-negotiable constraints (dietary restriction not offered,
 *      required service type not offered, outside max distance).
 *   2. WEIGHTED SCORING — remaining candidates are scored 0-100 on five
 *      factors, combined using admin-configurable weights.
 *   3. RANK & RETURN — sorted descending by final score.
 */
const restaurantModel = require('../models/restaurant.model');
const weightsModel = require('../models/recommendationWeights.model');
const operatingHoursModel = require('../models/operatingHours.model');
const analyticsModel = require('../models/analytics.model');

const PRICE_ORDER = ['budget', 'moderate', 'expensive', 'premium'];

const DEFAULT_WEIGHTS = {
  cuisine_weight: 0.3,
  budget_weight: 0.25,
  proximity_weight: 0.2,
  dietary_weight: 0.15,
  rating_weight: 0.1,
};

/** ---- Individual scoring factors (each returns 0-100) ---- */

function scoreCuisineMatch(restaurant, preferredCuisines) {
  if (!preferredCuisines || preferredCuisines.length === 0) return 60; // neutral if no preference given
  const restaurantCuisines = restaurant.cuisines || [];
  const matches = restaurantCuisines.filter((c) => preferredCuisines.includes(c)).length;
  if (matches === 0) return 0;
  // Reward matching more of the user's preferred cuisines, capped at 100
  return Math.min(100, (matches / preferredCuisines.length) * 100);
}

function scoreBudgetFit(restaurant, budgetRange) {
  if (!budgetRange) return 60;
  const userIdx = PRICE_ORDER.indexOf(budgetRange);
  const restaurantIdx = PRICE_ORDER.indexOf(restaurant.price_range);
  if (userIdx === -1 || restaurantIdx === -1) return 50;
  const diff = Math.abs(userIdx - restaurantIdx);
  // Exact match = 100, each price tier away costs 30 points
  return Math.max(0, 100 - diff * 30);
}

function scoreProximity(restaurant, maxDistanceKm) {
  if (restaurant.distance_km == null) return 50; // no location provided, neutral
  const cap = maxDistanceKm || 5;
  if (restaurant.distance_km >= cap) return 0;
  // Linear decay: 0km => 100, cap km => 0
  return Math.max(0, 100 - (restaurant.distance_km / cap) * 100);
}

function scoreDietaryMatch(restaurant, dietaryRestrictions) {
  if (!dietaryRestrictions || dietaryRestrictions.length === 0) return 100;
  const offered = restaurant.dietary_options || [];
  const satisfied = dietaryRestrictions.filter((d) => offered.includes(d)).length;
  return (satisfied / dietaryRestrictions.length) * 100;
}

function scoreRating(restaurant) {
  // avg_rating is 0-5 -> normalize to 0-100
  return (Number(restaurant.avg_rating) || 0) * 20;
}

/** ---- Hard filters (rule-based elimination) ---- */

function passesHardFilters(restaurant, params) {
  const { dietaryRestrictions = [], requiredServices = [], maxDistanceKm } = params;

  // Must offer ALL non-negotiable dietary requirements (e.g. user is vegan)
  if (dietaryRestrictions.length) {
    const offered = restaurant.dietary_options || [];
    const meetsAll = dietaryRestrictions.every((d) => offered.includes(d));
    if (!meetsAll) return false;
  }

  // Must offer at least one required service type (dine-in/takeout/delivery)
  if (requiredServices.length) {
    const offers = restaurant.services_offered || [];
    const meetsAny = requiredServices.some((s) => offers.includes(s));
    if (!meetsAny) return false;
  }

  // Hard distance cutoff, if the user supplied a location
  if (maxDistanceKm != null && restaurant.distance_km != null && restaurant.distance_km > maxDistanceKm) {
    return false;
  }

  return true;
}

/**
 * Main entry point: given user constraints/preferences, return a ranked
 * list of restaurants with per-factor score breakdowns (for transparency —
 * "why was this recommended?").
 */
async function getRecommendations(params) {
  const {
    userLat,
    userLng,
    preferredCuisines = [],
    budgetRange,
    dietaryRestrictions = [],
    requiredServices = [],
    maxDistanceKm = 5,
    onlyOpenNow = false,
    limit = 10,
  } = params;

  const activeWeights = (await weightsModel.getActive()) || DEFAULT_WEIGHTS;
  const weights = {
    cuisine: Number(activeWeights.cuisine_weight),
    budget: Number(activeWeights.budget_weight),
    proximity: Number(activeWeights.proximity_weight),
    dietary: Number(activeWeights.dietary_weight),
    rating: Number(activeWeights.rating_weight),
  };

  const candidates = await restaurantModel.findAllForRecommendation({ userLat, userLng });

  // Step 1: hard filters
  let filtered = candidates.filter((r) =>
    passesHardFilters(r, { dietaryRestrictions, requiredServices, maxDistanceKm: userLat != null ? maxDistanceKm : null })
  );

  // Optional "open now" filter — checked per-restaurant against operating_hours
  if (onlyOpenNow) {
    const now = new Date();
    const openChecks = await Promise.all(filtered.map((r) => operatingHoursModel.isOpenAt(r.id, now)));
    filtered = filtered.filter((_, idx) => openChecks[idx]);
  }

  // Step 2: weighted scoring
  const scored = filtered.map((restaurant) => {
    const factors = {
      cuisine: scoreCuisineMatch(restaurant, preferredCuisines),
      budget: scoreBudgetFit(restaurant, budgetRange),
      proximity: scoreProximity(restaurant, maxDistanceKm),
      dietary: scoreDietaryMatch(restaurant, dietaryRestrictions),
      rating: scoreRating(restaurant),
    };

    const finalScore =
      factors.cuisine * weights.cuisine +
      factors.budget * weights.budget +
      factors.proximity * weights.proximity +
      factors.dietary * weights.dietary +
      factors.rating * weights.rating;

    return {
      restaurant,
      score: Math.round(finalScore * 100) / 100,
      scoreBreakdown: {
        cuisineMatch: Math.round(factors.cuisine),
        budgetFit: Math.round(factors.budget),
        proximity: Math.round(factors.proximity),
        dietaryMatch: Math.round(factors.dietary),
        rating: Math.round(factors.rating),
      },
      reason: buildReasonText(restaurant, factors, { preferredCuisines, budgetRange, dietaryRestrictions }),
    };
  });

  // Step 3: rank
  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, limit);

  return {
    results,
    weightsUsed: weights,
    totalCandidatesConsidered: candidates.length,
    totalAfterFilters: filtered.length,
  };
}

/**
 * Wraps getRecommendations with logging for analytics
 * ("recommendation frequency", "peak search times", "cuisine demand").
 */
async function getRecommendationsAndLog(params, { userId, sessionId }) {
  const output = await getRecommendations(params);

  await analyticsModel.logRecommendationQuery({
    userId,
    sessionId,
    queryParams: {
      cuisines: params.preferredCuisines || [],
      budgetRange: params.budgetRange || null,
      dietaryRestrictions: params.dietaryRestrictions || [],
      requiredServices: params.requiredServices || [],
      maxDistanceKm: params.maxDistanceKm,
      onlyOpenNow: !!params.onlyOpenNow,
    },
    resultIds: output.results.map((r) => r.restaurant.id),
    topResultId: output.results[0]?.restaurant.id || null,
  });

  return output;
}

/**
 * Builds a short, human-readable explanation of why a restaurant was
 * recommended, based on which scoring factors actually contributed —
 * grounded in real data (matched cuisine names, actual distance, etc.)
 * rather than a generic template.
 */
function buildReasonText(restaurant, factors, { preferredCuisines, budgetRange, dietaryRestrictions }) {
  const reasons = [];

  if (preferredCuisines?.length && factors.cuisine >= 50) {
    const matched = (restaurant.cuisines || []).filter((c) => preferredCuisines.includes(c));
    if (matched.length) reasons.push(`serves ${matched.join(' and ')}`);
  }
  if (dietaryRestrictions?.length && factors.dietary >= 99) {
    reasons.push(`meets your ${dietaryRestrictions.join('/')} needs`);
  }
  if (restaurant.distance_km != null && factors.proximity >= 60) {
    reasons.push(`only ${restaurant.distance_km.toFixed(1)} km away`);
  }
  if (budgetRange && factors.budget >= 90) {
    reasons.push(`fits your budget`);
  }
  if (factors.rating >= 80) {
    reasons.push(`highly rated (${Number(restaurant.avg_rating).toFixed(1)}★)`);
  }

  if (reasons.length === 0) return 'A solid overall match based on your preferences.';
  if (reasons.length === 1) return `Recommended because it ${reasons[0]}.`;
  return `Recommended because it ${reasons.slice(0, -1).join(', ')} and ${reasons[reasons.length - 1]}.`;
}

module.exports = {
  getRecommendations,
  getRecommendationsAndLog,
  // exported for unit testing individual scoring factors in isolation
  _internal: { scoreCuisineMatch, scoreBudgetFit, scoreProximity, scoreDietaryMatch, scoreRating, passesHardFilters },
};
