import { useEffect, useState } from "react";

import ProductForm from "./ProductForm";
import ProductImageUploader from "./ProductImageUploader";

export default function ProductModal({
  open,
  product,
  saving,
  onClose,
  onSubmit,
}) {
  const initialForm = {
    name: "",
    category: "",
    price: "",
    stock: "",
    unit: "",
    available: true,
    images: [],
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return;

    if (product) {
      setForm({
        ...initialForm,
        ...product,
        images: product.images ?? [],
      });
    } else {
      setForm(initialForm);
    }
  }, [product, open]);

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
    onSubmit(form);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center md:p-5 z-9999">
      <div className="bg-white w-full h-full md:max-w-3xl md:max-h-[90vh] md:rounded-2xl overflow-y-auto scrollbar-none">
        <div className="sticky top-0 z-2 bg-white border-b-2 border-b-gray-500 px-6 py-5 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {product ? "Edit Product" : "Add Product"}
          </h2>

          <button onClick={onClose}>
            <i className="ri-close-line text-2xl" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <ProductImageUploader images={form.images} onChange={handleImages} />

          <ProductForm form={form} onChange={handleChange} />
        </div>

        <div className="sticky bottom-0 bg-white border-t-2 border-t-gray-500 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border">
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white"
          >
            {saving ? "Saving..." : product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
