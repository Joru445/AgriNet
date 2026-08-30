import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { getProductPath } from "../../utils/routes";
import {
  getFormatPrice,
  getDiscount,  
  hasProductDiscount,
} from "../../utils/price";

import { useLiveRemainingTime } from "../../utils/productExpiration";

import productPlaceholder from "../../assets/img/productPlaceholder.png";
import { formatTimestamp } from "../../utils/date";

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

export default function ProductCard({
  product,
  hideFooter = false,
  hideDiscount = false,
}) {
  const { profile } = useAuth();
  const [imgError, setImgError] = useState(false);
  const rawImage = product.images?.[0]?.url ?? product.images?.[0];
  const image = imgError || !rawImage ? productPlaceholder : rawImage;

  const { remainingTime, isExpired } = useLiveRemainingTime(product);
  const stockNum = Number(product.stock ?? 0);
  const isAvailable = product.available !== false && stockNum > 0 && !isExpired;
  const isLowStock = isAvailable && stockNum <= 5;

  const priceNum = Number(product.price ?? 0);
  const originalPriceNum = Number(product.originalPrice ?? 0);
  const hasDiscount = hasProductDiscount(product.originalPrice, product.price);
  const discountPercent = hasDiscount
    ? getDiscount(product.originalPrice, product.price)
    : 0;

  const priceFormatted = getFormatPrice(priceNum);
  const originalPriceFormatted = getFormatPrice(originalPriceNum);

  const createdAtFormatted = formatTimestamp(product.createdAt);

  const categoryIcon =
    CATEGORY_ICONS[product.category] || "ri-shopping-basket-2-line";

  return (
    <Link
      to={`${getProductPath(profile?.role || "consumer")}/${product.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-gray-300 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#2D6A4F]/60 hover:shadow-xl"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F0F5F2]">
        <img
          src={image}
          alt={product.name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Pill - Top Left */}
        <div className="absolute left-1.5 top-1.5 sm:left-2.5 sm:top-2.5 flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-[#1B4332] shadow-sm backdrop-blur-md border border-gray-100 max-w-[50%] truncate">
          <i
            className={`${categoryIcon} text-[#2D6A4F] text-xs sm:text-sm shrink-0`}
          />
          <span className="truncate">{product.category || "Produce"}</span>
        </div>

        {/* Stock Badge - Stuck to Top Right Corner */}
        {isExpired ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-xl sm:rounded-bl-2xl bg-gray-700 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            Expired
          </div>
        ) : !isAvailable ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-xl sm:rounded-bl-2xl bg-red-600 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            Out of Stock
          </div>
        ) : isLowStock ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-xl sm:rounded-bl-2xl bg-[#E63946] px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            {stockNum} left
          </div>
        ) : (
          <div className="absolute top-0 right-0 z-10 rounded-bl-xl sm:rounded-bl-2xl bg-[#2D6A4F] px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            In Stock
          </div>
        )}

        {/* Duration / Auto-Disappear Badge - Bottom Left of Image */}
        {remainingTime && isAvailable && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-10 flex items-center rounded-full bg-black/70 px-2 py-0.5 text-[9px] sm:text-[11px] font-bold text-white shadow-sm backdrop-blur-xs border border-white/20">
            <span>{remainingTime}</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4 pt-1 space-y-2 sm:space-y-3">
        
        <div>
          {/* Produce Name */}
          <div className="flex justify-between">
            <h3
              className="text-xs sm:text-base md:text-lg font-bold text-gray-700 line-clamp-2 leading-snug transition-colors group-hover:text-gray-900"
              title={product.name}
            >
              {product.name}
            </h3>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-500 shrink-0">
              {createdAtFormatted}
            </span>
          </div>

          {/* Price with Slashed Price + Percent beside it on the right side */}
          <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {/* Main Selling Price */}
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm sm:text-lg md:text-xl font-black text-[#1B4332] leading-none">
                  ₱{priceFormatted}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-gray-600">
                  /{product.unit || "kg"}
                </span>
              </div>

              {/* Slashed Original Price + Percent beside on the right */}
              {hasDiscount && !hideDiscount && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] sm:text-xs font-bold text-gray-400 line-through decoration-gray-400">
                    ₱{originalPriceFormatted}
                  </span>
                  <span className="inline-flex items-center rounded bg-red-50 border border-red-200/80 px-1 py-0.2 text-[8px] sm:text-[9px] font-black text-red-600 leading-tight">
                    -{discountPercent}%
                  </span>
                </div>
              )}
            </div>

            {isAvailable && (
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500 shrink-0">
                {stockNum} stocks
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Rating & Distance */}
        {!hideFooter && (
          <div className="pt-2 sm:pt-3 border-t border-gray-200 flex items-center justify-between gap-1 text-[10px] sm:text-xs">
            {/* Rating */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {product.reviewCount > 0 ? (
                <>
                  <i className="ri-star-fill text-amber-500 text-xs sm:text-sm" />
                  <span className="font-bold text-gray-900">
                    {product.productRating}
                  </span>
                  <span className="text-gray-500 font-medium">
                    ({product.reviewCount})
                  </span>
                </>
              ) : (
                <span className="text-gray-400 font-medium">No reviews</span>
              )}
            </div>

            {/* Distance */}
            <div className="flex items-center gap-1 text-gray-500 font-medium">
              <i className="ri-map-pin-line text-[#2D6A4F]" />
              <span>
                {product.distance == null
                  ? "--"
                  : `${product.distance.toFixed(1)} km`}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
