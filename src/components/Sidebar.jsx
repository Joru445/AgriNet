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
import Badge, { PulsingDot } from "./ui/Badge";

import { useUnreadMessages } from "../context/UnreadMessagesContext";
import { useUnreadInquiries } from "../context/UnreadInquiriesContext";
import { useUnreadReports } from "../context/UnreadReportsContext";

export default function Sidebar({ collapsed, setCollapsed }) {
  const { profile, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount, showPopup } = useUnreadMessages();
  const { inquiryActionCount, showInquiryPopup, inquiryPopupMessage } = useUnreadInquiries();
  const { pendingReportsCount, showReportPopup, reportPopupMessage } = useUnreadReports();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  const items = navigationByRole[profile?.role] ?? [];

  return (
    <aside
      className={`hidden lg:flex h-full dark:h-[calc(100vh-1rem)] shrink-0 fixed top-0 left-0 dark:my-2 dark:mx-1 bg-agri-dark dark:bg-(--agri-brand-bg) flex-col z-9996 pt-1 dark:rounded-2xl transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}

      <div className={`flex h-16 shrink-0 items-center gap-3 px-4 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
        <img
          src={logo}
          alt="Logo"
          className="h-10 w-10 object-contain shrink-0"
        />

        <span
          className={`font-bold text-white text-xl whitespace-nowrap transition-all duration-300 ease-in-out ${
            collapsed ? "hidden" : "block"
          }`}
        >
          AgriNet <span className="font-light">Lucena</span>
        </span>
      </div>

      {/* Profile */}

      <div className="px-4 py-4 border-b border-white/10">
        <UserIdentity user={profile} onlyPic={collapsed} showUsername={false} showRole={true} showVerified={false} colorWhite={true} size="lg" />
      </div>

      {/* Navigation */}

      <nav className="flex-1 py-4">
        {items.map((item) => {
          const isMessages = item.to.includes("messages");
          const isInquiries = item.to.includes("transactions");
          const isReports = item.to.includes("reports");

          return (
            <div key={item.to} className="relative">
              <NavLink
                to={item.to}
                end
                data-onboarding={getOnboardingNavKey(item.to)}
                title={collapsed ? t(item.labelKey) : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all ${
                    collapsed ? "justify-center" : "justify-start"
                  } ${
                    isActive
                      ? "bg-white/20 text-white font-semibold"
                      : "text-green-200/75 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <div className="relative flex items-center justify-center">
                  <i className={`${item.icon} text-base`} />
                  {isMessages && unreadCount > 0 && (
                    <Badge count={unreadCount} className="ring-2 ring-[#1B4332]" />
                  )}
                  {isInquiries && inquiryActionCount > 0 && (
                    <Badge count={inquiryActionCount} className="ring-2 ring-[#1B4332]" />
                  )}
                  {isReports && pendingReportsCount > 0 && (
                    <Badge count={pendingReportsCount} className="ring-2 ring-[#1B4332]" />
                  )}
                </div>

                <span className={collapsed ? "hidden" : "block truncate"}>{t(item.labelKey)}</span>
              </NavLink>

              {/* Speech bubble — messages */}
              {isMessages && showPopup && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-left-2">
                  <div className="relative flex items-center gap-2.5 whitespace-nowrap rounded-2xl bg-[var(--agri-card)] px-4 py-2.5 text-sm font-semibold text-[#1B4332] dark:text-[var(--agri-brand-light)] shadow-2xl shadow-black/20 border border-[var(--agri-border-subtle)] ring-1 ring-black/5">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--agri-card)] rotate-45 border-l border-b border-[var(--agri-border-subtle)]" />
                    <span className="relative z-10 flex items-center gap-2">
                      <PulsingDot />
                      <span>{t("sidebar.newMessages")}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Speech bubble — transactions */}
              {isInquiries && showInquiryPopup && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-left-2">
                  <div className="relative flex items-center gap-2.5 whitespace-nowrap rounded-2xl bg-[var(--agri-card)] px-4 py-2.5 text-sm font-semibold text-[#1B4332] dark:text-[var(--agri-brand-light)] shadow-2xl shadow-black/20 border border-[var(--agri-border-subtle)] ring-1 ring-black/5">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--agri-card)] rotate-45 border-l border-b border-[var(--agri-border-subtle)]" />
                    <span className="relative z-10 flex items-center gap-2">
                      <PulsingDot />
                      <span>{inquiryPopupMessage}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Speech bubble — reports */}
              {isReports && showReportPopup && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-left-2">
                  <div className="relative flex items-center gap-2.5 whitespace-nowrap rounded-2xl bg-[var(--agri-card)] px-4 py-2.5 text-sm font-semibold text-[#1B4332] dark:text-[var(--agri-brand-light)] shadow-2xl shadow-black/20 border border-[var(--agri-border-subtle)] ring-1 ring-black/5">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--agri-card)] rotate-45 border-l border-b border-[var(--agri-border-subtle)]" />
                    <span className="relative z-10 flex items-center gap-2">
                      <PulsingDot />
                      <span>{reportPopupMessage || t("sidebar.newReportNeedsReview")}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}

      <div className="border-t border-white/10 p-3 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-start gap-3 px-4 py-2 rounded-lg text-green-200/60 hover:text-white hover:bg-white/10 text-sm transition-colors duration-200 cursor-pointer"
          title={
            collapsed ? t("sidebar.expandSidebar") : t("sidebar.collapseSidebar")
          }
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i
              className={`text-base ${
                !collapsed ? "ri-arrow-left-s-line" : "ri-arrow-right-s-line"
              }`}
            />
          </div>

          <span className={collapsed ? "hidden" : "block"}>
            {collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          </span>
        </button>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="bg-[#dc2626]/25 text-white/80 hover:bg-[#dc2626]/40 hover:text-white w-full flex items-center justify-start px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i className="ri-logout-box-line text-base" />
          </div>

          <span
            className={`flex-1 text-center pr-5 text-sm font-medium ${
              collapsed ? "hidden" : "block truncate"
            }`}
          >
            {t("common.logout")}
          </span>
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
