import { useState } from "react";

import { useLanguage } from "../../context/LanguageContext";

import usePushNotifications from "../../hooks/usePushNotifications";

/**
 * Manages the push notification enable/disable toggle for the user.
 * Renders in the Profile/Settings page.
 *
 * Flow:
 *   1. If not supported → show "not supported" message
 *   2. If supported but not subscribed → show "Enable notifications" button
 *   3. If subscribed → show "Disable notifications" toggle
 *
 * Permission is only requested when the user clicks "Enable".
 */
export default function PushNotificationManager() {
  const {
    supported,
    permission,
    subscribed,
    loading,
    requestPermission,
    unsubscribe,
  } = usePushNotifications();

  const { t } = useLanguage();
  const [requesting, setRequesting] = useState(false);

  if (loading) return null;

  // Not supported in this browser
  if (!supported) {
    return (
      <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
            <i className="ri-notification-off-line text-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--agri-text-secondary)]">
              {t("settings.notifications")}
            </p>
            <p className="text-xs text-[var(--agri-text-muted)]">
              {t("pushNotifications.notSupported")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Permission denied by user
  if (permission === "denied") {
    return (
      <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
            <i className="ri-notification-off-line text-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--agri-text-secondary)]">
              {t("settings.notifications")}
            </p>
            <p className="text-xs text-[var(--agri-text-muted)]">
              {t("pushNotifications.blocked")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Currently subscribed
  if (subscribed) {
    return (
      <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-[var(--agri-brand-bg)] text-[#2D6A4F] dark:text-[var(--agri-brand)]">
              <i className="ri-notification-3-line text-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--agri-text-secondary)]">
                {t("settings.notifications")}
              </p>
              <p className="text-xs text-[#2D6A4F] dark:text-[var(--agri-brand)] font-medium">
                {t("pushNotifications.enabled")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={unsubscribe}
            className="shrink-0 rounded-lg border border-[var(--agri-border)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-semibold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition-colors cursor-pointer"
          >
            {t("pushNotifications.disable")}
          </button>
        </div>
      </div>
    );
  }

  // Not subscribed — show enable button
  return (
    <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
            <i className="ri-notification-off-line text-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--agri-text-secondary)]">
              {t("settings.notifications")}
            </p>
            <p className="text-xs text-[var(--agri-text-muted)]">
              {t("pushNotifications.description")}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={requesting}
          onClick={async () => {
            setRequesting(true);
            try {
              await requestPermission();
            } finally {
              setRequesting(false);
            }
          }}
          className="shrink-0 rounded-lg bg-[#2D6A4F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1B4332] transition-colors cursor-pointer disabled:opacity-50"
        >
          {requesting ? t("pushNotifications.enabling") : t("pushNotifications.enable")}
        </button>
      </div>
    </div>
  );
}
