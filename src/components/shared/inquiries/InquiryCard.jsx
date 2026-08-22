import { useNavigate } from "react-router-dom";
import { getProductImage } from "../../../utils/getProductImage";
import { getInquiriesPath, getMessagesPath } from "../../../utils/routes";
import { formatFullDateTime } from "../../../utils/date";
import { useUnreadInquiries } from "../../../context/UnreadInquiriesContext";
import InquiryStatusBadge from "./InquiryStatusBadge";
import defaultAvatar from "../../../assets/img/defaultAvatar.png";

export default function InquiryCard({
  inquiry,
  product,
  consumer,
  userRole,
  updating,
  onStatusChange,
}) {
  const navigate = useNavigate();
  const { acknowledgeInquiry } = useUnreadInquiries();

  const status = normalizeStatus(inquiry.status);
  const productData = {
    ...(inquiry.productSnapshot ?? product ?? {}),
    quantity: inquiry.quantity,
  };
  const counterparty =
    userRole === "farmer"
      ? (inquiry.consumerSnapshot ?? consumer)
      : inquiry.farmerSnapshot;

  const price = Number(productData?.price) || 0;
  const quantity = Number(productData?.quantity) || 0;
  const total = price * quantity;

  const isReviewed =
    inquiry.reviewed === true ||
    Boolean(inquiry.farmerReviewId) ||
    Boolean(inquiry.productReviewId);

  // Red dot flags
  let showDot = false;
  if (userRole === "consumer" && ["accepted", "ongoing", "awaiting_proof"].includes(status)) showDot = true;
  if (userRole === "consumer" && status === "completed" && !isReviewed) showDot = true;
  if (userRole === "farmer" && ["accepted", "proof_submitted"].includes(status)) showDot = true;

  function handlePrimaryAction() {
    if (status === "accepted" || status === "ongoing") {
      if (userRole === "farmer" && status === "accepted") {
        acknowledgeInquiry(inquiry.id, inquiry.status);
        onStatusChange(inquiry.id, "ongoing");
      } else {
        navigate(`${getInquiriesPath(userRole)}/${inquiry.id}/proof`);
      }
    } else if (status === "awaiting_proof" || status === "proof_submitted") {
      navigate(`${getInquiriesPath(userRole)}/${inquiry.id}/proof`);
    } else if (status === "completed") {
      if (!isReviewed && userRole === "consumer") {
        navigate(`${getInquiriesPath(userRole)}/${inquiry.id}/review`);
      } else {
        navigate(`${getInquiriesPath(userRole)}/${inquiry.id}/proof`);
      }
    }
  }

  function openConversation() {
    if (!inquiry.conversationId) return;
    acknowledgeInquiry(inquiry.id, inquiry.status);
    navigate(`${getMessagesPath(userRole)}?conversation=${inquiry.conversationId}`);
  }

  const primaryLabel = getPrimaryLabel(status, userRole, isReviewed);

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs transition-all hover:shadow-lg hover:-translate-y-1">
      {/* Red dot */}
      {showDot && (
        <span className="absolute top-3 right-3 flex h-3.5 w-3.5 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 ring-2 ring-white" />
        </span>
      )}

      {/* Product image */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={getProductImage(productData)}
          alt={productData?.name || "Product"}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Category / Role on top left */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-lg bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <i className="ri-shopping-bag-3-line" />
            {userRole === "farmer" ? "Purchase Inquiry" : "My Inquiry"}
          </span>
        </div>

        {/* Status badge overlaid on bottom left of image */}
        <div className="absolute bottom-3 left-3">
          <InquiryStatusBadge status={status} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        {/* Product Title + Quantity */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-bold text-gray-900" title={productData?.name}>
              {productData?.name || "Product unavailable"}
            </h3>
            {productData?.quantity != null && productData?.unit && (
              <span className="shrink-0 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                {productData.quantity} {productData.unit}
              </span>
            )}
          </div>

          {productData?.unit && (
            <p className="mt-0.5 text-xs font-medium text-gray-400">
              ₱{price.toLocaleString()} per {productData.unit}
            </p>
          )}
        </div>

        {/* Price & Total */}
        <div className="rounded-xl bg-[#2D6A4F]/5 p-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Amount
            </span>
            <span className="text-lg font-extrabold text-[#2D6A4F]">
              ₱{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Counterparty & Date */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs text-gray-500">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={counterparty?.profilePicture || defaultAvatar}
              alt=""
              className="h-6 w-6 rounded-full object-cover border border-gray-200 shrink-0"
            />
            <span className="truncate font-semibold text-gray-700">
              {counterparty?.fullname ||
                (counterparty?.username ? `@${counterparty.username}` : "Unknown")}
            </span>
            {counterparty?.verified && (
              <span
                title="Verified Farmer"
                aria-label="Verified Farmer"
                className="inline-flex shrink-0 items-center text-[#2D6A4F] text-sm"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
          </div>

          <span className="text-[11px] font-medium text-gray-500 shrink-0 ml-2">
            {formatFullDateTime(getInquiryDisplayTime(inquiry))}
          </span>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/70 p-3">
        {/* Message button */}
        <button
          type="button"
          disabled={!inquiry.conversationId}
          onClick={openConversation}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
          title="View conversation"
        >
          <i className="ri-message-3-line text-base" />
          {userRole === "consumer" && status === "accepted" && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {/* Primary action button */}
        {primaryLabel && (
          <button
            type="button"
            disabled={updating}
            onClick={handlePrimaryAction}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2D6A4F] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#24583F] shadow-xs disabled:opacity-50"
          >
            {showDot && !updating && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-1 ring-white" />
              </span>
            )}
            {updating ? "Updating..." : primaryLabel}
          </button>
        )}
      </div>
    </article>
  );
}

function getPrimaryLabel(status, userRole, isReviewed) {
  if (userRole === "consumer") {
    if (status === "accepted") return "View conversation";
    if (status === "ongoing") return "Mark complete";
    if (status === "awaiting_proof") return "Upload proof";
    if (status === "proof_submitted") return null;
    if (status === "completed" && !isReviewed) return "Rate";
    if (status === "completed" && isReviewed) return "View review";
  }
  if (userRole === "farmer") {
    if (status === "accepted") return "Start transaction";
    if (status === "proof_submitted") return "Review proof";
    if (status === "completed") return "View transaction";
  }
  return "View";
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
