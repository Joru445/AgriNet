import { NavLink } from "react-router-dom";
import { useUnreadMessages } from "../../context/UnreadMessagesContext";
import { useUnreadInquiries } from "../../context/UnreadInquiriesContext";
import { useUnreadReports } from "../../context/UnreadReportsContext";
import { useLanguage } from "../../context/LanguageContext";
import { getOnboardingNavKey } from "../../constants/onboardingSteps";
import Badge, { PulsingDot } from "../ui/Badge";

export default function BottomNavigation({ items }) {
  const { t } = useLanguage();
  const { unreadCount, showPopup } = useUnreadMessages();
  const { inquiryActionCount, showInquiryPopup, inquiryPopupMessage } = useUnreadInquiries();
  const { pendingReportsCount, showReportPopup, reportPopupMessage } = useUnreadReports();

  return (
    <nav
      aria-label="Mobile navigation"
      className="shrink-0 border-t lg:hidden z-30 bg-(--agri-surface) border-(--agri-border) pb-[env(safe-area-inset-bottom,0px)] shadow-lg shadow-black/5"
    >
      <div className="flex h-16 items-center px-1">
        {items.map((item) => {
          const isMessages = item.to.includes("messages");
          const isInquiries = item.to.includes("transactions");
          const isReports = item.to.includes("reports");

          return (
            <div key={item.to} className="relative flex-1 flex items-center justify-center h-full">
              <NavLink
                to={item.to}
                end
                data-onboarding={getOnboardingNavKey(item.to)}
                className={({ isActive }) =>
                  `relative flex w-full h-full flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-150 select-none active:scale-95 min-h-[44px] ${
                    isActive
                      ? "text-[#2D6A4F] dark:text-(--agri-brand) font-bold"
                      : "text-(--agri-text-muted) hover:text-(--agri-text-secondary) font-medium"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active top indicator pill */}
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[2.5px] rounded-b-full bg-[#2D6A4F] dark:bg-(--agri-brand)" />
                    )}

                    <div className="relative flex items-center justify-center size-6 shrink-0 mt-0.5">
                      <i className={`${item.icon} text-xl leading-none`} />
                      {isMessages && unreadCount > 0 && (
                        <Badge count={unreadCount} className="!-top-1.5 !-right-2.5 min-w-[0.875rem] h-3.5 px-0.5 text-[9px] ring-2 ring-(--agri-surface)" />
                      )}
                      {isInquiries && inquiryActionCount > 0 && (
                        <Badge count={inquiryActionCount} className="!-top-1.5 !-right-2.5 min-w-[0.875rem] h-3.5 px-0.5 text-[9px] ring-2 ring-(--agri-surface)" />
                      )}
                      {isReports && pendingReportsCount > 0 && (
                        <Badge count={pendingReportsCount} className="!-top-1.5 !-right-2.5 min-w-[0.875rem] h-3.5 px-0.5 text-[9px] ring-2 ring-(--agri-surface)" />
                      )}
                    </div>

                    <span className="text-[10px] leading-tight truncate max-w-[68px] text-center tracking-tight">
                      {t(item.labelKey)}
                    </span>
                  </>
                )}
              </NavLink>

              {/* Mobile speech bubble — messages */}
              {isMessages && showPopup && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative flex items-center gap-2 rounded-xl bg-(--agri-card) px-3 py-1.5 text-xs font-semibold text-(--agri-text) shadow-xl border border-(--agri-border) max-w-[200px]">
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-(--agri-card) rotate-45 border-r border-b border-(--agri-border)" />
                    <PulsingDot className="!h-2 !w-2 shrink-0" />
                    <span className="truncate">{t("sidebar.newMessages")}</span>
                  </div>
                </div>
              )}

              {/* Mobile speech bubble — transactions */}
              {isInquiries && showInquiryPopup && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative flex items-center gap-2 rounded-xl bg-(--agri-card) px-3 py-1.5 text-xs font-semibold text-(--agri-text) shadow-xl border border-(--agri-border) max-w-[200px]">
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-(--agri-card) rotate-45 border-r border-b border-(--agri-border)" />
                    <PulsingDot className="!h-2 !w-2 shrink-0" />
                    <span className="truncate">{inquiryPopupMessage}</span>
                  </div>
                </div>
              )}

              {/* Mobile speech bubble — reports */}
              {isReports && showReportPopup && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative flex items-center gap-2 rounded-xl bg-(--agri-card) px-3 py-1.5 text-xs font-semibold text-(--agri-text) shadow-xl border border-(--agri-border) max-w-[200px]">
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-(--agri-card) rotate-45 border-r border-b border-(--agri-border)" />
                    <PulsingDot className="!h-2 !w-2 shrink-0" />
                    <span className="truncate">{reportPopupMessage || t("sidebar.newReport")}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

