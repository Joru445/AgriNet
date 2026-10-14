import { useId } from "react";

/** A dependency-free two-thumb range control used by marketplace filters. */
export default function RangeSlider({ min = 0, max = 10000, value = [min, max], onChange, onCommit, label, disabled = false }) {
  const id = useId();
  const [rawMin = min, rawMax = max] = value;
  const lower = Math.max(min, Math.min(Number(rawMin) || min, Number(rawMax) || max));
  const upper = Math.min(max, Math.max(Number(rawMin) || min, Number(rawMax) || max));
  const span = Math.max(1, max - min);
  const start = ((lower - min) / span) * 100;
  const end = ((upper - min) / span) * 100;
  const emit = (next, commit = false) => { onChange?.(next); if (commit) onCommit?.(next); };

  return (
    <div className="space-y-3" aria-labelledby={label ? id : undefined}>
      {label ? <span id={id} className="sr-only">{label}</span> : null}
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-(--agri-text-secondary)">
        <span>₱{lower.toLocaleString()}</span><span>₱{upper.toLocaleString()}</span>
      </div>
      <div className="relative h-6 select-none">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--agri-border)" />
        <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#2D6A4F] dark:bg-emerald-500" style={{ left: `${start}%`, right: `${100 - end}%` }} />
        <input type="range" min={min} max={max} step="1" value={lower} disabled={disabled} aria-label={`${label || "Range"}: minimum`} onChange={(event) => emit([Math.min(Number(event.target.value), upper), upper])} onPointerUp={() => onCommit?.([lower, upper])} onKeyUp={() => onCommit?.([lower, upper])} className="range-thumb pointer-events-none absolute inset-0 z-10 h-6 w-full appearance-none bg-transparent" />
        <input type="range" min={min} max={max} step="1" value={upper} disabled={disabled} aria-label={`${label || "Range"}: maximum`} onChange={(event) => emit([lower, Math.max(Number(event.target.value), lower)])} onPointerUp={() => onCommit?.([lower, upper])} onKeyUp={() => onCommit?.([lower, upper])} className="range-thumb pointer-events-none absolute inset-0 z-20 h-6 w-full appearance-none bg-transparent" />
      </div>
    </div>
  );
}
