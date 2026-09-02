import { useLanguage } from "../../../context/LanguageContext";

export default function EmptyConversation() {
  const { t } = useLanguage();

  return (
    <section className="hidden flex-1 md:flex items-center justify-center bg-[var(--agri-hover)]">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#2D6A4F]/10 flex items-center justify-center mb-5">
          <i className="ri-chat-3-line text-4xl text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
        </div>

        <h2 className="text-xl font-semibold text-[var(--agri-text)]">
          {t("messages.selectConversation")}
        </h2>

        <p className="text-[var(--agri-text-muted)] mt-2">
          {t("messages.selectConversationSubtitle")}
        </p>
      </div>
    </section>
  );
}
