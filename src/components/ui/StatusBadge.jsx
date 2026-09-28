/**
 * Standard StatusBadge component
 *
 * Renders consistent, accessible status indicators with an accompanying icon
 * so state is never communicated by color alone (WCAG compliance).
 */

const STATUS_CONFIG = {
  // Green / Success states
  available: {
    label: "Available",
    icon: "ri-checkbox-circle-fill",
    classes: "bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  approved: {
    label: "Approved",
    icon: "ri-checkbox-circle-fill",
    classes: "bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  completed: {
    label: "Completed",
    icon: "ri-checkbox-circle-fill",
    classes: "bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  accepted: {
    label: "Accepted",
    icon: "ri-check-line",
    classes: "bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },

  // Blue / In-Progress states
  ongoing: {
    label: "In Progress",
    icon: "ri-exchange-line",
    classes: "bg-blue-500/10 text-blue-800 border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  },
  reserved: {
    label: "Reserved",
    icon: "ri-calendar-check-line",
    classes: "bg-indigo-500/10 text-indigo-800 border-indigo-500/25 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30",
  },

  // Amber / Warning states
  pending: {
    label: "Pending",
    icon: "ri-time-line",
    classes: "bg-amber-500/10 text-amber-800 border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  awaiting_proof: {
    label: "Awaiting Proof",
    icon: "ri-upload-cloud-line",
    classes: "bg-amber-500/10 text-amber-800 border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  proof_submitted: {
    label: "Proof Submitted",
    icon: "ri-file-search-line",
    classes: "bg-orange-500/10 text-orange-800 border-orange-500/25 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30",
  },

  // Red / Danger / Inactive states
  cancelled: {
    label: "Cancelled",
    icon: "ri-close-circle-fill",
    classes: "bg-red-500/10 text-red-800 border-red-500/25 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  },
  rejected: {
    label: "Rejected",
    icon: "ri-close-circle-fill",
    classes: "bg-red-500/10 text-red-800 border-red-500/25 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  },
  suspended: {
    label: "Suspended",
    icon: "ri-prohibited-line",
    classes: "bg-red-500/10 text-red-800 border-red-500/25 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  },

  // Neutral / Out of stock
  sold_out: {
    label: "Sold Out",
    icon: "ri-forbid-line",
    classes: "bg-(--agri-surface-subtle) text-(--agri-text-muted) border-(--agri-border)",
  },
};

export default function StatusBadge({
  status = "pending",
  label,
  icon,
  size = "md",
  className = "",
}) {
  const normalizedKey = String(status).toLowerCase().replace(/\s+/g, "_");
  const config = STATUS_CONFIG[normalizedKey] || {
    label: label || status,
    icon: icon || "ri-information-line",
    classes: "bg-(--agri-surface-subtle) text-(--agri-text-secondary) border-(--agri-border)",
  };

  const displayLabel = label || config.label;
  const displayIcon = icon || config.icon;

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px] gap-1"
      : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg border shadow-2xs whitespace-nowrap ${sizeClasses} ${config.classes} ${className}`}
    >
      {displayIcon && <i className={`${displayIcon} shrink-0 text-[1.1em]`} />}
      <span>{displayLabel}</span>
    </span>
  );
}
