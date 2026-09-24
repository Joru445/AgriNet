import { useState } from "react";

import { useLanguage } from "../../../context/LanguageContext";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import ProductForm from "./ProductForm";
import ProductImageUploader from "./ProductImageUploader";

export default function ProductModal({
  open,
  product,
  saving,
  onClose,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-2xl"
      hideTitleBar
      bodyClassName="p-0"
      ariaLabel={product ? "Edit Product" : "Add Product"}
      panelClassName="border border-gray-300 dark:border-gray-700 rounded-2xl"
    >
      <ProductModalContent
        key={product?.id ?? "new-product"}
        product={product}
        saving={saving}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function ProductModalContent({ product, saving, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...product,
    images: product?.images ?? [],
  }));

  // §21/§22 edit guards — mirrored from the backend's authoritative rules:
  // a pre-order's limit can never be lowered below units already reserved,
  // and a pre-order with reservations cannot be switched to "available"
  // (that would double-sell: consumers could buy while reservations exist).
  const reservedCount = Number(form.reservedQuantity ?? 0) || 0;
  const switchingModeWithReservations =
    product?.sellingMode === "preorder" &&
    reservedCount > 0 &&
    form.sellingMode !== "preorder";
  const limitBelowReserved =
    form.sellingMode === "preorder" &&
    reservedCount > 0 &&
    (!Number.isInteger(Number(form.preOrderLimit)) ||
      Number(form.preOrderLimit) < reservedCount);

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
    form.images.length > 0 &&
    !switchingModeWithReservations &&
    // Pre-order validation
    (form.sellingMode !== "preorder" || (
      form.expectedAvailableDate &&
      form.preOrderDeadline &&
      form.preOrderLimit &&
      Number(form.preOrderLimit) > 0 &&
      !limitBelowReserved &&
      new Date(form.preOrderDeadline) < new Date(form.expectedAvailableDate)
    ))
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
    <>
      {/* Header - AgriNet System Green */}
      <div className="px-5 sm:px-6 py-4 flex justify-between items-center bg-[#2D6A4F] text-white border-b-2 border-[#1B4332] shadow-xs">
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

      {/* Form Content */}
      <div className="px-5 sm:px-6 py-5 space-y-5">
        <ProductImageUploader images={form.images} onChange={handleImages} />
        <div className="h-px bg-gray-300 dark:bg-gray-700 w-full" />
        <ProductForm form={form} onChange={handleChange} />

        {/* Bottom Actions inside scrollable content */}
        <div className="pt-3 border-t border-gray-300 dark:border-gray-700">
          {(switchingModeWithReservations || limitBelowReserved) && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <i className="ri-alert-line mt-0.5 shrink-0" />
              <span>
                {switchingModeWithReservations
                  ? t("products.modeSwitchWithReservations")
                  : t("products.limitBelowReserved")}
              </span>
            </div>
          )}
          <div className="flex justify-end items-center gap-3">
            <Button variant="cancel" size="md" onClick={onClose}>
              {t("common.cancel")}
            </Button>

            <Button
              variant="primary"
              size="md"
              disabled={!isValid}
              loading={saving}
              onClick={handleSubmit}
            >
              {saving
                ? t("products.saving")
                : product
                  ? t("products.saveChanges")
                  : t("products.createProduct")}
            </Button>
          </div>
        </div>
      </div>
    </>
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
  sellingMode: "available",
  expectedAvailableDate: "",
  preOrderDeadline: "",
  preOrderLimit: "",
};