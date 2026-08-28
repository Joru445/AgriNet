import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import defaultAvatar from "../../../assets/img/defaultAvatar.png";
import productPlaceholder from "../../../assets/img/productPlaceholder.png";

export default function ProductInquiryMessage({
  user,
  message,
  product,
  onAccept,
  isLastMine = false,
  isSeen = false,
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
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} min-w-0`}>
      <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"} min-w-0 w-full`}>
        <img
          src={user?.profilePicture || defaultAvatar}
          alt={user?.fullname}
          className={`h-10 w-10 shrink-0 rounded-full object-cover ${
            isOwn ? "hidden" : "flex"
          }`}
        />

        <div className="w-64 sm:w-72 max-w-[78vw] sm:max-w-xs min-w-0 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
          <img
            src={productImage}
            alt={product.name}
            className="h-36 sm:h-40 w-full object-cover"
          />

          <div className="p-3">
            <p className="text-xs font-medium text-[#2D6A4F]">Product Inquiry</p>

            <h3 className="mt-1 font-semibold text-gray-900 truncate">{product.name}</h3>

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

            <p className="mt-3 text-sm text-gray-600 break-words [overflow-wrap:anywhere] [word-break:break-word]">{message.text}</p>

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
                  cursor-pointer transition-colors shadow-xs
                "
              >
                Accept Inquiry
              </button>
            )}

            {message.inquiryStatus === "accepted" && (
              <div className="mt-3 space-y-2">
                <div className="rounded-lg bg-green-50 px-3 py-1.5 text-center text-xs font-semibold text-green-700 flex items-center justify-center gap-1.5 border border-green-200/60">
                  <i className="ri-checkbox-circle-fill text-green-600" />
                  <span>Inquiry Accepted</span>
                </div>
                <Link
                  to={isFarmer ? `/farmer/inquiries` : `/inquiries`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#1B4332] px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer no-underline shadow-xs"
                >
                  <i className="ri-file-list-3-line" />
                  <span>Go to Inquiry</span>
                </Link>
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

      {/* Sent / Seen indicator for sender */}
      {isOwn && isLastMine && (
        <div className="flex items-center justify-end gap-1 mt-1 mr-1 text-[11px] font-bold select-none transition-all">
          {isSeen ? (
            <span className="flex items-center gap-1 text-[#2D6A4F]">
              <i className="ri-check-double-line text-xs font-bold text-[#2D6A4F]" />
              Seen
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400 font-semibold">
              <i className="ri-check-line text-xs text-gray-400" />
              Sent
            </span>
          )}
        </div>
      )}
    </div>
  );
}
