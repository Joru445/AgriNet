import { useState, useRef, useEffect } from "react";

import { useLanguage } from "../../context/LanguageContext";

import usePushNotifications from "../../hooks/usePushNotifications";
import Alert from "../ui/Alert";

/**
 * Manages the push notification enable/disable toggle for the user.
 * Renders in the Settings page.
 *
 * Exposes the current subscription state via onSubscriptionChange
 * so the parent can conditionally disable dependent UI.
 *
 * Flow:
 *   1. If not supported → show "not supported" message
 *   2. If permission denied → show "blocked" message
 *   3. If supported → show toggle (on/off)
 *
 * Permission is only requested when the user enables the toggle.
 * Shows inline feedback for success/error states.
 */
export default function PushNotificationManager({ onSubscriptionChange }) {
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
  const [statusMessage, setStatusMessage] = useState(null); // "success" | "error"
  const statusTimer = useRef(null);

  // Report subscription state to parent whenever it changes.
  // This handles the init case where usePushNotifications detects an existing
  // token on mount — handleToggle is never called, so without this effect
  // the parent's pushSubscribed stays false.
  useEffect(() => {
    onSubscriptionChange?.(subscribed);
  }, [subscribed, onSubscriptionChange]);

  useEffect(() => {
    return () => {
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, []);

  const handleToggle = async () => {
    setRequesting(true);
    setStatusMessage(null);

    try {
      if (subscribed) {
        await unsubscribe();
        setStatusMessage("success");
      } else {
        const result = await requestPermission();
        if (result) setStatusMessage("success");
      }
    } catch {
      setStatusMessage("error");
    } finally {
      setRequesting(false);

      if (statusTimer.current) clearTimeout(statusTimer.current);
      statusTimer.current = setTimeout(() => setStatusMessage(null), 3000);
    }
  };

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
              {t("pushNotifications.title")}
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
      <div className="space-y-2">
        <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
              <i className="ri-notification-off-line text-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--agri-text-secondary)]">
                {t("pushNotifications.title")}
              </p>
              <p className="text-xs text-[var(--agri-text-muted)]">
                {t("pushNotifications.blocked")}
              </p>
            </div>
          </div>
        </div>
        <Alert variant="warning" message={t("pushNotifications.blocked")} />
      </div>
    );
  }

  // Supported — show toggle
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              subscribed
                ? "bg-[#D8F3DC] dark:bg-[var(--agri-brand-bg)] text-[#2D6A4F] dark:text-[var(--agri-brand)]"
                : "bg-[var(--agri-hover)] text-[var(--agri-text-muted)]"
            }`}
          >
            <i
              className={`text-lg ${
                subscribed ? "ri-notification-3-line" : "ri-notification-off-line"
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--agri-text)]">
              {t("pushNotifications.title")}
            </p>
            <p className="text-xs text-[var(--agri-text-muted)]">
              {t("pushNotifications.deviceDescription")}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={subscribed}
          disabled={requesting}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
            subscribed ? "bg-[var(--agri-brand)]" : "bg-gray-300"
          } ${requesting ? "opacity-50" : ""}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              subscribed ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Toggle feedback */}
      {statusMessage === "success" && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700 anim-fade-in">
          <i className="ri-check-line text-sm text-green-500" />
          <span>
            {subscribed
              ? t("pushNotifications.enableSuccess")
              : t("pushNotifications.disableSuccess")}
          </span>
        </div>
      )}

      {statusMessage === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 anim-fade-in">
          <i className="ri-error-warning-line text-sm text-red-500" />
          <span>
            {subscribed
              ? t("pushNotifications.enableFailed")
              : t("pushNotifications.disableFailed")}
          </span>
        </div>
      )}
    </div>
  );
}
