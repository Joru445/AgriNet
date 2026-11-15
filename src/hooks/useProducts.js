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
import {
  clearProductDrafts,
  deleteProductDraft,
  listProductDrafts,
  loadDraftImage,
  pruneProductDrafts,
} from "../utils/persistence/productDraftStore";

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
  const [activeDraftId, setActiveDraftId] = useState(null);

  const [drafts, setDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

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

  const loadDrafts = useCallback(async () => {
    try {
      const stored = await listProductDrafts();
      setDrafts(stored);
      return stored;
    } catch (error) {
      console.warn("[product-draft] Unable to list drafts:", error);
      setDrafts([]);
      return [];
    } finally {
      setLoadingDrafts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(true);
  }, [loadProducts]);

  useEffect(() => {
    let active = true;

    pruneProductDrafts()
      .catch(() => {})
      .finally(() => {
        if (active) loadDrafts();
      });

    const handleDraftsChanged = () => loadDrafts();
    window.addEventListener("agrinet:product-drafts-updated", handleDraftsChanged);
    window.addEventListener("focus", handleDraftsChanged);

    return () => {
      active = false;
      window.removeEventListener("agrinet:product-drafts-updated", handleDraftsChanged);
      window.removeEventListener("focus", handleDraftsChanged);
    };
  }, [loadDrafts]);

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
    setActiveDraftId(null);
    setShowModal(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setActiveDraftId(null);
    setShowModal(true);
  }

  function openDraft(draft) {
    const matchedProduct = draft.productId
      ? products.find((product) => product.id === draft.productId)
        || { id: draft.productId, ...(draft.form || {}) }
      : null;

    setEditingProduct(matchedProduct);
    setActiveDraftId(draft.id);
    setShowModal(true);
  }

  async function deleteDraft(draftId) {
    await deleteProductDraft(draftId);
    if (activeDraftId === draftId) setActiveDraftId(null);
  }

  async function clearDrafts() {
    await clearProductDrafts();
    setActiveDraftId(null);
  }

  function openDelete(product) {
    setEditingProduct(product);
    setShowDelete(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingProduct(null);
    setActiveDraftId(null);
    loadDrafts();
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

        // Image persisted in IndexedDB while the product was a draft
        if (image.kind === "draft" && image.id) {
          const record = await loadDraftImage(image.id);
          if (!record?.blob) {
            throw new Error("A saved image could not be restored. Please add it again.");
          }
          const file = new File(
            [record.blob],
            record.name || "product-image.jpg",
            { type: record.type || record.blob.type || "image/jpeg" },
          );
          return uploadProductImage(file);
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

      if (form.draftId) {
        await deleteProductDraft(form.draftId).catch(() => {});
      }

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
        } catch { /* ignore storage errors */ }
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

      if (form.draftId) {
        await deleteProductDraft(form.draftId).catch(() => {});
      }

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
        } catch { /* ignore storage errors */ }
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
    if (!editingProduct || saving) return;

    setSaving(true);
    try {
      await apiDeleteProduct(editingProduct.id, { uid: profile?.uid });

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
        } catch { /* ignore storage errors */ }
      }

      showToast.success("Product deleted.");

      closeDelete();
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    } finally {
      setSaving(false);
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
    activeDraftId,

    drafts,
    loadingDrafts,

    openCreate,
    openEdit,
    openDraft,
    openDelete,
    deleteDraft,
    clearDrafts,
    closeModal,
    closeDelete,

    handleCreate,
    handleUpdate,
    handleDelete,

    reloadProducts: loadProducts,
    reloadDrafts: loadDrafts,
  };
}
