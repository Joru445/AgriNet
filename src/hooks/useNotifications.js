import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  markAllNotificationsRead,
  markNotificationRead,
  subscribeUserNotifications,
} from "../services/notification.service";

export default function useNotifications() {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState([]);

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
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const readNotification = useCallback(async (notification) => {
    if (!notification || notification.read) {
      return;
    }

    await markNotificationRead(notification.id);
  }, []);

  const readAll = useCallback(async () => {
    if (!profile?.uid) {
      return;
    }

    await markAllNotificationsRead(profile.uid, notifications);
  }, [profile?.uid, notifications]);

  return {
    loading,

    notifications,

    unreadCount,

    markAsRead: readNotification,

    markAllAsRead: readAll,
  };
}
