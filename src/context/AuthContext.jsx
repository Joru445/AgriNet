import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

import { getFarmerById } from "../services/farmer.service";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  async function logout() {
    await signOut(auth);
  }

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Clean up the previous user profile listener.
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        // User logged out.
        if (!firebaseUser) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        setUser(firebaseUser);

        const userRef = doc(
          db,
          "users",
          firebaseUser.uid,
        );

        // Listen to the user's profile in real time.
        unsubscribeProfile = onSnapshot(
          userRef,
          async (snapshot) => {
            try {
              if (!snapshot.exists()) {
                setProfile(null);
                setLoading(false);
                return;
              }

              const userData = {
                uid: snapshot.id,
                ...snapshot.data(),
              };

              let combinedProfile = userData;

              // Load farmer-specific data.
              if (userData.role === "farmer") {
                const farmer = await getFarmerById(
                  firebaseUser.uid,
                );

                combinedProfile = {
                  ...userData,
                  ...farmer,
                };
              }

              setProfile(combinedProfile);
              setLoading(false);
            } catch (error) {
              console.error(
                "Failed to load user profile:",
                error,
              );

              setProfile(null);
              setLoading(false);
            }
          },
          (error) => {
            console.error(
              "Failed to listen to user profile:",
              error,
            );

            setProfile(null);
            setLoading(false);
          },
        );
      },
    );

    return () => {
      unsubscribeAuth();

      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,

        // Useful for route protection and UI.
        suspended: profile?.status === "suspended",

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);