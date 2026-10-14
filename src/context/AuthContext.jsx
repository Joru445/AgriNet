import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { beforeAuthStateChanged, onAuthStateChanged, signOut, reload } from "firebase/auth";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { auth, authPersistenceReady } from "../firebase/auth";
import { db } from "../firebase/firestore";
import { apiSyncTransactionStats } from "../services/user.service";
import { getCachedUserProfile } from "../utils/userProfileCache";
import { getSavedAccounts, saveAccount } from "../services/savedAccounts.service";
import {
  pruneRetainedSessions,
  removeRetainedSession,
  retainCurrentSession,
  signOutAllRetainedSessions,
} from "../services/multiAccountSession.service";
import * as pageCache from "../utils/pageCache";
import { recordAuthDiagnostic } from "../utils/authDiagnostics";
import {
  clearDeviceSession,
  ensureCurrentDeviceSession,
  isDeviceSessionRejection,
} from "../services/deviceSession.service";
import { setCachedUserProfile } from "../utils/userProfileCache";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  // Firebase identity and backend/session reachability are intentionally
  // distinct. An offline PWA must not keep the whole shell in a loader.
  const [backendStatus, setBackendStatus] = useState("pending");
  // `ready` means the backend has confirmed the opaque device session for
  // this exact Firebase account. Authenticated streams must wait for it.
  const [deviceSessionStatus, setDeviceSessionStatus] = useState("idle");

  // true until Firebase Auth has restored the persisted session (or confirmed
  // there is none). During this window NOTHING may render as "signed out".
  // Offline never flips this to a signed-out state.
  const [authInitializing, setAuthInitializing] = useState(true);

  // true while the full authenticated state (auth + profile/farmer) has not
  // been determined yet. Route guards use it to wait instead of redirecting.
  const [loading, setLoading] = useState(true);

  // Track one-time operations per auth session to avoid repeated Firestore writes.
  // apiSyncTransactionStats must run once after login,
  // not on every profile snapshot emission (which would cause a feedback loop).
  const statsSyncedRef = useRef(false);
  const activeUidRef = useRef(null);
  const hadAuthenticatedSessionRef = useRef(false);
  const explicitLogoutRef = useRef(false);
  const missingSessionRecoveryRef = useRef(new Set());

  async function logout() {
    explicitLogoutRef.current = true;
    if (auth.currentUser?.uid) await removeRetainedSession(auth.currentUser.uid);
    await signOut(auth);
  }

  async function logoutAllAccounts() {
    explicitLogoutRef.current = true;
    await signOutAllRetainedSessions();
  }

  async function refreshAuthUser() {
    if (!auth.currentUser) {
      return null;
    }
    await reload(auth.currentUser);
    const refreshed = auth.currentUser;
    setUser(refreshed);
    setEmailVerified(Boolean(refreshed.emailVerified));
    return refreshed;
  }

  useEffect(() => {
    let unsubscribeProfile = null;
    let unsubscribeFarmer = null;
    let disposed = false;

    const unsubscribeBeforeAuth = beforeAuthStateChanged(auth, () => {
      // Do not let the previous account's private UI remain visible while
      // Firebase atomically changes the default Auth currentUser.
      setLoading(true);
      setProfile(null);
      setFarmer(null);
      setDeviceSessionStatus("pending");
    });

    let unsubscribeAuth = () => {};
    const subscribe = () => {
      if (disposed) return;
      unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Firebase Auth initialization is complete: the persisted session has
        // been restored or confirmed absent. This is the ONLY point where the
        // app may distinguish "authenticated" from "signed out".
        setAuthInitializing(false);

        const previousUid = activeUidRef.current;
        if (previousUid !== firebaseUser?.uid) {
          // All app-private page cache entries must be re-fetched for the
          // account that is becoming active.
          pageCache.clearAll();
          statsSyncedRef.current = false;
          missingSessionRecoveryRef.current.clear();
        }
        activeUidRef.current = firebaseUser?.uid || null;

        // Clean up previous listeners.
        unsubscribeProfile?.();
        unsubscribeFarmer?.();

        unsubscribeProfile = null;
        unsubscribeFarmer = null;

        if (!firebaseUser) {
          recordAuthDiagnostic(
            hadAuthenticatedSessionRef.current ? "firebase-session-ended" : "firebase-no-restored-session",
            { reason: explicitLogoutRef.current ? "explicit-logout" : "firebase-auth-state-null" },
          );
          explicitLogoutRef.current = false;
          setUser(null);
          setProfile(null);
          setFarmer(null);
          setEmailVerified(false);
          setLoading(false);
          statsSyncedRef.current = false;
          setBackendStatus("idle");
          setDeviceSessionStatus("idle");
          return;
        }

        hadAuthenticatedSessionRef.current = true;
        recordAuthDiagnostic("firebase-session-restored", { hasSession: true });
        setLoading(true);
        setUser(firebaseUser);
        setEmailVerified(Boolean(firebaseUser.emailVerified));
        setProfile(null);
        setFarmer(null);
        setBackendStatus("pending");
        setDeviceSessionStatus("pending");

        const listenerUid = firebaseUser.uid;
        // Device registration is the private-data bootstrap. Profile reads now
        // cross the API session boundary rather than a client Firestore rule.
        ensureCurrentDeviceSession(firebaseUser)
          .then((session) => {
            if (!session) throw new Error("Device session registration was not confirmed.");
            if (auth.currentUser?.uid !== listenerUid) return null;
            setDeviceSessionStatus("ready");
            globalThis.dispatchEvent?.(new CustomEvent("agrinet:device-session-ready", { detail: { uid: listenerUid } }));
            return import("../services/api/api.client").then(({ apiRequest }) => apiRequest("/v1/users/me/profile"));
          })
          .then((result) => {
            if (auth.currentUser?.uid !== listenerUid) return;
            const privateProfile = result.data;
            setProfile(privateProfile?.user || null);
            setFarmer(privateProfile?.farmer || null);
            if (privateProfile?.user) setCachedUserProfile(listenerUid, privateProfile.user);
            setBackendStatus("available");
            if (!statsSyncedRef.current && privateProfile?.user?.role === "consumer") {
              statsSyncedRef.current = true;
              apiSyncTransactionStats().catch(() => {});
            }
            setLoading(false);
          })
          .catch((error) => {
            const code = error?.data?.code || error?.code || "unknown";
            setDeviceSessionStatus(isDeviceSessionRejection(error) ? "revoked" : "unavailable");
            recordAuthDiagnostic("private-profile-unavailable", { code, status: error?.status || null, sessionReady: false });
            // Do not turn a transport outage into an auth failure or an
            // infinite loader. Only display a profile already cached for this
            // exact Firebase UID; it never authorizes new mutations.
            const cached = getCachedUserProfile(listenerUid, listenerUid);
            const saved = getSavedAccounts().find((entry) => entry.uid === listenerUid);
            setProfile(cached || (saved ? {
              uid: saved.uid,
              fullname: saved.displayName || saved.email || "",
              username: saved.username || "",
              profilePicture: saved.avatar || "",
              role: saved.role || "",
            } : null));
            setFarmer(null);
            setBackendStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "unavailable");
            setLoading(false);
          });
        return;

        const userRef = doc(
          db,
          "users",
          firebaseUser.uid,
        );

        // Capture the UID this listener was created for so stale callbacks
        // from a previous user's snapshot cannot overwrite the current state.
        const legacyListenerUid = firebaseUser.uid;

        unsubscribeProfile = onSnapshot(
          userRef,
          (snapshot) => {
            // Guard: ignore if the authenticated user has changed since this
            // listener was created (e.g. rapid account switching).
            if (auth.currentUser?.uid !== legacyListenerUid) return;

            if (!snapshot.exists()) {
              setProfile(null);
              setFarmer(null);
              setLoading(false);
              return;
            }

            const userData = {
              uid: snapshot.id,
              ...snapshot.data(),
            };

            setProfile(userData);

            // One-time operation after auth — run only once per login,
            // NOT on every profile snapshot emission. Running this on
            // every snapshot causes a feedback loop: snapshot → write → snapshot.
            if (!statsSyncedRef.current && userData.role === "consumer") {
              statsSyncedRef.current = true;
              apiSyncTransactionStats().catch(() => {});
            }

            // Only farmers need the farmer listener.
            if (userData.role !== "farmer") {
              setFarmer(null);
              setLoading(false);
              return;
            }

            const farmerRef = doc(
              db,
              "farmers",
              legacyListenerUid,
            );

            unsubscribeFarmer?.();

            unsubscribeFarmer = onSnapshot(
              farmerRef,
              (farmerSnapshot) => {
                // Guard: same check for farmer listener.
                if (auth.currentUser?.uid !== legacyListenerUid) return;

                setFarmer(
                  farmerSnapshot.exists()
                    ? {
                        uid: farmerSnapshot.id,
                        ...farmerSnapshot.data(),
                      }
                    : null,
                );

                setLoading(false);
              },
              (error) => {
                console.error(
                  "Failed to load farmer profile:",
                  error,
                );

                setFarmer(null);
                setLoading(false);
              },
            );
          },
          (error) => {
            console.error(
              "Failed to load user profile:",
              error,
            );

            // Offline/unavailable is NOT a sign-out and NOT a missing profile.
            // The authenticated identity and last known profile are retained as
            // they were; loading stays true so route guards wait instead of
            // redirecting an authenticated user to /login. Firestore retries
            // the snapshot automatically when connectivity returns.
            setLoading(true);
          },
        );
      },
      (error) => {
        // Network and Firestore errors are not sign-outs. Keep route guards in
        // loading state and allow Firebase to retry its managed session.
        recordAuthDiagnostic("firebase-auth-listener-error", { code: error?.code || "unknown", hasSession: Boolean(auth.currentUser) });
        setLoading(true);
      },
      );
    };

    // setPersistence may migrate Firebase's SDK-managed state asynchronously.
    // Subscribing only after it settles prevents a transient null user from
    // redirecting a persisted browser/PWA session to /login.
    authPersistenceReady.finally(subscribe);

    return () => {
      disposed = true;
      unsubscribeBeforeAuth();
      unsubscribeAuth();

      unsubscribeProfile?.();
      unsubscribeFarmer?.();
    };
  }, []);

  useEffect(() => {
    const handleDeviceSessionRevoked = async (event) => {
      const uid = event.detail?.uid;
      if (!uid || uid !== auth.currentUser?.uid) return;
      recordAuthDiagnostic("device-session-rejected", { reason: event.detail?.code || "unknown" });
      clearDeviceSession(uid);
      // Only the active account is removed. Named Auth instances for other
      // retained accounts remain untouched, preserving Option B isolation.
      await removeRetainedSession(uid).catch(() => {});
      await signOut(auth).catch(() => {});
    };
    globalThis.addEventListener?.("agrinet:device-session-revoked", handleDeviceSessionRevoked);
    return () => globalThis.removeEventListener?.("agrinet:device-session-revoked", handleDeviceSessionRevoked);
  }, []);

  useEffect(() => {
    const recoverMissingSession = async (event) => {
      const uid = event.detail?.uid;
      const activeUser = auth.currentUser;
      if (!uid || uid !== activeUser?.uid || missingSessionRecoveryRef.current.has(uid)) return;
      // A missing record can happen after a backend data reset or an old local
      // browser handle. It is not a revocation: discard that local handle and
      // create one replacement once while Firebase authentication is valid.
      missingSessionRecoveryRef.current.add(uid);
      clearDeviceSession(uid);
      setDeviceSessionStatus("pending");
      recordAuthDiagnostic("device-session-missing-recovery", { sessionReady: false });
      try {
        const session = await ensureCurrentDeviceSession(activeUser);
        if (!session || auth.currentUser?.uid !== uid) return;
        setDeviceSessionStatus("ready");
        globalThis.dispatchEvent?.(new CustomEvent("agrinet:device-session-ready", { detail: { uid } }));
        // Let the existing private-profile bootstrap own the protected retry.
        setTimeout(() => globalThis.dispatchEvent?.(new CustomEvent("agrinet:profile-bootstrap-complete", { detail: { uid } })), 0);
      } catch (error) {
        setDeviceSessionStatus("unavailable");
        recordAuthDiagnostic("device-session-missing-recovery-failed", { code: error?.data?.code || error?.code || "unknown", status: error?.status || null, sessionReady: false });
      }
    };
    globalThis.addEventListener?.("agrinet:device-session-missing", recoverMissingSession);
    return () => globalThis.removeEventListener?.("agrinet:device-session-missing", recoverMissingSession);
  }, []);

  useEffect(() => {
    async function retryPrivateBootstrap() {
      const activeUser = auth.currentUser;
      if (!activeUser || backendStatus === "available") return;
      try {
        await ensureCurrentDeviceSession(activeUser);
        const { apiRequest } = await import("../services/api/api.client");
        const result = await apiRequest("/v1/users/me/profile");
        if (auth.currentUser?.uid !== activeUser.uid) return;
        setProfile(result.data?.user || null);
        setFarmer(result.data?.farmer || null);
        if (result.data?.user) setCachedUserProfile(activeUser.uid, result.data.user);
        setBackendStatus("available");
        setDeviceSessionStatus("ready");
        globalThis.dispatchEvent?.(new CustomEvent("agrinet:device-session-ready", { detail: { uid: activeUser.uid } }));
      } catch {
        // The online event is advisory; retain the usable offline shell and
        // wait for the next connectivity restoration instead of signing out.
      }
    }
    const handleBootstrapComplete = (event) => {
      if (event.detail?.uid === auth.currentUser?.uid) retryPrivateBootstrap();
    };
    window.addEventListener("online", retryPrivateBootstrap);
    globalThis.addEventListener?.("agrinet:profile-bootstrap-complete", handleBootstrapComplete);
    return () => {
      window.removeEventListener("online", retryPrivateBootstrap);
      globalThis.removeEventListener?.("agrinet:profile-bootstrap-complete", handleBootstrapComplete);
    };
  }, [backendStatus]);

  // Persist just enough local metadata to offer a later sign-in choice. No
  // password, OAuth credential, or Firebase token is ever written here.
  useEffect(() => {
    if (!user?.uid || profile?.uid !== user.uid) return;
    const providers = [...new Set(
      (user.providerData || [])
        .map((provider) => provider.providerId)
        .filter((provider) => ["password", "google.com", "facebook.com"].includes(provider)),
    )];
    const accounts = saveAccount({
      uid: user.uid,
      email: user.email || profile.email || "",
      displayName: profile.fullname || user.displayName || "",
      username: profile.username || "",
      avatar: profile.profilePicture || user.photoURL || "",
      role: profile.role || "consumer",
      provider: providers[0] || null,
      providers,
    });
    retainCurrentSession(user).catch((error) => {
      // A failure to create one retained session must never log out this
      // account or mutate the independently retained sessions of other users.
      recordAuthDiagnostic("quick-switch-retention-unavailable", { code: error?.code || "unknown" });
    });
    pruneRetainedSessions(accounts.map((entry) => entry.uid)).catch(() => {});
    ensureCurrentDeviceSession(user).catch((error) => {
      // A registry outage or offline launch must never be interpreted as a
      // Firebase logout. A known revoked handle is the one exception.
      if (isDeviceSessionRejection(error)) {
        clearDeviceSession(user.uid);
      }
      recordAuthDiagnostic("device-session-registration-unavailable", {
        code: error?.data?.code || error?.code || "unknown",
      });
    });
  }, [user, profile]);

  const account = profile
    ? {
        ...profile,
        ...(farmer ?? {}),
      }
    : null;

  /**
   * Display identity for the current user.
   *
   * Prefers the live Firestore profile. When the profile has not been resolved
   * yet (offline, pending snapshot, failed API refresh), it falls back to the
   * last-known cached profile, then to saved-account metadata, then to the
   * Firebase user itself. This is IDENTITY — never a synthetic "authenticated"
   * flag — so authenticated users are never shown Login / Sign Up merely
   * because Firestore/API data could not be fetched.
   */
  const identity = useMemo(() => {
    if (!user) return null;
    if (profile) return profile;

    const cached = user.uid
      ? getCachedUserProfile(user.uid, user.uid)
      : null;
    if (cached) return cached;

    const saved = getSavedAccounts().find((entry) => entry.uid === user.uid);
    if (saved) {
      return {
        uid: saved.uid,
        fullname: saved.displayName || saved.email || "",
        username: "",
        profilePicture: saved.avatar || "",
        role: saved.role || "",
      };
    }

    return {
      uid: user.uid,
      fullname: user.displayName || user.email || "",
      username: "",
      profilePicture: user.photoURL || "",
      role: "",
    };
  }, [user, profile]);

  // Firebase Auth is the single source of truth for verification states
  const phoneVerified = Boolean(
    user?.phoneNumber ||
      user?.providerData?.some((p) => p.providerId === "phone")
  );

  const isEmailVerified = Boolean(user?.emailVerified || emailVerified);

  // Phone verification is REQUIRED to access the application; email verification is OPTIONAL
  const verificationComplete = phoneVerified;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        farmer,
        account,
        identity,

        // True until Firebase Auth has restored the persisted session. While
        // true, consumers must never render "signed out" / Login UI.
        authInitializing,
        // True while the full authenticated state is still being determined
        // (auth initialization and/or profile load). Route guards wait on this.
        loading,
        profileLoading: loading && !authInitializing,
        backendStatus,
        deviceSessionStatus,
        deviceSessionReady: deviceSessionStatus === "ready",

        suspended: profile?.status === "suspended",
        emailVerified: isEmailVerified,
        phoneVerified,
        verificationComplete,

        refreshAuthUser,
        refreshUser: refreshAuthUser,
        reloadUser: refreshAuthUser,

        logout,
        logoutAllAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
