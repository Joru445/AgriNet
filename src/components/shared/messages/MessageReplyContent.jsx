import { useLanguage } from "../../../context/LanguageContext";
import { extractDomain } from "../../../utils/linkPreview";
import { isCloudinaryUrl, applyTransform, THUMB_SM_TF } from "../../../utils/cloudinaryTransform";
import defaultAvatar from "../../../assets/img/defaultAvatar.png";

export default function MessageReplyContent({ replyTo }) {
  const { t } = useLanguage();

  if (!replyTo) return null;

  const type = replyTo.type || "text";

  if (replyTo.imageUrl) {
    const src = isCloudinaryUrl(replyTo.imageUrl)
      ? applyTransform(replyTo.imageUrl, THUMB_SM_TF)
      : replyTo.imageUrl;

    return (
      <span className="flex items-center gap-1.5 min-w-0">
        <img
          src={src}
          alt=""
          onError={(e) => { e.currentTarget.src = defaultAvatar; }}
          className="h-6 w-6 shrink-0 rounded object-cover"
        />
        <span className="truncate text-xs">
          {replyTo.textSnapshot || t("messages.photo")}
        </span>
      </span>
    );
  }

  if (type === "product_inquiry") {
    return (
      <span className="truncate text-xs">
        {replyTo.quantity != null
          ? `${t("messages.quantityRequested")}: ${replyTo.quantity}`
          : replyTo.textSnapshot || t("productInquiryMsg.title")}
      </span>
    );
  }

  if (type === "link") {
    const domain = replyTo.url ? extractDomain(replyTo.url) : null;
    return (
      <span className="truncate text-xs">
        {replyTo.textSnapshot || domain || replyTo.url}
      </span>
    );
  }

  return (
    <span className="truncate text-xs">
      {replyTo.textSnapshot || t("messages.replyPreviewMedia")}
    </span>
  );
}