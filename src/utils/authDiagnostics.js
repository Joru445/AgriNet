const STORAGE_KEY = "agrinet_auth_diagnostics_v1";
const MAX_EVENTS = 20;

// Development-only, privacy-safe lifecycle breadcrumbs. Do not add UID, email,
// provider credentials, passwords, ID tokens, or refresh tokens here.
export function recordAuthDiagnostic(event, details = {}) {
  if (!import.meta.env.DEV) return;
  try {
    const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const history = Array.isArray(previous) ? previous : [];
    const safeDetails = {
      code: typeof details.code === "string" ? details.code : undefined,
      reason: typeof details.reason === "string" ? details.reason : undefined,
      hasSession: Boolean(details.hasSession),
    };
    history.push({ at: new Date().toISOString(), event, ...safeDetails });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_EVENTS)));
    console.info("[auth]", event, safeDetails);
  } catch {
    // Diagnostics must never change authentication behaviour.
  }
}
