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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 z-9999 animate-in fade-in duration-200">
      <div className="bg-[var(--agri-card)] w-full max-w-2xl lg:max-w-3xl max-h-[92vh] sm:max-h-[88vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700">
        {/* Fixed Header - AgriNet System Green */}
        <div className="shrink-0 px-5 sm:px-6 py-4 flex justify-between items-center bg-[#2D6A4F] text-white z-10 rounded-t-2xl border-b-2 border-[#1B4332] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
              <i className={`${product ? "ri-edit-box-line" : "ri-plant-line"} text-xl text-white`} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {product ? t("products.editProductTitle") : t("products.addProductTitle")}
              </h2>
              <p className="text-xs font-medium text-emerald-100">
                {product ? t("products.updateDetails") : t("products.listNew")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 active:bg-white/25 transition-colors cursor-pointer shrink-0"
            title={t("common.close")}
          >
            <i className="ri-close-line text-2xl text-white" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 space-y-5 overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <ProductImageUploader images={form.images} onChange={handleImages} />
          <div className="h-px bg-gray-300 dark:bg-gray-700 w-full" />
          <ProductForm form={form} onChange={handleChange} />
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 bg-[var(--agri-card)] border-t border-gray-300 dark:border-gray-700 px-5 sm:px-6 py-3.5 sm:py-4 flex justify-end items-center gap-3 z-10 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-[var(--agri-hover)] text-[var(--agri-text-secondary)] hover:text-[var(--agri-text)] font-semibold text-sm transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>

          <button
            type="button"
            disabled={saving || !isValid}
            onClick={handleSubmit}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              saving || !isValid
                ? "bg-[var(--agri-hover)] text-[var(--agri-text-muted)] border border-[var(--agri-border-subtle)] cursor-not-allowed opacity-75"
                : "bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
            }`}
          >
            {saving ? (
              <>
                <i className="ri-loader-4-line animate-spin text-base" />
                <span>{t("products.saving")}</span>
              </>
            ) : product ? (
              <>
                <i className="ri-check-line text-base" />
                <span>{t("products.saveChanges")}</span>
              </>
            ) : (
              <>
                <i className="ri-add-line text-base" />
                <span>{t("products.createProduct")}</span>
              </>
            )}
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
