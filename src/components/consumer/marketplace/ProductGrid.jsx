import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ProductCard from "../../products/ProductCard";

const estimateCardHeight = (width) => Math.max(260, Math.round(width * 1.72));

/**
 * A light DOM-order-preserving masonry layout. Products are assigned by their
 * sorted index (left-to-right, then back to the first column) and positioned
 * from measured card heights. Unlike CSS columns, keyboard and screen-reader
 * order remains the catalog order.
 */
export default function ProductGrid({
  products,
  columns = 2,
  enteringIds = new Set(),
}) {
  const rootRef = useRef(null);
  const itemRefs = useRef(new Map());
  const [metrics, setMetrics] = useState({
    width: 0,
    gap: 16,
    heights: new Map(),
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return undefined;
    const readRoot = () => {
      const styles = window.getComputedStyle(root);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 16;
      setMetrics((current) =>
        current.width === root.clientWidth && current.gap === gap
          ? current
          : { ...current, width: root.clientWidth, gap },
      );
    };
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === root) readRoot();
        else {
          const id = entry.target.dataset.productId;
          if (!id) continue;
          const height = Math.ceil(entry.contentRect.height);
          setMetrics((current) =>
            current.heights.get(id) === height
              ? current
              : {
                  ...current,
                  heights: new Map(current.heights).set(id, height),
                },
          );
        }
      }
    });
    observer.observe(root);
    itemRefs.current.forEach((node) => observer.observe(node));
    readRoot();
    return () => observer.disconnect();
  }, [columns, products]);

  const layout = useMemo(() => {
    const safeColumns = Math.max(2, columns);
    const columnWidth =
      metrics.width > 0
        ? (metrics.width - metrics.gap * (safeColumns - 1)) / safeColumns
        : 0;
    const heights = Array(safeColumns).fill(0);
    const positions = new Map();
    products.forEach((product, index) => {
      const column = index % safeColumns;
      positions.set(product.id, { column, top: heights[column] });
      heights[column] +=
        (metrics.heights.get(product.id) ||
          estimateCardHeight(columnWidth || 160)) + metrics.gap;
    });
    return {
      columnWidth,
      positions,
      height: Math.max(0, ...heights) - (products.length ? metrics.gap : 0),
    };
  }, [columns, metrics.gap, metrics.heights, metrics.width, products]);

  let entranceIndex = 0;
  const setItemRef = (id) => (node) => {
    if (node) itemRefs.current.set(id, node);
    else itemRefs.current.delete(id);
  };

  if (!products.length) return null;
  return (
    <div
      ref={rootRef}
      role="list"
      aria-label="Marketplace products"
      className="relative w-full"
      style={{
        height: layout.height,
        columnGap: "var(--marketplace-card-gap, 1rem)",
      }}
    >
      {products.map((product) => {
        const position = layout.positions.get(product.id);
        const isEntering = enteringIds.has(product.id);
        const stagger = isEntering
          ? `stagger-${Math.min(++entranceIndex, 8)}`
          : "";
        return (
          <div
            key={product.id}
            ref={setItemRef(product.id)}
            data-product-id={product.id}
            role="listitem"
            className={isEntering ? `marketplace-card-enter ${stagger}` : ""}
            style={{
              position: "absolute",
              top: position?.top || 0,
              left: position
                ? position.column * (layout.columnWidth + metrics.gap)
                : 0,
              width:
                layout.columnWidth ||
                `calc((100% - ${Math.max(2, columns) - 1} * var(--marketplace-card-gap, 1rem)) / ${Math.max(2, columns)})`,
            }}
          >
            <ProductCard product={product} />
          </div>
        );
      })}
    </div>
  );
}
