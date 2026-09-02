import { useLanguage } from "../../../context/LanguageContext";

export default function StoreAbout({ farmer }) {
  const { t } = useLanguage();

  if (!farmer.description?.trim()) return null;

  return (
    <section className="bg-[var(--agri-card)] rounded-2xl border border-[var(--agri-border)] p-6">
      <h2 className="text-xl font-semibold text-[#1B4332] dark:text-[var(--agri-brand-light)] mb-4">
        {t("storeProfile.aboutFarm")}
      </h2>

      <p className="leading-7 text-[var(--agri-text-secondary)] whitespace-pre-wrap">
        {farmer.description}
      </p>
    </section>
  );
}
