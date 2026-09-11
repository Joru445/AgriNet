import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { onAuthStateChanged, signOut, reload } from "firebase/auth";
import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";
import { apiSyncTransactionStats } from "../services/user.service";
import { getCachedUserProfile } from "../utils/userProfileCache";
import { getSavedAccounts } from "../services/savedAccounts.service";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);

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

  async function logout() {
    await signOut(auth);
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

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Firebase Auth initialization is complete: the persisted session has
        // been restored or confirmed absent. This is the ONLY point where the
        // app may distinguish "authenticated" from "signed out".
        setAuthInitializing(false);

        // Clean up previous listeners.
        unsubscribeProfile?.();
        unsubscribeFarmer?.();

        unsubscribeProfile = null;
        unsubscribeFarmer = null;

        if (!firebaseUser) {
          setUser(null);
          setProfile(null);
          setFarmer(null);
          setEmailVerified(false);
          setLoading(false);
          statsSyncedRef.current = false;
          return;
        }

        setLoading(true);
        setUser(firebaseUser);
        setEmailVerified(Boolean(firebaseUser.emailVerified));
        setProfile(null);
        setFarmer(null);

        const userRef = doc(
          db,
          "users",
          firebaseUser.uid,
        );

        unsubscribeProfile = onSnapshot(
          userRef,
          (snapshot) => {
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
              firebaseUser.uid,
            );

            unsubscribeFarmer?.();

            unsubscribeFarmer = onSnapshot(
              farmerRef,
              (farmerSnapshot) => {
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
    );

    return () => {
      unsubscribeAuth();

      unsubscribeProfile?.();
      unsubscribeFarmer?.();
    };
  }, []);

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

        suspended: profile?.status === "suspended",
        emailVerified: isEmailVerified,
        phoneVerified,
        verificationComplete,

        refreshAuthUser,
        refreshUser: refreshAuthUser,
        reloadUser: refreshAuthUser,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);