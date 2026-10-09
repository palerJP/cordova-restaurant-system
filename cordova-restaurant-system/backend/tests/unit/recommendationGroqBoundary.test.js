jest.mock('../../src/services/recommendation.service', () => ({
  getRecommendationsAndLog: jest.fn(), getRecommendations: jest.fn(),
}));
jest.mock('../../src/services/groqRecommendation.service', () => ({
  isEnabled: jest.fn(() => true),
  interpretQuery: jest.fn(),
  generateSuggestions: jest.fn(),
  logProviderFailure: jest.fn(),
}));
jest.mock('../../src/models/cuisine.model', () => ({ listAll: jest.fn() }));

const controller = require('../../src/controllers/recommendation.controller');
const recommendationService = require('../../src/services/recommendation.service');
const provider = require('../../src/services/groqRecommendation.service');
const cuisineModel = require('../../src/models/cuisine.model');

const localResult = {
  restaurant: { id: 'known', name: 'Known Place' },
  score: 77, matchPercentage: 77, reason: 'Local data-backed explanation',
};
const localOutput = {
  results: [localResult], totalCandidatesConsidered: 1, totalAfterFilters: 1,
  weightsUsed: {}, personalization: { mode: 'preference_match' },
};

async function request(body) {
  return new Promise((resolve, reject) => {
    const res = { json: resolve };
    controller.getRecommendations({ body, headers: {} }, res, reject);
  });
}

describe('Groq recommendation integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cuisineModel.listAll.mockResolvedValue([]);
    recommendationService.getRecommendationsAndLog.mockResolvedValue(localOutput);
    provider.interpretQuery.mockResolvedValue(null);
    provider.generateSuggestions.mockResolvedValue([]);
  });

  test('model selection cannot replace local scores or explanations', async () => {
    provider.generateSuggestions.mockResolvedValue([{ restaurantId: 'known', reason: 'Unverified model claim' }]);
    const response = await request({ query: 'food' });
    expect(response.data[0]).toMatchObject({ score: 77, reason: 'Local data-backed explanation', aiSuggested: true });
    expect(JSON.stringify(response)).not.toContain('Unverified model claim');
  });

  test('provider failures return local recommendations', async () => {
    provider.interpretQuery.mockRejectedValue(new Error('provider unavailable'));
    provider.generateSuggestions.mockRejectedValue(new Error('provider unavailable'));
    const response = await request({ query: 'food' });
    expect(response.data).toEqual([localResult]);
    expect(response.meta.aiProvider).toBe('local');
  });

  test('reports Groq only when it selected a known restaurant', async () => {
    provider.generateSuggestions.mockResolvedValue([{ restaurantId: 'known' }]);
    const response = await request({ query: 'food' });
    expect(response.meta).toMatchObject({ aiProvider: 'groq', aiSuggestionCount: 1 });
    expect(response.data[0]).toMatchObject({ matchPercentage: 77, aiSuggested: true });
  });

  test('admin preview does not write customer recommendation history', async () => {
    recommendationService.getRecommendations.mockResolvedValue(localOutput);
    await new Promise((resolve, reject) => {
      controller.previewRecommendations({ body: { query: 'food' }, headers: {}, user: { id: 'admin' } },
        { json: resolve }, reject);
    });
    expect(recommendationService.getRecommendations).toHaveBeenCalledWith(expect.any(Object), null);
    expect(recommendationService.getRecommendationsAndLog).not.toHaveBeenCalled();
  });
});
