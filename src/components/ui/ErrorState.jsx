import { useLanguage } from "../../context/LanguageContext";

export default function ErrorState({
  title,
  message,
  onRetry,
  retryLabel,
  className = "",
}) {
  const { t } = useLanguage();
  const resolvedTitle = title ?? t("ui.errorTitle");
  const resolvedRetryLabel = retryLabel ?? t("ui.retry");

  return (
    <div className={`rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-5 anim-slide-in-up ${className}`}>
      <div className="flex items-start gap-3">
        <i className="ri-error-warning-line text-xl text-red-500 shrink-0 mt-0.5" />

        <div className="flex-1">
          <h2 className="font-semibold text-red-800 dark:text-red-300">{resolvedTitle}</h2>

          {message && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 cursor-pointer"
            >
              {resolvedRetryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function InlineError({ message, className = "" }) {
  if (!message) return null;

  return (
    <div className={`mb-5 flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300 ${className}`}>
      <i className="ri-error-warning-line text-lg" />
      <span>{message}</span>
    </div>
  );
}
