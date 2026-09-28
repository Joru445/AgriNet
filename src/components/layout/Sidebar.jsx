import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { consumerNavigation, navigationByRole } from "../../constants/navigation";
import { getOnboardingNavKey } from "../../constants/onboardingSteps";
import useManagedGroups from "../../hooks/useManagedGroups";

import logo from "../../assets/favicon.ico";
import UserIdentity from "../ui/UserIdentity";
import Button from "../ui/Button";
import LogoutConfirmModal from "../settings/LogoutConfirmModal";
import { PulsingDot } from "../ui/Badge";

import { useUnreadMessages } from "../../context/UnreadMessagesContext";
import { useUnreadInquiries } from "../../context/UnreadInquiriesContext";
import { useUnreadReports } from "../../context/UnreadReportsContext";

const NAV_GROUPS = [
  { key: "main", labelKey: "sidebar.groups.main" },
  { key: "marketplace", labelKey: "sidebar.groups.marketplace" },
  { key: "communication", labelKey: "sidebar.groups.communication" },
  { key: "system", labelKey: "sidebar.groups.system" },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, profile, authInitializing, identity, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount, showPopup } = useUnreadMessages();
  const { inquiryActionCount, showInquiryPopup, inquiryPopupMessage } =
    useUnreadInquiries();
  const { pendingReportsCount, showReportPopup, reportPopupMessage } =
    useUnreadReports();
  const navigate = useNavigate();

  // Only after auth initialization completes is a null user a genuine guest.
  const isAnonymous = !authInitializing && !user;

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const role = identity?.role || profile?.role;
  const baseItems = role ? (navigationByRole[role] ?? []) : consumerNavigation;
  const { hasManagedGroups } = useManagedGroups();

  // Conditionally add "Manage Groups" entry if user manages any groups
  const items = hasManagedGroups
    ? [...baseItems, { to: "/manage/groups", icon: "ri-shield-user-line", labelKey: "nav.manageGroups", bottom: false, group: "main" }]
    : baseItems;

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      navigate("/login");
      setShowLogoutModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoggingOut(false);
    }
  }

  function getBadgeCount(item) {
    if (isAnonymous) return 0;
    if (item.to.includes("messages")) return unreadCount;
    if (item.to.includes("transactions")) return inquiryActionCount;
    if (item.to.includes("reports")) return pendingReportsCount;
    return 0;
  }

  function getPopupInfo(item) {
    if (isAnonymous) return null;
    if (item.to.includes("messages") && showPopup) {
      return t("sidebar.newMessages");
    }
    if (item.to.includes("transactions") && showInquiryPopup) {
      return inquiryPopupMessage;
    }
    if (item.to.includes("reports") && showReportPopup) {
      return reportPopupMessage || t("sidebar.newReportNeedsReview");
    }
    return null;
  }

  const navGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: items.filter((item) => item.group === group.key),
  })).filter((group) => group.items.length > 0);

  return (
    <aside
      aria-label="Sidebar navigation"
      className={`hidden lg:flex h-full shrink-0 fixed top-0 left-0 bg-[#1B4332] dark:bg-(--agri-surface) flex-col z-9996 pt-1 transition-[width] border-r border-white/10 dark:border-(--agri-border) duration-200 ease-out ${
        collapsed ? "w-20" : "w-60"
      }`}
    >
      {/* ── Branding ─────────────────────────────────────── */}
      <div
        className={`flex h-14 shrink-0 items-center gap-2.5 px-4 border-b border-white/10 dark:border-(--agri-border) ${
          collapsed ? "justify-center px-0" : ""
        }`}
      >
        <img
          src={logo}
          alt="AgriNet Logo"
          className="h-8 w-8 object-contain shrink-0"
        />
        {!collapsed && (
          <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">
            AgriNet
          </span>
        )}
      </div>

      {/* ── Profile (authenticated only) ──────────────────── */}
      {!isAnonymous && (
        <div
          className={`border-b border-white/10 dark:border-(--agri-border) ${
            collapsed ? "flex justify-center items-center h-14" : "px-3 py-3"
          }`}
        >
          {collapsed ? (
            <div className="relative group/user">
              {identity?.profilePicture ? (
                <img
                  src={identity.profilePicture}
                  alt={identity.fullname}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20 dark:ring-(--agri-border)"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-white/15 dark:bg-(--agri-brand-bg) flex items-center justify-center text-xs font-bold text-white dark:text-(--agri-brand) ring-2 ring-white/20 dark:ring-(--agri-border)">
                  {(identity?.fullname || "?")[0]}
                </div>
              )}
              {/* Tooltip on collapsed avatar */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 rounded-lg bg-gray-900 dark:bg-(--agri-elevated) text-white dark:text-(--agri-text) text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover/user:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10 dark:border-(--agri-border)">
                <p>{identity?.fullname}</p>
                <p className="text-[10px] text-white/60 dark:text-(--agri-text-muted) capitalize">{role}</p>
              </div>
            </div>
          ) : (
            <UserIdentity
              user={identity}
              showUsername={false}
              showRole={true}
              showVerified={false}
              colorWhite={true}
              size="sm"
            />
          )}
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-3.5 scrollbar-none">
        {navGroups.map((group, gi) => (
          <div key={group.key}>
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40 dark:text-(--agri-text-muted)">
                {t(group.labelKey)}
              </div>
            )}
            {collapsed && gi > 0 && (
              <div className="mx-auto my-1.5 w-6 h-px bg-white/10 dark:bg-(--agri-border)" />
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const badgeCount = getBadgeCount(item);
                const popupMessage = getPopupInfo(item);
                const hasBadge = badgeCount > 0;

                return (
                  <div key={item.to} className="relative group/nav">
                    <NavLink
                      to={item.to}
                      end={item.to.split("/").length <= 2 + (role === "farmer" ? 1 : 0)}
                      data-onboarding={getOnboardingNavKey(item.to)}
                      className={({ isActive }) =>
                        `relative flex items-center rounded-xl transition-all duration-150 select-none ${
                          collapsed
                            ? "justify-center size-11 mx-auto"
                            : "gap-3 px-3 py-2.5"
                        } ${
                          isActive
                            ? "bg-white/15 dark:bg-(--agri-brand-bg) text-white dark:text-(--agri-brand) font-semibold shadow-xs"
                            : "text-white/70 dark:text-(--agri-text-secondary) hover:bg-white/[0.08] dark:hover:bg-(--agri-hover) hover:text-white dark:hover:text-(--agri-text) font-medium"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active edge indicator */}
                          {isActive && (
                            <span
                              className={`absolute rounded-full bg-emerald-400 dark:bg-(--agri-brand) ${
                                collapsed
                                  ? "left-0.5 top-2.5 bottom-2.5 w-1"
                                  : "left-0 top-2 bottom-2 w-1 rounded-r-full"
                              }`}
                            />
                          )}

                          {/* Icon */}
                          <span className="flex items-center justify-center size-5 shrink-0">
                            <i
                              className={`${item.icon} ${
                                isActive ? "text-[18px]" : "text-[17px]"
                              }`}
                            />
                          </span>

                          {/* Label */}
                          {!collapsed && (
                            <span className="flex-1 text-sm truncate leading-tight">
                              {t(item.labelKey)}
                            </span>
                          )}

                          {/* Badge */}
                          {hasBadge && (
                            <>
                              {collapsed ? (
                                <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                                  {badgeCount > 99 ? "99+" : badgeCount}
                                </span>
                              ) : (
                                <span className="ml-auto shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                  {badgeCount > 99 ? "99+" : badgeCount}
                                </span>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </NavLink>

                    {/* Collapsed tooltip */}
                    {collapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 rounded-lg bg-gray-900 dark:bg-(--agri-elevated) text-white dark:text-(--agri-text) text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10 dark:border-(--agri-border)">
                        {t(item.labelKey)}
                      </div>
                    )}

                    {/* Expanded popup notification */}
                    {!collapsed && popupMessage && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
                        <div className="relative flex items-center gap-2 whitespace-nowrap rounded-xl bg-white dark:bg-(--agri-card) px-3 py-2 text-sm font-semibold text-[#1B4332] dark:text-(--agri-text) shadow-xl shadow-black/15 border border-black/5 dark:border-(--agri-border)">
                          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-(--agri-card) rotate-45 border-l border-b border-black/5 dark:border-(--agri-border)" />
                          <span className="relative z-10 flex items-center gap-1.5">
                            <PulsingDot />
                            <span>{popupMessage}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom Actions ───────────────────────────────── */}
      <div className="border-t border-white/10 dark:border-(--agri-border) px-2.5 py-2.5 space-y-1">
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center rounded-xl text-white/60 dark:text-(--agri-text-muted) hover:text-white dark:hover:text-(--agri-text) hover:bg-white/[0.08] dark:hover:bg-(--agri-hover) transition-colors duration-150 cursor-pointer ${
            collapsed
              ? "justify-center size-11 mx-auto"
              : "gap-3 px-3 py-2.5 w-full"
          }`}
          title={
            collapsed ? t("sidebar.expandSidebar") : t("sidebar.collapseSidebar")
          }
          aria-label={
            collapsed ? t("sidebar.expandSidebar") : t("sidebar.collapseSidebar")
          }
        >
          <span className="flex items-center justify-center size-5 shrink-0">
            <i
              className={`text-[16px] transition-transform duration-200 ${
                collapsed ? "ri-arrow-right-s-line" : "ri-arrow-left-s-line"
              }`}
            />
          </span>
          {!collapsed && (
            <span className="text-sm font-medium">
              {collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            </span>
          )}
        </button>

        {/* Logout / Back Home */}
        {isAnonymous ? (
          <NavLink
            to="/landing"
            className={`flex items-center rounded-xl text-white/60 dark:text-(--agri-text-muted) hover:text-white dark:hover:text-(--agri-text) hover:bg-white/[0.08] dark:hover:bg-(--agri-hover) transition-colors duration-150 ${
              collapsed
                ? "justify-center size-11 mx-auto"
                : "gap-3 px-3 py-2.5 w-full"
            }`}
          >
            <span className="flex items-center justify-center size-5 shrink-0">
              <i className="ri-home-4-line text-[16px]" />
            </span>
            {!collapsed && (
              <span className="text-sm font-medium">
                {t("auth.backHome")}
              </span>
            )}
          </NavLink>
        ) : (
          <Button
            variant="logout"
            size="sm"
            icon="ri-logout-box-line"
            onClick={() => setShowLogoutModal(true)}
            className={`${
              collapsed
                ? "!w-11 !h-11 !p-0 justify-center mx-auto"
                : "gap-3 px-3 py-2.5 w-full !justify-start"
            }`}
            title={collapsed ? t("common.logout") : undefined}
            aria-label={t("common.logout")}
          >
            {!collapsed && (
              <span className="text-sm font-semibold">
                {t("common.logout")}
              </span>
            )}
          </Button>
        )}
      </div>

      {!isAnonymous && (
        <LogoutConfirmModal
          open={showLogoutModal}
          loggingOut={loggingOut}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />
      )}
    </aside>
  );
}
