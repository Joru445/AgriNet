import { useLanguage } from "../../context/LanguageContext";

export default function ProfileStats({ stats, role, className = "" }) {
  const { t } = useLanguage();
  const transactions = stats?.transactions;
  if (!transactions) return null;

  const cards = [
    ["ri-exchange-dollar-line", t("profile.stats.transactions"), transactions.total],
    ["ri-checkbox-circle-line", t("profile.stats.completed"), transactions.completed],
    ["ri-line-chart-line", t("userProfileModal.successRate"), transactions.successRate == null ? t("userProfileModal.notAvailable") : `${transactions.successRate}%`],
  ];
  if (role === "farmer") {
    cards.push(["ri-store-2-line", t("profile.stats.products"), stats.farmer?.activeProducts ?? t("userProfileModal.notAvailable")]);
    cards.push(["ri-star-line", t("profile.rating"), stats.reputation?.averageRating == null ? t("userProfileModal.notAvailable") : Number(stats.reputation.averageRating).toFixed(1)]);
  }

  return (
    <section aria-label={t("profile.farmStats")} className={`flex flex-wrap divide-x divide-y divide-(--agri-border-subtle) overflow-hidden border-y border-(--agri-border-subtle) bg-(--agri-surface) ${className}`}>
      {cards.map(([icon, label, value]) => (
        <div key={label} className="min-w-[9rem] flex-1 px-4 py-3 sm:px-5">
          <span className="flex items-center gap-1.5 text-xs text-(--agri-text-muted)"><i className={`${icon} text-[#2D6A4F] dark:text-(--agri-brand)`} />{label}</span>
          <strong className="mt-1 block text-base text-(--agri-text)">{value}</strong>
        </div>
      ))}
    </section>
  );
}
