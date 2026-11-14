import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { parseDate } from "../../../utils/date";
import Button from "../../ui/Button";
import ResponsiveModal from "../../ui/ResponsiveModal";
import ProductForm from "./ProductForm";
import ProductImageUploader from "./ProductImageUploader";
import useProductDraft from "../../../hooks/useProductDraft";
import { showToast } from "../../../utils/toast";

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

function baseForm(product) {
  return {
    ...EMPTY,
    ...product,
    images: product?.images ?? [],
    expectedAvailableDate: formatDateInput(product?.expectedAvailableDate),
    preOrderDeadline: formatDateInput(product?.preOrderDeadline),
    preorderPolicy: product?.preorderPolicy ?? (product?.sellingMode === "preorder" ? "scheduled_batch" : "made_to_order"),
  };
}

export default function ProductModal({ open, product, draftId, saving, onClose, onSubmit }) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (open) setStep(1);
  }, [open, product?.id, draftId]);

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[40rem]"
      bodyClassName="flex min-h-0 flex-col overflow-hidden p-0"
      title={product ? "Edit product" : "New product"}
      subtitle={`Step ${step} of 3 \u2014 ${STEPS[step - 1]}`}
      ariaLabel={product ? "Edit product" : "Create product"}
      desktopPlacement="right"
    >
      <Editor
        key={product?.id || draftId || "new"}
        product={product}
        draftId={draftId}
        saving={saving}
        onClose={onClose}
        onSubmit={onSubmit}
        onStepChange={setStep}
      />
    </ResponsiveModal>
  );
}

function Editor({
  product,
  draftId,
  saving,
  onClose,
  onSubmit,
  onStepChange,
}) {
  const { t } = useLanguage();
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [staleDraft, setStaleDraft] = useState(false);
  const [form, setForm] = useState(() => baseForm(product));
  const hydratedRef = useRef(false);
  const changedRef = useRef(false);

  const {
    activeDraftId,
    draft,
    loading: loadingDraft,
    status,
    lastSavedAt,
    restored,
    scheduleSave,
    flush,
    pauseAutosave,
    discard,
    dismissRestored,
  } = useProductDraft({
    draftId,
    productId: product?.id,
    enabled: true,
  });

  const reserved = Number(product?.reservedQuantity || 0);
  const invalidSwitch = product?.sellingMode === "preorder" && reserved > 0 && form.sellingMode !== "preorder";

  useLayoutEffect(() => {
    if (loadingDraft || hydratedRef.current) return;

    if (draft) {
      // If the farmer started typing before IndexedDB finished loading, keep
      // their newer edits instead of replacing them with the stored draft.
      if (changedRef.current) {
        dismissRestored();
      } else {
        const restoredForm = {
          ...baseForm(product),
          ...(draft.form || {}),
          images: draft.images?.length ? draft.images : (draft.form?.images || []),
        };
        restoredForm.expectedAvailableDate = formatDateInput(restoredForm.expectedAvailableDate);
        restoredForm.preOrderDeadline = formatDateInput(restoredForm.preOrderDeadline);
        setForm(restoredForm);
        if (draft.step) {
          setStep(draft.step);
          onStepChange(draft.step);
        }

        const productUpdatedAt = parseDate(product?.updatedAt)?.getTime() || 0;
        setStaleDraft(
          draft.mode === "edit" &&
            productUpdatedAt > 0 &&
            Number(draft.updatedAt || 0) < productUpdatedAt,
        );
      }
    }

    hydratedRef.current = true;
  }, [loadingDraft, draft, product, onStepChange, dismissRestored]);

  // Autosave after hydration whenever the user edits the form or step.
  useEffect(() => {
    if (!hydratedRef.current || !changedRef.current) return;
    scheduleSave({ form, images: form.images || [], step });
  }, [form, step, scheduleSave]);

  function markChanged() {
    changedRef.current = true;
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    markChanged();
  }

  function handleImagesChange(images) {
    setForm((prev) => ({ ...prev, images }));
    setErrors((previous) => ({ ...previous, images: "" }));
    markChanged();
  }

  function goToStep(nextStep) {
    setStep(nextStep);
    onStepChange(nextStep);
    markChanged();
  }

  async function handleStartFresh() {
    if (!window.confirm(t("products.discardDraftConfirm"))) return;

    await discard();
    dismissRestored();
    setForm(baseForm(product));
    setStep(1);
    onStepChange(1);
    setStaleDraft(false);
    setErrors({});
    changedRef.current = false;
    hydratedRef.current = true;
  }

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

  const snapshot = { form, images: form.images || [], step };

  async function next() {
    if (!validateCurrentStep()) return;

    if (step < 3) {
      goToStep(step + 1);
      return;
    }

    if (saving) return;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await flush(snapshot);
      const message = t("products.offlineDraftSaved");
      setErrors({ general: message });
      showToast.warning(message);
      return;
    }

    // Persist the final snapshot, then stop autosave before publishing so the
    // draft is not recreated while uploads are in flight or after the modal
    // closes.
    await flush(snapshot);
    pauseAutosave();

    try {
      await onSubmit({
        ...form,
        draftId: activeDraftId,
        description: form.description.trim(),
        ...(form.sellingMode === "preorder" && form.preorderPolicy === "made_to_order"
          ? { expectedAvailableDate: null, preOrderDeadline: null } : {}),
      });
      await discard();
    } catch (error) {
      const message = error?.message || "Could not save this product.";
      const field = /preparation|lead time/i.test(message) ? "preparationLeadHours"
        : /pre-order limit|capacity/i.test(message) ? "preOrderLimit"
          : /expected.*date/i.test(message) ? "expectedAvailableDate"
            : /cutoff|deadline/i.test(message) ? "preOrderDeadline" : "general";
      setErrors({ [field]: message });
    }
  }

  const savedTime = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "";

  if (loadingDraft) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-10 text-sm text-(--agri-text-muted)">
        <i className="ri-loader-4-line animate-spin text-2xl" />
        <span>{t("products.draftChecking")}</span>
      </div>
    );
  }

  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="shrink-0 grid grid-cols-3 gap-2 border-b border-(--agri-border) px-3 py-3 sm:px-6">
      {STEPS.map((label, index) => <button key={label} type="button" disabled={index + 1 > step}
        onClick={() => goToStep(index + 1)} aria-current={step === index + 1 ? "step" : undefined}
        className={`min-h-11 rounded-lg px-1 text-xs font-semibold transition ${step === index + 1 ? "bg-[#2D6A4F] text-white" : "bg-(--agri-hover) text-(--agri-text-secondary) disabled:opacity-50"}`}>
        <span className="sm:hidden">{index + 1}. {label.split(" ")[0]}</span><span className="hidden sm:inline">{index + 1}. {label}</span>
      </button>)}
    </div>
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
      {restored && (
        <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          <div className="flex items-start gap-2">
            <i className="ri-draft-line mt-0.5 text-lg" />
            <div>
              <p className="text-sm font-bold">{t("products.draftRestored")}</p>
              <p className="text-xs opacity-80">{t("products.draftRestoredDesc")}</p>
              {staleDraft && (
                <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {t("products.draftStaleWarning")}
                </p>
              )}
            </div>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={handleStartFresh}>
            {t("products.startFresh")}
          </Button>
        </div>
      )}

      {(loadingDraft || lastSavedAt || status === "error" || status === "unavailable") && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-(--agri-border) bg-(--agri-hover)/40 px-3 py-2 text-xs text-(--agri-text-secondary)">
          <span className="inline-flex items-center gap-1.5">
            <i className={loadingDraft || status === "saving" ? "ri-loader-4-line animate-spin" : status === "error" || status === "unavailable" ? "ri-error-warning-line text-amber-600" : "ri-save-3-line text-emerald-700"} />
            {loadingDraft
              ? t("products.draftChecking")
              : status === "saving"
                ? t("products.draftSaving")
                : status === "error"
                  ? t("products.draftSaveError")
                  : status === "unavailable"
                    ? t("products.draftUnavailable")
                    : `${t("products.draftSaved")}${savedTime ? ` \u00b7 ${savedTime}` : ""}`}
          </span>
          {(draft || lastSavedAt) && (
            <button
              type="button"
              onClick={handleStartFresh}
              className="shrink-0 font-bold text-red-600 hover:underline dark:text-red-400"
            >
              {t("products.discardDraft")}
            </button>
          )}
        </div>
      )}

      {step === 1 && <ProductImageUploader images={form.images} onChange={handleImagesChange} draftId={activeDraftId} />}
      <ProductForm form={form} onChange={handleChange} step={step} errors={errors} />
      {errors.images && <p role="alert" className="text-sm text-red-600">{errors.images}</p>}
      {errors.general && <p role="alert" className="text-sm text-red-600">{errors.general}</p>}
      {invalidSwitch && <p role="alert" className="text-sm text-red-600">Committed pre-orders must be completed or cancelled before switching the listing mode.</p>}
    </div>
    <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-(--agri-border) bg-(--agri-card) px-4 py-3 sm:px-6">
      <Button variant="secondary" size="md" onClick={step === 1 ? onClose : () => goToStep(step - 1)}>{step === 1 ? "Cancel" : "Back"}</Button>
      <Button variant="primary" size="md" disabled={saving} loading={saving} onClick={next}>
        {step < 3 ? "Continue" : product ? "Save changes" : "Publish product"}
      </Button>
    </footer>
  </div>;
}
