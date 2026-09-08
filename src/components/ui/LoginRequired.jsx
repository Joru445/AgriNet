import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function LoginRequired({ title, description }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-lg px-4 py-12 md:py-20 text-center animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/90 dark:border-gray-700/80 bg-[var(--agri-card)] p-8 sm:p-12 shadow-2xl shadow-emerald-950/15 dark:shadow-black/60 ring-1 ring-black/5 dark:ring-white/10">
        {/* Subtle top accent highlight */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#2D6A4F] dark:via-emerald-400 to-transparent" />

        {/* Enhanced Lock Icon Badge with Ambient Glow and Shadow */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-[#2D6A4F]/20 dark:bg-emerald-500/25 blur-lg transform scale-90" />
          <div className="relative flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-2xl bg-[#E8F5EE] dark:bg-emerald-950/80 border border-[#2D6A4F]/30 dark:border-emerald-500/40 shadow-lg shadow-[#2D6A4F]/10 dark:shadow-black/40 text-[#2D6A4F] dark:text-emerald-400">
            <i className="ri-lock-2-line text-3xl sm:text-4xl" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--agri-text)] mb-2.5 tracking-tight">
          {title || t("loginRequired.title")}
        </h1>

        <p className="text-sm sm:text-base text-[var(--agri-text-muted)] mb-8 max-w-sm mx-auto leading-relaxed">
          {description || t("loginRequired.description")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] dark:bg-emerald-600 dark:hover:bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-98 w-full sm:w-auto"
          >
            <i className="ri-login-box-line text-base" />
            {t("guest.login")}
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:border-[#2D6A4F]/50 bg-gray-50/80 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 px-6 py-3 text-sm font-bold text-[var(--agri-text)] transition-all shadow-xs hover:shadow-sm active:scale-98 w-full sm:w-auto"
          >
            {t("loginRequired.register")}
          </Link>
        </div>
      </div>
    </main>
  );
}
