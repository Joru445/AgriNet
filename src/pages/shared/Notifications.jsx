import { useNotificationsContext } from "../../context/NotificationsContext";
import { useLanguage } from "../../context/LanguageContext";

import NotificationList from "../../components/shared/notifications/NotificationList";

export default function Notifications() {
  const { notifications, loading, unreadCount, markAllAsRead } =
    useNotificationsContext();
  const { t } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6 pb-18 md:pb-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--agri-text)]">
            {t("notifications.title")}
          </h1>

          <p className="mt-1 text-sm text-[var(--agri-text-muted)]">
            {t("notifications.subtitle")}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-sm font-medium text-[#2D6A4F] dark:text-[var(--agri-brand)] transition hover:text-[#1F5139] dark:hover:text-[var(--agri-brand)]"
          >
            {t("notifications.markAllRead")}
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
