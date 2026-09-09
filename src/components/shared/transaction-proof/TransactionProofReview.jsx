import { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import ImageViewerModal from "../../common/ImageViewerModal";
import ConfirmDialog from "../../ui/ConfirmDialog";

export default function TransactionProofReview({
  inquiry,
  processing,
  onConfirm,
  onReject,
}) {
  const { t } = useLanguage();
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const proofUrl = inquiry?.proof?.url;

  const handleConfirmAction = async () => {
    setShowConfirmModal(false);
    await onConfirm?.();
  };

  const handleRejectAction = async () => {
    setShowRejectModal(false);
    await onReject?.();
  };

  return (
    <section className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] p-5 shadow-sm">
      <div>
        <h2 className="font-semibold text-[var(--agri-text)]">
          {t("transaction.reviewTitle")}
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--agri-text-muted)]">
          {t("transaction.reviewBody")}
        </p>
      </div>

      {proofUrl ? (
        <div
          className="mt-5 overflow-hidden rounded-xl border border-[var(--agri-border)] bg-[var(--agri-hover)] cursor-pointer group relative"
          onClick={() => setShowFullscreen(true)}
          title={t("transaction.viewFullscreen")}
        >
          <img
            src={proofUrl}
            alt={t("transaction.proofOfReceipt")}
            className="max-h-[600px] w-full object-contain group-hover:scale-[1.01] transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md backdrop-blur-xs flex items-center gap-1">
              <i className="ri-zoom-in-line" /> {t("transaction.viewPhoto")}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-[var(--agri-hover)] p-8 text-center">
          <i className="ri-image-line text-3xl text-[var(--agri-text-muted)]" />

          <p className="mt-2 text-sm text-[var(--agri-text-muted)]">
            {t("transaction.noProofImage")}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={processing}
          onClick={() => setShowRejectModal(true)}
          className="
            flex-1 rounded-xl
            border border-red-500/20
            px-4 py-3
            text-sm font-semibold text-red-600
            transition hover:bg-red-500/10
            cursor-pointer
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {processing ? t("transaction.processing") : t("transaction.rejectProof")}
        </button>

        <button
          type="button"
          disabled={processing || !proofUrl}
          onClick={() => setShowConfirmModal(true)}
          className="
            flex-1 rounded-xl
            bg-[#2D6A4F]
            px-4 py-3
            text-sm font-semibold text-white
            transition hover:bg-[#24583F]
            cursor-pointer
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {processing ? t("transaction.processing") : t("transaction.confirmComplete")}
        </button>
      </div>

      <ConfirmDialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title={t("transaction.confirmModalTitle")}
        description={t("transaction.confirmModalBody")}
        confirmLabel={t("transaction.confirmComplete")}
        cancelLabel={t("common.cancel")}
        icon="ri-checkbox-circle-fill"
        loading={processing}
      />

      <ConfirmDialog
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectAction}
        title={t("transaction.rejectModalTitle")}
        description={t("transaction.rejectModalBody")}
        confirmLabel={t("transaction.rejectProof")}
        cancelLabel={t("common.cancel")}
        icon="ri-error-warning-fill"
        danger
        loading={processing}
      />

      {/* Fullscreen Zoomable Image Modal */}
      <ImageViewerModal
        isOpen={showFullscreen && Boolean(proofUrl)}
        src={proofUrl}
        title={t("reviews.transactionProof")}
        onClose={() => setShowFullscreen(false)}
      />
    </section>
  );
}
