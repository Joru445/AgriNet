import { useLanguage } from "../../../context/LanguageContext";

export default function ProductLoadError({ onRetry, className = "" }) {
  const { t } = useLanguage();

  return (
    <div className={`py-20 text-center anim-slide-in-up ${className}`}>
      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
        <i className="ri-error-warning-line text-4xl text-red-400 dark:text-red-500" />
      </div>

      <h3 className="text-xl font-bold text-[var(--agri-text)]">
        {t("consumer.productLoadError")}
      </h3>

      <p className="mt-2 text-[var(--agri-text-muted)]">
        {t("consumer.productLoadErrorHint")}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#2D6A4F] bg-[var(--agri-card)] px-5 py-2.5 text-sm font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)] transition-all hover:bg-[#E8F5EE] dark:hover:bg-[var(--agri-brand-bg)] cursor-pointer"
        >
          <i className="ri-refresh-line" />
          {t("ui.retry")}
        </button>
      )}
    </div>
  );
}
