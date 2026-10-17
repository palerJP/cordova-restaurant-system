const { lookupAddress, parseResults } = require('../../src/services/addressLookup.service');

const feature = (properties = {}, coordinates = [123.9328, 10.2565]) => ({
  geometry: { coordinates }, properties: {
    osm_type: 'N', osm_id: 1, type: 'house', name: 'Test Cafe',
    city: 'Cordova', state: 'Cebu', country: 'Philippines', countrycode: 'PH', ...properties,
  },
});

describe('business address lookup', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  test('accepts a local building, deduplicates results, and rejects area centres and outside matches', () => {
    const results = parseResults([
      feature(), feature(), feature({ type: 'district' }), feature({ city: 'Lapu-Lapu' }),
      feature({ countrycode: 'US' }), feature({}, [0, 0]), feature({}, [null, 10.25]),
    ]);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ latitude: 10.2565, longitude: 123.9328, approximate: false });
    expect(parseResults([feature({ type: 'street' })])[0].approximate).toBe(true);
  });

  test('rejects incomplete addresses before contacting a provider', async () => {
    global.fetch = jest.fn();
    await expect(lookupAddress('Gabi')).rejects.toMatchObject({ statusCode: 400 });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('restricts lookup to Cordova, caches results, and keeps no-match responses empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ features: [feature()] }) });
    expect(await lookupAddress('Unique Test Street', 'Day-as')).toHaveLength(1);
    const url = global.fetch.mock.calls[0][0];
    expect(url.searchParams.get('q')).toContain('Cordova, Cebu, Philippines');
    expect(url.searchParams.get('bbox')).toBe('123.90,10.20,124.02,10.32');
    await lookupAddress('Unique Test Street', 'Day-as');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ features: [] }) });
    expect(await lookupAddress('No Such Road')).toEqual([]);
  });

  test('reports provider failures without saving a default location', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('timeout'));
    await expect(lookupAddress('Provider Failure Road')).rejects.toMatchObject({ statusCode: 503 });
  });
});
