import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useInquiriesContext } from "./InquiriesContext";

const UnreadInquiriesContext = createContext({
  inquiryActionCount: 0,
  showInquiryPopup: false,
  inquiryPopupMessage: "",
  acknowledgeInquiry: () => {},
});

/**
 * Returns the popup message for an inquiry state.
 * For consumer, 'ongoing' shows ONLY the popup message.
 */
function getActionMessage(inq, role) {
  if (!inq) return null;
  const status = inq.status === "resolved" ? "completed" : inq.status;
  const isReviewed =
    inq.reviewed === true ||
    Boolean(inq.farmerReviewId) ||
    Boolean(inq.productReviewId);

  if (role === "consumer") {
    if (status === "accepted") return "Farmer accepted your inquiry!";
    if (status === "ongoing") return "Transaction is ongoing";
    if (status === "awaiting_proof") return "Please upload transaction proof";
    if (status === "completed" && !isReviewed) return "Transaction done! Rate the product.";
  }

  if (role === "farmer") {
    if (status === "accepted") return "New inquiry accepted — start the transaction!";
    if (status === "proof_submitted") return "Consumer submitted proof — review it!";
  }

  return null;
}

/**
 * Returns whether this inquiry should display a red dot badge on the icon/button.
 * Consumer 'ongoing' only triggers popup, NOT the red dot.
 */
function hasActionBadge(inq, role) {
  if (!inq) return false;
  const status = inq.status === "resolved" ? "completed" : inq.status;
  const isReviewed =
    inq.reviewed === true ||
    Boolean(inq.farmerReviewId) ||
    Boolean(inq.productReviewId);

  if (role === "consumer") {
    if (status === "accepted") return true;
    if (status === "ongoing") return true;
    if (status === "awaiting_proof") return true;
    if (status === "completed" && !isReviewed) return true;
  }

  if (role === "farmer") {
    if (status === "accepted") return true;
    if (status === "proof_submitted") return true;
  }

  return false;
}

function makeKey(inquiryId, status, updatedAt) {
  const timeKey =
    typeof updatedAt === "object" && updatedAt?.seconds
      ? updatedAt.seconds
      : updatedAt || "";
  return `${inquiryId}_${status}_${timeKey}`;
}

export function UnreadInquiriesProvider({ children }) {
  const { profile } = useAuth();
  const { inquiries } = useInquiriesContext();

  const [inquiryActionCount, setInquiryActionCount] = useState(0);
  const [showInquiryPopup, setShowInquiryPopup] = useState(false);
  const [inquiryPopupMessage, setInquiryPopupMessage] = useState("");

  const seenPopupsRef = useRef(new Set());
  const popupTimerRef = useRef(null);

  useEffect(() => {
    if (!profile?.uid || !profile?.role || !inquiries) {
      setInquiryActionCount(0);
      setShowInquiryPopup(false);
      return;
    }

    const actionableBadges = (inquiries || []).filter((inq) => {
      return hasActionBadge(inq, profile.role);
    });
    setInquiryActionCount(actionableBadges.length);

    const popupItems = (inquiries || []).filter((inq) => {
      return Boolean(getActionMessage(inq, profile.role));
    });

    if (popupItems.length === 0) {
      setShowInquiryPopup(false);
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      return;
    }

    const newestNewAction = popupItems.find((inq) => {
      const key = makeKey(inq.id, inq.status, inq.updatedAt || inq.createdAt);
      return !seenPopupsRef.current.has(key);
    });

    if (newestNewAction) {
      const popupKey = makeKey(
        newestNewAction.id,
        newestNewAction.status,
        newestNewAction.updatedAt || newestNewAction.createdAt,
      );
      seenPopupsRef.current.add(popupKey);

      const message = getActionMessage(newestNewAction, profile.role);

      if (message) {
        setInquiryPopupMessage(message);
        setShowInquiryPopup(true);

        if (popupTimerRef.current) clearTimeout(popupTimerRef.current);

        popupTimerRef.current = setTimeout(() => {
          setShowInquiryPopup(false);
        }, 5000);
      }
    }
  }, [inquiries, profile?.uid, profile?.role]);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, []);

  const acknowledgeInquiry = useCallback((inquiryId, status, updatedAt) => {
    const key = makeKey(inquiryId, status, updatedAt);
    seenPopupsRef.current.add(key);
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

// eslint-disable-next-line react-refresh/only-export-components
export function useUnreadInquiries() {
  return useContext(UnreadInquiriesContext);
}
