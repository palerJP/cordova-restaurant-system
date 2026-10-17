import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupAddress, parseResults } from '../src/lib/business-address-server';
import { POST } from '../src/app/api/business-location/route';

const feature = (properties = {}, coordinates = [123.9328, 10.2565]) => ({
  geometry: { coordinates }, properties: { osm_type: 'N', osm_id: 1, type: 'house', name: 'Test Cafe',
    city: 'Cordova', state: 'Cebu', country: 'Philippines', countrycode: 'PH', ...properties },
});

test('business address lookup and session protection', async (t) => {
  const originalFetch = global.fetch;
  const originalBackend = process.env.INTERNAL_API_URL;
  const originalOverride = process.env.BACKEND_URL;
  process.env.INTERNAL_API_URL = 'https://backend.example';
  delete process.env.BACKEND_URL;
  try {
    await t.test('rejects area centres, duplicate matches, invalid locations, and other cities', () => {
      const results = parseResults([feature(), feature(), feature({ type: 'district' }), feature({ city: 'Lapu-Lapu' }), feature({}, [0, 0]), feature({}, [NaN, 10.25])]);
      assert.equal(results.length, 1);
      assert.equal(results[0].approximate, false);
      assert.equal(parseResults([feature({ type: 'street' })])[0].approximate, true);
    });
    await t.test('rejects short addresses before contacting a provider', async () => {
      global.fetch = async () => { throw new Error('Must not fetch'); };
      await assert.rejects(lookupAddress('Gabi'), { status: 400 });
    });
    await t.test('unauthenticated requests never reach the provider', async () => {
      global.fetch = async () => { throw new Error('Must not fetch'); };
      assert.equal((await POST(new Request('https://frontend.example/api/business-location', { method: 'POST' }))).status, 401);
    });
    await t.test('validates a session, searches Cordova, and caches matching results', async () => {
      let searches = 0;
      global.fetch = async (input) => {
        const url = new URL(String(input));
        if (url.pathname === '/api/auth/me') return Response.json({ data: { user: { id: 'test-customer', role: 'customer' } } });
        searches++;
        assert.equal(url.searchParams.get('bbox'), '123.90,10.20,124.02,10.32');
        assert.match(url.searchParams.get('q')!, /Cordova, Cebu, Philippines/);
        return Response.json({ features: [feature()] });
      };
      const request = () => new Request('https://frontend.example/api/business-location', { method: 'POST', headers: { Authorization: 'Bearer test-token' }, body: JSON.stringify({ address: 'Unique Test Street', barangay: 'Day-as' }) });
      const response = await POST(request());
      assert.equal(response.status, 200);
      assert.equal((await response.json()).data.results[0].latitude, 10.2565);
      assert.equal((await POST(request())).status, 200);
      assert.equal(searches, 1);
    });
    await t.test('expired sessions cannot search addresses', async () => {
      global.fetch = async () => new Response('', { status: 401 });
      const res = await POST(new Request('https://frontend.example/api/business-location', { method: 'POST', headers: { Authorization: 'Bearer expired' }, body: '{}' }));
      assert.equal(res.status, 401);
    });
    await t.test('malformed input is rejected after session verification', async () => {
      global.fetch = async () => Response.json({ data: { user: { id: 'invalid-body-user', role: 'owner' } } });
      const res = await POST(new Request('https://frontend.example/api/business-location', { method: 'POST', headers: { Authorization: 'Bearer test-token' }, body: '{' }));
      assert.equal(res.status, 400);
    });
    await t.test('limits address lookups per signed-in account', async () => {
      global.fetch = async (input) => new URL(String(input)).pathname === '/api/auth/me'
        ? Response.json({ data: { user: { id: 'quota-user', role: 'owner' } } })
        : Response.json({ features: [] });
      const request = () => new Request('https://frontend.example/api/business-location', { method: 'POST', headers: { Authorization: 'Bearer test-token' }, body: JSON.stringify({ address: 'Quota Test Street' }) });
      for (let i = 0; i < 15; i++) assert.equal((await POST(request())).status, 200);
      assert.equal((await POST(request())).status, 429);
    });
    await t.test('provider failures report an error rather than a default pin', async () => {
      global.fetch = async () => { throw new Error('timeout'); };
      await assert.rejects(lookupAddress('Provider Failure Road'), { status: 503 });
    });
    await t.test('unmatched addresses return an empty list', async () => {
      global.fetch = async () => Response.json({ features: [] });
      assert.deepEqual(await lookupAddress('No Such Address Road'), []);
    });
  } finally {
    global.fetch = originalFetch;
    if (originalBackend === undefined) delete process.env.INTERNAL_API_URL; else process.env.INTERNAL_API_URL = originalBackend;
    if (originalOverride === undefined) delete process.env.BACKEND_URL; else process.env.BACKEND_URL = originalOverride;
  }
});
