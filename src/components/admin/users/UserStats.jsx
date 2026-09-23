import { useLanguage } from "../../../context/LanguageContext";

export default function UserStats({ stats }) {
  const { t } = useLanguage();

  const cards = [
    {
      label: t("admin.totalUsers"),
      value: stats.total,
      description: t("admin.registeredUsers"),
      icon: "ri-team-line",
      color: "text-[#2D6A4F] dark:text-[#52B788]",
      bg: "bg-[#2D6A4F]/10",
    },
    {
      label: t("admin.farmers"),
      value: stats.farmers,
      description: t("admin.registeredFarmers"),
      icon: "ri-plant-line",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: t("admin.consumers"),
      value: stats.consumers,
      description: t("admin.registeredConsumers"),
      icon: "ri-shopping-basket-line",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: t("adminUser.suspended"),
      value: stats.suspended,
      description: t("admin.suspended"),
      icon: "ri-user-unfollow-line",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl shadow-2xs ${card.bg} ${card.color}`}>
              <i className={`${card.icon} text-lg sm:text-xl`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-(--agri-text-muted) truncate">
                {card.label}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-(--agri-text)">
                {typeof card.value === "number" ? card.value.toLocaleString() : (card.value ?? 0)}
              </p>
              {card.description && (
                <p className="text-[11px] text-(--agri-text-muted) truncate mt-0.5 hidden sm:block">
                  {card.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
