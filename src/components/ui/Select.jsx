import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

function MenuSelect({
  label,
  error,
  helperText,
  disabled,
  required,
  className = "",
  selectClassName = "",
  id,
  value,
  onChange,
  options = [],
  onOpenChange,
  loading = false,
  statusMessage,
  onRetry,
  retryLabel,
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options.find((option) => option.value === value) ||
    (value ? { label: value } : options[selectedIndex]);
  const setMenuOpen = (next) => {
    setOpen(next);
    onOpenChange?.(next);
  };
  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect)
      setPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  };
  useEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const dismiss = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      )
        setMenuOpen(false);
    };
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);
  const choose = (next) => {
    onChange?.({ target: { value: next }, currentTarget: { value: next } });
    setMenuOpen(false);
    buttonRef.current?.focus();
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      setMenuOpen(!open);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" || !options.length) return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const next =
      options[(selectedIndex + direction + options.length) % options.length];
    if (open) choose(next.value);
    else setMenuOpen(true);
  };
  const menu =
    open && position
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-labelledby={selectId}
            className="fixed z-[10050] overflow-hidden rounded-xl border border-(--agri-border) bg-(--agri-card) p-1 shadow-lg"
            style={position}
          >
            {loading && (
              <p className="flex items-center gap-2 px-3 py-2 text-xs text-(--agri-text-muted)" role="status"><i className="ri-loader-4-line animate-spin" aria-hidden="true" />{statusMessage}</p>
            )}
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(option.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${active ? "bg-[#2D6A4F]/12 font-semibold text-[#1B4332] dark:bg-emerald-500/15 dark:text-emerald-200" : "text-(--agri-text) hover:bg-(--agri-hover)"}`}
                >
                  <span>{option.label}</span>
                  {active && (
                    <i
                      className="ri-check-line text-base text-[#2D6A4F] dark:text-emerald-300"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
            {!loading && statusMessage && (
              <div className="px-3 py-2 text-xs text-(--agri-text-muted)">
                <p>{statusMessage}</p>
                {onRetry && <button type="button" onClick={onRetry} className="mt-1 font-semibold text-(--agri-brand) hover:underline">{retryLabel}</button>}
              </div>
            )}
          </div>,
          document.body,
        )
      : null;
  return (
    <div className={className}>
      {label && (
        <label
          id={`${selectId}-label`}
          className="mb-1.5 block text-xs font-semibold text-(--agri-text)"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <button
        ref={buttonRef}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${selectId}-label` : undefined}
        onClick={() => setMenuOpen(!open)}
        onKeyDown={onKeyDown}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-(--agri-input-bg) px-3.5 text-left text-sm text-(--agri-text) transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/25 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-red-400" : "border-(--agri-input-border) hover:border-(--agri-brand)/40 focus-visible:border-[#2D6A4F] dark:focus-visible:border-emerald-500"} ${selectClassName}`}
        {...props}
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
        <i
          className={`ri-arrow-down-s-line shrink-0 text-base text-(--agri-text-muted) transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-(--agri-text-muted)">{helperText}</p>
      ) : null}
      {menu}
    </div>
  );
}

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
    options,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  if (options)
    return (
      <MenuSelect
        label={label}
        error={error}
        helperText={helperText}
        disabled={disabled}
        required={required}
        className={className}
        selectClassName={selectClassName}
        id={id || generatedId}
        value={value}
        onChange={onChange}
        options={options}
        {...props}
      />
    );
  const selectId = id || generatedId;
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-semibold text-(--agri-text)"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 text-base text-(--agri-text-muted)">
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
          className={`h-11 w-full cursor-pointer appearance-none rounded-xl border bg-(--agri-input-bg) px-3.5 pr-10 text-sm text-(--agri-text) transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/25 ${icon ? "pl-10" : "pl-3.5"} ${error ? "border-red-400" : "border-(--agri-input-border) hover:border-(--agri-brand)/40 focus-visible:border-[#2D6A4F] dark:focus-visible:border-emerald-500"} ${selectClassName}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-3.5 text-base text-(--agri-text-muted)">
          <i className="ri-arrow-down-s-line" />
        </div>
      </div>
      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-(--agri-text-muted)">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
