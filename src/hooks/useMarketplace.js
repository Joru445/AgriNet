import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getMarketplaceProductsPage } from "../services/product.service";
import useUserLocation from "./useUserLocation";
import { getDistanceKm } from "../utils/distance";
import { isProductExpired } from "../utils/productExpiration";
import { showToast } from "../utils/toast";

const PRODUCTS_PER_PAGE = 12;
const DEFAULT_FILTERS = {
  search: "",
  category: "All",
  distance: 10,
  minPrice: 0,
  maxPrice: 0,
  rating: 0,
  sort: "newest",
  showUnavailable: false,
};

export default function useMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: userLocation } = useUserLocation();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const cursorRef = useRef(null);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") ?? DEFAULT_FILTERS.search,
      category: searchParams.get("category") ?? DEFAULT_FILTERS.category,
      distance: Number(
        searchParams.get("distance") ??
          localStorage.getItem("agri_consumer_distance") ??
          DEFAULT_FILTERS.distance,
      ),
      minPrice: Number(searchParams.get("minPrice") ?? DEFAULT_FILTERS.minPrice),
      maxPrice: Number(searchParams.get("maxPrice") ?? DEFAULT_FILTERS.maxPrice),
      rating: Number(searchParams.get("rating") ?? DEFAULT_FILTERS.rating),
      sort: searchParams.get("sort") ?? DEFAULT_FILTERS.sort,
      showUnavailable: searchParams.get("showUnavailable") === "true",
    }),
    [searchParams],
  );

  const page = Number(searchParams.get("page") ?? 1);

  const loadProducts = useCallback(async ({ reset = false } = {}) => {
    try {
      if (reset) {
        setLoading(true);
        cursorRef.current = null;
      } else {
        setLoadingMore(true);
      }

      const result = await getMarketplaceProductsPage({
        cursor: reset ? null : cursorRef.current,
      });

      setProducts((current) =>
        reset ? result.products : [...current, ...result.products],
      );
      cursorRef.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (error) {
      console.error(error);
      showToast.error("Failed to load marketplace.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

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
      const isAvailable = product.available !== false && stockNum > 0 && !isExpired;

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
      default:
        data.sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
        );
    }

    return data;
  }, [marketplaceProducts, filters, userLocation]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
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
    reloadProducts: () => loadProducts({ reset: true }),
  };
}
