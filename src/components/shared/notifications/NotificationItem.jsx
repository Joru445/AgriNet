import { Link } from "react-router-dom";
import { useNotificationsContext } from "../../../context/NotificationsContext";
import { useLanguage } from "../../../context/LanguageContext";
import { getNotificationTarget } from "../../../utils/getNotificationTarget";

function formatNotificationTime(createdAt, t) {
  if (!createdAt) return "";

  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return t("time.justNow");
  if (diffMin < 60) return t("time.minAgo", { count: diffMin });
  if (diffHr < 24) return t("time.hrAgo", { count: diffHr });
  if (diffDay < 7) return t("time.dayAgo", { count: diffDay });

  return date.toLocaleDateString();
}

const notificationIcons = {
  inquiry: "ri-question-answer-line",
  message: "ri-message-3-line",
  transaction: "ri-shopping-bag-3-line",
  review: "ri-star-line",
  verification: "ri-shield-check-line",
  product: "ri-shopping-basket-line",
};

export default function NotificationItem({ notification }) {
  const icon = notificationIcons[notification.type] || "ri-notification-3-line";
  const { markAsRead } = useNotificationsContext();
  const { t } = useLanguage();

  const target = getNotificationTarget(notification);

  function handleClick() {
    if (!notification.read) {
      markAsRead(notification);
    }
  }

  return (
    <Link
      to={target}
      onClick={handleClick}
      className={`flex gap-4 rounded-2xl border p-4 transition ${
        !notification.read
          ? "border-[#2D6A4F]/20 bg-[#F3FAF6] dark:bg-[var(--agri-brand-bg)] hover:bg-[#EAF6EE]"
          : "border-[var(--agri-border-subtle)] bg-[var(--agri-card)] hover:bg-[var(--agri-hover)]"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          !notification.read
            ? "bg-[#2D6A4F] text-white"
            : "bg-[var(--agri-hover)] text-[var(--agri-text-muted)]"
        }`}
      >
        <i className={`${icon} text-lg`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-[var(--agri-text)]">{notification.title}</h2>

          {!notification.read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2D6A4F]" />
          )}
        </div>

        <p className="mt-1 text-sm leading-relaxed text-[var(--agri-text-muted)]">
          {notification.body}
        </p>

        <p className="mt-2 text-xs text-[var(--agri-text-muted)]">
          {formatNotificationTime(notification.createdAt, t)}
        </p>
      </div>
    </Link>
  );
}
