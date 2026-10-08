const recommendationService = require('../../src/services/recommendation.service');
const restaurantModel = require('../../src/models/restaurant.model');
const weightsModel = require('../../src/models/recommendationWeights.model');
const recommendationTrainingModel = require('../../src/models/recommendationTraining.model');
const { _internal } = recommendationService;
const {
  scoreCuisineMatch, scoreBudgetFit, scoreProximity, scoreDietaryMatch, scoreServicesMatch, scoreRating, passesHardFilters, serviceList,
} = _internal;

describe('Recommendation Engine — scoring factors', () => {
  describe('scoreCuisineMatch', () => {
    it('returns neutral score when user has no cuisine preference', () => {
      expect(scoreCuisineMatch({ cuisines: ['Seafood'] }, [])).toBe(60);
    });

    it('returns 0 when no cuisines overlap', () => {
      expect(scoreCuisineMatch({ cuisines: ['Korean'] }, ['Seafood'])).toBe(0);
    });

    it('returns 100 when all preferred cuisines match', () => {
      expect(scoreCuisineMatch({ cuisines: ['Seafood', 'Cebuano / Local'] }, ['Seafood'])).toBe(100);
    });

    it('scales proportionally with partial matches', () => {
      const score = scoreCuisineMatch({ cuisines: ['Seafood'] }, ['Seafood', 'Korean']);
      expect(score).toBe(50);
    });
  });

  describe('scoreBudgetFit', () => {
    it('returns 100 for an exact budget match', () => {
      expect(scoreBudgetFit({ price_range: 'moderate' }, 'moderate')).toBe(100);
    });

    it('penalizes 30 points per price tier away', () => {
      expect(scoreBudgetFit({ price_range: 'premium' }, 'budget')).toBe(10); // 3 tiers away
    });

    it('returns neutral score when no budget preference given', () => {
      expect(scoreBudgetFit({ price_range: 'moderate' }, undefined)).toBe(60);
    });

    it('never goes below zero', () => {
      expect(scoreBudgetFit({ price_range: 'premium' }, 'budget')).toBeGreaterThanOrEqual(0);
    });
  });

  describe('scoreProximity', () => {
    it('returns 100 at zero distance', () => {
      expect(scoreProximity({ distance_km: 0 }, 5)).toBe(100);
    });

    it('returns 0 at or beyond the max distance', () => {
      expect(scoreProximity({ distance_km: 5 }, 5)).toBe(0);
      expect(scoreProximity({ distance_km: 10 }, 5)).toBe(0);
    });

    it('decays linearly between 0 and max distance', () => {
      expect(scoreProximity({ distance_km: 2.5 }, 5)).toBe(50);
    });

    it('returns neutral score when no location was supplied', () => {
      expect(scoreProximity({ distance_km: null }, 5)).toBe(50);
    });
  });

  describe('scoreDietaryMatch', () => {
    it('returns 100 when user has no dietary restrictions', () => {
      expect(scoreDietaryMatch({ dietary_options: [] }, [])).toBe(100);
    });

    it('returns 0 when none of the restrictions are offered', () => {
      expect(scoreDietaryMatch({ dietary_options: ['halal'] }, ['vegan'])).toBe(0);
    });

    it('returns partial credit for partially satisfied restrictions', () => {
      const score = scoreDietaryMatch({ dietary_options: ['vegan'] }, ['vegan', 'halal']);
      expect(score).toBe(50);
    });
  });

  describe('scoreRating', () => {
    it('normalizes a 5-star rating to 100', () => {
      expect(scoreRating({ avg_rating: 5 })).toBe(100);
    });
    it('normalizes a 0 rating to 0', () => {
      expect(scoreRating({ avg_rating: 0 })).toBe(0);
    });
    it('normalizes a 3.5 rating to 70', () => {
      expect(scoreRating({ avg_rating: 3.5 })).toBe(70);
    });
  });

  describe('passesHardFilters', () => {
    const baseRestaurant = {
      dietary_options: ['vegetarian'],
      services_offered: ['dine_in', 'takeout'],
      distance_km: 2,
    };

    it('rejects a restaurant missing a required dietary option', () => {
      expect(passesHardFilters(baseRestaurant, { dietaryRestrictions: ['vegan'] })).toBe(false);
    });

    it('accepts a restaurant that satisfies all dietary restrictions', () => {
      expect(passesHardFilters(baseRestaurant, { dietaryRestrictions: ['vegetarian'] })).toBe(true);
    });

    it('rejects a restaurant offering none of the required services', () => {
      expect(passesHardFilters(baseRestaurant, { requiredServices: ['delivery'] })).toBe(false);
    });

    it('accepts a restaurant offering at least one required service', () => {
      expect(passesHardFilters(baseRestaurant, { requiredServices: ['dine_in', 'delivery'] })).toBe(true);
    });

    it('handles PostgreSQL enum array strings when checking saved services', () => {
      const restaurant = { ...baseRestaurant, services_offered: '{dine_in,takeout}' };
      expect(serviceList(restaurant.services_offered)).toEqual(['dine_in', 'takeout']);
      expect(passesHardFilters(restaurant, { requiredServices: ['dine_in'] })).toBe(true);
      expect(scoreServicesMatch(restaurant, ['takeout'])).toBe(100);
    });

    it('handles an array-literal amenity without splitting it into characters', () => {
      const restaurant = { ...baseRestaurant, amenities: '{Al Fresco}' };
      expect(scoreServicesMatch(restaurant, ['al_fresco'])).toBe(100);
    });

    it('rejects a restaurant beyond the max distance', () => {
      expect(passesHardFilters(baseRestaurant, { maxDistanceKm: 1 })).toBe(false);
    });

    it('accepts a restaurant within the max distance', () => {
      expect(passesHardFilters(baseRestaurant, { maxDistanceKm: 5 })).toBe(true);
    });

    it('filters candidates to cuisines named in the AI request', () => {
      const seafoodRestaurant = { ...baseRestaurant, cuisines: ['Seafood'] };
      const cafe = { ...baseRestaurant, cuisines: ['Cafe'] };

      expect(passesHardFilters(seafoodRestaurant, { filterCuisines: ['Seafood'] })).toBe(true);
      expect(passesHardFilters(cafe, { filterCuisines: ['Seafood'] })).toBe(false);
    });

    it('filters candidates to service and atmosphere intents named in the AI request', () => {
      const seasideRestaurant = {
        ...baseRestaurant,
        name: 'Parola Seaview Restaurant',
        amenities: ['Al Fresco'],
      };
      const cafe = { ...baseRestaurant, name: 'Cordova Cafe', amenities: ['Air Conditioned'] };

      expect(passesHardFilters(seasideRestaurant, { filterServices: ['Seaside / Sunset View'] })).toBe(true);
      expect(passesHardFilters(cafe, { filterServices: ['Seaside / Sunset View'] })).toBe(false);
    });

    it('recognizes the service IDs saved by the taste preferences form', () => {
      const seasideRestaurant = {
        ...baseRestaurant,
        name: 'Parola Seaview Restaurant',
        amenities: ['Al Fresco'],
      };

      expect(scoreServicesMatch(seasideRestaurant, ['seaside_view'])).toBe(100);
      expect(scoreServicesMatch(seasideRestaurant, ['al_fresco'])).toBe(100);
      expect(scoreServicesMatch(baseRestaurant, ['live_music'])).toBe(0);
    });

    it('accepts when no constraints are given at all', () => {
      expect(passesHardFilters(baseRestaurant, {})).toBe(true);
    });
  });
});

describe('Recommendation Engine — saved location fallback', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns scored restaurants when none fit the saved distance', async () => {
    jest.spyOn(restaurantModel, 'findAllForRecommendation').mockResolvedValue([{
      id: 'restaurant-1',
      name: 'Faraway Cafe',
      cuisines: ['Cafe & Desserts'],
      dietary_options: [],
      services_offered: '{dine_in,takeout}',
      amenities: [],
      price_range: 'moderate',
      distance_km: 12,
      avg_rating: 4,
    }]);
    jest.spyOn(weightsModel, 'getActive').mockResolvedValue(null);
    jest.spyOn(recommendationTrainingModel, 'getActiveModel').mockResolvedValue(null);

    const result = await recommendationService.getRecommendations({
      userLat: 10,
      userLng: 123,
      maxDistanceKm: 5,
      requiredServices: ['dine_in'],
    });

    expect(result.totalCandidatesConsidered).toBe(1);
    expect(result.totalAfterFilters).toBe(1);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].restaurant.services_offered).toEqual(['dine_in', 'takeout']);
    expect(result.results[0].scoreBreakdown.proximity).toBe(0);
    expect(result.results[0].scoreBreakdown.servicesMatch).toBe(100);
    expect(result.results[0].matchPercentage).toBeGreaterThan(0);
  });
});
