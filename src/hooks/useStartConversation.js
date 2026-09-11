import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMessagesPath } from "../utils/routes";
import { setCachedUserProfile } from "../utils/userProfileCache";

export default function useStartConversation() {
  const navigate = useNavigate();
  const { user, authInitializing, identity } = useAuth();

  return function startConversation(otherUser) {
    // Wait for Firebase Auth initialization: a null user during this window is
    // NOT a guest and must not be bounced to Login.
    if (authInitializing) return;

    // Firebase Auth is the source of truth. A signed-in user — even offline,
    // with a still-pending Firestore profile — may start a conversation;
    // identity provides a safe role fallback.
    if (!user) {
      navigate("/login");
      return;
    }

    if (otherUser && (otherUser.uid || otherUser.id)) {
      const uid = otherUser.uid || otherUser.id;
      setCachedUserProfile(uid, {
        uid,
        ...otherUser,
        profilePicture: otherUser.profilePicture || "",
      });

      const messagesPath = getMessagesPath(identity?.role || "");
      navigate(`${messagesPath}?user=${uid}`);
    }
  };
}