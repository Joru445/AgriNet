import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
  NOTIFICATIONS_PAGE_SIZE,
  apiGetNotifications,
  apiMarkAllNotificationsRead,
  apiMarkNotificationRead,
  buildNotificationsCursor,
  subscribeUnreadNotifications,
  subscribeUserNotifications,
} from "../services/notification.service";

const NotificationsContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: true,
  loadingMore: false,
  hasMore: false,
  loadMoreNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

/**
 * Merges the realtime first page (newest notifications) into the accumulated
 * list while preserving already-loaded older pages. Snapshot items are
 * authoritative for the newest slot; older paginated items are kept as-is.
 */
function mergeFirstPage(current, firstPage) {
  const firstPageIds = new Set(firstPage.map((n) => n.id));
  const retained = current.filter((n) => !firstPageIds.has(n.id));
  return [...firstPage, ...retained];
}

export function NotificationsProvider({ children }) {
  const { profile } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Once the user requests a next page, cursor/hasMore become the API's
  // responsibility and the realtime listener stops overwriting them.
  const hasLoadedPagesRef = useRef(false);

  useEffect(() => {
    hasLoadedPagesRef.current = false;

    if (!profile?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setLoadingMore(false);
      setCursor(null);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setCursor(null);
    setHasMore(false);

    const unsubscribeList = subscribeUserNotifications(
      profile.uid,
      (data) => {
        setNotifications((current) => mergeFirstPage(current, data));

        if (!hasLoadedPagesRef.current) {
          setCursor(buildNotificationsCursor(data[data.length - 1]));
          setHasMore(data.length === NOTIFICATIONS_PAGE_SIZE);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Failed to load notifications:", error);
        setLoading(false);
      },
    );

    const unsubscribeUnread = subscribeUnreadNotifications(
      profile.uid,
      setUnreadCount,
      (error) => {
        console.error("Failed to load unread notifications:", error);
      },
    );

    return () => {
      unsubscribeList();
      unsubscribeUnread();
    };
  }, [profile?.uid]);

  const loadMoreNotifications = useCallback(async () => {
    if (!profile?.uid || loadingMore || !hasMore) return;

    hasLoadedPagesRef.current = true;
    setLoadingMore(true);

    try {
      const result = await apiGetNotifications({
        cursor,
        limit: NOTIFICATIONS_PAGE_SIZE,
      });

      setNotifications((current) => {
        const existing = new Set(current.map((n) => n.id));
        const fresh = result.notifications.filter((n) => !existing.has(n.id));
        return [...current, ...fresh];
      });

      setCursor(result.cursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load more notifications:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [profile?.uid, loadingMore, hasMore, cursor]);

  const markAsRead = useCallback(async (notification) => {
    if (!notification || notification.read) return;
    await apiMarkNotificationRead(notification.id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!profile?.uid) return;
    await apiMarkAllNotificationsRead();
  }, [profile?.uid]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      loadingMore,
      hasMore,
      loadMoreNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      loadingMore,
      hasMore,
      loadMoreNotifications,
      markAsRead,
      markAllAsRead,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotificationsContext() {
  return useContext(NotificationsContext);
}