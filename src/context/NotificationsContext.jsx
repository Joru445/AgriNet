import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
  apiMarkAllNotificationsRead,
  apiMarkNotificationRead,
  subscribeUserNotifications,
} from "../services/notification.service";

const NotificationsContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: true,
});

export function NotificationsProvider({ children }) {
  const { profile } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeUserNotifications(
      profile.uid,
      (data) => {
        setNotifications(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load notifications:", error);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [profile?.uid]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

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
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount, loading, markAsRead, markAllAsRead],
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
