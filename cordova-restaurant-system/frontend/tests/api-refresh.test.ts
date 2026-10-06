import assert from 'node:assert/strict';
import test from 'node:test';
import { api, ApiClientError, getAccessToken, onSessionExpired, setAccessToken } from '../src/lib/api';

function jsonResponse(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('an expired access token is refreshed and the training request is retried once', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ path: string; authorization?: string }> = [];
  setAccessToken('expired-access');

  try {
    globalThis.fetch = async (input, init) => {
      const path = new URL(String(input)).pathname;
      const authorization = (init?.headers as Record<string, string> | undefined)?.Authorization;
      calls.push({ path, authorization });

      if (calls.length === 1) return jsonResponse(401, { message: 'Invalid or expired token' });
      if (calls.length === 2) return jsonResponse(200, { data: { accessToken: 'renewed-access' } });
      if (calls.length === 3) return jsonResponse(200, { data: { trained: true } });
      throw new Error('Unexpected extra request');
    };

    const result = await api.post<{ data: { trained: boolean } }>('/api/recommendations/training');
    assert.equal(result.data.trained, true);
    assert.deepEqual(calls, [
      { path: '/api/recommendations/training', authorization: 'Bearer expired-access' },
      { path: '/api/auth/refresh', authorization: undefined },
      { path: '/api/recommendations/training', authorization: 'Bearer renewed-access' },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
    setAccessToken(null);
  }
});

test('later access token expiries can refresh again', async () => {
  const originalFetch = globalThis.fetch;
  let requestCount = 0;
  setAccessToken('first-access');

  try {
    globalThis.fetch = async (input, init) => {
      requestCount += 1;
      const path = new URL(String(input)).pathname;
      if (path === '/api/auth/refresh') {
        return jsonResponse(200, { data: { accessToken: requestCount === 2 ? 'second-access' : 'third-access' } });
      }
      const authorization = (init?.headers as Record<string, string> | undefined)?.Authorization;
      if (authorization === 'Bearer first-access' || (authorization === 'Bearer second-access' && requestCount === 4)) {
        return jsonResponse(401, { message: 'Access token expired' });
      }
      return jsonResponse(200, { data: { trained: true } });
    };

    await api.post('/api/recommendations/training');
    await api.post('/api/recommendations/training');
    assert.equal(requestCount, 6);
    assert.equal(getAccessToken(), 'third-access');
  } finally {
    globalThis.fetch = originalFetch;
    setAccessToken(null);
  }
});

test('a rejected refresh ends the local session', async () => {
  const originalFetch = globalThis.fetch;
  let sessionExpiredCount = 0;
  const unsubscribe = onSessionExpired(() => { sessionExpiredCount += 1; });
  setAccessToken('expired-access');

  try {
    globalThis.fetch = async (input) =>
      new URL(String(input)).pathname === '/api/auth/refresh'
        ? jsonResponse(401, { message: 'Refresh token expired' })
        : jsonResponse(401, { message: 'Invalid or expired token' });

    await assert.rejects(
      api.post('/api/recommendations/training'),
      (error: unknown) => error instanceof ApiClientError && error.status === 401,
    );
    assert.equal(getAccessToken(), null);
    assert.equal(sessionExpiredCount, 1);
  } finally {
    unsubscribe();
    globalThis.fetch = originalFetch;
    setAccessToken(null);
  }
});

test('a temporary refresh failure keeps the local session for a later retry', async () => {
  const originalFetch = globalThis.fetch;
  let sessionExpiredCount = 0;
  const unsubscribe = onSessionExpired(() => { sessionExpiredCount += 1; });
  setAccessToken('expired-access');

  try {
    globalThis.fetch = async (input) =>
      new URL(String(input)).pathname === '/api/auth/refresh'
        ? jsonResponse(503, { message: 'Service unavailable' })
        : jsonResponse(401, { message: 'Invalid or expired token' });

    await assert.rejects(
      api.post('/api/recommendations/training'),
      (error: unknown) => error instanceof ApiClientError && error.status === 401,
    );
    assert.equal(getAccessToken(), 'expired-access');
    assert.equal(sessionExpiredCount, 0);
  } finally {
    unsubscribe();
    globalThis.fetch = originalFetch;
    setAccessToken(null);
  }
});
