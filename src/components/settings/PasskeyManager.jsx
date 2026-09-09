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
 * Allows authenticated users to register, view, and remove passkeys.
 */
export default function PasskeyManager() {
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

      // Update saved accounts metadata
      updatePasskeyStatus(user.uid, keys.length > 0);
    } catch (error) {
      console.error("Failed to load passkeys:", error);
    }
  }, [user]);

  useEffect(() => {
    isPasskeyAvailable().then(setSupported);
  }, []);

  useEffect(() => {
    if (user) {
      loadPasskeys();
    }
  }, [user, loadPasskeys]);

  async function handleRegister() {
    if (!user) return;

    setLoading(true);
    try {
      await registerPasskey();
      showToast.success(t("settings.passkeyRegistered") || "Passkey registered successfully");
      await loadPasskeys();
    } catch (error) {
      if (error.name === "NotAllowedError") {
        // User cancelled — not an error
        return;
      }
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

  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold text-[var(--agri-text)] mb-3">
        {t("settings.passkeys") || "Passkeys"}
      </h2>

      <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] overflow-hidden shadow-sm">
        {/* Register button */}
        <div className="px-4 py-3.5">
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading || supported === false}
            className="flex w-full items-center gap-3 text-left transition hover:bg-[var(--agri-hover)] rounded-xl px-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-brand-bg)] text-[var(--agri-brand)]">
              {loading ? (
                <i className="ri-loader-4-line animate-spin text-lg" />
              ) : (
                <i className="ri-key-2-line text-lg" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--agri-text)]">
                {t("settings.registerPasskey") || "Register a Passkey"}
              </span>
              <span className="block text-xs text-[var(--agri-text-muted)]">
                {supported === false
                  ? (t("settings.passkeyNotSupported") || "Passkeys are not supported on this device")
                  : (t("settings.registerPasskeyDesc") || "Add a passkey for faster sign-in")}
              </span>
            </div>
            <i className="ri-add-line text-[var(--agri-text-muted)]" />
          </button>
        </div>

        {/* Existing passkeys */}
        {passkeys.length > 0 && (
          <div className="border-t border-[var(--agri-border-subtle)]">
            <div className="px-4 py-2.5">
              <span className="text-xs font-semibold text-[var(--agri-text-muted)] uppercase tracking-wide">
                {t("settings.existingPasskeys") || "Existing Passkeys"}
              </span>
            </div>

            {passkeys.map((key) => (
              <div
                key={key.credentialId}
                className="border-t border-[var(--agri-border-subtle)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <i className={`ri-${key.deviceType === "multiDevice" ? "smartphone" : "computer"}-line text-lg`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--agri-text)] truncate">
                      {t("settings.passkey") || "Passkey"} — {key.backedUp ? "Synced" : "Device"}
                    </span>
                    <span className="block text-xs text-[var(--agri-text-muted)]">
                      {t("settings.added") || "Added"} {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt && ` · ${t("settings.lastUsed") || "Last used"} ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRequestRemove(key.credentialId)}
                    disabled={removingId !== null}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--agri-text-muted)] transition hover:bg-red-500/10 hover:text-red-500 cursor-pointer disabled:opacity-50"
                    aria-label={t("settings.removePasskey") || "Remove passkey"}
                  >
                    {removingId === key.credentialId ? (
                      <i className="ri-loader-4-line animate-spin text-sm" />
                    ) : (
                      <i className="ri-delete-bin-line text-sm" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {passkeys.length === 0 && !loading && (
          <div className="border-t border-[var(--agri-border-subtle)] px-4 py-4">
            <p className="text-xs text-[var(--agri-text-muted)] text-center">
              {t("settings.noPasskeys") || "No passkeys registered yet"}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        onClose={() => setConfirmRemove(null)}
        onConfirm={handleConfirmRemove}
        title={t("settings.removePasskey") || "Remove Passkey"}
        description={t("settings.removePasskeyConfirm") || "Are you sure you want to remove this passkey? You will no longer be able to sign in with it."}
        confirmLabel={t("common.remove") || "Remove"}
        cancelLabel={t("common.cancel") || "Cancel"}
        danger
      />
    </section>
  );
}
