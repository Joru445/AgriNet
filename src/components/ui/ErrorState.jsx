export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
  className = "",
}) {
  return (
    <div className={`rounded-2xl border border-red-200 bg-red-50 p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <i className="ri-error-warning-line text-xl text-red-500 shrink-0 mt-0.5" />

        <div className="flex-1">
          <h2 className="font-semibold text-red-800">{title}</h2>

          {message && (
            <p className="mt-1 text-sm text-red-600">{message}</p>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 cursor-pointer"
            >
              {retryLabel}
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
    <div className={`mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}>
      <i className="ri-error-warning-line text-lg" />
      <span>{message}</span>
    </div>
  );
}
