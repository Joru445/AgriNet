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
  "block mb-1.5 text-xs font-semibold text-gray-700";

// Input shell: consistent 44px height, 2px border and rounding.
// Apply horizontal padding at the call site based on icon presence:
//   with icon: "pl-10 pr-3"   without icon: "px-3"
export const authInputBaseClass =
  "w-full h-11 rounded-lg border-2 bg-white text-sm text-gray-950 focus:outline-none focus:border-[#2D6A4F] transition-colors placeholder:text-gray-400";

export const authInputErrorClass =
  "border-red-500 focus:border-red-500 bg-red-50/20";

export const authInputNormalClass =
  "border-gray-200 focus:border-[#2D6A4F]";

// Input icon anchor
export const authInputIconClass =
  "absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm";

// Inline field error
export const authFieldErrorClass =
  "mt-1 text-xs text-red-500 font-medium flex items-center gap-1";

// Primary action buttons: Sign In / Continue / Create Account / Continue by Email
export const authPrimaryButtonClass =
  "h-11 px-4 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-sm disabled:opacity-70";

// Secondary action button: Back
export const authSecondaryButtonClass =
  "h-11 px-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50";

// Google / Facebook buttons
export const authSocialButtonClass =
  "h-11 px-4 bg-white hover:bg-gray-50/90 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-3 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";