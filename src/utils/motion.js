/**
 * Shared Motion Tokens & Variants for AgriNet
 * Follows the subtle, restrained micro-interaction philosophy.
 */

// Timing tokens
export const DURATION = {
  fast: 0.15,      // 150ms — small controls, badges, icons, tooltips
  standard: 0.2,   // 200ms — dropdowns, menus, navigation indicators
  modal: 0.25,     // 250ms — dialogs, popovers
  large: 0.3,      // 300ms — sheets, drawers, expanding sidebar
};

// Easing curves (restrained, smooth deceleration)
export const EASING = {
  standard: [0.2, 0, 0, 1],
  smooth: [0.16, 1, 0.3, 1],
  easeOut: "easeOut",
};

// Layout transition for the shared active-tab indicator (layoutId pill)
export const tabIndicatorTransition = {
  duration: DURATION.standard,
  ease: EASING.smooth,
};

// Fade variant
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.fast, ease: EASING.easeOut } },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASING.easeOut } },
};

// Dialog / Modal variant
export const modalDialog = {
  initial: { opacity: 0, scale: 0.96, y: 4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: DURATION.modal, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 2,
    transition: { duration: DURATION.fast, ease: EASING.easeOut },
  },
};

// Sheet / Drawer variant (mobile bottom sheet)
export const bottomSheet = {
  initial: { y: "100%" },
  animate: {
    y: 0,
    transition: { duration: DURATION.large, ease: EASING.smooth },
  },
  exit: {
    y: "100%",
    transition: { duration: DURATION.standard, ease: EASING.easeOut },
  },
};

// Dropdown / Popover variant
export const dropdownMenu = {
  initial: { opacity: 0, y: -4, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.standard, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: DURATION.fast, ease: EASING.easeOut },
  },
};

// Collapse / Expand variant (animated height + opacity)
export const collapsePanel = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: "auto",
    opacity: 1,
    transition: { duration: DURATION.standard, ease: EASING.smooth },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASING.easeOut },
  },
};

// Overlay backdrop
export const overlayBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.modal, ease: EASING.easeOut } },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASING.easeOut } },
};

// Aliases matching UI component import conventions
export const backdropMotion = overlayBackdrop;
export const modalMotion = modalDialog;
export const sheetBottomMotion = bottomSheet;
export const dropdownMotion = dropdownMenu;
export const collapseMotion = collapsePanel;

