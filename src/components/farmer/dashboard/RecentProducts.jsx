import { Link } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import DashboardSection from "../../common/DashboardSection";
import SkeletonBox from "../../common/SkeletonBox";

// Show max 4 products
const MAX_DISPLAY = 4;

export default function RecentProducts({ products = [], loading = false }) {
  const { t } = useLanguage();
  const displayedProducts = products.slice(0, MAX_DISPLAY);

  const headerAction = (
    <Link
      to="/farmer/products"
      className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] dark:text-[var(--agri-brand)] transition hover:underline"
    >
      {t("farmer.viewAll")}
      <i className="ri-arrow-right-line text-xs" />
    </Link>
  );

  return (
    <DashboardSection
      title={t("farmer.recentProducts")}
      subtitle={
        loading
          ? t("farmer.loadingRecentProducts")
          : t("farmer.showingProducts", {
              displayed: displayedProducts.length,
              total: products.length,
            })
      }
      icon="ri-store-2-line"
      compact
      headerAction={headerAction}
    >
      {loading ? (
        <div className="space-y-2 p-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBox className="h-10 w-10" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBox className="h-3.5 w-3/4" />
                <SkeletonBox className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <i className="ri-store-2-line text-2xl text-[var(--agri-text-muted)]" />
          <p className="mt-2 text-sm font-medium text-[var(--agri-text-muted)]">
            {t("farmer.noProductsYet")}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--agri-border-subtle)]">
          {displayedProducts.map((product) => (
            <li key={product.id}>
              <Link
                to="/farmer/products"
                className="flex items-center gap-3 p-3 transition hover:bg-[var(--agri-hover)]/60"
              >
                {product.images?.[0]?.url || product.images?.[0] ? (
                  <img
                    src={product.images[0].url || product.images[0]}
                    alt={product.name || "Product"}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover border border-[var(--agri-border-subtle)]"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                    <i className="ri-shopping-basket-line text-base" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--agri-text)]">
                    {product.name || t("admin.unnamedProduct")}
                  </p>

                  <p
                    className={`mt-0.5 text-[11px] font-bold ${
                      product.available
                        ? "text-[#2D6A4F] dark:text-[var(--agri-brand)]"
                        : "text-[var(--agri-text-muted)]"
                    }`}
                  >
                    {product.available
                      ? t("admin.available")
                      : t("admin.unavailable")}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-black text-[#1B4332] dark:text-[var(--agri-brand-light)]">
                  ₱{Number(product.price || 0).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
