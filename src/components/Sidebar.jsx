import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { navigationByRole } from "../constants/navigation";
import { getOnboardingNavKey } from "../constants/onboardingSteps";
import { showToast } from "../utils/toast";

import logo from "../assets/favicon.ico";
import UserIdentity from "./common/UserIdentity";
import LogoutConfirmModal from "./common/LogoutConfirmModal";
import { PulsingDot } from "./ui/Badge";

import { useUnreadMessages } from "../context/UnreadMessagesContext";
import { useUnreadInquiries } from "../context/UnreadInquiriesContext";
import { useUnreadReports } from "../context/UnreadReportsContext";

const NAV_GROUPS = [
  { key: "main", labelKey: "sidebar.groups.main" },
  { key: "marketplace", labelKey: "sidebar.groups.marketplace" },
  { key: "communication", labelKey: "sidebar.groups.communication" },
  { key: "system", labelKey: "sidebar.groups.system" },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { profile, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount, showPopup } = useUnreadMessages();
  const { inquiryActionCount, showInquiryPopup, inquiryPopupMessage } =
    useUnreadInquiries();
  const { pendingReportsCount, showReportPopup, reportPopupMessage } =
    useUnreadReports();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const role = profile?.role;
  const items = navigationByRole[role] ?? [];

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      showToast.success(t("common.loggedOut"));
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    } finally {
      setLoggingOut(false);
    }
  }

  function getBadgeCount(item) {
    if (item.to.includes("messages")) return unreadCount;
    if (item.to.includes("transactions")) return inquiryActionCount;
    if (item.to.includes("reports")) return pendingReportsCount;
    return 0;
  }

  function getPopupInfo(item) {
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
      className={`hidden lg:flex h-full dark:h-[calc(100vh-1rem)] shrink-0 fixed top-0 left-0 bg-(--agri-brand-dark) dark:bg-transparent flex-col z-9996 pt-1 dark:rounded-2xl transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-60"
      }`}
    >
      {/* ── Branding ─────────────────────────────────────── */}
      <div
        className={`flex h-14 shrink-0 items-center gap-2.5 px-3 border-b border-white/8 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <img
          src={logo}
          alt="Logo"
          className="h-8 w-8 object-contain shrink-0"
        />
        {!collapsed && (
          <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">
            AgriNet{" "}
            <span className="font-light text-white/50">Lucena</span>
          </span>
        )}
      </div>

      {/* ── Profile ──────────────────────────────────────── */}
      <div className={` border-b border-white/8 ${collapsed ? "flex justify-center items-center w-full h-14 mx-auto" : "px-3 py-3"}`}>
        {collapsed ? (
          <div className="flex justify-center">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.fullname}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white/70">
                {(profile?.fullname || "?")[0]}
              </div>
            )}
          </div>
        ) : (
          <UserIdentity
            user={profile}
            showUsername={false}
            showRole={true}
            showVerified={false}
            colorWhite={true}
            size="sm"
          />
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-3 scrollbar-none">
        {navGroups.map((group, gi) => (
          <div key={group.key}>
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {t(group.labelKey)}
              </div>
            )}
            {collapsed && gi > 0 && (
              <div className="mx-auto my-1 w-5 h-px bg-white/10" />
            )}

            <div className="space-y-0.5">
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
                      title={collapsed ? t(item.labelKey) : undefined}
                      className={({ isActive }) =>
                        `relative flex items-center rounded-lg transition-all duration-150 dark:bg-[var(--agri-surface)] ${
                          collapsed
                            ? "justify-center w-16 h-12 mx-auto"
                            : "gap-2.5 px-2.5 py-2"
                        } ${
                          isActive
                            ? "bg-white/15 text-white shadow-sm shadow-black/10"
                            : "text-white/55 hover:bg-white/[0.07] hover:text-white/90"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Icon */}
                          <span
                            className={`flex items-center justify-center shrink-0 transition-colors duration-150 ${
                              collapsed ? "size-5" : "size-5"
                            } ${isActive ? "text-white" : ""}`}
                          >
                            <i
                              className={`${item.icon} ${
                                isActive ? "text-base" : "text-[15px]"
                              }`}
                            />
                          </span>

                          {/* Label */}
                          {!collapsed && (
                            <span
                              className={`flex-1 text-[13px] truncate leading-tight transition-colors duration-150 ${
                                isActive
                                  ? "font-semibold"
                                  : "font-medium"
                              }`}
                            >
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
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 rounded-md bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
                        {t(item.labelKey)}
                      </div>
                    )}

                    {/* Expanded popup notification */}
                    {!collapsed && popupMessage && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
                        <div className="relative flex items-center gap-2 whitespace-nowrap rounded-xl bg-white dark:bg-[var(--agri-card)] px-3 py-2 text-sm font-semibold text-[#1B4332] dark:text-[var(--agri-brand-light)] shadow-xl shadow-black/15 border border-black/5">
                          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-[var(--agri-card)] rotate-45 border-l border-b border-black/5" />
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
      <div className="border-t border-white/[0.08] px-2 py-2 space-y-0.5">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center rounded-lg dark:bg-[var(--agri-surface)] text-white/40 hover:text-white/80 hover:bg-white/[0.07] transition-colors duration-150 cursor-pointer ${
            collapsed
              ? "justify-center w-16 h-12 mx-auto"
              : "gap-2.5 px-2.5 py-2 w-full"
          }`}
          title={
            collapsed ? t("sidebar.expandSidebar") : t("sidebar.collapseSidebar")
          }
        >
          <span className="flex items-center justify-center size-5 shrink-0">
            <i
              className={`text-[15px] ${
                collapsed ? "ri-arrow-right-s-line" : "ri-arrow-left-s-line"
              }`}
            />
          </span>
          {!collapsed && (
            <span className="text-[13px] font-medium">
              {collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`flex items-center rounded-lg dark:bg-[var(--agri-surface)] text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer ${
            collapsed
              ? "justify-center w-16 h-12 mx-auto"
              : "gap-2.5 px-2.5 py-2 w-full"
          }`}
        >
          <span className="flex items-center justify-center size-5 shrink-0">
            <i className="ri-logout-box-line text-[15px]" />
          </span>
          {!collapsed && (
            <span className="text-[13px] font-medium">
              {t("common.logout")}
            </span>
          )}
        </button>
      </div>

      <LogoutConfirmModal
        open={showLogoutModal}
        loggingOut={loggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
}
