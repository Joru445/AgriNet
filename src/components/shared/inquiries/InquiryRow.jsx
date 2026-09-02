import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMessagesPath, getInquiriesPath } from "../../../utils/routes";
import { formatFullDateTime } from "../../../utils/date";
import { useUnreadInquiries } from "../../../context/UnreadInquiriesContext";
import { useLanguage } from "../../../context/LanguageContext";

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
  const { t } = useLanguage();
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
  const banner = getBanner(status, userRole, t);

  // --- Determine which buttons get red dots ---
  const dots = getRedDots(status, userRole, isReviewed);

  return (
    <article className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-md transition-all hover:shadow-xl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--agri-border)] bg-[var(--agri-hover)] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <i className="ri-shopping-bag-3-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />

            <span className="text-xs font-bold text-[var(--agri-text)]">
              {userRole === "farmer" ? t("inquiries.purchaseInquiry") : t("inquiries.myInquiry")}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-xs text-[var(--agri-text-muted)] font-medium sm:inline">
              {formatFullDateTime(getInquiryDisplayTime(inquiry))}
            </span>

            <InquiryStatusBadge status={status} />

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--agri-text-muted)] hover:text-red-600 hover:bg-red-500/10 transition cursor-pointer"
              title={t("inquiries.reportTitle")}
              aria-label={t("inquiries.reportAria")}
            >
              <i className="ri-alert-line text-sm" />
            </button>
          </div>
        </div>

        {/* Product */}
        <div className="px-4 py-4 sm:px-5">
          <Inquiry productData={productData} counterparty={counterparty} />

          {/* Mobile date */}
          <p className="mt-3 text-xs text-[var(--agri-text-muted)] font-medium sm:hidden">
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
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/60 px-4 py-3 sm:px-5">
        {/* View conversation */}
        <Action
          updating={false}
          label={t("inquiries.viewConversation")}
          icon="ri-message-3-line"
          showDot={dots.viewConversation}
          className="border border-[var(--agri-border)] bg-[var(--agri-card)] text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)]"
          disabled={!inquiry.conversationId}
          onClick={openConversation}
        />

        {/* Farmer starts transaction */}
        {userRole === "farmer" && status === "accepted" && (
          <Action
            updating={updating}
            label={t("inquiries.startTransaction")}
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
            label={t("inquiries.markComplete")}
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
            label={t("inquiries.uploadProof")}
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
            label={t("inquiries.reviewProof")}
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
            label={t("inquiries.cancel")}
            icon="ri-close-circle-line"
            showDot={false}
            className="border border-red-500/20 bg-[var(--agri-card)] text-red-600 hover:bg-red-500/10"
            onClick={cancelInquiry}
          />
        )}

        {/* Completed transaction */}
        {status === "completed" && (
          <Action
            updating={false}
            label={t("inquiries.viewTransaction")}
            icon="ri-file-text-line"
            showDot={false}
            className="border border-[var(--agri-border)] bg-[var(--agri-card)] text-[var(--agri-text)] hover:bg-[var(--agri-hover)] font-semibold"
            onClick={openProofPage}
          />
        )}

        {/* Consumer rates completed transaction */}
        {userRole === "consumer" && status === "completed" && !isReviewed && (
          <Action
            updating={updating}
            label={t("inquiries.rateTransaction")}
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
            label={t("inquiries.viewReview")}
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
                rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)]
                px-3.5 py-2
                text-xs font-bold text-[var(--agri-text-secondary)]
              "
          >
            <i className="ri-time-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
            {t("inquiries.waitingFarmer")}
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
        targetTitle={t("inquiries.targetTitle", { name: productData.name || "Product" })}
        reportedUser={counterparty?.uid ? counterparty : {
          uid: userRole === "farmer" ? inquiry.consumerId : inquiry.farmerId,
          fullname: counterparty?.fullname || counterparty?.username || t("inquiries.unknownUser"),
          username: counterparty?.username || "",
          role: userRole === "farmer" ? "consumer" : "farmer",
        }}
      />
    </article>
  );
}

function Action({ updating, label, icon, showDot, className, onClick, disabled = false }) {
  const { t } = useLanguage();

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
      {updating ? t("inquiries.updating") : label}
    </button>
  );
}

/**
 * Returns banner config for the current status + role combo.
 */
function getBanner(status, userRole, t) {
  if (userRole === "consumer") {
    if (status === "pending") {
      return {
        message: t("inquiries.banner.consumerPending"),
        icon: "ri-time-line",
        className: "bg-[var(--agri-hover)] text-[var(--agri-text-muted)] border border-[var(--agri-border)]",
      };
    }
    if (status === "accepted") {
      return {
        message: t("inquiries.banner.consumerAccepted"),
        icon: "ri-checkbox-circle-fill",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
      };
    }
    if (status === "ongoing") {
      return {
        message: t("inquiries.banner.consumerOngoing"),
        icon: "ri-exchange-line",
        className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20",
      };
    }
    if (status === "awaiting_proof") {
      return {
        message: t("inquiries.banner.consumerAwaitingProof"),
        icon: "ri-upload-cloud-2-line",
        className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
      };
    }
    if (status === "proof_submitted") {
      return {
        message: t("inquiries.banner.consumerProofSubmitted"),
        icon: "ri-time-line",
        className: "bg-[var(--agri-hover)] text-[var(--agri-text-muted)] border border-[var(--agri-border)]",
      };
    }
    if (status === "completed") {
      return {
        message: t("inquiries.banner.consumerCompleted"),
        icon: "ri-checkbox-circle-fill",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
      };
    }
    if (status === "cancelled") {
      return {
        message: t("inquiries.banner.consumerCancelled"),
        icon: "ri-close-circle-fill",
        className: "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20",
      };
    }
  }

  if (userRole === "farmer") {
    if (status === "accepted") {
      return {
        message: t("inquiries.banner.farmerAccepted"),
        icon: "ri-play-circle-fill",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium",
      };
    }
    if (status === "ongoing") {
      return {
        message: t("inquiries.banner.farmerOngoing"),
        icon: "ri-exchange-line",
        className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium",
      };
    }
    if (status === "proof_submitted") {
      return {
        message: t("inquiries.banner.farmerProofSubmitted"),
        icon: "ri-file-search-line",
        className: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 font-medium",
      };
    }
    if (status === "completed") {
      return {
        message: t("inquiries.banner.farmerCompleted"),
        icon: "ri-checkbox-circle-fill",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
      };
    }
    if (status === "cancelled") {
      return {
        message: t("inquiries.banner.farmerCancelled"),
        icon: "ri-close-circle-fill",
        className: "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20",
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
