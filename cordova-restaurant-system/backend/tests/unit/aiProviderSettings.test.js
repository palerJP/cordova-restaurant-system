jest.mock('../../src/services/openaiRecommendation.service', () => ({
  isEnabled: jest.fn(() => true),
  activeProvider: jest.fn(() => require('../../src/config/env').aiRecommendationProvider),
  interpretQuery: jest.fn(),
  describeProviderFailure: jest.fn((error) => ({ reason: error.providerReason, message: 'Safe provider message' })),
}));

const env = require('../../src/config/env');
const openai = require('../../src/services/openaiRecommendation.service');
const settings = require('../../src/services/aiProviderSettings.service');

const localRequest = () => ({
  socket: { remoteAddress: '127.0.0.1' },
  headers: { host: 'localhost:4000', origin: 'http://localhost:3000' },
});

describe('local AI provider settings', () => {
  beforeEach(() => {
    env.isProduction = false;
    env.aiRecommendationProvider = 'openai';
    env.groq.apiKey = null;
  });

  test('admin status never returns the secret key', () => {
    env.openai.apiKey = 'sk-sensitive-value-must-not-leak';
    expect(settings.getStatus(localRequest())).toEqual({
      provider: 'openai',
      configured: true, expiresAt: env.openai.expiresAt || null,
      providerConfigured: { openai: true, groq: false },
      model: env.openai.model, timeoutMs: env.openai.timeoutMs, canConfigure: true,
    });
    expect(JSON.stringify(settings.getStatus(localRequest()))).not.toContain('sk-sensitive');
  });

  test('rejects forwarded, remote, and production write contexts', () => {
    const remote = localRequest(); remote.socket.remoteAddress = '192.0.2.10';
    const forwarded = localRequest(); forwarded.headers['x-forwarded-for'] = '127.0.0.1';
    const foreignOrigin = localRequest(); foreignOrigin.headers.origin = 'https://example.com';
    expect(settings._internal.canConfigure(remote)).toBe(false);
    expect(settings._internal.canConfigure(forwarded)).toBe(false);
    expect(settings._internal.canConfigure(foreignOrigin)).toBe(false);
    env.isProduction = true;
    expect(settings._internal.canConfigure(localRequest())).toBe(false);
  });

  test('rejects extra settings and malformed keys before a write', () => {
    expect(() => settings._internal.validateSettings({ apiKey: 'sk-short' })).toThrow('valid OpenAI secret');
    expect(() => settings._internal.validateSettings({ apiKey: 'sk-' + 'a'.repeat(30), secretOther: true })).toThrow('Only provider');
  });

  test('accepts a key expiry date but rejects impossible dates', () => {
    expect(settings._internal.validateSettings({ expiresAt: '2026-11-05' })).toEqual({ expiresAt: '2026-11-05' });
    expect(() => settings._internal.validateSettings({ expiresAt: '2026-02-30' })).toThrow('key expiration');
    expect(() => settings._internal.validateSettings({ expiresAt: 123 })).toThrow('key expiration');
  });

  test('validates Groq settings and saves their names separately from OpenAI', () => {
    const key = 'gsk_' + 'a'.repeat(30);
    expect(settings._internal.validateSettings({ provider: 'groq', apiKey: key,
      model: 'openai/gpt-oss-20b' })).toEqual({ provider: 'groq', apiKey: key, model: 'openai/gpt-oss-20b' });
    expect(settings._internal.updateEnvText('OPENAI_API_KEY=sk-existing\n', {
      provider: 'groq', apiKey: key, model: 'openai/gpt-oss-20b',
    })).toContain(`GROQ_API_KEY=${key}`);
    expect(settings._internal.updateEnvText('OPENAI_API_KEY=sk-existing\n', {
      provider: 'groq', apiKey: key,
    })).toContain('OPENAI_API_KEY=sk-existing');
    expect(() => settings._internal.validateSettings({ provider: 'groq', apiKey: 'sk-' + 'a'.repeat(30) }))
      .toThrow('valid Groq secret');
    expect(() => settings._internal.validateSettings({ provider: 'other' })).toThrow('Choose OpenAI or Groq');
  });

  test('Groq status reveals selection but never either key', () => {
    env.aiRecommendationProvider = 'groq';
    env.groq.apiKey = 'gsk_sensitive-value-must-not-leak';
    const status = settings.getStatus(localRequest());
    expect(status).toMatchObject({ provider: 'groq', configured: true,
      providerConfigured: { openai: true, groq: true }, model: env.groq.model });
    expect(JSON.stringify(status)).not.toContain('gsk_sensitive');
    expect(JSON.stringify(status)).not.toContain('sk-sensitive');
  });

  test('connection errors are returned without raw provider text', async () => {
    openai.interpretQuery.mockRejectedValueOnce(Object.assign(new Error('private provider detail'), { providerReason: 'quota' }));
    const result = await settings.testConnection();
    expect(result).toMatchObject({ connected: false, reason: 'quota', message: 'Safe provider message' });
    expect(JSON.stringify(result)).not.toContain('private provider detail');
  });
});
