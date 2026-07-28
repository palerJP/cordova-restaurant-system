const { _internal } = require('../../src/services/recommendation.service');
const {
  scoreCuisineMatch, scoreBudgetFit, scoreProximity, scoreDietaryMatch, scoreRating, passesHardFilters,
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

    it('rejects a restaurant beyond the max distance', () => {
      expect(passesHardFilters(baseRestaurant, { maxDistanceKm: 1 })).toBe(false);
    });

    it('accepts a restaurant within the max distance', () => {
      expect(passesHardFilters(baseRestaurant, { maxDistanceKm: 5 })).toBe(true);
    });

    it('accepts when no constraints are given at all', () => {
      expect(passesHardFilters(baseRestaurant, {})).toBe(true);
    });
  });
});
