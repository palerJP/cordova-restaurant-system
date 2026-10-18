import assert from 'node:assert/strict';
import test from 'node:test';
import { api, setAccessToken } from '../src/lib/api';

test('permit viewing refreshes an expired session and returns the document bytes', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ path: string; authorization?: string }> = [];
  setAccessToken('expired-access');
  try {
    globalThis.fetch = async (input, init) => {
      const path = new URL(String(input), 'http://localhost').pathname;
      calls.push({ path, authorization: (init?.headers as Record<string, string>)?.Authorization });
      if (calls.length === 1) return Response.json({ message: 'Invalid or expired token' }, { status: 401 });
      if (calls.length === 2) return Response.json({ data: { accessToken: 'renewed-access' } });
      return new Response('%PDF-test', { headers: { 'Content-Type': 'application/pdf' } });
    };
    const path = '/api/admin/restaurants/restaurant-1/permit';
    const document = await api.get<Blob>(path, { responseType: 'blob' });
    assert.equal(document.type, 'application/pdf');
    assert.equal(await document.text(), '%PDF-test');
    assert.deepEqual(calls, [
      { path, authorization: 'Bearer expired-access' },
      { path: '/api/auth/refresh', authorization: undefined },
      { path, authorization: 'Bearer renewed-access' },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
    setAccessToken(null);
  }
});
