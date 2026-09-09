import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useFavorites } from "../../context/FavoritesContext";

import { getProductPath } from "../../utils/routes";
import {
  getFormatPrice,
  getDiscount,  
  hasProductDiscount,
} from "../../utils/price";

import { useLiveRemainingTime } from "../../utils/productExpiration";
import {
  getProductStock,
  getProductStatus,
  PRODUCT_STATUS,
  LOW_STOCK_THRESHOLD,
} from "../../utils/productStatus";

import productPlaceholder from "../../assets/img/productPlaceholder.png";
import { formatTimestamp } from "../../utils/date";

import { CATEGORY_ICONS } from "../../utils/categoryIcons";
import { applyTransform, PRODUCT_THUMB_TF, isCloudinaryUrl } from "../../utils/cloudinaryTransform";

export default function ProductCard({
  product,
  hideFooter = false,
  hideDiscount = false,
}) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imgError, setImgError] = useState(false);
  const rawImage = product.images?.[0]?.url ?? product.images?.[0];
  const image = imgError || !rawImage
    ? productPlaceholder
    : isCloudinaryUrl(rawImage)
      ? applyTransform(rawImage, PRODUCT_THUMB_TF)
      : rawImage;

  const { remainingTime, isExpired } = useLiveRemainingTime(product);
  const stockNum = getProductStock(product);
  const productStatus = getProductStatus(product);
  const isPreorder = productStatus === PRODUCT_STATUS.PREORDER;
  const isNotAvailable = productStatus === PRODUCT_STATUS.NOT_AVAILABLE;
  const isNoStock = productStatus === PRODUCT_STATUS.NO_STOCK;
  const isAvailable = productStatus === PRODUCT_STATUS.IN_STOCK;
  const isLowStock = isAvailable && stockNum <= LOW_STOCK_THRESHOLD;

  // Auto delete / vanish completely from consumer view once duration is done
  if (isExpired) {
    return null;
  }

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
      data-onboarding="product-card"
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#2D6A4F]/60 hover:shadow-xl anim-fade-in"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--agri-bg-surface,#F0F5F2)]">
        <img
          src={image}
          alt={product.name}
          width={400}
          height={400}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Pill - Top Left */}
        <div className="absolute left-1.5 top-1.5 sm:left-2.5 sm:top-2.5 flex items-center gap-1 rounded-full bg-[var(--agri-card)]/95 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-[#1B4332] dark:text-[var(--agri-brand-light)] shadow-sm backdrop-blur-md border border-[var(--agri-border-subtle)] max-w-[50%] truncate">
          <i
            className={`${categoryIcon} text-[#2D6A4F] dark:text-[var(--agri-brand)] text-xs sm:text-sm shrink-0`}
          />
          <span className="truncate">{product.category || t("product.produce")}</span>
        </div>

        {/* Stock Badge - Stuck to Top Right Corner */}
        {isPreorder ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-xl sm:rounded-bl-2xl bg-amber-500 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            {t("product.preOrder")}
          </div>
        ) : isNotAvailable ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-xl sm:rounded-bl-2xl bg-red-600 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            {t("product.notAvailable")}
          </div>
        ) : isNoStock ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-xl sm:rounded-bl-2xl bg-red-600 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            {t("product.outOfStock")}
          </div>
        ) : isLowStock ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-xl sm:rounded-bl-2xl bg-[#E63946] px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            {t("product.stockLeft", { count: stockNum })}
          </div>
        ) : (
          <div className="absolute top-0 right-0 z-10 rounded-bl-xl sm:rounded-bl-2xl bg-[#2D6A4F] px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            {t("product.inStock")}
          </div>
        )}

        {/* Duration / Auto-Disappear Badge - Bottom Left of Image */}
        {remainingTime && (isAvailable || isPreorder) && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-10 flex items-center rounded-full bg-black/70 px-2 py-0.5 text-[9px] sm:text-[11px] font-bold text-white shadow-sm backdrop-blur-xs border border-white/20">
            <span>{remainingTime}</span>
          </div>
        )}

        {/* Favorite Button - Bottom Right of Image */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (profile) toggleFavorite("product", product.id);
          }}
          className={`absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 shadow-sm
            ${isFavorite("product", product.id)
              ? "bg-[#E63946] text-white"
              : "bg-[var(--agri-card)]/90 text-[var(--agri-text-muted)] border border-[var(--agri-border-subtle)] hover:text-[#E63946]"
            }
            ${!profile ? "cursor-default opacity-60" : "cursor-pointer"}
          `}
          aria-label={isFavorite("product", product.id) ? t("favorites.remove") : t("favorites.add")}
        >
          <i className={`${isFavorite("product", product.id) ? "ri-heart-fill" : "ri-heart-line"} text-sm`} />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4 pt-1 space-y-2 sm:space-y-3">
        
        <div>
          {/* Produce Name */}
          <div className="flex justify-between">
            <h3
              className="text-sm sm:text-base md:text-lg font-bold text-[var(--agri-text)] line-clamp-2 leading-snug transition-colors group-hover:text-[var(--agri-text)]"
              title={product.name}
            >
              {product.name}
            </h3>
            <span className="text-[10px] sm:text-xs font-semibold text-[var(--agri-text-muted)] shrink-0">
              {createdAtFormatted}
            </span>
          </div>

          {/* Price with Slashed Price + Percent beside it on the right side */}
          <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {/* Main Selling Price */}
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm sm:text-lg md:text-xl font-black text-[#1B4332] dark:text-[var(--agri-brand-light)] leading-none">
                  ₱{priceFormatted}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-[var(--agri-text-secondary)]">
                  /{product.unit || "kg"}
                </span>
              </div>

              {/* Slashed Original Price + Percent beside on the right */}
              {hasDiscount && !hideDiscount && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] sm:text-xs font-bold text-[var(--agri-text-muted)] line-through decoration-[var(--agri-text-muted)]">
                    ₱{originalPriceFormatted}
                  </span>
                  <span className="inline-flex items-center rounded bg-red-50 dark:bg-red-500/10 border border-red-200/80 dark:border-red-500/30 px-1 py-0.2 text-[8px] sm:text-[9px] font-black text-red-600 dark:text-red-400 leading-tight">
                    -{discountPercent}%
                  </span>
                </div>
              )}
            </div>

            {!isPreorder && isAvailable && (
            <span className="text-[10px] sm:text-xs font-semibold text-[var(--agri-text-muted)] shrink-0">
                {t("product.stockCount", { count: stockNum })}
              </span>
            )}
          </div>

          {/* Pre-order info */}
          {isPreorder && (
            <div className="mt-2 space-y-1">
              {product.preOrderDeadline && (
                <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <i className="ri-time-line" />
                  {t("product.orderUntil")} {new Date(product.preOrderDeadline).toLocaleDateString()}
                </p>
              )}
              {product.expectedAvailableDate && (
                <p className="text-[10px] sm:text-xs text-[var(--agri-text-muted)] font-medium flex items-center gap-1">
                  <i className="ri-calendar-line" />
                  {t("product.availableDate")} {new Date(product.expectedAvailableDate).toLocaleDateString()}
                </p>
              )}
              {product.preOrderLimit != null && (
                <p className="text-[10px] sm:text-xs text-[var(--agri-text-muted)] font-medium">
                  {product.reservedQuantity ?? 0} / {product.preOrderLimit} {product.unit || "units"} {t("product.reserved")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Rating & Distance */}
        {!hideFooter && (
          <div className="pt-2 sm:pt-3 border-t border-[var(--agri-border-subtle)] flex items-center justify-between gap-1 text-[10px] sm:text-xs">
            {/* Rating */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {product.reviewCount > 0 ? (
                <>
                  <i className="ri-star-fill text-amber-500 text-xs sm:text-sm" />
                  <span className="font-bold text-[var(--agri-text)]">
                    {product.productRating}
                  </span>
                  <span className="text-[var(--agri-text-muted)] font-medium">
                    ({product.reviewCount})
                  </span>
                </>
              ) : (
                <span className="text-[var(--agri-text-muted)] font-medium">{t("product.noReviews")}</span>
              )}
            </div>

            {/* Distance */}
            <div className="flex items-center gap-1 text-[var(--agri-text-muted)] font-medium">
              <i className="ri-map-pin-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
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
