import { forwardRef, useId } from "react";

/**
 * Standard Select component for forms across AgriNet.
 */
const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    icon,
    disabled = false,
    required = false,
    className = "",
    selectClassName = "",
    id,
    children,
    value,
    onChange,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block mb-1.5 text-xs font-semibold text-(--agri-text)"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-(--agri-text-muted) text-base">
            <i className={icon} />
          </div>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          className={`
            w-full h-11 px-3.5 pr-10
            ${icon ? "pl-10" : "pl-3.5"}
            rounded-xl border text-sm
            bg-(--agri-input-bg)
            text-(--agri-text)
            appearance-none
            cursor-pointer
            transition-all duration-150
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#2D6A4F]/25
            dark:focus-visible:ring-emerald-500/25
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-red-400 dark:border-red-500/50 bg-red-50/20 focus-visible:border-red-500"
                : "border-(--agri-input-border) hover:border-(--agri-brand)/40 focus-visible:border-[#2D6A4F] dark:focus-visible:border-emerald-500"
            }
            ${selectClassName}
          `}
          {...props}
        >
          {children}
        </select>

        <div className="absolute right-3.5 flex items-center justify-center pointer-events-none text-(--agri-text-muted) text-base">
          <i className="ri-arrow-down-s-line" />
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5 anim-fade-in">
          <i className="ri-error-warning-line shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-(--agri-text-muted)">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
