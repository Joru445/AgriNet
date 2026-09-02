/**
 * Location cache (client-side, per-session).
 *
 * Stores the user's current device location in sessionStorage so Home,
 * Nearby, and Marketplace do not re-request browser geolocation on every
 * page visit during the same session. The constantly-changing current
 * location is intentionally kept client-side and never written to Firestore.
 */

const CACHE_KEY = "agri_location_cache";

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * How far (km) the user must move before a newly-obtained position is
 * considered a significant change. Configurable.
 */
export const LOCATION_MOVE_THRESHOLD_KM = 0.75;

function isValidCoords(lat, lng) {
  return (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lng === "number" &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  );
}

function safeCacheGet() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to read location cache:", error);
    return null;
  }
}

function safeCacheSet(value) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn("Failed to write location cache:", error);
  }
}

/**
 * Read a cached location if it is still valid (not expired).
 * Invalid/malformed entries are cleared.
 * @returns {{ lat:number, lng:number, timestamp:number }|null}
 */
export function getCachedLocation({ ttlMs = DEFAULT_TTL_MS } = {}) {
  const entry = safeCacheGet();
  if (!entry) return null;

  if (
    !entry.timestamp ||
    !isValidCoords(entry.lat, entry.lng) ||
    Date.now() > entry.timestamp + ttlMs
  ) {
    clearCachedLocation();
    return null;
  }

  return {
    lat: entry.lat,
    lng: entry.lng,
    timestamp: entry.timestamp,
  };
}

/**
 * Read any cached location regardless of freshness. Used to fall back to an
 * earlier position when a fresh request fails.
 * @returns {{ lat:number, lng:number, timestamp:number }|null}
 */
export function getStaleCachedLocation() {
  const entry = safeCacheGet();
  if (!entry || !isValidCoords(entry.lat, entry.lng)) {
    clearCachedLocation();
    return null;
  }
  return {
    lat: entry.lat,
    lng: entry.lng,
    timestamp: entry.timestamp ?? Date.now(),
  };
}

/**
 * Store a location in the session cache.
 * @param {{ lat:number, lng:number, timestamp?:number }} location
 */
export function setCachedLocation(location) {
  if (!location || !isValidCoords(location.lat, location.lng)) return;
  safeCacheSet({
    lat: location.lat,
    lng: location.lng,
    timestamp: location.timestamp ?? Date.now(),
  });
}

/**
 * Remove the cached location (e.g. when clearing an invalid/expired entry).
 */
export function clearCachedLocation() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear location cache:", error);
  }
}

/**
 * Whether a freshly-obtained location moved enough (relative to the cached
 * one) to count as a meaningful change. Uses Haversine distance.
 */
export function hasLocationMoved(
  next,
  previous,
  thresholdKm = LOCATION_MOVE_THRESHOLD_KM,
) {
  if (!next || !previous) return true;
  if (!isValidCoords(next.lat, next.lng) || !isValidCoords(previous.lat, previous.lng)) {
    return true;
  }
  return getDistanceKmFast(previous.lat, previous.lng, next.lat, next.lng) > thresholdKm;
}

function getDistanceKmFast(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}