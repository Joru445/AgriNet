/**
 * Shared styling constants for the Login and Register authentication forms so
 * both screens share the same dimensions, typography and vertical rhythm
 * without introducing a heavyweight design system.
 *
 * Only appearance is centralized here; layout/width classes (w-full, flex-1,
 * space-y-*) stay at the call site so each screen keeps its own structure.
 */

// Field label
export const authLabelClass =
  "block mb-1.5 text-xs font-semibold text-(--agri-text)";

// Input shell: consistent 44px height, crisp border and rounded-xl.
// Apply horizontal padding at the call site based on icon presence:
//   with icon: "pl-10 pr-3"   without icon: "px-3"
export const authInputBaseClass =
  "w-full h-11 rounded-xl border bg-(--agri-input-bg) text-sm text-(--agri-text) placeholder:text-(--agri-text-muted) transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/25 dark:focus:ring-emerald-500/25";

export const authInputErrorClass =
  "border-red-400 dark:border-red-500/50 bg-red-50/20 focus:border-red-500";

export const authInputNormalClass =
  "border-(--agri-input-border) hover:border-(--agri-brand)/40 focus:border-[#2D6A4F] dark:focus:border-emerald-500";

// Input icon anchor
export const authInputIconClass =
  "absolute left-3.5 top-1/2 -translate-y-1/2 text-(--agri-text-muted) text-sm";

// Inline field error
export const authFieldErrorClass =
  "mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 anim-fade-in";

// Primary action buttons: Sign In / Continue / Create Account / Continue by Email
export const authPrimaryButtonClass =
  "h-11 px-5 bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#143326] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-150 text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-xs hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

// Secondary action button: Back
export const authSecondaryButtonClass =
  "h-11 px-4 border border-(--agri-border) hover:bg-(--agri-hover) text-(--agri-text-secondary) font-semibold rounded-xl transition-all duration-150 text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer active:scale-[0.98] disabled:opacity-50";

// Google / Facebook buttons
export const authSocialButtonClass =
  "h-11 px-4 bg-(--agri-card) hover:bg-(--agri-hover) border border-(--agri-border) text-(--agri-text) font-semibold rounded-xl transition-all duration-150 text-sm flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";