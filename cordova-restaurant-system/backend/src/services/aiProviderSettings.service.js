const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const openaiRecommendation = require('./openaiRecommendation.service');

const ENV_PATH = path.resolve(__dirname, '../../.env.local');
const SETTING_KEYS = {
  apiKey: 'OPENAI_API_KEY',
  expiresAt: 'OPENAI_API_KEY_EXPIRES_AT',
  model: 'OPENAI_MODEL',
  timeoutMs: 'OPENAI_TIMEOUT_MS',
};
let pendingSave = Promise.resolve();

function isLocalHost(value) {
  return typeof value === 'string' && /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/i.test(value);
}

function isLocalOrigin(value) {
  if (typeof value !== 'string') return false;
  try {
    const origin = new URL(value);
    return ['http:', 'https:'].includes(origin.protocol)
      && isLocalHost(origin.host)
      && !origin.username && !origin.password
      && origin.pathname === '/' && !origin.search && !origin.hash;
  } catch {
    return false;
  }
}

function canConfigure(req) {
  const address = req?.socket?.remoteAddress;
  return !env.isProduction
    && ['::1', '127.0.0.1', '::ffff:127.0.0.1'].includes(address)
    && isLocalHost(req?.headers?.host)
    && isLocalOrigin(req?.headers?.origin)
    && !['forwarded', 'x-forwarded-for', 'x-real-ip', 'x-forwarded-host', 'x-forwarded-proto']
      .some((header) => req.headers[header] !== undefined);
}

function getStatus(req) {
  return {
    configured: openaiRecommendation.isEnabled(),
    expiresAt: env.openai.expiresAt || null,
    model: env.openai.model,
    timeoutMs: env.openai.timeoutMs,
    canConfigure: canConfigure(req),
  };
}

function validateSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw ApiError.badRequest('Provide AI provider settings as an object.');
  }
  if (Object.keys(input).some((key) => !Object.hasOwn(SETTING_KEYS, key))) {
    throw ApiError.badRequest('Only apiKey, expiresAt, model, and timeoutMs can be updated.');
  }
  const updates = {};
  if (Object.hasOwn(input, 'apiKey')) {
    if (typeof input.apiKey !== 'string') throw ApiError.badRequest('API key must be text.');
    const apiKey = input.apiKey.trim();
    if (apiKey) {
      if (!/^sk-[A-Za-z0-9_-]{20,512}$/.test(apiKey)
        || /(?:your[-_]?api[-_]?key|replace[-_]?me|placeholder|change[-_]?me|example)/i.test(apiKey)
        || /^sk-(?:test|fake|dummy|x{10,})[-_]?/i.test(apiKey)) {
        throw ApiError.badRequest('Enter a valid OpenAI secret API key beginning with sk-.');
      }
      updates.apiKey = apiKey;
    }
  }
  if (Object.hasOwn(input, 'model')) {
    if (typeof input.model !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(input.model.trim())) {
      throw ApiError.badRequest('Enter a valid model name.');
    }
    updates.model = input.model.trim();
  }
  if (Object.hasOwn(input, 'expiresAt')) {
    const expiresAt = input.expiresAt;
    if (typeof expiresAt !== 'string' || (expiresAt && (
      !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)
      || Number.isNaN(Date.parse(`${expiresAt}T00:00:00Z`))
      || new Date(`${expiresAt}T00:00:00Z`).toISOString().slice(0, 10) !== expiresAt
    ))) {
      throw ApiError.badRequest('Enter the key expiration as YYYY-MM-DD, or leave it blank.');
    }
    updates.expiresAt = expiresAt;
  }
  if (Object.hasOwn(input, 'timeoutMs')) {
    if (!Number.isInteger(input.timeoutMs) || input.timeoutMs < 1000 || input.timeoutMs > 60000) {
      throw ApiError.badRequest('Timeout must be a whole number from 1000 to 60000 milliseconds.');
    }
    updates.timeoutMs = input.timeoutMs;
  }
  return updates;
}

function updateEnvText(content, updates) {
  const values = Object.fromEntries(Object.entries(updates).map(([key, value]) => [SETTING_KEYS[key], String(value)]));
  const seen = new Set();
  const assignment = /^([ \t]*(?:export[ \t]+)?)([\w.-]+)[ \t]*(?:=[ \t]*|:[ \t]+)('(?:\\'|[^'])*'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`|[^#\r\n]*)([ \t]*(?:#[^\r\n]*)?)/gm;
  let updated = content.replace(assignment, (original, prefix, key, value, comment) => {
    if (!Object.hasOwn(values, key)) return original;
    seen.add(key);
    return `${prefix}${key}=${values[key]}${comment ? ` ${comment.trimStart()}` : ''}`;
  });
  const newline = content.includes('\r\n') ? '\r\n' : '\n';
  for (const [key, value] of Object.entries(values)) {
    if (seen.has(key)) continue;
    if (updated && !updated.endsWith('\n')) updated += newline;
    updated += `${key}=${value}${newline}`;
  }
  return updated;
}

async function persistSettings(updates) {
  if (!Object.keys(updates).length) return;
  const tempPath = `${ENV_PATH}.${randomUUID()}.tmp`;
  try {
    let content;
    try { content = await fs.readFile(ENV_PATH, 'utf8'); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      content = '';
    }
    await fs.writeFile(tempPath, updateEnvText(content, updates), { encoding: 'utf8', mode: 0o600, flag: 'wx' });
    await fs.rename(tempPath, ENV_PATH);
  } catch {
    await fs.unlink(tempPath).catch(() => {});
    throw ApiError.internal('Unable to save the local AI settings. Check that the backend .env.local file is writable.');
  }
  Object.assign(env.openai, updates);
  for (const [key, value] of Object.entries(updates)) process.env[SETTING_KEYS[key]] = String(value);
}

async function saveSettings(req, input) {
  if (!canConfigure(req)) {
    throw ApiError.forbidden('AI settings can only be changed from a local browser on this computer while the server is running in development.');
  }
  const updates = validateSettings(input);
  const save = pendingSave.then(() => persistSettings(updates));
  pendingSave = save.catch(() => {});
  await save;
  return getStatus(req);
}

async function testConnection() {
  const model = env.openai.model;
  if (!openaiRecommendation.isEnabled()) {
    return { connected: false, reason: 'not_configured', model,
      message: 'Add an OpenAI API key before testing the connection.', checkedAt: new Date().toISOString() };
  }
  try {
    const filters = await openaiRecommendation.interpretQuery('Find affordable seafood within 2 km.', ['Seafood']);
    if (!filters) throw Object.assign(new Error('Invalid structured response'), { providerReason: 'invalid_response' });
    return { connected: true, model,
      message: 'OpenAI connected successfully and returned restaurant preference filters.', checkedAt: new Date().toISOString() };
  } catch (error) {
    return { connected: false, ...openaiRecommendation.describeProviderFailure(error), model,
      checkedAt: new Date().toISOString() };
  }
}

module.exports = { getStatus, saveSettings, testConnection, _internal: { canConfigure, validateSettings, updateEnvText } };
