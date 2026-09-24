import useMediaQuery from "../../hooks/useMediaQuery";
import Modal from "./Modal";
import Sheet from "./Sheet";

/**
 * Responsive dialog: renders a centered Modal on lg+ screens and a bottom
 * Sheet on smaller screens. All behavior (backdrop/Escape close, body scroll
 * lock, focus trap/restore, accessible dialog semantics, open/close
 * animations) is delegated to the shared overlay foundation.
 *
 * Props:
 *   open              — boolean
 *   onClose           — invoked when the dialog requests to close
 *   onRequestClose    — optional guard; forwarded to the surface
 *   title             — title shown in the title bar
 *   children          — body content
 *   footer            — optional footer content
 *   maxWidth          — width constraint class (default "max-w-lg")
 *   showCloseButton   — render the close button (default true)
 *   closeOnBackdrop   — backdrop click closes (default true)
 *   closeOnEscape     — Escape closes (default true)
 *   bodyClassName     — extra classes for the scrollable body wrapper
 */
export default function ResponsiveModal({
  open,
  onClose,
  onRequestClose,
  title,
  children,
  footer,
  maxWidth = "max-w-lg",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  bodyClassName,
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const commonProps = {
    open,
    onClose,
    onRequestClose,
    title,
    children,
    footer,
    maxWidth,
    showCloseButton,
    closeOnBackdrop,
    closeOnEscape,
    bodyClassName,
  };

  if (isDesktop) {
    return <Modal {...commonProps} />;
  }

  return <Sheet {...commonProps} />;
}