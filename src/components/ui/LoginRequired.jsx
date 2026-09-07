import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function LoginRequired({ title, description }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-lg px-4 py-16 md:py-24 text-center">
      <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-8 md:p-12 shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#2D6A4F]/10">
          <i className="ri-lock-line text-3xl text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-[var(--agri-text)] mb-2">
          {title || t("loginRequired.title")}
        </h1>

        <p className="text-sm md:text-base text-[var(--agri-text-muted)] mb-8 max-w-sm mx-auto">
          {description || t("loginRequired.description")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1B4332] w-full sm:w-auto"
          >
            <i className="ri-login-box-line" />
            {t("guest.login")}
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--agri-border)] bg-transparent px-6 py-3 text-sm font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] w-full sm:w-auto"
          >
            {t("loginRequired.register")}
          </Link>
        </div>
      </div>
    </main>
  );
}
