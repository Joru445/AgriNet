export function buildFailedMessage({
  conversationId,
  senderId,
  text,
  image,
  error,
  stage,
}) {
  return {
    id: `failed_${Date.now()}`,
    conversationId: conversationId || "temp",
    senderId: senderId || null,
    text,
    type: image ? "image" : "text",
    imageUrl: image?.previewUrl || null,
    imageId: null,
    status: "failed",
    error: error || "Failed to send message",
    stage,
    createdAt: {
      seconds: Math.floor(Date.now() / 1000),
    },
  };
}
