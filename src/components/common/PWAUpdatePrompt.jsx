import { usePWAUpdate } from '../../hooks/usePWAUpdate'

/**
 * Non-intrusive prompt displayed when a new version of AgriNet is available.
 * The user can dismiss it or tap "Update" to apply the update and reload.
 *
 * Dismissal is tracked in sessionStorage so the prompt does not reappear
 * during the same session unless a genuinely new update is detected.
 */
export default function PWAUpdatePrompt() {
  const { needRefresh, updateServiceWorker, dismissUpdate } = usePWAUpdate()

  if (!needRefresh) return null

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-[99998] sm:left-auto sm:right-6 sm:max-w-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-[#1B4332] px-4 py-3 text-white shadow-xl shadow-black/20 border border-white/10">
        <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <i className="ri-refresh-line text-lg" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Update available</p>
          <p className="text-xs text-white/70 mt-0.5">
            A new version of AgriNet is ready.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={dismissUpdate}
            className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition-colors cursor-pointer"
          >
            Later
          </button>
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="rounded-xl bg-[#52B788] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#40916C] transition-colors cursor-pointer"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
