import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [farmer, setFarmer] = useState(null);

  const [loading, setLoading] = useState(true);

  async function logout() {
    await signOut(auth);
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
          setLoading(false);
          return;
        }

        setLoading(true);
        setUser(firebaseUser);
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

            // Auto-sync consumer transaction stats into their profile document
            if (userData.role === "consumer") {
              getDocs(
                query(
                  collection(db, "inquiries"),
                  where("consumerId", "==", firebaseUser.uid),
                ),
              )
                .then((snap) => {
                  const total = snap.docs.length;
                  const completed = snap.docs.filter((d) => {
                    const st = d.data().status;
                    return st === "completed" || st === "resolved";
                  }).length;
                  const cancelled = snap.docs.filter(
                    (d) => d.data().status === "cancelled",
                  ).length;

                  if (
                    userData.completedDeals !== completed ||
                    userData.totalDeals !== total ||
                    userData.cancelledDeals !== cancelled
                  ) {
                    updateDoc(userRef, {
                      completedDeals: completed,
                      totalDeals: total,
                      cancelledDeals: cancelled,
                    }).catch(() => {});
                  }
                })
                .catch(() => {});
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

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        farmer,
        account,
        loading,

        suspended: profile?.status === "suspended",

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);