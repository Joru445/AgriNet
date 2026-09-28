import { auth } from "../../firebase/auth";

// import.meta.env.DEV is true for `vite dev` and false for `vite build`.
//
// - Development: requests go to the same-origin "/api" prefix, which the Vite
//   dev server proxies to the backend (see server.proxy in vite.config.js).
//   Same-origin keeps development free of CORS preflight failures.
// - Production (static hosting, e.g. GitHub Pages): there is no dev proxy, so
//   requests go straight to VITE_API_URL. VITE_API_URL is required for
//   production builds (enforced in vite.config.js and the deploy workflow).
const IS_DEV = import.meta.env.DEV;
const RAW_API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

if (!IS_DEV && !RAW_API_URL) {
  throw new Error(
    "[api] VITE_API_URL is required for production builds. " +
      "Set it to the backend base URL, e.g. https://agrinet-backend-c8w7.onrender.com/api",
  );
}

const API_URL = IS_DEV ? "/api" : RAW_API_URL;

const DEFAULT_TIMEOUT = 15_000;
const MAX_RETRIES = 2;

function isNetworkError(error) {
  return (
    error.name === "TypeError" ||
    error.name === "AbortError" ||
    error.message?.includes("Failed to fetch") ||
    error.message?.includes("NetworkError")
  );
}

function isRetryable(status) {
  return status >= 500 || status === 429;
}

/**
 * Join the API base with an endpoint path without duplicating "/api".
 *
 * The base already carries the "/api" segment ("/api" behind the dev proxy,
 * "https://host/api" in production), so an endpoint may be written either as
 * "/v1/..." or as "/api/v1/..." — both resolve to "<base>/v1/...".
 */
function buildUrl(endpoint) {
  const raw = String(endpoint ?? "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;

  if (/\/api$/.test(API_URL)) {
    if (path === "/api") return API_URL;
    if (path.startsWith("/api/")) return `${API_URL}${path.slice(4)}`;
  }

  return `${API_URL}${path}`;
}

async function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Perform a JSON API request.
 *
 * @param {string} endpoint Path below the API base, e.g. "/v1/products".
 * @param {object} [options]
 * @param {number} [options.timeout] Request timeout in milliseconds.
 * @param {number} [options.retries] Retries for network / 5xx / 429 failures.
 * @param {boolean} [options.requireAuth=true] When true and a user is signed
 *   in, a failed Firebase ID token retrieval aborts the request instead of
 *   silently sending it without credentials. Set to false for public
 *   endpoints, which may proceed unauthenticated.
 * @returns {Promise<any>} Parsed JSON response body.
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    requireAuth = true,
    ...fetchOptions
  } = options;

  const currentUser = auth.currentUser;

  const headers = new Headers(fetchOptions.headers);

  headers.set("Content-Type", "application/json");

  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (cause) {
      if (requireAuth) {
        const authError = new Error(
          "Failed to retrieve the authentication token for a protected API request.",
        );
        authError.name = "AuthError";
        authError.status = 401;
        authError.cause = cause;
        throw authError;
      }

      console.warn(
        `[api] Proceeding without Authorization for ${endpoint}:`,
        cause,
      );
    }
  }

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = buildUrl(endpoint);
      const response = await fetchWithTimeout(
        url,
        { ...fetchOptions, headers },
        timeout,
      );

      let data;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const error = new Error(
          data?.message || `API request failed with status ${response.status}`,
        );
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      lastError = error;

      if (
        attempt < retries &&
        (isNetworkError(error) || (error.status && isRetryable(error.status)))
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2 ** attempt * 500),
        );
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}
