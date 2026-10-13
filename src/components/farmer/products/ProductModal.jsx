import { useEffect, useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import Button from "../../ui/Button";
import ResponsiveModal from "../../ui/ResponsiveModal";
import ProductForm from "./ProductForm";
import ProductImageUploader from "./ProductImageUploader";

const EMPTY = {
  name: "", description: "", category: "", price: "", originalPrice: "",
  stock: "", unit: "", available: true, durationHours: "", images: [],
  sellingMode: "available", preorderPolicy: "made_to_order", preparationLeadHours: "",
  expectedAvailableDate: "", preOrderDeadline: "", preOrderLimit: "",
};
const STEPS = ["Details", "Pricing", "Order settings"];

function formatDateInput(value) {
  if (!value) return "";
  try {
    const date = value.toDate?.() ?? new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : "";
  } catch { return ""; }
}

export default function ProductModal({ open, product, saving, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [dirty, setDirty] = useState(false);
  const [step, setStep] = useState(1);
  useEffect(() => {
    if (open) {
      setDirty(false);
      setStep(1);
    }
  }, [open, product?.id]);
  const requestClose = () => {
    if (!dirty || window.confirm(t("products.discardChanges"))) onClose();
  };
  return (
    <ResponsiveModal open={open} onClose={requestClose} maxWidth="max-w-[40rem]" bodyClassName="flex min-h-0 flex-col overflow-hidden p-0"
      title={product ? "Edit product" : "New product"}
      subtitle={`Step ${step} of 3 · ${STEPS[step - 1]}`}
      ariaLabel={product ? "Edit product" : "Create product"} desktopPlacement="right">
      <Editor key={product?.id || "new"} product={product} saving={saving} onClose={requestClose} onSubmit={onSubmit} onDirtyChange={setDirty} step={step} setStep={setStep} />
    </ResponsiveModal>
  );
}

function Editor({ product, saving, onClose, onSubmit, onDirtyChange, step, setStep }) {
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(() => ({
    ...EMPTY, ...product, images: product?.images ?? [],
    expectedAvailableDate: formatDateInput(product?.expectedAvailableDate),
    preOrderDeadline: formatDateInput(product?.preOrderDeadline),
    preorderPolicy: product?.preorderPolicy ?? (product?.sellingMode === "preorder" ? "scheduled_batch" : "made_to_order"),
  }));
  const reserved = Number(product?.reservedQuantity || 0);
  const invalidSwitch = product?.sellingMode === "preorder" && reserved > 0 && form.sellingMode !== "preorder";
  const isValidStep = (value) => {
    if (value === 1) return Boolean(form.name?.trim() && form.name.length <= 120 && form.description?.length <= 2000 && form.category && form.unit && form.images?.length);
    if (value === 2) return Number(form.price) > 0 && form.stock !== "" && Number.isInteger(Number(form.stock)) && Number(form.stock) >= 0 && !invalidSwitch;
    if (form.sellingMode !== "preorder") return true;
    const policy = form.preorderPolicy || "made_to_order";
    return Number.isInteger(Number(form.preOrderLimit)) && Number(form.preOrderLimit) >= Math.max(1, reserved)
      && (policy !== "made_to_order" || Number(form.preparationLeadHours) > 0)
      && (policy === "made_to_order" || Boolean(form.expectedAvailableDate))
      && (policy !== "scheduled_batch" || Boolean(form.preOrderDeadline))
      && (!form.expectedAvailableDate || !form.preOrderDeadline || new Date(form.preOrderDeadline) < new Date(form.expectedAvailableDate));
  };
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    onDirtyChange(true);
  }
  function validateCurrentStep() {
    const nextErrors = {};
    if (step === 1) {
      if (!form.name?.trim()) nextErrors.name = "Enter a product name.";
      if (!form.category) nextErrors.category = "Choose a category.";
      if (!form.unit) nextErrors.unit = "Choose a unit.";
      if (!form.images?.length) nextErrors.images = "Add at least one image.";
    } else if (step === 2) {
      if (!(Number(form.price) > 0)) nextErrors.price = "Enter a valid selling price.";
      if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) nextErrors.stock = "Stock must be a non-negative whole number.";
    } else if (form.sellingMode === "preorder") {
      const policy = form.preorderPolicy || "made_to_order";
      if (!Number.isInteger(Number(form.preOrderLimit)) || Number(form.preOrderLimit) < Math.max(1, reserved)) nextErrors.preOrderLimit = "Enter a valid pre-order quantity.";
      if (policy === "made_to_order" && !(Number(form.preparationLeadHours) > 0)) nextErrors.preparationLeadHours = "Made-to-order products need preparation hours.";
      if (policy !== "made_to_order" && !form.expectedAvailableDate) nextErrors.expectedAvailableDate = "Choose the expected ready date.";
      if (policy === "scheduled_batch" && !form.preOrderDeadline) nextErrors.preOrderDeadline = "Choose an ordering deadline.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && isValidStep(step);
  }
  async function next() {
    if (!validateCurrentStep()) return;
    if (step < 3) setStep(step + 1);
    else if (!saving) {
      try {
        await onSubmit({ ...form, description: form.description.trim(),
          ...(form.sellingMode === "preorder" && form.preorderPolicy === "made_to_order"
            ? { expectedAvailableDate: null, preOrderDeadline: null } : {}) });
      } catch (error) {
        const message = error?.message || "Could not save this product.";
        const field = /preparation|lead time/i.test(message) ? "preparationLeadHours"
          : /pre-order limit|capacity/i.test(message) ? "preOrderLimit"
            : /expected.*date/i.test(message) ? "expectedAvailableDate"
              : /cutoff|deadline/i.test(message) ? "preOrderDeadline" : "general";
        setErrors({ [field]: message });
      }
    }
  }
  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="shrink-0 grid grid-cols-3 gap-2 border-b border-(--agri-border) px-3 py-3 sm:px-6">
      {STEPS.map((label, index) => <button key={label} type="button" disabled={index + 1 > step}
        onClick={() => setStep(index + 1)} aria-current={step === index + 1 ? "step" : undefined}
        className={`min-h-11 rounded-lg px-1 text-xs font-semibold transition ${step === index + 1 ? "bg-[#2D6A4F] text-white" : "bg-(--agri-hover) text-(--agri-text-secondary) disabled:opacity-50"}`}>
        <span className="sm:hidden">{index + 1}. {label.split(" ")[0]}</span><span className="hidden sm:inline">{index + 1}. {label}</span>
      </button>)}
    </div>
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
      {step === 1 && <ProductImageUploader images={form.images} onChange={(images) => { setForm((prev) => ({ ...prev, images })); onDirtyChange(true); }} />}
      <ProductForm form={form} onChange={handleChange} step={step} errors={errors} />
      {errors.images && <p role="alert" className="text-sm text-red-600">{errors.images}</p>}
      {errors.general && <p role="alert" className="text-sm text-red-600">{errors.general}</p>}
      {invalidSwitch && <p role="alert" className="text-sm text-red-600">Committed pre-orders must be completed or cancelled before switching the listing mode.</p>}
    </div>
    <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-(--agri-border) bg-(--agri-card) px-4 py-3 sm:px-6">
      <Button variant="secondary" size="md" onClick={step === 1 ? onClose : () => setStep(step - 1)}>{step === 1 ? "Cancel" : "Back"}</Button>
      <Button variant="primary" size="md" disabled={saving} loading={saving} onClick={next}>
        {step < 3 ? "Continue" : product ? "Save changes" : "Publish product"}
      </Button>
    </footer>
  </div>;
}
