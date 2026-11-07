import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "agri_message_drafts";

function loadDrafts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    const cleaned = {};
    if (parsed && typeof parsed === "object") {
      Object.entries(parsed).forEach(([key, val]) => {
        if (typeof val === "string" && val.trim().length > 0) {
          cleaned[key] = val;
        }
      });
    }
    return cleaned;
  } catch {
    return {};
  }
}

export default function useDrafts(targetKeyOrKeys) {
  const targetKeys = useMemo(() => {
    if (!targetKeyOrKeys) return [];
    if (Array.isArray(targetKeyOrKeys)) return targetKeyOrKeys.filter(Boolean);
    return [targetKeyOrKeys].filter(Boolean);
  }, [targetKeyOrKeys]);

  const primaryKey = targetKeys[0] || null;

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
    if (!primaryKey) {
      setMessageState("");
      return;
    }

    setDrafts((prev) => {
      // Find if any alias key has a non-empty draft
      const foundKey = targetKeys.find(
        (k) => typeof prev[k] === "string" && prev[k].trim().length > 0,
      );
      const existingDraft = foundKey ? prev[foundKey] : "";
      setMessageState(existingDraft);

      // Consolidate aliases onto primaryKey and clean up obsolete aliases
      let changed = false;
      const next = { ...prev };
      targetKeys.forEach((k) => {
        if (k !== primaryKey && k in next) {
          delete next[k];
          changed = true;
        }
      });
      if (existingDraft && next[primaryKey] !== existingDraft) {
        next[primaryKey] = existingDraft;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [targetKeys, primaryKey]);

  const setMessage = useCallback(
    (value) => {
      setMessageState(value);

      if (!primaryKey) return;

      setDrafts((previous) => {
        const next = { ...previous };
        if (!value?.trim()) {
          let changed = false;
          targetKeys.forEach((k) => {
            if (k in next) {
              delete next[k];
              changed = true;
            }
          });
          return changed ? next : previous;
        }

        let changed = false;
        targetKeys.forEach((k) => {
          if (k !== primaryKey && k in next) {
            delete next[k];
            changed = true;
          }
        });
        if (next[primaryKey] !== value) {
          next[primaryKey] = value;
          changed = true;
        }
        return changed ? next : previous;
      });
    },
    [primaryKey, targetKeys],
  );

  const clearCurrentDraft = useCallback(() => {
    setMessageState("");

    if (targetKeys.length === 0) return;

    setDrafts((previous) => {
      const next = { ...previous };
      let changed = false;
      targetKeys.forEach((k) => {
        if (k in next) {
          delete next[k];
          changed = true;
        }
      });
      return changed ? next : previous;
    });
  }, [targetKeys]);

  return useMemo(
    () => ({ message, setMessage, drafts, clearCurrentDraft }),
    [message, drafts, setMessage, clearCurrentDraft],
  );
}
