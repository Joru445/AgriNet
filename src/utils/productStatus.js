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
 *
 * NOTE: getProductInquiryState() below is the canonical inquiry-eligibility
 * helper for the product/pre-order lifecycle. getProductStatus() remains the
 * coarse display status (badges, dashboards). When the two could disagree,
 * getProductInquiryState() wins — it distinguishes OUT OF STOCK vs UNAVAILABLE
 * vs PRE-ORDER ENDED vs PRE-ORDER FULL instead of collapsing them.
 */

import { parseDate } from "./date";
import { isProductExpired } from "./productExpiration";

export const PRODUCT_STATUS = {
  PREORDER: "preorder",
  NOT_AVAILABLE: "notAvailable",
  NO_STOCK: "noStock",
  IN_STOCK: "inStock",
};

/**
 * Canonical inquiry-eligibility states.
 * Invariant: OUT_OF_STOCK !== UNAVAILABLE !== PREORDER_ENDED !== PREORDER_FULL.
 */
export const INQUIRY_STATE = {
  AVAILABLE: "AVAILABLE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  UNAVAILABLE: "UNAVAILABLE",
  EXPIRED: "EXPIRED",
  PREORDER_OPEN: "PREORDER_OPEN",
  PREORDER_FULL: "PREORDER_FULL",
  PREORDER_ENDED: "PREORDER_ENDED",
  PREORDER_UNAVAILABLE: "PREORDER_UNAVAILABLE",
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
 * The single, centralized interpretation of "the pre-order deadline has
 * passed". Uses parseDate so Firestore Timestamps, epoch millis (API
 * serialization), Date objects and ISO strings all compare identically.
 * Never relies on a stored flag — time-derived state is recomputed from
 * current time, so cached/stale product data still yields the right answer.
 */
export function isPreOrderDeadlinePassed(product, now = Date.now()) {
  const deadline = parseDate(product?.preOrderDeadline);
  return Boolean(deadline) && now > deadline.getTime();
}

/**
 * Remaining reservable pre-order capacity: max(0, limit - reserved).
 * Returns null when the product is not a pre-order or its limit is
 * missing/invalid (corrupt configuration) — callers must treat null as
 * "cannot reserve".
 */
export function getRemainingPreOrderCapacity(product) {
  if (!isPreorder(product)) return null;
  const limit = Number(product?.preOrderLimit);
  if (!Number.isFinite(limit) || limit <= 0) return null;
  const reservedRaw = Number(product?.reservedQuantity);
  const reserved = Number.isFinite(reservedRaw) ? reservedRaw : 0;
  return Math.max(0, limit - reserved);
}

/**
 * CANONICAL domain helper: structured inquiry eligibility for a product.
 *
 *   { allowed, code, labelKey, ctaKey, reasonKey, quantityAvailable }
 *
 * - labelKey: i18n key for the state label (badges, chips, disabled CTAs)
 * - ctaKey:   i18n key for the action label when allowed, else null
 * - reasonKey: i18n key for a short supporting explanation
 * - quantityAvailable: reservable/.buyable units when allowed, else 0
 *
 * Components must NOT individually compare stock/available/sellingMode/
 * deadline/reservedQuantity/preOrderLimit unless the comparison is purely
 * presentation-specific.
 *
 * Priority: expired listing > manual unavailability > pre-order deadline >
 * pre-order capacity > stock. For standard products OUT_OF_STOCK is checked
 * before UNAVAILABLE because completing a sale sets available=false once
 * stock hits 0 — sold-out must read "No Stock", not "Not Available".
 */
export function getProductInquiryState(product, now = Date.now()) {
  const blocked = (code, labelKey, reasonKey) => ({
    allowed: false,
    code,
    labelKey,
    ctaKey: null,
    reasonKey,
    quantityAvailable: 0,
  });

  if (!product) {
    return blocked(
      INQUIRY_STATE.UNAVAILABLE,
      "product.notAvailable",
      "product.notAvailableReason",
    );
  }

  if (isProductExpired(product)) {
    return blocked(
      INQUIRY_STATE.EXPIRED,
      "products.expired",
      "productDetails.unavailableDesc",
    );
  }

  if (isPreorder(product)) {
    if (product.available === false) {
      return blocked(
        INQUIRY_STATE.PREORDER_UNAVAILABLE,
        "product.notAvailable",
        "product.preOrderUnavailableReason",
      );
    }
    if (isPreOrderDeadlinePassed(product, now)) {
      return blocked(
        INQUIRY_STATE.PREORDER_ENDED,
        "product.preOrderEnded",
        "product.preOrderEndedReason",
      );
    }
    const remaining = getRemainingPreOrderCapacity(product);
    if (remaining === null) {
      return blocked(
        INQUIRY_STATE.PREORDER_UNAVAILABLE,
        "product.notAvailable",
        "product.preOrderUnavailableReason",
      );
    }
    if (remaining <= 0) {
      return blocked(
        INQUIRY_STATE.PREORDER_FULL,
        "product.preOrderFull",
        "product.preOrderFullReason",
      );
    }
    return {
      allowed: true,
      code: INQUIRY_STATE.PREORDER_OPEN,
      labelKey: "product.preOrder",
      ctaKey: "productDetails.sendPreOrderInquiry",
      reasonKey: "",
      quantityAvailable: remaining,
    };
  }

  const stock = getProductStock(product);
  if (stock <= 0) {
    return blocked(
      INQUIRY_STATE.OUT_OF_STOCK,
      "product.outOfStock",
      "product.outOfStockReason",
    );
  }
  if (product.available === false) {
    return blocked(
      INQUIRY_STATE.UNAVAILABLE,
      "product.notAvailable",
      "product.notAvailableReason",
    );
  }
  return {
    allowed: true,
    code: INQUIRY_STATE.AVAILABLE,
    labelKey: "product.inStock",
    ctaKey: "productDetails.sendInquiry",
    reasonKey: "",
    quantityAvailable: stock,
  };
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
 * Whether the product can currently be purchased/ordered (in stock, or an
 * OPEN pre-order that can still be reserved). Delegates to the canonical
 * inquiry state, so expired listings, ended/full pre-orders, unavailable and
 * out-of-stock products are all excluded. Callers that also filter expired
 * listings keep working — the checks are idempotent.
 */
export function isProductBuyable(product) {
  return getProductInquiryState(product).allowed;
}