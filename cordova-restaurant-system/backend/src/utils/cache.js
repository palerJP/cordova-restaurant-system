/**
 * Minimal in-process TTL cache for read-heavy, rarely-changing reference
 * data (cuisines, attractions). Deliberately NOT a distributed cache
 * (Redis, etc.) — this app runs as a single Node process, so an in-memory
 * Map is simpler, has zero extra infrastructure, and is perfectly adequate
 * at this scale. If this app is ever horizontally scaled across multiple
 * instances, swap this for a shared cache (Redis) since each process
 * would otherwise cache independently.
 */
const store = new Map();

/**
 * Returns the cached value for `key` if still fresh, otherwise calls
 * `fetchFn`, caches the result for `ttlMs`, and returns it.
 */
async function cached(key, ttlMs, fetchFn) {
  const entry = store.get(key);
  const now = Date.now();
  if (entry && entry.expiresAt > now) {
    return entry.value;
  }
  const value = await fetchFn();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

/** Manually invalidate a cached key — call this after any write that changes it. */
function invalidate(key) {
  store.delete(key);
}

module.exports = { cached, invalidate };
