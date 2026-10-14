const KEY = "agrinet_public_marketplace_v2";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Catalog entries are keyed by the public query. This cache never stores
// credentials, user profiles, or transaction-authoritative price/stock data.
export function loadPublicMarketplaceCache(queryKey = "default") {
  try {
    const cache = JSON.parse(localStorage.getItem(KEY) || "{}");
    const value = cache[queryKey];
    return value && Array.isArray(value.products) && Date.now() - value.savedAt <= MAX_AGE_MS ? value : null;
  } catch { return null; }
}

export function savePublicMarketplaceCache(products, queryKey = "default", pagination = {}) {
  try {
    const cache = JSON.parse(localStorage.getItem(KEY) || "{}");
    // Cursor metadata lets a restored catalog continue pagination without
    // re-fetching page one. Product listings are public display data only.
    cache[queryKey] = {
      savedAt: Date.now(),
      products,
      cursor: pagination.cursor || null,
      hasMore: Boolean(pagination.hasMore && pagination.cursor),
    };
    const keys = Object.keys(cache).sort((a, b) => cache[b].savedAt - cache[a].savedAt).slice(0, 8);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(keys.map((key) => [key, cache[key]]))));
  } catch { /* Storage is optional. */ }
}

// A catalog mutation can affect several filter/sort query entries. Removing
// them does not fetch anything; the next explicit or cache-miss load decides
// whether a fresh listing is needed.
export function invalidatePublicMarketplaceCache() {
  try {
    localStorage.removeItem(KEY);
  } catch { /* Storage is optional. */ }
}
