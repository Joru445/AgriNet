import ChartCard from "../../charts/ChartCard";
import TrendChart from "../../charts/TrendChart";
import { useLanguage } from "../../../context/LanguageContext";

export default function UserGrowthCard({ analytics, range, onRangeChange, className = "" }) {
  const { t } = useLanguage();

  const points = analytics.data?.points ?? [];

  const empty = !analytics.loading && !analytics.error && points.every((p) => p.value === 0);

  return (
    <ChartCard
      title={t("adminMetrics.userGrowth")}
      subtitle={t("adminMetrics.userGrowthSubtitle")}
      range={range}
      onRangeChange={onRangeChange}
      loading={analytics.loading}
      error={analytics.error}
      empty={empty}
      emptyIcon="ri-user-add-line"
      emptyTitle={t("adminMetrics.noRegistrations")}
      emptyDescription={t("adminMetrics.noRegistrationsDesc")}
      className={className}
    >
      <TrendChart
        points={points}
        series={[{ key: "value", name: t("adminMetrics.newUsersSeries") }]}
      />
    </ChartCard>
  );
}
