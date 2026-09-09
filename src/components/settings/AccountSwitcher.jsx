import { useState } from "react";

import Avatar from "../common/Avatar";
import RoleBadge from "../common/RoleBadge";
import ConfirmDialog from "../ui/ConfirmDialog";

import { useSavedAccounts } from "../../hooks/useSavedAccounts";
import { useLanguage } from "../../context/LanguageContext";
import { showToast } from "../../utils/toast";

/**
 * Returns a provider icon class for display.
 */
function getProviderIcon(provider) {
  switch (provider) {
    case "google.com":
      return "ri-google-fill";
    case "facebook.com":
      return "ri-facebook-circle-fill";
    default:
      return "ri-mail-line";
  }
}

export default function AccountSwitcher() {
  const { t } = useLanguage();
  const {
    currentAccount,
    otherAccounts,
    removeAccount,
    switchToAccount,
    navigateToLogin,
  } = useSavedAccounts();

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [switching, setSwitching] = useState(false);

  async function handleSwitchConfirm() {
    if (!confirmTarget || switching) return;
    const target = confirmTarget;
    setConfirmTarget(null);
    setSwitching(true);
    try {
      await switchToAccount(target);
    } catch (error) {
      console.error("Failed to sign out before account switch:", error);
      showToast.error(t("common.error") || "Failed to switch account");
    } finally {
      setSwitching(false);
    }
  }

  function handleRemove(account) {
    if (account.uid === currentAccount?.uid) {
      setRemoveTarget(account);
      return;
    }
    removeAccount(account.uid);
    showToast.success(t("settings.accountRemoved"));
  }

  async function handleRemoveCurrentConfirm() {
    if (!removeTarget) return;
    const target = removeTarget;
    setRemoveTarget(null);
    removeAccount(target.uid);
    showToast.success(t("settings.accountRemoved"));
    try {
      await navigateToLogin(null);
    } catch (error) {
      console.error("Failed to sign out after removing current account:", error);
      showToast.error(t("common.error") || "Failed to sign out");
    }
  }

  async function handleAddAccount() {
    try {
      await navigateToLogin(null);
    } catch (error) {
      console.error("Failed to sign out for add account:", error);
      showToast.error(t("common.error") || "Failed to navigate to login");
    }
  }

  if (!currentAccount) return null;

  return (
    <section className="mb-6">
      <h2 className="text-sm font-bold text-[var(--agri-text)] mb-3">
        {t("settings.accounts")}
      </h2>

      <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] overflow-hidden shadow-sm">
        {/* Current account */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Avatar
            src={currentAccount.avatar}
            name={currentAccount.displayName}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[var(--agri-text)] truncate">
              {currentAccount.displayName || currentAccount.email}
            </span>
            <span className="block text-xs text-[var(--agri-text-muted)] truncate">
              {currentAccount.email}
            </span>
          </div>
          <RoleBadge role={currentAccount.role} />
          {currentAccount.hasPasskey && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              <i className="ri-key-2-line mr-0.5" />
              {t("settings.passkey")}
            </span>
          )}
          <span className="rounded-full bg-[var(--agri-brand-bg)] px-2.5 py-0.5 text-xs font-bold text-[var(--agri-brand)]">
            {t("settings.currentAccount")}
          </span>
        </div>

        {/* Other saved accounts */}
        {otherAccounts.map((account) => (
          <div
            key={account.uid}
            className="border-t border-[var(--agri-border-subtle)]"
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Avatar
                src={account.avatar}
                name={account.displayName}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[var(--agri-text)] truncate">
                  {account.displayName || account.email}
                </span>
                <span className="block text-xs text-[var(--agri-text-muted)] truncate flex items-center gap-1">
                  <i className={`${getProviderIcon(account.provider)} text-xs`} />
                  {account.email}
                  {account.hasPasskey && (
                    <i className="ri-key-2-line text-green-600 ml-1" />
                  )}
                </span>
              </div>
              <RoleBadge role={account.role} />
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmTarget(account)}
                  disabled={switching}
                  className="rounded-xl bg-[var(--agri-brand)] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  {switching ? (
                    <i className="ri-loader-4-line animate-spin" />
                  ) : account.hasPasskey ? (
                    t("settings.switchWithPasskey")
                  ) : (
                    t("settings.switchAccount")
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(account)}
                  disabled={switching}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--agri-text-muted)] transition hover:bg-red-500/10 hover:text-red-500 cursor-pointer disabled:opacity-50"
                >
                  <i className="ri-delete-bin-line text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add account */}
        <div className="border-t border-[var(--agri-border-subtle)]">
          <button
            type="button"
            onClick={handleAddAccount}
            disabled={switching}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--agri-hover)] disabled:opacity-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-brand-bg)] text-[var(--agri-brand)]">
              <i className="ri-add-line text-lg" />
            </div>
            <span className="text-sm font-semibold text-[var(--agri-text)]">
              {t("settings.addAccount")}
            </span>
          </button>
        </div>
      </div>

      {/* Switch confirmation */}
      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleSwitchConfirm}
        title={
          confirmTarget?.hasPasskey
            ? t("settings.switchWithPasskeyConfirm")
            : t("settings.switchAccountConfirm")
        }
        description={confirmTarget?.email}
        icon={confirmTarget?.hasPasskey ? "ri-key-2-line" : "ri-arrow-left-right-line"}
        loading={switching}
      />

      {/* Remove current account confirmation */}
      <ConfirmDialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveCurrentConfirm}
        title={t("settings.removeAccountConfirm")}
        description={removeTarget?.email}
        icon="ri-logout-box-line"
        danger
      />
    </section>
  );
}
