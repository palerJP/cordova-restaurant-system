const ApiError = require('../utils/apiError');

const cache = new Map();
const CACHE_MS = 10 * 60 * 1000;

function parseResults(features = []) {
  const seen = new Set();
  return features.flatMap((feature) => {
    const p = feature.properties || {};
    const [longitude, latitude] = feature.geometry?.coordinates || [];
    // Never treat a municipality/barangay centre as a business address.
    if (!['house', 'street'].includes(p.type)
      || p.countrycode?.toUpperCase() !== 'PH'
      || !/cordova/i.test(p.city || '')
      || !Number.isFinite(latitude) || !Number.isFinite(longitude)
      || latitude < 10.20 || latitude > 10.32 || longitude < 123.90 || longitude > 124.02) return [];
    const id = `${p.osm_type}:${p.osm_id}`;
    if (seen.has(id)) return [];
    seen.add(id);
    return [{
      id, latitude, longitude,
      label: [...new Set([p.name, p.housenumber, p.street, p.district, p.city, p.state, p.country].filter(Boolean))].join(', '),
      approximate: p.type === 'street',
    }];
  });
}

async function lookupAddress(address, barangay = '') {
  if (typeof address !== 'string' || address.trim().length < 5 || address.length > 250
    || typeof barangay !== 'string' || barangay.length > 100) {
    throw ApiError.badRequest('Enter a street address or nearby landmark in Cordova (5–250 characters).');
  }
  const query = [address.trim(), barangay.trim(), 'Cordova, Cebu, Philippines'].filter(Boolean).join(', ');
  const cached = cache.get(query.toLowerCase());
  if (cached && cached.expires > Date.now()) return cached.results;
  const url = new URL('/api/', process.env.ADDRESS_LOOKUP_URL || 'https://photon.komoot.io');
  url.search = new URLSearchParams({ q: query, limit: '5', bbox: '123.90,10.20,124.02,10.32', lang: 'en' });
  let results;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'CordovaEats/1.0 (business address lookup)', Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Lookup unavailable');
    const data = await response.json();
    if (!Array.isArray(data.features)) throw new Error('Invalid lookup response');
    results = parseResults(data.features);
  } catch {
    throw new ApiError(503, 'Address lookup is temporarily unavailable. Please try again shortly.');
  }
  if (cache.size >= 100) cache.delete(cache.keys().next().value);
  cache.set(query.toLowerCase(), { expires: Date.now() + CACHE_MS, results });
  return results;
}

module.exports = { lookupAddress, parseResults };
