import { useState } from "react";
import ImageViewerModal from "../../common/ImageViewerModal";

export default function TransactionProofReview({
  inquiry,
  processing,
  onConfirm,
  onReject,
}) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const proofUrl = inquiry?.proof?.url;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-semibold text-gray-900">
          Review transaction proof
        </h2>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          Review the image submitted by the consumer before confirming the
          transaction.
        </p>
      </div>

      {proofUrl ? (
        <div
          className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 cursor-pointer group relative"
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
        <div className="mt-5 rounded-xl bg-gray-50 p-8 text-center">
          <i className="ri-image-line text-3xl text-gray-300" />

          <p className="mt-2 text-sm text-gray-500">
            No proof image was submitted.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={processing}
          onClick={onReject}
          className="
            flex-1 rounded-xl
            border border-red-200
            px-4 py-3
            text-sm font-semibold text-red-600
            transition hover:bg-red-50
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {processing ? "Processing..." : "Reject Proof"}
        </button>

        <button
          type="button"
          disabled={processing || !proofUrl}
          onClick={onConfirm}
          className="
            flex-1 rounded-xl
            bg-[#2D6A4F]
            px-4 py-3
            text-sm font-semibold text-white
            transition hover:bg-[#24583F]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {processing ? "Processing..." : "Confirm & Complete"}
        </button>
      </div>

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
