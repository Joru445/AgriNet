import { useState } from "react";
import { createPortal } from "react-dom";
import ImageViewerModal from "../../common/ImageViewerModal";

export default function TransactionProofReview({
  inquiry,
  processing,
  onConfirm,
  onReject,
}) {
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
          Review transaction proof
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--agri-text-muted)]">
          Review the image submitted by the consumer before confirming the
          transaction.
        </p>
      </div>

      {proofUrl ? (
        <div
          className="mt-5 overflow-hidden rounded-xl border border-[var(--agri-border)] bg-[var(--agri-hover)] cursor-pointer group relative"
          onClick={() => setShowFullscreen(true)}
          title="Click to view full screen & zoom"
        >
          <img
            src={proofUrl}
            alt="Transaction proof submitted by consumer"
            className="max-h-[600px] w-full object-contain group-hover:scale-[1.01] transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md backdrop-blur-xs flex items-center gap-1">
              <i className="ri-zoom-in-line" /> View Photo
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-[var(--agri-hover)] p-8 text-center">
          <i className="ri-image-line text-3xl text-[var(--agri-text-muted)]" />

          <p className="mt-2 text-sm text-[var(--agri-text-muted)]">
            No proof image was submitted.
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
          {processing ? "Processing..." : "Reject Proof"}
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
          {processing ? "Processing..." : "Confirm & Complete"}
        </button>
      </div>

      {/* Confirm & Complete Modal Card */}
      {showConfirmModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[var(--agri-card)] p-6 shadow-2xl anim-scale-in">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-[#2D6A4F] dark:text-[var(--agri-brand)] dark:bg-emerald-500/20">
                  <i className="ri-checkbox-circle-fill text-2xl text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[var(--agri-text)]">
                    Confirm & Complete Transaction
                  </h3>
                  <p className="mt-1 text-sm text-[var(--agri-text-secondary)] font-medium leading-relaxed">
                    Confirm that this transaction is complete?
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={processing}
                  className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={processing}
                  className="rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1B4332] shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <i className="ri-loader-4-line animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-check-line" />
                      <span>Confirm & Complete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Reject Proof Modal Card */}
      {showRejectModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[var(--agri-card)] p-6 shadow-2xl anim-scale-in">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <i className="ri-error-warning-fill text-2xl text-red-600 dark:text-red-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[var(--agri-text)]">
                    Reject Transaction Proof
                  </h3>
                  <p className="mt-1 text-sm text-[var(--agri-text-secondary)] font-medium leading-relaxed">
                    Reject this proof and ask the consumer to upload another?
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  disabled={processing}
                  className="rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRejectAction}
                  disabled={processing}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <>
                      <i className="ri-loader-4-line animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-close-line" />
                      <span>Reject Proof</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Fullscreen Zoomable Image Modal */}
      <ImageViewerModal
        isOpen={showFullscreen && Boolean(proofUrl)}
        src={proofUrl}
        title="Transaction Proof"
        onClose={() => setShowFullscreen(false)}
      />
    </section>
  );
}
