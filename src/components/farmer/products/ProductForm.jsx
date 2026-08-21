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
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <label className="text-sm font-medium">Product Name</label>

        <input
          name="name"
          value={form.name}
          onChange={onChange}
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

      <div>
        <label className="text-sm font-medium">Price</label>

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
            className="w-full border rounded-xl pl-9 pr-4 py-3"
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
        <label className="flex items-center gap-3">
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
          />
          Available for sale
        </label>
      </div>
    </div>
  );
}
