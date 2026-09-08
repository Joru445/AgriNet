import { useLanguage } from "../../../context/LanguageContext";

export default function ProductStats({ stats }) {
  const { t } = useLanguage();

  const cards = [
    {
      label: t("adminProduct.totalProducts"),
      value: stats.total,
      icon: "ri-archive-line",
      color: "text-[#2D6A4F] dark:text-[var(--agri-brand)]",
      bg: "bg-[#2D6A4F]/10",
    },
    {
      label: t("adminProduct.availableProducts"),
      value: stats.available,
      icon: "ri-checkbox-circle-line",
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: t("adminProduct.unavailableProducts"),
      value: stats.unavailable,
      icon: "ri-close-circle-line",
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: t("adminProduct.preorderProducts"),
      value: stats.preorder,
      icon: "ri-timer-line",
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      label: t("adminProduct.reportedProducts"),
      value: stats.reported,
      icon: "ri-alert-line",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-4 shadow-md shadow-black/5"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
              <i className={`${card.icon} text-lg`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--agri-text-muted)] truncate">
                {card.label}
              </p>
              <p className="text-lg font-bold text-[var(--agri-text)]">
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
