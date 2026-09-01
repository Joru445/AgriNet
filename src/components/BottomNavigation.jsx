import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { useUnreadMessages } from "../context/UnreadMessagesContext";
import { useUnreadInquiries } from "../context/UnreadInquiriesContext";
import { useUnreadReports } from "../context/UnreadReportsContext";
import useKeyboardVisible from "../hooks/useKeyboardVisible";
import Badge, { PulsingDot } from "./ui/Badge";

export default function BottomNavigation({ items }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isKeyboardVisible = useKeyboardVisible();
  const { unreadCount, showPopup } = useUnreadMessages();
  const { inquiryActionCount, showInquiryPopup, inquiryPopupMessage } = useUnreadInquiries();
  const { pendingReportsCount, showReportPopup, reportPopupMessage } = useUnreadReports();

  const isMessagesRoute = location.pathname.includes("messages");
  const hasActiveChat = isMessagesRoute && Boolean(searchParams.get("conversation") || searchParams.get("user"));

  if (isKeyboardVisible || hasActiveChat) {
    return null;
  }

  return (
    <nav className="shrink-0 border-t lg:hidden z-30 bg-[var(--agri-surface)] border-[var(--agri-border)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex h-16">
        {items.map((item) => {
          const isMessages = item.to.includes("messages");
          const isInquiries = item.to.includes("inquiries");
          const isReports = item.to.includes("reports");

          return (
            <div key={item.to} className="relative flex-1 flex items-center justify-center p-1">
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `relative flex w-full h-full flex-col items-center justify-center rounded-2xl active:bg-[var(--agri-active)] transition-colors duration-150 select-none ${
                    isActive ? "text-[#2D6A4F] dark:text-[var(--agri-brand)] font-bold" : "text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)]"
                  }`
                }
              >
                <div className="relative flex items-center justify-center">
                  <i className={`${item.icon} text-lg`} />
                  {isMessages && unreadCount > 0 && (
                    <Badge count={unreadCount} className="!-top-1 !-right-2 min-w-[0.875rem] h-3.5 px-0.5 text-[9px] ring-2 ring-[var(--agri-surface)]" />
                  )}
                  {isInquiries && inquiryActionCount > 0 && (
                    <Badge count={inquiryActionCount} className="!-top-1 !-right-2 min-w-[0.875rem] h-3.5 px-0.5 text-[9px] ring-2 ring-[var(--agri-surface)]" />
                  )}
                  {isReports && pendingReportsCount > 0 && (
                    <Badge count={pendingReportsCount} className="!-top-1 !-right-2 min-w-[0.875rem] h-3.5 px-0.5 text-[9px] ring-2 ring-[var(--agri-surface)]" />
                  )}
                </div>
                <span className="text-[10px]">{item.label}</span>
              </NavLink>

              {/* Mobile speech bubble — messages */}
              {isMessages && showPopup && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative flex items-center gap-2 whitespace-nowrap rounded-xl bg-[var(--agri-card)] px-3.5 py-2 text-xs font-semibold text-[#1B4332] dark:text-[var(--agri-brand-light)] shadow-xl border border-[var(--agri-border)] ring-1 ring-black/5">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--agri-card)] rotate-45 border-r border-b border-[var(--agri-border)]" />
                    <PulsingDot className="!h-2 !w-2" />
                    New messages
                  </div>
                </div>
              )}

              {/* Mobile speech bubble — inquiries */}
              {isInquiries && showInquiryPopup && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative flex items-center gap-2 whitespace-nowrap rounded-xl bg-[var(--agri-card)] px-3.5 py-2 text-xs font-semibold text-[#1B4332] dark:text-[var(--agri-brand-light)] shadow-xl border border-[var(--agri-border)] ring-1 ring-black/5">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--agri-card)] rotate-45 border-r border-b border-[var(--agri-border)]" />
                    <PulsingDot className="!h-2 !w-2" />
                    {inquiryPopupMessage}
                  </div>
                </div>
              )}

              {/* Mobile speech bubble — reports */}
              {isReports && showReportPopup && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative flex items-center gap-2 whitespace-nowrap rounded-xl bg-[var(--agri-card)] px-3.5 py-2 text-xs font-semibold text-[#1B4332] dark:text-[var(--agri-brand-light)] shadow-xl border border-[var(--agri-border)] ring-1 ring-black/5">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--agri-card)] rotate-45 border-r border-b border-[var(--agri-border)]" />
                    <PulsingDot className="!h-2 !w-2" />
                    {reportPopupMessage || "New report!"}
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
