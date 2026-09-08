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
        <div className="mt-1 flex items-center justify-center gap-4 text-[11px] font-medium text-[var(--agri-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--agri-brand)]" />
            {t("farmerMetrics.seriesAvailable")}: {sellingMode.available ?? 0}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ED8A19]" />
            {t("farmerMetrics.seriesPreorder")}: {sellingMode.preorder ?? 0}
          </span>
        </div>
      )}
    </ChartCard>
  );
}
