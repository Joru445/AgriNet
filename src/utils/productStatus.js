/**
 * Single source of truth for product availability/stock status.
 *
 * Status priority:
 *   1. preorder      – special selling mode; never collapsed to a stock state
 *   2. notAvailable  – product.available === false (NOT "No Stock", even if
 *                      stock is 0 or greater)
 *   3. noStock       – available === true but stock <= 0
 *   4. inStock       – available === true with stock > 0
 *
 * Low stock is a secondary flag layered on top of inStock.
 */

export const PRODUCT_STATUS = {
  PREORDER: "preorder",
  NOT_AVAILABLE: "notAvailable",
  NO_STOCK: "noStock",
  IN_STOCK: "inStock",
};

export const LOW_STOCK_THRESHOLD = 5;

export function getProductStock(product) {
  return Number(product?.stock ?? 0);
}

export function isPreorder(product) {
  return product?.sellingMode === "preorder";
}

export function getProductStatus(product) {
  if (!product) return PRODUCT_STATUS.IN_STOCK;
  if (isPreorder(product)) return PRODUCT_STATUS.PREORDER;
  if (product.available === false) return PRODUCT_STATUS.NOT_AVAILABLE;
  if (getProductStock(product) <= 0) return PRODUCT_STATUS.NO_STOCK;
  return PRODUCT_STATUS.IN_STOCK;
}

/**
 * "Only X left" style low-stock flag. Only applies to an actually in-stock
 * product (stock > 0 and <= threshold).
 */
export function isLowStock(product) {
  return (
    getProductStatus(product) === PRODUCT_STATUS.IN_STOCK &&
    getProductStock(product) <= LOW_STOCK_THRESHOLD
  );
}

/**
 * Whether the product can currently be purchased/ordered (pre-order or
 * in stock). Does not consider listing expiration — callers handle that.
 */
export function isProductBuyable(product) {
  const status = getProductStatus(product);
  return status === PRODUCT_STATUS.IN_STOCK || status === PRODUCT_STATUS.PREORDER;
}