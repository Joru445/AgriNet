import StatCard from "../../common/StatCard"

export default function ReportStats({ stats }) {
  const cards = [
    {
      label: "Total Reports",
      value: stats.total,
    },
    {
      label: "Pending",
      value: stats.pending,
    },
    {
      label: "Reviewing",
      value: stats.reviewing,
    },
    {
      label: "Resolved",
      value: stats.resolved,
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard title={card.label} value={card.value}/>
      ))}
    </div>
  );
}
