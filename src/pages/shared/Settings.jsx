import { Link } from "react-router-dom";

import ThemeToggle from "../../components/common/ThemeToggle";
import LanguageSelector from "../../components/common/LanguageSelector";
import PushNotificationManager from "../../components/common/PushNotificationManager";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getMePath } from "../../utils/routes";

export default function Settings() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  if (!profile) return null;

  const mePath = getMePath(profile.role);

  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6 pb-18 md:pb-4">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--agri-text)]">
            {t("settings.title")}
          </h1>

          <p className="mt-1 text-sm text-[var(--agri-text-muted)]">
            {t("settings.subtitle")}
          </p>
        </div>

        <Link
          to={mePath}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-4 py-2 text-sm font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)]"
        >
          <i className="ri-user-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          {t("settings.myProfile")}
        </Link>
      </div>

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
    </main>
  );
}