import {
  createContext,
  useContext,
  useEffect,
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

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);

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

            setProfile(null);
            setFarmer(null);
            setLoading(false);
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
        loading,

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