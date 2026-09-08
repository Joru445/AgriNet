import { useCallback, useEffect, useMemo, useState } from "react";

import {
  apiGetAdminProducts,
  apiGetAdminProduct,
  apiSetProductAvailability,
} from "../services/admin.service";

export default function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sellingMode, setSellingMode] = useState("");
  const [available, setAvailable] = useState("");
  const [reported, setReported] = useState("");
  const [farmerId, setFarmerId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiGetAdminProducts({
        page,
        limit: 24,
        search,
        category,
        sellingMode,
        available,
        reported,
        farmerId,
        sortBy,
        sortOrder,
      });

      setProducts(result.products);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load admin products:", err);
      setError(err?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sellingMode, available, reported, farmerId, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [search, category, sellingMode, available, reported, farmerId, sortBy, sortOrder]);

  const toggleAvailability = useCallback(async (productId, newAvailable) => {
    setActionLoading(true);
    setActionError(null);

    try {
      const result = await apiSetProductAvailability(productId, newAvailable);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, available: result.available } : p,
        ),
      );

      return result;
    } catch (err) {
      console.error("Failed to toggle product availability:", err);
      setActionError(err?.message || "Failed to update product.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const getProduct = useCallback(async (productId) => {
    try {
      const product = await apiGetAdminProduct(productId);
      return product;
    } catch (err) {
      console.error("Failed to load product:", err);
      throw err;
    }
  }, []);

  const stats = useMemo(() => {
    const total = pagination.total;
    const availableCount = products.filter((p) => p.available).length;
    const unavailableCount = products.filter((p) => !p.available).length;
    const preorderCount = products.filter((p) => p.sellingMode === "preorder").length;
    const reportedCount = products.filter((p) => p.totalReports > 0).length;

    return {
      total,
      available: availableCount,
      unavailable: unavailableCount,
      preorder: preorderCount,
      reported: reportedCount,
    };
  }, [products, pagination.total]);

  return {
    products,
    pagination,
    loading,
    error,
    actionLoading,
    actionError,

    search,
    setSearch,
    category,
    setCategory,
    sellingMode,
    setSellingMode,
    available,
    setAvailable,
    reported,
    setReported,
    farmerId,
    setFarmerId,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,

    stats,

    fetchProducts,
    toggleAvailability,
    getProduct,
  };
}
