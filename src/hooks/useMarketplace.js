import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { apiGetMarketplaceProducts } from "../services/product.service";
import useUserLocation from "./useUserLocation";
import { getDistanceKm } from "../utils/distance";
import { isProductExpired } from "../utils/productExpiration";
import { isProductBuyable } from "../utils/productStatus";
import * as pageCache from "../utils/pageCache";

const PRODUCTS_PER_PAGE = 12;
const BACKEND_PAGE_SIZE = 24;
const CACHE_KEY = "marketplaceProducts";
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const DISCOVERY_NEARBY_RADIUS_KM = 5;
const DISCOVERY_SECTION_SIZE = 4;
const DISCOVERY_RECOMMENDED_SIZE = 6;

/**
 * Compute a relevance score for a product.
 * Relevance = rating (0-40) + distance (0-30) + freshness (0-30).
 */
function scoreRelevance(product, now) {
  const rating = Number(product.productRating ?? 0);

  const createdAt =
    product.createdAt?.toDate?.()?.getTime?.() ??
    (product.createdAt?.seconds ?? 0) * 1000;

  const ageDays = Math.max(0, (now - createdAt) / (1000 * 60 * 60 * 24));

  const ratingScore = Math.min(rating / 5, 1) * 40;

  const distanceScore =
    product.distance != null
      ? Math.max(0, 1 - product.distance / 20) * 30
      : 0;

  const freshnessScore = Math.max(0, 1 - ageDays / 30) * 30;

  return ratingScore + distanceScore + freshnessScore;
}

const DEFAULT_FILTERS = {
  search: "",
  category: "All",
  distance: 10,
  minPrice: 0,
  maxPrice: 0,
  rating: 0,
  sort: "relevant",
  showUnavailable: false,
  sellingMode: "all",
};

/**
 * Apply client-side filters (search, distance, price, rating, availability)
 * to a product list.  These filters require runtime data the backend does
 * not have (user location, instant-search UX, cross-field price/range).
 */
function applyClientFilters(products, filters, userLocation) {
  let data = [...products];

  if (filters.search.trim()) {
    const keyword = filters.search.trim().toLowerCase();
    data = data.filter(
      (product) =>
        product.name?.toLowerCase().includes(keyword) ||
        product.category?.toLowerCase().includes(keyword) ||
        product.farmer?.fullname?.toLowerCase().includes(keyword) ||
        product.farmer?.username?.toLowerCase().includes(keyword) ||
        product.farmer?.storeName?.toLowerCase().includes(keyword),
    );
  }

  data = data.filter((product) => {
    if (isProductExpired(product)) return false;

    if (!filters.showUnavailable && !isProductBuyable(product)) return false;

    const price = Number(product.price ?? 0);
    const rating = Number(product.productRating ?? 0);
    const matchesMinPrice = filters.minPrice > 0 ? price >= filters.minPrice : true;
    const matchesMaxPrice = filters.maxPrice > 0 ? price <= filters.maxPrice : true;
    const matchesDistance =
      !userLocation ||
      product.distance == null ||
      product.distance <= filters.distance;
    const matchesRating = rating >= filters.rating;

    return matchesMinPrice && matchesMaxPrice && matchesDistance && matchesRating;
  });

  return data;
}

export default function useMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: userLocation } = useUserLocation();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState(() => pageCache.get(CACHE_KEY) ?? []);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const cursorRef = useRef(null);
  const loadingMoreRef = useRef(false);

  // Auto-tick every second so expired listings disappear immediately without refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") ?? DEFAULT_FILTERS.search,
      category: searchParams.get("category") ?? DEFAULT_FILTERS.category,
      distance: Number(
        searchParams.get("distance") ??
          localStorage.getItem("agri_consumer_distance") ??
          DEFAULT_FILTERS.distance,
      ),
      minPrice: Number(
        searchParams.get("minPrice") ?? DEFAULT_FILTERS.minPrice,
      ),
      maxPrice: Number(
        searchParams.get("maxPrice") ?? DEFAULT_FILTERS.maxPrice,
      ),
      rating: Number(searchParams.get("rating") ?? DEFAULT_FILTERS.rating),
      sort: searchParams.get("sort") ?? DEFAULT_FILTERS.sort,
      showUnavailable: searchParams.get("showUnavailable") === "true",
      sellingMode: searchParams.get("sellingMode") ?? DEFAULT_FILTERS.sellingMode,
    }),
    [searchParams],
  );

  // Build the backend filter key.  This is a stable string that changes
  // only when the server-relevant filters change.  It is used to detect
  // when a full reset is needed versus when we can keep the current data.
  const backendFilterKey = useMemo(
    () => `${filters.category}|${filters.sellingMode}|${filters.showUnavailable}`,
    [filters.category, filters.sellingMode, filters.showUnavailable],
  );
  const prevBackendFilterKeyRef = useRef(backendFilterKey);

  const loadProducts = useCallback(async ({ reset = false } = {}) => {
    try {
      setError(null);

      if (reset) {
        setLoading(true);
        cursorRef.current = null;
      } else {
        if (loadingMoreRef.current) return;
        setLoadingMore(true);
        loadingMoreRef.current = true;
      }

      // Build backend-supported filter params.
      const apiFilters = {};
      if (filters.category && filters.category !== "All") {
        apiFilters.category = filters.category;
      }
      if (filters.sellingMode && filters.sellingMode !== "all") {
        apiFilters.sellingMode = filters.sellingMode;
      }
      if (!filters.showUnavailable) {
        apiFilters.available = true;
      }

      if (reset) {
        // Reset: fetch fresh data from the beginning.  Keep fetching
        // backend pages until we have enough client-side-filtered
        // products to fill one UI page, or the backend is exhausted.
        let allProducts = [];
        let cursor = null;
        let backendHasMore = true;
        let fetchCount = 0;
        const maxFetches = 5; // safety limit to avoid unbounded loops

        while (fetchCount < maxFetches) {
          const result = await apiGetMarketplaceProducts({
            limit: BACKEND_PAGE_SIZE,
            cursor,
            ...apiFilters,
          });

          allProducts = [...allProducts, ...result.products];
          cursor = result.cursor;
          backendHasMore = result.hasMore;
          fetchCount++;

          // After applying client-side filters, check if we have
          // enough products to fill one UI page.
          const withDistance = allProducts.map((product) => {
            const lat = product.farmer?.location?.lat;
            const lng = product.farmer?.location?.lng;
            if (!userLocation || lat == null || lng == null) {
              return { ...product, distance: null };
            }
            return {
              ...product,
              distance: getDistanceKm(userLocation.lat, userLocation.lng, lat, lng),
            };
          });
          const filtered = applyClientFilters(withDistance, filters, userLocation);
          if (filtered.length >= PRODUCTS_PER_PAGE || !backendHasMore) break;
        }

        // Compute distances for the final set.
        const final = allProducts.map((product) => {
          const lat = product.farmer?.location?.lat;
          const lng = product.farmer?.location?.lng;
          if (!userLocation || lat == null || lng == null) {
            return { ...product, distance: null };
          }
          return {
            ...product,
            distance: getDistanceKm(userLocation.lat, userLocation.lng, lat, lng),
          };
        });

        setProducts(final);
        cursorRef.current = cursor;
        setHasMore(backendHasMore);
        pageCache.set(CACHE_KEY, final, CACHE_TTL);
      } else {
        // Append: fetch the next backend page and add new products.
        const result = await apiGetMarketplaceProducts({
          limit: BACKEND_PAGE_SIZE,
          cursor: cursorRef.current,
          ...apiFilters,
        });

        if (result.products.length > 0) {
          setProducts((current) => {
            const existingIds = new Set(current.map((p) => p.id));
            const newProducts = result.products.filter((p) => !existingIds.has(p.id));
            return newProducts.length > 0 ? [...current, ...newProducts] : current;
          });
        }

        cursorRef.current = result.cursor;
        setHasMore(result.hasMore && result.products.length > 0);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [filters, userLocation]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.category !== DEFAULT_FILTERS.category ||
    filters.minPrice > 0 ||
    filters.maxPrice > 0 ||
    filters.rating > 0 ||
    filters.showUnavailable ||
    filters.sellingMode !== "all";

  // Re-fetch when ANY filter changes.  Both server-side filters
  // (category, sellingMode, showUnavailable) and client-side filters
  // (search, distance, price, rating) trigger a full reset because
  // client-side filtering can exclude products from backend pages,
  // producing incomplete results if we only append.
  useEffect(() => {
    prevBackendFilterKeyRef.current = backendFilterKey;

    loadProducts({ reset: true });
  }, [loadProducts, backendFilterKey]);

  const marketplaceProducts = useMemo(
    () =>
      products.map((product) => {
        const lat = product.farmer?.location?.lat;
        const lng = product.farmer?.location?.lng;

        if (!userLocation || lat == null || lng == null) {
          return { ...product, distance: null };
        }

        return {
          ...product,
          distance: getDistanceKm(userLocation.lat, userLocation.lng, lat, lng),
        };
      }),
    [products, userLocation],
  );

  const filteredProducts = useMemo(() => {
    let data = applyClientFilters(marketplaceProducts, filters, userLocation);

    switch (filters.sort) {
      case "price-low":
        data.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        data.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        data.sort((a, b) => (b.productRating ?? 0) - (a.productRating ?? 0));
        break;
      case "relevant":
        data = data
          .map((product) => ({
            ...product,
            relevanceScore: scoreRelevance(product, now),
          }))
          .sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      default:
        data.sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
        );
    }

    return data;
  }, [marketplaceProducts, filters, userLocation, now]);

  // ── Discovery sections ─────────────────────────────────────────
  // These are computed from marketplaceProducts (unfiltered) and are
  // only displayed when no search/filter is active.

  const nearbyProducts = useMemo(() => {
    if (!userLocation) return [];

    return marketplaceProducts
      .filter((product) => {
        const distance = Number(product.distance);
        const stock = Number(product.stock ?? 0);
        return (
          Number.isFinite(distance) &&
          distance <= DISCOVERY_NEARBY_RADIUS_KM &&
          product.available !== false &&
          stock > 0
        );
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, DISCOVERY_SECTION_SIZE);
  }, [marketplaceProducts, userLocation]);

  const recentProducts = useMemo(() => {
    return [...marketplaceProducts]
      .filter((product) => product?.createdAt)
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      .slice(0, DISCOVERY_SECTION_SIZE);
  }, [marketplaceProducts]);

  const relevantProducts = useMemo(() => {
    return [...marketplaceProducts]
      .map((product) => ({
        ...product,
        relevanceScore: scoreRelevance(product, now),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, DISCOVERY_RECOMMENDED_SIZE);
  }, [marketplaceProducts, now]);

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams);
    const defaultValue = DEFAULT_FILTERS[key];

    if (key === "distance") {
      localStorage.setItem("agri_consumer_distance", String(value));
    }

    if (key === "search") {
      value ? params.set(key, value) : params.delete(key);
    } else if (key === "showUnavailable") {
      value ? params.set(key, "true") : params.delete(key);
    } else if (key === "sellingMode") {
      value && value !== "all" ? params.set(key, value) : params.delete(key);
    } else if (key === "rating" || key === "minPrice" || key === "maxPrice") {
      Number(value) > 0 ? params.set(key, value) : params.delete(key);
    } else if (value !== defaultValue && Number(value) !== defaultValue) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");
    setSearchParams(params);
  }

  return {
    loading,
    loadingMore,
    error,
    products: marketplaceProducts,
    filteredProducts,
    totalProducts: filteredProducts.length,
    filters,
    hasActiveFilters,
    updateFilter,
    resetFilters: () => {
      localStorage.removeItem("agri_consumer_distance");
      setSearchParams({});
    },
    userLocation,
    showFilters,
    setShowFilters,
    hasMore,
    loadMore: () => loadProducts(),
    reloadProducts: () => loadProducts({ reset: true }),

    // Discovery sections (for default/discovery state)
    nearbyProducts,
    recentProducts,
    relevantProducts,
  };
}
