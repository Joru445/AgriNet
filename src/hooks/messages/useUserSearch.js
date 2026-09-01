import { useState, useEffect } from "react";
import { searchUsers } from "../../services/user.service";

export default function useUserSearch(uid, conversations) {
  const [search, setSearch] = useState("");
  const [userResults, setUserResults] = useState([]);

  const searching = search.trim().length > 0;

  useEffect(() => {
    if (!uid) return;

    async function loadSearch() {
      if (!search.trim()) {
        setUserResults([]);
        return;
      }

      try {
        const users = await searchUsers(search, uid);

        const conversationUserIds = new Set(
          conversations
            .map((conversation) => conversation.otherUser?.uid)
            .filter(Boolean),
        );

        setUserResults(
          users.filter((user) => !conversationUserIds.has(user.uid)),
        );
      } catch (error) {
        console.error("Failed to search users:", error);
        setUserResults([]);
      }
    }

    loadSearch();
  }, [search, conversations, uid]);

  return { search, setSearch, userResults, searching };
}
