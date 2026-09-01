import { useNotificationsContext } from "../../context/NotificationsContext";

import NotificationList from "../../components/shared/notifications/NotificationList";

export default function Notifications() {
  const { notifications, loading, unreadCount, markAllAsRead } =
    useNotificationsContext();

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6 pb-18 md:pb-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--agri-text)]">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-[var(--agri-text-muted)]">
            Stay updated with your account activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-sm font-medium text-[#2D6A4F] dark:text-[var(--agri-brand)] transition hover:text-[#1F5139] dark:hover:text-[var(--agri-brand)]"
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
