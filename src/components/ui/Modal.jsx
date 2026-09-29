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
    >
      {({ close }) => (
        <motion.div
          key="modal-panel"
          variants={modalDialog}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`relative mx-auto flex w-full max-h-[90dvh] flex-col overflow-hidden rounded-2xl border border-(--agri-border) bg-(--agri-card) shadow-2xl pointer-events-auto ${maxWidth} ${panelClassName}`}
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
