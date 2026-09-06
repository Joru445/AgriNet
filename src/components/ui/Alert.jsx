import { useLanguage } from "../../context/LanguageContext";

const VARIANTS = {
  success: {
    icon: "ri-check-line",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    iconColor: "text-green-500",
  },
  error: {
    icon: "ri-error-warning-line",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-500",
  },
  warning: {
    icon: "ri-alert-line",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-500",
  },
  info: {
    icon: "ri-information-line",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
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
