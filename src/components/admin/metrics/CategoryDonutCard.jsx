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

export default function CategoryDonutCard({ analytics, className = "" }) {
  const { t } = useLanguage();
  const { resolved } = useTheme();

  const categories = analytics.data?.categories ?? [];

  const items = categories.map((item, i) => ({
    name: t(CATEGORY_LABEL_KEY[item.category] ?? "products.categories.others"),
    value: item.count,
    color: colorAt(resolved, i),
  }));

  const empty = !analytics.loading && !analytics.error && categories.length === 0;

  return (
    <ChartCard
      title={t("adminMetrics.categoryDistribution")}
      subtitle={t("adminMetrics.categoryDistributionSubtitle")}
      loading={analytics.loading}
      error={analytics.error}
      empty={empty}
      emptyIcon="ri-pie-chart-line"
      emptyTitle={t("adminMetrics.noProducts")}
      emptyDescription={t("adminMetrics.noProductsDesc")}
      className={className}
    >
      <DonutChart items={items} centerLabel={t("adminMetrics.products")} />
    </ChartCard>
  );
}
