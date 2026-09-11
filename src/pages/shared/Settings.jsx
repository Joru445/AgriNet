import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ThemeToggle from "../../components/common/ThemeToggle";
import LanguageSelector from "../../components/common/LanguageSelector";
import PushNotificationManager from "../../components/common/PushNotificationManager";
import NotificationPreferences from "../../components/common/NotificationPreferences";
import LogoutConfirmModal from "../../components/common/LogoutConfirmModal";
import ConnectedAccounts from "../../components/common/ConnectedAccounts";
import UserIdentity from "../../components/common/UserIdentity";
import FarmerVerification from "../../components/farmer/verification/FarmerVerification";
import AccountSwitcher from "../../components/settings/AccountSwitcher";
import PasskeyManager from "../../components/settings/PasskeyManager";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { usePWAUpdate } from "../../hooks/usePWAUpdate";
import { getMePath } from "../../utils/routes";
import { showToast } from "../../utils/toast";
import LoginRequired from "../../components/ui/LoginRequired";
import Loading from "../../components/Loading";

function SectionHeading({ children, className = "" }) {
  return (
    <h2 className={`text-xs font-semibold uppercase tracking-wider text-[var(--agri-text-muted)] mb-2 ${className}`}>
      {children}
    </h2>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, profile, logout, authInitializing } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { needRefresh, updateServiceWorker } = usePWAUpdate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  if (authInitializing) {
    return <Loading />;
  }

  if (!user) {
    return <LoginRequired title={t("settings.title")} />;
  }

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

  async function handleUpdate() {
    try {
      setUpdating(true);
      await updateServiceWorker(true);
    } catch (error) {
      console.error(error);
      showToast.error(t("settings.updateFailed"));
    } finally {
      setUpdating(false);
    }
  }

  if (!profile) return null;

  const mePath = getMePath(profile.role);

  return (
    <main className="mx-auto w-full max-w-2xl p-4 md:p-6 pb-18 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--agri-text)]">
          {t("settings.title")}
        </h1>
        <p className="mt-0.5 text-sm text-[var(--agri-text-muted)]">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* ── Account ─────────────────────────────────────── */}
        <section>
          <SectionHeading>{t("settings.account")}</SectionHeading>
          <SectionCard>
            <Link
              to={mePath}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--agri-hover)]"
            >
              <UserIdentity
                user={profile}
                onlyPic={true}
                size="md"
                className="shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[var(--agri-text)] truncate">
                  {t("settings.myProfile")}
                </span>
                <span className="block text-xs text-[var(--agri-text-muted)] truncate">
                  {profile.fullname || `@${profile.username || ""}`}
                </span>
              </span>
              <i className="ri-arrow-right-s-line shrink-0 text-[var(--agri-text-muted)]" />
            </Link>

            <div className="border-t border-[var(--agri-border-subtle)]">
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-red-500/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-500">
                  <i className="ri-logout-box-line text-lg" />
                </div>
                <span className="text-sm font-semibold text-red-500">
                  {t("common.logout")}
                </span>
              </button>
            </div>
          </SectionCard>
        </section>

        {/* ── Saved Accounts ──────────────────────────────── */}
        <AccountSwitcher />

        {/* ── Security ────────────────────────────────────── */}
        <section>
          <SectionHeading>{t("settings.security") || "Security"}</SectionHeading>
          <SectionCard>
            <PasskeyManager embedded />
            <div className="border-t border-[var(--agri-border-subtle)]">
              <ConnectedAccounts />
            </div>
          </SectionCard>
        </section>

        {/* ── Farmer Verification (farmers only) ──────────── */}
        {profile?.role === "farmer" && <FarmerVerification />}

        {/* ── Preferences ─────────────────────────────────── */}
        <section>
          <SectionHeading>{t("settings.preferences") || "Preferences"}</SectionHeading>
          <SectionCard className="divide-y divide-[var(--agri-border-subtle)]">
            <LanguageSelector compact />
            <ThemeToggle compact />
          </SectionCard>
        </section>

        {/* ── Notifications ───────────────────────────────── */}
        <section>
          <SectionHeading>{t("settings.notifications")}</SectionHeading>
          <SectionCard className="divide-y divide-[var(--agri-border-subtle)]">
            <div className="p-4">
              <PushNotificationManager onSubscriptionChange={setPushSubscribed} />
            </div>
            <div className="p-4">
              <p className={`text-xs font-semibold mb-3 ${pushSubscribed ? "text-[var(--agri-text-secondary)]" : "text-gray-400"}`}>
                {t("notificationPreferences.title")}
              </p>
              <NotificationPreferences pushEnabled={pushSubscribed} />
            </div>
          </SectionCard>
        </section>

        {/* ── About ───────────────────────────────────────── */}
        <section>
          <SectionHeading>{t("settings.appUpdate")}</SectionHeading>
          <SectionCard>
            {needRefresh ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-brand-bg)] text-[var(--agri-brand)]">
                  <i className="ri-refresh-line text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--agri-text)]">
                    {t("settings.updateAvailable")}
                  </p>
                  <p className="text-xs text-[var(--agri-text-muted)]">
                    {t("settings.updateDescription")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updating}
                  className="shrink-0 rounded-lg bg-[var(--agri-brand-dark)] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  {updating ? (
                    <i className="ri-loader-4-line animate-spin" />
                  ) : (
                    t("settings.update")
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
                  <i className="ri-check-line text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--agri-text)]">
                    AgriNet
                  </p>
                  <p className="text-xs text-[var(--agri-text-muted)]">
                    {t("settings.upToDate")}
                  </p>
                </div>
              </div>
            )}
          </SectionCard>
        </section>
      </div>

      <LogoutConfirmModal
        open={showLogoutModal}
        loggingOut={loggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </main>
  );
}
