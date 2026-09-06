import { useLanguage } from "../../context/LanguageContext";

export default function MethodStep({ onSelectMethod }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3.5 w-full">
      {/* Google Option (Future Provider Placeholder) */}
      <button
        type="button"
        onClick={() => onSelectMethod?.("google")}
        className="group relative w-full py-2.5 sm:py-3 px-4 bg-white hover:bg-gray-50/90 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-full transition-all duration-200 text-sm flex items-center justify-between shadow-xs cursor-pointer"
        aria-label={t("auth.register.continueWithGoogle")}
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-gray-800 font-medium">
            {t("auth.register.continueWithGoogle")}
          </span>
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
          {t("auth.register.comingSoon")}
        </span>
      </button>

      {/* Facebook Option (Future Provider Placeholder) */}
      <button
        type="button"
        onClick={() => onSelectMethod?.("facebook")}
        className="group relative w-full py-2.5 sm:py-3 px-4 bg-white hover:bg-gray-50/90 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-full transition-all duration-200 text-sm flex items-center justify-between shadow-xs cursor-pointer"
        aria-label={t("auth.register.continueWithFacebook")}
      >
        <div className="flex items-center gap-3">
          <i className="ri-facebook-circle-fill text-[#1877F2] text-xl shrink-0" />
          <span className="text-gray-800 font-medium">
            {t("auth.register.continueWithFacebook")}
          </span>
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
          {t("auth.register.comingSoon")}
        </span>
      </button>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400 font-medium">
            {t("auth.register.orContinueWithEmail")}
          </span>
        </div>
      </div>

      {/* Continue with Email (Existing Flow) */}
      <button
        type="button"
        onClick={() => onSelectMethod?.("email")}
        className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer shadow-sm hover:shadow-md"
      >
        <i className="ri-mail-line text-base" />
        <span>{t("auth.register.continueWithEmail")}</span>
      </button>
    </div>
  );
}

