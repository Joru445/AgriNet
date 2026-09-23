import { useEffect, useState, useCallback } from 'react'

let globalRegistration = null
let globalUpdateSW = null
let globalNeedRefresh = false
let globalIsChecking = false
const listeners = new Set()

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(globalNeedRefresh, globalIsChecking)
    } catch (e) {
      console.warn('[PWA] Listener error:', e)
    }
  })
}

function setupRegistrationListeners(reg) {
  if (!reg) return
  globalRegistration = reg

  // Check if a service worker is already waiting to activate
  if (reg.waiting && navigator.serviceWorker?.controller) {
    globalNeedRefresh = true
    notifyListeners()
  }

  // If a worker is currently installing, watch for it to finish installing
  if (reg.installing) {
    reg.installing.addEventListener('statechange', (e) => {
      if (e.target.state === 'installed' && navigator.serviceWorker?.controller) {
        globalNeedRefresh = true
        notifyListeners()
      }
    })
  }

  // Listen for future updates found during this session
  reg.addEventListener('updatefound', () => {
    const newWorker = reg.installing
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker?.controller) {
          globalNeedRefresh = true
          notifyListeners()
        }
      })
    }
  })
}

let initPromise = null
function initPWARegistration() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve()
  }
  if (initPromise) return initPromise

  initPromise = import('virtual:pwa-register')
    .then(({ registerSW }) => {
      globalUpdateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log('[PWA] onNeedRefresh triggered')
          globalNeedRefresh = true
          notifyListeners()
        },
        onOfflineReady() {
          console.log('[PWA] App ready for offline use')
        },
        onRegisteredSW(swUrl, swReg) {
          console.log('[PWA] Service worker registered:', swUrl)
          setupRegistrationListeners(swReg)
        },
        onRegisterError(error) {
          console.error('[PWA] Service worker registration failed:', error)
        },
      })

      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setupRegistrationListeners(reg)
        }
      })
    })
    .catch((err) => {
      console.debug('[PWA] Virtual module not available:', err?.message)
    })

  return initPromise
}

// Auto-initialize PWA registration on module load
initPWARegistration()

// Setup automatic background update checks and seamless auto-activation
if (typeof window !== 'undefined') {
  // Check when user resumes or focuses the app
  window.addEventListener('focus', () => {
    checkForUpdate()
  })

  // Check when returning online
  window.addEventListener('online', () => {
    checkForUpdate()
  })

  // When app goes into background or screen turns off, if an update is waiting,
  // silently activate the new service worker so the app is already updated on next open
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && globalNeedRefresh) {
      updateServiceWorker(false)
    } else if (document.visibilityState === 'visible') {
      checkForUpdate()
    }
  })

  // Periodic background update check every 15 minutes
  setInterval(() => {
    checkForUpdate()
  }, 15 * 60 * 1000)
}

export async function checkForUpdate() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }
  globalIsChecking = true
  notifyListeners()

  try {
    await initPWARegistration()

    const reg = globalRegistration || (await navigator.serviceWorker.getRegistration())
    if (reg) {
      globalRegistration = reg
      if (reg.waiting && navigator.serviceWorker?.controller) {
        globalNeedRefresh = true
        globalIsChecking = false
        notifyListeners()
        return true
      }

      // Proactively check with the server for newer service worker script
      await reg.update()

      if (reg.waiting && navigator.serviceWorker?.controller) {
        globalNeedRefresh = true
      }
    }
  } catch (err) {
    console.debug('[PWA] checkForUpdate error:', err)
  } finally {
    globalIsChecking = false
    notifyListeners()
  }

  return globalNeedRefresh
}

export async function updateServiceWorker(reloadPage = true) {
  let reloaded = false
  const reload = () => {
    if (!reloaded && reloadPage) {
      reloaded = true
      window.location.reload()
    }
  }

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        reload()
      },
      { once: true }
    )

    const reg = globalRegistration || (await navigator.serviceWorker.getRegistration())
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  if (globalUpdateSW) {
    try {
      await globalUpdateSW(true)
    } catch (e) {
      console.warn('[PWA] globalUpdateSW error:', e)
    }
  }

  if (reloadPage) {
    setTimeout(() => {
      reload()
    }, 1200)
  }
}

/**
 * Hook to detect and manage PWA service worker updates.
 */
export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(globalNeedRefresh)
  const [isChecking, setIsChecking] = useState(globalIsChecking)

  useEffect(() => {
    setNeedRefresh(globalNeedRefresh)
    setIsChecking(globalIsChecking)

    const listener = (refreshVal, checkingVal) => {
      setNeedRefresh(refreshVal)
      setIsChecking(checkingVal)
    }

    listeners.add(listener)

    // Actively check for service worker updates upon mounting
    checkForUpdate()

    return () => {
      listeners.delete(listener)
    }
  }, [])

  const triggerUpdate = useCallback(async (reloadPage = true) => {
    await updateServiceWorker(reloadPage)
  }, [])

  const triggerCheck = useCallback(async () => {
    return await checkForUpdate()
  }, [])

  return {
    needRefresh,
    isChecking,
    checkForUpdate: triggerCheck,
    updateServiceWorker: triggerUpdate,
  }
}
