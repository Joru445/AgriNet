import { auth } from "../firebase/auth";
import { apiRequest } from "./api/api.client";

const DEVICE_KEY = "agrinet_device_key_v1";
const SESSION_PREFIX = "agrinet_device_session_v1_";
const registrationByUid = new Map();

function sessionError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

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
  if (!user?.uid) throw sessionError("A Firebase user is required to establish a device session.", "SESSION_USER_UNAVAILABLE");
  const inFlight = registrationByUid.get(user.uid);
  if (inFlight) return inFlight;

  const registration = (async () => {
  const key = `${SESSION_PREFIX}${user.uid}`;
  const sessionId = storageGet(key) || opaqueId();
  const deviceKey = getDeviceKey();
  if (!deviceKey) throw sessionError("Device storage is unavailable; a device session cannot be established.", "DEVICE_STORAGE_UNAVAILABLE");

  // Store before issuing the request because apiRequest centrally attaches the
  // opaque handle as X-AgriNet-Session. A failed offline request is harmless:
  // no server record has been created and the same handle is retried later.
  if (!storageSet(key, sessionId)) throw sessionError("Device storage is unavailable; a device session cannot be established.", "DEVICE_STORAGE_UNAVAILABLE");

    const result = await apiRequest("/v1/me/sessions", {
      method: "POST",
      authUser: user,
      deviceSessionId: sessionId,
      body: JSON.stringify({
      deviceKey,
      authenticationMethod: providerMethod(user),
    }),
  });
  const session = result.data?.session;
  if (!session) throw sessionError("The backend did not confirm a device session.", "SESSION_REGISTRATION_UNCONFIRMED");
  return session;
  })();
  registrationByUid.set(user.uid, registration);
  try {
    return await registration;
  } finally {
    if (registrationByUid.get(user.uid) === registration) registrationByUid.delete(user.uid);
  }
}

export function isDeviceSessionRejection(error) {
  return ["SESSION_REVOKED", "SESSION_BINDING_MISMATCH"]
    .includes(error?.data?.code || error?.code);
}
