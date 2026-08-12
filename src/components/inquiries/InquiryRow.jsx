import { useNavigate } from "react-router-dom";

import { getMessagesPath } from "../../utils/routes";
import InquiryStatusBadge from "./InquiryStatusBadge";
import productPlaceholder from "../../assets/img/productPlaceholder.png";

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
  const productData = inquiry.productSnapshot ?? product;
  const counterparty =
    userRole === "farmer"
      ? inquiry.consumerSnapshot ?? consumer
      : inquiry.farmerSnapshot;

  function openConversation() {
    if (inquiry.conversationId) {
      navigate(`${getMessagesPath(userRole)}?conversation=${inquiry.conversationId}`);
    }
  }

  function cancelInquiry() {
    if (window.confirm("Cancel this inquiry?")) {
      onStatusChange(inquiry.id, "cancelled");
    }
  }

  return (
    <tr className="border-t border-gray-50 transition-colors hover:bg-gray-50/50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <img
            src={getProductImage(productData)}
            alt={productData?.name || "Product"}
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div>
            <span className="block text-sm font-medium text-gray-800">
              {productData?.name || "Product unavailable"}
            </span>
            {productData?.price != null && (
              <span className="text-xs text-gray-500">
                ₱{productData.price}{productData.unit ? `/${productData.unit}` : ""}
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="px-5 py-3 text-sm text-gray-600">
        { counterparty?.fullname ||
          counterparty?.username ||
          "Unknown user"}
      </td>

      <td className="px-5 py-3 text-sm text-gray-500">
        {formatDate(inquiry.acceptedAt || inquiry.createdAt)}
      </td>

      <td className="px-5 py-3">
        <InquiryStatusBadge status={status} />
      </td>

      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openConversation}
            title="Open conversation"
            className="text-xs font-semibold text-[#2D6A4F] hover:underline"
          >
            View <i className="ri-message-3-line" />
          </button>

          {userRole === "farmer" && status === "accepted" && (
            <Action
              updating={updating}
              label="Start"
              className="text-blue-600"
              onClick={() => onStatusChange(inquiry.id, "ongoing")}
            />
          )}

          {userRole === "consumer" && status === "ongoing" && (
            <Action
              updating={updating}
              label="Mark complete"
              className="text-green-600"
              onClick={() => onStatusChange(inquiry.id, "completed")}
            />
          )}

          {["accepted", "ongoing"].includes(status) && (
            <Action
              updating={updating}
              label="Cancel"
              className="text-red-600"
              onClick={cancelInquiry}
            />
          )}
        </div>
      </td>
    </tr>
  );
}

function Action({ updating, label, className, onClick }) {
  return (
    <button
      type="button"
      disabled={updating}
      onClick={onClick}
      className={`text-xs font-semibold hover:underline disabled:opacity-50 ${className}`}
    >
      {updating ? "Updating..." : label}
    </button>
  );
}

function normalizeStatus(status) {
  return status === "resolved" ? "completed" : status;
}

function getProductImage(product) {
  const image = product?.imageUrl ?? product?.images?.[0];
  return typeof image === "string" ? image : image?.url || productPlaceholder;
}

function formatDate(timestamp) {
  if (!timestamp) return "Unknown";

  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-CA");
  } catch {
    return "Unknown";
  }
}
