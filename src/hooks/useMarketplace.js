import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getMarketplaceProductsPage } from "../services/product.service";
import useUserLocation from "./useUserLocation";
import { getDistanceKm } from "../utils/distance";
import { isProductExpired } from "../utils/productExpiration";
import { showToast } from "../utils/toast";
import * as pageCache from "../utils/pageCache";

const PRODUCTS_PER_PAGE = 12;
const CACHE_KEY = "marketplaceProducts";
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const DEFAULT_FILTERS = {
  search: "",
  category: "All",
  distance: 10,
  minPrice: 0,
  maxPrice: 0,
  rating: 0,
  sort: "relevant",
  showUnavailable: false,
};

export default function useMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: userLocation } = useUserLocation();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState(() => pageCache.get(CACHE_KEY) ?? []);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const cursorRef = useRef(null);

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
    }),
    [searchParams],
  );

  const page = Number(searchParams.get("page") ?? 1);

  const loadingMoreRef = useRef(false);

  const loadProducts = useCallback(async ({ reset = false, useCache = true } = {}) => {
    try {
      if (reset) {
        const cached = useCache ? pageCache.get(CACHE_KEY) : null;
        if (cached) {
          setProducts(cached);
          setLoading(false);
          return;
        }
        setLoading(true);
        cursorRef.current = null;
      } else {
        // Guard: don't fetch if already loading more
        if (loadingMoreRef.current) return;
        setLoadingMore(true);
        loadingMoreRef.current = true;
      }

      const result = await getMarketplaceProductsPage({
        cursor: reset ? null : cursorRef.current,
      });

      if (reset) {
        setProducts(result.products);
      } else if (result.products.length > 0) {
        // Deduplicate by product ID before appending
        setProducts((current) => {
          const existingIds = new Set(current.map((p) => p.id));
          const newProducts = result.products.filter((p) => !existingIds.has(p.id));
          return newProducts.length > 0 ? [...current, ...newProducts] : current;
        });
      }

      cursorRef.current = result.cursor;
      setHasMore(result.hasMore && result.products.length > 0);

      if (reset) {
        pageCache.set(CACHE_KEY, result.products, CACHE_TTL);
      }
    } catch (error) {
      console.error(error);
      showToast.error("Failed to load marketplace.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, []);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.category !== DEFAULT_FILTERS.category ||
    filters.minPrice > 0 ||
    filters.maxPrice > 0 ||
    filters.rating > 0 ||
    filters.showUnavailable;

  useEffect(() => {
    loadProducts({ reset: true });
  }, [loadProducts]);

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
    let data = [...marketplaceProducts];

    if (filters.search.trim()) {
      const keyword = filters.search.trim().toLowerCase();
      data = data.filter(
        (product) =>
          product.name?.toLowerCase().includes(keyword) ||
          product.category?.toLowerCase().includes(keyword) ||
          product.farmer?.fullname?.toLowerCase().includes(keyword) ||
          product.farmer?.username?.toLowerCase().includes(keyword) ||
          product.farmer?.farmName?.toLowerCase().includes(keyword),
      );
    }

    if (filters.category && filters.category !== "All") {
      data = data.filter(
        (product) =>
          product.category?.toLowerCase() === filters.category.toLowerCase(),
      );
    }

    data = data.filter((product) => {
      const stockNum = Number(product.stock ?? 0);
      const isExpired = isProductExpired(product);
      
      // Expired items are automatically deleted/vanished from marketplace
      if (isExpired) {
        return false;
      }

      const isAvailable = product.available !== false && stockNum > 0;

      if (!filters.showUnavailable && !isAvailable) {
        return false;
      }

      const price = Number(product.price ?? 0);
      const rating = Number(product.productRating ?? 0);
      const matchesMinPrice =
        filters.minPrice > 0 ? price >= filters.minPrice : true;
      const matchesMaxPrice =
        filters.maxPrice > 0 ? price <= filters.maxPrice : true;
      const matchesDistance =
        !userLocation ||
        product.distance == null ||
        product.distance <= filters.distance;
      const matchesRating = rating >= filters.rating;

      return (
        matchesMinPrice && matchesMaxPrice && matchesDistance && matchesRating
      );
    });

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
        /*
         * Relevance = rating (0-40) + distance (0-30) + freshness (0-30).
         * Mirrors the home page's relevant products model.
         */
        data = data
          .map((product) => {
            const rating = Number(product.productRating ?? 0);

            const createdAt =
              product.createdAt?.toDate?.()?.getTime?.() ??
              (product.createdAt?.seconds ?? 0) * 1000;

            const ageDays = Math.max(
              0,
              (now - createdAt) / (1000 * 60 * 60 * 24),
            );

            const ratingScore = Math.min(rating / 5, 1) * 40;

            const distanceScore =
              product.distance != null
                ? Math.max(0, 1 - product.distance / 20) * 30
                : 0;

            const freshnessScore = Math.max(0, 1 - ageDays / 30) * 30;

            return {
              ...product,
              relevanceScore: ratingScore + distanceScore + freshnessScore,
            };
          })
          .sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      default:
        data.sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
        );
    }

    return data;
  }, [marketplaceProducts, filters, userLocation, now]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, page]);

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

  function setPage(nextPage) {
    const params = new URLSearchParams(searchParams);
    nextPage <= 1 ? params.delete("page") : params.set("page", nextPage);
    setSearchParams(params);
  }

  return {
    loading,
    loadingMore,
    products: marketplaceProducts,
    filteredProducts: paginatedProducts,
    totalProducts: filteredProducts.length,
    filters,
    hasActiveFilters,
    updateFilter,
    resetFilters: () => {
      localStorage.removeItem("agri_consumer_distance");
      setSearchParams({});
    },
    page,
    setPage,
    totalPages,
    userLocation,
    showFilters,
    setShowFilters,
    hasMore,
    loadMore: () => loadProducts(),
    reloadProducts: () => loadProducts({ reset: true, useCache: false }),
  };
}
