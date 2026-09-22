const STORAGE_KEY = "agri_permanently_ended_locations";

/**
 * Get the set of message IDs whose locations have been permanently ended.
 * Persisted in localStorage so that refreshing the browser never resurrects ended locations.
 *
 * @returns {Set<string>}
 */
export function getPermanentlyEndedLocations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const list = JSON.parse(raw);
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

/**
 * Permanently mark a location message as ended.
 *
 * @param {string} messageId
 */
export function markLocationPermanentlyEnded(messageId) {
  if (!messageId) return;
  try {
    const current = getPermanentlyEndedLocations();
    current.add(String(messageId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.warn("[endedLocations] Failed to save to localStorage:", e);
  }
}
