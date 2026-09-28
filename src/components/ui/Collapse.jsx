import { motion, AnimatePresence } from "motion/react";
import { collapsePanel } from "../../utils/motion";

/**
 * Expandable / Collapsible container using Motion for React.
 * Animates height and opacity cleanly without abrupt content pops.
 */
export default function Collapse({ open, children, className = "" }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="collapse-content"
          variants={collapsePanel}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
