import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGetMarketplaceProducts } from "../services/product.service";

import useUserLocation from "./useUserLocation";

import { getDistanceKm } from "../utils/distance";
import { isProductExpired } from "../utils/productExpiration";
import { getProductAvailability } from "../utils/productStatus";

import * as pageCache from "../utils/pageCache";

import {
  loadPublicMarketplaceCache,
  savePublicMarketplaceCache,
} from "../utils/publicMarketplaceCache";

const PAGE_SIZE = 24;
// The memory cache matches the persisted public-listing retention window. A
// catalog entry is not revalidated merely because the former two-minute TTL
// elapsed; normal eviction still bounds storage and a true cache miss loads.
const CACHE_TTL = 24 * 60 * 60 * 1000;
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
  group: "",
};

const catalogKey = (filters) => `marketplaceCatalog:${JSON.stringify(filters)}`;

function decorateDistance(items, location) {
  return items.map((product) => {
    const { lat, lng } = product.farmer?.location || {};
    return !location || lat == null || lng == null
      ? { ...product, distance: null }
      : {
          ...product,
          distance: getDistanceKm(location.lat, location.lng, lat, lng),
        };
  });
}

// API order is never changed on the client: this only applies runtime-only filters.
function filterRuntime(items, filters, location) {
  const search = filters.search.trim().toLowerCase();
  return items.filter((product) => {
    if (
      search &&
      ![
        product.name,
        product.category,
        product.farmer?.fullname,
        product.farmer?.username,
        product.farmer?.storeName,
      ].some((part) =>
        String(part || "")
          .toLowerCase()
          .includes(search),
      )
    )
      return false;
    if (isProductExpired(product) && !filters.showUnavailable) return false;
    if (!filters.showUnavailable && !getProductAvailability(product).allowed)
      return false;
    const price = Number(product.price || 0);
    if (
      (filters.minPrice && price < filters.minPrice) ||
      (filters.maxPrice && price > filters.maxPrice)
    )
      return false;
    if (Number(product.productRating || 0) < filters.rating) return false;
    return !(
      location &&
      product.distance != null &&
      product.distance > filters.distance
    );
  });
}

export default function useMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: userLocation } = useUserLocation();
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [columns, setColumns] = useState(2);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const cursorRef = useRef(null);
  const inFlightRef = useRef(false);
  const requestIdRef = useRef(0);
  const requestControllerRef = useRef(null);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || DEFAULT_FILTERS.search,
      category: searchParams.get("category") || DEFAULT_FILTERS.category,
      distance: Number(
        searchParams.get("distance") ||
          localStorage.getItem("agri_consumer_distance") ||
          DEFAULT_FILTERS.distance,
      ),
      minPrice: Number(searchParams.get("minPrice") || 0),
      maxPrice: Number(searchParams.get("maxPrice") || 0),
      rating: Number(searchParams.get("rating") || 0),
      sort: searchParams.get("sort") || DEFAULT_FILTERS.sort,
      showUnavailable: searchParams.get("showUnavailable") === "true",
      sellingMode:
        searchParams.get("sellingMode") || DEFAULT_FILTERS.sellingMode,
      group: searchParams.get("group") || DEFAULT_FILTERS.group,
    }),
    [searchParams],
  );
  const queryKey = useMemo(() => JSON.stringify(filters), [filters]);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // A wider grid can reveal more already-buffered cards immediately. It does
  // not reset pagination or discard cards when the available width changes.
  useEffect(() => {
    if (!fetchedProducts.length) return;
    setVisibleCount((current) =>
      Math.max(current, Math.min(columns, fetchedProducts.length)),
    );
  }, [columns, fetchedProducts.length]);

  const requestPage = useCallback(
    async ({ reset = false, background = false } = {}) => {
      if ((inFlightRef.current && !reset) || (!reset && !hasMore)) return false;
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        if (!fetchedProducts.length)
          setError(
            new Error("Offline: saved marketplace data is unavailable."),
          );
        setLoading(false);
        return false;
      }
      // A manual refresh or query reset supersedes a pending pagination fetch.
      // The request ID also protects state when an API/fallback cannot abort.
      if (reset) requestControllerRef.current?.abort();
      const requestId = ++requestIdRef.current;
      const controller = new AbortController();
      requestControllerRef.current = controller;
      inFlightRef.current = true;
      if (reset) {
        if (!background) setLoading(true);
        setError(null);
        cursorRef.current = null;
      } else setLoadingMore(true);
      try {
        const active = filtersRef.current;
        const result = await apiGetMarketplaceProducts({
          limit: PAGE_SIZE,
          cursor: reset ? undefined : cursorRef.current,
          category: active.category !== "All" ? active.category : undefined,
          available: active.showUnavailable ? undefined : true,
          sellingMode:
            active.sellingMode !== "all" ? active.sellingMode : undefined,
          groupId: active.group || undefined,
          sort: active.sort,
          signal: controller.signal,
        });
        if (requestId !== requestIdRef.current) return false;
        setFetchedProducts((current) => {
          const merged = reset
            ? result.products
            : [...current, ...result.products];
          return Array.from(
            new Map(merged.map((item) => [item.id, item])).values(),
          );
        });
        cursorRef.current = result.cursor || null;
        setHasMore(Boolean(result.hasMore && result.cursor));
        if (reset)
          setVisibleCount(Math.min(columnsRef.current, result.products.length));
        return true;
      } catch (requestError) {
        if (requestId === requestIdRef.current && requestError?.name !== "AbortError") {
          setError(requestError);
        }
        return false;
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          inFlightRef.current = false;
          requestControllerRef.current = null;
        }
      }
    },
    [fetchedProducts.length, hasMore],
  );

  useEffect(() => {
    // Ignore an old query response when this effect restores a new cached
    // query. A restored cache deliberately does not revalidate in background.
    requestControllerRef.current?.abort();
    requestIdRef.current += 1;
    const cacheKey = catalogKey(filters);
    const cached = pageCache.get(cacheKey);
    const publicCached = cached ? null : loadPublicMarketplaceCache(cacheKey);
    const restored =
      cached ||
      (publicCached
        ? {
            products: publicCached.products,
            cursor: publicCached.cursor || null,
            hasMore: Boolean(publicCached.hasMore && publicCached.cursor),
          }
        : null);
    if (restored) {
      cursorRef.current = restored.cursor;
      setFetchedProducts(restored.products);
      setHasMore(restored.hasMore);
      setVisibleCount(Math.min(columnsRef.current, restored.products.length));
      setError(null);
      setLoading(false);
    } else {
      setFetchedProducts([]);
      setVisibleCount(0);
      requestPage({ reset: true });
    }
    // The serialized query intentionally restores or starts pagination for
    // every filter/sort change. Cached entries are intentionally not stale-
    // revalidated; pull-to-refresh is the explicit freshness control.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  useEffect(() => {
    // Cache empty result sets too: an already-loaded empty query is still a
    // usable result and should not repeatedly fetch on remount.
    if (loading || error) return;
    pageCache.set(
      catalogKey(filters),
      { products: fetchedProducts, cursor: cursorRef.current, hasMore },
      CACHE_TTL,
    );
    savePublicMarketplaceCache(fetchedProducts, catalogKey(filters), {
      cursor: cursorRef.current,
      hasMore,
    });
  }, [error, fetchedProducts, filters, hasMore, loading]);

  const products = useMemo(
    () => decorateDistance(fetchedProducts, userLocation),
    [fetchedProducts, userLocation],
  );
  const filteredProducts = useMemo(
    () => filterRuntime(products, filters, userLocation),
    [products, filters, userLocation],
  );
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );

  const revealNextRow = useCallback(async () => {
    const remaining = filteredProducts.length - visibleCount;
    if (remaining >= columnsRef.current) {
      setVisibleCount((count) =>
        Math.min(filteredProducts.length, count + columnsRef.current),
      );
      return true;
    }
    if (!hasMore) {
      if (remaining > 0) setVisibleCount((count) => count + remaining);
      return false;
    }
    return requestPage();
  }, [filteredProducts.length, hasMore, requestPage, visibleCount]);

  const updateFilter = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);
      if (key === "distance")
        localStorage.setItem("agri_consumer_distance", String(value));
      if (key === "showUnavailable")
        value ? params.set(key, "true") : params.delete(key);
      else if (key === "search" || key === "group")
        value ? params.set(key, value) : params.delete(key);
      else if (
        value === DEFAULT_FILTERS[key] ||
        Number(value) === DEFAULT_FILTERS[key]
      )
        params.delete(key);
      else params.set(key, value);
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.category !== "All" ||
    filters.minPrice > 0 ||
    filters.maxPrice > 0 ||
    filters.rating > 0 ||
    filters.showUnavailable ||
    filters.sellingMode !== "all" ||
    filters.group !== "" ||
    filters.distance !== DEFAULT_FILTERS.distance;
  const refreshProducts = useCallback(async () => {
    if (refreshing) return false;
    setRefreshing(true);
    try {
      return await requestPage({ reset: true, background: true });
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, requestPage]);
  return {
    loading,
    loadingMore,
    refreshing,
    error,
    filters,
    products,
    filteredProducts,
    visibleProducts,
    totalProducts: filteredProducts.length,
    hasMore,
    showFilters,
    setShowFilters,
    updateFilter,
    hasActiveFilters,
    setColumns: (count) => setColumns(Math.max(2, Number(count) || 2)),
    revealNextRow,
    reloadProducts: () => requestPage({ reset: true }),
    refreshProducts,
    resetFilters: () => {
      localStorage.removeItem("agri_consumer_distance");
      setSearchParams({});
    },
  };
}
