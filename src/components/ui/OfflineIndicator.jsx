import { useEffect, useState } from "react";

import { useLanguage } from "../../context/LanguageContext";

/**
 * Displays a persistent banner when the device loses internet connectivity.
 * Automatically hides when connection is restored.
 *
 * Also shows a brief "Reconnecting..." state when transitioning back online,
 * giving Firestore time to sync pending writes.
 */
export default function OfflineIndicator() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
      setIsReconnecting(true);

      // Show "reconnecting" for a brief period while Firestore syncs
      const timer = setTimeout(() => setIsReconnecting(false), 3000);
      return () => clearTimeout(timer);
    }

    function handleOffline() {
      setIsOffline(true);
      setIsReconnecting(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !isReconnecting) return null;

  return (
    <div
      className="shrink-0 z-[9996] flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white anim-slide-down"
      role="alert"
      aria-live="assertive"
      style={{
        backgroundColor: isOffline ? "#D97706" : "#2D6A4F",
      }}
    >
      {isOffline ? (
        <>
          <i className="ri-wifi-off-line text-sm" />
          <span>{t("offline.message")}</span>
        </>
      ) : (
        <>
          <i className="ri-refresh-line text-sm animate-spin" />
          <span>{t("offline.reconnecting")}</span>
        </>
      )}
    </div>
  );
}
