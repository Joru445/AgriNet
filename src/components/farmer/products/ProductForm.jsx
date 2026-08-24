const categories = [
  "Vegetables",
  "Fruits",
  "Grains",
  "Root Crops",
  "Herbs",
  "Livestock",
  "Poultry",
  "Seafood",
  "Others",
];

const units = ["kg", "g", "pcs", "bundle", "pack", "box", "sack"];

export default function ProductForm({ form, onChange }) {
  const originalPriceNum = Number(form.originalPrice);
  const priceNum = Number(form.price);
  const hasDiscount =
    !isNaN(originalPriceNum) &&
    !isNaN(priceNum) &&
    originalPriceNum > 0 &&
    priceNum > 0 &&
    originalPriceNum > priceNum;

  const discountPercent = hasDiscount
    ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
    : 0;

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <label className="text-sm font-medium">Product Name</label>

        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="e.g. Fresh Red Tomatoes"
          className="mt-2 w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>

        <select
          name="category"
          value={form.category}
          onChange={onChange}
          className="mt-2 w-full border rounded-xl px-4 py-3"
        >
          <option value="">Select category</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Unit</label>

        <select
          name="unit"
          value={form.unit}
          onChange={onChange}
          className="mt-2 w-full border rounded-xl px-4 py-3"
        >
          <option value="">Select unit</option>

          {units.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      {/* Selling / Discounted Price */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Selling Price <span className="text-red-500">*</span>
          </label>
          {hasDiscount && (
            <span className="inline-flex items-center rounded-md bg-[#FF2D55] px-2 py-0.5 text-xs font-bold text-white">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="relative mt-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold select-none text-base">
            ₱
          </span>

          <input
            name="price"
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={form.price}
            onChange={onChange}
            className="w-full border rounded-xl pl-9 pr-4 py-3 font-semibold text-gray-900"
          />
        </div>
      </div>

      {/* Original Price (For Slash Discount) */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Original Price <span className="text-xs text-gray-400 font-normal">(Optional for discount slash)</span>
        </label>

        <div className="relative mt-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold select-none text-base">
            ₱
          </span>

          <input
            name="originalPrice"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 60.00"
            value={form.originalPrice || ""}
            onChange={onChange}
            className="w-full border rounded-xl pl-9 pr-4 py-3 font-medium text-gray-600 placeholder-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Stock</label>

        <input
          name="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={onChange}
          className="mt-2 w-full border rounded-xl px-4 py-3"
        />
      </div>

      <div className="md:col-span-2">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            name="available"
            checked={form.available}
            onChange={(e) =>
              onChange({
                target: {
                  name: "available",
                  value: e.target.checked,
                },
              })
            }
            className="h-4 w-4 rounded accent-[#2D6A4F]"
          />
          <span className="text-sm font-medium">Available for sale</span>
        </label>
      </div>
    </div>
  );
}
