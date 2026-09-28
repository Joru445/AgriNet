import { useLanguage } from "../../context/LanguageContext";

const VARIANTS = {
  success: {
    icon: "ri-checkbox-circle-fill",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-500/25 dark:border-emerald-500/30",
    text: "text-emerald-900 dark:text-emerald-200",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: "ri-error-warning-fill",
    bg: "bg-red-500/10 dark:bg-red-500/15",
    border: "border-red-500/25 dark:border-red-500/30",
    text: "text-red-900 dark:text-red-200",
    iconColor: "text-red-600 dark:text-red-400",
  },
  warning: {
    icon: "ri-alert-fill",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-amber-500/25 dark:border-amber-500/30",
    text: "text-amber-900 dark:text-amber-200",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: "ri-information-fill",
    bg: "bg-sky-500/10 dark:bg-sky-500/15",
    border: "border-sky-500/25 dark:border-sky-500/30",
    text: "text-sky-900 dark:text-sky-200",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
};

/**
 * Inline alert banner with icon, message, and optional dismiss button.
 *
 * Use for contextual feedback near the relevant UI element:
 * - success: "Settings saved", "Profile updated"
 * - error: "Failed to save. Please try again."
 * - warning: "Your session will expire in 5 minutes"
 * - info: "Push notifications are disabled"
 *
 * Do NOT use for global/one-off feedback (use toast for that).
 */
export default function Alert({
  variant = "info",
  message,
  icon,
  onDismiss,
  className = "",
  children,
}) {
  const { t } = useLanguage();
  const v = VARIANTS[variant] || VARIANTS.info;

  if (!message && !children) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${v.bg} ${v.border} ${v.text} anim-fade-in ${className}`}
    >
      <i className={`${icon || v.icon} shrink-0 mt-0.5 ${v.iconColor}`} />

      <div className="flex-1 min-w-0">
        {message && <span>{message}</span>}
        {children}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`shrink-0 ml-2 rounded-lg p-0.5 transition-colors hover:bg-black/5 cursor-pointer ${v.iconColor}`}
          aria-label={t("common.close")}
        >
          <i className="ri-close-line text-lg" />
        </button>
      )}
    </div>
  );
}
