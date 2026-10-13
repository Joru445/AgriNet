import Input from "../../ui/Input";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import { useLanguage } from "../../../context/LanguageContext";

const categories = ["vegetables", "fruits", "grains", "root-crops", "herbs", "livestocks", "poultry", "meats", "seafoods", "others"];
const units = ["kg", "g", "pcs", "bundle", "pack", "box", "sack"];

/** Shared form primitives handle input styling, labels, focus, and accessibility. */
export default function ProductForm({ form, onChange, step = 1, errors = {} }) {
  const { t } = useLanguage();
  const preorder = form.sellingMode === "preorder";
  const policy = form.preorderPolicy || "made_to_order";
  const discount = Number(form.originalPrice) > Number(form.price) && Number(form.price) > 0
    ? Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5" aria-live="polite">
      {step === 1 && <>
        <Input className="sm:col-span-2" label={t("products.productName")} name="name" value={form.name ?? ""} onChange={onChange} error={errors.name}
          placeholder={t("products.namePlaceholder")} required maxLength={120} />
        <Textarea className="sm:col-span-2" label="Product description" name="description" value={form.description ?? ""}
          onChange={onChange} error={errors.description} maxLength={2000} rows={4} placeholder="What makes this product special? Include ingredients, portions, storage and preparation details when relevant."
          helperText="Shown on your product's details page. Do not include personal contact details." />
        <Select label={t("products.category")} name="category" value={form.category ?? ""} onChange={onChange} error={errors.category} required>
          <option value="">Select category</option>
          {categories.map((category) => <option key={category} value={category}>{t(`products.categories.${category}`)}</option>)}
        </Select>
        <Select label={t("products.unit")} name="unit" value={form.unit ?? ""} onChange={onChange} error={errors.unit} required>
          <option value="">Select measurement unit</option>
          {units.map((unit) => <option key={unit} value={unit}>{t(`products.units.${unit}`)}</option>)}
        </Select>
      </>}
      {step === 2 && <>
        <Input label={t("products.price")} name="price" type="number" min="0.01" max="10000000" step="0.01" value={form.price ?? ""} onChange={onChange} error={errors.price} required />
        <Input label={t("products.originalPrice")} name="originalPrice" type="number" min="0" step="0.01" value={form.originalPrice ?? ""} onChange={onChange} helperText={discount > 0 ? `${discount}% discount` : "Optional, for showing a discount"} />
        <Input label={t("products.stock")} name="stock" type="number" min="0" step="1" value={form.stock ?? ""} onChange={onChange} error={errors.stock} required helperText={preorder ? "On-hand stock is separate from pre-order capacity" : "Number of items ready to sell"} />
        <Select label="Listing expiration" name="durationHours" value={String(form.durationHours ?? "")} onChange={onChange} helperText="Expired listings can be viewed but not ordered">
          <option value="">No expiration</option>
          <option value="1">1 hour</option><option value="3">3 hours</option><option value="6">6 hours</option>
          <option value="12">12 hours</option><option value="24">24 hours</option><option value="48">48 hours</option>
        </Select>
        <Select className="sm:col-span-2" label="How will customers order?" name="sellingMode" value={form.sellingMode ?? "available"} onChange={onChange}>
          <option value="available">Standard — ready stock</option>
          <option value="preorder">Pre-order — prepared or harvested after agreement</option>
        </Select>
        <label className="flex items-center gap-3 rounded-xl border border-(--agri-border) bg-(--agri-hover)/40 px-4 py-3 text-sm text-(--agri-text) sm:col-span-2">
          <input type="checkbox" name="available" checked={form.available !== false} onChange={onChange} className="h-5 w-5 accent-[#2D6A4F]" />
          <span><strong>Accepting new inquiries</strong><span className="block text-xs text-(--agri-text-muted)">Switch off to temporarily pause new orders</span></span>
        </label>
      </>}
      {step === 3 && <>
        {preorder ? <>
          <div className="sm:col-span-2 rounded-xl border border-(--agri-border) bg-(--agri-hover)/50 p-3 text-xs text-(--agri-text-secondary)">
            Preparation and Ready are tracked <strong>for each customer order</strong>. Setting a ready estimate never automatically marks an order Ready.
          </div>
          <Select label="Pre-order type" name="preorderPolicy" value={policy} onChange={onChange} className="sm:col-span-2">
            <option value="made_to_order">Made to order — prepare after buyer confirmation</option>
            <option value="scheduled_batch">Scheduled batch — prepare for a set date</option>
            <option value="harvest_estimate">Harvest estimate — approximate ready date</option>
          </Select>
          <Input label="Preparation time (hours)" name="preparationLeadHours" type="number" min="0" max="2160" step="0.5" error={errors.preparationLeadHours}
            value={form.preparationLeadHours ?? ""} onChange={onChange} required={policy === "made_to_order"}
            helperText="Example: 3 for kakanin made after confirmation" />
          <Input label="Maximum pre-order quantity" name="preOrderLimit" type="number" min="1" max="100000" step="1" error={errors.preOrderLimit}
            value={form.preOrderLimit ?? ""} onChange={onChange} required helperText={policy === "made_to_order" ? "Maximum simultaneous unfinished orders; frees up when an order completes" : "Maximum quantity committed to this batch"} />
          {policy !== "made_to_order" && <>
            <Input label="Expected ready date" name="expectedAvailableDate" type="date" value={form.expectedAvailableDate ?? ""} onChange={onChange} error={errors.expectedAvailableDate} required />
            <Input label="Ordering deadline" name="preOrderDeadline" type="date" value={form.preOrderDeadline ?? ""} onChange={onChange} error={errors.preOrderDeadline}
              required={policy === "scheduled_batch"} helperText={policy === "scheduled_batch" ? "Customers must order before this cutoff" : "Optional cutoff"} />
          </>}
        </> : <div className="sm:col-span-2 rounded-xl bg-(--agri-hover) p-4 text-sm text-(--agri-text-secondary)">
          Standard products can be handed over as soon as the seller accepts the inquiry. Stock is reserved on acceptance.
        </div>}
        <div className="sm:col-span-2 rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 space-y-2">
          <h3 className="font-semibold text-(--agri-text)">Product preview</h3>
          <p className="font-bold text-(--agri-text)">{form.name || "Product name"}</p>
          <p className="whitespace-pre-wrap text-sm text-(--agri-text-secondary)">{form.description || "No description added yet"}</p>
          <div className="flex flex-wrap gap-3 text-sm text-(--agri-text-secondary)">
            <span>₱{Number(form.price || 0).toLocaleString()} / {form.unit || "unit"}</span>
            <span>{preorder ? `Pre-order · ${policy.replaceAll("_", " ")}` : "Available now"}</span>
          </div>
        </div>
      </>}
    </div>
  );
}
