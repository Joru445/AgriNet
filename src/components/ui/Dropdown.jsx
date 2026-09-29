import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import useClickOutside from "../../hooks/useClickOutside";
import { dropdownMenu } from "../../utils/motion";

/**
 * Reusable Dropdown / Menu primitive powered by Motion for React.
 * Uses restrained vertical movement and subtle opacity fade.
 */
export default function Dropdown({
  trigger,
  children,
  align = "left",
  className = "",
  menuClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  const alignClass = align === "right" ? "right-0" : "left-0";

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {typeof trigger === "function" ? trigger({ open }) : trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdownMenu}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`absolute ${alignClass} top-full mt-1.5 z-50 min-w-44 rounded-xl border border-(--agri-border) bg-(--agri-card) p-1.5 shadow-lg ${menuClassName}`}
          >
            {typeof children === "function"
              ? children({ close: () => setOpen(false) })
              : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
