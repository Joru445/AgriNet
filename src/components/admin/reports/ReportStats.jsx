import { useLanguage } from "../../../context/LanguageContext";

import StatCard from "../../common/StatCard";

export default function ReportStats({ stats }) {
  const { t } = useLanguage();

  const cards = [
    {
      label: t("adminReport.totalReports"),
      value: stats.total,
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-1">
      {cards.map((card) => (
        <StatCard key={card.label} title={card.label} value={card.value} />
      ))}
    </div>
  );
}
