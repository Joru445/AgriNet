import { useState } from "react";
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
          <div>
            <p className="text-sm font-semibold text-[var(--agri-text-secondary)]">
              Push Notifications
            </p>
            <p className="text-xs text-[var(--agri-text-muted)]">
              Not supported in this browser
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
          <div>
            <p className="text-sm font-semibold text-[var(--agri-text-secondary)]">
              Push Notifications
            </p>
            <p className="text-xs text-[var(--agri-text-muted)]">
              Blocked by browser settings. Enable in your browser's site
              settings.
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-[var(--agri-brand-bg)] text-[#2D6A4F] dark:text-[var(--agri-brand)]">
              <i className="ri-notification-3-line text-lg" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--agri-text-secondary)]">
                Push Notifications
              </p>
              <p className="text-xs text-[#2D6A4F] dark:text-[var(--agri-brand)] font-medium">
                Enabled
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={unsubscribe}
            className="rounded-lg border border-[var(--agri-border)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-semibold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition-colors cursor-pointer"
          >
            Disable
          </button>
        </div>
      </div>
    );
  }

  // Not subscribed — show enable button
  return (
    <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
            <i className="ri-notification-off-line text-lg" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--agri-text-secondary)]">
              Push Notifications
            </p>
            <p className="text-xs text-[var(--agri-text-muted)]">
              Get notified about new messages and inquiries
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
          className="rounded-lg bg-[#2D6A4F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1B4332] transition-colors cursor-pointer disabled:opacity-50"
        >
          {requesting ? "Enabling..." : "Enable"}
        </button>
      </div>
    </div>
  );
}
