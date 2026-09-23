import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { formatFullDateTime, formatDate } from "../../../utils/date";
import ResponsiveModal from "../../ui/ResponsiveModal";
import Button from "../../ui/Button";

const STATUS_CONFIG = {
  pending: { color: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20", labelKey: "adminTransaction.statusPending" },
  accepted: { color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20", labelKey: "adminTransaction.statusAccepted" },
  reserved: { color: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20", labelKey: "adminTransaction.statusReserved" },
  ongoing: { color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20", labelKey: "adminTransaction.statusOngoing" },
  awaiting_proof: { color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20", labelKey: "adminTransaction.statusAwaitingProof" },
  proof_submitted: { color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20", labelKey: "adminTransaction.statusProofSubmitted" },
  completed: { color: "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20", labelKey: "adminTransaction.statusCompleted" },
  cancelled: { color: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20", labelKey: "adminTransaction.statusCancelled" },
};

export default function TransactionDetailModal({ inquiryId, onClose }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!inquiryId) return;

    let cancelled = false;

    async function fetchInquiry() {
      setLoading(true);
      setError(null);

      try {
        const { apiGetAdminTransaction } = await import("../../../services/admin.service");
        const data = await apiGetAdminTransaction(inquiryId);
        if (!cancelled) {
          setInquiry(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load transaction.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchInquiry();

    return () => {
      cancelled = true;
    };
  }, [inquiryId]);

  const handleViewFarmer = () => {
    if (inquiry?.farmer?.uid) {
      onClose();
      navigate(`/admin/users`);
    }
  };

  const handleViewConsumer = () => {
    if (inquiry?.consumer?.uid) {
      onClose();
      navigate(`/admin/users`);
    }
  };

  const handleViewProduct = () => {
    if (inquiry?.product?.id) {
      onClose();
      navigate(`/admin/products`);
    }
  };

  const isPreorder = inquiry?.type === "preorder";
  const statusCfg = inquiry ? (STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.pending) : null;
  const product = inquiry?.product;
  const remainingCapacity = isPreorder && product?.preOrderLimit != null
    ? product.preOrderLimit - (product.reservedQuantity ?? 0)
    : null;

  return (
    <ResponsiveModal
      open={Boolean(inquiryId)}
      onClose={onClose}
      title={t("adminTransaction.detailsTitle")}
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

        {inquiry && !loading && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Status & Overview Banner Card */}
            <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                    {t("adminTransaction.status")}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-xs ${statusCfg.color}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      {t(statusCfg.labelKey)}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs ${isPreorder ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20" : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20"}`}>
                      <i className={isPreorder ? "ri-timer-line" : "ri-shopping-bag-line"} />
                      {isPreorder ? t("adminTransaction.typePreorder") : t("adminTransaction.typeStandard")}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                    {t("adminTransaction.created")}
                  </span>
                  <p className="text-xs font-semibold text-(--agri-text) mt-0.5">
                    {inquiry.createdAt ? formatFullDateTime(inquiry.createdAt) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Farmer */}
              <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs">
                      <i className="ri-user-line" />
                    </span>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                      {t("adminTransaction.farmer")}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-(--agri-hover) border border-(--agri-border) shadow-2xs">
                      {inquiry.farmer?.profilePicture || inquiry.farmerSnapshot?.profilePicture ? (
                        <img
                          src={inquiry.farmer?.profilePicture || inquiry.farmerSnapshot?.profilePicture}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-(--agri-text-muted)">
                          <i className="ri-user-line text-lg" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm sm:text-base font-bold text-(--agri-text)">
                        {inquiry.farmer?.fullname || inquiry.farmerSnapshot?.fullname || "—"}
                      </p>
                      <p className="truncate text-xs text-(--agri-text-secondary) font-medium">
                        @{inquiry.farmer?.username || inquiry.farmerSnapshot?.username || "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleViewFarmer}
                  className="w-full shadow-xs"
                >
                  {t("adminTransaction.viewFarmer")}
                </Button>
              </div>

              {/* Consumer */}
              <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs">
                      <i className="ri-shopping-cart-line" />
                    </span>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                      {t("adminTransaction.consumer")}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-(--agri-hover) border border-(--agri-border) shadow-2xs">
                      {inquiry.consumer?.profilePicture || inquiry.consumerSnapshot?.profilePicture ? (
                        <img
                          src={inquiry.consumer?.profilePicture || inquiry.consumerSnapshot?.profilePicture}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-(--agri-text-muted)">
                          <i className="ri-user-line text-lg" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm sm:text-base font-bold text-(--agri-text)">
                        {inquiry.consumer?.fullname || inquiry.consumerSnapshot?.fullname || "—"}
                      </p>
                      <p className="truncate text-xs text-(--agri-text-secondary) font-medium">
                        @{inquiry.consumer?.username || inquiry.consumerSnapshot?.username || "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleViewConsumer}
                  className="w-full shadow-xs"
                >
                  {t("adminTransaction.viewConsumer")}
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-[#52B788] text-xs">
                    <i className="ri-store-2-line" />
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-(--agri-text)">
                    {t("adminTransaction.productInformation")}
                  </h3>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleViewProduct}
                  className="shadow-xs"
                >
                  {t("adminTransaction.viewProduct")}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminTransaction.productName")}</span>
                  <p className="font-bold text-sm text-(--agri-text) mt-0.5">
                    {inquiry.productSnapshot?.name || product?.name || "—"}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminTransaction.category")}</span>
                  <p className="font-bold text-sm text-(--agri-text) mt-0.5">
                    {product?.category || "—"}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminTransaction.quantity")}</span>
                  <p className="font-bold text-sm text-(--agri-text) mt-0.5">
                    {inquiry.quantity} {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminTransaction.price")}</span>
                  <p className="font-bold text-sm text-(--agri-text) mt-0.5">
                    ₱{(inquiry.productSnapshot?.price || product?.price || 0).toLocaleString()} / {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminTransaction.sellingMode")}</span>
                  <p className="font-bold text-sm text-(--agri-text) mt-0.5 capitalize">
                    {isPreorder ? t("adminTransaction.typePreorder") : t("adminTransaction.typeStandard")}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) block text-[10px] uppercase font-bold">{t("adminTransaction.productStatus")}</span>
                  <p className={`font-bold text-sm mt-0.5 ${product?.available ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {product?.available ? t("adminTransaction.available") : t("adminTransaction.unavailable")}
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-order Information */}
            {isPreorder && product && (
              <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs">
                    <i className="ri-timer-line" />
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                    {t("adminTransaction.preorderInformation")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminTransaction.preorderLimit")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {product.preOrderLimit ?? "—"} {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminTransaction.reserved")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {product.reservedQuantity ?? 0} {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminTransaction.remaining")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {remainingCapacity ?? "—"} {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminTransaction.requestedQuantity")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {inquiry.quantity} {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminTransaction.preorderDeadline")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {product.preOrderDeadline ? formatDate(product.preOrderDeadline) : "—"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 shadow-2xs">
                    <span className="text-amber-800/80 dark:text-amber-300/80 block text-[10px] uppercase font-bold">{t("adminTransaction.expectedAvailability")}</span>
                    <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mt-0.5">
                      {product.expectedAvailableDate ? formatDate(product.expectedAvailableDate) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 text-xs">
                  <i className="ri-history-line" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wide text-(--agri-text)">
                  {t("adminTransaction.timestamps")}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--agri-hover)/40 border border-(--agri-border-subtle) shadow-2xs">
                  <span className="text-(--agri-text-muted) font-semibold">{t("adminTransaction.created")}</span>
                  <span className="font-bold text-(--agri-text)">
                    {inquiry.createdAt ? formatFullDateTime(inquiry.createdAt) : "—"}
                  </span>
                </div>
                {inquiry.acceptedAt && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--agri-hover)/40 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-(--agri-text-muted) font-semibold">{t("adminTransaction.accepted")}</span>
                    <span className="font-bold text-(--agri-text)">
                      {formatFullDateTime(inquiry.acceptedAt)}
                    </span>
                  </div>
                )}
                {inquiry.reservedAt && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--agri-hover)/40 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-(--agri-text-muted) font-semibold">{t("adminTransaction.reserved")}</span>
                    <span className="font-bold text-(--agri-text)">
                      {formatFullDateTime(inquiry.reservedAt)}
                    </span>
                  </div>
                )}
                {inquiry.ongoingAt && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--agri-hover)/40 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-(--agri-text-muted) font-semibold">{t("adminTransaction.started")}</span>
                    <span className="font-bold text-(--agri-text)">
                      {formatFullDateTime(inquiry.ongoingAt)}
                    </span>
                  </div>
                )}
                {inquiry.completionRequestedAt && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--agri-hover)/40 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-(--agri-text-muted) font-semibold">{t("adminTransaction.completionRequested")}</span>
                    <span className="font-bold text-(--agri-text)">
                      {formatFullDateTime(inquiry.completionRequestedAt)}
                    </span>
                  </div>
                )}
                {inquiry.proofSubmittedAt && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--agri-hover)/40 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-(--agri-text-muted) font-semibold">{t("adminTransaction.proofSubmitted")}</span>
                    <span className="font-bold text-(--agri-text)">
                      {formatFullDateTime(inquiry.proofSubmittedAt)}
                    </span>
                  </div>
                )}
                {inquiry.completedAt && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--agri-hover)/40 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-green-700 dark:text-green-400 font-semibold">{t("adminTransaction.completed")}</span>
                    <span className="font-bold text-(--agri-text)">
                      {formatFullDateTime(inquiry.completedAt)}
                    </span>
                  </div>
                )}
                {inquiry.cancelledAt && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--agri-hover)/40 border border-(--agri-border-subtle) shadow-2xs">
                    <span className="text-red-700 dark:text-red-400 font-semibold">{t("adminTransaction.cancelled")}</span>
                    <span className="font-bold text-(--agri-text)">
                      {formatFullDateTime(inquiry.cancelledAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Proof */}
            {inquiry.proof && (
              <div className="rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs">
                    <i className="ri-file-shield-2-line" />
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-(--agri-text)">
                    {t("adminTransaction.proof")}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-(--agri-border) bg-(--agri-hover) shadow-xs">
                    <img
                      src={inquiry.proof.url}
                      alt="Transaction proof"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-(--agri-text-muted) font-medium">
                      {t("adminTransaction.submittedAt")}: {inquiry.proofSubmittedAt ? formatFullDateTime(inquiry.proofSubmittedAt) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Close */}
            <div className="flex justify-end border-t border-(--agri-border-subtle) pt-4">
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
