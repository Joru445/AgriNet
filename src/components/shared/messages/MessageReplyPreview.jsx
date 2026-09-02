import { useLanguage } from "../../../context/LanguageContext";
import MessageReplyContent from "./MessageReplyContent";

export default function MessageReplyPreview({ replyTo, onClear }) {
  const { t } = useLanguage();

  if (!replyTo) return null;

  return (
    <div className="relative flex items-center gap-3 pl-3 rounded-xl bg-[#E8F5EE] dark:bg-[var(--agri-brand-bg-alt)] border-l-4 border-[#2D6A4F] dark:border-[var(--agri-brand)] pr-2">
      <div className="flex items-center gap-2 min-w-0 flex-1 py-2">
        <i className="ri-corner-up-left-line text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />
        <div className="min-w-0 flex-1">
          <MessageReplyContent replyTo={replyTo} />
        </div>
      </div>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label={t("messages.cancelReply")}
          title={t("messages.cancelReply")}
          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-[var(--agri-text-muted)] hover:text-[var(--agri-text)] hover:bg-black/5 transition cursor-pointer"
        >
          <i className="ri-close-line text-lg" />
        </button>
      )}
    </div>
  );
}