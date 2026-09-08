import { useLanguage } from "../../../context/LanguageContext";

import ProductTableRow from "./ProductTableRow";

export default function ProductTable({
  products,
  onView,
  onToggleAvailability,
  actionLoading,
  pagination,
  onPageChange,
}) {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-12 text-center shadow-md shadow-black/5">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
          <i className="ri-store-2-line text-3xl" />
        </div>
        <p className="text-sm font-semibold text-[var(--agri-text)]">
          {t("adminProduct.noProductsFound")}
        </p>
        <p className="mt-1 text-xs text-[var(--agri-text-muted)]">
          {t("adminProduct.noProductsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-md shadow-black/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminProduct.product")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminProduct.farmer")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminProduct.price")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminProduct.stock")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminProduct.sellingMode")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminProduct.status")}
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminProduct.reports")}
              </th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminProduct.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onView={onView}
                onToggleAvailability={onToggleAvailability}
                actionLoading={actionLoading}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--agri-border-subtle)] px-5 py-3">
          <p className="text-xs text-[var(--agri-text-muted)]">
            {t("adminProduct.showingCount", {
              count: products.length,
              total: pagination.total,
            })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("adminProduct.previousPage")}
            </button>
            <span className="text-xs font-semibold text-[var(--agri-text-muted)]">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("adminProduct.nextPage")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
