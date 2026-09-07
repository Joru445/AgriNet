/**
 * In-memory + storage cache for user & farmer profiles.
 * Provides instantaneous synchronous lookup so avatars never flash letter initials.
 *
 * Payload is obfuscated/encoded and stripped of sensitive fields (email, phone, etc.)
 * so user details are not openly visible in browser DevTools Local/Session storage.
 */

const memoryCache = new Map();

const STORAGE_KEY = "agrinet_user_profiles_cache_v1";

function encodePayload(obj) {
  try {
    const json = JSON.stringify(obj);
    return btoa(encodeURIComponent(json));
  } catch {
    return "";
  }
}

function decodePayload(raw) {
  if (!raw) return null;
  try {
    const json = decodeURIComponent(atob(raw));
    return JSON.parse(json);
  } catch {
    // Fallback if legacy raw JSON is found
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

function sanitizeProfile(data) {
  if (!data || typeof data !== "object") return null;
  return {
    uid: data.uid,
    fullname: data.fullname || "",
    username: data.username || "",
    profilePicture: data.profilePicture || "",
    profilePictureId: data.profilePictureId || "",
    role: data.role || "",
    verified: Boolean(data.verified),
    rating: data.rating,
    reviewCount: data.reviewCount,
    bio: data.bio || "",
  };
}

// Hydrate from storage once on load (checks sessionStorage first, then localStorage)
try {
  const rawSession =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(STORAGE_KEY)
      : null;
  const rawLocal =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_KEY)
      : null;
  const parsed = decodePayload(rawSession) || decodePayload(rawLocal);

  if (parsed && typeof parsed === "object") {
    Object.entries(parsed).forEach(([uid, data]) => {
      const sanitized = sanitizeProfile(data);
      if (sanitized && uid) {
        memoryCache.set(uid, sanitized);
      }
    });
  }

  // Immediately overwrite any legacy raw/plaintext storage with obfuscated format
  if (memoryCache.size > 0) {
    const obj = {};
    memoryCache.forEach((val, key) => {
      obj[key] = val;
    });
    const encoded = encodePayload(obj);
    if (encoded) {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, encoded);
      }
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, encoded);
      }
    }
  }
} catch {
  /* noop */
}

function persistToStorage() {
  try {
    const obj = {};
    // Keep max 200 profiles in storage
    const entries = Array.from(memoryCache.entries()).slice(-200);
    entries.forEach(([uid, data]) => {
      const sanitized = sanitizeProfile(data);
      if (sanitized) {
        obj[uid] = sanitized;
      }
    });

    const encoded = encodePayload(obj);
    if (encoded) {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, encoded);
      }
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, encoded);
      }
    }
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
  const merged = sanitizeProfile({
    ...existing,
    ...profileData,
    uid: profileData.uid || uid,
    profilePicture:
      profileData.profilePicture ||
      existing.profilePicture ||
      "",
    verified:
      profileData.verified !== undefined
        ? profileData.verified
        : existing.verified,
  });

  if (merged) {
    memoryCache.set(uid, merged);
    persistToStorage();
  }
}

export function clearUserProfileCache() {
  memoryCache.clear();
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* noop */
  }
}
