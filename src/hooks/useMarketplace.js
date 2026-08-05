import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getMarketplaceProducts } from "../services/product.service";

import useUserLocation from "./useUserLocation";

import { getDistanceKm } from "../utils/distance";
import { showToast } from "../utils/toast";

const PRODUCTS_PER_PAGE = 12;

const DEFAULT_FILTERS = {
  search: "",
  category: "All",

  distance: 1,

  minPrice: 0,
  maxPrice: 500,

  rating: 0,

  sort: "newest",
};

export default function useMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: userLocation } = useUserLocation();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") ?? DEFAULT_FILTERS.search,

      category: searchParams.get("category") ?? DEFAULT_FILTERS.category,

      distance: Number(
        searchParams.get("distance") ?? DEFAULT_FILTERS.distance,
      ),

      minPrice: Number(
        searchParams.get("minPrice") ?? DEFAULT_FILTERS.minPrice,
      ),

      maxPrice: Number(
        searchParams.get("maxPrice") ?? DEFAULT_FILTERS.maxPrice,
      ),

      rating: Number(searchParams.get("rating") ?? DEFAULT_FILTERS.rating),

      sort: searchParams.get("sort") ?? DEFAULT_FILTERS.sort,
    }),
    [searchParams],
  );

  const page = Number(searchParams.get("page") ?? 1);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getMarketplaceProducts();

      setProducts(data);
    } catch (error) {
      console.error(error);
      showToast.error("Failed to load marketplace.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const marketplaceProducts = useMemo(() => {
    return products.map((product) => {
      const lat = product.farmer?.location?.lat;
      const lng = product.farmer?.location?.lng;

      if (!userLocation || lat == null || lng == null) {
        return {
          ...product,
          distance: null,
        };
      }

      return {
        ...product,
        distance: getDistanceKm(userLocation.lat, userLocation.lng, lat, lng),
      };
    });
  }, [products, userLocation]);

  const filteredProducts = useMemo(() => {
    let data = [...marketplaceProducts];

    if (filters.search.trim()) {
      const keyword = filters.search.toLowerCase();

      data = data.filter(
        (product) =>
          product.name?.toLowerCase().includes(keyword) ||
          product.category?.toLowerCase().includes(keyword) ||
          product.farmer?.fullname?.toLowerCase().includes(keyword) ||
          product.farmer?.farmName?.toLowerCase().includes(keyword),
      );
    }

    if (filters.category !== "All") {
      data = data.filter((product) => product.category === filters.category);
    }

    data = data.filter(
      (product) =>
        Number(product.price) >= filters.minPrice &&
        Number(product.price) <= filters.maxPrice,
    );

    if (userLocation) {
      data = data.filter(
        (product) =>
          product.distance != null && product.distance <= filters.distance,
      );
    }

    if (filters.rating > 0) {
      data = data.filter(
        (product) => Number(product.productRating ?? 0) >= filters.rating,
      );
    }

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

    switch (key) {
      case "search":
        value ? params.set("search", value) : params.delete("search");
        break;

      case "category":
        value !== DEFAULT_FILTERS.category
          ? params.set("category", value)
          : params.delete("category");
        break;

      case "distance":
        Number(value) !== DEFAULT_FILTERS.distance
          ? params.set("distance", value)
          : params.delete("distance");
        break;

      case "minPrice":
        Number(value) !== DEFAULT_FILTERS.minPrice
          ? params.set("minPrice", value)
          : params.delete("minPrice");
        break;

      case "maxPrice":
        Number(value) !== DEFAULT_FILTERS.maxPrice
          ? params.set("maxPrice", value)
          : params.delete("maxPrice");
        break;

      case "rating":
        Number(value) > 0
          ? params.set("rating", value)
          : params.delete("rating");
        break;

      case "sort":
        value !== DEFAULT_FILTERS.sort
          ? params.set("sort", value)
          : params.delete("sort");
        break;

      default:
        return;
    }

    params.delete("page");

    setSearchParams(params);
  }

  function setPage(page) {
    const params = new URLSearchParams(searchParams);

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", page);
    }

    setSearchParams(params);
  }

  function resetFilters() {
    setSearchParams({});
  }

  return {
    loading,

    products: marketplaceProducts,
    filteredProducts: paginatedProducts,

    totalProducts: filteredProducts.length,

    filters,
    updateFilter,
    resetFilters,

    page,
    setPage,
    totalPages,

    userLocation,

    showFilters,
    setShowFilters,

    reloadProducts: loadProducts,
  };
}
