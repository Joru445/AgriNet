import { Link } from "react-router-dom";

import BackButton from "./common/BackButton";
import UserIdentity from "./common/UserIdentity";
import Badge from "./ui/Badge";

import {
  getMePath,
  getNotificationsPath,
  getFavoritesPath,
} from "../utils/routes";
import { useNotificationsContext } from "../context/NotificationsContext";
import { useLanguage } from "../context/LanguageContext";

export default function Header({ user, collapsed, hideBackButton }) {
  const { t } = useLanguage();
  const { unreadCount: notifCount } = useNotificationsContext();

  const isAnonymous = !user;

  const notificationPath = isAnonymous ? "/login" : getNotificationsPath(user.role);
  const mePath = isAnonymous ? "/login" : getMePath(user.role);
  const favoritesPath = isAnonymous ? "/login" : getFavoritesPath(user.role);

  return (
    <header className="shrink-0 sticky top-0 right-0 z-9996 dark:lg:rounded-2xl flex h-[calc(3.75rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] items-center justify-between bg-(--agri-surface)/95 border-b border-(--agri-border) dark:border-(--agri-surface) px-3 md:px-5 dark:lg:m-2 backdrop-blur-sm transition-all duration-300 ease-in-out">
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

      {/* ── Right actions ─────────────────────────────── */}
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
        {isAnonymous ? (
          <>
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-(--agri-text-secondary) border border-(--agri-border) hover:bg-(--agri-hover) transition-colors"
            >
              {t("guest.login")}
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#2D6A4F] hover:bg-[#1B4332] transition-colors"
            >
              {t("guest.register")}
            </Link>
          </>
        ) : (
          <>
            {/* Notifications */}
            <Link
              to={notificationPath}
              data-onboarding="bell"
              className="relative flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--agri-text-muted)] transition-colors hover:bg-[var(--agri-hover)] hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)]"
              aria-label={t("header.notifications")}
            >
              <i className="ri-notification-3-line text-lg" />
              {notifCount > 0 && (
                <Badge count={notifCount} className="-top-1.5 right-0.5" />
              )}
            </Link>

            {/* Favorites */}
            <Link
              to={favoritesPath}
              data-onboarding="header-favorites"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--agri-text-muted)] transition-colors hover:bg-[var(--agri-hover)] hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)]"
              aria-label={t("nav.favorites")}
            >
              <i className="ri-heart-line text-lg" />
            </Link>

            {/* Profile */}
            <Link
              to={mePath}
              data-onboarding="header-profile"
              className="flex items-center gap-2 px-2.5 py-1 max-w-45 md:max-w-60 rounded-lg transition-colors hover:bg-[var(--agri-hover)]"
            >
              <UserIdentity user={user} showUsername={false} showRole={true} />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
