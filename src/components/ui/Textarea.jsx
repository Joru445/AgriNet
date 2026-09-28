import { forwardRef, useId } from "react";

/**
 * Standard Textarea component for forms across AgriNet.
 */
const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    disabled = false,
    required = false,
    maxLength,
    rows = 4,
    className = "",
    textareaClassName = "",
    id,
    value,
    onChange,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const textareaId = id || generatedId;

  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-(--agri-text)"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {maxLength && (
          <span className="text-[11px] font-medium text-(--agri-text-muted) tabular-nums">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        value={value}
        onChange={onChange}
        className={`
          w-full px-3.5 py-2.5
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
          resize-y
          ${
            error
              ? "border-red-400 dark:border-red-500/50 bg-red-50/20 focus-visible:border-red-500"
              : "border-(--agri-input-border) hover:border-(--agri-brand)/40 focus-visible:border-[#2D6A4F] dark:focus-visible:border-emerald-500"
          }
          ${textareaClassName}
        `}
        {...props}
      />

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

export default Textarea;
