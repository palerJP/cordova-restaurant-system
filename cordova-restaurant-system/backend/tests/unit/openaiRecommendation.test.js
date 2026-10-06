describe('OpenAI recommendation boundary', () => {
  let service;
  let env;

  beforeEach(() => {
    jest.resetModules();
    env = require('../../src/config/env');
    env.openai.apiKey = 'sk-test-' + 'a'.repeat(30);
    env.openai.model = 'gpt-4.1-mini';
    env.openai.timeoutMs = 1000;
    env.openai.maxRequestsPerWindow = 1;
    service = require('../../src/services/openaiRecommendation.service');
  });

  afterEach(() => { delete global.fetch; });

  test('uses store false and discards unknown candidate IDs', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output: [{ type: 'message', content: [{ type: 'output_text',
        text: JSON.stringify({ suggestions: [{ restaurantId: 'known' }, { restaurantId: 'invented' }] }) }] }] }),
    });
    const result = await service.generateSuggestions({
      query: 'local food', preferences: {},
      candidates: [{ restaurant: { id: 'known', name: 'Known Place' }, matchPercentage: 82, matchedPreferences: {} }],
    });
    expect(result).toEqual([{ restaurantId: 'known' }]);
    const options = global.fetch.mock.calls[0][1];
    expect(JSON.parse(options.body).store).toBe(false);
    expect(JSON.stringify(result)).not.toContain('invented');
  });

  test('caps outbound calls and falls back before another fetch', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output: [{ type: 'message', content: [{ type: 'output_text',
        text: JSON.stringify({ suggestions: [] }) }] }] }),
    });
    const request = { query: 'food', preferences: {},
      candidates: [{ restaurant: { id: 'known', name: 'Known Place' }, matchPercentage: 82, matchedPreferences: {} }] };
    await service.generateSuggestions(request);
    await expect(service.generateSuggestions(request)).rejects.toMatchObject({ providerReason: 'local_rate_cap' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('maps depleted credits without reflecting provider messages', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false, status: 429,
      json: async () => ({ error: { code: 'credit_balance_exhausted', message: 'private key and account detail' } }),
    });
    let caught;
    try { await service.interpretQuery('seafood', ['Seafood']); } catch (error) { caught = error; }
    expect(service.describeProviderFailure(caught)).toMatchObject({ reason: 'quota' });
    expect(JSON.stringify(service.describeProviderFailure(caught))).not.toContain('private key');
  });
});
