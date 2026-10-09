describe('OpenAI recommendation boundary', () => {
  let service;
  let env;

  beforeEach(() => {
    jest.resetModules();
    env = require('../../src/config/env');
    env.aiRecommendationProvider = 'openai';
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

  test('uses Groq Responses with strict JSON and no unsupported store field', async () => {
    env.aiRecommendationProvider = 'groq';
    env.groq.apiKey = 'gsk_' + 'a'.repeat(40);
    env.groq.model = 'openai/gpt-oss-20b';
    env.groq.timeoutMs = 1000;
    env.groq.maxRequestsPerWindow = 10;
    env.groq.maxRequestsPerMinute = 10;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output: [
        { type: 'reasoning', content: [{ type: 'reasoning_text', text: 'private reasoning' }] },
        { type: 'message', content: [{ type: 'output_text', text: JSON.stringify({
          suggestions: [{ restaurantId: 'known' }, { restaurantId: 'invented' }],
        }) }] },
      ] }),
    });
    const result = await service.generateSuggestions({
      query: 'seafood', preferences: {},
      candidates: [{ restaurant: { id: 'known', name: 'Known Place', distance_km: 1.23456789 }, matchPercentage: 82, matchedPreferences: {} }],
    });
    expect(result).toEqual([{ restaurantId: 'known' }]);
    const [url, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(url).toBe('https://api.groq.com/openai/v1/responses');
    expect(options.headers.Authorization).toBe(`Bearer ${env.groq.apiKey}`);
    expect(body).not.toHaveProperty('store');
    expect(body.model).toBe('openai/gpt-oss-20b');
    expect(body.reasoning).toEqual({ effort: 'low' });
    expect(body.max_output_tokens).toBeGreaterThanOrEqual(1200);
    expect(body.text.format).toMatchObject({ type: 'json_schema', strict: true });
    expect(body.input[1].content).not.toContain('distanceKm');
  });

  test('maps Groq spend-limit errors without exposing provider details', async () => {
    env.aiRecommendationProvider = 'groq';
    env.groq.apiKey = 'gsk_' + 'a'.repeat(40);
    env.groq.maxRequestsPerWindow = 10;
    env.groq.maxRequestsPerMinute = 10;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false, status: 400,
      json: async () => ({ error: { code: 'blocked_api_access', message: 'private account details' } }),
    });
    let caught;
    try { await service.interpretQuery('seafood', ['Seafood']); } catch (error) { caught = error; }
    const failure = service.describeProviderFailure(caught);
    expect(failure.reason).toBe('quota');
    expect(failure.message).toContain('Groq');
    expect(JSON.stringify(failure)).not.toContain('private account details');
  });

  test('limits Groq bursts locally before its free-plan request cap', async () => {
    env.aiRecommendationProvider = 'groq';
    env.groq.apiKey = 'gsk_' + 'a'.repeat(40);
    env.groq.maxRequestsPerWindow = 60;
    env.groq.maxRequestsPerMinute = 1;
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

  test('attributes a provider error to the request provider after switching', () => {
    env.aiRecommendationProvider = 'groq';
    expect(service.describeProviderFailure({ provider: 'openai', providerReason: 'rate_limit' }))
      .toMatchObject({ reason: 'rate_limit', message: expect.stringContaining('OpenAI') });
  });
});
