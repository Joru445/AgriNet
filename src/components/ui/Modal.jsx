import { useId } from "react";
import { motion } from "motion/react";

import Overlay from "./Overlay";
import { modalDialog } from "../../utils/motion";

/**
 * Centered modal dialog built on the Overlay foundation.
 * Integrated with Motion for React for smooth, restrained elevation.
 */
export default function Modal({
  open,
  onClose,
  onRequestClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-lg",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  zIndex,
  ariaLabel,
  bodyClassName = "",
  panelClassName = "",
  hideTitleBar = false,
  placement = "center",
}) {
  const titleId = useId();
  const descriptionId = useId();

  const showTitleBar = !hideTitleBar && (title || showCloseButton);

  return (
    <Overlay
      open={open}
      onClose={onClose}
      onRequestClose={onRequestClose}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
      zIndex={zIndex}
      ariaLabel={ariaLabel ?? (title ? undefined : "Dialog")}
      ariaLabelledBy={title ? titleId : undefined}
      ariaDescribedBy={description ? descriptionId : undefined}
      positionClass={placement === "right" ? "items-stretch justify-end p-0" : undefined}
    >
      {({ close }) => (
        <motion.div
          key="modal-panel"
          variants={placement === "right" ? {
            initial: { opacity: 0, x: "100%" },
            animate: { opacity: 1, x: 0, transition: { duration: 0.24 } },
            exit: { opacity: 0, x: "100%", transition: { duration: 0.18 } },
          } : modalDialog}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`relative ${placement === "right" ? "ml-auto h-full max-h-none rounded-none border-y-0 border-r-0" : "mx-auto max-h-[90dvh] rounded-2xl"} flex w-full flex-col overflow-hidden border border-(--agri-border) bg-(--agri-card) shadow-2xl pointer-events-auto ${maxWidth} ${panelClassName}`}
        >
          {showTitleBar && (
            <div className="flex shrink-0 items-center justify-between border-b border-(--agri-border-subtle) px-5 py-4">
              <div>
                {title && (
                  <h2 id={titleId} className="text-lg font-bold text-(--agri-text)">
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={descriptionId}
                    className="mt-0.5 text-sm text-(--agri-text-secondary)"
                  >
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-(--agri-text-muted) transition-colors cursor-pointer hover:bg-(--agri-hover) hover:text-(--agri-text-secondary)"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              )}
            </div>
          )}

          <div
            className={`flex-1 min-h-0 overflow-y-auto overscroll-contain ${
              bodyClassName || "p-2 px-4"
            }`}
          >
            {children}
          </div>

          {footer && (
            <div className="shrink-0 border-t border-(--agri-border-subtle) px-5 py-4">
              {typeof footer === "function" ? footer({ close }) : footer}
            </div>
          )}
        </motion.div>
      )}
    </Overlay>
  );
}
