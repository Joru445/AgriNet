import { useLanguage } from "../../context/LanguageContext";

export default function ConsumerProfileDetails({ profile }) {
  const { t } = useLanguage();

  if (!profile) return null;

  return (
    <section className="border-t border-(--agri-border-subtle) pt-6 px-4">
      <h2 className="flex items-center gap-2 text-base font-bold text-(--agri-text)">
        <i className="ri-user-3-line text-[#2D6A4F] dark:text-(--agri-brand)" />
        {t("consumerProfile.about")}
      </h2>
      <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-(--agri-text-secondary) sm:text-base">
        {profile.bio || t("consumerProfile.noBioYet")}
      </p>
    </section>
  );
}
