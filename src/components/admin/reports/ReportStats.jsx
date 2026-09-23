import { useLanguage } from "../../../context/LanguageContext";

import StatCard from "../../ui/StatCard";

export default function ReportStats({ stats }) {
  const { t } = useLanguage();

  const cards = [
    {
      label: t("adminReport.totalReports"),
      value: stats.total,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card) => (
        <StatCard
          compact
          key={card.label}
          title={card.label}
          value={card.value}
        />
      ))}
    </div>
  );
}
