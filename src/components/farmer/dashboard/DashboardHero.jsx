import { useLanguage } from "../../../context/LanguageContext";

export default function DashboardHero({ profile, stats = {}, loading = false }) {
  const { t } = useLanguage();
  const displayName = profile?.fullname || profile?.username || "Farmer";

  return (
    <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-5 shadow-sm">
      <p className="text-sm text-[var(--agri-text-muted)]">{t("farmer.welcomeBack")}</p>

      <h1 className="mt-1 text-3xl font-bold text-(--agri-text)">{displayName}</h1>

      {loading ? (
        <div className="mt-3 h-5 w-80 max-w-full bg-(--agri-hover) rounded-md animate-pulse" />
      ) : (
        <p className="mt-3 max-w-2xl text-(--agri-brand) dark:text-(--agri-brand)">
          {t("farmer.heroSummary", {
            products: stats.totalProducts ?? 0,
            reviews: stats.reviewCount ?? 0,
            messages: stats.unreadMessages ?? 0,
          })}
        </p>
      )}
    </div>
  );
}
