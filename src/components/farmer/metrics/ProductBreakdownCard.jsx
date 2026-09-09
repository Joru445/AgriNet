import ChartCard from "../../charts/ChartCard";
import DonutChart from "../../charts/DonutChart";
import { useTheme } from "../../../context/ThemeContext";
import { colorAt } from "../../charts/ChartTheme";
import { useLanguage } from "../../../context/LanguageContext";

const CATEGORY_LABEL_KEY = {
  vegetables: "products.categories.vegetables",
  fruits: "products.categories.fruits",
  grains: "products.categories.grains",
  "root crops": "products.categories.rootCrops",
  herbs: "products.categories.herbs",
  livestock: "products.categories.livestock",
  poultry: "products.categories.poultry",
  seafood: "products.categories.seafood",
  other: "products.categories.others",
};

export default function ProductBreakdownCard({ analytics, className = "" }) {
  const { t } = useLanguage();
  const { resolved } = useTheme();

  const categories = analytics.data?.categories ?? [];
  const sellingMode = analytics.data?.sellingMode ?? {};

  const items = categories.map((item, i) => ({
    name: t(CATEGORY_LABEL_KEY[item.category] ?? "products.categories.others"),
    value: item.count,
    color: colorAt(resolved, i),
  }));

  const empty = !analytics.loading && !analytics.error && categories.length === 0;

  return (
    <ChartCard
      title={t("farmerMetrics.productBreakdown")}
      subtitle={t("farmerMetrics.productBreakdownSubtitle")}
      loading={analytics.loading}
      error={analytics.error}
      empty={empty}
      emptyIcon="ri-pie-chart-line"
      emptyTitle={t("farmerMetrics.noProducts")}
      emptyDescription={t("farmerMetrics.noProductsDesc")}
      className={className}
    >
      <DonutChart items={items} centerLabel={t("farmerMetrics.products")} />

      {!empty && (
        <div className="mt-2.5 flex items-center justify-center gap-3 pt-2.5 border-t border-[var(--agri-border-subtle)] text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 px-2.5 py-0.5 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{t("farmerMetrics.seriesAvailable")}: {sellingMode.available ?? 0}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 px-2.5 py-0.5 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>{t("farmerMetrics.seriesPreorder")}: {sellingMode.preorder ?? 0}</span>
          </span>
        </div>
      )}
    </ChartCard>
  );
}
