import { useMemo } from "react";
import ChartCard from "../../charts/ChartCard";
import TrendChart from "../../charts/TrendChart";
import { useLanguage } from "../../../context/LanguageContext";

export default function InquiryTrendCard({
  analytics,
  stats,
  range,
  onRangeChange,
  className = "",
}) {
  const { t } = useLanguage();

  const rawPoints = analytics.data?.points ?? [];

  // Harmonize points with live dashboard stats if analytics aggregation lags
  const points = useMemo(() => {
    if (!rawPoints.length || stats?.completedInquiries == null) return rawPoints;
    const totalCompletedInPoints = rawPoints.reduce(
      (sum, p) => sum + (Number(p.completed) || 0),
      0,
    );
    const diff = stats.completedInquiries - totalCompletedInPoints;
    if (diff <= 0) return rawPoints;

    return rawPoints.map((p, idx) => {
      if (idx !== rawPoints.length - 1) return p;
      const updatedCompleted = (Number(p.completed) || 0) + diff;
      const updatedTotal = Math.max(Number(p.total) || 0, updatedCompleted);
      return {
        ...p,
        completed: updatedCompleted,
        total: updatedTotal,
      };
    });
  }, [rawPoints, stats?.completedInquiries]);

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
