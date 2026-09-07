import { useLanguage } from "../../../context/LanguageContext";
import MessageReplyContent from "./MessageReplyContent";

export default function MessageReplyPreview({ replyTo, onClear }) {
  const { t } = useLanguage();

  if (!replyTo) return null;

  const targetName = replyTo.senderName || t("messages.replyToMessage");

  return (
    <div className="relative flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[var(--agri-hover)]/80 dark:bg-[var(--agri-elevated)] border border-[var(--agri-border-subtle)]">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--agri-text)]">
          <span>{t("messages.replyingTo", { name: targetName })}</span>
        </div>
        <div className="mt-0.5 text-xs text-[var(--agri-text-muted)] truncate">
          <MessageReplyContent replyTo={replyTo} />
        </div>
      </div>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label={t("messages.cancelReply")}
          title={t("messages.cancelReply")}
          className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[var(--agri-text-muted)] hover:text-[var(--agri-text)] hover:bg-black/10 transition cursor-pointer"
        >
          <i className="ri-close-line text-base" />
        </button>
      )}
    </div>
  );
}