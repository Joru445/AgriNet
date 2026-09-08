import { useLanguage } from "../../../context/LanguageContext";

export default function TransactionStats({ summary }) {
  const { t } = useLanguage();

  if (!summary) return null;

  const cards = [
    {
      label: t("adminTransaction.totalTransactions"),
      value: summary.total,
      icon: "ri-file-list-3-line",
      color: "text-[#2D6A4F] dark:text-[var(--agri-brand)]",
      bg: "bg-[#2D6A4F]/10",
    },
    {
      label: t("adminTransaction.pending"),
      value: summary.statuses?.pending || 0,
      icon: "ri-time-line",
      color: "text-gray-500",
      bg: "bg-gray-500/10",
    },
    {
      label: t("adminTransaction.reserved"),
      value: summary.statuses?.reserved || 0,
      icon: "ri-bookmark-line",
      color: "text-violet-600",
      bg: "bg-violet-500/10",
    },
    {
      label: t("adminTransaction.ongoing"),
      value: summary.statuses?.ongoing || 0,
      icon: "ri-loader-4-line",
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: t("adminTransaction.completed"),
      value: summary.statuses?.completed || 0,
      icon: "ri-check-double-line",
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: t("adminTransaction.cancelled"),
      value: summary.statuses?.cancelled || 0,
      icon: "ri-close-circle-line",
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
