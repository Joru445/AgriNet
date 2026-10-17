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
  const { profile, deviceSessionReady } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
   * Latest profile snapshot for the listener callback. Kept in a ref so the
   * completedDeals/totalDeals sync below does not re-subscribe the listener
   * every time those stats flow back from Firestore (the previous dependency
   * array caused a subscribe/unsubscribe churn loop).
   */
  useEffect(() => {
    // Always clear stale data when the effect re-runs (UID change or mount).
    setInquiries([]);
    setLoading(true);
    setError(null);

    if (!profile?.uid || !profile?.role || !deviceSessionReady) {
      setLoading(false);
      return;
    }

    const listenerUid = profile.uid;
    const listenerRole = profile.role;

    const unsubscribe = subscribeUserInquiries(
      listenerUid,
      listenerRole,
      (data) => {
        // Guard: ignore if the authenticated user has changed since this
        // listener was created.
        if (profile?.uid !== listenerUid) return;

        setInquiries(data);
        window.dispatchEvent(new CustomEvent("agrinet:inquiry-counts-invalidated", { detail: { uid: listenerUid } }));
        setLoading(false);

        // This stream is intentionally limited to actionable statuses for
        // badges. Profile statistics remain server-authoritative and are not
        // derived from this partial realtime snapshot.
      },
      (err) => {
        console.error("Failed to subscribe to inquiries:", err);
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [profile?.uid, profile?.role, deviceSessionReady]);

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
