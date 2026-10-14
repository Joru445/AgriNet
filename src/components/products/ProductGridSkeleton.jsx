import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductGridSkeleton({ count = 4, columns, gridClassName = "", showFooter = true }) {
  if (!columns) {
    return <div className={`grid ${gridClassName}`}>{Array.from({ length: count }).map((_, index) => <ProductCardSkeleton key={index} showFooter={showFooter} />)}</div>;
  }
  const safeColumns = Math.max(2, columns);
  const buckets = Array.from({ length: safeColumns }, () => []);
  Array.from({ length: count }).forEach((_, index) => buckets[index % safeColumns].push(index));
  return <div className="flex items-start gap-[var(--marketplace-card-gap,1rem)]" aria-live="polite" aria-label="Loading products">
    {buckets.map((bucket, column) => <div key={column} className="min-w-0 flex-1 space-y-[var(--marketplace-card-gap,1rem)]">{bucket.map((index) => <ProductCardSkeleton key={index} showFooter={showFooter} />)}</div>)}
  </div>;
}
