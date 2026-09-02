import { useLocation } from "react-router-dom";

/**
 * Lightweight, CSS-only page transition. Keys a wrapper by the current path
 * so any route change re-triggers a subtle fade + vertical slide on the newly
 * mounted page content.
 *
 * Persistent navigation (Header, Sidebar, BottomTab) stays mounted outside
 * this wrapper, so only the changing page content animates. The animation is a
 * single GPU-friendly `opacity`/`transform` keyframe defined in the global CSS
 * (`anim-page-enter`) and is automatically neutralized by the app's existing
 * `prefers-reduced-motion` rules.
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="anim-page-enter min-h-full h-full"
    >
      {children}
    </div>
  );
}