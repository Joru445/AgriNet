import { useState, useCallback } from "react";
import { sendMessage as sendMessageService } from "../../services/message.service";
import { createConversation } from "../../services/conversation.service";
import { uploadMessageImage } from "../../services/cloudinary.service";
import { buildFailedMessage } from "../../utils/messaging/buildFailedMessage";
import { buildOptimisticConversation } from "../../utils/messaging/buildOptimisticConversation";
import { showToast } from "../../utils/toast";

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

  const sendMessage = useCallback(
    async (activeImg = null) => {
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
        clearCurrentDraft();
        showToast.error("Unable to send. No internet connection.");
        return;
      }

      try {
        if (activeImg) setUploadingImage(true);

        if (!conversationId) {
          stage = "create-conversation";
          conversationId = await createConversation(profile, activeUser);
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

        const receiverId =
          activeUser?.uid ||
          activeConversation?.otherUser?.uid ||
          null;

        await sendMessageService({
          conversationId,
          senderId: profile.uid,
          receiverId,
          text,
          type: activeImg ? "image" : "text",
          imageUrl,
          imageId,
        });

        if (!activeConversation?.id) {
          const otherUserInfo = activeUser || { uid: receiverId };
          setActiveConversation(
            buildOptimisticConversation({
              conversationId,
              currentUser: profile,
              otherUser: otherUserInfo,
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
    ],
  );

  const retryMessage = useCallback(
    async (failedMessage) => {
      setFailedMessages((prev) =>
        prev.filter((m) => m.id !== failedMessage.id),
      );

      if (!navigator.onLine) {
        setFailedMessages((prev) => [...prev, failedMessage]);
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
          conversationId = await createConversation(profile, activeUser);
        }

        if (!conversationId) {
          throw new Error("No conversation found.");
        }

        stage = "send-message";

        const receiverId =
          failedMessage.receiverId ||
          activeUser?.uid ||
          activeConversation?.otherUser?.uid ||
          null;

        await sendMessageService({
          conversationId,
          senderId: profile.uid,
          receiverId,
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

        setFailedMessages((prev) => [
          ...prev,
          {
            ...failedMessage,
            error: error.message || "Failed to retry message",
            stage,
          },
        ]);

        if (error.code === "permission-denied") {
          showToast.error(
            `Message blocked by Firestore permissions (${stage}).`,
          );
        } else {
          showToast.error(error.message || "Unable to send message.");
        }
      }
    },
    [profile, activeConversation, activeUser, setSearchParams],
  );

  const deleteFailedMessage = useCallback((id) => {
    setFailedMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    failedMessages,
    setFailedMessages,
    uploadingImage,
    sendMessage,
    retryMessage,
    deleteFailedMessage,
  };
}
