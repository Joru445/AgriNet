import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useUnreadMessages } from "../context/UnreadMessagesContext";
import { useUnreadInquiries } from "../context/UnreadInquiriesContext";
import useKeyboardVisible from "../hooks/useKeyboardVisible";

export default function BottomNavigation({ items }) {
  const isKeyboardVisible = useKeyboardVisible();
  const { unreadCount, showPopup } = useUnreadMessages();
  const { inquiryActionCount, showInquiryPopup, inquiryPopupMessage } = useUnreadInquiries();
  const [activeGlow, setActiveGlow] = useState(null);

  if (isKeyboardVisible) {
    return null;
  }

  function handleTap(key) {
    setActiveGlow(key);
    setTimeout(() => {
      setActiveGlow((current) => (current === key ? null : current));
    }, 450);
  }

  return (
    <nav className="shrink-0 h-16 border-t lg:hidden z-30 bg-[#FAFAFA]" style={{ borderColor: 'var(--agri-border)' }}>
      <div className="flex h-16">
        {items.map((item) => {
          const isMessages = item.to.includes("messages");
          const isInquiries = item.to.includes("inquiries");

          return (
            <div key={item.to} className="relative flex-1 flex items-center justify-center">
              <NavLink
                to={item.to}
                end
                onClick={() => handleTap(item.to)}
                onTouchStart={() => handleTap(item.to)}
                className={({ isActive }) =>
                  `relative flex w-full h-full flex-col items-center justify-center transition-colors duration-150 select-none ${
                    isActive ? "text-[#2D6A4F] font-bold" : "text-gray-500"
                  }`
                }
              >
                {/* Messenger-like soft grey blur glow effect */}
                {activeGlow === item.to && (
                  <span className="absolute inset-x-2.5 inset-y-1.5 rounded-2xl bg-gray-300/50 backdrop-blur-xs animate-tap-glow pointer-events-none" />
                )}

                <div className="relative flex items-center justify-center">
                  <i className={`${item.icon} text-lg`} />
                  {isMessages && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                  {isInquiries && inquiryActionCount > 0 && (
                    <span className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
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
            </div>
          );
        })}
      </div>
    </nav>
  );
}

