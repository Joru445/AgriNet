/**
 * Normalize API errors into user-friendly messages.
 *
 * API errors thrown by `apiRequest` have:
 *   - error.status: HTTP status code (400, 401, 403, 404, 409, 429, 500, etc.)
 *   - error.data: parsed JSON response body
 *   - error.message: backend error message string
 *
 * This utility maps status codes to safe, user-friendly messages.
 * Raw backend error messages are NEVER returned to the user.
 */

const STATUS_MESSAGES = {
  400: "errors.badRequest",
  401: "errors.unauthorized",
  403: "errors.forbidden",
  404: "errors.notFound",
  409: "errors.conflict",
  429: "errors.tooManyRequests",
  500: "errors.server",
  502: "errors.server",
  503: "errors.server",
};

const NETWORK_MESSAGE = "errors.network";

/**
 * Get a user-friendly message key for an error.
 *
 * @param {Error} error - The caught error (from apiRequest, fetch, etc.)
 * @returns {string} An i18n translation key (e.g., "errors.badRequest")
 */
export function getErrorKey(error) {
  if (!error) return "errors.generic";

  if (error.name === "TypeError" || error.name === "AbortError" ||
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("NetworkError")) {
    return NETWORK_MESSAGE;
  }

  if (error.status) {
    return STATUS_MESSAGES[error.status] || "errors.generic";
  }

  return "errors.generic";
}

/**
 * Get a user-friendly message string for an error.
 * Falls back to a generic message if translation key is missing.
 *
 * @param {Error} error - The caught error
 * @param {Function} t - i18n translation function
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error, t) {
  const key = getErrorKey(error);
  return t ? t(key) : key;
}
