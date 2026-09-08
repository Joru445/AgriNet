import { useLanguage } from "../../../context/LanguageContext";

export default function DashboardHeader({ profile, loading, onRefresh }) {
  const { t } = useLanguage();
  const displayName = profile?.fullname || profile?.username || t("farmer.farmerFallback");

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        {profile?.profilePicture ? (
          <img
            src={profile.profilePicture}
            alt={displayName}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-sm font-semibold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
            {displayName[0] ?? "?"}
          </div>
        )}

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-[var(--agri-text)]">
            {displayName}
          </h1>
          <p className="text-[11px] text-[var(--agri-text-muted)] font-medium">
            {t("farmer.dashboardSubtitle")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--agri-border)] bg-[var(--agri-card)] px-2.5 py-1 text-xs font-semibold text-[var(--agri-text-secondary)] shadow-2xs hover:bg-[var(--agri-hover)] disabled:opacity-50 transition cursor-pointer"
      >
        <i className={`ri-refresh-line text-sm ${loading ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">{t("admin.refresh")}</span>
      </button>
    </div>
  );
}
