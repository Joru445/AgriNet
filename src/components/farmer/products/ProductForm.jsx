import { useState, useEffect, useRef } from "react";

import { useLanguage } from "../../../context/LanguageContext";

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

function getDurationOptions(t) {
  return [
    { value: "0", label: t("products.noLimit") },
    { value: "1", label: t("products.durationHours.1") },
    { value: "2", label: t("products.durationHours.2") },
    { value: "3", label: t("products.durationHours.3") },
    { value: "6", label: t("products.durationHours.6") },
    { value: "12", label: t("products.durationHours.12") },
    { value: "24", label: t("products.durationHours.24") },
    { value: "custom", label: t("products.setCustom") },
  ];
}

const categoryKeyMap = {
  "Root Crops": "rootCrops",
};

function getCategories(t) {
  return categories.map((cat) => {
    const key = categoryKeyMap[cat] || cat.toLowerCase();
    return {
      value: cat,
      label: t(`products.categories.${key}`),
    };
  });
}

function getUnits(t) {
  return units.map((u) => ({
    value: u,
    label: t(`products.units.${u}`),
  }));
}

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
        className={`w-full border rounded-xl px-4 py-2.5 sm:py-3 text-sm flex items-center justify-between bg-[var(--agri-card)] text-left transition-all cursor-pointer ${
          isOpen
            ? "border-[#2D6A4F] ring-3 ring-[#2D6A4F]/15 shadow-xs"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 shadow-2xs"
        }`}
      >
        <span
          className={`truncate ${
            displayLabel
              ? "text-[var(--agri-text)] font-semibold"
              : "text-[var(--agri-text-muted)] font-normal"
          }`}
        >
          {displayLabel || placeholder}
        </span>

        {/* Animated Chevron: turns upwards smoothly when open */}
        <i
          className={`ri-arrow-down-s-line text-xl text-[var(--agri-text-muted)] transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? (openUpwards ? "" : "rotate-180 text-[#2D6A4F] dark:text-[var(--agri-brand)]") : ""
          }`}
        />
      </button>

      {/* Popup Menu with Smart Upward / Downward Drop */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 bg-[var(--agri-card)] border border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl max-h-56 overflow-y-auto py-1.5 scrollbar-thin ${
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
                    ? "bg-[#E8F5EE] dark:bg-[var(--agri-brand-bg-alt)] text-[#1B4332] dark:text-[var(--agri-brand-light)] font-bold"
                    : "text-[var(--agri-text)] hover:bg-[var(--agri-hover)] font-medium"
                }`}
              >
                <span className="truncate">{optLabel}</span>
                {isSelected && (
                  <i className="ri-check-line text-[#2D6A4F] dark:text-[var(--agri-brand)] font-bold text-base shrink-0 ml-2" />
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
  const { t } = useLanguage();
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {/* 1. Product Name - Full Width */}
      <div className="col-span-1 sm:col-span-2 order-1">
        <label className="text-xs font-bold text-[var(--agri-text)] uppercase tracking-wider block mb-1.5">
          {t("products.productName")} <span className="text-red-500">*</span>
        </label>

        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder={t("products.namePlaceholder")}
          className="w-full bg-[var(--agri-card)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 sm:py-3 text-sm font-medium text-[var(--agri-text)] placeholder:text-[var(--agri-text-muted)] hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[var(--agri-brand)] focus:ring-3 focus:ring-[#2D6A4F]/15 dark:focus:ring-[var(--agri-brand)]/20 shadow-2xs transition-all"
        />
      </div>

      {/* 2. Category Custom Dropdown */}
      <div className="order-2 sm:order-2">
        <CustomDropdown
          label={t("products.category")}
          value={form.category}
          options={getCategories(t)}
          placeholder={t("products.selectCategory")}
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
          label={t("products.unit")}
          value={form.unit}
          options={getUnits(t)}
          placeholder={t("products.selectUnit")}
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

      {/* 4. Product Listing Duration */}
      <div className="order-4 sm:order-6">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-[var(--agri-text)] uppercase tracking-wider">
            {t("products.listingDuration")}
          </label>
          <span className="text-[11px] font-medium text-[var(--agri-text-muted)] flex items-center gap-1 bg-[var(--agri-hover)] px-2 py-0.5 rounded-md">
            <i className="ri-time-line text-xs" />
            {t("products.autoDisappear")}
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
            options={getDurationOptions(t)}
            placeholder={t("products.selectDuration")}
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
                  className="w-full bg-[var(--agri-card)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 sm:py-3 text-sm font-medium text-[var(--agri-text)] placeholder:text-[var(--agri-text-muted)] hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[var(--agri-brand)] focus:ring-3 focus:ring-[#2D6A4F]/15 dark:focus:ring-[var(--agri-brand)]/20 shadow-2xs transition-all"
                />
              </div>

              <div className="w-32 shrink-0">
                <CustomDropdown
                  value={customUnit}
                  options={[
                    { value: "hours", label: t("products.hours") },
                    { value: "minutes", label: t("products.minutes") },
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
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-[var(--agri-text)] uppercase tracking-wider">
            {t("products.sellingPrice")} <span className="text-red-500">*</span>
          </label>
          {hasDiscount && (
            <span className="inline-flex items-center rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 text-xs font-bold">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)] select-none bg-[#E8F5EE] dark:bg-[var(--agri-brand-bg-alt)] border border-[#2D6A4F]/20 dark:border-[var(--agri-brand)]/20 px-2 py-0.5 rounded-md">
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
            className="w-full bg-[var(--agri-card)] border border-gray-300 dark:border-gray-600 rounded-xl pl-11 pr-4 py-2.5 sm:py-3 text-sm font-bold text-[var(--agri-text)] placeholder:text-[var(--agri-text-muted)] hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[var(--agri-brand)] focus:ring-3 focus:ring-[#2D6A4F]/15 dark:focus:ring-[var(--agri-brand)]/20 shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* 6. Original Price (For Slash Discount) */}
      <div className="order-6 sm:order-5">
        <label className="text-xs font-bold text-[var(--agri-text)] uppercase tracking-wider block mb-1.5">
          {t("products.originalPrice")}{" "}
          <span className="text-[11px] text-[var(--agri-text-muted)] font-normal normal-case">
            {t("products.optionalDiscount")}
          </span>
        </label>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--agri-text-muted)] select-none bg-[var(--agri-hover)] border border-gray-300 dark:border-gray-600 px-2 py-0.5 rounded-md">
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
            className="w-full bg-[var(--agri-card)] border border-gray-300 dark:border-gray-600 rounded-xl pl-11 pr-4 py-2.5 sm:py-3 text-sm font-medium text-[var(--agri-text-secondary)] placeholder:text-[var(--agri-text-muted)] hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[var(--agri-brand)] focus:ring-3 focus:ring-[#2D6A4F]/15 dark:focus:ring-[var(--agri-brand)]/20 shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* 7. Stock Quantity */}
      <div className="order-7 sm:order-7">
        <label className="text-xs font-bold text-[var(--agri-text)] uppercase tracking-wider block mb-1.5">
          {t("products.stockQuantity")} <span className="text-red-500">*</span>
        </label>

        <input
          name="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={onChange}
          placeholder="e.g. 100"
          className="w-full bg-[var(--agri-card)] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 sm:py-3 text-sm font-medium text-[var(--agri-text)] placeholder:text-[var(--agri-text-muted)] hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[var(--agri-brand)] focus:ring-3 focus:ring-[#2D6A4F]/15 dark:focus:ring-[var(--agri-brand)]/20 shadow-2xs transition-all"
        />
      </div>

      {/* 8. Available Switch Row */}
      <div className="col-span-1 sm:col-span-2 order-8 sm:order-8">
        <label className="flex items-center justify-between py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-xl bg-[var(--agri-hover)]/40 hover:bg-[var(--agri-hover)]/70 border border-gray-300 dark:border-gray-600 transition-colors cursor-pointer select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] dark:bg-[var(--agri-brand-bg-alt)] text-[#2D6A4F] dark:text-[var(--agri-brand)] flex items-center justify-center shrink-0">
              <i className="ri-store-3-line text-base" />
            </div>
            <div>
              <span className="text-sm font-bold text-[var(--agri-text)] block leading-tight">
                {t("products.availableForSale")}
              </span>
              <span className="text-xs text-[var(--agri-text-muted)] leading-tight block mt-0.5">
                Visible and ready for purchase in the marketplace
              </span>
            </div>
          </div>

          <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
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
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D6A4F] dark:peer-checked:bg-[var(--agri-brand)]" />
          </div>
        </label>
      </div>
    </div>
  );
}
