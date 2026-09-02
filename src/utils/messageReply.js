import { extractFirstUrl } from "./linkPreview";

/**
 * Builds the reply snapshot object sent to the reply composer. This is shared
 * by both desktop (hover Reply button) and mobile (swipe-to-reply) paths so
 * the reply payload stays identical regardless of how it was triggered.
 */
export function buildReplySnapshot({ message, user, currentUserId }) {
  const isOwn = message?.senderId === currentUserId;

  const senderName = isOwn ? null : user?.fullname || user?.username || null;

  const isImageMsg =
    message?.type === "image" || Boolean(message?.imageUrl);
  const linkUrl = extractFirstUrl(message?.text);

  const replyType = message?.type === "product_inquiry"
    ? "product_inquiry"
    : isImageMsg
      ? "image"
      : linkUrl
        ? "link"
        : "text";

  return {
    messageId: message.id,
    senderId: message.senderId,
    type: replyType,
    textSnapshot: message.text || "",
    imageUrl: isImageMsg ? message.imageUrl || null : null,
    productId: message.productId || null,
    quantity: message.quantity ?? null,
    inquiryStatus: message.inquiryStatus || null,
    url: linkUrl || null,
    senderName: isOwn && !senderName ? null : senderName,
  };
}