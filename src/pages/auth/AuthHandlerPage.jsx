import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  notifySocialAuthResult,
  signInWithFacebookPopup,
  signInWithGooglePopup,
} from "../../services/auth.service";
import { t } from "../../i18n";

// Firebase popup auth always resolves with a real UserCredential or rejects
// with a specific code, so a cancelled flow is never ambiguous.
const CANCELLATION_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/cancelled-popup",
  "auth/user-cancelled",
]);

// Fallback auto-close for the popup-blocked state in case the user leaves the
// tab open without retrying or closing it themselves.
const POPUP_BLOCKED_GRACE_MS = 30000;

/**
 * Dedicated provider authentication tab (Google/Facebook).
 *
 * It is rendered as a top-level route OUTSIDE the main App so the AgriNet
 * registration tab is never redirected or refreshed. In this tab:
 *  1. it opens the provider consent popup via Firebase signInWithPopup
 *  2. on success it sends a safe same-origin postMessage() to the registration
 *     tab carrying only the fields needed to continue (no tokens/credentials)
 *  3. on failure/cancellation it reports auth-error / auth-cancelled
 *  4. it closes itself
 *
 * signInWithPopup requires Transient User Activation in this tab, which a
 * programmatically window.open'ed tab does not reliably inherit from the
 * registration tab's click. The popup is therefore always started from a real
 * click here (the Start button, and the Retry button when a popup is blocked),
 * so the first attempt behaves exactly like a retry and never falls back to a
 * redirect flow.
 */
export default function AuthHandlerPage({ method }) {
  const isFacebook = method === "facebook";
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get("socialAttempt") || null;

  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("signing-in");
  const [popupBlocked, setPopupBlocked] = useState(false);

  const startedRef = useRef(false);
  const reportedRef = useRef(false);

  const report = useCallback(
    (payload) => {
      // A popup-blocked attempt is not terminal (Retry may follow), so the
      // beforeunload handler must still be able to report auth-cancelled when
      // this tab is closed without a final outcome.
      if (
        !(payload.type === "auth-error" && payload.code === "auth/popup-blocked")
      ) {
        reportedRef.current = true;
      }
      notifySocialAuthResult({ socialAttempt: attemptId, ...payload });
    },
    [attemptId],
  );

  const scheduleClose = useCallback((delay = 500) => {
    setTimeout(() => {
      try {
        window.close();
      } catch {
        /* ignore */
      }
    }, delay);
  }, []);

  const runAuth = useCallback(async () => {
    setStatus("signing-in");
    setPopupBlocked(false);

    try {
      const result = isFacebook
        ? await signInWithFacebookPopup()
        : await signInWithGooglePopup();

      report({
        type: "auth-success",
        method,
        displayName: result.user.displayName || "",
        email: result.user.email || "",
        photoURL: result.user.photoURL || "",
      });
      setStatus("success");
      scheduleClose();
    } catch (error) {
      console.error(`${method} sign-in error:`, error);
      const code = error?.code || "";

      if (CANCELLATION_CODES.has(code)) {
        report({ type: "auth-cancelled", method });
        setStatus("cancelled");
        scheduleClose();
      } else if (code === "auth/popup-blocked") {
        // The registration tab still sees the allowPopups toast; this tab
        // stays open and offers a Retry button. Never retry automatically.
        report({ type: "auth-error", method, code });
        setPopupBlocked(true);
        setStatus("error");
        scheduleClose(POPUP_BLOCKED_GRACE_MS);
      } else {
        report({ type: "auth-error", method, code });
        setStatus("error");
        scheduleClose();
      }
    }
  }, [isFacebook, method, report, scheduleClose]);

  useEffect(() => {
    // If this tab is closed without reporting an outcome (e.g. the popup was
    // blocked and the user manually closes the tab), tell the registration tab
    // so it can re-enable the provider buttons. Registered on every mount so
    // StrictMode's double-invocation keeps the listener alive.
    const onUnload = () => {
      if (reportedRef.current) return;
      report({ type: "auth-cancelled", method });
    };

    window.addEventListener("beforeunload", onUnload);

    return () => {
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [method, report]);

  // signInWithPopup is only ever invoked from a real user gesture (Start or
  // Retry), never automatically on mount. This is what guarantees the provider
  // popup actually opens on the very first attempt.
  function handleStart() {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);
    runAuth();
  }

  function handleRetry() {
    runAuth();
  }

  // Start screen: a user gesture is required before signInWithPopup opens the
  // provider popup, so this tab stays on AuthHandlerPage at all times.
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-sm px-6">
          <div className="mb-4 flex items-center justify-center">
            {isFacebook ? (
              <i className="ri-facebook-circle-fill text-[#1877F2] text-4xl" />
            ) : (
              <svg className="w-9 h-9" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
          </div>
          <p className="text-gray-800 font-semibold">
            {isFacebook
              ? t("auth.register.continueWithFacebook")
              : t("auth.register.continueWithGoogle")}
          </p>
          <p className="mt-1 text-sm text-gray-500">{t("auth.handler.startHint")}</p>
          <button
            type="button"
            onClick={handleStart}
            className="mt-4 w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <i className="ri-refresh-line text-base" />
            <span>
              {isFacebook
                ? t("auth.register.continueWithFacebook")
                : t("auth.register.continueWithGoogle")}
            </span>
          </button>
          <p className="mt-1 text-sm text-gray-500">{t("auth.handler.closeHint")}</p>
        </div>
      </div>
    );
  }

  let message;
  if (status === "success") {
    message = t("auth.handler.signedIn");
  } else if (status === "cancelled") {
    message = t("auth.handler.cancelled");
  } else if (status === "error") {
    message = t("auth.handler.failure");
  } else if (isFacebook) {
    message = t("auth.handler.signingInFacebook");
  } else {
    message = t("auth.handler.signingInGoogle");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-sm px-6">
        <div className="mb-4 flex items-center justify-center">
          {status === "success" ? (
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <i className="ri-check-line text-green-600 text-2xl" />
            </div>
          ) : status === "error" || status === "cancelled" ? (
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <i className="ri-close-line text-red-600 text-2xl" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full border-4 border-[#2D6A4F] border-t-transparent animate-spin" />
          )}
        </div>
        <p className="text-gray-800 font-semibold">{message}</p>

        {popupBlocked && (
          <>
            <p className="mt-2 text-sm text-gray-600">
              {t("auth.handler.popupBlocked")}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <i className="ri-refresh-line text-base" />
              <span>{t("auth.handler.retry")}</span>
            </button>
          </>
        )}

        <p className="mt-1 text-sm text-gray-500">{t("auth.handler.closeHint")}</p>
      </div>
    </div>
  );
}