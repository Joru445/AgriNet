import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ThemeToggle from "../../components/common/ThemeToggle";
import LanguageSelector from "../../components/common/LanguageSelector";
import PushNotificationManager from "../../components/common/PushNotificationManager";
import LogoutConfirmModal from "../../components/common/LogoutConfirmModal";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getMePath } from "../../utils/routes";
import { showToast } from "../../utils/toast";

export default function Settings() {
  const { profile, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();

      showToast.success(t("common.loggedOut"));
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error(error);

      showToast.error(error.message);
    } finally {
      setLoggingOut(false);
    }
  }

  if (!profile) return null;

  const mePath = getMePath(profile.role);

  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6 pb-18 md:pb-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--agri-text)]">
          {t("settings.title")}
        </h1>

        <p className="mt-1 text-sm text-[var(--agri-text-muted)]">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Account */}
      <section className="mb-6">
        <h2 className="text-sm font-bold text-[var(--agri-text)] mb-3">
          {t("settings.account")}
        </h2>

        <div className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] overflow-hidden">
          <Link
            to={mePath}
            className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-[var(--agri-hover)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
              <i className="ri-user-line text-lg" />
            </div>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[var(--agri-text)]">
                {t("settings.myProfile")}
              </span>
              <span className="block text-xs text-[var(--agri-text-muted)]">
                {profile.fullname || `@${profile.username || ""}`}
              </span>
            </span>
            <i className="ri-arrow-right-s-line ml-auto text-[var(--agri-text-muted)]" />
          </Link>

          <div className="border-t border-[var(--agri-border-subtle)]">
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-red-500/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <i className="ri-logout-box-line text-lg" />
              </div>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-red-500">
                  {t("common.logout")}
                </span>
              </span>
              <i className="ri-arrow-right-s-line ml-auto text-[var(--agri-text-muted)]" />
            </button>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="space-y-6">
        {/* Language */}
        <div>
          <h2 className="text-sm font-bold text-[var(--agri-text)] mb-3">
            {t("settings.language")}
          </h2>
          <LanguageSelector />
        </div>

        {/* Appearance */}
        <div>
          <h2 className="text-sm font-bold text-[var(--agri-text)] mb-3">
            {t("settings.appearance")}
          </h2>
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-sm font-bold text-[var(--agri-text)] mb-3">
            {t("settings.notifications")}
          </h2>
          <PushNotificationManager />
        </div>
      </section>

      <LogoutConfirmModal
        open={showLogoutModal}
        loggingOut={loggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </main>
  );
}