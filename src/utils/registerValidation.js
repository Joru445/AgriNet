/**
 * Validation utilities for AgriNet Multi-Step Registration Form
 */

import { t } from "../i18n";

// Email RFC 5322 standard regex pattern
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Philippine mobile number regex: 09XXXXXXXXX or +639XXXXXXXXX (11 or 13 digits)
export const PH_PHONE_REGEX = /^(09|\+639)\d{9}$/;

// Allowed characters in full name: letters, spaces, hyphens, periods, apostrophes
export const FULLNAME_REGEX = /^[a-zA-ZÀ-ÿ\s.\-']+$/;

// Username format: alphanumeric, underscore, dot (3-25 chars)
export const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;

/**
 * Validates Step 1: Account Information
 * @param {Object} form
 * @returns {Object} errors map
 */
export function validateStep1(form) {
  const errors = {};

  // 1. Full Name
  const trimmedFullname = form.fullname ? form.fullname.trim() : "";
  if (!trimmedFullname) {
    errors.fullname = t("validation.fullNameRequired");
  } else if (trimmedFullname.length < 2) {
    errors.fullname = t("validation.fullNameMin");
  } else if (!FULLNAME_REGEX.test(trimmedFullname)) {
    errors.fullname = t("validation.fullNameInvalid");
  }

  // 2. Username
  const trimmedUsername = form.username ? form.username.trim() : "";
  if (!trimmedUsername) {
    errors.username = t("validation.usernameRequired");
  } else if (trimmedUsername.length < 3) {
    errors.username = t("validation.usernameMin");
  } else if (trimmedUsername.length > 25) {
    errors.username = t("validation.usernameMax");
  } else if (!USERNAME_REGEX.test(trimmedUsername)) {
    errors.username = t("validation.usernameInvalid");
  }

  // 3. Email
  const trimmedEmail = form.email ? form.email.trim() : "";
  if (!trimmedEmail) {
    errors.email = t("validation.emailRequired2");
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = t("validation.emailInvalid2");
  }

  return errors;
}

/**
 * Validates Step 2: Password Requirements
 * @param {Object} form
 * @returns {Object} errors map
 */
export function validateStep2(form) {
  const errors = {};
  const password = form.password || "";
  const confirmPassword = form.confirmPassword || "";

  if (!password) {
    errors.password = t("validation.passwordRequired");
  } else if (password.length < 8) {
    errors.password = t("validation.passwordMin8");
  } else if (!/[A-Z]/.test(password)) {
    errors.password = t("validation.passwordUpper");
  } else if (!/[a-z]/.test(password)) {
    errors.password = t("validation.passwordLower");
  } else if (!/\d/.test(password)) {
    errors.password = t("validation.passwordNumber");
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errors.password = t("validation.passwordSpecial");
  }

  if (!confirmPassword) {
    errors.confirmPassword = t("validation.confirmRequired");
  } else if (password !== confirmPassword) {
    errors.confirmPassword = t("validation.passwordMatch");
  }

  return errors;
}

/**
 * Validates Step 3: Profile & Contact Information
 * @param {Object} form
 * @returns {Object} errors map
 */
export function validateStep3(form) {
  const errors = {};

  // 1. Contact Number
  const trimmedPhone = form.contactNumber ? form.contactNumber.trim() : "";
  if (!trimmedPhone) {
    errors.contactNumber = t("validation.contactRequired");
  } else if (!PH_PHONE_REGEX.test(trimmedPhone)) {
    errors.contactNumber = t("validation.contactInvalid");
  }

  // 2. Farmer Location Requirement
  if (form.role === "farmer") {
    if (!form.location || !form.location.lat || !form.location.lng) {
      errors.location = t("validation.locationRequired");
    }
  }

  return errors;
}

/**
 * Evaluates password strength and returns rating
 */
export function getPasswordChecks(password = "") {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}