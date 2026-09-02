import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePWAUpdate } from '../../hooks/usePWAUpdate'
import { useLanguage } from "../../context/LanguageContext";

/**
 * Non-intrusive prompt displayed when a new version of AgriNet is available.
 * The user can dismiss it or tap "Update" to apply the update and reload.
 *
 * - Appears as a floating toast near the bottom by default.
 * - When the user is on a Settings page, it is shown pinned to the top of
 *   the settings screen instead.
 *
 * Dismissal is tracked in sessionStorage so the prompt does not reappear
 * during the same session unless a genuinely new update is detected.
 */
export default function PWAUpdatePrompt() {
  const { needRefresh, updateServiceWorker, dismissUpdate } = usePWAUpdate()
  const { t } = useLanguage();
  const location = useLocation();
  const isSettings = location.pathname.includes("settings");
  const [shouldRender, setShouldRender] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (needRefresh) {
      setShouldRender(true)
      setAnimating(false)
    } else if (shouldRender) {
      setAnimating(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
        setAnimating(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [needRefresh, shouldRender])

  if (!shouldRender) return null

  const isClosing = animating

  // Settings route: top-pinned banner instead of the floating toast.
  if (isSettings) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-[99998] px-4 pt-4"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto max-w-3xl">
          <div className={`flex items-center gap-3 rounded-2xl bg-[#1B4332] px-4 py-3 text-white shadow-xl shadow-black/20 border border-white/10 ${isClosing ? "anim-slide-up" : "anim-slide-down"}`}>
            <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <i className="ri-refresh-line text-lg" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{t("pwaUpdate.title")}</p>
              <p className="text-xs text-white/70 mt-0.5">
                {t("pwaUpdate.description")}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={dismissUpdate}
                className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-colors cursor-pointer"
              >
                {t("pwaUpdate.later")}
              </button>
              <button
                type="button"
                onClick={() => updateServiceWorker(true)}
                className="rounded-xl bg-[#52B788] px-4 py-2 text-sm font-bold text-white hover:bg-[#40916C] transition-colors cursor-pointer"
              >
                {t("pwaUpdate.update")}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-[99998] sm:left-auto sm:right-6 sm:max-w-sm"
      role="status"
      aria-live="polite"
    >
      <div className={`flex items-center gap-3 rounded-2xl bg-[#1B4332] px-4 py-3 text-white shadow-xl shadow-black/20 border border-white/10 ${isClosing ? "anim-fade-out" : "anim-slide-in-up"}`}>
        <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <i className="ri-refresh-line text-lg" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{t("pwaUpdate.title")}</p>
          <p className="text-xs text-white/70 mt-0.5">
            {t("pwaUpdate.description")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={dismissUpdate}
            className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-colors cursor-pointer"
          >
            {t("pwaUpdate.later")}
          </button>
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="rounded-xl bg-[#52B788] px-4 py-2 text-sm font-bold text-white hover:bg-[#40916C] transition-colors cursor-pointer"
          >
            {t("pwaUpdate.update")}
          </button>
        </div>
      </div>
    </div>
  )
}