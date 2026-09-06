import { useLanguage } from "../../../context/LanguageContext";

export default function ProductLoadError({ onRetry, className = "" }) {
  const { t } = useLanguage();

  return (
    <div className={`py-20 text-center anim-slide-in-up ${className}`}>
      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
        <i className="ri-error-warning-line text-4xl text-red-400" />
      </div>

      <h3 className="text-xl font-bold text-gray-800">
        {t("consumer.productLoadError")}
      </h3>

      <p className="mt-2 text-gray-500">
        {t("consumer.productLoadErrorHint")}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#2D6A4F] bg-white px-5 py-2.5 text-sm font-bold text-[#2D6A4F] transition-all hover:bg-[#E8F5EE] cursor-pointer"
        >
          <i className="ri-refresh-line" />
          {t("ui.retry")}
        </button>
      )}
    </div>
  );
}
