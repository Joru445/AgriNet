import { Link } from "react-router-dom";

import BackButton from "./common/BackButton";
import UserIdentity from "./common/UserIdentity";
import { Dot } from "./ui/Badge";

import { getMePath, getNotificationsPath } from "../utils/routes";
import { useNotificationsContext } from "../context/NotificationsContext";
import { useLanguage } from "../context/LanguageContext";

export default function Header({ user, collapsed, hideBackButton }) {
  const { t } = useLanguage();
  const notificationPath = getNotificationsPath(user.role);
  const mePath = getMePath(user.role);

  const { unreadCount } = useNotificationsContext();

  return (
    <header className="shrink-0 sticky top-0 right-0 z-9996 dark:lg:rounded-2xl flex h-[calc(4rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] items-center justify-between bg-(--agri-surface)/95 border-b border-(--agri-border) px-4 md:px-6 backdrop-blur-sm transition-all duration-300 ease-in-out">
      <div className="flex items-center">
        {hideBackButton ? (
          <span
            className={`font-bold text-(--agri-text) text-lg sm:text-xl lg:text-2xl whitespace-nowrap transition-all duration-300 ease-in-out ${
              !collapsed ? "lg:hidden" : "block"
            }`}
          >
            AgriNet <span className="font-light">Lucena</span>
          </span>
        ) : (
          <BackButton />
        )}
      </div>

      {user.status === "suspended" && (
        <span className="text-red-500">{t("header.suspended")}</span>
      )}

      <div className="flex items-center gap-2 min-w-0">
        <Link
          to={notificationPath}
          data-onboarding="bell"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--agri-text-muted)] transition-colors hover:bg-[var(--agri-hover)] hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)]"
          aria-label={t("header.notifications")}
        >
          <i className="ri-notification-3-line text-lg" />

          {unreadCount > 0 && <Dot />}
        </Link>

        <Link
          to={mePath}
          data-onboarding="header-profile"
          className="flex items-center gap-2 border-l border-[var(--agri-border)] pl-2 min-w-0 max-w-[130px] sm:max-w-[200px] md:max-w-[280px]"
        >
          <UserIdentity user={user} showUsername={false} showRole={true} />
        </Link>
      </div>
    </header>
  );
}
