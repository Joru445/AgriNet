import { getProductImage } from "../../../utils/getProductImage";

export default function Inquiry({ productData, counterparty }) {
  const price = Number(productData?.price) || 0;
  const quantity = Number(productData?.quantity) || 0;
  const total = price * quantity;

  return (
    <div className="flex gap-4">
      <img
        src={getProductImage(productData)}
        alt={productData?.name || "Product"}
        className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
      />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-gray-800 sm:text-base">
          {productData?.name || "Product unavailable"}
        </h3>

        {productData?.unit && (
          <p className="mt-0.5 text-xs text-gray-400">
            Price per {productData.unit}
          </p>
        )}

        <p className="mt-2 text-base font-semibold text-[#2D6A4F] sm:text-lg">
          ₱{total.toLocaleString()}
          {productData?.quantity != null && productData?.unit && (
            <span className="ml-1 text-xs font-normal text-gray-400">
              for {productData.quantity} {productData.unit}
            </span>
          )}
        </p>

        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
          <i className="ri-user-line text-gray-600" />

          <span className="font-medium text-gray-700">
            {counterparty?.fullname ||
              (counterparty?.username
                ? `@${counterparty.username}`
                : "Unknown user")}
          </span>
        </div>
      </div>
    </div>
  );
}
