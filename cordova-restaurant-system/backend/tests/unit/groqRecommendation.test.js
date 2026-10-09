describe('Groq recommendation boundary', () => {
  let service;
  let env;

  beforeEach(() => {
    jest.resetModules();
    env = require('../../src/config/env');
    env.groq.apiKey = 'gsk_' + 'a'.repeat(40);
    env.groq.model = 'openai/gpt-oss-20b';
    env.groq.timeoutMs = 1000;
    env.groq.maxRequestsPerWindow = 60;
    env.groq.maxRequestsPerMinute = 20;
    service = require('../../src/services/groqRecommendation.service');
  });

  afterEach(() => { delete global.fetch; delete process.env.OPENAI_API_KEY; });

  test('uses Groq Responses, protects coordinates, and discards invented IDs', async () => {
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
      candidates: [{ restaurant: { id: 'known', name: 'Known Place', distance_km: 1.23456789 },
        matchPercentage: 82, matchedPreferences: {} }],
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
    expect(JSON.stringify(result)).not.toContain('invented');
  });

  test('a legacy OpenAI key cannot enable an external request', async () => {
    env.groq.apiKey = null;
    process.env.OPENAI_API_KEY = 'legacy-key-ignored';
    global.fetch = jest.fn();
    expect(service.isEnabled()).toBe(false);
    expect(await service.interpretQuery('seafood', ['Seafood'])).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('caps Groq bursts before another fetch', async () => {
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

  test('maps Groq spend-limit errors without reflecting provider details', async () => {
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
});
