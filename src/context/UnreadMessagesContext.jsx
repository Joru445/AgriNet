import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { subscribeUserConversations } from "../services/conversation.service";

const UnreadMessagesContext = createContext({
  unreadCount: 0,
  showPopup: false,
});

export function UnreadMessagesProvider({ children }) {
  const { profile } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const rawConversationsRef = useRef([]);
  const dismissedIdRef = useRef(null);
  const popupTimerRef = useRef(null);

  const activeConvId = searchParams.get("conversation");
  const activeUserId = searchParams.get("user");
  const isMessagesRoute = location.pathname.includes("messages");

  function recalculateUnreads(conversations) {
    if (!profile?.uid || !conversations) return;

    let totalUnread = 0;
    const unreads = [];

    conversations.forEach((conv) => {
      // If user is currently looking at this conversation, ignore for red dot & popup
      const isCurrentActive =
        isMessagesRoute &&
        ((activeConvId && conv.id === activeConvId) ||
          (activeUserId && conv.participants?.includes(activeUserId)));

      if (!isCurrentActive) {
        const count = conv.unreadCount?.[profile.uid] ?? 0;
        if (count > 0) {
          totalUnread += count;
          unreads.push(conv);
        }
      }
    });

    setUnreadCount(totalUnread);

    // Clear popup if no unread messages outside the active conversation
    if (totalUnread === 0 || unreads.length === 0) {
      setShowPopup(false);
      dismissedIdRef.current = null;
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
      return;
    }

    // Show popup for newest unread from OTHER chats
    const newestUnread = unreads[0];
    const popupId = `${newestUnread.id}_${newestUnread.lastMessageAt?.seconds || Date.now()}`;

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
  }

  useEffect(() => {
    if (!profile?.uid) {
      setUnreadCount(0);
      setShowPopup(false);
      rawConversationsRef.current = [];
      dismissedIdRef.current = null;
      return;
    }

    const unsubscribe = subscribeUserConversations(
      profile.uid,
      (conversations) => {
        rawConversationsRef.current = conversations;
        recalculateUnreads(conversations);
      },
    );

    return () => {
      unsubscribe();
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, [profile?.uid, isMessagesRoute, activeConvId, activeUserId]);

  // Recalculate when user switches conversations or navigates
  useEffect(() => {
    recalculateUnreads(rawConversationsRef.current);
  }, [isMessagesRoute, activeConvId, activeUserId]);

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

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
