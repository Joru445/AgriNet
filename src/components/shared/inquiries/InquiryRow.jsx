import { useNavigate } from "react-router-dom";

import { getMessagesPath, getInquiriesPath } from "../../utils/routes";
import { formatTimestamp } from "../../utils/date";

import Inquiry from "./Inquiry";
import InquiryStatusBadge from "./InquiryStatusBadge";

export default function InquiryRow({
  inquiry,
  product,
  consumer,
  userRole,
  updating,
  onStatusChange,
}) {
  const navigate = useNavigate();

  const status = normalizeStatus(inquiry.status);

  const productData = {
    ...(inquiry.productSnapshot ?? product ?? {}),
    quantity: inquiry.quantity,
  };

  const counterparty =
    userRole === "farmer"
      ? (inquiry.consumerSnapshot ?? consumer)
      : inquiry.farmerSnapshot;

  function openConversation() {
    if (!inquiry.conversationId) {
      return;
    }

    navigate(
      `${getMessagesPath(userRole)}?conversation=${inquiry.conversationId}`,
    );
  }

  function cancelInquiry() {
    if (window.confirm("Cancel this inquiry?")) {
      onStatusChange(inquiry.id, "cancelled");
    }
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

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <i className="ri-shopping-bag-3-line text-gray-500" />

          <span className="text-xs font-medium text-gray-500">
            {userRole === "farmer" ? "Purchase Inquiry" : "My Inquiry"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-gray-400 sm:inline">
            {formatTimestamp(inquiry.acceptedAt || inquiry.createdAt)}
          </span>

          <InquiryStatusBadge status={status} />
        </div>
      </div>

      {/* Product */}
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <Inquiry productData={productData} counterparty={counterparty} />

        {/* Mobile date */}
        <p className="mt-3 text-xs text-gray-400 sm:hidden">
          {formatTimestamp(inquiry.acceptedAt || inquiry.createdAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-5">
        {/* View conversation */}
        <button
          type="button"
          onClick={openConversation}
          disabled={!inquiry.conversationId}
          className="
            inline-flex items-center justify-center gap-1.5
            rounded-lg border border-gray-200
            px-3 py-2
            text-xs font-semibold text-gray-600
            transition
            hover:bg-gray-50
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <i className="ri-message-3-line" />
          View conversation
        </button>

        {/* Farmer starts transaction */}
        {userRole === "farmer" && status === "accepted" && (
          <Action
            updating={updating}
            label="Start transaction"
            className="bg-[#2D6A4F] text-white hover:bg-[#24583F]"
            onClick={() => onStatusChange(inquiry.id, "ongoing")}
          />
        )}

        {/* Consumer submits completion proof */}
        {userRole === "consumer" && status === "ongoing" && (
          <Action
            updating={updating}
            label="Mark complete"
            className="bg-[#2D6A4F] text-white hover:bg-[#24583F]"
            onClick={openCompletionPage}
          />
        )}

        {/* Consumer uploads/re-uploads proof */}
        {userRole === "consumer" && status === "awaiting_proof" && (
          <Action
            updating={updating}
            label="Upload proof"
            className="bg-[#2D6A4F] text-white hover:bg-[#24583F]"
            onClick={openCompletionPage}
          />
        )}

        {/* Farmer reviews submitted proof */}
        {userRole === "farmer" && status === "proof_submitted" && (
          <Action
            updating={updating}
            label="Review proof"
            className="bg-[#2D6A4F] text-white hover:bg-[#24583F]"
            onClick={openProofPage}
          />
        )}

        {/* Cancel */}
        {["accepted", "ongoing"].includes(status) && (
          <Action
            updating={updating}
            label="Cancel"
            className="border border-red-200 text-red-600 hover:bg-red-50"
            onClick={cancelInquiry}
          />
        )}

        {/* Completed transaction */}
        {status === "completed" && (
          <Action
            updating={false}
            label="View transaction"
            className="border border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={openProofPage}
          />
        )}

        {/* Consumer rates completed transaction */}
        {userRole === "consumer" && status === "completed" && !isReviewed && (
          <Action
            updating={updating}
            label="Rate"
            className="border border-[#2D6A4F] text-[#2D6A4F] hover:bg-gray-100"
            onClick={openReviewPage}
          />
        )}

        {/* Reviewed transaction can be viewed by any role */}
        {status === "completed" && isReviewed && (
          <Action
            updating={false}
            label="View review"
            className="border border-gray-200 text-gray-600 hover:bg-gray-50"
            onClick={openReviewPage}
          />
        )}

        {/* Waiting for farmer */}
        {userRole === "consumer" && status === "proof_submitted" && (
          <span
            className="
                inline-flex items-center justify-center
                rounded-lg bg-gray-50
                px-3 py-2
                text-xs font-semibold text-gray-500
              "
          >
            Waiting for farmer confirmation
          </span>
        )}
      </div>
    </article>
  );
}

function Action({ updating, label, className, onClick }) {
  return (
    <button
      type="button"
      disabled={updating}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        rounded-lg px-3 py-2
        text-xs font-semibold
        transition
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {updating ? "Updating..." : label}
    </button>
  );
}

function normalizeStatus(status) {
  return status === "resolved" ? "completed" : status;
}
