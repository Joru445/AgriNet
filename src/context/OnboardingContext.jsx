import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import OnboardingTour from "../components/onboarding/OnboardingTour";
import { markOptedIn } from "../services/pushSubscription.service";

const OnboardingContext = createContext(null);

// Persisted per authenticated user UID so the tour only runs once per account,
// while still allowing a manual "Replay Tutorial" from the profile.
const DONE_KEY_PREFIX = "agrinet_onboarding_done_v1_";
const PUSH_PROMPT_KEY_PREFIX = "agrinet_push_prompted_v2_";

// Small delay so the role landing page and its layout have rendered.
const AUTO_OPEN_DELAY = 700;

function isTourDone(uid) {
  if (!uid) return true;
  try {
    return localStorage.getItem(DONE_KEY_PREFIX + uid) === "1";
  } catch {
    return true;
  }
}

function markTourDone(uid) {
  if (!uid) return;
  try {
    localStorage.setItem(DONE_KEY_PREFIX + uid, "1");
  } catch {
    // Storage unavailable; tour will simply show again next time.
  }
}

function hasPromptedPush(uid) {
  if (!uid) return true;
  try {
    return localStorage.getItem(PUSH_PROMPT_KEY_PREFIX + uid) === "1";
  } catch {
    return true;
  }
}

function markPushPrompted(uid) {
  if (!uid) return;
  try {
    localStorage.setItem(PUSH_PROMPT_KEY_PREFIX + uid, "1");
  } catch {
    // Storage unavailable; prompt will show again next session.
  }
}

export function OnboardingProvider({ children }) {
  const { profile, suspended, phoneVerified } = useAuth();

  const [open, setOpen] = useState(false);
  const autoOpenTimer = useRef(null);

  const uid = profile?.uid;
  const role = profile?.role;

  const startTour = useCallback(() => {
    setOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setOpen(false);
  }, []);

  const completeTour = useCallback(() => {
    markTourDone(uid);
    setOpen(false);

    // One-time notification permission prompt on first login.
    // Called from the Finish button click (user gesture) so Chrome allows it.
    if (uid && !hasPromptedPush(uid) && typeof Notification !== "undefined" && Notification.permission === "default") {
      markPushPrompted(uid);
      Notification.requestPermission()
        .then((result) => {
          if (result === "granted") {
            markOptedIn(uid);
            window.dispatchEvent(new Event("agrinet:push-opted-in"));
          }
        })
        .catch(() => {});
    }
  }, [uid]);

  // Auto-open the tour on the user's first signed-in session, but never for
  // users who are still unverified or suspended (they cannot reach the app).
  useEffect(() => {
    if (autoOpenTimer.current) {
      clearTimeout(autoOpenTimer.current);
      autoOpenTimer.current = null;
    }

    if (!role || !uid) {
      setOpen(false);
      return;
    }

    if (suspended || !phoneVerified) {
      setOpen(false);
      return;
    }

    // Already open (auto-open or replay) or previously completed for this user.
    if (open || isTourDone(uid)) return;

    autoOpenTimer.current = setTimeout(() => setOpen(true), AUTO_OPEN_DELAY);

    return () => {
      if (autoOpenTimer.current) {
        clearTimeout(autoOpenTimer.current);
        autoOpenTimer.current = null;
      }
    };
  }, [open, role, uid, suspended, phoneVerified]);

  return (
    <OnboardingContext.Provider
      value={{
        isOpen: open,
        startTour,
        closeTour,
      }}
    >
      {children}

      <OnboardingTour
        open={open}
        onFinish={completeTour}
        onSkip={completeTour}
      />
    </OnboardingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}