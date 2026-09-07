import { Link } from "react-router-dom";

import BackButton from "./common/BackButton";
import UserIdentity from "./common/UserIdentity";
import Badge from "./ui/Badge";

import {
  getMePath,
  getMessagesPath,
  getNotificationsPath,
} from "../utils/routes";
import { useNotificationsContext } from "../context/NotificationsContext";
import { useUnreadMessages } from "../context/UnreadMessagesContext";
import { useLanguage } from "../context/LanguageContext";

export default function Header({ user, collapsed, hideBackButton }) {
  const { t } = useLanguage();
  const notificationPath = getNotificationsPath(user.role);
  const messagesPath = getMessagesPath(user.role);
  const mePath = getMePath(user.role);

  const { unreadCount: notifCount } = useNotificationsContext();
  const { unreadCount: msgCount } = useUnreadMessages();

  return (
    <header className="shrink-0 sticky top-0 right-0 z-9996 flex h-[calc(3.75rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] items-center justify-between bg-(--agri-surface)/95 border-b border-(--agri-border)
      dark:border-(--agri-surface) dark:lg:rounded-2xl dark:lg:m-2 px-3 md:px-5 backdrop-blur-sm transition-all duration-300 ease-in-out">
      {/* ── Left ──────────────────────────────────────── */}
      <div className="flex items-center gap-1 min-w-0">
        {hideBackButton ? (
          <span
            className={`font-bold text-(--agri-text) text-base sm:text-lg whitespace-nowrap transition-all duration-300 ease-in-out ${
              !collapsed ? "lg:hidden" : "block"
            }`}
          >
            AgriNet
          </span>
        ) : (
          <BackButton />
        )}
      </div>

      {/* ── Suspended banner ──────────────────────────── */}
      {user.status === "suspended" && (
        <span className="absolute inset-x-0 top-full mx-auto w-fit mt-1 text-red-500 text-xs font-medium bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full z-50">
          {t("header.suspended")}
        </span>
      )}

      {/* ── Right actions ─────────────────────────────── */}
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
        {/* Notifications */}
        <Link
          to={notificationPath}
          data-onboarding="bell"
          className="relative flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--agri-text-muted)] transition-colors hover:bg-[var(--agri-hover)] hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)]"
          aria-label={t("header.notifications")}
        >
          <i className="ri-notification-3-line text-lg" />
          {notifCount > 0 && <Badge count={notifCount} />}
        </Link>

        {/* Messages */}
        <Link
          to={messagesPath}
          data-onboarding="header-messages"
          className="relative flex size-9 shrink-0 items-center justify-center rounded-lg text-(--agri-text-muted) transition-colors hover:bg-(--agri-hover) hover:text-[#2D6A4F] dark:hover:text-(--agri-brand)"
          aria-label={t("header.messages")}
        >
          <i className="ri-message-3-line text-lg" />
          {msgCount > 0 && <Badge count={msgCount} />}
        </Link>

        {/* Profile */}
        <Link
          to={mePath}
          data-onboarding="header-profile"
          className="flex items-center gap-2 pl-2 min-w-0 max-w-25 sm:max-w-45 md:max-w-60 rounded-lg transition-colors hover:bg-(--agri-hover)"
        >
          <UserIdentity user={user} showUsername={false} showRole={true} />
        </Link>
      </div>
    </header>
  );
}
