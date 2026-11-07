import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  apiGetFarmerProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
} from "../services/product.service";
import { uploadProductImage } from "../services/cloudinary.service";

import { showToast } from "../utils/toast";
import { accountCacheKey, getAccountCache, setAccountCache, invalidateAccountCache } from "../utils/accountQueryCache";
import * as pageCache from "../utils/pageCache";

export default function useProducts() {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState([]);

  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = useCallback(async (isInitial = false) => {
    if (!profile?.uid) return;

    try {
      if (isInitial) {
        setLoading(true);
      }

      const cacheKey = accountCacheKey(profile.uid, "farmer-products");
      const cached = !isInitial ? null : getAccountCache(cacheKey, 5 * 60 * 1000);
      if (cached) {
        setProducts(cached);
        return;
      }
      const data = await apiGetFarmerProducts(profile.uid);

      setProducts(data);
      setAccountCache(cacheKey, data);
    } catch (error) {
      console.error(error);
      showToast.error("Failed to load products.");
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [profile?.uid]);

  useEffect(() => {
    loadProducts(true);
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term);

      const matchesCategory =
        category === "all" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  function openCreate() {
    setEditingProduct(null);
    setShowModal(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setShowModal(true);
  }

  function openDelete(product) {
    setEditingProduct(product);
    setShowDelete(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingProduct(null);
  }

  function closeDelete() {
    setShowDelete(false);
    setEditingProduct(null);
  }

  async function uploadImages(images = []) {
    return Promise.all(
      images.map(async (image) => {
        // Existing Cloudinary image
        if (image.url) {
          return image;
        }

        // New image wrapper from ProductImageUploader
        if (image.file instanceof File) {
          return uploadProductImage(image.file);
        }

        throw new Error("Invalid image format.");
      }),
    );
  }

  async function handleCreate(form) {
    try {
      setSaving(true);

      const uploadedImages = await uploadImages(form.images);

      await apiCreateProduct({
        ...form,
        farmerId: profile.uid,
        images: uploadedImages,
      });

      showToast.success("Product created.");
      invalidateAccountCache(accountCacheKey(profile.uid, "farmer-products"));
      if (profile?.uid) {
        pageCache.invalidate(`farmerDashboard:${profile.uid}`);
        pageCache.invalidatePrefix(`farmerProductAnalytics:${profile.uid}`);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("agrinet:farmer-products-updated", {
            detail: { uid: profile.uid, action: "create" },
          })
        );
        try {
          localStorage.setItem("agrinet_farmer_products_sync", Date.now().toString());
        } catch {}
      }

      closeModal();
      await loadProducts(false);
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(form) {
    try {
      setSaving(true);

      const uploadedImages = await uploadImages(form.images);

      await apiUpdateProduct(form.id, {
        ...form,
        farmerId: profile.uid,
        images: uploadedImages,
      });

      showToast.success("Product updated.");
      invalidateAccountCache(accountCacheKey(profile.uid, "farmer-products"));
      if (profile?.uid) {
        pageCache.invalidate(`farmerDashboard:${profile.uid}`);
        pageCache.invalidatePrefix(`farmerProductAnalytics:${profile.uid}`);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("agrinet:farmer-products-updated", {
            detail: { uid: profile.uid, action: "update", productId: form.id },
          })
        );
        try {
          localStorage.setItem("agrinet_farmer_products_sync", Date.now().toString());
        } catch {}
      }

      closeModal();
      await loadProducts(false);
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingProduct) return;

    try {
      await apiDeleteProduct(editingProduct.id);

      setProducts((prev) => prev.filter((p) => p.id !== editingProduct.id));
      invalidateAccountCache(accountCacheKey(profile.uid, "farmer-products"));
      if (profile?.uid) {
        pageCache.invalidate(`farmerDashboard:${profile.uid}`);
        pageCache.invalidatePrefix(`farmerProductAnalytics:${profile.uid}`);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("agrinet:farmer-products-updated", {
            detail: { uid: profile.uid, action: "delete", productId: editingProduct.id },
          })
        );
        try {
          localStorage.setItem("agrinet_farmer_products_sync", Date.now().toString());
        } catch {}
      }

      showToast.success("Product deleted.");

      closeDelete();
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    }
  }

  return {
    loading,
    saving,

    products,
    filteredProducts,

    view,
    setView,

    search,
    setSearch,

    category,
    setCategory,

    showModal,
    showDelete,

    editingProduct,

    openCreate,
    openEdit,
    openDelete,
    closeModal,
    closeDelete,

    handleCreate,
    handleUpdate,
    handleDelete,

    reloadProducts: loadProducts,
  };
}
