import { getProductImage } from "../../../utils/getProductImage";

export default function Inquiry({ productData, counterparty }) {
  const price = Number(productData?.price) || 0;
  const quantity = Number(productData?.quantity) || 0;
  const total = price * quantity;

  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <img
        src={getProductImage(productData)}
        alt={productData?.name || "Product"}
        loading="lazy"
        className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl object-cover border border-[var(--agri-border-subtle)] shadow-xs"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="truncate text-base font-bold text-[var(--agri-text)] sm:text-lg">
            {productData?.name || "Product unavailable"}
          </h3>

          {productData?.quantity != null && productData?.unit && (
            <span className="inline-flex items-center rounded-lg bg-[var(--agri-hover)] px-2.5 py-1 text-xs font-semibold text-[var(--agri-text-secondary)]">
              {productData.quantity} {productData.unit}
            </span>
          )}
        </div>

        {productData?.unit && (
          <p className="mt-0.5 text-xs text-[var(--agri-text-muted)] font-medium">
            ₱{price.toLocaleString()} per {productData.unit}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-extrabold text-[#2D6A4F] sm:text-xl">
            ₱{total.toLocaleString()}
          </span>
          <span className="text-xs text-[var(--agri-text-muted)] font-medium">total</span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--agri-text-secondary)] min-w-0">
          <i className="ri-user-3-line text-[var(--agri-text-muted)] shrink-0 text-sm" />

          <span className="font-semibold text-[var(--agri-text-secondary)] truncate">
            {counterparty?.fullname ||
              (counterparty?.username
                ? `@${counterparty.username}`
                : "Unknown user")}
          </span>

          {counterparty?.verified && (
            <span
              title="Verified Farmer"
              aria-label="Verified Farmer"
              className="inline-flex shrink-0 items-center text-[#2D6A4F] text-xs"
            >
              <i className="ri-verified-badge-fill" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
