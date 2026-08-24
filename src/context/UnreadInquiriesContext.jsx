import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { subscribeUserInquiries } from "../services/inquiry.service";

const UnreadInquiriesContext = createContext({
  inquiryActionCount: 0,
  showInquiryPopup: false,
  inquiryPopupMessage: "",
  acknowledgeInquiry: () => {},
});

/**
 * Determines if an inquiry needs the current user's attention.
 * Returns a popup message string if it does, otherwise null.
 */
function getActionMessage(status, role, isReviewed) {
  const normalized = status === "resolved" ? "completed" : status;

  if (role === "consumer") {
    if (normalized === "accepted") return "Farmer accepted your inquiry!";
    if (normalized === "ongoing") return "Transaction is ongoing";
    if (normalized === "awaiting_proof") return "Please upload the product you received.";
    if (normalized === "completed" && !isReviewed) return "Transaction done! Rate the product.";
  }

  if (role === "farmer") {
    if (normalized === "accepted") return "New inquiry accepted — start the transaction!";
    if (normalized === "ongoing") return "Transaction is ongoing";
    if (normalized === "proof_submitted") return "Consumer submitted proof — review it!";
  }

  return null;
}

function makeKey(inquiryId, status) {
  return `${inquiryId}_${status}`;
}

export function UnreadInquiriesProvider({ children }) {
  const { profile } = useAuth();
  const [inquiryActionCount, setInquiryActionCount] = useState(0);
  const [showInquiryPopup, setShowInquiryPopup] = useState(false);
  const [inquiryPopupMessage, setInquiryPopupMessage] = useState("");

  // In-memory set of dismissed "inquiryId_status" keys (session only)
  const dismissedRef = useRef(new Set());
  const popupTimerRef = useRef(null);

  useEffect(() => {
    if (!profile?.uid || !profile?.role) {
      setInquiryActionCount(0);
      setShowInquiryPopup(false);
      return;
    }

    const unsubscribe = subscribeUserInquiries(
      profile.uid,
      profile.role,
      (inquiries) => {
        const dismissed = dismissedRef.current;

        const actionable = inquiries.filter((inq) => {
          const isReviewed =
            inq.reviewed === true ||
            Boolean(inq.farmerReviewId) ||
            Boolean(inq.productReviewId);
          const msg = getActionMessage(inq.status, profile.role, isReviewed);
          if (!msg) return false;
          // If user acknowledged this specific inquiry+status, don't count it
          return !dismissed.has(makeKey(inq.id, inq.status));
        });

        setInquiryActionCount(actionable.length);

        if (actionable.length === 0) {
          setShowInquiryPopup(false);
          if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
          return;
        }

        // Pick the top actionable inquiry for the popup
        const topInquiry = actionable[0];
        const isReviewed =
          topInquiry.reviewed === true ||
          Boolean(topInquiry.farmerReviewId) ||
          Boolean(topInquiry.productReviewId);
        const message = getActionMessage(topInquiry.status, profile.role, isReviewed);
        const popupKey = makeKey(topInquiry.id, topInquiry.status);

        // Show popup only for newly encountered keys
        if (!dismissed.has(popupKey) && message) {
          setInquiryPopupMessage(message);
          setShowInquiryPopup(true);

          if (popupTimerRef.current) clearTimeout(popupTimerRef.current);

          // Auto-dismiss after 5 seconds
          popupTimerRef.current = setTimeout(() => {
            setShowInquiryPopup(false);
          }, 5000);
        }
      },
    );

    return () => {
      unsubscribe();
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, [profile?.uid, profile?.role]);

  /**
   * Call this when the user clicks an action button on an inquiry card.
   * It marks that inquiry+status as acknowledged so the red dot disappears.
   */
  const acknowledgeInquiry = useCallback((inquiryId, status) => {
    const key = makeKey(inquiryId, status);
    dismissedRef.current.add(key);

    // Immediately re-evaluate count without waiting for Firestore
    setInquiryActionCount((prev) => Math.max(0, prev - 1));
    setShowInquiryPopup(false);
  }, []);

  return (
    <UnreadInquiriesContext.Provider
      value={{
        inquiryActionCount,
        showInquiryPopup,
        inquiryPopupMessage,
        acknowledgeInquiry,
      }}
    >
      {children}
    </UnreadInquiriesContext.Provider>
  );
}

export function useUnreadInquiries() {
  return useContext(UnreadInquiriesContext);
}
