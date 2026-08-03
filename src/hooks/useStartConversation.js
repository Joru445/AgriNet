import { useNavigate } from "react-router-dom";

export default function useStartConversation() {
  const navigate = useNavigate();

  return function startConversation(otherUser) {
    navigate(`/messages?user=${otherUser.uid}`);
  };
}
