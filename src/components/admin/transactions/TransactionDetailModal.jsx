import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { formatFullDateTime, formatDate } from "../../../utils/date";
import ResponsiveModal from "../../ui/ResponsiveModal";

const STATUS_CONFIG = {
  pending: { color: "bg-gray-500/10 text-gray-600", labelKey: "adminTransaction.statusPending" },
  accepted: { color: "bg-emerald-500/10 text-emerald-600", labelKey: "adminTransaction.statusAccepted" },
  reserved: { color: "bg-violet-500/10 text-violet-600", labelKey: "adminTransaction.statusReserved" },
  ongoing: { color: "bg-blue-500/10 text-blue-600", labelKey: "adminTransaction.statusOngoing" },
  awaiting_proof: { color: "bg-blue-500/10 text-blue-600", labelKey: "adminTransaction.statusAwaitingProof" },
  proof_submitted: { color: "bg-orange-500/10 text-orange-600", labelKey: "adminTransaction.statusProofSubmitted" },
  completed: { color: "bg-green-500/10 text-green-600", labelKey: "adminTransaction.statusCompleted" },
  cancelled: { color: "bg-gray-500/10 text-gray-500", labelKey: "adminTransaction.statusCancelled" },
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
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-lg font-bold text-[var(--agri-text)]">
                {t("adminTransaction.detailsTitle")}
              </h2>
              <p className="text-sm text-[var(--agri-text-muted)]">
                {t("adminTransaction.detailsSubtitle")}
              </p>
            </div>

            {/* Status & Type */}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${statusCfg.color}`}>
                {t(statusCfg.labelKey)}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${isPreorder ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>
                <i className={isPreorder ? "ri-timer-line" : "ri-shopping-bag-line"} />
                {isPreorder ? t("adminTransaction.typePreorder") : t("adminTransaction.typeStandard")}
              </span>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-2 gap-4">
              {/* Farmer */}
              <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 p-4">
                <h3 className="mb-3 text-sm font-bold text-[var(--agri-text)]">
                  {t("adminTransaction.farmer")}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--agri-hover)]">
                    {inquiry.farmer?.profilePicture || inquiry.farmerSnapshot?.profilePicture ? (
                      <img
                        src={inquiry.farmer?.profilePicture || inquiry.farmerSnapshot?.profilePicture}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--agri-text-muted)]">
                        <i className="ri-user-line" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--agri-text)]">
                      {inquiry.farmer?.fullname || inquiry.farmerSnapshot?.fullname || "—"}
                    </p>
                    <p className="truncate text-xs text-[var(--agri-text-muted)]">
                      @{inquiry.farmer?.username || inquiry.farmerSnapshot?.username || "—"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleViewFarmer}
                  className="mt-3 w-full rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-semibold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer"
                >
                  {t("adminTransaction.viewFarmer")}
                </button>
              </div>

              {/* Consumer */}
              <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 p-4">
                <h3 className="mb-3 text-sm font-bold text-[var(--agri-text)]">
                  {t("adminTransaction.consumer")}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--agri-hover)]">
                    {inquiry.consumer?.profilePicture || inquiry.consumerSnapshot?.profilePicture ? (
                      <img
                        src={inquiry.consumer?.profilePicture || inquiry.consumerSnapshot?.profilePicture}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--agri-text-muted)]">
                        <i className="ri-user-line" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--agri-text)]">
                      {inquiry.consumer?.fullname || inquiry.consumerSnapshot?.fullname || "—"}
                    </p>
                    <p className="truncate text-xs text-[var(--agri-text-muted)]">
                      @{inquiry.consumer?.username || inquiry.consumerSnapshot?.username || "—"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleViewConsumer}
                  className="mt-3 w-full rounded-lg border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-semibold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer"
                >
                  {t("adminTransaction.viewConsumer")}
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[var(--agri-text)]">
                  {t("adminTransaction.productInformation")}
                </h3>
                <button
                  onClick={handleViewProduct}
                  className="text-xs font-semibold text-[#2D6A4F] hover:underline cursor-pointer"
                >
                  {t("adminTransaction.viewProduct")}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.productName")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">
                    {inquiry.productSnapshot?.name || product?.name || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.category")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">
                    {product?.category || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.quantity")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">
                    {inquiry.quantity} {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.price")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">
                    ₱{(inquiry.productSnapshot?.price || product?.price || 0).toLocaleString()}/{inquiry.productSnapshot?.unit || product?.unit || "kg"}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.sellingMode")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">
                    {isPreorder ? t("adminTransaction.typePreorder") : t("adminTransaction.typeStandard")}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.productStatus")}</span>
                  <p className={`font-semibold ${product?.available ? "text-green-600" : "text-red-500"}`}>
                    {product?.available ? t("adminTransaction.available") : t("adminTransaction.unavailable")}
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-order Information */}
            {isPreorder && product && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400">
                  <i className="ri-timer-line" />
                  {t("adminTransaction.preorderInformation")}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-amber-600/70">{t("adminTransaction.preorderLimit")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {product.preOrderLimit ?? "—"} {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-600/70">{t("adminTransaction.reserved")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {product.reservedQuantity ?? 0} {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-600/70">{t("adminTransaction.remaining")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {remainingCapacity ?? "—"} {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-600/70">{t("adminTransaction.requestedQuantity")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {inquiry.quantity} {inquiry.productSnapshot?.unit || product?.unit || "kg"}
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-600/70">{t("adminTransaction.preorderDeadline")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {product.preOrderDeadline ? formatDate(product.preOrderDeadline) : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-600/70">{t("adminTransaction.expectedAvailability")}</span>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      {product.expectedAvailableDate ? formatDate(product.expectedAvailableDate) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 p-4">
              <h3 className="mb-3 text-sm font-bold text-[var(--agri-text)]">
                {t("adminTransaction.timestamps")}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.created")}</span>
                  <p className="font-semibold text-[var(--agri-text)]">
                    {inquiry.createdAt ? formatFullDateTime(inquiry.createdAt) : "—"}
                  </p>
                </div>
                {inquiry.acceptedAt && (
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.accepted")}</span>
                    <p className="font-semibold text-[var(--agri-text)]">
                      {formatFullDateTime(inquiry.acceptedAt)}
                    </p>
                  </div>
                )}
                {inquiry.reservedAt && (
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.reserved")}</span>
                    <p className="font-semibold text-[var(--agri-text)]">
                      {formatFullDateTime(inquiry.reservedAt)}
                    </p>
                  </div>
                )}
                {inquiry.ongoingAt && (
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.started")}</span>
                    <p className="font-semibold text-[var(--agri-text)]">
                      {formatFullDateTime(inquiry.ongoingAt)}
                    </p>
                  </div>
                )}
                {inquiry.completionRequestedAt && (
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.completionRequested")}</span>
                    <p className="font-semibold text-[var(--agri-text)]">
                      {formatFullDateTime(inquiry.completionRequestedAt)}
                    </p>
                  </div>
                )}
                {inquiry.proofSubmittedAt && (
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.proofSubmitted")}</span>
                    <p className="font-semibold text-[var(--agri-text)]">
                      {formatFullDateTime(inquiry.proofSubmittedAt)}
                    </p>
                  </div>
                )}
                {inquiry.completedAt && (
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.completed")}</span>
                    <p className="font-semibold text-[var(--agri-text)]">
                      {formatFullDateTime(inquiry.completedAt)}
                    </p>
                  </div>
                )}
                {inquiry.cancelledAt && (
                  <div>
                    <span className="text-[var(--agri-text-muted)]">{t("adminTransaction.cancelled")}</span>
                    <p className="font-semibold text-[var(--agri-text)]">
                      {formatFullDateTime(inquiry.cancelledAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Proof */}
            {inquiry.proof && (
              <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/30 p-4">
                <h3 className="mb-3 text-sm font-bold text-[var(--agri-text)]">
                  {t("adminTransaction.proof")}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--agri-hover)]">
                    <img
                      src={inquiry.proof.url}
                      alt="Transaction proof"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--agri-text-muted)]">
                      {t("adminTransaction.submittedAt")}: {inquiry.proofSubmittedAt ? formatFullDateTime(inquiry.proofSubmittedAt) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Close */}
            <div className="flex justify-end border-t border-[var(--agri-border-subtle)] pt-4">
              <button
                onClick={onClose}
                className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        )}
    </ResponsiveModal>
  );
}
