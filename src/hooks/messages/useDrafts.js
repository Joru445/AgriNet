import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "agri_message_drafts";

function loadDrafts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export default function useDrafts(currentTargetKey) {
  const [drafts, setDrafts] = useState(loadDrafts);
  const [message, setMessageState] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (error) {
      console.error("Failed to save drafts to localStorage:", error);
    }
  }, [drafts]);

  useEffect(() => {
    if (currentTargetKey) {
      setMessageState(drafts[currentTargetKey] || "");
    } else {
      setMessageState("");
    }
  }, [currentTargetKey]);

  const setMessage = useCallback(
    (value) => {
      setMessageState(value);

      if (!currentTargetKey) return;

      setDrafts((previous) => {
        if (!value?.trim()) {
          const next = { ...previous };
          delete next[currentTargetKey];
          return next;
        }
        return { ...previous, [currentTargetKey]: value };
      });
    },
    [currentTargetKey],
  );

  const clearCurrentDraft = useCallback(() => {
    if (!currentTargetKey) return;

    setDrafts((previous) => {
      const next = { ...previous };
      delete next[currentTargetKey];
      return next;
    });
  }, [currentTargetKey]);

  return useMemo(
    () => ({ message, setMessage, drafts, clearCurrentDraft }),
    [message, drafts, setMessage, clearCurrentDraft],
  );
}
