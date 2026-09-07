import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  PROVIDER_IDS,
  getSocialLinkErrorMessage,
  isProviderLinked,
  linkProvider,
} from "../../services/auth.service";
import { showToast } from "../../utils/toast";

const PROVIDERS = [
  { method: "google", providerId: PROVIDER_IDS.google },
  { method: "facebook", providerId: PROVIDER_IDS.facebook },
];

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return <i className="ri-facebook-circle-fill text-xl text-[#1877F2] shrink-0" />;
}

export default function ConnectedAccounts() {
  const { user, refreshAuthUser } = useAuth();
  const { t } = useLanguage();
  const [linking, setLinking] = useState(null);

  async function handleConnect(method) {
    if (linking) return;

    const item = PROVIDERS.find((p) => p.method === method);
    if (!item) return;

    if (isProviderLinked(item.providerId, user)) {
      return;
    }

    setLinking(method);

    try {
      await linkProvider(item.providerId);
      await refreshAuthUser();

      showToast.success(
        t(
          method === "google"
            ? "auth.errors.googleConnected"
            : "auth.errors.facebookConnected",
        ),
      );
    } catch (error) {
      console.error(`Failed to link ${method}:`, error);
      showToast.error(getSocialLinkErrorMessage(error, method));
    } finally {
      setLinking(null);
    }
  }

  return (
    <div className="divide-y divide-[var(--agri-border-subtle)]">
      {PROVIDERS.map(({ method, providerId }) => {
        const connected = isProviderLinked(providerId, user);
        const busy = linking === method;

        return (
          <div key={method} className="flex items-center gap-3 px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)]">
              {method === "google" ? <GoogleIcon /> : <FacebookIcon />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--agri-text)]">
                {t(`settings.${method}`)}
              </p>
              <p
                className={`text-xs ${
                  connected
                    ? "font-semibold text-[var(--agri-brand)]"
                    : "text-[var(--agri-text-muted)]"
                }`}
              >
                {connected
                  ? t("settings.connected")
                  : t("settings.notConnected")}
              </p>
            </div>

            {!connected && (
              <button
                type="button"
                onClick={() => handleConnect(method)}
                disabled={busy}
                className="shrink-0 rounded-lg bg-[var(--agri-brand-bg)] px-3 py-1.5 text-xs font-bold text-[var(--agri-brand)] transition hover:bg-[var(--agri-brand)]/15 cursor-pointer disabled:opacity-50"
              >
                {busy ? (
                  <i className="ri-loader-4-line animate-spin" />
                ) : (
                  t("settings.connect")
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}