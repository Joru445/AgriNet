import { useEffect, useState } from "react";

const STORAGE_KEY = "agrinet_product_reviews_sync_v1";

// In-memory cache of live product review summaries: productId -> { count, average }
const liveSummaries = new Map();
const listeners = new Set();

// Initialize from local storage if available
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  Object.entries(saved).forEach(([id, data]) => {
    if (data && typeof data.count === "number") {
      liveSummaries.set(id, data);
    }
  });
} catch {
  // Storage is optional
}

function notifyListeners(productId) {
  listeners.forEach((listener) => {
    try {
      listener(productId);
    } catch {
      // Ignore listener error
    }
  });
}

function persistSummaries() {
  try {
    const obj = {};
    liveSummaries.forEach((val, key) => {
      obj[key] = val;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Storage is optional
  }
}

/**
 * Register batch product review summaries from API
 * @param {Map|Object} summaries Map or Object of productId -> { count, average }
 */
export function registerProductReviewSummaries(summaries) {
  if (!summaries) return;

  const entries = summaries instanceof Map
    ? Array.from(summaries.entries())
    : Object.entries(summaries);

  let updated = false;
  entries.forEach(([id, summary]) => {
    if (!id || !summary) return;
    const existing = liveSummaries.get(id);
    const newCount = Number(summary.count ?? 0);
    const newAverage = Number(summary.average ?? 0);

    if (!existing || newCount >= existing.count) {
      liveSummaries.set(id, {
        count: Math.max(existing?.count ?? 0, newCount),
        average: newAverage > 0 ? newAverage : (existing?.average ?? 0),
      });
      updated = true;
      notifyListeners(id);
    }
  });

  if (updated) {
    persistSummaries();
  }
}

/**
 * Record a new review for a product in realtime
 * @param {string} productId
 * @param {number} rating
 */
export function recordLiveProductReview(productId, rating) {
  if (!productId) return;

  const existing = liveSummaries.get(productId);
  const currentCount = Number(existing?.count ?? 0);
  const currentAvg = Number(existing?.average ?? 0);
  const numericRating = Number(rating || 5);

  const nextCount = currentCount + 1;
  const nextAverage = currentCount > 0
    ? Number(((currentAvg * currentCount + numericRating) / nextCount).toFixed(1))
    : numericRating;

  const updatedSummary = {
    count: nextCount,
    average: nextAverage,
  };

  liveSummaries.set(productId, updatedSummary);
  persistSummaries();
  notifyListeners(productId);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("agrinet:review-updated", {
        detail: { productId, summary: updatedSummary },
      }),
    );
  }
}

/**
 * Compute the most accurate, live review statistics for a product.
 * Compares live summaries, product.reviewCount, and product.ratingSummary.count,
 * always choosing the highest authoritative review count and fresh rating.
 */
export function getLiveProductReviewStats(product) {
  if (!product) return { reviewCount: 0, productRating: 0 };

  const live = liveSummaries.get(product.id);
  const liveCount = Number(live?.count ?? 0);
  const propCount = Number(product.reviewCount ?? 0);
  const summaryCount = Number(product.ratingSummary?.count ?? 0);

  const reviewCount = Math.max(liveCount, propCount, summaryCount);

  let productRating = 0;
  if (live?.average != null && live.average > 0) {
    productRating = Number(live.average);
  } else if (product.productRating != null && product.productRating > 0) {
    productRating = Number(product.productRating);
  } else if (product.ratingSummary?.average != null && product.ratingSummary.average > 0) {
    productRating = Number(product.ratingSummary.average);
  }

  return {
    reviewCount,
    productRating: productRating > 0 ? Number(productRating.toFixed(1)) : 0,
  };
}

/**
 * Hook to get real-time review stats for a product card.
 * Automatically updates when review summaries arrive or new reviews are submitted.
 */
export function useLiveProductReview(product) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!product?.id) return undefined;

    const handler = (changedId) => {
      if (!changedId || changedId === product.id) {
        setTick((t) => t + 1);
      }
    };

    listeners.add(handler);
    return () => listeners.delete(handler);
  }, [product?.id]);

  return getLiveProductReviewStats(product);
}

// Global window event listeners for cross-tab and cross-component sync
if (typeof window !== "undefined") {
  window.addEventListener("agrinet:review-updated", (event) => {
    const { productId, summary } = event.detail || {};
    if (productId && summary) {
      const existing = liveSummaries.get(productId);
      if (!existing || summary.count >= existing.count) {
        liveSummaries.set(productId, summary);
        notifyListeners(productId);
      }
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        Object.entries(parsed).forEach(([id, summary]) => {
          liveSummaries.set(id, summary);
          notifyListeners(id);
        });
      } catch {
        // Ignore JSON error
      }
    }
  });
}
