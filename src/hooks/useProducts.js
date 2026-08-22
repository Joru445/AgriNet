import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  getFarmerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service";
import { uploadProductImage } from "../services/cloudinary.service";

import { showToast } from "../utils/toast";

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

  const loadProducts = useCallback(async () => {
    if (!profile?.uid) return;

    try {
      setLoading(true);

      const data = await getFarmerProducts(profile.uid);

      setProducts(data);
    } catch (error) {
      console.error(error);
      showToast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [profile?.uid]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

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

      await createProduct({
        ...form,
        farmerId: profile.uid,
        images: uploadedImages,
      });

      showToast.success("Product created.");

      await loadProducts();
      closeModal();
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(form) {
    try {
      setSaving(true);

      const uploadedImages = await uploadImages(form.images);

      await updateProduct(form.id, {
        ...form,
        images: uploadedImages,
      });

      showToast.success("Product updated.");

      await loadProducts();
      closeModal();
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingProduct) return;

    try {
      await deleteProduct(editingProduct.id);

      setProducts((prev) => prev.filter((p) => p.id !== editingProduct.id));

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
