import { getFormatPrice, getDiscount, hasProductDiscount } from "../../../utils/price";

const CATEGORY_ICONS = {
  Vegetables: "ri-plant-line",
  Fruits: "ri-seedling-line",
  Grains: "ri-leaf-line",
  Livestock: "ri-heart-line",
  Herbs: "ri-medicine-bottle-line",
  "Root Crops": "ri-earth-line",
  Seafood: "ri-water-flash-line",
  Others: "ri-shopping-basket-2-line",
};

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
  const categoryIcon =
    CATEGORY_ICONS[product.category] || "ri-shopping-basket-2-line";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      {/* Top Badges Row: Category (Readable with Shadow) + Stock Status + Report Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Pill with Icon & Shadow */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EE] border border-[#2D6A4F]/20 px-3 py-1 text-xs font-bold text-[#1B4332] shadow-xs">
            <i className={`${categoryIcon} text-[#2D6A4F] text-sm`} />
            <span>{product.category || "Produce"}</span>
          </span>

          {/* Stock Status */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs border ${
              product.available
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                product.available ? "bg-emerald-600" : "bg-red-600"
              }`}
            />
            {product.available ? "In Stock" : "Out of Stock"}
          </span>
        </div>

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

      {/* Product Name */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B4332] leading-tight">
        {product.name}
      </h1>

      {/* Price Block */}
      <div className="mt-4 flex items-center gap-3.5 flex-wrap">
        <p className="text-3xl sm:text-4xl font-extrabold text-[#1B4332] tracking-tight">
          ₱{priceFormatted}
          <span className="text-base sm:text-lg font-semibold text-gray-500 ml-1">
            /{product.unit}
          </span>
        </p>

        {hasDiscount && (
          <div className="flex items-start gap-1.5">
            {/* Slashed original price */}
            <span className="text-base sm:text-lg font-bold text-gray-400 line-through">
              ₱{originalPriceFormatted}
            </span>
            {/* Percent in right side top of slash */}
            <span className="inline-flex items-center rounded-md bg-[#FF2D55] px-1.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-white shadow-2xs -mt-1">
              -{discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Rating & Reviews + Stock Info - Solid readable divider line */}
      <div className="mt-4 pt-3.5 border-t-2 border-gray-200 flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-bold text-amber-800">
          <i className="ri-star-fill text-amber-500 text-sm" />
          <span>{averageRating.toFixed(1)}</span>
        </div>

        <span className="text-xs sm:text-sm font-semibold text-gray-600">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>

        {product.stock != null && (
          <>
            <span className="text-gray-300 font-bold">•</span>
            <span className="text-xs sm:text-sm font-bold text-gray-700">
              {product.stock} {product.unit || "units"} available
            </span>
          </>
        )}
      </div>
    </section>
  );
}
