import { useState } from "react";

import Avatar from "../common/Avatar";
import ConfirmDialog from "../ui/ConfirmDialog";

import { useSavedAccounts } from "../../hooks/useSavedAccounts";
import { useLanguage } from "../../context/LanguageContext";
import { showToast } from "../../utils/toast";

function getProviderLabel(provider) {
  switch (provider) {
    case "google.com":
      return "Google";
    case "facebook.com":
      return "Facebook";
    default:
      return "Password";
  }
}

function AccountMetadata({ account, t }) {
  const parts = [];
  if (account.role) parts.push(t(`roles.${account.role}`) || account.role);
  parts.push(getProviderLabel(account.provider));
  if (account.hasPasskey) parts.push(t("settings.passkey") || "Passkey");

  return (
    <span className="text-xs text-[var(--agri-text-muted)] truncate">
      {parts.join(" \u00b7 ")}
    </span>
  );
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

  function handleRowClick(account) {
    if (switching) return;
    if (account.uid === currentAccount?.uid) return;
    setConfirmTarget(account);
  }

  function handleRemove(e, account) {
    e.stopPropagation();
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
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--agri-text-muted)] mb-2">
        {t("settings.accounts")}
      </h2>

      <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] overflow-hidden">
        {/* Current account */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--agri-brand-bg)]/30">
          <Avatar
            src={currentAccount.avatar}
            name={currentAccount.email}
            size="xs"
          />
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[var(--agri-text)] truncate">
              {currentAccount.email}
            </span>
            <AccountMetadata account={currentAccount} t={t} />
          </div>
          <span className="shrink-0 rounded-full bg-[var(--agri-brand)] px-2 py-0.5 text-[10px] font-bold text-white">
            {t("settings.currentAccount")}
          </span>
        </div>

        {/* Other saved accounts */}
        {otherAccounts.map((account) => (
          <div
            key={account.uid}
            className="border-t border-[var(--agri-border-subtle)]"
          >
            <button
              type="button"
              onClick={() => handleRowClick(account)}
              disabled={switching}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--agri-hover)] disabled:opacity-50 cursor-pointer"
            >
              <Avatar
                src={account.avatar}
                name={account.email}
                size="xs"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[var(--agri-text)] truncate">
                  {account.email}
                </span>
                <AccountMetadata account={account} t={t} />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, account)}
                  disabled={switching}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--agri-text-muted)] transition hover:bg-red-500/10 hover:text-red-500 cursor-pointer disabled:opacity-50"
                  aria-label={t("settings.removeAccount") || "Remove account"}
                >
                  <i className="ri-close-line text-sm" />
                </button>
                <i className="ri-arrow-right-s-line text-[var(--agri-text-muted)] text-sm" />
              </div>
            </button>
          </div>
        ))}

        {/* Add account */}
        <div className="border-t border-[var(--agri-border-subtle)]">
          <button
            type="button"
            onClick={handleAddAccount}
            disabled={switching}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--agri-hover)] disabled:opacity-50 cursor-pointer"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--agri-brand-bg)] text-[var(--agri-brand)]">
              <i className="ri-add-line text-sm" />
            </div>
            <span className="text-sm font-medium text-[var(--agri-text-secondary)]">
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
