import { useState, useCallback, useEffect } from "react";
import { apiSendMessage } from "../../services/message.service";
import { apiFindOrCreateConversation } from "../../services/conversation.service";
import { uploadMessageImage } from "../../services/cloudinary.service";
import { buildFailedMessage } from "../../utils/messaging/buildFailedMessage";
import { buildOptimisticConversation } from "../../utils/messaging/buildOptimisticConversation";
import { showToast } from "../../utils/toast";
import useOfflineQueue from "./useOfflineQueue";

export default function useMessageActions({
  profile,
  activeConversation,
  activeUser,
  setActiveConversation,
  setActiveUser,
  setSearchParams,
  message,
  clearCurrentDraft,
}) {
  const [failedMessages, setFailedMessages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    queuedMessages,
    enqueueMessage,
    removeMessage,
    getRetryableMessages,
  } = useOfflineQueue();

  // Merge queued messages into failedMessages on mount
  useEffect(() => {
    if (queuedMessages.length > 0) {
      setFailedMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newQueued = queuedMessages.filter((m) => !existingIds.has(m.id));
        return newQueued.length > 0 ? [...prev, ...newQueued] : prev;
      });
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    async (activeImg = null, replyTo = null) => {
      const text = message.trim();

      if (!text && !activeImg) return;

      if (!profile?.uid) {
        showToast.error("You must be logged in to send a message.");
        return;
      }

      let conversationId = activeConversation?.id;
      let stage = "prepare";

      if (!conversationId && !activeUser?.uid) {
        showToast.error("No user selected.");
        return;
      }

      if (!navigator.onLine) {
        const failedMessage = buildFailedMessage({
          conversationId,
          senderId: profile.uid,
          text,
          image: activeImg,
          error: "No internet connection",
          stage: "offline",
        });

        setFailedMessages((prev) => [...prev, failedMessage]);
        enqueueMessage(failedMessage);
        clearCurrentDraft();
        showToast.error("Unable to send. No internet connection.");
        return;
      }

      try {
        if (activeImg) setUploadingImage(true);

        if (!conversationId) {
          stage = "create-conversation";
          conversationId = await apiFindOrCreateConversation(activeUser.uid);
        }

        let imageUrl = null;
        let imageId = null;

        if (activeImg?.file) {
          stage = "upload-image";
          const uploaded = await uploadMessageImage(activeImg.file);
          imageUrl = uploaded?.url || null;
          imageId = uploaded?.publicId || null;
        }

        stage = "send-message";

        await apiSendMessage({
          conversationId,
          text,
          type: activeImg ? "image" : "text",
          imageUrl,
          imageId,
          replyTo: replyTo?.messageId || replyTo || null,
          replyToSnapshot: replyTo && typeof replyTo === "object" ? replyTo : null,
        });

        if (!activeConversation?.id) {
          setActiveConversation(
            buildOptimisticConversation({
              conversationId,
              currentUser: profile,
              otherUser: activeUser,
            }),
          );
          setActiveUser(null);
          setSearchParams({ conversation: conversationId }, { replace: true });
        }

        clearCurrentDraft();
      } catch (error) {
        console.error(`[Messages] Failed during "${stage}":`, error);

        const failedMessage = buildFailedMessage({
          conversationId,
          senderId: profile.uid,
          text,
          image: activeImg,
          error: error.message,
          stage,
        });

        setFailedMessages((prev) => [...prev, failedMessage]);
        enqueueMessage(failedMessage);
        clearCurrentDraft();

        if (error.code === "permission-denied") {
          showToast.error(
            `Message blocked by Firestore permissions (${stage}).`,
          );
        } else {
          showToast.error(error.message || "Unable to send message.");
        }
      } finally {
        setUploadingImage(false);
      }
    },
    [
      profile,
      activeConversation,
      activeUser,
      message,
      setActiveConversation,
      setActiveUser,
      setSearchParams,
      clearCurrentDraft,
      enqueueMessage,
    ],
  );

  const retryMessage = useCallback(
    async (failedMessage) => {
      setFailedMessages((prev) =>
        prev.filter((m) => m.id !== failedMessage.id),
      );
      removeMessage(failedMessage.id);

      if (!navigator.onLine) {
        setFailedMessages((prev) => [...prev, failedMessage]);
        enqueueMessage(failedMessage);
        showToast.error("Unable to send. No internet connection.");
        return;
      }

      if (
        failedMessage.type === "image" &&
        (!failedMessage.imageUrl ||
          failedMessage.imageUrl.startsWith("blob:"))
      ) {
        setFailedMessages((prev) => [...prev, failedMessage]);
        showToast.error("Please select the image again before retrying.");
        return;
      }

      let stage = "prepare";

      try {
        let conversationId = failedMessage.conversationId;

        if (!conversationId || conversationId === "temp") {
          conversationId = activeConversation?.id;
        }

        if (!conversationId && activeUser?.uid) {
          stage = "create-conversation";
          conversationId = await apiFindOrCreateConversation(activeUser.uid);
        }

        if (!conversationId) {
          throw new Error("No conversation found.");
        }

        stage = "send-message";

        await apiSendMessage({
          conversationId,
          text: failedMessage.text || "",
          type: failedMessage.type || "text",
          imageUrl: failedMessage.imageUrl?.startsWith("blob:")
            ? null
            : failedMessage.imageUrl || null,
          imageId: failedMessage.imageId || null,
        });

        if (!activeConversation?.id) {
          setSearchParams(
            { conversation: conversationId },
            { replace: true },
          );
        }
      } catch (error) {
        console.error(
          `[Messages] Retry failed during "${stage}":`,
          error,
        );

        const retryFailed = {
          ...failedMessage,
          error: error.message || "Failed to retry message",
          stage,
        };

        setFailedMessages((prev) => [...prev, retryFailed]);
        enqueueMessage(retryFailed);

        if (error.code === "permission-denied") {
          showToast.error(
            `Message blocked by Firestore permissions (${stage}).`,
          );
        } else {
          showToast.error(error.message || "Unable to send message.");
        }
      }
    },
    [activeConversation, activeUser, setSearchParams, removeMessage, enqueueMessage],
  );

  const deleteFailedMessage = useCallback(
    (id) => {
      setFailedMessages((prev) => prev.filter((m) => m.id !== id));
      removeMessage(id);
    },
    [removeMessage],
  );

  // Auto-retry queued messages when coming back online
  useEffect(() => {
    if (!navigator.onLine) return;

    const retryable = getRetryableMessages();
    if (retryable.length === 0) return;

    const timer = setTimeout(() => {
      retryable.forEach((msg) => {
        retryMessage(msg);
      });
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigator.onLine]);

  return {
    failedMessages,
    setFailedMessages,
    uploadingImage,
    sendMessage,
    retryMessage,
    deleteFailedMessage,
  };
}
