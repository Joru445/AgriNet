import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { isPublicAuthRoute } from "../utils/routes";

const ThemeContext = createContext(null);

const STORAGE_KEY = "agrinet_theme";

/**
 * Returns the resolved theme: "light" or "dark".
 * When preference is "system", reads the OS preference.
 */
function resolveTheme(preference) {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

/**
 * Apply the visual theme to the document and PWA meta.
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  // Update meta theme-color for mobile browser header / PWA
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.content = theme === "dark" ? "#121416" : "#1B4332";
  }
}

export function ThemeProvider({ children }) {
  const location = useLocation();
  const [preference, setPreference] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "system";
    } catch {
      return "system";
    }
  });

  const resolved = resolveTheme(preference);
  const isPublicAuth = isPublicAuthRoute(location?.pathname);
  // Public & Authentication pages are strictly light-only
  const activeTheme = isPublicAuth ? "light" : resolved;

  // Apply active theme on mount and whenever activeTheme changes
  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  // Listen for OS preference changes when in system mode
  useEffect(() => {
    if (preference !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const nextResolved = resolveTheme("system");
      if (!isPublicAuthRoute(window.location.pathname)) {
        applyTheme(nextResolved);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const setTheme = useCallback((next) => {
    setPreference(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage full or unavailable
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        preference,
        resolved,
        activeTheme,
        isPublicAuth,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

