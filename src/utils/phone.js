/**
 * Philippine Mobile Number Normalization & Validation Utility
 *
 * Supported formats:
 * - 09171234567  (11 digits starting with 09)
 * - 9171234567   (10 digits starting with 9)
 * - 639171234567 (12 digits starting with 639)
 * - +639171234567 (13 chars starting with +639)
 *
 * Output:
 * Standard E.164 format: +639171234567
 */

/**
 * Normalizes a Philippine mobile number to standard E.164 format (+639XXXXXXXXX).
 * Returns null if the number is invalid.
 *
 * @param {string} rawPhone
 * @returns {string|null} Normalized E.164 phone number or null
 */
export function normalizePhilippinePhoneNumber(rawPhone) {
  if (!rawPhone || typeof rawPhone !== "string") {
    return null;
  }

  // Remove all whitespace, dashes, parentheses, dots
  let cleaned = rawPhone.trim().replace(/[\s\-().]/g, "");

  // If starts with +, check if it's already +63
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  // At this point cleaned contains only digits
  if (!/^\d+$/.test(cleaned)) {
    return null;
  }

  // Case 1: 09XXXXXXXXX (11 digits starting with 09)
  if (cleaned.length === 11 && cleaned.startsWith("09")) {
    return `+63${cleaned.slice(1)}`;
  }

  // Case 2: 9XXXXXXXXX (10 digits starting with 9)
  if (cleaned.length === 10 && cleaned.startsWith("9")) {
    return `+63${cleaned}`;
  }

  // Case 3: 639XXXXXXXXX (12 digits starting with 639)
  if (cleaned.length === 12 && cleaned.startsWith("639")) {
    return `+${cleaned}`;
  }

  // Invalid format
  return null;
}

/**
 * Formats a phone number for user-friendly display (e.g. +63 917 123 4567 or 0917 123 4567).
 *
 * @param {string} rawPhone
 * @returns {string}
 */
export function formatPhilippinePhoneNumber(rawPhone) {
  const normalized = normalizePhilippinePhoneNumber(rawPhone);
  if (!normalized) return rawPhone || "";

  // +639XXXXXXXXX -> 09XX XXX XXXX
  const local = `0${normalized.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

/**
 * Checks if a string is a valid Philippine mobile number.
 *
 * @param {string} rawPhone
 * @returns {boolean}
 */
export function isValidPhilippinePhoneNumber(rawPhone) {
  return normalizePhilippinePhoneNumber(rawPhone) !== null;
}
