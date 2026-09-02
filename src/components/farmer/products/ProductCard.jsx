import { useState } from "react";

import { useLanguage } from "../../../context/LanguageContext";
import productPlaceholder from "../../../assets/img/productPlaceholder.png";

import { getFormatPrice, getDiscount, hasProductDiscount } from "../../../utils/price";
import { useLiveRemainingTime } from "../../../utils/productExpiration";

import { CATEGORY_ICONS } from "../../../utils/categoryIcons";
import { applyTransform, PRODUCT_THUMB_TF, isCloudinaryUrl } from "../../../utils/cloudinaryTransform";

export default function ProductCard({ product, view, onEdit, onDelete }) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const rawImage = product.images?.[0]?.url || productPlaceholder;
  const image = imgError
    ? productPlaceholder
    : isCloudinaryUrl(rawImage)
      ? applyTransform(rawImage, PRODUCT_THUMB_TF)
      : rawImage;

  const { remainingTime, isExpired } = useLiveRemainingTime(product);
  const stockNum = Number(product.stock ?? 0);
  const isAvailable = product.available !== false && stockNum > 0 && !isExpired;
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
      <div className="bg-(--agri-card) rounded-xl border border-(--agri-border) shadow-xs hover:shadow-sm p-3 sm:p-3.5 flex items-center gap-3 sm:gap-4 transition-all">
        <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-(--agri-hover) border border-(--agri-border)">
          <img
            src={image}
            alt={product.name}
            width={80}
            height={80}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-(--agri-hover) px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-[#1B4332]">
              <i className={`${categoryIcon} text-[#2D6A4F]`} />
              <span>{product.category || t("product.produce")}</span>
            </span>

            {isExpired ? (
              <>
                <span className="rounded-md bg-(--agri-hover) px-1.5 py-0.5 text-[10px] font-bold text-(--agri-text-secondary)">
                  {t("products.expired")}
                </span>
                <span className="rounded-md bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                  <i className="ri-eye-off-line text-[9px]" />
                  {t("products.noDisplay")}
                </span>
              </>
            ) : !isAvailable ? (
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                {t("product.outOfStock")}
              </span>
            ) : isLowStock ? (
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                {t("product.stockLeft", { count: stockNum })}
              </span>
            ) : remainingTime ? (
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
                <i className="ri-time-line text-[9px]" />
                {remainingTime}
              </span>
            ) : (
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                {t("product.inStock")}
              </span>
            )}
          </div>

          <h3
            className="font-bold text-(--agri-text) text-xs sm:text-sm line-clamp-2 leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="mt-1 flex flex-wrap items-baseline gap-2 text-xs">
            <span className="font-extrabold text-(--agri-brand-dark) dark:text-(--agri-brand) text-sm">
              ₱{priceFormatted}/{product.unit || "kg"}
            </span>

            {hasDiscount && (
              <span className="font-semibold text-(--agri-text-muted) line-through decoration-gray-400 text-xs">
                ₱{originalPriceFormatted}
              </span>
            )}

            {hasDiscount && (
              <span className="inline-flex items-center rounded bg-red-50 border border-red-200 px-1.5 py-0.2 text-[9px] font-bold text-red-600">
                -{discountPercent}%
              </span>
            )}

            <span className="text-[var(--agri-text-muted)] text-[11px]">
              • {product.stock} {product.unit || t("products.stockUnit")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--agri-hover)] hover:bg-[#E8F5EE] hover:text-[#2D6A4F] text-[var(--agri-text-secondary)] flex items-center justify-center transition cursor-pointer"
            title={t("products.editProduct")}
          >
            <i className="ri-edit-line text-sm sm:text-base" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(product)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition cursor-pointer"
            title={t("products.deleteTitle")}
          >
            <i className="ri-delete-bin-line text-sm sm:text-base" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-sm hover:shadow-md transition-all">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F0F5F2]">
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
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#1B4332] shadow-xs backdrop-blur-md border border-[var(--agri-border-subtle)] max-w-[55%] truncate">
          <i className={`${categoryIcon} text-[#2D6A4F] text-xs shrink-0`} />
          <span className="truncate">{product.category || t("product.produce")}</span>
        </div>

        {/* Stock / Expiration Badge - Stuck to Top Right Corner */}
        {isExpired ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-lg bg-gray-700 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
            {t("products.expired")}
          </div>
        ) : !isAvailable ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-lg bg-red-600 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
            {t("product.outOfStock")}
          </div>
        ) : isLowStock ? (
          <div className="absolute top-0 right-0 z-10 rounded-bl-lg bg-[#E63946] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
            {t("product.stockLeft", { count: stockNum })}
          </div>
        ) : (
          <div className="absolute top-0 right-0 z-10 rounded-bl-lg bg-[#2D6A4F] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
            {t("product.inStock")}
          </div>
        )}

        {/* Bottom Left of Image: Expiration Status or Remaining Time */}
        {isExpired ? (
          <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1 rounded-full bg-red-950/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-red-200 shadow-sm backdrop-blur-xs border border-red-500/30">
            <i className="ri-eye-off-line text-[10px] text-red-300 shrink-0" />
            <span>{t("products.noDisplay")}</span>
          </div>
        ) : remainingTime && isAvailable ? (
          <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center rounded-full bg-black/70 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-sm backdrop-blur-xs border border-white/20">
            <span>{remainingTime}</span>
          </div>
        ) : null}
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3 space-y-2">
        <div>
          {/* Produce Name: 2 rows flexible min-height */}
          <h3
            className="text-xs sm:text-sm font-bold text-[var(--agri-text)] line-clamp-2 leading-snug min-h-[2.4em]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price with Slashed Original Price + Percent beside it on the right side */}
          <div className="mt-1 flex items-baseline justify-between gap-1 flex-wrap">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm sm:text-base md:text-lg font-black text-(--agri-brand-dark) dark:text-(--agri-brand) leading-none">
                  ₱{priceFormatted}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[var(--agri-text-secondary)]">
                  /{product.unit || "kg"}
                </span>
              </div>

              {hasDiscount && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] sm:text-xs font-bold text-[var(--agri-text-muted)] line-through decoration-gray-400">
                    ₱{originalPriceFormatted}
                  </span>
                  <span className="inline-flex items-center rounded bg-red-50 border border-red-200/80 px-1 py-0.2 text-[8px] sm:text-[9px] font-black text-red-600 leading-tight">
                    -{discountPercent}%
                  </span>
                </div>
              )}
            </div>

            <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--agri-text-muted)] shrink-0">
              {stockNum} {t("products.stockUnit")}
            </span>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="pt-2 border-t border-[var(--agri-border)] flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[var(--agri-hover)] hover:bg-[#E8F5EE] hover:text-[#2D6A4F] text-[var(--agri-text-secondary)] text-xs font-bold rounded-lg transition cursor-pointer"
          >
            <i className="ri-edit-line text-xs" />
            <span>{t("common.edit")}</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(product)}
            className="flex items-center justify-center p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
            title={t("products.deleteTitle")}
          >
            <i className="ri-delete-bin-line text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
