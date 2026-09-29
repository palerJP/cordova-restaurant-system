const { interpretQuery } = require('../../src/services/aiPreferenceInterpreter');

describe('AI preference interpreter', () => {
  it('extracts cuisine, dietary, atmosphere, budget, distance, and availability filters', () => {
    const result = interpretQuery('Find halal seafood by the sea under ₱500 within 5 km, open now');

    expect(result.filterCuisines).toEqual(['Seafood']);
    expect(result.dietaryRestrictions).toEqual(['HALAL']);
    expect(result.requiredServices).toEqual(['Seaside / Sunset View']);
    expect(result.budgetRange).toBe('moderate');
    expect(result.maxDistanceKm).toBe(5);
    expect(result.onlyOpenNow).toBe(true);
    expect(result.summary).toContain('Seafood');
    expect(result.summary).toContain('HALAL');
  });

  it('recognizes local dish names and no-pork requests', () => {
    const result = interpretQuery('Bakasi, no pork, and dine in');

    expect(result.filterCuisines).toEqual(['Bakasi & Shellfish']);
    expect(result.dietaryRestrictions).toEqual(['No Pork']);
    expect(result.requiredServices).toEqual(['Dine-In']);
  });

  it('does not treat a distance as a spending limit', () => {
    const result = interpretQuery('Seafood within 5 km');

    expect(result.filterCuisines).toEqual(['Seafood']);
    expect(result.maxDistanceKm).toBe(5);
    expect(result.budgetRange).toBeNull();
  });

  it('returns no inferred filters for a general request', () => {
    const result = interpretQuery('Show me a nice place to eat');

    expect(result.summary).toEqual([]);
    expect(result.filterCuisines).toEqual([]);
    expect(result.dietaryRestrictions).toEqual([]);
    expect(result.requiredServices).toEqual([]);
    expect(result.budgetRange).toBeNull();
  });
});
