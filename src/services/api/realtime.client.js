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

  (async () => {
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
    } catch (error) {
      if (!closed && error.name !== "AbortError") onError(error);
    }
  })();

  return () => { closed = true; controller.abort(); };
}
