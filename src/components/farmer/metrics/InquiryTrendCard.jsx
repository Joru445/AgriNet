import ChartCard from "../../charts/ChartCard";
import TrendChart from "../../charts/TrendChart";
import { useLanguage } from "../../../context/LanguageContext";

export default function InquiryTrendCard({ analytics, range, onRangeChange, className = "" }) {
  const { t } = useLanguage();

  const points = analytics.data?.points ?? [];

  const empty = !analytics.loading && !analytics.error && points.every((p) => p.total === 0);

  return (
    <ChartCard
      title={t("farmerMetrics.inquiryTrend")}
      subtitle={t("farmerMetrics.inquiryTrendSubtitle")}
      range={range}
      onRangeChange={onRangeChange}
      loading={analytics.loading}
      error={analytics.error}
      empty={empty}
      emptyIcon="ri-line-chart-line"
      emptyTitle={t("farmerMetrics.noInquiries")}
      emptyDescription={t("farmerMetrics.noInquiriesDesc")}
      className={className}
    >
      <TrendChart
        points={points}
        series={[
          { key: "total", name: t("farmerMetrics.seriesTotal") },
          { key: "completed", name: t("farmerMetrics.seriesCompleted") },
        ]}
      />
    </ChartCard>
  );
}
