/**
 * In-memory + sessionStorage cache for user & farmer profiles.
 * Provides instantaneous synchronous lookup so avatars never flash letter initials.
 */

const memoryCache = new Map();

const SESSION_KEY = "agrinet_user_profiles_cache_v1";

// Hydrate from sessionStorage once on load
try {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      Object.entries(parsed).forEach(([uid, data]) => {
        if (data && uid) {
          memoryCache.set(uid, data);
        }
      });
    }
  }
} catch {
  /* noop */
}

function persistToSession() {
  try {
    const obj = {};
    // Keep max 200 profiles in session storage
    const entries = Array.from(memoryCache.entries()).slice(-200);
    entries.forEach(([uid, data]) => {
      obj[uid] = data;
    });
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(obj));
  } catch {
    /* noop */
  }
}

export function getCachedUserProfile(uid) {
  if (!uid) return null;
  return memoryCache.get(uid) || null;
}

export function setCachedUserProfile(uid, profileData) {
  if (!uid || !profileData) return;

  const existing = memoryCache.get(uid) || {};
  const merged = {
    ...existing,
    ...profileData,
    profilePicture:
      profileData.profilePicture ||
      existing.profilePicture ||
      "",
    verified:
      profileData.verified !== undefined
        ? profileData.verified
        : existing.verified,
  };

  memoryCache.set(uid, merged);
  persistToSession();
}
