import { useConversationsContext } from "../../context/ConversationsContext";

/**
 * Returns the shared conversation list from ConversationsContext.
 *
 * The single onSnapshot subscription lives in ConversationsProvider.
 * Profile enrichment is also handled there.
 */
export default function useConversationList() {
  const { conversations, loading } = useConversationsContext();

  return { conversations, loading };
}
