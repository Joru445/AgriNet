import { useEffect, useMemo, useRef, useState } from "react";
import { checkUsernameAvailability } from "../services/user.service";
import { RESERVED_USERNAMES, USERNAME_REGEX } from "../utils/registerValidation";

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 30);
}

export function usernameSuggestions(fullname) {
  const parts = String(fullname || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (!parts.length) return [];
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return [...new Set([normalize(`${first}${last}`), normalize(`${first}.${last}`), normalize(`${first}_${last}`)])]
    .filter((candidate) => USERNAME_REGEX.test(candidate) && !RESERVED_USERNAMES.has(candidate));
}

export default function useUsernameAvailability(value, { currentUsername = "", enabled = true, delay = 350 } = {}) {
  const username = useMemo(() => normalize(value), [value]);
  const current = normalize(currentUsername);
  const requestId = useRef(0);
  const [state, setState] = useState({ checking: false, available: null, reason: null });
  useEffect(() => {
    const id = ++requestId.current;
    if (!enabled || !username || username === current) {
      setState({ checking: false, available: username === current && Boolean(username), reason: null });
      return undefined;
    }
    if (!USERNAME_REGEX.test(username) || RESERVED_USERNAMES.has(username)) {
      setState({ checking: false, available: false, reason: RESERVED_USERNAMES.has(username) ? "reserved" : "invalid" });
      return undefined;
    }
    setState({ checking: true, available: null, reason: null });
    const timer = setTimeout(() => {
      checkUsernameAvailability(username).then((result) => {
        if (id === requestId.current) setState({ checking: false, available: result.available, reason: result.reason });
      }).catch(() => {
        if (id === requestId.current) setState({ checking: false, available: null, reason: "unavailable" });
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [current, delay, enabled, username]);
  return { username, ...state };
}
