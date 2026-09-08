export const RANGE_PRESETS = {
  "7d": { days: 7, label: "7D" },
  "30d": { days: 30, label: "30D" },
  "90d": { days: 90, label: "90D" },
  "1y": { days: 365, label: "1Y" },
};

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Compute `from`/`to` (inclusive) for a named preset, ending today.
 * Both are returned as YYYY-MM-DD strings suitable for the analytics API.
 */
export function getRangeForPreset(preset) {
  const spec = RANGE_PRESETS[preset] ?? RANGE_PRESETS["30d"];
  const to = new Date();
  const from = new Date(to.getTime() - (spec.days - 1) * 24 * 60 * 60 * 1000);
  return { from: toDateString(from), to: toDateString(to), days: spec.days };
}

export const DEFAULT_RANGE_PRESET = "30d";
