import { useLanguage } from "../../../context/LanguageContext";

/**
 * Small, reusable "Reply" affordance shown beside a message bubble on
 * desktop (hover/focus). Rendered in the empty row space — it never affects
 * the bubble's size or position, so it can't cause layout shifts.
 */
export default function MessageReplyButton({ onClick, className = "" }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("messages.reply")}
      title={t("messages.reply")}
      className={`flex h-7 w-7 items-center justify-center rounded-full bg-[#2D6A4F] text-white shadow-sm transition hover:bg-[#1B4332] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D6A4F] sm:h-8 sm:w-8 ${className}`}
    >
      <i className="ri-corner-up-left-line text-base sm:text-lg" />
    </button>
  );
}