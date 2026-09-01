import { useEffect, useState, useCallback } from 'react'

/**
 * Hook to detect and manage PWA service worker updates.
 *
 * Uses the virtual module injected by vite-plugin-pwa when registerType: 'prompt'.
 * The SWregistration object provides `update()`, `waiting`, and `controller` properties.
 *
 * Usage:
 *   const { needRefresh, updateServiceWorker } = usePWAUpdate()
 *   // Show update prompt when needRefresh is true
 *   // Call updateServiceWorker() to apply the update
 */
export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [registration, setRegistration] = useState(null)

  const updateServiceWorker = useCallback(async (reloadPage = true) => {
    if (!registration?.waiting) {
      if (reloadPage) window.location.reload()
      return
    }

    // Send skip-waiting message to the waiting service worker
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Listen for the controlling change
    const onControlChange = () => {
      if (reloadPage) window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControlChange, {
      once: true,
    })
  }, [registration])

  useEffect(() => {
    // vite-plugin-pwa injects this module at build time
    // It exposes the SW registration and update lifecycle
    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({
        onNeedRefresh() {
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

  return { needRefresh, updateServiceWorker }
}
