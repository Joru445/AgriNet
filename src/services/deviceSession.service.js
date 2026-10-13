import { auth } from "../firebase/auth";
import { apiRequest } from "./api/api.client";

const DEVICE_KEY = "agrinet_device_key_v1";
const SESSION_PREFIX = "agrinet_device_session_v1_";

function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}

function storageRemove(key) {
  try { localStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
}

function opaqueId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(24);
  globalThis.crypto?.getRandomValues?.(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getDeviceKey() {
  const existing = storageGet(DEVICE_KEY);
  if (existing) return existing;
  const next = opaqueId();
  return storageSet(DEVICE_KEY, next) ? next : "";
}

export function getCurrentDeviceSessionId(uid = auth.currentUser?.uid) {
  return uid ? storageGet(`${SESSION_PREFIX}${uid}`) : null;
}

export function clearDeviceSession(uid = auth.currentUser?.uid) {
  if (uid) storageRemove(`${SESSION_PREFIX}${uid}`);
}

function providerMethod(user) {
  const providers = user?.providerData?.map((entry) => entry.providerId) || [];
  if (providers.includes("google.com")) return "Google";
  if (providers.includes("facebook.com")) return "Facebook";
  if (providers.includes("phone")) return "Phone";
  if (providers.includes("password")) return "Password";
  return "Firebase";
}

/**
 * Register or restore one opaque, server-managed session for the active
 * Firebase account on this browser profile. The local value is a session
 * handle, never a Firebase credential, refresh token, or password.
 */
export async function ensureCurrentDeviceSession(user = auth.currentUser) {
  if (!user?.uid) return null;
  const key = `${SESSION_PREFIX}${user.uid}`;
  const sessionId = storageGet(key) || opaqueId();
  const deviceKey = getDeviceKey();
  if (!deviceKey) return null;

  // Store before issuing the request because apiRequest centrally attaches the
  // opaque handle as X-AgriNet-Session. A failed offline request is harmless:
  // no server record has been created and the same handle is retried later.
  if (!storageSet(key, sessionId)) return null;

  const result = await apiRequest("/v1/me/sessions", {
    method: "POST",
    body: JSON.stringify({
      deviceKey,
      authenticationMethod: providerMethod(user),
    }),
  });
  return result.data?.session || null;
}

export function isDeviceSessionRejection(error) {
  return ["SESSION_REVOKED", "SESSION_NOT_FOUND", "SESSION_BINDING_MISMATCH"]
    .includes(error?.data?.code || error?.code);
}
