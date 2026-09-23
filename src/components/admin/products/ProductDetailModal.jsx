import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { formatDate } from "../../../utils/date";
import { showToast } from "../../../utils/toast";
import ResponsiveModal from "../../ui/ResponsiveModal";
import Button from "../../ui/Button";

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
    <ResponsiveModal
      open={Boolean(productId)}
      onClose={onClose}
      title={t("adminProduct.detailsTitle")}
      maxWidth="max-w-2xl"
    >
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
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Status & Overview Banner Card */}
            <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                    {t("adminProduct.status")}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-xs ${product.available ? "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30" : "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30"}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      {product.available ? t("adminProduct.available") : t("adminProduct.unavailable")}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs ${isPreorder ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20" : "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/20"}`}>
                      <i className={isPreorder ? "ri-timer-line" : "ri-checkbox-circle-line"} />
                      {isPreorder ? t("adminProduct.preorder") : t("adminProduct.availableNow")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {product.ratingSummary && (
                    <div className="flex items-center gap-1 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) px-3 py-1.5 shadow-2xs">
                      <i className="ri-star-fill text-amber-500 text-xs" />
                      <span className="text-xs font-bold text-(--agri-text)">
                        {product.ratingSummary.average?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-[10px] text-(--agri-text-muted) font-medium">
                        ({product.ratingSummary.count || 0})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Images */}
            {product.images?.length > 0 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1">
                {product.images.map((img, idx) => (
                  <div key={idx} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-(--agri-hover) border border-(--agri-border) shadow-xs hover:shadow-md transition">
                    <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}

            {/* Product Info */}
            <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-[#52B788] text-xs">
                  <i className="ri-store-2-line" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wide text-(--agri-text)">
                  {t("adminProduct.productInformation")}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminProduct.productName")}</span>
                  <p className="font-bold text-sm text-(--agri-text) mt-0.5">{product.name}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminProduct.category")}</span>
                  <p className="font-bold text-sm text-(--agri-text) mt-0.5">{product.category}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminProduct.price")}</span>
                  <p className="font-bold text-sm text-(--agri-text) mt-0.5">₱{product.price.toLocaleString()} / {product.unit}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminProduct.stock")}</span>
                  <p className={`font-bold text-sm mt-0.5 ${product.stock <= 0 ? "text-red-600 dark:text-red-400" : "text-(--agri-text)"}`}>
                    {product.stock} {product.unit}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminProduct.sellingMode")}</span>
                  <p className="font-bold text-sm text-(--agri-text) mt-0.5 capitalize">
                    {isPreorder ? t("adminProduct.preorder") : t("adminProduct.availableNow")}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminProduct.listingDuration")}</span>
                  <p className="font-bold text-sm text-(--agri-text) mt-0.5">
                    {product.durationHours ? `${product.durationHours}h` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-order Information */}
            {isPreorder && (
              <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs">
                    <i className="ri-timer-line" />
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                    {t("adminProduct.preorderInformation")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminProduct.preorderLimit")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {product.preOrderLimit ?? "—"} {product.unit}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminProduct.reserved")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {product.reservedQuantity ?? 0} {product.unit}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminProduct.remaining")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {remainingCapacity ?? "—"} {product.unit}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminProduct.preorderDeadline")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {product.preOrderDeadline ? formatDate(product.preOrderDeadline) : "—"}
                    </p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminProduct.expectedAvailability")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {product.expectedAvailableDate ? formatDate(product.expectedAvailableDate) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Farmer Info */}
            <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs">
                  <i className="ri-user-line" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wide text-(--agri-text)">
                  {t("adminProduct.farmerInformation")}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-(--agri-hover) border border-(--agri-border) shadow-2xs">
                  {product.farmer?.profilePicture ? (
                    <img src={product.farmer.profilePicture} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-(--agri-text-muted)">
                      <i className="ri-user-line text-lg" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm sm:text-base font-bold text-(--agri-text)">
                    {product.farmer?.fullname || product.farmer?.username || "—"}
                  </p>
                  <p className="truncate text-xs text-(--agri-text-secondary) font-medium">
                    @{product.farmer?.username || "—"}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleViewFarmer}
                  className="ml-auto shadow-xs"
                >
                  {t("adminProduct.viewFarmer")}
                </Button>
              </div>
            </div>

            {/* Reports */}
            <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400 text-xs">
                    <i className="ri-shield-alert-line" />
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-(--agri-text)">
                    {t("adminProduct.reports")} ({product.totalReports || 0})
                  </h3>
                </div>
                {product.totalReports > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleViewReports}
                    className="shadow-xs"
                  >
                    {t("adminProduct.viewAllReports")}
                  </Button>
                )}
              </div>

              {product.totalReports === 0 ? (
                <p className="text-xs sm:text-sm text-(--agri-text-muted) font-medium">
                  {t("adminProduct.noReports")}
                </p>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex gap-2 text-xs">
                    <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 font-bold text-orange-700 dark:text-orange-300 border border-orange-500/20 shadow-2xs">
                      {product.pendingReports || 0} {t("adminProduct.pending")}
                    </span>
                    <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 font-bold text-green-700 dark:text-green-300 border border-green-500/20 shadow-2xs">
                      {product.resolvedReports || 0} {t("adminProduct.resolved")}
                    </span>
                  </div>
                  {product.reports?.slice(0, 3).map((report) => (
                    <div key={report.id} className="rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) p-3 text-xs shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-(--agri-text)">{report.reason}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-2xs ${
                          report.status === "pending" ? "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/20" :
                          report.status === "reviewing" ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20" :
                          report.status === "resolved" ? "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/20" :
                          "bg-gray-500/10 text-(--agri-text-secondary) border border-gray-500/20"
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      {report.description && (
                        <p className="mt-1 text-(--agri-text-secondary) line-clamp-2 leading-relaxed">{report.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-(--agri-text-muted) font-medium">
              <span className="flex items-center gap-1.5">
                <i className="ri-calendar-line" />
                {t("adminProduct.created")}: {product.createdAt ? formatDate(product.createdAt) : "—"}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="ri-time-line" />
                {t("adminProduct.updated")}: {product.updatedAt ? formatDate(product.updatedAt) : "—"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 border-t border-(--agri-border-subtle) pt-4">
              <Button
                variant={product.available ? "danger" : "primary"}
                size="sm"
                onClick={handleToggle}
                disabled={actionLoading}
                className="shadow-xs"
              >
                {product.available ? t("adminProduct.disableProduct") : t("adminProduct.enableProduct")}
              </Button>
              <Button
                variant="cancel"
                size="md"
                onClick={onClose}
                className="shadow-2xs"
              >
                {t("common.close")}
              </Button>
            </div>
          </div>
        )}
    </ResponsiveModal>
  );
}
