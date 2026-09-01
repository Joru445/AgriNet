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
  const [openUpwards, setOpenUpwards] = useState(false);
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

  function handleToggle() {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If space below is constrained (less than 230px), open upwards!
      if (spaceBelow < 230 && rect.top > 200) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
    setIsOpen((prev) => !prev);
  }

  const selectedOption = options.find((opt) =>
    typeof opt === "string" ? opt === value : opt.value === value
  );

  const displayLabel = selectedOption
    ? typeof selectedOption === "string"
      ? selectedOption
      : selectedOption.label
    : "";

  return (
    <div
      className={`relative ${isOpen ? "z-50" : "z-10"} ${className}`}
      ref={dropdownRef}
    >
      {label && (
        <label className="text-sm font-semibold text-[var(--agri-text)] block mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full border rounded-xl px-4 py-3 text-sm flex items-center justify-between bg-[var(--agri-card)] text-left transition-all cursor-pointer ${
          isOpen
            ? "border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20 shadow-xs"
            : "border-[var(--agri-border)] hover:border-gray-400"
        }`}
      >
        <span
          className={`truncate ${
            displayLabel
              ? "text-[var(--agri-text)] font-medium"
              : "text-[var(--agri-text-muted)] font-normal"
          }`}
        >
          {displayLabel || placeholder}
        </span>

        {/* Animated Chevron: turns upwards smoothly when open */}
        <i
          className={`ri-arrow-down-s-line text-xl text-[var(--agri-text-muted)] transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? (openUpwards ? "" : "rotate-180 text-[#2D6A4F]") : ""
          }`}
        />
      </button>

      {/* Popup Menu with Smart Upward / Downward Drop */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 bg-[var(--agri-card)] border border-[var(--agri-border)] rounded-xl shadow-2xl max-h-56 overflow-y-auto py-1 scrollbar-thin ${
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
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
                    : "text-[var(--agri-text-secondary)] hover:bg-[#F0F5F2] hover:text-[#1B4332]"
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
    return (
      currentDurationStr !== "0" &&
      !standardDurations.includes(currentDurationStr)
    );
  });

  const [customUnit, setCustomUnit] = useState(() => {
    const num = Number(form.durationHours);
    if (!isNaN(num) && num > 0 && num < 1) {
      return "minutes";
    }
    return "hours";
  });

  const [customValue, setCustomValue] = useState(() => {
    const num = Number(form.durationHours);
    if (!isNaN(num) && num > 0) {
      if (num < 1) {
        return String(Math.round(num * 60));
      }
      return String(num);
    }
    return "";
  });

  useEffect(() => {
    if (
      currentDurationStr !== "0" &&
      !standardDurations.includes(currentDurationStr)
    ) {
      setIsCustomDuration(true);
      const num = Number(form.durationHours);
      if (!isNaN(num) && num > 0) {
        if (num < 1) {
          setCustomUnit("minutes");
          setCustomValue(String(Math.round(num * 60)));
        } else {
          setCustomUnit("hours");
          setCustomValue(String(num));
        }
      }
    }
  }, [currentDurationStr, form.durationHours]);

  function handleCustomChange(newVal, newUnit) {
    const val = newVal !== undefined ? newVal : customValue;
    const unit = newUnit !== undefined ? newUnit : customUnit;
    setCustomValue(val);
    setCustomUnit(unit);

    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const hours = unit === "minutes" ? num / 60 : num;
      onChange({
        target: {
          name: "durationHours",
          value: hours,
        },
      });
    } else {
      onChange({
        target: {
          name: "durationHours",
          value: "",
        },
      });
    }
  }

  function handleDurationSelectChange(val) {
    if (val === "custom") {
      setIsCustomDuration(true);
      if (customValue) {
        const num = parseFloat(customValue);
        if (!isNaN(num) && num > 0) {
          const hours = customUnit === "minutes" ? num / 60 : num;
          onChange({
            target: {
              name: "durationHours",
              value: hours,
            },
          });
        }
      }
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* 1. Product Name - Full Width */}
      <div className="col-span-1 sm:col-span-2 order-1">
        <label className="text-sm font-semibold text-[var(--agri-text)] block mb-2">
          Product Name
        </label>

        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="e.g. Fresh Red Tomatoes"
          className="w-full border border-[var(--agri-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
        />
      </div>

      {/* 2. Category Custom Dropdown */}
      <div className="order-2 sm:order-2">
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

      {/* 3. Unit Custom Dropdown */}
      <div className="order-3 sm:order-3">
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

      {/* 4. Product Listing Duration:
          - Mobile (order-4): In between Unit and Selling Price
          - Desktop (sm:order-6): In row 3 on the left side, directly beside Stock Quantity! */}
      <div className="order-4 sm:order-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-[var(--agri-text)]">
            Listing Duration
          </label>
          <span className="text-xs text-[var(--agri-text-muted)] font-medium">
            Auto-disappear
          </span>
        </div>

        <div className="space-y-2.5">
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

          {/* Custom Duration (Value + Custom Hours/Minutes dropdown with arrow) */}
          {isCustomDuration && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder={customUnit === "minutes" ? "e.g. 30" : "e.g. 5"}
                  value={customValue}
                  onChange={(e) => handleCustomChange(e.target.value, customUnit)}
                  className="w-full border border-[var(--agri-border)] rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
                />
              </div>

              <div className="w-32 shrink-0">
                <CustomDropdown
                  value={customUnit}
                  options={[
                    { value: "hours", label: "Hours" },
                    { value: "minutes", label: "Minutes" },
                  ]}
                  onChange={(unit) => handleCustomChange(customValue, unit)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Selling / Discounted Price */}
      <div className="order-5 sm:order-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-[var(--agri-text)]">
            Selling Price <span className="text-red-500">*</span>
          </label>
          {hasDiscount && (
            <span className="inline-flex items-center rounded-md bg-[#FF2D55] px-2 py-0.5 text-xs font-bold text-white shadow-2xs">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--agri-text-muted)] font-bold select-none text-base">
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
            className="w-full border border-[var(--agri-border)] rounded-xl pl-9 pr-4 py-3 text-sm font-semibold text-[var(--agri-text)] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
          />
        </div>
      </div>

      {/* 6. Original Price (For Slash Discount) */}
      <div className="order-6 sm:order-5">
        <label className="text-sm font-semibold text-[var(--agri-text)] block mb-2">
          Original Price{" "}
          <span className="text-xs text-[var(--agri-text-muted)] font-normal">
            (Optional for discount slash)
          </span>
        </label>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--agri-text-muted)] font-bold select-none text-base">
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
            className="w-full border border-[var(--agri-border)] rounded-xl pl-9 pr-4 py-3 text-sm font-medium text-[var(--agri-text-secondary)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
          />
        </div>
      </div>

      {/* 7. Stock Quantity:
          - Desktop (sm:order-7): Beside Listing Duration on the right side!
          - Mobile (order-7): Below original price */}
      <div className="order-7 sm:order-7">
        <label className="text-sm font-semibold text-[var(--agri-text)] block mb-2">
          Stock Quantity
        </label>

        <input
          name="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={onChange}
          placeholder="e.g. 100"
          className="w-full border border-[var(--agri-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
        />
      </div>

      {/* 8. Available Checkbox */}
      <div className="col-span-1 sm:col-span-2 order-8 sm:order-8">
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
          <span className="text-sm font-semibold text-[var(--agri-text)]">
            Available for sale
          </span>
        </label>
      </div>
    </div>
  );
}
