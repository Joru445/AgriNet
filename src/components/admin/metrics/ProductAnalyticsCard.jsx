import ChartCard from "../../charts/ChartCard";
import StackedBarChart from "../../charts/StackedBarChart";
import { useLanguage } from "../../../context/LanguageContext";

export default function ProductAnalyticsCard({ analytics, range, onRangeChange, className = "" }) {
  const { t } = useLanguage();

  const points = analytics.data?.points ?? [];

  const empty =
    !analytics.loading &&
    !analytics.error &&
    points.every((p) => p.total === 0);

  return (
    <ChartCard
      title={t("adminMetrics.productListings")}
      subtitle={t("adminMetrics.productListingsSubtitle")}
      range={range}
      onRangeChange={onRangeChange}
      loading={analytics.loading}
      error={analytics.error}
      empty={empty}
      emptyIcon="ri-shopping-bag-3-line"
      emptyTitle={t("adminMetrics.noListings")}
      emptyDescription={t("adminMetrics.noListingsDesc")}
      className={className}
    >
      <StackedBarChart
        points={points}
        series={[
          { key: "available", name: t("adminMetrics.seriesAvailable") },
          { key: "preorder", name: t("adminMetrics.seriesPreorder") },
        ]}
      />
    </ChartCard>
  );
}
