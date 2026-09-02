import { useState } from "react";

import { useLanguage } from "../../../context/LanguageContext";
import ProductForm from "./ProductForm";
import ProductImageUploader from "./ProductImageUploader";

export default function ProductModal({
  open,
  product,
  saving,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <ProductModalContent
      key={product?.id ?? "new-product"}
      product={product}
      saving={saving}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function ProductModalContent({ product, saving, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...product,
    images: product?.images ?? [],
  }));

  const isValid = Boolean(
    form.name?.trim() &&
    form.category?.trim() &&
    form.unit?.trim() &&
    form.price !== "" &&
    !isNaN(Number(form.price)) &&
    Number(form.price) > 0 &&
    form.stock !== "" &&
    !isNaN(Number(form.stock)) &&
    Number(form.stock) >= 0 &&
    form.images &&
    form.images.length > 0
  );

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImages(images) {
    setForm((prev) => ({
      ...prev,
      images,
    }));
  }

  function handleSubmit() {
    if (!isValid || saving) return;
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center md:p-5 z-9999">
      <div className="bg-[var(--agri-card)] w-full h-full md:max-w-3xl md:max-h-[90vh] md:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Fixed Header */}
        <div
          className="shrink-0 px-6 py-4 sm:py-5 flex justify-between items-center border-b z-10 md:rounded-t-2xl"
          style={{ backgroundColor: "var(--agri-bg-surface)", borderColor: "var(--agri-border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/15 text-[#2D6A4F] flex items-center justify-center shrink-0">
              <i className={`${product ? "ri-edit-box-line" : "ri-plant-line"} text-2xl text-[#2D6A4F]`} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-(--agri-text)">
                {product ? t("products.editProductTitle") : t("products.addProductTitle")}
              </h2>
              <p className="text-xs text-(--agri-brand) dark:text-(--agri-brand-light)">
                {product ? t("products.updateDetails") : t("products.listNew")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--agri-text-muted)] hover:text-[#1B4332] hover:bg-green-100/60 transition-colors cursor-pointer shrink-0"
          >
            <i className="ri-close-line text-2xl" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ProductImageUploader images={form.images} onChange={handleImages} />
          <ProductForm form={form} onChange={handleChange} />
        </div>

        {/* Fixed Footer */}
        <div
          className="shrink-0 bg-[var(--agri-card)] border-t px-6 py-4 flex justify-end gap-3 z-10 md:rounded-b-2xl"
          style={{ borderColor: "var(--agri-border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[var(--agri-border)] hover:bg-[var(--agri-hover)] text-[var(--agri-text-secondary)] font-semibold text-sm transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>

          <button
            type="button"
            disabled={saving || !isValid}
            onClick={handleSubmit}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              saving || !isValid
                ? "bg-[var(--agri-hover)] text-[var(--agri-text-muted)] cursor-not-allowed"
                : "bg-[#2D6A4F] hover:bg-[#1B4332] text-white cursor-pointer shadow-sm"
            }`}
          >
            {saving ? t("products.saving") : product ? t("products.saveChanges") : t("products.createProduct")}
          </button>
        </div>
      </div>
    </div>
  );
}

const initialForm = {
  name: "",
  category: "",
  price: "",
  originalPrice: "",
  stock: "",
  unit: "",
  available: true,
  durationHours: "",
  images: [],
};
