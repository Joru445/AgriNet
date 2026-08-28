import { useState, useEffect, useRef } from "react";

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

const standardDurations = ["0", "1", "2", "3", "6", "12", "24"];

const durationOptions = [
  { value: "0", label: "No limit (Until out of stock)" },
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
  { value: "3", label: "3 hours" },
  { value: "6", label: "6 hours" },
  { value: "12", label: "12 hours" },
  { value: "24", label: "24 hours (1 day)" },
  { value: "custom", label: "Set custom hours..." },
];

function CustomDropdown({
  label,
  value,
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) =>
    typeof opt === "string" ? opt === value : opt.value === value
  );

  const displayLabel = selectedOption
    ? typeof selectedOption === "string"
      ? selectedOption
      : selectedOption.label
    : "";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-sm font-semibold text-gray-800 block mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full border rounded-xl px-4 py-3 text-sm flex items-center justify-between bg-white text-left transition-all cursor-pointer ${
          isOpen
            ? "border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20 shadow-xs"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <span
          className={`truncate ${
            displayLabel ? "text-gray-900 font-medium" : "text-gray-400 font-normal"
          }`}
        >
          {displayLabel || placeholder}
        </span>

        {/* Animated Chevron: turns upwards smoothly when open */}
        <i
          className={`ri-arrow-down-s-line text-xl text-gray-500 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-[#2D6A4F]" : ""
          }`}
        />
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto py-1 scrollbar-thin">
          {options.map((opt) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label;
            const isSelected = optValue === value;

            return (
              <button
                key={optValue}
                type="button"
                onClick={() => {
                  onChange(optValue);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#E8F5EE] text-[#2D6A4F] font-bold"
                    : "text-gray-700 hover:bg-[#F0F5F2] hover:text-[#1B4332]"
                }`}
              >
                <span className="truncate">{optLabel}</span>
                {isSelected && (
                  <i className="ri-check-line text-[#2D6A4F] font-bold text-base shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

  // Determine duration preset selection
  const currentDurationStr =
    form.durationHours != null && form.durationHours !== ""
      ? String(form.durationHours)
      : "0";

  const [isCustomDuration, setIsCustomDuration] = useState(() => {
    return currentDurationStr !== "0" && !standardDurations.includes(currentDurationStr);
  });

  useEffect(() => {
    if (currentDurationStr !== "0" && !standardDurations.includes(currentDurationStr)) {
      setIsCustomDuration(true);
    }
  }, [currentDurationStr]);

  function handleDurationSelectChange(val) {
    if (val === "custom") {
      setIsCustomDuration(true);
    } else {
      setIsCustomDuration(false);
      onChange({
        target: {
          name: "durationHours",
          value: val === "0" ? "" : val,
        },
      });
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {/* 1. Product Name */}
      <div className="md:col-span-2">
        <label className="text-sm font-semibold text-gray-800 block mb-2">
          Product Name
        </label>

        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="e.g. Fresh Red Tomatoes"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
        />
      </div>

      {/* 2. Category Custom Dropdown with Flip Arrow */}
      <div>
        <CustomDropdown
          label="Category"
          value={form.category}
          options={categories}
          placeholder="Select category"
          onChange={(val) =>
            onChange({
              target: {
                name: "category",
                value: val,
              },
            })
          }
        />
      </div>

      {/* 3. Unit Custom Dropdown with Flip Arrow */}
      <div>
        <CustomDropdown
          label="Unit"
          value={form.unit}
          options={units}
          placeholder="Select unit"
          onChange={(val) =>
            onChange({
              target: {
                name: "unit",
                value: val,
              },
            })
          }
        />
      </div>

      {/* 4. Product Listing Duration (Auto-disappear in Hours) - IN BETWEEN UNIT AND SELLING PRICE */}
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-800">
            Listing Duration
          </label>
          <span className="text-xs text-gray-400 font-medium">Auto-disappear</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CustomDropdown
            value={
              isCustomDuration
                ? "custom"
                : currentDurationStr === ""
                ? "0"
                : currentDurationStr
            }
            options={durationOptions}
            placeholder="Select duration"
            onChange={handleDurationSelectChange}
          />

          {/* Custom Hours Input when custom is chosen */}
          {isCustomDuration && (
            <div className="relative">
              <input
                type="number"
                name="durationHours"
                min="1"
                step="1"
                placeholder="e.g. 5"
                value={form.durationHours || ""}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-xl pl-4 pr-16 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 select-none">
                hours
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Selling / Discounted Price */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-800">
            Selling Price <span className="text-red-500">*</span>
          </label>
          {hasDiscount && (
            <span className="inline-flex items-center rounded-md bg-[#FF2D55] px-2 py-0.5 text-xs font-bold text-white shadow-2xs">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="relative">
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
            className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-3 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
          />
        </div>
      </div>

      {/* 6. Original Price (For Slash Discount) */}
      <div>
        <label className="text-sm font-semibold text-gray-800 block mb-2">
          Original Price{" "}
          <span className="text-xs text-gray-400 font-normal">
            (Optional for discount slash)
          </span>
        </label>

        <div className="relative">
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
            className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-3 text-sm font-medium text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
          />
        </div>
      </div>

      {/* 7. Stock Quantity */}
      <div className="md:col-span-2">
        <label className="text-sm font-semibold text-gray-800 block mb-2">
          Stock Quantity
        </label>

        <input
          name="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={onChange}
          placeholder="e.g. 100"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
        />
      </div>

      {/* 8. Available Checkbox */}
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
          <span className="text-sm font-semibold text-gray-800">
            Available for sale
          </span>
        </label>
      </div>
    </div>
  );
}
