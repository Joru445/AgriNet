import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--agri-page)] px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">404</p>

        <h1 className="mt-4 text-2xl font-bold text-[var(--agri-text)]">
          {t("notFound.title")}
        </h1>

        <p className="mt-2 text-[var(--agri-text-muted)]">
          {t("notFound.description")}
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-[#2D6A4F] px-5 py-3 font-medium text-white transition hover:bg-[#1B4332]"
        >
          {t("notFound.goHome")}
        </Link>
      </div>
    </main>
  );
}
