import { useAuth } from "../../context/AuthContext";
import { useNotificationsContext } from "../../context/NotificationsContext";
import { useLanguage } from "../../context/LanguageContext";
import Loading from "../../components/ui/Loading";
import NotificationList from "../../components/notifications/NotificationList";
import LoginRequired from "../../components/ui/LoginRequired";

export default function Notifications() {
  const { user, authInitializing } = useAuth();
  const {
    notifications,
    loading,
    loadingMore,
    hasMore,
    loadMoreNotifications,
    unreadCount,
    markAllAsRead,
  } = useNotificationsContext();
  const { t } = useLanguage();

  if (authInitializing) {
    return <Loading />;
  }

  if (!user) {
    return <LoginRequired title={t("header.notifications")} />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--agri-text)">
            {t("notifications.title")}
          </h1>

          <p className="mt-1 text-sm text-(--agri-text-muted)">
            {t("notifications.subtitle")}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-sm font-medium text-[#2D6A4F] dark:text-(--agri-brand) transition hover:text-[#1F5139] dark:hover:text-(--agri-brand)"
          >
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      <NotificationList
        notifications={notifications}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMoreNotifications}
      />
    </div>
  );
}
