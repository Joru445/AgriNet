import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileHeader from "../../components/shared/me/ProfileHeader";
import ProfileForm from "../../components/shared/me/ProfileForm";
import FarmerSection from "../../components/shared/me/FarmerSection";
import ProfileSkeleton from "../../components/shared/me/ProfileSkeleton";
import LogoutConfirmModal from "../../components/common/LogoutConfirmModal";

import { useAuth } from "../../context/AuthContext";
import { useOnboarding } from "../../context/OnboardingContext";
import { useLanguage } from "../../context/LanguageContext";
import useProfile from "../../hooks/useProfile";

import { getSettingsPath } from "../../utils/routes";
import { showToast } from "../../utils/toast";

export default function Profile() {
  const { profile, logout } = useAuth();
  const { startTour } = useOnboarding();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const {
    loading,
    saving,
    uploadingAvatar,

    editing,
    setEditing,

    form,
    stats,

    handleChange,
    handleSave,
    handleCancel,
    handleAvatar,
  } = useProfile(profile);

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

  return (
    <main className="flex-1">
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="bg-[var(--agri-card)] mx-auto max-w-6xl shadow-sm overflow-hidden pb-16 md:pb-8">
          <ProfileHeader
            profile={form}
            editing={editing}
            saving={saving}
            uploadingAvatar={uploadingAvatar}
            onEdit={() => setEditing(true)}
            onCancel={handleCancel}
            onSave={handleSave}
            onLogout={() => setShowLogoutModal(true)}
            onAvatarChange={handleAvatar}
          />

          <ProfileForm form={form} editing={editing} onChange={handleChange} />

          {form.role === "farmer" && (
            <FarmerSection
              form={form}
              stats={stats}
              editing={editing}
              onChange={handleChange}
            />
          )}

          {/* Preferences */}
          <div className="border-t border-[var(--agri-border-subtle)] px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-sm font-bold text-[var(--agri-text)] mb-4">
              {t("profile.preferences")}
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate(getSettingsPath(profile?.role))}
                className="flex items-center gap-3 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-4 py-3 text-left transition hover:bg-[var(--agri-hover)] cursor-pointer"
              >
                <i className="ri-settings-3-line text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />

                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--agri-text)]">
                    {t("profile.settings")}
                  </span>
                  <span className="block text-xs text-[var(--agri-text-muted)]">
                    {t("profile.settingsSubtitle")}
                  </span>
                </span>

                <i className="ri-arrow-right-s-line ml-auto text-[var(--agri-text-muted)]" />
              </button>

              <button
                type="button"
                onClick={startTour}
                className="flex items-center gap-3 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-4 py-3 text-left transition hover:bg-[var(--agri-hover)] cursor-pointer"
              >
                <i className="ri-play-circle-line text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />

                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--agri-text)]">
                    {t("profile.replayTutorial")}
                  </span>
                  <span className="block text-xs text-[var(--agri-text-muted)]">
                    {t("profile.replayTutorialSubtitle")}
                  </span>
                </span>

                <i className="ri-arrow-right-s-line ml-auto text-[var(--agri-text-muted)]" />
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutConfirmModal
        open={showLogoutModal}
        loggingOut={loggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </main>
  );
}
