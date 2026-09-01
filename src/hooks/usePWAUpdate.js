import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Hook to detect and manage PWA service worker updates.
 *
 * Uses the virtual module injected by vite-plugin-pwa when registerType: 'prompt'.
 *
 * Key behavior:
 * - Suppresses the update prompt on initial page load (Workbox detects
 *   a "new" SW on every build due to asset hash changes, even when no
 *   code changed).
 * - Only shows the prompt when a genuinely new version is deployed
 *   while the user is actively browsing.
 * - Tracks dismissal in sessionStorage so the prompt doesn't reappear
 *   during the same session after the user taps "Later".
 */
export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [registration, setRegistration] = useState(null)

  // Suppress the first onNeedRefresh call that fires during initial SW registration.
  // After ~3 seconds the SW registration + update check cycle is complete.
  const initialLoadRef = useRef(true)
  // Track if the user dismissed the prompt this session.
  const dismissedRef = useRef(
    typeof sessionStorage !== 'undefined' &&
    sessionStorage.getItem('pwa_update_dismissed') === 'true',
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      initialLoadRef.current = false
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const updateServiceWorker = useCallback(async (reloadPage = true) => {
    if (!registration?.waiting) {
      if (reloadPage) window.location.reload()
      return
    }

    registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    const onControlChange = () => {
      if (reloadPage) window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControlChange, {
      once: true,
    })
  }, [registration])

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false)
    dismissedRef.current = true
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('pwa_update_dismissed', 'true')
    }
  }, [])

  useEffect(() => {
    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({
        onNeedRefresh() {
          // Skip on initial page load — the Workbox SW always detects a
          // "new" version on first registration because Vite hashes assets.
          // Also skip if the user already dismissed the prompt this session.
          if (initialLoadRef.current || dismissedRef.current) return
          setNeedRefresh(true)
        },
        onOfflineReady() {
          console.log('[PWA] App ready for offline use')
        },
        onRegisteredSW(swUrl, swReg) {
          setRegistration(swReg)
          console.log('[PWA] Service worker registered:', swUrl)
        },
        onRegisterError(error) {
          console.error('[PWA] Service worker registration failed:', error)
        },
      })
    }).catch((err) => {
      // Not in a PWA context or module not available (dev mode)
      console.debug('[PWA] Not available:', err?.message)
    })
  }, [])

  return { needRefresh, updateServiceWorker, dismissUpdate }
}
