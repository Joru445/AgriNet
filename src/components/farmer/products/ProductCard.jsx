import productPlaceholder from "../../../assets/img/productPlaceholder.png";

const CATEGORY_ICONS = {
  Vegetables: "ri-plant-line",
  Fruits: "ri-seedling-line",
  Grains: "ri-leaf-line",
  Livestock: "ri-heart-line",
  Herbs: "ri-medicine-bottle-line",
  "Root Crops": "ri-earth-line",
  Seafood: "ri-water-flash-line",
};

export default function ProductCard({ product, view, onEdit, onDelete }) {
  const image = product.images?.[0]?.url || productPlaceholder;

  const stockNum = Number(product.stock ?? 0);
  const isAvailable = product.available !== false && stockNum > 0;
  const isLowStock = isAvailable && stockNum <= 5;

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

  if (view === "list") {
    return (
      <div className="bg-white rounded-xl border border-gray-300 shadow-xs hover:shadow-sm p-3 sm:p-3.5 flex items-center gap-3 sm:gap-4 transition-all">
        <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-[#1B4332]">
              <i className={`${categoryIcon} text-[#2D6A4F]`} />
              <span>{product.category || "Produce"}</span>
            </span>

            {!isAvailable ? (
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                {stockNum} left
              </span>
            ) : (
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                In Stock
              </span>
            )}
          </div>

          <h3
            className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="mt-1 flex flex-wrap items-baseline gap-2 text-xs">
            <span className="font-extrabold text-[#1B4332] text-sm">
              ₱{priceFormatted}/{product.unit || "kg"}
            </span>

            {hasDiscount && (
              <span className="font-semibold text-gray-500 line-through decoration-gray-400 text-xs">
                ₱{originalPriceFormatted}
              </span>
            )}

            {hasDiscount && (
              <span className="inline-flex items-center rounded bg-red-50 border border-red-200 px-1.5 py-0.2 text-[9px] font-bold text-red-600">
                -{discountPercent}%
              </span>
            )}

            <span className="text-gray-500 text-[11px]">
              • {product.stock} {product.unit || "stocks"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-100 hover:bg-[#E8F5EE] hover:text-[#2D6A4F] text-gray-600 flex items-center justify-center transition cursor-pointer"
            title="Edit Product"
          >
            <i className="ri-edit-line text-sm sm:text-base" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(product)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition cursor-pointer"
            title="Delete Product"
          >
            <i className="ri-delete-bin-line text-sm sm:text-base" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm hover:shadow-md transition-all">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F0F5F2]">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Pill - Top Left */}
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#1B4332] shadow-xs backdrop-blur-md border border-gray-100 max-w-[55%] truncate">
          <i className={`${categoryIcon} text-[#2D6A4F] text-xs shrink-0`} />
          <span className="truncate">{product.category || "Produce"}</span>
        </div>

        {/* Stock Badge - Stuck to Top Right Corner */}
        {!isAvailable ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-lg bg-red-600 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
            Out of Stock
          </div>
        ) : isLowStock ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-lg bg-[#E63946] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
            {stockNum} left
          </div>
        ) : (
          <div className="absolute top-0 right-0 z-10 rounded-bl-lg bg-[#2D6A4F] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
            In Stock
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3 space-y-2">
        <div>
          {/* Produce Name: 2 rows flexible min-height */}
          <h3
            className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug min-h-[2.4em]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price Tag & Slashed Original Price */}
          <div className="mt-1 flex items-end justify-between gap-1">
            <div>
              {hasDiscount && (
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[11px] sm:text-xs font-bold text-gray-500 line-through decoration-gray-400">
                    ₱{originalPriceFormatted}
                  </span>
                  <span className="inline-flex items-center rounded bg-red-50 border border-red-200/80 px-1 py-0.2 text-[8px] sm:text-[9px] font-black text-red-600 leading-tight">
                    -{discountPercent}%
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-0.5">
                <span className="text-sm sm:text-base md:text-lg font-black text-[#1B4332] leading-none">
                  ₱{priceFormatted}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-600">
                  /{product.unit || "kg"}
                </span>
              </div>
            </div>

            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 shrink-0">
              {stockNum} stocks
            </span>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-[#E8F5EE] hover:text-[#2D6A4F] text-gray-700 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            <i className="ri-edit-line text-xs" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(product)}
            className="flex items-center justify-center p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
            title="Delete Product"
          >
            <i className="ri-delete-bin-line text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
