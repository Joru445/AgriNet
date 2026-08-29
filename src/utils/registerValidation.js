/**
 * Validation utilities for AgriNet Multi-Step Registration Form
 */

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
    errors.fullname = "Full name is required.";
  } else if (trimmedFullname.length < 2) {
    errors.fullname = "Full name must be at least 2 characters.";
  } else if (!FULLNAME_REGEX.test(trimmedFullname)) {
    errors.fullname = "Full name can only contain letters, spaces, and hyphens.";
  }

  // 2. Username
  const trimmedUsername = form.username ? form.username.trim() : "";
  if (!trimmedUsername) {
    errors.username = "Username is required.";
  } else if (trimmedUsername.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  } else if (trimmedUsername.length > 25) {
    errors.username = "Username cannot exceed 25 characters.";
  } else if (!USERNAME_REGEX.test(trimmedUsername)) {
    errors.username = "Username can only contain letters, numbers, dots, and underscores.";
  }

  // 3. Email
  const trimmedEmail = form.email ? form.email.trim() : "";
  if (!trimmedEmail) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = "Please enter a valid email address (e.g. name@example.com).";
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
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Password must contain at least one uppercase letter.";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "Password must contain at least one lowercase letter.";
  } else if (!/\d/.test(password)) {
    errors.password = "Password must contain at least one number.";
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errors.password = "Password must contain at least one special character.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
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
    errors.contactNumber = "Contact number is required.";
  } else if (!PH_PHONE_REGEX.test(trimmedPhone)) {
    errors.contactNumber = "Please enter a valid Philippine mobile number (09XXXXXXXXX).";
  }

  // 2. Farmer Location Requirement
  if (form.role === "farmer") {
    if (!form.location || !form.location.lat || !form.location.lng) {
      errors.location = "Please pin your farm location on the map.";
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
