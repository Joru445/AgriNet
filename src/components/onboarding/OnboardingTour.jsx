import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getOnboardingSteps } from "../../constants/onboardingSteps";
import useMediaQuery from "../../hooks/useMediaQuery";

const POLL_INTERVAL = 250;
const TARGET_TIMEOUT = 4000;
const TIP_MAX_WIDTH = 448;
const TIP_HEIGHT_ESTIMATE = 280;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function choosePlacement(rect, isMobile) {
  if (!rect) return "center";

  const { innerWidth, innerHeight } = window;

  const spaceBelow = innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const spaceRight = innerWidth - rect.right;
  const spaceLeft = rect.left;

  if (isMobile) {
    // On mobile, if element is in the bottom area of the screen (e.g. bottom nav), place on top
    if (spaceBelow < 260 && spaceAbove >= 180) return "top";
    if (spaceBelow >= 200) return "bottom";
    if (spaceAbove >= 200) return "top";
    return spaceAbove > spaceBelow ? "top" : "bottom";
  }

  // If the target element takes up most of the horizontal width (e.g. full-width header)
  const isFullWidth =
    rect.width > innerWidth * 0.65 ||
    (rect.left < 80 && rect.right > innerWidth - 80);

  if (isFullWidth) {
    if (spaceBelow >= 160) return "bottom";
    if (spaceAbove >= 220) return "top";
    return spaceAbove > spaceBelow ? "top" : "bottom";
  }

  // Check where there is the best available space
  if (spaceBelow >= 240) return "bottom";
  if (spaceAbove >= 240) return "top";
  if (spaceRight >= TIP_MAX_WIDTH + 24) return "right";
  if (spaceLeft >= TIP_MAX_WIDTH + 24) return "left";

  // Fallback to whichever side has the most space
  const maxSpace = Math.max(spaceBelow, spaceAbove, spaceRight, spaceLeft);
  if (maxSpace === spaceBelow) return "bottom";
  if (maxSpace === spaceAbove) return "top";
  if (maxSpace === spaceRight) return "right";
  if (maxSpace === spaceLeft) return "left";

  return "top";
}

function computeTooltipStyle(rect, placement) {
  if (!rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(TIP_MAX_WIDTH, vw - 24);

  const clampX = (x) => Math.max(12, Math.min(x, vw - w - 12));
  const centerX = () => clampX(rect.left + rect.width / 2 - w / 2);

  const isWideTarget = rect.width > vw * 0.65;
  const isDesktop = vw >= 640;

  // On wide target headers (like storefront header), align under the right-side actions (Message/Save/Share/Report) on laptop
  const contentRightEdge = Math.min(
    rect.right - 24,
    (vw + Math.min(vw, 1280)) / 2 - 24,
  );
  const wideTargetX = isDesktop ? clampX(contentRightEdge - w) : centerX();
  const bottomX = isWideTarget ? wideTargetX : centerX();

  // Move slightly up for wide header so it sits directly under the actions
  const bottomTop = isWideTarget
    ? Math.max(12, rect.bottom - 8)
    : Math.max(12, rect.bottom + 16);

  // Auto-flip if placement would cause tooltip to overflow viewport
  let effectivePlacement = placement;
  if (placement === "bottom" && vh - rect.bottom < 180 && rect.top >= 180) {
    effectivePlacement = "top";
  } else if (placement === "top" && rect.top < 180 && vh - rect.bottom >= 180) {
    effectivePlacement = "bottom";
  }

  switch (effectivePlacement) {
    case "top":
      return {
        bottom: Math.max(12, vh - rect.top + 16),
        left: bottomX,
      };

    case "bottom":
      return {
        top: bottomTop,
        left: bottomX,
      };

    case "left":
      return {
        top: Math.max(12, Math.min(rect.top + rect.height / 2 - TIP_HEIGHT_ESTIMATE / 2, vh - TIP_HEIGHT_ESTIMATE - 12)),
        left: clampX(rect.left - w - 16),
      };

    case "right":
      return {
        top: Math.max(12, Math.min(rect.top + rect.height / 2 - TIP_HEIGHT_ESTIMATE / 2, vh - TIP_HEIGHT_ESTIMATE - 12)),
        left: clampX(rect.right + 16),
      };

    case "center":
    default:
      return {
        top: bottomTop,
        left: bottomX,
      };
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
        const initialRect = el.getBoundingClientRect();
        const block = initialRect.height > 250 ? "start" : "center";
        el.scrollIntoView({
          block,
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

  // Prevent scrolling while the tour is active.
  useEffect(() => {
    if (!visible) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const preventScroll = (e) => {
      if (!e.target.closest(".onboarding-tip-fixed, .onboarding-tip-center")) {
        e.preventDefault();
      }
    };

    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("wheel", preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("wheel", preventScroll);
    };
  }, [visible]);

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
      className="fixed inset-0 z-[10010] pointer-events-auto"
    >
      {/* Full-screen backdrop blocker to prevent clicking on page elements in the background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-auto cursor-default"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {centered || !targetRect ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto"
        />
      ) : (
        <div
          aria-hidden="true"
          className="onboarding-spotlight pointer-events-auto"
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
        <div
          className={`pointer-events-auto w-full ${
            centered
              ? "max-w-[24rem] sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[34rem] p-5 sm:p-6 md:p-7"
              : "max-w-[24rem] sm:max-w-[26rem] md:max-w-[28rem] p-4 sm:p-5"
          } rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-2xl transition-all`}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/25 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-[#1B4332] dark:text-(--agri-brand)">
            <i className="ri-compass-3-line text-xs text-[#2D6A4F] dark:text-(--agri-brand)" />
            <span>{t("common.fromTo", { count: stepIndex + 1, total: steps.length })}</span>
          </span>

          <h3 className="mt-2.5 text-base sm:text-lg md:text-xl font-extrabold text-[var(--agri-text)] leading-snug tracking-tight">
            {t(`${stepCopyKey(step)}.title`)}
          </h3>

          <p className="mt-1.5 text-xs sm:text-sm md:text-[15px] leading-relaxed text-[var(--agri-text-secondary)] font-normal">
            {t(`${stepCopyKey(step)}.body`)}
          </p>

          <div className="mt-5 pt-3.5 border-t border-[var(--agri-border)] dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onSkipRef.current?.()}
              className="text-xs sm:text-sm font-semibold text-(--agri-text-muted) transition hover:text-(--agri-text) cursor-pointer min-w-0"
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
                  className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                    i === stepIndex
                      ? "w-6 sm:w-7 bg-[#2D6A4F] dark:bg-(--agri-brand)"
                      : "w-1.5 sm:w-2 bg-[var(--agri-border)] hover:bg-[var(--agri-text-muted)]"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 min-w-0">
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  className="shrink-0 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-hover)]/70 hover:bg-[var(--agri-hover)] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[var(--agri-text)] transition cursor-pointer"
                >
                  {t("common.back")}
                </button>
              )}

              {isLast ? (
                <button
                  type="button"
                  onClick={onFinish}
                  className="shrink-0 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <i className="ri-check-line text-sm" />
                  <span>{t("onboarding.finish")}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                  className="shrink-0 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>{t("onboarding.next")}</span>
                  <i className="ri-arrow-right-line text-sm" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}