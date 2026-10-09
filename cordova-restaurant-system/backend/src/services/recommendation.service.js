/**
 * AI Recommendation Engine
 * ------------------------
 * This is a lightweight, explainable hybrid recommender. Hard constraints
 * are always rule-filtered. Users with enough feedback get a personalized
 * ranker; everyone else uses the pooled global model when available, then
 * falls back to admin-tunable preference weights.
 *
 * Pipeline:
 *   1. HARD FILTERS (rule-based) — eliminate restaurants that flatly don't
 *      satisfy non-negotiable constraints (dietary restriction not offered,
 *      required service type not offered, outside max distance).
 *   2. SCORE — use a user's logistic regression after enough personal feedback,
 *      otherwise use the active global model or admin-configured weights.
 *   3. RANK & RETURN — sorted descending by match score.
 */
const restaurantModel = require('../models/restaurant.model');
const weightsModel = require('../models/recommendationWeights.model');
const operatingHoursModel = require('../models/operatingHours.model');
const analyticsModel = require('../models/analytics.model');
const recommendationFeedbackModel = require('../models/recommendationFeedback.model');
const recommendationTrainingModel = require('../models/recommendationTraining.model');
const personalizedRanker = require('./personalizedRanker');
const logger = require('../utils/logger');

let warnedMissingModelVersionsTable = false;

async function getActiveGlobalModel() {
  try {
    return await recommendationTrainingModel.getActiveModel();
  } catch (error) {
    // Keep recommendations available while an existing installation is waiting
    // to apply migration 010. Other database failures should still surface.
    if (error.code === '42P01') {
      if (!warnedMissingModelVersionsTable) {
        logger.warn('Global recommendation model table is missing; apply database migration 010 to enable model training.');
        warnedMissingModelVersionsTable = true;
      }
      return null;
    }
    throw error;
  }
}

const PRICE_ORDER = ['budget', 'moderate', 'expensive', 'premium'];

const DEFAULT_WEIGHTS = {
  cuisine_weight: 0.3,
  budget_weight: 0.25,
  proximity_weight: 0.2,
  dietary_weight: 0.15,
  rating_weight: 0.1,
};

/** ---- Individual scoring factors (each returns 0-100) ---- */

function normalizeDietary(str) {
  return String(str || '').toLowerCase().replace(/[-_\s]/g, '');
}

function satisfiesDietary(userDiet, offeredList) {
  if (!userDiet) return true;
  const normUser = normalizeDietary(userDiet);
  const normOffered = (offeredList || []).map(normalizeDietary);
  if (normOffered.includes(normUser)) return true;
  if (normUser === 'nopork' || normUser === 'porkfree') {
    return normOffered.some((o) => ['nopork', 'porkfree', 'halal', 'vegan', 'vegetarian'].includes(o));
  }
  if (normUser === 'vegetarian') {
    return normOffered.some((o) => ['vegetarian', 'vegan'].includes(o));
  }
  return false;
}

const SERVICE_FILTER_TERMS = {
  'seaside / sunset view': ['seaside', 'seaview', 'sunset', 'waterfront', 'ocean view', 'overwater', 'floating'],
  seaside_view: ['seaside', 'seaview', 'sunset', 'waterfront', 'ocean view', 'overwater', 'floating'],
  'outdoor / al fresco': ['outdoor', 'al fresco', 'alfresco', 'open air'],
  al_fresco: ['outdoor', 'al fresco', 'alfresco', 'open air'],
  'live music': ['live music', 'live band', 'band'],
  live_music: ['live music', 'live band', 'band'],
  'air conditioned': ['air conditioned', 'airconditioned', 'aircon'],
  air_conditioned: ['air conditioned', 'airconditioned', 'aircon'],
  'dine-in': ['dine_in', 'dine in', 'dine-in', 'eat in', 'sit down'],
  dine_in: ['dine_in', 'dine in', 'dine-in', 'eat in', 'sit down'],
  takeout: ['takeout', 'take out', 'take-away', 'takeaway'],
  delivery: ['delivery', 'deliver'],
};

function normalizeService(str) {
  return String(str || '').toLowerCase().replace(/[-_\s/]/g, '');
}

// PostgreSQL returns arrays of the custom service_type enum as array-literal
// strings (for example, "{dine_in,takeout}") rather than JavaScript arrays.
function serviceList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  const text = value.trim();
  if (!text) return [];
  if (text.startsWith('{') && text.endsWith('}')) {
    const entries = text.slice(1, -1);
    return entries ? entries.split(',').map((entry) => entry.trim()).filter(Boolean) : [];
  }
  return [text];
}

function matchesServicePreference(restaurant, preference) {
  const label = String(preference || '').toLowerCase().trim();
  const terms = SERVICE_FILTER_TERMS[label] || [label];
  const structuredServices = [
    ...serviceList(restaurant.services_offered),
    ...serviceList(restaurant.amenities),
  ];
  const descriptiveText = [restaurant.name, restaurant.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return terms.some((term) => {
    const normalizedTerm = normalizeService(term);
    const structuredMatch = structuredServices.some((service) => {
      const normalizedService = normalizeService(service);
      return normalizedService.includes(normalizedTerm) || normalizedTerm.includes(normalizedService);
    });
    return structuredMatch || descriptiveText.includes(term.toLowerCase());
  });
}

function matchesCuisine(restCuisine, userCuisine) {
  if (!restCuisine || !userCuisine) return false;
  const rc = String(restCuisine).toLowerCase().trim();
  const uc = String(userCuisine).toLowerCase().trim();
  if (rc === uc) return true;
  // Word / substring matching
  if (rc.includes(uc) || uc.includes(rc)) return true;
  // Common aliases in Cordova
  if ((uc === 'bbq' || uc === 'grill') && (rc.includes('grill') || rc.includes('bbq'))) return true;
  if ((uc === 'bakasi' || uc === 'shellfish') && (rc.includes('bakasi') || uc.includes('shellfish') || rc.includes('shellfish'))) return true;
  if ((uc === 'local' || uc === 'cebuano') && (rc.includes('cebuano') || rc.includes('local'))) return true;
  if (uc === 'cafe' && (rc.includes('cafe') || rc.includes('coffee'))) return true;
  return false;
}

function scoreCuisineMatch(restaurant, preferredCuisines) {
  if (!preferredCuisines || preferredCuisines.length === 0) return 60; // neutral if no preference given
  const restaurantCuisines = restaurant.cuisines || [];
  const matches = preferredCuisines.filter((userC) =>
    restaurantCuisines.some((restC) => matchesCuisine(restC, userC))
  ).length;
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
  const offered = (restaurant.dietary_options || []).map(normalizeDietary);
  const satisfied = dietaryRestrictions.filter((d) => satisfiesDietary(d, offered)).length;
  return (satisfied / dietaryRestrictions.length) * 100;
}

function scoreServicesMatch(restaurant, requiredServices) {
  if (!requiredServices || requiredServices.length === 0) return 80;
  const matches = requiredServices.filter((service) => matchesServicePreference(restaurant, service)).length;
  return Math.min(100, Math.round((matches / requiredServices.length) * 100));
}

function scoreRating(restaurant) {
  // avg_rating is 0-5 -> normalize to 0-100
  return (Number(restaurant.avg_rating) || 0) * 20;
}

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((value) => value == null || !Number.isFinite(Number(value)))) {
    return null;
  }
  const toRadians = (degrees) => (Number(degrees) * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Shared preference features used both while fitting and ranking candidates. */
function scorePreferenceFeatures(restaurant, preferences) {
  const distance = restaurant.distance_km ?? haversineDistanceKm(
    preferences.userLat,
    preferences.userLng,
    restaurant.latitude,
    restaurant.longitude
  );
  const restaurantWithDistance = { ...restaurant, distance_km: distance };

  return [
    scoreCuisineMatch(restaurantWithDistance, preferences.preferredCuisines || []),
    scoreBudgetFit(restaurantWithDistance, preferences.budgetRange),
    scoreProximity(restaurantWithDistance, preferences.maxDistanceKm),
    scoreDietaryMatch(restaurantWithDistance, preferences.dietaryRestrictions || []),
    scoreServicesMatch(restaurantWithDistance, preferences.requiredServices || []),
    scoreRating(restaurantWithDistance),
  ];
}

/** ---- Hard filters (rule-based elimination) ---- */

function passesHardFilters(restaurant, params) {
  const {
    dietaryRestrictions = [],
    requiredServices = [],
    filterCuisines = [],
    filterServices = [],
    maxDistanceKm,
  } = params;

  // A cuisine named directly in a natural-language request is an AI-applied
  // filter; saved taste preferences remain ranking signals instead.
  if (filterCuisines.length) {
    const restaurantCuisines = restaurant.cuisines || [];
    const matchesRequestedCuisine = filterCuisines.some((requested) =>
      restaurantCuisines.some((cuisine) => matchesCuisine(cuisine, requested))
    );
    if (!matchesRequestedCuisine) return false;
  }

  // Specific services or atmosphere mentioned in a typed request are strict
  // filters. Saved profile preferences remain scoring signals below.
  if (filterServices.some((service) => !matchesServicePreference(restaurant, service))) {
    return false;
  }

  // Must offer ALL non-negotiable dietary requirements (e.g. user is vegan)
  if (dietaryRestrictions.length) {
    const offered = (restaurant.dietary_options || []).map(normalizeDietary);
    const meetsAll = dietaryRestrictions.every((d) => satisfiesDietary(d, offered));
    if (!meetsAll) return false;
  }

  // Must offer at least one required service type if specific core services (dine-in/takeout/delivery) are requested
  if (requiredServices.length) {
    const coreServices = requiredServices
      .map((s) => {
        const lower = String(s).toLowerCase();
        if (lower.includes('dine')) return 'dine_in';
        if (lower.includes('takeout') || lower.includes('take-out')) return 'takeout';
        if (lower.includes('delivery')) return 'delivery';
        return s;
      })
      .filter((s) => ['dine_in', 'takeout', 'delivery'].includes(s));

    if (coreServices.length > 0) {
      const offers = serviceList(restaurant.services_offered).map((s) => String(s).toLowerCase());
      const meetsAny = coreServices.some((s) => offers.includes(s.toLowerCase()));
      if (!meetsAny) return false;
    }
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
async function getRecommendations(params, userId = null) {
  const {
    userLat,
    userLng,
    preferredCuisines = [],
    filterCuisines = [],
    filterServices = [],
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

  const candidates = (await restaurantModel.findAllForRecommendation({ userLat, userLng }))
    .map((restaurant) => ({
      ...restaurant,
      services_offered: serviceList(restaurant.services_offered),
    }));

  const trainingExamples = userId
    ? await recommendationFeedbackModel.getTrainingExamples(userId)
    : [];
  const learned = personalizedRanker.train(trainingExamples, (restaurant, snapshot) =>
    scorePreferenceFeatures(restaurant, {
      preferredCuisines: snapshot.preferredCuisines || [],
      budgetRange: snapshot.budgetRange,
      dietaryRestrictions: snapshot.dietaryRestrictions || [],
      requiredServices: snapshot.requiredServices || [],
      maxDistanceKm: snapshot.maxDistanceKm || 5,
      userLat: snapshot.userLat,
      userLng: snapshot.userLng,
    })
  );
  const globalModelVersion = learned.model ? null : await getActiveGlobalModel();

  // Step 1: hard filters
  let filtered = candidates.filter((r) =>
    passesHardFilters(r, {
      dietaryRestrictions,
      requiredServices,
      filterCuisines,
      filterServices,
      maxDistanceKm: userLat != null && userLng != null ? maxDistanceKm : null,
    })
  );

  // If strict filtering produced no candidates, relax dietary and services hard constraints
  // so the user still receives preference-ranked recommendations rather than an empty state
  if (filtered.length === 0 && candidates.length > 0 && (dietaryRestrictions.length > 0 || requiredServices.length > 0)) {
    filtered = candidates.filter((r) =>
      passesHardFilters(r, {
        dietaryRestrictions: [],
        requiredServices: [],
        filterCuisines,
        filterServices,
        maxDistanceKm: userLat != null && userLng != null ? maxDistanceKm : null,
      })
    );
  }

  // A saved distance can be too small for every restaurant. Keep the user's
  // location and distance in the scoring factors while allowing farther
  // restaurants to appear instead of leaving the recommendations empty.
  if (filtered.length === 0 && candidates.length > 0 && userLat != null && userLng != null) {
    filtered = candidates.filter((r) =>
      passesHardFilters(r, {
        dietaryRestrictions: [],
        requiredServices: [],
        filterCuisines,
        filterServices,
        maxDistanceKm: null,
      })
    );
  }

  // Optional "open now" filter — checked per-restaurant against operating_hours
  if (onlyOpenNow) {
    const now = new Date();
    const openChecks = await Promise.all(filtered.map((r) => operatingHoursModel.isOpenAt(r.id, now)));
    filtered = filtered.filter((_, idx) => openChecks[idx]);
  }

  // Step 2: personalized model scoring or cold-start weighted scoring
  const scored = filtered.map((restaurant) => {
    const [cuisineScore, budgetScore, proximityScore, dietaryScore, servicesScore, ratingScore] =
      scorePreferenceFeatures(restaurant, {
        preferredCuisines,
        budgetRange,
        maxDistanceKm,
        dietaryRestrictions,
        requiredServices,
        userLat,
        userLng,
      });

    const factors = {
      cuisine: cuisineScore,
      budget: budgetScore,
      proximity: proximityScore,
      dietary: dietaryScore,
      rating: ratingScore,
      services: servicesScore,
    };

    let finalScore =
      factors.cuisine * weights.cuisine +
      factors.budget * weights.budget +
      factors.proximity * weights.proximity +
      factors.dietary * weights.dietary +
      factors.rating * weights.rating;

    // Service preferences bonus when user requested specific services
    if (requiredServices && requiredServices.length > 0) {
      const serviceBonus = (factors.services / 100) * 8;
      finalScore = Math.min(100, finalScore + serviceBonus);
    }

    const scoringModel = learned.model || globalModelVersion?.model;
    if (scoringModel) {
      finalScore = personalizedRanker.predict(scoringModel, [
        factors.cuisine,
        factors.budget,
        factors.proximity,
        factors.dietary,
        factors.services,
        factors.rating,
      ]) * 100;
    }

    // Compute structured matched preferences for clean UI badges
    const matchedCuisines = (restaurant.cuisines || []).filter((rc) =>
      (preferredCuisines || []).some((uc) => matchesCuisine(rc, uc))
    );
    const matchedDietary = (restaurant.dietary_options || []).filter((rd) =>
      (dietaryRestrictions || []).some((ud) => satisfiesDietary(ud, [rd]))
    );
    const matchedServices = [
      ...serviceList(restaurant.services_offered),
      ...serviceList(restaurant.amenities),
    ].filter((rs) => {
      const nrs = String(rs).toLowerCase().replace(/[-_\s/]/g, '');
      return (requiredServices || []).some((us) => {
        const nus = String(us).toLowerCase().replace(/[-_\s/]/g, '');
        return nrs.includes(nus) || nus.includes(nrs);
      });
    });
    const budgetFit = budgetRange ? restaurant.price_range === budgetRange : true;
    const isNear = restaurant.distance_km != null && restaurant.distance_km <= (maxDistanceKm || 5);

    const matchedPreferences = {
      cuisines: matchedCuisines,
      dietary: matchedDietary,
      services: matchedServices,
      budgetFit,
      isNear,
    };

    const matchPercentage = learned.model || globalModelVersion?.model
      ? Math.min(99, Math.max(1, Math.round(finalScore)))
      : Math.min(99, Math.max(50, Math.round(finalScore)));

    return {
      restaurant,
      score: Math.round(finalScore * 100) / 100,
      matchPercentage,
      matchedPreferences,
      scoreBreakdown: {
        cuisineMatch: Math.round(factors.cuisine),
        budgetFit: Math.round(factors.budget),
        proximity: Math.round(factors.proximity),
        dietaryMatch: Math.round(factors.dietary),
        rating: Math.round(factors.rating),
        servicesMatch: Math.round(factors.services),
      },
      reason: buildReasonText(restaurant, factors, {
        preferredCuisines,
        budgetRange,
        dietaryRestrictions,
        requiredServices,
        matchedPreferences,
      }),
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
    personalization: {
      mode: learned.model ? 'learned' : globalModelVersion?.model ? 'global_model' : 'preference_match',
      feedbackCount: learned.feedbackCount,
      positiveCount: learned.positiveCount,
      negativeCount: learned.negativeCount,
      minimumFeedback: personalizedRanker.MIN_EXAMPLES,
      globalModelTrainingExamples: globalModelVersion?.training_examples || 0,
      feedbackByRestaurant: Object.fromEntries(
        trainingExamples
          .filter((example) => example.source === 'direct')
          .map((example) => [example.restaurant.id, example.sentiment])
      ),
    },
  };
}

/**
 * Wraps getRecommendations with logging for analytics
 * ("recommendation frequency", "peak search times", "cuisine demand").
 */
async function getRecommendationsAndLog(params, { userId, sessionId }) {
  const output = await getRecommendations(params, userId);

  await analyticsModel.logRecommendationQuery({
    userId,
    sessionId,
    queryParams: {
      keyword: params.keyword || null,
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
function buildReasonText(
  restaurant,
  factors,
  { preferredCuisines, budgetRange, dietaryRestrictions, matchedPreferences }
) {
  const reasons = [];

  if (matchedPreferences?.cuisines?.length) {
    reasons.push(`matches your taste for ${matchedPreferences.cuisines.slice(0, 2).join(' & ')}`);
  } else if (preferredCuisines?.length && factors.cuisine >= 50) {
    const matched = (restaurant.cuisines || []).filter((c) =>
      preferredCuisines.some((uc) => matchesCuisine(c, uc))
    );
    if (matched.length) reasons.push(`serves ${matched.slice(0, 2).join(' and ')}`);
  }

  if (matchedPreferences?.services?.length) {
    reasons.push(`offers ${matchedPreferences.services[0].replace(/_/g, ' ')}`);
  }

  if (dietaryRestrictions?.length && factors.dietary >= 99) {
    reasons.push(`lists ${dietaryRestrictions.join('/')} options`);
  }
  if (restaurant.distance_km != null && factors.proximity >= 60) {
    reasons.push(`only ${restaurant.distance_km.toFixed(1)} km away`);
  }
  if (budgetRange && factors.budget >= 90) {
    reasons.push('fits your budget');
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
  _internal: {
    scoreCuisineMatch,
    scoreBudgetFit,
    scoreProximity,
    scoreDietaryMatch,
    scoreServicesMatch,
    scoreRating,
    scorePreferenceFeatures,
    passesHardFilters,
    serviceList,
  },
};
