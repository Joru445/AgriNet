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
    if (!Array.isArray(list)) return new Set();
    const valid = list.filter((id) => id && id !== "undefined" && id !== "null" && id !== "temp");
    return new Set(valid);
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
  if (!messageId || messageId === "undefined" || messageId === "null" || messageId === "temp") return;
  try {
    const current = getPermanentlyEndedLocations();
    current.add(String(messageId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.warn("[endedLocations] Failed to save to localStorage:", e);
  }
}
