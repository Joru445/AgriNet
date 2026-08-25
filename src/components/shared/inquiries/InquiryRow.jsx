import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMessagesPath, getInquiriesPath } from "../../../utils/routes";
import { formatFullDateTime } from "../../../utils/date";
import { useUnreadInquiries } from "../../../context/UnreadInquiriesContext";

import Inquiry from "./Inquiry";
import InquiryStatusBadge from "./InquiryStatusBadge";
import CancelInquiryModal from "./CancelInquiryModal";
import ReportModal from "../../common/ReportModal";

export default function InquiryRow({
  inquiry,
  product,
  consumer,
  farmer,
  userRole,
  updating,
  onStatusChange,
}) {
  const navigate = useNavigate();
  const { acknowledgeInquiry } = useUnreadInquiries();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const status = normalizeStatus(inquiry.status);

  const productData = {
    ...(inquiry.productSnapshot ?? product ?? {}),
    quantity: inquiry.quantity,
  };

  const counterparty =
    userRole === "farmer"
      ? (inquiry.consumerSnapshot ?? consumer)
      : {
          ...(inquiry.farmerSnapshot ?? {}),
          ...(farmer ?? {}),
          verified:
            farmer?.verified === true ||
            inquiry.farmerSnapshot?.verified === true,
        };

  function openConversation() {
    if (!inquiry.conversationId) {
      return;
    }

    // Dismiss the red dot for this accepted inquiry
    acknowledgeInquiry(inquiry.id, inquiry.status);

    navigate(
      `${getMessagesPath(userRole)}?conversation=${inquiry.conversationId}`,
    );
  }

  function cancelInquiry() {
    setShowCancelModal(true);
  }

  function handleConfirmCancel() {
    onStatusChange(inquiry.id, "cancelled");
    setShowCancelModal(false);
  }

  function openCompletionPage() {
    navigate(`${getInquiriesPath(userRole)}/${inquiry.id}/proof`);
  }

  function openProofPage() {
    navigate(`${getInquiriesPath(userRole)}/${inquiry.id}/proof`);
  }

  function openReviewPage() {
    navigate(`${getInquiriesPath(userRole)}/${inquiry.id}/review`);
  }

  const isReviewed =
    inquiry.reviewed === true ||
    Boolean(inquiry.farmerReviewId) ||
    Boolean(inquiry.productReviewId);

  // --- Determine banner config ---
  const banner = getBanner(status, userRole, isReviewed);

  // --- Determine which buttons get red dots ---
  const dots = getRedDots(status, userRole, isReviewed);

  return (
    <article className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-md transition-all hover:shadow-xl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <i className="ri-shopping-bag-3-line text-[#2D6A4F]" />

            <span className="text-xs font-bold text-gray-800">
              {userRole === "farmer" ? "Purchase Inquiry" : "My Inquiry"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-xs text-gray-500 font-medium sm:inline">
              {formatFullDateTime(getInquiryDisplayTime(inquiry))}
            </span>

            <InquiryStatusBadge status={status} />

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Report this transaction / user"
              aria-label="Report inquiry"
            >
              <i className="ri-shield-alert-line text-sm" />
            </button>
          </div>
        </div>

        {/* Product */}
        <div className="px-4 py-4 sm:px-5">
          <Inquiry productData={productData} counterparty={counterparty} />

          {/* Mobile date */}
          <p className="mt-3 text-xs text-gray-500 font-medium sm:hidden">
            {formatFullDateTime(getInquiryDisplayTime(inquiry))}
          </p>
        </div>

        {/* Status Banner — inline so it only wraps its own text */}
        {banner && (
          <div className="px-4 pb-3 sm:px-5">
            <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${banner.className}`}>
              <i className={`${banner.icon} text-sm shrink-0`} />
              <span>{banner.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/60 px-4 py-3 sm:px-5">
        {/* View conversation */}
        <Action
          updating={false}
          label="View conversation"
          icon="ri-message-3-line"
          showDot={dots.viewConversation}
          className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          disabled={!inquiry.conversationId}
          onClick={openConversation}
        />

        {/* Farmer starts transaction */}
        {userRole === "farmer" && status === "accepted" && (
          <Action
            updating={updating}
            label="Start transaction"
            icon="ri-play-circle-line"
            showDot={dots.startTransaction}
            className="bg-[#2D6A4F] text-white hover:bg-[#24583F]"
            onClick={() => {
              acknowledgeInquiry(inquiry.id, inquiry.status);
              onStatusChange(inquiry.id, "ongoing");
            }}
          />
        )}

        {/* Consumer submits completion proof */}
        {userRole === "consumer" && status === "ongoing" && (
          <Action
            updating={updating}
            label="Mark complete"
            icon="ri-checkbox-circle-line"
            showDot={dots.markComplete}
            className="bg-[#2D6A4F] text-white hover:bg-[#24583F]"
            onClick={openCompletionPage}
          />
        )}

        {/* Consumer uploads/re-uploads proof */}
        {userRole === "consumer" && status === "awaiting_proof" && (
          <Action
            updating={updating}
            label="Upload proof"
            icon="ri-upload-cloud-2-line"
            showDot={dots.uploadProof}
            className="bg-[#2D6A4F] text-white hover:bg-[#24583F]"
            onClick={openCompletionPage}
          />
        )}

        {/* Farmer reviews submitted proof */}
        {userRole === "farmer" && status === "proof_submitted" && (
          <Action
            updating={updating}
            label="Review proof"
            icon="ri-file-search-line"
            showDot={dots.reviewProof}
            className="bg-orange-500 text-white hover:bg-orange-600"
            onClick={openProofPage}
          />
        )}

        {/* Cancel */}
        {["accepted", "ongoing"].includes(status) && (
          <Action
            updating={updating}
            label="Cancel"
            icon="ri-close-circle-line"
            showDot={false}
            className="border border-red-200 bg-white text-red-600 hover:bg-red-50"
            onClick={cancelInquiry}
          />
        )}

        {/* Completed transaction */}
        {status === "completed" && (
          <Action
            updating={false}
            label="View transaction"
            icon="ri-file-text-line"
            showDot={false}
            className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 font-semibold"
            onClick={openProofPage}
          />
        )}

        {/* Consumer rates completed transaction */}
        {userRole === "consumer" && status === "completed" && !isReviewed && (
          <Action
            updating={updating}
            label="Rate transaction"
            icon="ri-star-line"
            showDot={dots.rate}
            className="bg-[#2D6A4F] text-white hover:bg-[#24583F] font-bold shadow-xs"
            onClick={openReviewPage}
          />
        )}

        {/* Reviewed transaction can be viewed by any role */}
        {status === "completed" && isReviewed && (
          <Action
            updating={false}
            label="View review"
            icon="ri-star-fill"
            showDot={false}
            className="border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold"
            onClick={openReviewPage}
          />
        )}

        {/* Waiting for farmer */}
        {userRole === "consumer" && status === "proof_submitted" && (
          <span
            className="
                inline-flex items-center justify-center gap-1.5
                rounded-xl border border-gray-200 bg-white
                px-3.5 py-2
                text-xs font-bold text-gray-600
              "
          >
            <i className="ri-time-line text-[#2D6A4F]" />
            Waiting for farmer confirmation
          </span>
        )}
      </div>

      <CancelInquiryModal
        open={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        cancelling={updating}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="inquiry"
        targetId={inquiry.id}
        targetTitle={`Inquiry for ${productData.name || "Product"} (${inquiry.id.slice(0, 8)})`}
        reportedUser={counterparty?.uid ? counterparty : {
          uid: userRole === "farmer" ? inquiry.consumerId : inquiry.farmerId,
          fullname: counterparty?.fullname || counterparty?.username || "User",
          username: counterparty?.username || "",
          role: userRole === "farmer" ? "consumer" : "farmer",
        }}
      />
    </article>
  );
}

function Action({ updating, label, icon, showDot, className, onClick, disabled = false }) {
  return (
    <button
      type="button"
      disabled={updating || disabled}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center gap-1.5
        rounded-xl px-3.5 py-2
        text-xs font-bold
        transition shadow-2xs cursor-pointer
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {/* Red dot indicator */}
      {showDot && !updating && (
        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 ring-2 ring-white" />
        </span>
      )}
      {icon && <i className={`${icon} text-sm`} />}
      {updating ? "Updating..." : label}
    </button>
  );
}

/**
 * Returns banner config for the current status + role combo.
 */
function getBanner(status, userRole, isReviewed) {
  if (userRole === "consumer") {
    if (status === "pending") {
      return {
        message: "Waiting for the farmer to respond...",
        icon: "ri-time-line",
        className: "bg-gray-50 text-gray-500 border border-gray-200",
      };
    }
    if (status === "accepted") {
      return {
        message: "Your inquiry was accepted! View the conversation.",
        icon: "ri-checkbox-circle-fill",
        className: "bg-green-50 text-green-700 border border-green-200",
      };
    }
    if (status === "ongoing") {
      return {
        message: "Transaction is ongoing. Mark complete when your product is received.",
        icon: "ri-exchange-line",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
      };
    }
    if (status === "awaiting_proof") {
      return {
        message: "Please upload the product you received.",
        icon: "ri-upload-cloud-2-line",
        className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      };
    }
    if (status === "proof_submitted") {
      return {
        message: "Proof submitted. Waiting for farmer confirmation.",
        icon: "ri-time-line",
        className: "bg-gray-50 text-gray-500 border border-gray-200",
      };
    }
    if (status === "completed") {
      return {
        message: "Transaction complete.",
        icon: "ri-checkbox-circle-fill",
        className: "bg-green-50 text-green-700 border border-green-200",
      };
    }
    if (status === "cancelled") {
      return {
        message: "Transaction cancelled.",
        icon: "ri-close-circle-fill",
        className: "bg-red-50 text-red-700 border border-red-200",
      };
    }
  }

  if (userRole === "farmer") {
    if (status === "accepted") {
      return {
        message: "You accepted this inquiry. Start the transaction when ready.",
        icon: "ri-play-circle-fill",
        className: "bg-green-50 text-green-700 border border-green-200 font-medium",
      };
    }
    if (status === "ongoing") {
      return {
        message: "Transaction is ongoing.",
        icon: "ri-exchange-line",
        className: "bg-blue-50 text-blue-700 border border-blue-200 font-medium",
      };
    }
    if (status === "proof_submitted") {
      return {
        message: "Consumer submitted proof of product received. Please review it.",
        icon: "ri-file-search-line",
        className: "bg-orange-50 text-orange-700 border border-orange-200 font-medium",
      };
    }
    if (status === "completed") {
      return {
        message: "Transaction complete.",
        icon: "ri-checkbox-circle-fill",
        className: "bg-green-50 text-green-700 border border-green-200",
      };
    }
    if (status === "cancelled") {
      return {
        message: "Transaction cancelled.",
        icon: "ri-close-circle-fill",
        className: "bg-red-50 text-red-700 border border-red-200",
      };
    }
  }

  return null;
}

/**
 * Returns which buttons should show the red dot.
 */
function getRedDots(status, userRole, isReviewed) {
  const dots = {
    viewConversation: false,
    startTransaction: false,
    markComplete: false,
    uploadProof: false,
    reviewProof: false,
    rate: false,
  };

  if (userRole === "consumer") {
    if (status === "accepted") dots.viewConversation = true;
    if (status === "ongoing") dots.markComplete = true;
    if (status === "awaiting_proof") dots.uploadProof = true;
    if (status === "completed" && !isReviewed) dots.rate = true;
  }

  if (userRole === "farmer") {
    if (status === "accepted") dots.startTransaction = true;
    if (status === "proof_submitted") dots.reviewProof = true;
  }

  return dots;
}

function normalizeStatus(status) {
  return status === "resolved" ? "completed" : status;
}

function getInquiryDisplayTime(inquiry) {
  if (!inquiry) return null;
  const status = normalizeStatus(inquiry.status);
  if (status === "completed") {
    return (
      inquiry.completedAt ||
      inquiry.resolvedAt ||
      inquiry.statusUpdatedAt ||
      inquiry.acceptedAt ||
      inquiry.createdAt
    );
  }
  if (status === "cancelled") {
    return (
      inquiry.cancelledAt ||
      inquiry.statusUpdatedAt ||
      inquiry.acceptedAt ||
      inquiry.createdAt
    );
  }
  return inquiry.acceptedAt || inquiry.createdAt;
}
