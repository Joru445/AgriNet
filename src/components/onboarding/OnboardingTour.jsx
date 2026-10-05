import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getOnboardingSteps } from "../../constants/onboardingSteps";
import useMediaQuery from "../../hooks/useMediaQuery";
import Overlay from "../ui/Overlay";

const POLL_INTERVAL = 100;
const TARGET_TIMEOUT = 4000;
const TIP_MAX_WIDTH = 448;

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
    // On mobile, if space below is tight (<280px), place on top
    if (spaceBelow < 280 && spaceAbove >= 200) return "top";
    if (spaceBelow >= 260) return "bottom";
    if (spaceAbove >= 200) return "top";
    return spaceAbove > spaceBelow ? "top" : "bottom";
  }

  // If the target element takes up most of the horizontal width (e.g. full-width header)
  const isFullWidth =
    rect.width > innerWidth * 0.65 ||
    (rect.left < 80 && rect.right > innerWidth - 80);

  if (isFullWidth) {
    if (spaceBelow >= 260) return "bottom";
    if (spaceAbove >= 220) return "top";
    return spaceAbove > spaceBelow ? "top" : "bottom";
  }

  // Check where there is the best available space
  if (spaceBelow >= 260) return "bottom";
  if (spaceAbove >= 260) return "top";
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
  const cardH = isDesktop ? 260 : 300;

  // On wide target headers (like storefront header), align under the right-side actions on desktop
  const contentRightEdge = Math.min(
    rect.right - 24,
    (vw + Math.min(vw, 1280)) / 2 - 24,
  );
  const wideTargetX = isDesktop ? clampX(contentRightEdge - w) : centerX();
  const bottomX = isWideTarget ? wideTargetX : centerX();

  // Auto-flip if placement would cause tooltip to overflow viewport
  let effectivePlacement = placement;
  if (placement === "bottom" && vh - rect.bottom < cardH && rect.top >= cardH + 16) {
    effectivePlacement = "top";
  } else if (placement === "top" && rect.top < cardH + 16 && vh - rect.bottom >= cardH + 16) {
    effectivePlacement = "bottom";
  }

  switch (effectivePlacement) {
    case "top": {
      const bottomOffset = Math.max(12, vh - rect.top + 16);
      return {
        bottom: bottomOffset,
        left: bottomX,
        maxHeight: `calc(${vh}px - ${bottomOffset + 12}px)`,
      };
    }

    case "bottom": {
      const hasEnoughSpaceBelow = vh - rect.bottom >= cardH + 20;
      if (!hasEnoughSpaceBelow) {
        return {
          bottom: 12,
          left: bottomX,
          maxHeight: `calc(${vh}px - 24px)`,
        };
      }
      const topOffset = isWideTarget
        ? Math.max(12, rect.bottom - 8)
        : Math.max(12, rect.bottom + 16);
      return {
        top: topOffset,
        left: bottomX,
        maxHeight: `calc(${vh}px - ${topOffset + 12}px)`,
      };
    }

    case "left":
      return {
        top: Math.max(12, Math.min(rect.top + rect.height / 2 - cardH / 2, vh - cardH - 12)),
        left: clampX(rect.left - w - 16),
        maxHeight: `calc(${vh}px - 24px)`,
      };

    case "right":
      return {
        top: Math.max(12, Math.min(rect.top + rect.height / 2 - cardH / 2, vh - cardH - 12)),
        left: clampX(rect.right + 16),
        maxHeight: `calc(${vh}px - 24px)`,
      };

    case "center":
    default:
      return {
        bottom: 12,
        left: bottomX,
        maxHeight: `calc(${vh}px - 24px)`,
      };
  }
}

export default function OnboardingTour({ open, onFinish, onSkip }) {
  const { profile, suspended, phoneVerified } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width: 639px)");

  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [targetFound, setTargetFound] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const hadFoundRef = useRef(false);
  const lastNavigateRef = useRef(null);
  const activeQueryRef = useRef(null);
  const onSkipRef = useRef(onSkip);
  const rafRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

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
    setTimedOut(false);
    setIsScrolling(false);
  }, [open]);

  // Never run the overlay for unverif/suspended accounts.
  const visible = open && profile?.role && !suspended && phoneVerified;
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const updateRect = useCallback(() => {
    if (!step?.target) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const el = document.querySelector(step.target);
      if (el) {
        const nextRect = el.getBoundingClientRect();
        setTargetRect((prev) => {
          if (
            prev &&
            Math.abs(prev.top - nextRect.top) < 0.5 &&
            Math.abs(prev.left - nextRect.left) < 0.5 &&
            Math.abs(prev.width - nextRect.width) < 0.5 &&
            Math.abs(prev.height - nextRect.height) < 0.5
          ) {
            return prev;
          }
          return nextRect;
        });
      }
    });
  }, [step?.target]);

  // Resolve each step: navigate when needed, then look for the target element
  // (it may render asynchronously). Missing targets fall back to a centered tip.
  useEffect(() => {
    if (!visible || !step) return;

    let pollTimer = null;
    let settleTimer = null;
    const deadline = Date.now() + TARGET_TIMEOUT;

    hadFoundRef.current = false;
    lastNavigateRef.current = null;
    activeQueryRef.current = step.target || null;
    setTimedOut(false);

    const path =
      typeof step.path === "function" ? step.path(profile) : step.path;

    if (path && path !== window.location.pathname && lastNavigateRef.current !== path) {
      lastNavigateRef.current = path;
      navigate(path, { replace: true });
      setWaiting(true);
    }

    if (!step.target) {
      setTargetFound(false);
      setTargetRect(null);
      setWaiting(false);
      return;
    }

    const tryFind = () => {
      const el = document.querySelector(step.target);
      if (!el) return false;

      if (!hadFoundRef.current) {
        hadFoundRef.current = true;
        // Wait 80ms for route mounting and AppLayout's scrollTo(0,0) to settle
        settleTimer = setTimeout(() => {
          const freshEl = document.querySelector(step.target);
          if (!freshEl) return;

          const rect = freshEl.getBoundingClientRect();
          const inComfortView =
            rect.top >= 70 && rect.bottom <= window.innerHeight - 80;

          if (!inComfortView) {
            freshEl.scrollIntoView({
              block: "center",
              inline: "nearest",
              behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
          }

          setTargetRect(freshEl.getBoundingClientRect());
          setTargetFound(true);
          setWaiting(false);
        }, 80);
      } else {
        setTargetRect(el.getBoundingClientRect());
        setTargetFound(true);
        setWaiting(false);
      }
      return true;
    };

    if (tryFind()) {
      return () => {
        if (settleTimer) clearTimeout(settleTimer);
      };
    }

    // Element is missing (data may still be loading). Poll briefly for it.
    setWaiting(true);

    pollTimer = setInterval(() => {
      if (tryFind()) {
        clearInterval(pollTimer);
        pollTimer = null;
      } else if (Date.now() > deadline) {
        clearInterval(pollTimer);
        pollTimer = null;
        setTimedOut(true);
        setWaiting(false);
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [visible, stepIndex, profile?.role, navigate]);

  // Keep the spotlight and tooltip anchored while the page scrolls/resizes.
  useEffect(() => {
    if (!visible || !targetFound || !step?.target) return;

    const onScroll = () => {
      setIsScrolling(true);
      updateRect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        updateRect();
      }, 120);
    };

    const onResize = () => {
      updateRect();
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("scroll", onScroll, true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, targetFound, step?.target, updateRect]);

  // Keep target rect updated when dimensions change (e.g. language translation change)
  useEffect(() => {
    if (!visible || !targetFound || !step?.target) return;
    const el = document.querySelector(step.target);
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      updateRect();
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [visible, targetFound, step?.target, updateRect]);

  // Prevent scrolling while the tour is active. Kept local (instead of the
  // Overlay's body-only lock) because the tour must still allow scrolling
  // inside the tooltip while blocking background touch/wheel scrolling.
  useEffect(() => {
    if (!visible) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const preventScroll = (e) => {
      if (
        !e.target.closest(
          ".onboarding-tip-fixed, .onboarding-tip-center, [data-onboarding]",
        )
      ) {
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

  return (
    <Overlay
      open={visible}
      onClose={() => onSkipRef.current?.()}
      closeOnBackdrop={false}
      closeOnEscape={true}
      lockScroll={false}
      trapFocus={!step?.interactive}
      zIndex={10010}
      backdropClass="bg-transparent"
      positionClass="p-0"
      duration={0}
      ariaLabel={t("onboarding.guidedTutorial")}
    >
      {() => {
        if (!step) return null;

        const isCenteredStep = !step.target;
        const centered = isCenteredStep || (timedOut && !targetFound);
        const placement = centered ? "center" : choosePlacement(targetRect, isMobile);
        const isLast = stepIndex >= steps.length - 1;

        const padding = step.interactive ? 4 : 0;
        const cutoutRect = targetRect
          ? {
              top: Math.round(targetRect.top - padding),
              left: Math.round(targetRect.left - padding),
              right: Math.round(targetRect.right + padding),
              bottom: Math.round(targetRect.bottom + padding),
              width: Math.round(targetRect.width + padding * 2),
              height: Math.round(targetRect.height + padding * 2),
            }
          : null;

        const isInteractive = Boolean(step.interactive && cutoutRect && !centered);

        return (
          <section className="fixed inset-0 z-[10010] pointer-events-none">
            {/* Blocker layer: blocks outside clicks; leaves interactive spotlight cutout clickable */}
            {isInteractive ? (
              <>
                <div
                  aria-hidden="true"
                  className="fixed pointer-events-auto cursor-default z-[10010]"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    height: Math.max(0, cutoutRect.top),
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
                <div
                  aria-hidden="true"
                  className="fixed pointer-events-auto cursor-default z-[10010]"
                  style={{
                    top: Math.max(0, cutoutRect.bottom),
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
                <div
                  aria-hidden="true"
                  className="fixed pointer-events-auto cursor-default z-[10010]"
                  style={{
                    top: Math.max(0, cutoutRect.top),
                    left: 0,
                    width: Math.max(0, cutoutRect.left),
                    height: Math.max(0, cutoutRect.height),
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
                <div
                  aria-hidden="true"
                  className="fixed pointer-events-auto cursor-default z-[10010]"
                  style={{
                    top: Math.max(0, cutoutRect.top),
                    left: Math.max(0, cutoutRect.right),
                    right: 0,
                    height: Math.max(0, cutoutRect.height),
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              </>
            ) : (
              <div
                aria-hidden="true"
                className="fixed inset-0 pointer-events-auto cursor-default z-[10010]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            )}

            {centered || !cutoutRect ? (
              <div
                aria-hidden="true"
                className="fixed inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto"
              />
            ) : (
              <div
                aria-hidden="true"
                className={`onboarding-spotlight ${isInteractive ? "pointer-events-none" : "pointer-events-auto"}`}
                style={{
                  top: cutoutRect.top,
                  left: cutoutRect.left,
                  width: cutoutRect.width,
                  height: cutoutRect.height,
                  opacity: waiting ? 0 : 1,
                  transition: isScrolling ? "none" : undefined,
                }}
              />
            )}

            <div
              className={centered ? "onboarding-tip-center" : "onboarding-tip-fixed anim-pop-in"}
              style={
                centered
                  ? undefined
                  : {
                      ...computeTooltipStyle(targetRect, placement),
                      transition: isScrolling ? "none" : undefined,
                    }
              }
            >
              <div
                className={`pointer-events-auto w-full max-h-[calc(100vh-24px)] flex flex-col justify-between overflow-y-auto ${
                  centered
                    ? "max-w-[24rem] sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[34rem] p-5 sm:p-6 md:p-7"
                    : "max-w-[24rem] sm:max-w-[26rem] md:max-w-[28rem] p-4 sm:p-5"
                } rounded-2xl border border-(--agri-border) bg-(--agri-card) shadow-2xl transition-all`}
              >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/25 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-[#1B4332] dark:text-(--agri-brand)">
              <i className="ri-compass-3-line text-xs text-[#2D6A4F] dark:text-(--agri-brand)" />
              <span>{t("common.fromTo", { count: stepIndex + 1, total: steps.length })}</span>
            </span>

            <h3 className="mt-2 text-base sm:text-lg md:text-xl font-extrabold text-(--agri-text) leading-snug tracking-tight">
              {t(`${stepCopyKey(step)}.title`)}
            </h3>

            <p className="mt-2 text-sm sm:text-[15px] md:text-base leading-relaxed text-(--agri-text-secondary) font-normal">
              {t(`${stepCopyKey(step)}.body`)}
            </p>
          </div>

          <div className="mt-4 sm:mt-5 pt-3 border-t border-(--agri-border) dark:border-gray-700 flex items-center justify-between gap-1.5 sm:gap-2">
            {/* Left: Skip */}
            <button
              type="button"
              onClick={() => onSkipRef.current?.()}
              className="text-xs sm:text-sm font-semibold text-(--agri-text-muted) transition hover:text-(--agri-text) cursor-pointer shrink-0"
            >
              {t("onboarding.skip")}
            </button>

            {/* Center: Step indicator dots */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink min-w-0" aria-hidden="true">
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={t("onboarding.goToStep", { count: i + 1 })}
                  onClick={() => setStepIndex(i)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer shrink-0 ${
                    i === stepIndex
                      ? "w-4 sm:w-7 bg-[#2D6A4F] dark:bg-(--agri-brand)"
                      : "w-1 sm:w-2 bg-(--agri-border) hover:bg-(--agri-text-muted)"
                  }`}
                />
              ))}
            </div>

            {/* Right: Back & Next / Finish action buttons */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  className="rounded-xl border border-(--agri-border) bg-(--agri-hover)/70 hover:bg-(--agri-hover) px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-(--agri-text) transition cursor-pointer whitespace-nowrap"
                >
                  {t("common.back")}
                </button>
              )}

              {isLast ? (
                <button
                  type="button"
                  onClick={onFinish}
                  className="rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] px-2.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow transition cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <i className="ri-check-line text-sm" />
                  <span>{t("onboarding.finish")}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                  className="rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] px-2.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow transition cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <span>{t("onboarding.next")}</span>
                  <i className="ri-arrow-right-line text-xs sm:text-sm" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
          </section>
        );
      }}
    </Overlay>
  );
}