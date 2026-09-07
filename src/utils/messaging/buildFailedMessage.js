export function buildFailedMessage({
  conversationId,
  senderId,
  receiverId,
  text,
  image,
  error,
  stage,
  replyTo,
}) {
  return {
    id: `failed_${Date.now()}`,
    conversationId: conversationId || "temp",
    senderId: senderId || null,
    receiverId: receiverId || null,
    text,
    type: image ? "image" : "text",
    imageUrl: image?.previewUrl || null,
    imageId: null,
    status: "failed",
    error: error || "Failed to send message",
    stage,
    replyTo: replyTo || null,
    createdAt: {
      seconds: Math.floor(Date.now() / 1000),
    },
  };
}
