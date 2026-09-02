import { t } from "../i18n";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email.trim()) return t("validation.emailRequired");
  if (!EMAIL_REGEX.test(email)) return t("validation.emailInvalid");
  return "";
}

export function validatePassword(password) {
  if (!password) return t("validation.passwordRequired");
  if (password.length < 6) return t("validation.passwordMin6");
  return "";
}

export function validateLoginForm({ email, password }) {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
    general: "",
  };
}