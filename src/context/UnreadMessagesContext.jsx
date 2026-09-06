import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useConversationsContext } from "./ConversationsContext";

const UnreadMessagesContext = createContext({
  unreadCount: 0,
  showPopup: false,
});

export function UnreadMessagesProvider({ children }) {
  const { profile } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { conversations } = useConversationsContext();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const dismissedIdRef = useRef(null);
  const popupTimerRef = useRef(null);

  const activeConvId = searchParams.get("conversation");
  const activeUserId = searchParams.get("user");
  const isMessagesRoute = location.pathname.includes("messages");

  const recalculateUnreads = useCallback(() => {
    if (!profile?.uid || !conversations) {
      setUnreadCount(0);
      setShowPopup(false);
      return;
    }

    let totalUnread = 0;
    const unreads = [];

    conversations.forEach((conv) => {
      const isCurrentActive =
        isMessagesRoute &&
        ((activeConvId && conv.id === activeConvId) ||
          (activeUserId && conv.participants?.includes(activeUserId)));

      if (!isCurrentActive) {
        const count = conv.unreadCount?.[profile.uid] ?? 0;
        if (count > 0) {
          totalUnread += 1;
          unreads.push(conv);
        }
      }
    });

    setUnreadCount(totalUnread);

    if (totalUnread === 0 || unreads.length === 0) {
      setShowPopup(false);
      dismissedIdRef.current = null;
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
      return;
    }

    const newestUnread = unreads[0];
    const lastTime =
      newestUnread.lastMessageAt?.seconds ||
      (newestUnread.lastMessageAt?.toMillis
        ? newestUnread.lastMessageAt.toMillis()
        : newestUnread.lastMessage || "latest");
    const popupId = `${newestUnread.id}_${lastTime}`;

    if (dismissedIdRef.current !== popupId) {
      dismissedIdRef.current = popupId;
      setShowPopup(true);

      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }

      popupTimerRef.current = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    }
  }, [profile?.uid, conversations, isMessagesRoute, activeConvId, activeUserId]);

  const recalculateUnreadsRef = useRef(recalculateUnreads);

  useEffect(() => {
    recalculateUnreadsRef.current = recalculateUnreads;
  });

  useEffect(() => {
    recalculateUnreads();
  }, [recalculateUnreads]);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCount,
        showPopup,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
