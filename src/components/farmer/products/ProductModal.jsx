import { useState } from "react";

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
      <div className="bg-white w-full h-full md:max-w-3xl md:max-h-[90vh] md:rounded-2xl overflow-y-auto scrollbar-none flex flex-col justify-between">
        <div>
          <div
            className="sticky top-0 z-10 px-6 py-5 flex justify-between items-center border-b md:rounded-t-2xl"
            style={{ backgroundColor: "var(--agri-bg-surface)", borderColor: "var(--agri-border)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/15 text-[#2D6A4F] flex items-center justify-center">
                <i className={`${product ? "ri-edit-box-line" : "ri-plant-line"} text-2xl text-[#2D6A4F]`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1B4332]">
                  {product ? "Edit Product" : "Add Product"}
                </h2>
                <p className="text-xs text-[#2D6A4F]/80">
                  {product ? "Update your product details" : "List a new agricultural product"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-[#1B4332] hover:bg-green-100/60 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-2xl" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            <ProductImageUploader images={form.images} onChange={handleImages} />

            <ProductForm form={form} onChange={handleChange} />
          </div>
        </div>

        <div
          className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 md:rounded-b-2xl"
          style={{ borderColor: "var(--agri-border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving || !isValid}
            onClick={handleSubmit}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              saving || !isValid
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#2D6A4F] hover:bg-[#1B4332] text-white cursor-pointer shadow-sm"
            }`}
          >
            {saving ? "Saving..." : product ? "Save Changes" : "Create Product"}
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
  stock: "",
  unit: "",
  available: true,
  images: [],
};
