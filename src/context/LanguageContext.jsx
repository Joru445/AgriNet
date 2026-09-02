import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  setActiveLanguage,
  translateMessage,
} from "../i18n";

const LanguageContext = createContext(null);

function resolveInitialLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    // Storage unavailable
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const initial = resolveInitialLanguage();
    // Keep the module mirror consistent from the very first render so that
    // pure modules (validators/services) translate correctly immediately.
    setActiveLanguage(initial);
    return initial;
  });

  // Keep the module mirror + HTML lang attribute in sync whenever the user
  // switches languages. The context value below re-renders the app.
  useEffect(() => {
    setActiveLanguage(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!isSupportedLanguage(next)) return;

    setLangState(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Storage full or unavailable
    }
  }, []);

  const value = useMemo(() => {
    const dictionary = SUPPORTED_LANGUAGES.find((l) => l.code === lang);

    return {
      lang,
      setLang,
      currentLanguage: dictionary,
      t: (path, vars) => translateMessage(lang, path, vars),
    };
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}