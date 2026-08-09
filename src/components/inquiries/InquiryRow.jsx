import { useNavigate } from "react-router-dom";

import { getMessagesPath } from "../../utils/routes";

import InquiryStatusBadge from "./InquiryStatusBadge";

import productPlaceholder from "../../assets/img/ProductPlaceholder.png";

export default function InquiryRow({
  inquiry,
  product,
  consumer,
  userRole,
  updating,
  onStatusChange,
}) {
  const navigate = useNavigate();

  const status = getDisplayStatus(inquiry.status);

  function openConversation() {
    if (!inquiry.conversationId) {
      return;
    }

    navigate(`${getMessagesPath(userRole)}?conversation=${inquiry.conversationId}`);
  }

  return (
    <tr className="border-t border-gray-50 transition-colors hover:bg-gray-50/50">
      {/* Product */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <img
            src={getProductImage(product)}
            alt={product?.name || "Product"}
            className="h-10 w-10 rounded-lg object-cover"
          />

          <div>
            <span className="block text-sm font-medium text-gray-800">
              {product?.name || "Product unavailable"}
            </span>

            {product?.price != null && (
              <span className="text-xs text-gray-500">₱{product.price}</span>
            )}
          </div>
        </div>
      </td>

      {/* Consumer */}
      <td className="px-5 py-3 text-sm text-gray-600">
        {consumer?.fullname || consumer?.username || "Unknown consumer"}
      </td>

      {/* Date */}
      <td className="px-5 py-3 text-sm text-gray-500">
        {formatDate(inquiry.acceptedAt || inquiry.createdAt)}
      </td>

      {/* Status */}
      <td className="px-5 py-3">
        <InquiryStatusBadge status={status} />
      </td>

      {/* Actions */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openConversation}
            title="Open conversation"
            className="text-xs font-semibold text-[#2D6A4F] hover:underline gap-2"
          >
            View <i className="ri-message-3-line" />
          </button>

          {/* Farmer actions */}
          {userRole === "farmer" && status === "pending" && (
            <button
              type="button"
              disabled={updating}
              onClick={() => onStatusChange(inquiry.id, "ongoing")}
              className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50"
            >
              {updating ? "Updating..." : "Start"}
            </button>
          )}

          {userRole === "farmer" && status === "ongoing" && (
            <button
              type="button"
              disabled={updating}
              onClick={() => onStatusChange(inquiry.id, "resolved")}
              className="text-xs font-semibold text-green-600 hover:underline disabled:opacity-50"
            >
              {updating ? "Updating..." : "Resolve"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function getDisplayStatus(status) {
  if (status === "accepted") {
    return "pending";
  }

  return status;
}

function getProductImage(product) {
  if (!product?.images?.length) {
    return productPlaceholder;
  }

  const image = product.images[0];

  if (typeof image === "string") {
    return image;
  }

  return image?.url || productPlaceholder;
}

function formatDate(timestamp) {
  if (!timestamp) {
    return "Unknown";
  }

  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

    return date.toLocaleDateString("en-CA");
  } catch {
    return "Unknown";
  }
}
