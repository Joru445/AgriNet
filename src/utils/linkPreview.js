/**
 * Link-preview helper utilities.
 *
 * NOTE: AgriNet is a client-only (Vite React + Firebase) app with no backend,
 * so we never fetch arbitrary website metadata from the browser (CORS).
 * Instead, optional `linkPreview` metadata can be embedded on a message when it
 * is created (e.g. by a future server-side envelope). These helpers let the UI
 * render rich previews when metadata is present, and fall back to a simple,
 * safe, clickable link otherwise.
 */

const URL_REGEX =
  /(https?:\/\/[^\s<>"')\]]+)/gi;

/**
 * Extract the first URL from a block of text, or null if none.
 */
export function extractFirstUrl(text) {
  if (!text) return null;
  const match = String(text).match(URL_REGEX);
  if (!match) return null;
  const url = match[0].replace(/[.,!?;:]+$/, "");
  return url || null;
}

/**
 * Normalize a URL so trailing punctuation doesn't break the link.
 */
export function normalizeUrl(url) {
  if (!url) return null;
  return String(url).replace(/[.,!?;:]+$/, "").trim() || null;
}

/**
 * Extract a displayable site name from a URL, e.g. "www.youtube.com".
 */
export function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname || null;
  } catch {
    const cleaned = String(url || "").replace(/[.,!?;:]+$/, "");
    const match = cleaned.match(/^(?:https?:\/\/)?([^/?#]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Only allow http/https links to be opened.
 */
export function isSafeUrl(url) {
  if (!url) return false;
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    const normalized = String(url || "").trim();
    return /^https?:\/\//i.test(normalized);
  }
}

/**
 * Snapshot builder for reply quote link references. Uses metadata already
 * available on the message — no external fetch.
 */
export function buildLinkReplySnapshot(message) {
  const url = extractFirstUrl(message?.text);
  if (!url) return null;
  return {
    url,
    title: message?.linkPreview?.title || extractDomain(url) || url,
    image: message?.linkPreview?.image || null,
  };
}