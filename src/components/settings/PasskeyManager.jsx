import { useState, useEffect, useCallback } from "react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { showToast } from "../../utils/toast";
import {
  registerPasskey,
  getRegisteredPasskeys,
  removePasskey,
  isPasskeyAvailable,
} from "../../services/webauthn.service";
import { updatePasskeyStatus } from "../../services/savedAccounts.service";
import ConfirmDialog from "../ui/ConfirmDialog";

/**
 * Passkey management section for the Settings page.
 * When `embedded` is true, renders without its own section wrapper
 * (used inside the Security card).
 */
export default function PasskeyManager({ embedded = false }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [passkeys, setPasskeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const loadPasskeys = useCallback(async () => {
    if (!user) return;
    try {
      const keys = await getRegisteredPasskeys();
      setPasskeys(keys);
      updatePasskeyStatus(user.uid, keys.length > 0);
    } catch (error) {
      console.error("Failed to load passkeys:", error);
    }
  }, [user]);

  useEffect(() => {
    isPasskeyAvailable().then(setSupported);
  }, []);

  useEffect(() => {
    if (user) loadPasskeys();
  }, [user, loadPasskeys]);

  async function handleRegister() {
    if (!user) return;
    setLoading(true);
    try {
      await registerPasskey();
      showToast.success(t("settings.passkeyRegistered") || "Passkey registered successfully");
      await loadPasskeys();
    } catch (error) {
      if (error.name === "NotAllowedError") return;
      showToast.error(error.message || "Failed to register passkey");
    } finally {
      setLoading(false);
    }
  }

  function handleRequestRemove(credentialId) {
    setConfirmRemove(credentialId);
  }

  async function handleConfirmRemove() {
    const credentialId = confirmRemove;
    setConfirmRemove(null);
    if (!credentialId || removingId) return;

    setRemovingId(credentialId);
    try {
      await removePasskey(credentialId);
      showToast.success(t("settings.passkeyRemoved") || "Passkey removed");
      await loadPasskeys();
    } catch (error) {
      showToast.error(error.message || "Failed to remove passkey");
    } finally {
      setRemovingId(null);
    }
  }

  if (!user) return null;

  const content = (
    <>
      {/* Register button */}
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={handleRegister}
          disabled={loading || supported === false}
          className="flex w-full items-center gap-3 text-left transition hover:bg-[var(--agri-hover)] rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--agri-brand-bg)] text-[var(--agri-brand)]">
            {loading ? (
              <i className="ri-loader-4-line animate-spin text-base" />
            ) : (
              <i className="ri-key-2-line text-base" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[var(--agri-text)]">
              {t("settings.registerPasskey") || "Register a Passkey"}
            </span>
            <span className="block text-xs text-[var(--agri-text-muted)]">
              {supported === false
                ? (t("settings.passkeyNotSupported") || "Not supported on this device")
                : (t("settings.registerPasskeyDesc") || "Add a passkey for faster sign-in")}
            </span>
          </div>
          <i className="ri-add-line text-[var(--agri-text-muted)]" />
        </button>
      </div>

      {/* Existing passkeys */}
      {passkeys.length > 0 && (
        <div className="border-t border-[var(--agri-border-subtle)]">
          {passkeys.map((key) => (
            <div
              key={key.credentialId}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
                <i className={`ri-${key.deviceType === "multiDevice" ? "smartphone" : "computer"}-line text-sm`} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm text-[var(--agri-text)] truncate">
                  {key.backedUp ? "Synced" : "Device"} &middot; {new Date(key.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRequestRemove(key.credentialId)}
                disabled={removingId !== null}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--agri-text-muted)] transition hover:bg-red-500/10 hover:text-red-500 cursor-pointer disabled:opacity-50"
                aria-label={t("settings.removePasskey") || "Remove passkey"}
              >
                {removingId === key.credentialId ? (
                  <i className="ri-loader-4-line animate-spin text-xs" />
                ) : (
                  <i className="ri-close-line text-sm" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {passkeys.length === 0 && !loading && (
        <div className="border-t border-[var(--agri-border-subtle)] px-4 py-2.5">
          <p className="text-xs text-[var(--agri-text-muted)]">
            {t("settings.noPasskeys") || "No passkeys registered"}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        onClose={() => setConfirmRemove(null)}
        onConfirm={handleConfirmRemove}
        title={t("settings.removePasskey") || "Remove Passkey"}
        description={t("settings.removePasskeyConfirm") || "Are you sure you want to remove this passkey?"}
        confirmLabel={t("common.remove") || "Remove"}
        cancelLabel={t("common.cancel") || "Cancel"}
        danger
      />
    </>
  );

  if (embedded) return content;

  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--agri-text-muted)] mb-2">
        {t("settings.passkeys") || "Passkeys"}
      </h2>
      <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] overflow-hidden">
        {content}
      </div>
    </section>
  );
}
