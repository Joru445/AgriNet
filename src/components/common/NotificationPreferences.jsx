import { useState, useCallback, useRef, useEffect } from "react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { apiRequest } from "../../services/api/api.client";

/**
 * Manages the user's notification category preferences:
 *   - messages: new message notifications
 *   - transactions: inquiry/transaction status notifications
 *
 * Reads defaults from the user profile (notificationPreferences).
 * Saves changes through the backend API.
 *
 * When pushEnabled is false, category toggles are visually muted
 * and non-interactive to indicate that push must be enabled first.
 *
 * Shows inline success/error feedback after save attempts.
 *
 * State is synced with the profile via useEffect so that:
 *   - On mount, toggles reflect persisted backend values
 *   - If profile changes from onSnapshot after mount, state updates
 *   - During a save, the user's toggle is not overwritten
 */
export default function NotificationPreferences({ pushEnabled = true }) {
  const { profile } = useAuth();
  const { t } = useLanguage();

  const prefs = profile?.notificationPreferences || {};
  const [messages, setMessages] = useState(() => prefs.messages !== false);
  const [transactions, setTransactions] = useState(() => prefs.transactions !== false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null
  const saveStatusTimer = useRef(null);
  const savingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (saveStatusTimer.current) clearTimeout(saveStatusTimer.current);
    };
  }, []);

  // Sync local state with profile when notificationPreferences change.
  // Skips sync while a save is in progress to avoid overwriting the user's toggle.
  useEffect(() => {
    if (savingRef.current) return;

    const latestPrefs = profile?.notificationPreferences;
    if (!latestPrefs || typeof latestPrefs !== "object") return;

    setMessages(latestPrefs.messages !== false);
    setTransactions(latestPrefs.transactions !== false);
  }, [profile?.notificationPreferences]);

  const updatePreference = useCallback(
    async (key, value) => {
      savingRef.current = true;
      setSaving(true);
      setSaveStatus(null);

      try {
        await apiRequest("/users/me/notification-preferences", {
          method: "PATCH",
          body: JSON.stringify({ [key]: value }),
        });

        setSaveStatus("success");
      } catch (error) {
        console.error("[Prefs] Failed to update notification preference:", error);

        if (key === "messages") setMessages((prev) => !prev);
        if (key === "transactions") setTransactions((prev) => !prev);

        setSaveStatus("error");
      } finally {
        savingRef.current = false;
        setSaving(false);

        if (saveStatusTimer.current) clearTimeout(saveStatusTimer.current);
        saveStatusTimer.current = setTimeout(() => setSaveStatus(null), 3000);
      }
    },
    [],
  );

  const handleToggle = useCallback(
    (key, currentValue) => {
      const next = !currentValue;

      if (key === "messages") setMessages(next);
      if (key === "transactions") setTransactions(next);

      updatePreference(key, next);
    },
    [updatePreference],
  );

  const disabled = !pushEnabled || saving;

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] overflow-hidden">
        {/* Messages */}
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                pushEnabled
                  ? "bg-[var(--agri-hover)] text-[var(--agri-text-muted)]"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <i className="ri-message-3-line text-base" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  pushEnabled ? "text-[var(--agri-text)]" : "text-gray-400"
                }`}
              >
                {t("notificationPreferences.messages")}
              </p>
              <p className="text-xs text-[var(--agri-text-muted)]">
                {t("notificationPreferences.messagesDescription")}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={messages}
            aria-label={t("notificationPreferences.messages")}
            disabled={disabled}
            onClick={() => handleToggle("messages", messages)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
            } ${messages && pushEnabled ? "bg-[var(--agri-brand)]" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                messages && pushEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Transactions */}
        <div className="border-t border-[var(--agri-border-subtle)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  pushEnabled
                    ? "bg-[var(--agri-hover)] text-[var(--agri-text-muted)]"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <i className="ri-exchange-funds-line text-base" />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    pushEnabled ? "text-[var(--agri-text)]" : "text-gray-400"
                  }`}
                >
                  {t("notificationPreferences.transactions")}
                </p>
                <p className="text-xs text-[var(--agri-text-muted)]">
                  {t("notificationPreferences.transactionsDescription")}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={transactions}
              aria-label={t("notificationPreferences.transactions")}
              disabled={disabled}
              onClick={() => handleToggle("transactions", transactions)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
              } ${transactions && pushEnabled ? "bg-[var(--agri-brand)]" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  transactions && pushEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Disabled hint */}
        {!pushEnabled && (
          <div className="border-t border-[var(--agri-border-subtle)] px-4 py-2.5">
            <p className="text-xs text-[var(--agri-text-muted)] flex items-center gap-1.5">
              <i className="ri-information-line text-sm" />
              {t("notificationPreferences.pushRequired")}
            </p>
          </div>
        )}
      </div>

      {/* Save feedback */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700 anim-fade-in">
          <i className="ri-check-line text-sm text-green-500" />
          <span>{t("notificationPreferences.saveSuccess")}</span>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 anim-fade-in">
          <i className="ri-error-warning-line text-sm text-red-500" />
          <span>{t("notificationPreferences.saveFailed")}</span>
        </div>
      )}
    </div>
  );
}
