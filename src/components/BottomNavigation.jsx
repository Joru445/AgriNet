import { useState } from "react";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { useUnreadMessages } from "../context/UnreadMessagesContext";
import { useUnreadInquiries } from "../context/UnreadInquiriesContext";
import { useUnreadReports } from "../context/UnreadReportsContext";
import useKeyboardVisible from "../hooks/useKeyboardVisible";

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
    <nav className="shrink-0 h-16 border-t lg:hidden z-30 bg-[#FAFAFA]" style={{ borderColor: 'var(--agri-border)' }}>
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
                  `relative flex w-full h-full flex-col items-center justify-center rounded-2xl active:bg-gray-200/80 transition-colors duration-150 select-none ${
                    isActive ? "text-[#2D6A4F] font-bold" : "text-gray-500 hover:text-gray-800"
                  }`
                }
              >
                <div className="relative flex items-center justify-center">
                  <i className={`${item.icon} text-lg`} />
                  {isMessages && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {isInquiries && inquiryActionCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs leading-none">
                      {inquiryActionCount > 99 ? "99+" : inquiryActionCount}
                    </span>
                  )}
                  {isReports && pendingReportsCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs leading-none">
                      {pendingReportsCount > 99 ? "99+" : pendingReportsCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{item.label}</span>
              </NavLink>

              {/* Mobile speech bubble — messages */}
              {isMessages && showPopup && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#1B4332] shadow-xl border border-gray-100 ring-1 ring-black/5">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100" />
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    New messages
                  </div>
                </div>
              )}

              {/* Mobile speech bubble — inquiries */}
              {isInquiries && showInquiryPopup && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#1B4332] shadow-xl border border-gray-100 ring-1 ring-black/5">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100" />
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    {inquiryPopupMessage}
                  </div>
                </div>
              )}

              {/* Mobile speech bubble — reports */}
              {isReports && showReportPopup && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  <div className="relative flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#1B4332] shadow-xl border border-gray-100 ring-1 ring-black/5">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100" />
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
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

