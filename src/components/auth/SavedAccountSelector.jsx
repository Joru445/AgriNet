import { useState } from "react";
import Avatar from "../common/Avatar";
import { useLanguage } from "../../context/LanguageContext";

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

function getProviderLabel(provider) {
  switch (provider) {
    case "google.com":
      return "Google";
    case "facebook.com":
      return "Facebook";
    default:
      return null;
  }
}

const MAX_VISIBLE = 4;

/**
 * Compact saved-account selector.
 * Each account is a single clickable row — no action buttons underneath.
 * Clicking triggers the appropriate auth flow via the parent's callbacks.
 */
export default function SavedAccountSelector({
  accounts,
  passkeyLoading,
  onSelect,
  onSocialSelect,
  onPasskeySelect,
  onUseAnother,
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  if (!accounts || accounts.length === 0) return null;

  const visible = expanded ? accounts : accounts.slice(0, MAX_VISIBLE);
  const hasMore = accounts.length > MAX_VISIBLE && !expanded;

  function handleClick(account) {
    if (passkeyLoading) return;

    const isSocial =
      account.provider === "google.com" || account.provider === "facebook.com";
    const hasPasskey = account.hasPasskey && !isSocial;

    if (hasPasskey) {
      onPasskeySelect(account);
    } else if (isSocial) {
      onSocialSelect(account);
    } else {
      onSelect(account);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden bg-white">
        {visible.map((account) => {
          const isSocial =
            account.provider === "google.com" ||
            account.provider === "facebook.com";
          const hasPasskey = account.hasPasskey && !isSocial;
          const providerLabel = getProviderLabel(account.provider);

          return (
            <button
              key={account.uid}
              type="button"
              onClick={() => handleClick(account)}
              disabled={passkeyLoading}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <Avatar
                src={account.avatar}
                name={account.email}
                size="xs"
              />

              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-gray-900 truncate leading-tight">
                  {account.email}
                </span>
                <span className="block text-xs text-gray-400 truncate leading-tight mt-0.5">
                  {hasPasskey ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <i className="ri-key-2-line" />
                      {t("auth.login.passkey")}
                    </span>
                  ) : providerLabel ? (
                    <span className="inline-flex items-center gap-1">
                      <i className={getProviderIcon(account.provider)} />
                      {providerLabel}
                    </span>
                  ) : (
                    t("auth.login.password")
                  )}
                </span>
              </div>

              <span className="shrink-0 text-gray-300">
                <i className="ri-arrow-right-s-line" />
              </span>
            </button>
          );
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-gray-500 hover:text-[#2D6A4F] font-medium"
        >
          {t("auth.login.showMore")} ({accounts.length - MAX_VISIBLE})
        </button>
      )}

      <button
        type="button"
        onClick={onUseAnother}
        className="text-xs text-gray-500 hover:text-[#2D6A4F] font-medium"
      >
        + {t("auth.login.useAnotherAccount")}
      </button>
    </div>
  );
}
