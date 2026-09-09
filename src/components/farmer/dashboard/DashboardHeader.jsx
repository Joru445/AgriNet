import { useLanguage } from "../../../context/LanguageContext";

export default function DashboardHeader({ profile, loading, onRefresh }) {
  const { t } = useLanguage();
  const displayName = profile?.fullname || profile?.username || t("farmer.farmerFallback");

  return (
    <div className="border-b border-[var(--agri-border-subtle)] bg-[var(--agri-card)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {profile?.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={displayName}
              className="h-10 w-10 shrink-0 rounded-full object-cover border-2 border-[#2D6A4F]/20 shadow-2xs"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-sm font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
              {displayName[0] ?? "?"}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-base sm:text-lg font-black text-[#1B4332] dark:text-[var(--agri-brand-light)]">
              {displayName}
            </h1>
            <p className="text-xs text-[var(--agri-text-muted)] font-medium">
              {t("farmer.dashboardSubtitle")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-bold text-[var(--agri-text-secondary)] shadow-2xs hover:bg-[var(--agri-hover)] hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)] disabled:opacity-50 transition cursor-pointer active:scale-95"
        >
          <i className={`ri-refresh-line text-sm ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{t("admin.refresh")}</span>
        </button>
      </div>
    </div>
  );
}
