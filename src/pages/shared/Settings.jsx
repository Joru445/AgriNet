import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ThemeToggle from "../../components/settings/ThemeToggle";
import LanguageSelector from "../../components/settings/LanguageSelector";
import PushNotificationManager from "../../components/notifications/PushNotificationManager";
import NotificationPreferences from "../../components/notifications/NotificationPreferences";
import LogoutConfirmModal from "../../components/settings/LogoutConfirmModal";
import ConnectedAccounts from "../../components/settings/ConnectedAccounts";
import UserIdentity from "../../components/ui/UserIdentity";
import FarmerVerification from "../../components/farmer/verification/FarmerVerification";
import AccountSwitcher from "../../components/settings/AccountSwitcher";
import PasskeyManager from "../../components/settings/PasskeyManager";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { usePWAUpdate } from "../../hooks/usePWAUpdate";
import { getMePath } from "../../utils/routes";
import { showToast } from "../../utils/toast";
import LoginRequired from "../../components/ui/LoginRequired";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";

function SectionHeading({ children, className = "" }) {
  return (
    <h2 className={`text-xs font-semibold uppercase tracking-wider text-(--agri-text-muted) mb-2 ${className}`}>
      {children}
    </h2>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-(--agri-border) bg-(--agri-card) overflow-hidden ${className}`}>
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
        <h1 className="text-xl font-bold text-(--agri-text)">
          {t("settings.title")}
        </h1>
        <p className="mt-0.5 text-sm text-(--agri-text-muted)">
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
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-(--agri-hover)"
            >
              <UserIdentity
                user={profile}
                onlyPic={true}
                size="md"
                className="shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-(--agri-text) truncate">
                  {t("settings.myProfile")}
                </span>
                <span className="block text-xs text-(--agri-text-muted) truncate">
                  {profile.fullname || `@${profile.username || ""}`}
                </span>
              </span>
              <i className="ri-arrow-right-s-line shrink-0 text-(--agri-text-muted)" />
            </Link>

            <div className="border-t border-(--agri-border-subtle)">
              <Button
                type="button"
                variant="logout"
                onClick={() => setShowLogoutModal(true)}
                icon="ri-logout-box-line"
                fullWidth
                className="justify-start"
              >
                {t("common.logout")}
              </Button>
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
            <div className="border-t border-(--agri-border-subtle)">
              <ConnectedAccounts />
            </div>
          </SectionCard>
        </section>

        {/* ── Farmer Verification (farmers only) ──────────── */}
        {profile?.role === "farmer" && <FarmerVerification />}

        {/* ── Preferences ─────────────────────────────────── */}
        <section>
          <SectionHeading>{t("settings.preferences") || "Preferences"}</SectionHeading>
          <SectionCard className="divide-y divide-(--agri-border-subtle)">
            <LanguageSelector compact />
            <ThemeToggle compact />
          </SectionCard>
        </section>

        {/* ── Notifications ───────────────────────────────── */}
        <section>
          <SectionHeading>{t("settings.notifications")}</SectionHeading>
          <SectionCard className="divide-y divide-(--agri-border-subtle)">
            <div className="p-4">
              <PushNotificationManager onSubscriptionChange={setPushSubscribed} />
            </div>
            <div className="p-4">
              <p className={`text-xs font-semibold mb-3 ${pushSubscribed ? "text-(--agri-text-secondary)" : "text-gray-400"}`}>
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--agri-brand-bg) text-(--agri-brand)">
                  <i className="ri-refresh-line text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-(--agri-text)">
                    {t("settings.updateAvailable")}
                  </p>
                  <p className="text-xs text-(--agri-text-muted)">
                    {t("settings.updateDescription")}
                  </p>
                </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUpdate}
                disabled={updating}
                loading={updating}
                icon={updating ? undefined : "ri-download-cloud-2-line"}
              >
                {t("settings.updateApp") || t("settings.update") || "Update App"}
              </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--agri-hover) text-(--agri-text-muted)">
                  <i className="ri-check-line text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-(--agri-text)">
                    AgriNet
                  </p>
                  <p className="text-xs text-(--agri-text-muted)">
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
