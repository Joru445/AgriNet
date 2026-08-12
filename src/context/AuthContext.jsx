import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../firebase/auth";
import { getFarmerById } from "../services/farmer.service";
import { getUserProfile } from "../services/user.service";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  async function logout() {
    await signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const user = await getUserProfile(firebaseUser.uid);

      let profile = user;

      if (user.role === "farmer") {
        const farmer = await getFarmerById(firebaseUser.uid);

        profile = {
          ...user,
          ...farmer,
        };
      }

      setUser(firebaseUser);
      setProfile(profile);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// This hook intentionally shares the context with the provider in this module.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
