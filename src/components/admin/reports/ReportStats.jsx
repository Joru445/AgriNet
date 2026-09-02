import { useLanguage } from "../../../context/LanguageContext";

import StatCard from "../../common/StatCard"

export default function ReportStats({ stats }) {
  const { t } = useLanguage();

  const cards = [
    {
      label: t("adminReport.totalReports"),
      value: stats.total,
    },
    {
      label: t("adminReport.pending"),
      value: stats.pending,
    },
    {
      label: t("adminReport.reviewing"),
      value: stats.reviewing,
    },
    {
      label: t("adminReport.resolved"),
      value: stats.resolved,
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} title={card.label} value={card.value}/>
      ))}
    </div>
  );
}
