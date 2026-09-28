import { auth } from "../../firebase/auth";

const RAW_API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

// In browser and dev environment, prefer the same-origin server proxy (/api)
// to prevent cross-origin CORS failures ("TypeError: Failed to fetch").
const API_URL =
  typeof window !== "undefined" && (RAW_API_URL.startsWith("http") || !RAW_API_URL)
    ? "/api"
    : RAW_API_URL;

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

export async function apiRequest(endpoint, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
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
    } catch {
      // Continue without token if auth state is unready or offline
    }
  }

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const cleanEndpoint = endpoint.startsWith("/api/")
        ? endpoint.slice(4)
        : endpoint;

      // Prefer the local /api proxy; if that returns 404 in static hosting, try RAW_API_URL
      const baseUrl =
        attempt > 0 && lastError?.status === 404 && RAW_API_URL.startsWith("http")
          ? RAW_API_URL
          : API_URL;

      const url = `${baseUrl}${cleanEndpoint.startsWith("/") ? "" : "/"}${cleanEndpoint}`;
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
