import { useLanguage } from "../../../context/LanguageContext";
import { extractDomain } from "../../../utils/linkPreview";
import { isCloudinaryUrl, applyTransform, THUMB_SM_TF } from "../../../utils/cloudinaryTransform";
import defaultAvatar from "../../../assets/img/defaultAvatar.png";

export default function MessageReplyContent({ replyTo }) {
  const { t } = useLanguage();

  if (!replyTo) return null;

  const type = replyTo.type || "text";
  const label = replyTo.senderName || t("messages.replyingTo", { name: t("messages.replyToMessage") });

  if (replyTo.imageUrl) {
    const src = isCloudinaryUrl(replyTo.imageUrl)
      ? applyTransform(replyTo.imageUrl, THUMB_SM_TF)
      : replyTo.imageUrl;

    return (
      <span className="flex items-center gap-2 min-w-0">
        <img
          src={src}
          alt=""
          onError={(e) => { e.currentTarget.src = defaultAvatar; }}
          className="h-8 w-8 shrink-0 rounded-lg object-cover"
        />
        <span className="flex min-w-0 flex-col">
          <span className="font-bold truncate">{label}</span>
          <span className="truncate text-xs opacity-80">
            {replyTo.textSnapshot || t("messages.replyPreviewMedia")}
          </span>
        </span>
      </span>
    );
  }

  if (type === "product_inquiry") {
    return (
      <span className="flex items-center gap-2 min-w-0">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
          <i className="ri-file-list-3-line text-base" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="font-bold truncate">{t("productInquiryMsg.title")}</span>
          <span className="truncate text-xs opacity-80">
            {replyTo.quantity != null
              ? `${t("messages.quantityRequested")}: ${replyTo.quantity}`
              : replyTo.textSnapshot || t("productInquiryMsg.title")}
          </span>
        </span>
      </span>
    );
  }

  if (type === "link") {
    const domain = replyTo.url ? extractDomain(replyTo.url) : null;
    return (
      <span className="flex items-center gap-2 min-w-0">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
          <i className="ri-link text-base" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="font-bold truncate">{domain || label}</span>
          <span className="truncate text-xs opacity-80">{replyTo.url}</span>
        </span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 min-w-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
        <i className="ri-chat-1-line text-base" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-bold truncate">{label}</span>
        <span className="truncate text-xs opacity-80">
          {replyTo.textSnapshot || t("messages.replyPreviewMedia")}
        </span>
      </span>
    </span>
  );
}