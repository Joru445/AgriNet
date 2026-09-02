import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

import logo from "../assets/favicon.ico";

export default function Suspended() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleGoToLanding() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await logout();

      navigate("/landing", { replace: true });
    } catch (error) {
      console.error("Failed to log out:", error);
      setLoggingOut(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[var(--agri-page)] py-8 sm:px-6">
      {/* Brand */}

      <div className="mx-auto mb-8 flex items-center gap-3">
        <img src={logo} alt="AgriNet" className="h-12 w-12 object-contain" />

        <div>
          <h1 className="text-xl font-bold text-[#1B4332] dark:text-[var(--agri-brand-light)]">AgriNet</h1>

          <p className="text-sm text-[var(--agri-text-muted)]">{t("suspended.tagline")}</p>
        </div>
      </div>

      {/* Content */}

      <section className="mx-auto flex w-full max-w-2xl flex-1 items-center">
        <div className="w-full p-6 shadow-xl shadow-black/5 sm:rounded-3xl sm:border sm:border-[var(--agri-border-subtle)] sm:bg-[var(--agri-card)] sm:p-10">
          {/* Suspended Icon */}

          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 shadow-lg shadow-red-500/20">
              <i className="ri-lock-line text-3xl text-white" />
            </div>
          </div>

          {/* Heading */}

          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--agri-text)] sm:text-3xl">
              {t("suspended.title")}
            </h2>

            <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-red-500" />

            <p className="mx-auto mt-8 max-w-lg text-base leading-7 text-[var(--agri-text-secondary)] sm:text-lg">
              {t("suspended.description")}
            </p>
          </div>

          {/* Information */}

          <div className="mt-8 flex gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-card)] text-red-500 shadow-sm">
              <i className="ri-information-line text-xl" />
            </div>

            <p className="leading-6 text-[var(--agri-text-secondary)]">
              {t("suspended.infoText")}
            </p>
          </div>

          {/* Support */}

          <div className="mt-8 border-t border-[var(--agri-border-subtle)] pt-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                <i className="ri-customer-service-2-line text-2xl" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[var(--agri-text)]">
                  {t("suspended.needHelp")}
                </h3>

                <p className="mt-1 text-[var(--agri-text-secondary)]">
                  {t("suspended.supportText")}
                </p>

                <span className="mt-3 inline-block font-medium text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                  {t("suspended.contactSupport")}
                </span>
              </div>
            </div>
          </div>

          {/* Action */}

          <div className="mt-8 border-t border-[var(--agri-border-subtle)] pt-8">
            <button
              type="button"
              onClick={handleGoToLanding}
              disabled={loggingOut}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-[#2D6A4F] px-5 py-4 font-semibold text-[#2D6A4F] dark:text-[var(--agri-brand)] transition-colors hover:bg-[#2D6A4F] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="ri-home-4-line text-xl" />

              {loggingOut ? t("suspended.loggingOut") : t("suspended.goToLanding")}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}

      <footer className="mx-auto mt-10 text-center text-sm text-[var(--agri-text-muted)]">
        <p>© {new Date().getFullYear()} AgriNet. {t("suspended.copyright")}</p>
      </footer>
    </main>
  );
}
