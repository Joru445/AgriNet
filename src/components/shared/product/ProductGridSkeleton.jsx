import ProductCardSkeleton from "./ProductCardSkeleton";

/**
 * Reusable product card grid skeleton that mirrors the shared consumer
 * ProductCard grid used across Home sections, Marketplace and Store.
 *
 * Pass the same grid classes as the real container being represented so the
 * skeleton keeps identical responsive behavior.
 */
export default function ProductGridSkeleton({ count = 4, gridClassName = "", showFooter = true }) {
  return (
    <div className={`grid ${gridClassName}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} showFooter={showFooter} />
      ))}
    </div>
  );
}