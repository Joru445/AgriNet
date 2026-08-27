import { getFormatPrice, getDiscount, hasProductDiscount } from "../../../utils/price";

export default function ProductInfo({
  product,
  reviewCount,
  averageRating,
  onReport,
  isOwner = false,
}) {
  const originalPriceNum = Number(product.originalPrice);
  const priceNum = Number(product.price ?? 0);
  const hasDiscount = hasProductDiscount(product.originalPrice, product.price);
  const discountPercent = hasDiscount
    ? getDiscount(product.originalPrice, product.price)
    : 0;

  const priceFormatted = getFormatPrice(priceNum);
  const originalPriceFormatted = getFormatPrice(originalPriceNum);

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            product.available
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {product.available ? "Available" : "Unavailable"}
        </span>

        {!isOwner && onReport && (
          <button
            type="button"
            onClick={onReport}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
            title="Report this product"
          >
            <i className="ri-alert-line text-sm" />
            <span>Report</span>
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold text-[#1B4332]">{product.name}</h1>

      <div className="mt-3 flex items-center gap-2">
        <i className="ri-star-fill text-yellow-500" />

        <span className="font-semibold">{averageRating.toFixed(1)}</span>

        <span className="text-gray-500">({reviewCount} reviews)</span>
      </div>

      <div className="mt-6 flex items-baseline gap-3 flex-wrap">
        {hasDiscount && (
          <span className="inline-flex items-center rounded-lg bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs sm:text-sm font-extrabold text-red-600">
            -{discountPercent}% OFF
          </span>
        )}
        <p className="text-3xl sm:text-4xl font-extrabold text-[#1B4332]">
          ₱{priceFormatted}
          <span className="text-base font-semibold text-gray-500">
            /{product.unit}
          </span>
        </p>
        {hasDiscount && (
          <p className="text-lg sm:text-xl font-semibold text-gray-400 line-through">
            ₱{originalPriceFormatted}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-gray-100 px-4 py-2 text-sm">
          {product.category}
        </span>
      </div>
    </section>
  );
}
