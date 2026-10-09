jest.mock('../../src/services/groqRecommendation.service', () => ({
  isEnabled: jest.fn(() => true),
  interpretQuery: jest.fn(),
  describeProviderFailure: jest.fn((error) => ({ reason: error.providerReason, message: 'Safe provider message' })),
}));

const env = require('../../src/config/env');
const groq = require('../../src/services/groqRecommendation.service');
const settings = require('../../src/services/aiProviderSettings.service');

const localRequest = () => ({
  socket: { remoteAddress: '127.0.0.1' },
  headers: { host: 'localhost:4000', origin: 'http://localhost:3000' },
});

describe('local Groq settings', () => {
  beforeEach(() => { env.isProduction = false; });

  test('admin status never returns the secret key', () => {
    env.groq.apiKey = 'gsk_sensitive-value-must-not-leak';
    expect(settings.getStatus(localRequest())).toEqual({
      provider: 'groq', configured: true, expiresAt: env.groq.expiresAt || null,
      model: env.groq.model, timeoutMs: env.groq.timeoutMs, canConfigure: true,
    });
    expect(JSON.stringify(settings.getStatus(localRequest()))).not.toContain('gsk_sensitive');
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

  test('accepts Groq settings but rejects provider selection and malformed keys', () => {
    const key = 'gsk_' + 'a'.repeat(30);
    expect(settings._internal.validateSettings({ apiKey: key, model: 'openai/gpt-oss-20b' }))
      .toEqual({ apiKey: key, model: 'openai/gpt-oss-20b' });
    expect(() => settings._internal.validateSettings({ apiKey: 'sk-' + 'a'.repeat(30) }))
      .toThrow('valid Groq secret');
    expect(() => settings._internal.validateSettings({ provider: 'openai' }))
      .toThrow('Only apiKey');
    expect(settings._internal.updateEnvText('', { apiKey: key, model: 'openai/gpt-oss-20b' }))
      .toContain(`GROQ_API_KEY=${key}`);
  });

  test('accepts a key expiry date but rejects impossible dates', () => {
    expect(settings._internal.validateSettings({ expiresAt: '2026-11-05' })).toEqual({ expiresAt: '2026-11-05' });
    expect(() => settings._internal.validateSettings({ expiresAt: '2026-02-30' })).toThrow('key expiration');
    expect(() => settings._internal.validateSettings({ expiresAt: 123 })).toThrow('key expiration');
  });

  test('connection errors are returned without raw provider text', async () => {
    groq.interpretQuery.mockRejectedValueOnce(Object.assign(new Error('private provider detail'), { providerReason: 'quota' }));
    const result = await settings.testConnection();
    expect(result).toMatchObject({ provider: 'groq', connected: false, reason: 'quota', message: 'Safe provider message' });
    expect(JSON.stringify(result)).not.toContain('private provider detail');
  });
});
