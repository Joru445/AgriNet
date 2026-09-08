import { useState } from "react";
import { RANGE_PRESETS } from "../../utils/analyticsDateRange";

/**
 * Compact date-range selector with a small popover menu. `value` is a preset
 * key ("7d" | "30d" | "90d" | "1y"); `onChange` receives the selected key.
 */
export default function RangeSelector({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    if (disabled) return;
    setOpen((o) => !o);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--agri-border)] bg-[var(--agri-card)] px-2.5 py-1 text-xs font-semibold text-[var(--agri-text-secondary)] shadow-2xs transition hover:bg-[var(--agri-hover)] disabled:opacity-50"
      >
        <i className="ri-calendar-line text-sm" />
        <span>{RANGE_PRESETS[value]?.label ?? value}</span>
        <i className={`ri-arrow-down-s-line text-sm ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 min-w-28 overflow-hidden rounded-xl border border-[var(--agri-border)] bg-[var(--agri-elevated)] p-1 shadow-lg"
          >
            {Object.entries(RANGE_PRESETS).map(([key, spec]) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  key === value
                    ? "bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[var(--agri-brand)]/15 dark:text-[var(--agri-brand)]"
                    : "text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)]"
                }`}
              >
                {spec.label}
                {key === value && <i className="ri-check-line text-sm" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
