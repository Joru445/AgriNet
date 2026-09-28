import { forwardRef, useId, useState } from "react";

/**
 * Standard Input component for forms across AgriNet.
 *
 * Provides:
 * - Consistent 42px height (44px on mobile)
 * - Label and optional hint/error messaging
 * - Left/right icon slots and password reveal toggle
 * - Focus-visible ring with brand forest green
 * - Dark mode compliance with CSS tokens
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    type = "text",
    icon,
    rightIcon,
    clearable = false,
    onClear,
    disabled = false,
    required = false,
    className = "",
    inputClassName = "",
    id,
    value,
    onChange,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const effectiveType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
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

        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          className={`
            w-full h-11 px-3.5
            ${icon ? "pl-10" : "pl-3.5"}
            ${rightIcon || isPassword || clearable ? "pr-10" : "pr-3.5"}
            rounded-xl border text-sm
            bg-(--agri-input-bg)
            text-(--agri-text)
            placeholder:text-(--agri-text-muted)
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
            ${inputClassName}
          `}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3 p-1 rounded-lg text-(--agri-text-muted) hover:text-(--agri-text) transition cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
          </button>
        ) : clearable && value ? (
          <button
            type="button"
            onClick={onClear}
            tabIndex={-1}
            className="absolute right-3 p-1 rounded-lg text-(--agri-text-muted) hover:text-(--agri-text) transition cursor-pointer"
            aria-label="Clear input"
          >
            <i className="ri-close-circle-fill text-base" />
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3.5 flex items-center justify-center pointer-events-none text-(--agri-text-muted) text-base">
            <i className={rightIcon} />
          </div>
        ) : null}
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

export default Input;
