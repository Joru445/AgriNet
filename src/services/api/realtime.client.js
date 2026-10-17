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
  let waitingForSession = false;

  const retry = () => {
    if (closed || waitingForSession || (typeof navigator !== "undefined" && !navigator.onLine)) return;
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
      if (!token || !sessionId) {
        waitingForSession = true;
        const error = Object.assign(new Error("A current device session is required."), { code: "SESSION_PENDING" });
        onError(error);
        return;
      }

      const response = await fetch(buildApiUrl(endpoint), {
        headers: { Authorization: `Bearer ${token}`, "X-AgriNet-Session": sessionId, Accept: "text/event-stream" },
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        let payload = null;
        try { payload = await response.json(); } catch { /* SSE errors may be empty. */ }
        const error = Object.assign(new Error(payload?.message || `Realtime connection failed (${response.status}).`), {
          status: response.status,
          code: payload?.code,
        });
        if (["SESSION_REVOKED", "SESSION_NOT_FOUND", "SESSION_BINDING_MISMATCH"].includes(error.code)) {
          notifySessionRevoked(error.code);
          return;
        }
        throw error;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedSnapshot = false;
      let streamFailed = false;
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
          let data;
          try { data = JSON.parse(raw); } catch (parseError) {
            onError(Object.assign(new Error("Malformed realtime event."), { code: "STREAM_INVALID_EVENT", cause: parseError }));
            streamFailed = true;
            break;
          }
          if (event === "snapshot") {
            receivedSnapshot = true;
            attempts = 0;
            onSnapshot(data);
          }
          if (event === "session-revoked") {
            notifySessionRevoked(data.code);
            return;
          }
          if (event === "error") {
            const error = Object.assign(new Error(data.message || "Realtime stream failed."), {
              code: data.code || "STREAM_ERROR",
              retryable: data.retryable !== false,
              status: data.status,
            });
            onError(error);
            streamFailed = true;
            break;
          }
        }
        if (streamFailed) break;
      }
      if (!closed && streamFailed) retry();
      else if (!closed && !receivedSnapshot) retry();
      else if (!closed) retry();
    } catch (error) {
      if (!closed && error.name !== "AbortError") {
        onError(error);
        retry();
      }
    }
  };

  const resume = () => { if (!closed && !retryTimer) connect(); };
  const resumeWhenSessionReady = (event) => {
    if (event.detail?.uid && event.detail.uid !== auth.currentUser?.uid) return;
    waitingForSession = false;
    attempts = 0;
    resume();
  };
  window.addEventListener("online", resume);
  globalThis.addEventListener?.("agrinet:device-session-ready", resumeWhenSessionReady);
  connect();

  return () => { closed = true; clearTimeout(retryTimer); window.removeEventListener("online", resume); globalThis.removeEventListener?.("agrinet:device-session-ready", resumeWhenSessionReady); controller.abort(); };
}
