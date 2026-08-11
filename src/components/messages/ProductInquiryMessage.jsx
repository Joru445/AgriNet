import { useAuth } from "../../context/AuthContext";

import defaultAvatar from "../../assets/img/defaultAvatar.png"
import productPlaceholder from "../../assets/img/ProductPlaceholder.png";

export default function ProductInquiryMessage({ user, message, product, onAccept }) {
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
        <p className="text-xs font-medium text-green-600">Product Inquiry</p>

        <p className="mt-1 text-sm text-gray-500">
          This product is no longer available.
        </p>
      </div>
    );
  }

  const productImage = product.images?.[0].url || productPlaceholder;

  return (
    <div
      className={`flex gap-2 ${
        message.senderId === profile.uid ? "justify-end" : "justify-start"
      }`}
    >
      <img
        src={user.profilePicture || defaultAvatar}
        alt={user.fullname}
        className={`w-10 h-10 rounded-full object-cover ${isOwn ? "hidden" : "flex"}`}
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
            </p>
          )}

          <p className="mt-2 text-sm text-gray-600">{message.text}</p>

          {showAccept && (
            <button
              type="button"
              onClick={() => onAccept(message, product)}
              className="mt-3 w-full rounded-lg bg-[#2D6A4F] px-3 py-2 text-sm font-medium text-white hover:bg-[#1B4332]"
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
