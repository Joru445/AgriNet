import ChartCard from "../../charts/ChartCard";
import TrendChart from "../../charts/TrendChart";
import { useLanguage } from "../../../context/LanguageContext";

export default function TransactionActivityCard({ analytics, range, onRangeChange, className = "" }) {
  const { t } = useLanguage();

  const points = analytics.data?.points ?? [];

  const empty = !analytics.loading && !analytics.error && points.every((p) => p.value === 0);

  return (
    <ChartCard
      title={t("adminMetrics.transactionActivity")}
      subtitle={t("adminMetrics.transactionActivitySubtitle")}
      range={range}
      onRangeChange={onRangeChange}
      loading={analytics.loading}
      error={analytics.error}
      empty={empty}
      emptyIcon="ri-file-list-3-line"
      emptyTitle={t("adminMetrics.noTransactions")}
      emptyDescription={t("adminMetrics.noTransactionsDesc")}
      className={className}
    >
      <TrendChart
        points={points}
        series={[{ key: "value", name: t("adminMetrics.transactionSeries") }]}
      />
    </ChartCard>
  );
}
