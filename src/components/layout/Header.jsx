import { Link, useLocation } from "react-router-dom";

import logo from "../../assets/favicon.ico";
import BackButton from "../ui/BackButton";
import UserIdentity from "../ui/UserIdentity";
import Badge from "../ui/Badge";

import {
  getMePath,
  getNotificationsPath,
  getFavoritesPath,
} from "../../utils/routes";
import { useNotificationsContext } from "../../context/NotificationsContext";
import { useLanguage } from "../../context/LanguageContext";

function getNestedHeaderTitle(pathname, t) {
  if (!pathname) return "";
  if (pathname.includes("/proof")) return t("transaction.proof") || "Transaction Proof";
  if (pathname.includes("/review")) return t("transaction.review") || "Review";
  if (pathname.includes("/manage/groups/")) return t("groups.groupDetails") || "Group Details";
  if (pathname.includes("/manage/groups")) return t("nav.manageGroups") || "Manage Groups";
  if (pathname.includes("/groups/")) return t("groups.groupDetails") || "Group Details";
  if (pathname.includes("/groups")) return t("nav.groups") || "Groups";
  if (pathname.includes("/farmer-verifications")) return t("nav.farmerVerifications") || "Verifications";
  if (pathname.includes("/activity")) return t("nav.adminActivity") || "Activity";
  if (pathname.includes("/users")) return t("nav.users") || "Users";
  if (pathname.includes("/notifications")) return t("header.notifications") || "Notifications";
  if (pathname.includes("/favorites")) return t("nav.favorites") || "Favorites";
  if (pathname.includes("/profile/")) return t("nav.profile") || "Profile";
  if (pathname.includes("/me")) return t("nav.profile") || "Profile";
  return "";
}

export default function Header({ user, collapsed, hideBackButton, authInitializing }) {
  const { t } = useLanguage();
  const location = useLocation();
  const { unreadCount: notifCount } = useNotificationsContext();

  // Only after Firebase Auth initialization completes may a null user be
  // treated as a genuine guest.
  const isAnonymous = !authInitializing && !user;

  const notificationPath =
    isAnonymous || !user ? "/login" : getNotificationsPath(user.role);
  const mePath = isAnonymous || !user ? "/login" : getMePath(user.role);
  const favoritesPath =
    isAnonymous || !user ? "/login" : getFavoritesPath(user.role);

  const nestedTitle = !hideBackButton ? getNestedHeaderTitle(location.pathname, t) : "";

  return (
    <header
      className="shrink-0 sticky top-0 z-30 flex h-[calc(3.75rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] items-center justify-between gap-1 sm:gap-3 bg-(--agri-surface)/95 border-b border-(--agri-border) px-2 sm:px-4 md:px-6 backdrop-blur-md transition-colors duration-200"
    >
      {/* ── Left ──────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
        {!hideBackButton || isAnonymous ? (
          <BackButton to={isAnonymous ? "/landing" : undefined} />
        ) : null}

        {/* Mobile nested page title */}
        {!hideBackButton && nestedTitle ? (
          <h1 className="lg:hidden text-sm sm:text-base font-bold text-(--agri-text) truncate max-w-[120px] sm:max-w-[320px]">
            {nestedTitle}
          </h1>
        ) : null}

        {/* Brand identity (visible on mobile tabs or when desktop sidebar is collapsed) */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2.5 shrink-0 transition-opacity duration-200 ${
            !hideBackButton && nestedTitle
              ? "hidden lg:flex"
              : !collapsed
                ? "lg:hidden flex"
                : "flex"
          }`}
        >
          <img
            src={logo}
            alt="AgriNet"
            className="h-6 w-6 sm:h-7 sm:w-7 object-contain shrink-0 lg:hidden"
          />
          <span className="font-bold text-(--agri-text) text-base sm:text-lg tracking-tight whitespace-nowrap">
            AgriNet
          </span>
        </div>
      </div>

      {/* ── Right actions ─────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
        {authInitializing ? (
          /* Auth state still initializing: neutral placeholder, never Login */
          <div className="flex items-center gap-1.5 px-1.5 w-9 h-9 animate-pulse">
            <div className="size-8 rounded-full bg-(--agri-hover)" />
          </div>
        ) : isAnonymous ? (
          <>
            <Link
              to="/login"
              className="px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[#1B4332] dark:text-(--agri-brand) bg-[#E8F5EE] dark:bg-(--agri-card) border border-[#2D6A4F]/20 dark:border-(--agri-border) hover:bg-[#2D6A4F] hover:text-white dark:hover:bg-(--agri-hover) shadow-2xs transition-all active:scale-95 whitespace-nowrap"
            >
              {t("guest.login")}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#2D6A4F] hover:bg-[#1B4332] dark:bg-(--agri-brand) dark:text-gray-900 dark:hover:bg-emerald-400 shadow-xs transition-all active:scale-95 whitespace-nowrap"
            >
              {t("guest.register")}
            </Link>
          </>
        ) : (
          <>
            {/* Notifications & Action icons */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <Link
                to={notificationPath}
                data-onboarding="bell"
                className="relative flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl text-(--agri-text-muted) transition-colors hover:bg-(--agri-hover) hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/30"
                aria-label={t("header.notifications")}
              >
                <i className="ri-notification-3-line text-base sm:text-lg" />
                {notifCount > 0 && (
                  <Badge count={notifCount} className="-top-1 -right-1" />
                )}
              </Link>

              {user?.role === "consumer" && (
                <Link
                  to={favoritesPath}
                  data-onboarding="header-favorites"
                  className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl text-(--agri-text-muted) transition-colors hover:bg-(--agri-hover) hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/30"
                  aria-label={t("nav.favorites")}
                >
                  <i className="ri-heart-line text-base sm:text-lg" />
                </Link>
              )}

              {user?.role === "admin" && (
                <Link
                  to="/admin/farmer-verifications"
                  data-onboarding="header-verification"
                  className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl text-(--agri-text-muted) transition-colors hover:bg-(--agri-hover) hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/30"
                  aria-label={t("nav.farmerVerifications")}
                >
                  <i className="ri-shield-star-line text-base sm:text-lg" />
                </Link>
              )}
            </div>

            {/* User Profile Pill */}
            <Link
              to={mePath}
              data-onboarding="header-profile"
              className="flex items-center gap-1.5 sm:gap-2 pl-0.5 pr-1.5 sm:px-2.5 py-0.5 sm:py-1 max-w-[135px] sm:max-w-[200px] md:max-w-[260px] rounded-xl transition-colors hover:bg-(--agri-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/30"
            >
              <UserIdentity user={user} showUsername={false} showRole={true} size="sm" />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

