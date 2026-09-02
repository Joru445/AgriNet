import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getOnboardingSteps } from "../../constants/onboardingSteps";
import useMediaQuery from "../../hooks/useMediaQuery";

const POLL_INTERVAL = 250;
const TARGET_TIMEOUT = 4000;
const TIP_WIDTH = 320;
const TIP_HEIGHT = 220;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function choosePlacement(rect, isMobile) {
  if (!rect) return "center";

  const { innerHeight } = window;

  if (innerHeight - rect.bottom > 300) return "bottom";
  if (rect.top > 300) return "top";

  if (isMobile) return "center";
  if (rect.left > TIP_WIDTH + 32) return "left";
  return "right";
}

function computeTooltipStyle(rect, placement) {
  if (!rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(TIP_WIDTH, vw - 24);
  const horizontal = () =>
    Math.max(12, Math.min(rect.left + rect.width / 2 - w / 2, vw - w - 12));

  switch (placement) {
    case "top":
      return { bottom: vh - rect.top + 14, left: horizontal() };

    case "left":
      return {
        top: Math.max(12, Math.min(rect.top + rect.height / 2 - TIP_HEIGHT / 2, vh - TIP_HEIGHT - 12)),
        left: Math.max(12, rect.left - w - 14),
      };

    case "right":
      return {
        top: Math.max(12, Math.min(rect.top + rect.height / 2 - TIP_HEIGHT / 2, vh - TIP_HEIGHT - 12)),
        left: rect.right + 14,
      };

    default:
      return { top: rect.bottom + 14, left: horizontal() };
  }
}

export default function OnboardingTour({ open, onFinish, onSkip }) {
  const { profile, suspended, phoneVerified } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMediaQuery("(max-width: 639px)");

  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [targetFound, setTargetFound] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const hadFoundRef = useRef(false);
  const lastNavigateRef = useRef(null);
  const activeQueryRef = useRef(null);
  const onSkipRef = useRef(onSkip);

  useEffect(() => {
    onSkipRef.current = onSkip;
  }, [onSkip]);

  const steps = useMemo(
    () => (profile?.role ? getOnboardingSteps(profile.role) : []),
    [profile?.role],
  );

  const stepCopyKey = (step) =>
    step?.id ? `onboarding.steps.${step.id}` : null;

  // Reset to the first step whenever the tour (re)opens.
  useEffect(() => {
    setStepIndex(0);
    setTargetRect(null);
    setTargetFound(false);
    setWaiting(false);
  }, [open]);

  // Never run the overlay for unverif/suspended accounts.
  const visible = open && profile?.role && !suspended && phoneVerified;
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  // Resolve each step: navigate when needed, then look for the target element
  // (it may render asynchronously). Missing targets fall back to a centered tip.
  useEffect(() => {
    if (!visible || !step) return;

    let pollTimer = null;
    const deadline = Date.now() + TARGET_TIMEOUT;

    hadFoundRef.current = false;
    lastNavigateRef.current = null;
    activeQueryRef.current = step.target || null;

    const tryFind = () => {
      const path =
        typeof step.path === "function" ? step.path(profile) : step.path;

      if (path && path !== location.pathname && lastNavigateRef.current !== path) {
        lastNavigateRef.current = path;
        navigate(path, { replace: true });
      }

      if (!step.target) {
        setTargetFound(false);
        setTargetRect(null);
        setWaiting(false);
        return true;
      }

      const el = document.querySelector(step.target);
      if (!el) return false;

      if (!hadFoundRef.current) {
        hadFoundRef.current = true;
        el.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      }

      setTargetFound(true);
      setTargetRect(el.getBoundingClientRect());
      setWaiting(false);
      return true;
    };

    setWaiting(true);

    if (tryFind()) {
      return;
    }

    // Element is missing (data may still be loading). Poll briefly for it.
    setTargetFound(false);
    setWaiting(true);

    pollTimer = setInterval(() => {
      if (tryFind()) {
        clearInterval(pollTimer);
        pollTimer = null;
      } else if (Date.now() > deadline) {
        clearInterval(pollTimer);
        pollTimer = null;
        setWaiting(false);
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [visible, step, stepIndex, location.pathname, navigate, profile]);

  // Keep the spotlight and tooltip anchored while the page scrolls/resizes.
  useEffect(() => {
    if (!visible || !targetFound || !step?.target) return;

    const query = step.target;

    const update = () => {
      const el = document.querySelector(query);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetFound(false);
        setWaiting(true);
      }
    };

    window.addEventListener("resize", update);
    document.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("scroll", update, true);
    };
  }, [visible, targetFound, step, stepIndex]);

  // Allow dismissing the tour with Escape.
  useEffect(() => {
    if (!visible) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onSkipRef.current?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  if (!visible || !step) return null;

  const centered = !step.target || !targetFound;
  const placement = centered ? "center" : choosePlacement(targetRect, isMobile);
  const isLast = stepIndex >= steps.length - 1;

  return (
    <section
      role="region"
      aria-label={t("onboarding.guidedTutorial")}
      className="fixed inset-0 z-[10010] pointer-events-none"
    >
      {!centered && targetRect && (
        <div
          aria-hidden="true"
          className="onboarding-spotlight"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            opacity: waiting ? 0 : 1,
          }}
        />
      )}

      <div
        className={centered ? "onboarding-tip-center" : "onboarding-tip-fixed anim-pop-in"}
        style={centered ? undefined : computeTooltipStyle(targetRect, placement)}
      >
        <div className="pointer-events-auto w-full max-w-[24rem] rounded-2xl border border-(--agri-border) bg-(--agri-card) p-4 shadow-2xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-(--agri-brand)">
            {t("common.fromTo", { count: stepIndex + 1, total: steps.length })}
          </p>

          <h3 className="mt-0.5 text-base font-bold text-(--agri-text)">
            {t(`${stepCopyKey(step)}.title`)}
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-(--agri-text-secondary)">
            {t(`${stepCopyKey(step)}.body`)}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onSkipRef.current?.()}
              className="text-sm font-medium text-(--agri-text-muted) transition hover:text-(--agri-text) cursor-pointer"
            >
              {t("onboarding.skip")}
            </button>

            <div className="flex items-center gap-1.5">
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={t("onboarding.goToStep", { count: i + 1 })}
                  onClick={() => setStepIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === stepIndex
                      ? "w-5 bg-[#2D6A4F] dark:bg-(--agri-brand)"
                      : "w-1.5 bg-(--agri-border) hover:bg-(--agri-text-muted)"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  className="rounded-xl border border-(--agri-border) px-3 py-2 text-sm font-semibold text-(--agri-text-secondary) transition hover:bg-(--agri-hover) cursor-pointer"
                >
                  {t("common.back")}
                </button>
              )}

              {isLast ? (
                <button
                  type="button"
                  onClick={onFinish}
                  className="rounded-xl bg-[#2D6A4F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1B4332] cursor-pointer"
                >
                  {t("onboarding.finish")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                  className="rounded-xl bg-[#2D6A4F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1B4332] cursor-pointer"
                >
                  {t("onboarding.next")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}