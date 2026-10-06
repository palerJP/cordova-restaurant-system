jest.mock('../../src/services/openaiRecommendation.service', () => ({
  isEnabled: jest.fn(() => true),
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
  beforeEach(() => { env.isProduction = false; });

  test('admin status never returns the secret key', () => {
    env.openai.apiKey = 'sk-sensitive-value-must-not-leak';
    expect(settings.getStatus(localRequest())).toEqual({
      configured: true, model: env.openai.model, timeoutMs: env.openai.timeoutMs, canConfigure: true,
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
    expect(() => settings._internal.validateSettings({ apiKey: 'sk-' + 'a'.repeat(30), secretOther: true })).toThrow('Only apiKey');
  });

  test('connection errors are returned without raw provider text', async () => {
    openai.interpretQuery.mockRejectedValueOnce(Object.assign(new Error('private provider detail'), { providerReason: 'quota' }));
    const result = await settings.testConnection();
    expect(result).toMatchObject({ connected: false, reason: 'quota', message: 'Safe provider message' });
    expect(JSON.stringify(result)).not.toContain('private provider detail');
  });
});
