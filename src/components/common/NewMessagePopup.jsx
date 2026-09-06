import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useUnreadMessages } from "../../context/UnreadMessagesContext";
import { getRoleHome } from "../../utils/routes";
import Avatar from "./Avatar";

export default function NewMessagePopup({ collapsed = true }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { latestPopup, dismissPopup } = useUnreadMessages();
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (!latestPopup) {
      setIsShowing(false);
      return;
    }

    // Trigger enter animation
    setIsShowing(true);

    // Auto-disappear after 5 seconds
    const timer = setTimeout(() => {
      setIsShowing(false);
      setTimeout(() => {
        dismissPopup();
      }, 400);
    }, 5000);

    return () => clearTimeout(timer);
  }, [latestPopup, dismissPopup]);

  if (!latestPopup) return null;

  const roleAddress = getRoleHome(profile?.role);
  const targetUrl = `${roleAddress}/messages?conversation=${latestPopup.conversationId}`;

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 sm:right-auto sm:w-84 lg:bottom-6 z-50 transition-all duration-300 ease-in-out transform ${
        isShowing
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      } ${collapsed ? "lg:left-24" : "lg:left-68"}`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--agri-card)]/95 backdrop-blur-md border border-[#2D6A4F]/25 p-3.5 shadow-2xl shadow-black/15 ring-1 ring-black/5 hover:scale-[1.02] transition-transform">
        {/* Page / Message icon with red dot */}
        <div className="relative shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/30 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
          {latestPopup.senderAvatar ? (
            <Avatar
              src={latestPopup.senderAvatar}
              name={latestPopup.senderName}
              size="md"
            />
          ) : (
            <i className="ri-message-3-fill text-xl text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          )}

          {/* Tiny pulsing red dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 ring-2 ring-[var(--agri-card)]" />
          </span>
        </div>

        {/* Message preview details */}
        <Link
          to={targetUrl}
          onClick={dismissPopup}
          className="flex-1 min-w-0 group"
        >
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-[#1B4332] dark:text-[var(--agri-brand-light)] truncate group-hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)] transition-colors">
              {latestPopup.senderName}
            </h4>
            <span className="text-[10px] font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.2 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {t("messages.newMessage")}
            </span>
          </div>

          <p className="text-xs text-[var(--agri-text-secondary)] truncate mt-0.5 group-hover:text-[var(--agri-text)] transition-colors font-medium">
            {latestPopup.messageText}
          </p>
        </Link>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => {
            setIsShowing(false);
            setTimeout(dismissPopup, 300);
          }}
          className="h-6 w-6 shrink-0 flex items-center justify-center rounded-full text-[var(--agri-text-muted)] hover:text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition-colors cursor-pointer"
          title={t("common.close")}
        >
          <i className="ri-close-line text-sm" />
        </button>
      </div>
    </div>
  );
}
