import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

// Persisted per authenticated farmer UID so the prompt only appears once until
// they actually create their first product.
const DONE_KEY_PREFIX = "agrinet_first_product_onboarding_v1_";

const TARGET_SELECTOR = '[data-onboarding="add-product"]';
const TIP_MAX_WIDTH = 448;

function isDone(uid) {
  if (!uid) return true;
  try {
    return localStorage.getItem(DONE_KEY_PREFIX + uid) === "1";
  } catch {
    return false;
  }
}

function markDone(uid) {
  if (!uid) return;
  try {
    localStorage.setItem(DONE_KEY_PREFIX + uid, "1");
  } catch {
    // Storage unavailable; the prompt will simply appear again next time.
  }
}

function computeTooltipStyle(rect) {
  if (!rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(TIP_MAX_WIDTH, vw - 24);
  const horizontal = () =>
    Math.max(12, Math.min(rect.left + rect.width / 2 - w / 2, vw - w - 12));

  const cardH = 260;
  if (vh - rect.bottom >= cardH + 20) {
    return {
      top: rect.bottom + 14,
      left: horizontal(),
      maxHeight: `calc(${vh}px - ${rect.bottom + 26}px)`,
    };
  }
  if (rect.top >= cardH + 20) {
    const bottomOffset = Math.max(12, vh - rect.top + 14);
    return {
      bottom: bottomOffset,
      left: horizontal(),
      maxHeight: `calc(${vh}px - ${bottomOffset + 12}px)`,
    };
  }

  return {
    bottom: 12,
    left: horizontal(),
    maxHeight: `calc(${vh}px - 24px)`,
  };
}

/**
 * One-time, contextual guidance shown on the farmer's My Products page when
 * they have not listed any products yet. It spotlights the "Add Product"
 * button and nudges them to create their first listing.
 *
 * - Only shows for farmers with zero products.
 * - Persisted per user so it appears once; it clears automatically once the
 *   farmer creates their first product.
 * - Reuses the same spotlight + tooltip styling as the main OnboardingTour.
 */
export default function FirstProductOnboarding({ hasProducts, loading, onCreate }) {
  const { profile } = useAuth();
  const { t } = useLanguage();

  const uid = profile?.uid;

  const [open, setOpen] = useState(false);
  const [, setSnap] = useState(0);
  const reportedDoneRef = useRef(false);

  const shouldShow =
    !loading && !hasProducts && profile?.role === "farmer" && !!uid;

  // Keep the spotlight + tooltip anchored while the page resizes or scrolls.
  useEffect(() => {
    if (!open) return;

    const update = () => setSnap((n) => n + 1);
    window.addEventListener("resize", update);
    document.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("scroll", update, true);
    };
  }, [open]);

  // Open when the conditions are met and the user has not been told yet.
  useEffect(() => {
    if (shouldShow && !open && !reportedDoneRef.current && !isDone(uid)) {
      setOpen(true);
    }
  }, [shouldShow, open, uid]);

  // Once the farmer creates a product, no longer show the prompt and remember.
  useEffect(() => {
    if (hasProducts && open) {
      setOpen(false);
    }
    if (hasProducts && !reportedDoneRef.current && uid) {
      reportedDoneRef.current = true;
      markDone(uid);
    }
  }, [hasProducts, open, uid]);

  // Prevent scrolling while the prompt is active.
  useEffect(() => {
    if (!open) return;

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
  }, [open]);

  if (!open) return null;

  const target = document.querySelector(TARGET_SELECTOR);
  const rect = target ? target.getBoundingClientRect() : null;
  const centered = !rect;
  const style = centered ? null : computeTooltipStyle(rect);

  const finish = () => {
    reportedDoneRef.current = true;
    if (uid) markDone(uid);
    setOpen(false);
  };

  const primaryAction = () => {
    if (uid) markDone(uid);
    reportedDoneRef.current = true;
    setOpen(false);
    onCreate?.();
  };

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

      {centered || !rect ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto"
        />
      ) : (
        <div
          aria-hidden="true"
          className="onboarding-spotlight pointer-events-auto"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      )}

      <div
        className={centered ? "onboarding-tip-center" : "onboarding-tip-fixed anim-pop-in"}
        style={centered ? undefined : style}
      >
        <div
          className={`pointer-events-auto w-full ${
            centered
              ? "max-w-[24rem] sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[34rem] p-5 sm:p-6 md:p-8"
              : "max-w-[24rem] sm:max-w-[26rem] md:max-w-[28rem] p-4 sm:p-5 md:p-6"
          } rounded-2xl border border-(--agri-border) bg-(--agri-card) shadow-2xl transition-all`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-(--agri-brand)">
              {t("onboarding.guidedTutorial")}
            </p>

            <button
              type="button"
              onClick={finish}
              aria-label={t("onboarding.skip")}
              className="rounded-lg text-(--agri-text-muted) transition hover:text-(--agri-text) hover:bg-(--agri-hover) p-1 -m-1 cursor-pointer"
            >
              <i className="ri-close-line text-lg sm:text-xl" />
            </button>
          </div>

          <h3 className="mt-2 text-base sm:text-lg md:text-xl font-bold text-(--agri-text) leading-snug">
            {t("onboarding.steps.farmer-first-product.title")}
          </h3>

          <p className="mt-2 text-sm sm:text-base leading-relaxed text-(--agri-text-secondary)">
            {t("onboarding.steps.farmer-first-product.body")}
          </p>

          <div className="mt-5 pt-3.5 border-t border-[var(--agri-border)] dark:border-gray-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={finish}
              className="rounded-xl px-3.5 py-2 text-sm sm:text-base font-medium text-(--agri-text-muted) transition hover:text-(--agri-text) cursor-pointer"
            >
              {t("onboarding.skip")}
            </button>

            <button
              type="button"
              onClick={primaryAction}
              className="rounded-xl bg-[#2D6A4F] px-4 sm:px-5 py-2 text-sm sm:text-base font-bold text-white transition hover:bg-[#1B4332] cursor-pointer"
            >
              <i className="ri-add-line mr-1.5" />
              {t("products.addProduct")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}