import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
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

        // Keep the consumer's completedDeals and totalDeals synced in Firestore
        // so farmers viewing their profile see real-time transaction stats
        if (profile.role === "consumer" && Array.isArray(data)) {
          const completed = data.filter(
            (i) => i.status === "completed" || i.status === "resolved",
          ).length;
          const total = data.length;
          const cancelled = data.filter(
            (i) => i.status === "cancelled",
          ).length;

          if (
            profile.completedDeals !== completed ||
            profile.totalDeals !== total
          ) {
            updateDoc(doc(db, "users", profile.uid), {
              completedDeals: completed,
              totalDeals: total,
              cancelledDeals: cancelled,
            }).catch(() => {});
          }
        }
      },
      (err) => {
        console.error("Failed to subscribe to inquiries:", err);
        setInquiries([]);
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [profile?.uid, profile?.role, profile?.completedDeals, profile?.totalDeals]);

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
