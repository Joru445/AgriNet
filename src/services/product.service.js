import {
  collection,
  doc,
  getDoc,
  getDocs,
  documentId,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { apiRequest } from "./api/api.client";
import { invalidatePublicMarketplaceCache } from "../utils/publicMarketplaceCache";
import { getProductReviewSummaries } from "./product-review.service";
import * as pageCache from "../utils/pageCache";

const productsRef = collection(db, "products");

export async function getProducts() {
  const q = query(productsRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.filter((doc) => !doc.data().archivedAt).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getProductById(id) {
  const snapshot = await getDoc(doc(db, "products", id));

  if (!snapshot.exists()) {
    throw new Error("Product not found.");
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function getFarmerProducts(farmerId) {
  const q = query(
    productsRef,
    where("farmerId", "==", farmerId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.filter((doc) => !doc.data().archivedAt).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Public profile/store listings are served by the backend.  Unlike the legacy
 * Firestore helper above, this applies the same public-listing rules for
 * anonymous visitors and cannot turn a missing farmer record into a profile
 * failure.
 */
export async function getPublicFarmerProductsPage(farmerId, { cursor, limit: pageSize = 24 } = {}) {
  if (!farmerId) return { products: [], cursor: null, hasMore: false };
  const params = new URLSearchParams({ limit: String(pageSize) });
  if (cursor) params.set("cursor", cursor);
  const result = await apiRequest(`/v1/products/farmer/${encodeURIComponent(farmerId)}?${params.toString()}`, {
    requireAuth: false,
  });
  return {
    products: result.data ?? [],
    cursor: result.cursor ?? null,
    hasMore: result.hasMore === true,
  };
}

// Legacy exported function names remain for older components, but all mutations
// must go through the same validated backend path.
export const createProduct = (data) => apiCreateProduct(data);
export const updateProduct = (id, data) => apiUpdateProduct(id, data);
export const deleteProduct = (id) => apiDeleteProduct(id);

export async function getMarketplaceProductsPage({ pageSize = 24, cursor } = {}) {
  const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];

  if (cursor) constraints.splice(1, 0, startAfter(cursor));

  const productSnapshot = await getDocs(query(productsRef, ...constraints));
  const products = productSnapshot.docs.filter((productDoc) => !productDoc.data().archivedAt).map((productDoc) => ({
    id: productDoc.id,
    ...productDoc.data(),
  }));

  const farmerMap = await getFarmersByIds(
    [...new Set(products.map((product) => product.farmerId).filter(Boolean))],
  );

  // Fetch live review summaries for products with no ratingSummary or with count === 0 (stale)
  const staleProductIds = products
    .filter((product) => !product.ratingSummary || product.ratingSummary.count === 0)
    .map((product) => product.id);
  const liveRatingMap = await getProductReviewSummaries(staleProductIds);

  return {
    products: products.map((product) => {
      const farmer = farmerMap.get(product.farmerId);

      // Use live rating if available (for stale or missing ratingSummary)
      const liveRating = liveRatingMap.get(product.id);
      const rating = (liveRating && liveRating.count > 0)
        ? liveRating
        : (product.ratingSummary?.count > 0 ? product.ratingSummary : {});

      return {
        ...product,

      farmer: farmer
        ? {
            uid: farmer.uid,
            fullname: farmer.fullname,
            username: farmer.username,
            storeName: farmer.storeName,
            profilePicture: farmer.profilePicture,
            location: farmer.location,
            verificationStatus: farmer.verificationStatus || (farmer.verified === true ? "approved" : "not_applied"),
            verified: farmer.verified === true,
            groups: farmer.groups || [],
            group: farmer.group || null,
          }
        : null,

        productRating: Number(rating.average ?? product.productRating ?? 0),
        reviewCount: Number(rating.count ?? product.reviewCount ?? 0),
      };
    }),
    cursor: productSnapshot.docs.at(-1) ?? null,
    hasMore: productSnapshot.docs.length === pageSize,
  };
}

async function getFarmersByIds(ids) {
  const farmers = new Map();
  if (!ids || ids.length === 0) return farmers;

  const batches = [];
  for (let i = 0; i < ids.length; i += 30) {
    batches.push(ids.slice(i, i + 30));
  }

  const farmerSnapshots = await Promise.all(
    batches.map((batch) =>
      getDocs(
        query(collection(db, "farmers"), where(documentId(), "in", batch)),
      ).catch((err) => {
        console.warn("Error fetching farmers batch:", err);
        return { docs: [] };
      }),
    ),
  );

  const missingIds = [];

  farmerSnapshots.forEach((snapshot) => {
    snapshot.docs.forEach((farmerDoc) => {
      farmers.set(farmerDoc.id, {
        uid: farmerDoc.id,
        ...farmerDoc.data(),
      });
    });
  });

  batches.forEach((batch) => {
    batch.forEach((id) => {
      if (!farmers.has(id)) missingIds.push(id);
    });
  });

  if (missingIds.length > 0) {
    const fallbackBatches = [];
    for (let i = 0; i < missingIds.length; i += 30) {
      fallbackBatches.push(missingIds.slice(i, i + 30));
    }

    const userSnapshots = await Promise.all(
      fallbackBatches.map((batch) =>
        getDocs(
          query(collection(db, "users"), where(documentId(), "in", batch)),
        ).catch((err) => {
          console.warn("Error fetching fallback users batch:", err);
          return { docs: [] };
        }),
      ),
    );

    userSnapshots.forEach((snapshot) => {
      snapshot.docs.forEach((userDoc) => {
        farmers.set(userDoc.id, {
          uid: userDoc.id,
          ...userDoc.data(),
        });
      });
    });
  }

  return farmers;
}

/*
 * ============================================================
 * BACKEND API FUNCTIONS
 * ============================================================
 *
 * These functions call the Express backend instead of Firebase
 * directly. They are used by hooks that have been migrated to
 * the backend API. The original Firebase functions above are
 * preserved for easy rollback.
 */

export async function apiGetMarketplaceProducts({ limit: pageSize = 24, cursor, category, available, sellingMode, farmerId, groupId, sort, signal } = {}) {
  try {
    const params = new URLSearchParams();
    params.set("limit", String(pageSize));
    if (cursor) params.set("cursor", String(cursor));

    // Pass supported filters to the backend so Firestore applies them
    // server-side rather than returning the full collection.
    if (category) params.set("category", category);
    if (available !== undefined) params.set("available", String(available));
    if (sellingMode) params.set("sellingMode", sellingMode);
    if (farmerId) params.set("farmerId", farmerId);
    if (groupId) params.set("groupId", groupId);
    if (sort) params.set("sort", sort);

    const data = await apiRequest(`/v1/products/marketplace?${params}`, {
      requireAuth: false,
      signal,
    });

    const rawProducts = Array.isArray(data?.data) ? data.data : [];
    let products = rawProducts;

    if (rawProducts.length > 0) {
      try {
        const summaries = await getProductReviewSummaries(
          rawProducts.map((p) => p.id),
        );
        products = rawProducts.map((p) => {
          const live = summaries.get(p.id);
          const reviewCount = Number(
            live?.count ?? p.ratingSummary?.count ?? p.reviewCount ?? 0,
          );
          const productRating = Number(
            live?.average ?? p.ratingSummary?.average ?? p.productRating ?? 0,
          );
          return {
            ...p,
            reviewCount,
            productRating: productRating > 0 ? Number(productRating.toFixed(1)) : 0,
            ratingSummary: {
              count: reviewCount,
              average: productRating,
            },
          };
        });
      } catch (sumErr) {
        console.warn("Could not load review summaries for marketplace products:", sumErr);
        products = rawProducts.map((p) => {
          const reviewCount = Number(p.ratingSummary?.count ?? p.reviewCount ?? 0);
          const productRating = Number(p.ratingSummary?.average ?? p.productRating ?? 0);
          return {
            ...p,
            reviewCount,
            productRating: productRating > 0 ? Number(productRating.toFixed(1)) : 0,
          };
        });
      }
    }

    return {
      products,
      cursor: data.cursor ?? null,
      hasMore: data.hasMore ?? false,
    };
  } catch (err) {
    // A superseded Marketplace request must stay cancelled; falling back to
    // Firestore here would turn cancellation into an unexpected catalog read.
    if (err?.name === "AbortError") throw err;
    // API cursors and direct Firestore cursors are NOT compatible. Never
    // return unfiltered products when a backend filter or cursor was requested.
    if (cursor || category || available !== undefined || sellingMode || farmerId || groupId || sort) throw err;
    console.warn("[Products] Backend unavailable; using unfiltered first-page read:", err.message);
    return getMarketplaceProductsPage({ pageSize });
  }
}

function invalidateMarketplaceCatalog() {
  pageCache.invalidatePrefix("marketplaceCatalog:");
  // Persisted entries only contain public catalog display data. Clearing them
  // after a mutation cannot initiate a fetch or affect transaction authority.
  invalidatePublicMarketplaceCache();
}

export async function apiGetProductById(id) {
  try {
    const data = await apiRequest(`/v1/products/${encodeURIComponent(id)}`, {
      requireAuth: false,
    });
    return data.data ?? null;
  } catch (err) {
    console.warn("[Products] Backend API unavailable, using Firebase Firestore:", err.message);
    return getProductById(id);
  }
}

export async function apiGetFarmerProducts(farmerId) {
  try {
    const data = await apiRequest(`/v1/products/farmer/${encodeURIComponent(farmerId)}`, {
      requireAuth: false,
    });
    return data.data ?? [];
  } catch (err) {
    console.warn("[Products] Backend API unavailable, using Firebase Firestore:", err.message);
    return getFarmerProducts(farmerId);
  }
}

const MUTABLE_PRODUCT_FIELDS = [
  "name", "description", "category", "price", "originalPrice", "stock", "unit", "images",
  "available", "durationHours", "sellingMode", "expectedAvailableDate",
  "preOrderDeadline", "preOrderLimit", "preorderPolicy", "preparationLeadHours",
];

export function productPayload(form) {
  // UI forms contain farmerId/id and read-only metadata. The server derives
  // the seller identity from the authenticated Firebase token.
  return Object.fromEntries(MUTABLE_PRODUCT_FIELDS
    .filter((key) => form[key] !== undefined)
    .map((key) => {
      if (["price", "originalPrice", "stock", "durationHours", "preparationLeadHours", "preOrderLimit"].includes(key)
        && form[key] !== "" && form[key] !== null) {
        return [key, Number(form[key])];
      }
      return [key, form[key]];
    }));
}

export async function apiCreateProduct(productData) {
  const data = await apiRequest("/v1/products", {
    method: "POST",
    body: JSON.stringify(productPayload(productData)),
  });
  pageCache.invalidate("marketplaceProducts");
  invalidateMarketplaceCatalog();
  pageCache.invalidate("homeProducts");
  return data.data ?? null;
}

export async function apiUpdateProduct(id, productData) {
  const data = await apiRequest(`/v1/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(productPayload(productData)),
  });
  pageCache.invalidate("marketplaceProducts");
  invalidateMarketplaceCatalog();
  pageCache.invalidate("homeProducts");
  pageCache.invalidate(`product:${id}`);
  return data.data ?? null;
}

export async function apiDeleteProduct(id) {
  const data = await apiRequest(`/v1/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  pageCache.invalidate("marketplaceProducts");
  invalidateMarketplaceCatalog();
  pageCache.invalidate("homeProducts");
  pageCache.invalidate(`product:${id}`);
  return data.data ?? null;
}

export async function apiToggleProductAvailability(id) {
  const data = await apiRequest(`/v1/products/${encodeURIComponent(id)}/availability`, {
    method: "PATCH",
  });
  invalidateMarketplaceCatalog();
  return data.data ?? null;
}

export async function apiUpdateProductStock(id, stock) {
  const data = await apiRequest(`/v1/products/${encodeURIComponent(id)}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ stock }),
  });
  invalidateMarketplaceCatalog();
  return data.data ?? null;
}

export async function apiMarkProductAsAvailable(id) {
  const data = await apiRequest(`/v1/products/${encodeURIComponent(id)}/mark-available`, {
    method: "PATCH",
  });
  invalidateMarketplaceCatalog();
  return data.data ?? null;
}
