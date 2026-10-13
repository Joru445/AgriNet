import { deleteApp, getApp, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  reload,
  setPersistence,
  signOut,
  updateCurrentUser,
} from "firebase/auth";

import { auth } from "../firebase/auth";
import { firebaseConfig } from "../firebase/config";

const APP_PREFIX = "agrinet-retained-session-";
const REGISTRY_KEY = "agrinet_retained_session_uids";
const MAX_RETAINED_SESSIONS = 5;
const authPromises = new Map();
let switchQueue = Promise.resolve();

function appName(uid) {
  // Firebase App names cannot contain brackets or whitespace. Firebase UIDs
  // are normally URL-safe, but encoding makes this invariant explicit.
  return `${APP_PREFIX}${encodeURIComponent(uid)}`;
}

function getRegistry() {
  try {
    const value = JSON.parse(localStorage.getItem(REGISTRY_KEY) || "[]");
    return Array.isArray(value)
      ? [...new Set(value.filter((uid) => typeof uid === "string" && uid))]
      : [];
  } catch {
    return [];
  }
}

function setRegistry(uids) {
  try {
    localStorage.setItem(
      REGISTRY_KEY,
      JSON.stringify([...new Set(uids.filter(Boolean))].slice(0, MAX_RETAINED_SESSIONS)),
    );
  } catch {
    // Session availability is an enhancement. Firebase Auth remains usable
    // when device storage is unavailable.
  }
}

async function getRetainedAuth(uid) {
  if (!uid) throw new Error("A Firebase UID is required for a retained session.");
  if (authPromises.has(uid)) return authPromises.get(uid);

  const promise = (async () => {
    let secondaryApp;
    const name = appName(uid);
    try {
      secondaryApp = getApp(name);
    } catch {
      secondaryApp = initializeApp(firebaseConfig, name);
    }
    const secondaryAuth = getAuth(secondaryApp);
    await setPersistence(secondaryAuth, browserLocalPersistence);
    await secondaryAuth.authStateReady();
    return { secondaryApp, secondaryAuth };
  })();

  authPromises.set(uid, promise);
  try {
    return await promise;
  } catch (error) {
    authPromises.delete(uid);
    throw error;
  }
}

async function serializeSwitch(operation) {
  const next = switchQueue.then(operation, operation);
  switchQueue = next.catch(() => {});
  return next;
}

/**
 * Copies the Firebase SDK-managed session into a named same-project Auth
 * instance. No token or credential is read, serialized, or stored by AgriNet.
 */
export async function retainCurrentSession(user = auth.currentUser) {
  if (!user?.uid) return false;

  const { secondaryAuth } = await getRetainedAuth(user.uid);
  if (secondaryAuth.currentUser?.uid !== user.uid) {
    // Firebase validates same-project / tenant compatibility and creates its
    // own User copy. It rejects expired or cross-project identities.
    await updateCurrentUser(secondaryAuth, user);
  }

  if (secondaryAuth.currentUser?.uid !== user.uid) {
    throw new Error("The retained Firebase session does not match the active account.");
  }

  // Most recently active first; when the bound is reached, retain the active
  // session rather than silently dropping the account the user just signed in.
  setRegistry([user.uid, ...getRegistry().filter((uid) => uid !== user.uid)]);
  return true;
}

export async function getRetainedSessionStatus(uid) {
  if (!uid || !getRegistry().includes(uid)) return "reauthentication-required";
  try {
    const { secondaryAuth } = await getRetainedAuth(uid);
    return secondaryAuth.currentUser?.uid === uid
      ? "available"
      : "reauthentication-required";
  } catch {
    return "reauthentication-required";
  }
}

/**
 * Atomically activates a retained Firebase session on the default Auth
 * instance. `reload` validates the session before it can become active.
 */
export function activateRetainedSession(uid) {
  return serializeSwitch(async () => {
    const { secondaryAuth } = await getRetainedAuth(uid);
    const retainedUser = secondaryAuth.currentUser;
    if (!retainedUser || retainedUser.uid !== uid) {
      throw new Error("A valid retained session is not available for this account.");
    }

    try {
      await reload(retainedUser);
      await retainedUser.getIdToken(true);
      await updateCurrentUser(auth, retainedUser);
    } catch (error) {
      await removeRetainedSession(uid);
      throw error;
    }

    if (auth.currentUser?.uid !== uid) {
      await signOut(auth);
      throw new Error("The activated Firebase session did not match the selected account.");
    }
    return auth.currentUser;
  });
}

export async function removeRetainedSession(uid) {
  if (!uid) return;
  setRegistry(getRegistry().filter((entry) => entry !== uid));

  try {
    const { secondaryApp, secondaryAuth } = await getRetainedAuth(uid);
    await signOut(secondaryAuth);
    authPromises.delete(uid);
    await deleteApp(secondaryApp);
  } catch {
    // The registry removal prevents future use; Firebase's persistence will be
    // overwritten on the next named-auth initialization if cleanup was raced.
    authPromises.delete(uid);
  }
}

export async function pruneRetainedSessions(allowedUids) {
  const allowed = new Set((allowedUids || []).filter(Boolean));
  const stale = getRegistry().filter((uid) => !allowed.has(uid));
  await Promise.all(stale.map((uid) => removeRetainedSession(uid)));
}

export async function signOutAllRetainedSessions() {
  await Promise.all(getRegistry().map((uid) => removeRetainedSession(uid)));
  if (auth.currentUser) await signOut(auth);
}
