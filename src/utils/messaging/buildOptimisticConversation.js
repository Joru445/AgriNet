export function buildOptimisticConversation({
  conversationId,
  currentUser,
  otherUser,
}) {
  const receiverId = otherUser?.uid || null;

  return {
    id: conversationId,
    participants: [currentUser.uid, receiverId].filter(Boolean),
    participantInfo: {
      [currentUser.uid]: {
        fullname: currentUser.fullname || "",
        username: currentUser.username || "",
        profilePicture: currentUser.profilePicture || "",
        role: currentUser.role || "",
      },
      ...(receiverId
        ? {
            [receiverId]: {
              fullname: otherUser.fullname || "",
              username: otherUser.username || "",
              profilePicture: otherUser.profilePicture || "",
              role: otherUser.role || "",
            },
          }
        : {}),
    },
    otherUser,
    unreadCount: {},
  };
}
