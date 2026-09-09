import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { formatDate } from "../../../utils/date";
import { showToast } from "../../../utils/toast";

export default function ProductDetailModal({ productId, onClose, onToggleAvailability, actionLoading }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      try {
        const { apiGetAdminProduct } = await import("../../../services/admin.service");
        const data = await apiGetAdminProduct(productId);
        if (!cancelled) {
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load product.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleToggle = async () => {
    if (!product) return;

    try {
      await onToggleAvailability(product.id, !product.available);
      setProduct((prev) => prev ? { ...prev, available: !prev.available } : prev);
      showToast.success(
        product.available
          ? t("adminProduct.productDisabled")
          : t("adminProduct.productEnabled"),
      );
    } catch {
      showToast.error(t("adminProduct.failedToUpdate"));
    }
  };

  const handleViewFarmer = () => {
    if (product?.farmer?.uid) {
      onClose();
      navigate(`/admin/users`);
    }
  };

  const handleViewReports = () => {
    onClose();
    navigate(`/admin/reports`);
  };

  const isPreorder = product?.sellingMode === "preorder";
  const remainingCapacity = isPreorder && product?.preOrderLimit != null
    ? product.preOrderLimit - (product.reservedQuantity ?? 0)
    : null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--agri-text-muted)] hover:bg-[var(--agri-hover)] hover:text-[var(--agri-text)] transition cursor-pointer"
          aria-label={t("common.close")}
        >
          <i className="ri-close-line text-lg" />
        </button>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <i className="ri-loader-4-line animate-spin text-2xl text-[#2D6A4F]" />
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {product && !loading && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-lg font-bold text-[var(--agri-text)]">
                {t("adminProduct.detailsTitle")}
              </h2>
              <p className="text-sm text-[var(--agri-text-muted)]">
                {t("adminProduct.detailsSubtitle")}
              </p>
            </div>

            {/* Product Images */}
            {product.images?.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <div key={idx} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--agri-hover)]">
                    <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}

            {/* Product Info */}
            <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 p-4">
              <h3 className="mb-3 text-sm font-bold text-[var(--agri-text)]">
                {t("adminProduct.productInformation")}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminProduct.productName")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">{product.name}</p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminProduct.category")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">{product.category}</p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminProduct.price")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">₱{product.price.toLocaleString()}/{product.unit}</p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminProduct.stock")}</span>
                  <p className={`font-semibold ${product.stock <= 0 ? "text-red-500" : "text-[var(--agri-text)]"}`}>
                    {product.stock} {product.unit}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminProduct.sellingMode")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">
                    {isPreorder ? t("adminProduct.preorder") : t("adminProduct.availableNow")}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminProduct.availability")}</span>
                  <p className={`font-semibold ${product.available ? "text-green-600" : "text-red-500"}`}>
                    {product.available ? t("adminProduct.available") : t("adminProduct.unavailable")}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminProduct.rating")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">
                    {product.ratingSummary?.average?.toFixed(1) || "0.0"} ({product.ratingSummary?.count || 0} reviews)
                  </p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminProduct.listingDuration")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">
                    {product.durationHours ? `${product.durationHours}h` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-order Information */}
            {isPreorder && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400">
                  <i className="ri-timer-line" />
                  {t("adminProduct.preorderInformation")}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-amber-600/70">{t("adminProduct.preorderLimit")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {product.preOrderLimit ?? "—"} {product.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-600/70">{t("adminProduct.reserved")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {product.reservedQuantity ?? 0} {product.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-600/70">{t("adminProduct.remaining")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {remainingCapacity ?? "—"} {product.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-600/70">{t("adminProduct.preorderDeadline")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {product.preOrderDeadline ? formatDate(product.preOrderDeadline) : "—"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-amber-600/70">{t("adminProduct.expectedAvailability")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {product.expectedAvailableDate ? formatDate(product.expectedAvailableDate) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Farmer Info */}
            <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 p-4">
              <h3 className="mb-3 text-sm font-bold text-[var(--agri-text)]">
                {t("adminProduct.farmerInformation")}
              </h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--agri-hover)]">
                  {product.farmer?.profilePicture ? (
                    <img src={product.farmer.profilePicture} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--agri-text-muted)]">
                      <i className="ri-user-line" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--agri-text)]">
                    {product.farmer?.fullname || product.farmer?.username || "—"}
                  </p>
                  <p className="text-xs text-[var(--agri-text-muted)]">
                    @{product.farmer?.username || "—"}
                  </p>
                </div>
                <button
                  onClick={handleViewFarmer}
                  className="ml-auto rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-semibold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer"
                >
                  {t("adminProduct.viewFarmer")}
                </button>
              </div>
            </div>

            {/* Reports */}
            <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[var(--agri-text)]">
                  {t("adminProduct.reports")} ({product.totalReports || 0})
                </h3>
                {product.totalReports > 0 && (
                  <button
                    onClick={handleViewReports}
                    className="text-xs font-semibold text-[#2D6A4F] hover:underline cursor-pointer"
                  >
                    {t("adminProduct.viewAllReports")}
                  </button>
                )}
              </div>

              {product.totalReports === 0 ? (
                <p className="text-sm text-[var(--agri-text-muted)]">
                  {t("adminProduct.noReports")}
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-3 text-xs">
                    <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 font-bold text-orange-600">
                      {product.pendingReports || 0} {t("adminProduct.pending")}
                    </span>
                    <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 font-bold text-green-600">
                      {product.resolvedReports || 0} {t("adminProduct.resolved")}
                    </span>
                  </div>
                  {product.reports?.slice(0, 3).map((report) => (
                    <div key={report.id} className="rounded-lg bg-[var(--agri-card)] p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--agri-text)]">{report.reason}</span>
                        <span className={`rounded-full px-2 py-0.5 font-bold ${
                          report.status === "pending" ? "bg-orange-500/10 text-orange-600" :
                          report.status === "reviewing" ? "bg-blue-500/10 text-blue-600" :
                          report.status === "resolved" ? "bg-green-500/10 text-green-600" :
                          "bg-gray-500/10 text-gray-600"
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      {report.description && (
                        <p className="mt-1 text-[var(--agri-text-muted)] line-clamp-2">{report.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="flex gap-4 text-xs text-[var(--agri-text-muted)]">
              <span>{t("adminProduct.created")}: {product.createdAt ? formatDate(product.createdAt) : "—"}</span>
              <span>{t("adminProduct.updated")}: {product.updatedAt ? formatDate(product.updatedAt) : "—"}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-[var(--agri-border-subtle)] pt-4">
              <button
                onClick={handleToggle}
                disabled={actionLoading}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition cursor-pointer disabled:opacity-50 ${
                  product.available
                    ? "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    : "bg-[#2D6A4F]/10 text-[#2D6A4F] hover:bg-[#2D6A4F]/20 dark:text-[var(--agri-brand)] dark:hover:bg-[var(--agri-brand)]/20"
                }`}
              >
                {product.available ? t("adminProduct.disableProduct") : t("adminProduct.enableProduct")}
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
