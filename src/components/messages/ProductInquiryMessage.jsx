import { useAuth } from "../../context/AuthContext";

import defaultAvatar from "../../assets/img/defaultAvatar.png";
import productPlaceholder from "../../assets/img/productPlaceholder.png";

export default function ProductInquiryMessage({
  user,
  message,
  product,
  onAccept,
}) {
  const { profile } = useAuth();

  const isOwn = message.senderId === profile.uid;
  const isFarmer = profile.role === "farmer";

  const showAccept = isFarmer && !isOwn && message.inquiryStatus === "pending";

  if (product === undefined) {
    return (
      <div className="w-72 rounded-xl bg-white p-4">
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-72 rounded-xl bg-white p-4">
        <p className="text-xs font-medium text-[#2D6A4F]">Product Inquiry</p>

        <p className="mt-1 text-sm text-gray-500">
          This product is no longer available.
        </p>

        {message.quantity != null && (
          <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">Quantity requested</p>

            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {message.quantity}
            </p>
          </div>
        )}
      </div>
    );
  }

  const productImage = product.images?.[0]?.url || productPlaceholder;

  const quantity = Number(message.quantity);

  return (
    <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      <img
        src={user.profilePicture || defaultAvatar}
        alt={user.fullname}
        className={`h-10 w-10 rounded-full object-cover ${
          isOwn ? "hidden" : "flex"
        }`}
      />

      <div className="w-72 overflow-hidden rounded-xl bg-white shadow-sm">
        <img
          src={productImage}
          alt={product.name}
          className="h-40 w-full object-cover"
        />

        <div className="p-3">
          <p className="text-xs font-medium text-[#2D6A4F]">Product Inquiry</p>

          <h3 className="mt-1 font-semibold text-gray-900">{product.name}</h3>

          {product.price != null && (
            <p className="mt-1 text-sm font-medium text-gray-700">
              ₱{product.price}
              {product.unit ? ` / ${product.unit}` : ""}
            </p>
          )}

          {/* Quantity */}
          {message.quantity && (
            <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
              <p className="text-xs font-medium text-gray-500">
                Quantity requested
              </p>

              <p className="mt-0.5 text-base font-bold text-[#2D6A4F]">
                {Number.isFinite(quantity) ? quantity : message.quantity}{" "}
                {product.unit || "units"}
              </p>
            </div>
          )}

          <p className="mt-3 text-sm text-gray-600">{message.text}</p>

          {showAccept && (
            <button
              type="button"
              onClick={() => onAccept(message, product)}
              className="
                mt-3 w-full rounded-lg
                bg-[#2D6A4F]
                px-3 py-2
                text-sm font-medium text-white
                hover:bg-[#1B4332]
              "
            >
              Accept Inquiry
            </button>
          )}

          {message.inquiryStatus === "accepted" && (
            <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-700">
              Inquiry Accepted
            </div>
          )}

          {message.inquiryStatus === "rejected" && (
            <div className="mt-3 rounded-lg bg-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-600">
              Inquiry Rejected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
