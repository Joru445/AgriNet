import { useLanguage } from "../../context/LanguageContext";
import Button from "./Button";

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
    <div className={`rounded-2xl border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 p-5 anim-slide-in-up shadow-2xs ${className}`}>
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 text-lg">
          <i className="ri-error-warning-line" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-red-900 dark:text-red-200 text-sm sm:text-base">
            {resolvedTitle}
          </h2>

          {message && (
            <p className="mt-1 text-xs sm:text-sm text-red-700 dark:text-red-300/90 leading-relaxed">
              {message}
            </p>
          )}

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3.5 border-red-300 text-red-700 hover:bg-red-500/10 dark:border-red-500/40 dark:text-red-300"
            >
              {resolvedRetryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function InlineError({ message, className = "" }) {
  if (!message) return null;

  return (
    <div className={`mb-4 flex items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-500/5 dark:bg-red-500/10 px-3.5 py-2.5 text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium ${className}`}>
      <i className="ri-error-warning-line text-base text-red-500 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
