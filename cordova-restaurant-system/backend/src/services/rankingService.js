/**
 * AI-Style Restaurant & Menu Filtering and Ranking Service
 * with Paid Subscription Boost & Sponsored Slot Allocation
 */

const SUBSCRIPTION_MULTIPLIERS = {
  none: 1.0,
  basic: 1.1,
  premium: 1.3,
  featured: 1.5,
};

const FEATURED_MIN_RELEVANCE_THRESHOLD = 0.3;
const MAX_SPONSORED_SLOTS = 2;

const PRICE_TIERS = {
  budget: { min: 0, max: 250, value: 1 },
  moderate: { min: 250, max: 600, value: 2 },
  expensive: { min: 600, max: 1500, value: 3 },
  premium: { min: 1500, max: 5000, value: 4 },
};

const WEIGHTS = {
  keyword: 0.35,
  priceRange: 0.15,
  distance: 0.20,
  rating: 0.15,
  availability: 0.15,
};

/**
 * Calculates Haversine distance in kilometers between two lat/lng points
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CORDOVA_SYNONYMS = {
  bakasi: ['bakasi', 'eel', 'nilarang', 'linarang', 'reef eel'],
  eel: ['bakasi', 'eel', 'nilarang', 'linarang'],
  nilarang: ['bakasi', 'eel', 'nilarang', 'linarang'],
  seafood: ['seafood', 'fish', 'shrimp', 'squid', 'scallops', 'pompano', 'bangus', 'crab', 'calamares', 'bucket'],
  sunset: ['sunset', 'parola', 'view', 'views', 'ocean', 'waterfront', 'seaview', 'overwater'],
  parola: ['parola', 'lighthouse', 'sunset', 'seaview', 'overwater'],
  bbq: ['bbq', 'barbecue', 'grill', 'grilled', 'charcoal', 'inasal', 'liempo'],
  grill: ['grill', 'grilled', 'bbq', 'barbecue', 'charcoal', 'sinugba'],
  barbecue: ['barbecue', 'bbq', 'grill', 'charcoal'],
  coffee: ['coffee', 'cafe', 'espresso', 'latte', 'macchiato', 'matcha', 'pastry'],
  cafe: ['cafe', 'coffee', 'pastry', 'latte', 'tambayan'],
  romantic: ['romantic', 'date', 'sunset', 'roses', 'cozy'],
  budget: ['budget', 'affordable', 'cheap', 'sulit'],
};

/**
 * Tokenizes and normalizes text for keyword similarity
 */
function tokenize(text) {
  if (!text) return [];
  const stopWords = new Set(['and', 'the', 'in', 'of', 'for', 'a', 'an', 'at', 'to', 'near', 'with']);
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));
}

/**
 * Computes keyword/text match score (0-1) across restaurant info and menu items
 */
function scoreKeywordMatch(restaurant, queryKeyword, menuItems = []) {
  if (!queryKeyword || !queryKeyword.trim()) {
    return 1.0; // Neutral baseline when no keyword search is performed
  }

  const queryTokens = tokenize(queryKeyword);
  if (queryTokens.length === 0) return 1.0;

  // Expand with synonyms
  const expandedTokens = new Set(queryTokens);
  for (const token of queryTokens) {
    if (CORDOVA_SYNONYMS[token]) {
      for (const s of CORDOVA_SYNONYMS[token]) expandedTokens.add(s);
    }
  }

  const restaurantNameTokens = tokenize(restaurant.name);
  const restaurantDescTokens = tokenize(restaurant.description);
  const cuisineTokens = (restaurant.cuisines || []).flatMap((c) => tokenize(c));
  const dietaryTokens = (restaurant.dietary_options || []).flatMap((d) => tokenize(d));

  let maxItemScore = 0;
  const matchedItems = [];

  for (const item of menuItems) {
    const itemNameTokens = tokenize(item.name);
    const itemDescTokens = tokenize(item.description);
    const itemTags = (item.dietary_tags || item.tags || []).flatMap((t) => tokenize(t));
    const allItemTokens = new Set([...itemNameTokens, ...itemDescTokens, ...itemTags]);

    let itemMatchCount = 0;
    for (const token of queryTokens) {
      if (
        allItemTokens.has(token) ||
        Array.from(allItemTokens).some((t) => t.includes(token) || token.includes(t)) ||
        Array.from(expandedTokens).some((et) => allItemTokens.has(et))
      ) {
        itemMatchCount++;
      }
    }

    if (itemMatchCount > 0) {
      const itemScore = itemMatchCount / queryTokens.length;
      if (itemScore > maxItemScore) maxItemScore = itemScore;
      matchedItems.push({
        ...item,
        itemMatchScore: itemScore,
      });
    }
  }

  const allRestTokens = new Set([
    ...restaurantNameTokens,
    ...restaurantDescTokens,
    ...cuisineTokens,
    ...dietaryTokens,
  ]);

  let restMatchCount = 0;
  for (const token of queryTokens) {
    if (
      allRestTokens.has(token) ||
      Array.from(allRestTokens).some((t) => t.includes(token) || token.includes(t)) ||
      Array.from(expandedTokens).some((et) => allRestTokens.has(et))
    ) {
      restMatchCount++;
    }
  }

  const restScore = restMatchCount / queryTokens.length;

  // Name exact/substring match gives strong boost
  const queryLower = queryKeyword.toLowerCase().trim();
  const nameLower = (restaurant.name || '').toLowerCase();
  const isNameExact = nameLower.includes(queryLower) || queryTokens.some((t) => nameLower.includes(t));

  let finalKeywordScore = Math.max(restScore, maxItemScore);
  if (isNameExact) {
    finalKeywordScore = Math.min(1.0, finalKeywordScore + 0.3);
  }

  return Math.min(1.0, Math.max(0.0, finalKeywordScore));
}

/**
 * Computes price fit score (0-1)
 */
function scorePriceFit(restaurant, priceQuery) {
  if (!priceQuery) return 1.0;

  const restTier = restaurant.price_range || 'moderate';
  const restTierInfo = PRICE_TIERS[restTier] || PRICE_TIERS.moderate;

  // If query is a price tier string (e.g. 'budget')
  if (typeof priceQuery === 'string') {
    const targetTierInfo = PRICE_TIERS[priceQuery.toLowerCase()];
    if (!targetTierInfo) return 0.5;
    const diff = Math.abs(restTierInfo.value - targetTierInfo.value);
    if (diff === 0) return 1.0;
    if (diff === 1) return 0.65;
    if (diff === 2) return 0.3;
    return 0.1;
  }

  // If query is [min, max] range
  if (Array.isArray(priceQuery) && priceQuery.length === 2) {
    const [minPrice, maxPrice] = priceQuery;
    if (minPrice == null && maxPrice == null) return 1.0;

    const min = minPrice != null ? Number(minPrice) : 0;
    const max = maxPrice != null ? Number(maxPrice) : Infinity;

    // Check overlap between restaurant price range and requested range
    if (restTierInfo.max < min || restTierInfo.min > max) {
      return 0.2; // minimal fit
    }
    return 1.0; // overlapping fit
  }

  return 1.0;
}

/**
 * Computes distance proximity score (0-1)
 */
function scoreDistance(restaurant, userLat, userLng, maxDistanceKm = 10) {
  if (userLat == null || userLng == null || restaurant.latitude == null || restaurant.longitude == null) {
    return 0.6; // Neutral score when location is not available
  }

  const distance = calculateHaversineDistance(
    userLat,
    userLng,
    restaurant.latitude,
    restaurant.longitude
  );

  const cap = maxDistanceKm > 0 ? maxDistanceKm : 10;
  if (distance >= cap) {
    return 0.0;
  }

  // Linear decay: 0km = 1.0, cap km = 0.0
  return Math.max(0.0, 1.0 - distance / cap);
}

/**
 * Computes rating score (0-1)
 */
function scoreRating(restaurant) {
  const rating = Number(restaurant.avg_rating) || 0;
  return Math.min(1.0, Math.max(0.0, rating / 5.0));
}

/**
 * Computes availability score (0-1)
 */
function scoreAvailability(restaurant) {
  const isOpen = restaurant.is_open !== false;
  const isActive = restaurant.is_active !== false;
  return isOpen && isActive ? 1.0 : 0.0;
}

/**
 * Checks if subscription is active and returns multiplier
 */
function getSubscriptionMultiplier(restaurant) {
  const tier = (restaurant.subscription_tier || 'none').toLowerCase();
  if (tier === 'none' || !SUBSCRIPTION_MULTIPLIERS[tier]) {
    return 1.0;
  }

  if (restaurant.subscription_expires_at) {
    const expires = new Date(restaurant.subscription_expires_at);
    if (expires < new Date()) {
      return 1.0; // Expired subscription
    }
  }

  return SUBSCRIPTION_MULTIPLIERS[tier] || 1.0;
}

/**
 * Checks if restaurant passes dietary requirements and cuisine filters
 */
function passesFilters(restaurant, query) {
  const { cuisine, dietaryTags } = query;

  if (cuisine && cuisine.trim()) {
    const targetCuisine = cuisine.toLowerCase().trim();
    if (targetCuisine !== 'all' && targetCuisine !== 'restaurants') {
      const cuisines = (restaurant.cuisines || []).map((c) => c.toLowerCase());
      const hasCuisineMatch = cuisines.some(
        (c) => c.includes(targetCuisine) || targetCuisine.includes(c)
      );
      const descLower = (restaurant.description || '').toLowerCase();
      const nameLower = (restaurant.name || '').toLowerCase();
      const textMatches = descLower.includes(targetCuisine) || nameLower.includes(targetCuisine);

      if (!hasCuisineMatch && !textMatches) {
        return false;
      }
    }
  }

  if (Array.isArray(dietaryTags) && dietaryTags.length > 0) {
    const offered = (restaurant.dietary_options || []).map((d) => d.toLowerCase());
    const satisfiesAll = dietaryTags.every((d) =>
      offered.some((opt) => opt.includes(d.toLowerCase()) || d.toLowerCase().includes(opt))
    );
    if (!satisfiesAll) return false;
  }

  return true;
}

/**
 * Main Rank Function
 * @param {Array} restaurants - list of restaurant objects
 * @param {Object} query - user query object { keyword, cuisine, priceRange, maxDistanceKm, dietaryTags, userLat, userLng }
 * @param {Object} menuItemsMap - Map of restaurantId -> Array of menuItems
 */
function rankRestaurants(restaurants, query = {}, menuItemsMap = {}) {
  const {
    keyword = '',
    priceRange,
    maxDistanceKm,
    userLat,
    userLng,
  } = query;

  // Step 1: Filter candidates based on dietary/cuisine
  const candidates = restaurants.filter((r) => passesFilters(r, query));

  // Step 2: Compute relevance and final score for each candidate
  const scoredList = candidates.map((restaurant) => {
    const items = menuItemsMap[restaurant.id] || [];

    const kwScore = scoreKeywordMatch(restaurant, keyword, items);
    const prScore = scorePriceFit(restaurant, priceRange);
    const distScore = scoreDistance(restaurant, userLat, userLng, maxDistanceKm);
    const rtScore = scoreRating(restaurant);
    const avScore = scoreAvailability(restaurant);

    const relevance_score = Number(
      (
        kwScore * WEIGHTS.keyword +
        prScore * WEIGHTS.priceRange +
        distScore * WEIGHTS.distance +
        rtScore * WEIGHTS.rating +
        avScore * WEIGHTS.availability
      ).toFixed(4)
    );

    const boostMultiplier = getSubscriptionMultiplier(restaurant);
    const final_score = Number((relevance_score * boostMultiplier).toFixed(4));

    // Distance in km for display
    let distance_km = null;
    if (userLat != null && userLng != null && restaurant.latitude != null && restaurant.longitude != null) {
      distance_km = Number(
        calculateHaversineDistance(userLat, userLng, restaurant.latitude, restaurant.longitude).toFixed(2)
      );
    } else if (restaurant.distance_km != null) {
      distance_km = Number(Number(restaurant.distance_km).toFixed(2));
    }

    const kwTokens = tokenize(keyword);
    const matched_menu_items = items
      .filter((i) => {
        if (!keyword || !keyword.trim()) return false;
        const kw = keyword.toLowerCase().trim();
        const itemName = (i.name || '').toLowerCase();
        const itemDesc = (i.description || '').toLowerCase();
        return (
          itemName.includes(kw) ||
          itemDesc.includes(kw) ||
          kwTokens.some((t) => itemName.includes(t) || itemDesc.includes(t))
        );
      })
      .slice(0, 3);

    return {
      ...restaurant,
      kw_score: kwScore,
      distance_km,
      relevance_score,
      subscription_boost: boostMultiplier,
      final_score,
      is_open: restaurant.is_open !== false,
      isSponsored: false,
      matched_menu_items,
    };
  });

  // Step 3: Hard availability & keyword relevance filter
  let availableCandidates = scoredList.filter((r) => r.is_open);
  if (keyword && keyword.trim()) {
    const kwFiltered = availableCandidates.filter((r) => r.kw_score > 0);
    if (kwFiltered.length > 0) {
      availableCandidates = kwFiltered;
    }
  }
  if (availableCandidates.length === 0) {
    availableCandidates = scoredList; // fallback if all closed
  }

  // Step 4: Separate featured candidates for sponsored slots
  // Featured must have relevance_score >= 0.3 to prevent irrelevant sponsored results
  const eligibleFeatured = availableCandidates.filter(
    (r) =>
      (r.subscription_tier || '').toLowerCase() === 'featured' &&
      r.relevance_score >= FEATURED_MIN_RELEVANCE_THRESHOLD
  );

  // Sort eligible featured by final_score descending
  eligibleFeatured.sort((a, b) => b.final_score - a.final_score);

  // Reserve up to MAX_SPONSORED_SLOTS (2)
  const sponsoredSlots = eligibleFeatured.slice(0, MAX_SPONSORED_SLOTS).map((r) => ({
    ...r,
    isSponsored: true,
  }));

  const sponsoredIds = new Set(sponsoredSlots.map((r) => r.id));

  // Remaining results (including non-sponsored or overflow featured)
  const regularResults = availableCandidates
    .filter((r) => !sponsoredIds.has(r.id))
    .map((r) => ({ ...r, isSponsored: false }));

  // Sort regular results by final_score descending
  regularResults.sort((a, b) => b.final_score - a.final_score);

  // Combine sponsored at top + regular results
  return [...sponsoredSlots, ...regularResults];
}

module.exports = {
  SUBSCRIPTION_MULTIPLIERS,
  FEATURED_MIN_RELEVANCE_THRESHOLD,
  MAX_SPONSORED_SLOTS,
  WEIGHTS,
  calculateHaversineDistance,
  scoreKeywordMatch,
  scorePriceFit,
  scoreDistance,
  scoreRating,
  scoreAvailability,
  getSubscriptionMultiplier,
  passesFilters,
  rankRestaurants,
};
