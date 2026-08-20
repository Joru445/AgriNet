import { useState } from "react";

import NotificationList from "../../components/shared/notifications/NotificationList";

export default function Notifications() {
  // Temporary state only.
  // Later:
  // const { notifications, loading, markAllAsRead } = useNotifications();

  const [notifications] = useState([]);
  const [loading] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6 pb-18 md:pb-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Stay updated with your account activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="text-sm font-medium text-[#2D6A4F] transition hover:text-[#1F5139]"
          >
            Mark all as read
          </button>
        )}
      </div>

      <NotificationList
        notifications={notifications}
        loading={loading}
      />
    </div>
  );
}