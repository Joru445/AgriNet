import { auth } from "../../firebase/auth";
import { getCurrentDeviceSessionId } from "../deviceSession.service";
import { buildApiUrl } from "./api.client";

function notifySessionRevoked(code) {
  globalThis.dispatchEvent?.(new CustomEvent("agrinet:device-session-revoked", {
    detail: { uid: auth.currentUser?.uid || null, code },
  }));
}

/**
 * SSE over fetch, rather than EventSource, so neither the Firebase bearer
 * token nor the device-session handle ever appears in a URL or query string.
 */
export function subscribeToRealtime(endpoint, onSnapshot, onError = () => {}) {
  const controller = new AbortController();
  let closed = false;
  let retryTimer = null;
  let attempts = 0;

  const retry = () => {
    if (closed || (typeof navigator !== "undefined" && !navigator.onLine)) return;
    const delay = Math.min(30_000, 750 * 2 ** attempts) + Math.floor(Math.random() * 400);
    attempts += 1;
    retryTimer = setTimeout(connect, delay);
  };

  const connect = async () => {
    retryTimer = null;
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      const sessionId = getCurrentDeviceSessionId(user?.uid);
      if (!token || !sessionId) throw new Error("A current device session is required.");

      const response = await fetch(buildApiUrl(endpoint), {
        headers: { Authorization: `Bearer ${token}`, "X-AgriNet-Session": sessionId, Accept: "text/event-stream" },
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error(`Realtime connection failed (${response.status}).`);
      attempts = 0;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (!closed) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() || "";
        for (const frame of frames) {
          const event = frame.match(/^event: (.+)$/m)?.[1];
          const raw = frame.match(/^data: (.+)$/m)?.[1];
          if (!event || !raw) continue;
          const data = JSON.parse(raw);
          if (event === "snapshot") onSnapshot(data);
          if (event === "session-revoked") {
            notifySessionRevoked(data.code);
            return;
          }
          if (event === "error") onError(Object.assign(new Error("Realtime stream failed."), { code: data.code }));
        }
      }
      retry();
    } catch (error) {
      if (!closed && error.name !== "AbortError") {
        onError(error);
        retry();
      }
    }
  };

  const resume = () => { if (!closed && !retryTimer) connect(); };
  window.addEventListener("online", resume);
  connect();

  return () => { closed = true; clearTimeout(retryTimer); window.removeEventListener("online", resume); controller.abort(); };
}
