/**
 * Lightweight i18n helpers for AgriNet.
 *
 * The React context (`LanguageContext`) is the source of truth for rendering.
 * This module additionally keeps a tiny "active language" mirror so that pure
 * modules (validators, services) can call `t()` without access to a hook.
 */
import en from "./translations/en.js";
import fil from "./translations/fil.js";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "fil", label: "Filipino", nativeLabel: "Filipino" },
];

export const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_STORAGE_KEY = "agrinet_lang";

export const DICTIONARIES = { en, fil };

let activeLanguage = DEFAULT_LANGUAGE;

export function isSupportedLanguage(code) {
  return code === "en" || code === "fil";
}

export function setActiveLanguage(code) {
  if (isSupportedLanguage(code)) {
    activeLanguage = code;
  }
}

export function getActiveLanguage() {
  return activeLanguage;
}

function getNested(obj, path) {
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

/**
 * Resolves a dot-notation key against a language dictionary.
 * Falls back to English (and finally to the raw key) when missing.
 * Supports `{var}` interpolation via the `vars` map.
 */
export function translateMessage(lang, path, vars) {
  if (!path) return path;

  let message =
    lang === DEFAULT_LANGUAGE
      ? getNested(en, path)
      : getNested(DICTIONARIES[lang], path);

  if (message == null && lang !== DEFAULT_LANGUAGE) {
    message = getNested(en, path);
  }

  if (message == null || typeof message !== "string") {
    return message == null ? path : message;
  }

  if (!vars) return message;

  return message.replace(/\{(\w+)\}/g, (match, key) =>
    vars[key] != null ? String(vars[key]) : match,
  );
}

/**
 * Quick translate helper for non-React modules that always resolves against
 * the currently active language (kept in sync by LanguageProvider).
 */
export function t(path, vars) {
  return translateMessage(activeLanguage, path, vars);
}