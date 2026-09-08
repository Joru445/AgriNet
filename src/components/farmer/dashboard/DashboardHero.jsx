import { useLanguage } from "../../../context/LanguageContext";

export default function DashboardHero({ profile, stats = {}, loading = false }) {
  const { t } = useLanguage();
  const displayName = profile?.fullname || profile?.username || t("farmer.farmerFallback");

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-(--agri-border) bg-(--agri-card) px-4 py-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        {profile?.profilePicture ? (
          <img
            src={profile.profilePicture}
            alt={displayName}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-base font-semibold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
            {displayName[0] ?? "?"}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-xs text-[var(--agri-text-muted)]">{t("farmer.welcomeBack")}</p>

          <h1 className="truncate text-lg font-bold text-(--agri-text)">{displayName}</h1>

          {loading ? (
            <div className="mt-1 h-4 w-64 max-w-full bg-(--agri-hover) rounded-md animate-pulse" />
          ) : (
            <p className="truncate text-xs text-(--agri-brand) dark:text-(--agri-brand)">
              {t("farmer.heroSummary", {
                products: stats.totalProducts ?? 0,
                reviews: stats.reviewCount ?? 0,
                messages: stats.unreadMessages ?? 0,
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
