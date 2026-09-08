import { useNavigate } from "react-router-dom";

import ProfileHeader from "../../components/shared/me/ProfileHeader";
import ProfileForm from "../../components/shared/me/ProfileForm";
import FarmerSection from "../../components/shared/me/FarmerSection";
import ProfileSkeleton from "../../components/shared/me/ProfileSkeleton";

import { useAuth } from "../../context/AuthContext";
import { useOnboarding } from "../../context/OnboardingContext";
import { useLanguage } from "../../context/LanguageContext";
import useProfile from "../../hooks/useProfile";

import { getSettingsPath } from "../../utils/routes";
import LoginRequired from "../../components/ui/LoginRequired";

export default function Profile() {
  const { user, profile } = useAuth();
  const { startTour } = useOnboarding();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const {
    loading,
    saving,
    uploadingAvatar,

    editing,
    setEditing,

    form,
    stats,

    handleChange,
    handleVisibilityChange,
    handleSave,
    handleCancel,
    handleAvatar,
  } = useProfile(profile);

  if (!user) {
    return <LoginRequired title={t("nav.profile")} />;
  }

  if (loading || !profile) {
    return <ProfileSkeleton />;
  }

  const actions = [
    {
      id: "settings",
      icon: "ri-settings-3-line",
      title: t("profile.settings"),
      subtitle: t("profile.settingsSubtitle"),
      onClick: () => navigate(getSettingsPath(profile.role)),
    },
    {
      id: "tutorial",
      icon: "ri-play-circle-line",
      title: t("profile.replayTutorial"),
      subtitle: t("profile.replayTutorialSubtitle"),
      onClick: startTour,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl md:px-6 pb-18 md:pb-8 bg-(--agri-surface) sm:bg-transparent">
      <div className="anim-page-enter space-y-6">
        <ProfileHeader
          profile={form}
          editing={editing}
          saving={saving}
          uploadingAvatar={uploadingAvatar}
          onEdit={() => setEditing(true)}
          onCancel={handleCancel}
          onSave={handleSave}
          onAvatarChange={handleAvatar}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column: personal + farmer info */}
          <div className="space-y-6 px-4 md:px-0 lg:col-span-2">
            <ProfileForm form={form} editing={editing} onChange={handleChange} onVisibilityChange={handleVisibilityChange} />

            {form.role === "farmer" && (
              <FarmerSection
                form={form}
                stats={stats}
                editing={editing}
                onChange={handleChange}
                onVisibilityChange={handleVisibilityChange}
              />
            )}
          </div>

          {/* Side column: actions */}
          <div className="space-y-6 px-4 md:px-0">
            <div className="overflow-hidden rounded-3xl border border-(--agri-border-subtle) bg-(--agri-card) shadow-sm">
              <div className="border-b border-(--agri-border-subtle) px-5 py-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-(--agri-text)">
                  <i className="ri-sliders-horizontal-line text-lg text-[#2D6A4F] dark:text-(--agri-brand)" />
                  {t("profile.preferences")}
                </h2>
              </div>

              <div className="divide-y divide-(--agri-border-subtle)">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[var(--agri-hover)] cursor-pointer"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--agri-hover)] text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                      <i className={`${action.icon} text-lg`} />
                    </div>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[var(--agri-text)]">
                        {action.title}
                      </span>
                      <span className="block text-xs text-[var(--agri-text-muted)]">
                        {action.subtitle}
                      </span>
                    </span>

                    <i className="ri-arrow-right-s-line ml-auto text-xl text-[var(--agri-text-muted)]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}