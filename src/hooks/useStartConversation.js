import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMessagesPath } from "../utils/routes";
import { setCachedUserProfile } from "../utils/userProfileCache";

export default function useStartConversation() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return function startConversation(otherUser) {
    if (otherUser && (otherUser.uid || otherUser.id)) {
      const uid = otherUser.uid || otherUser.id;
      setCachedUserProfile(uid, {
        uid,
        ...otherUser,
        profilePicture: otherUser.profilePicture || "",
      });

      const messagesPath = getMessagesPath(profile?.role);
      navigate(`${messagesPath}?user=${uid}`);
    }
  };
}
