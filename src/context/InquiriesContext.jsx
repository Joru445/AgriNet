import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { subscribeUserInquiries } from "../services/inquiry.service";

const InquiriesContext = createContext({
  inquiries: [],
  loading: true,
  error: null,
});

/**
 * Single onSnapshot subscription for the authenticated user's inquiries.
 *
 * Both useInquiries and UnreadInquiriesContext share this one subscription
 * instead of each creating their own independent listener.
 *
 * This reduces Firestore reads by 50% for the inquiries collection.
 */
export function InquiriesProvider({ children }) {
  const { profile } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profile?.uid || !profile?.role) {
      setInquiries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeUserInquiries(
      profile.uid,
      profile.role,
      (data) => {
        setInquiries(data);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to subscribe to inquiries:", err);
        setInquiries([]);
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [profile?.uid, profile?.role]);

  return (
    <InquiriesContext.Provider value={{ inquiries, loading, error }}>
      {children}
    </InquiriesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInquiriesContext() {
  return useContext(InquiriesContext);
}
