/**
 * Simple in-memory page data cache with TTL support.
 *
 * Used to prevent unnecessary Firestore reads when users navigate
 * back to a page they've already visited. Data is cached in memory
 * only (no localStorage) to avoid stale data across sessions.
 *
 * Cache is invalidated:
 * - When TTL expires
 * - When invalidate() or invalidatePrefix() is called
 * - On auth state changes (via clearAll)
 */

const cache = new Map();

/**
 * Get cached data if it exists and hasn't expired.
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if miss/expired
 */
export function get(key) {
  if (!key) return null;

  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Store data in cache with a TTL.
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} [ttlMs=120000] - Time to live in milliseconds (default 2 minutes)
 */
export function set(key, data, ttlMs = 120000) {
  if (!key) return;

  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidate a specific cache entry.
 * @param {string} key - Cache key to invalidate
 */
export function invalidate(key) {
  if (!key) return;
  cache.delete(key);
}

/**
 * Invalidate all entries matching a prefix.
 * Useful when a mutation affects multiple related entries.
 * @param {string} prefix - Key prefix to match
 */
export function invalidatePrefix(prefix) {
  if (!prefix) return;

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cached data.
 * Should be called on auth state changes to prevent data leaking between accounts.
 */
export function clearAll() {
  cache.clear();
}

/**
 * Get cache size (for debugging).
 * @returns {number}
 */
export function size() {
  return cache.size;
}
