// Volatile, UID-scoped cache for private queries. Nothing is persisted to disk.
// Callers must include the authenticated UID in accountCacheKey(). Keeping the
// cache in memory also prevents private responses from being written to disk.
const entries = new Map();
const pending = new Map();
const generations = new Map();
const MAX_ENTRIES = 160;
const DEFAULT_TTL = 2 * 60 * 1000;
const metrics = { hits: 0, misses: 0, requests: 0, deduped: 0, evictions: 0 };

function touch(key, value) {
  entries.delete(key);
  entries.set(key, { ...value, touchedAt: Date.now() });
  while (entries.size > MAX_ENTRIES) {
    entries.delete(entries.keys().next().value);
    metrics.evictions += 1;
  }
}

export function accountCacheKey(uid, namespace, params = "") {
  return `${uid}:${namespace}:${typeof params === "string" ? params : JSON.stringify(params)}`;
}

export function getAccountCache(key, ttl = DEFAULT_TTL) {
  const value = entries.get(key);
  if (!value) {
    metrics.misses += 1;
    return undefined;
  }
  const effectiveTtl = ttl < 0 ? value.ttl : ttl;
  if (effectiveTtl >= 0 && Date.now() - value.timestamp > effectiveTtl) {
    entries.delete(key);
    metrics.misses += 1;
    return undefined;
  }
  touch(key, value);
  metrics.hits += 1;
  return value.data;
}

export function setAccountCache(key, data, ttl = DEFAULT_TTL) {
  if (!key) return data;
  touch(key, { data, timestamp: Date.now(), ttl });
  return data;
}

/**
 * Deduplicate a query and prevent a response invalidated during the request
 * from repopulating the cache. `fetcher` may accept an AbortSignal, but this
 * remains backwards compatible with existing zero-argument fetchers.
 */
export function accountCacheRequest(key, fetcher, { ttl = DEFAULT_TTL } = {}) {
  if (!key || typeof fetcher !== "function") return Promise.reject(new Error("A cache key and fetcher are required."));
  if (pending.has(key)) {
    metrics.deduped += 1;
    return pending.get(key).promise;
  }

  const generation = generations.get(key) || 0;
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  metrics.requests += 1;
  const pendingEntry = { promise: null, controller };
  const request = Promise.resolve()
    .then(() => fetcher(controller?.signal))
    .then((data) => {
      if ((generations.get(key) || 0) === generation) setAccountCache(key, data, ttl);
      return data;
    })
    .finally(() => {
      if (pending.get(key) === pendingEntry) pending.delete(key);
    });
  pendingEntry.promise = request;
  pending.set(key, pendingEntry);
  return request;
}

export function invalidateAccountCache(prefix) {
  if (!prefix) return;
  for (const key of entries.keys()) if (key.startsWith(prefix)) entries.delete(key);
  for (const key of pending.keys()) {
    if (!key.startsWith(prefix)) continue;
    generations.set(key, (generations.get(key) || 0) + 1);
    const entry = pending.get(key);
    pending.delete(key);
    entry?.controller?.abort();
  }
}

export function clearAccountCache(uid) {
  invalidateAccountCache(`${uid}:`);
}

export function clearAccountQueryCache() {
  for (const entry of pending.values()) entry.controller?.abort();
  entries.clear();
  pending.clear();
  generations.clear();
  metrics.hits = 0;
  metrics.misses = 0;
  metrics.requests = 0;
  metrics.deduped = 0;
  metrics.evictions = 0;
}

export function getAccountCacheMetrics() {
  return { ...metrics, entries: entries.size, pending: pending.size };
}
