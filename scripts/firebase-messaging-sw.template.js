// ============================================================
// Firebase Cloud Messaging Service Worker
// ============================================================
//
// This file is a TEMPLATE used by scripts/generate-fcm-sw.js.
// Do not edit the generated output directly. Run:
//
//   node scripts/generate-fcm-sw.js
//
// Firebase config source: environment variables (VITE_FIREBASE_*)
// or .env.local for local development.
//
// REGISTRATION SCOPE: this SW MUST be registered at its own sub-scope
// ("/fcm-notifications/", see src/firebase/messaging.js) so it never
// shares the "/" registration slot held by the Workbox PWA SW. Push
// events are delivered to the ACTIVE worker of the registration that
// owns the push subscription — not to the page controller.
//
// ARCHITECTURE: DATA-ONLY FCM.
// The backend sends data-only payloads (no `notification` field).
// This SW renders the OS notification via showNotification() exactly
// once. Do NOT add a `notification` field to the backend payload —
// that would cause FCM to auto-display AND this SW to display,
// producing duplicate notifications.
// ============================================================

importScripts(
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "__FIREBASE_AUTH_DOMAIN__",
  projectId: "__FIREBASE_PROJECT_ID__",
  storageBucket: "__FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__FIREBASE_APP_ID__",
};

let messaging = null;

// A CDN load/init failure must NOT break the SW install or the
// notificationclick handler below.
try {
  const app = firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();
  console.log("[FCM SW] initialized, projectId:", firebaseConfig.projectId);
} catch (err) {
  console.error("[FCM SW] Firebase initialization failed:", err);
}

// Allow the page to signal this SW to skip the waiting phase.
// This is required on Android Chrome where push events are only
// delivered to ACTIVE service workers.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// When activated, force this SW to active and claim open clients. At its
// dedicated sub-scope this never interferes with the Workbox "/" SW.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      self.skipWaiting();
      await self.clients.claim();
    })(),
  );
});

/**
 * Resolve the notification target URL from the FCM data payload.
 *
 * The backend sends:
 *   - conversationId: for message notifications
 *   - inquiryId / eventKey: for inquiry/transaction notifications
 *   - entityType + entityId: generic deep-link info
 *   - url: optional direct URL override
 */
function resolveTargetUrl(data) {
  if (!data) return "/";

  // Direct URL takes priority
  if (data.url && typeof data.url === "string") {
    if (data.url.startsWith("/") && !data.url.startsWith("//")) {
      return data.url;
    }
  }

  // Message notification → open the conversation directly
  if (data.conversationId) {
    return `/messages?conversation=${data.conversationId}`;
  }

  // Inquiry/transaction notification
  if (data.inquiryId || data.entityType === "inquiry") {
    return "/transactions";
  }

  if (data.entityType === "message") {
    return "/messages";
  }

  if (data.entityType === "transaction") {
    return "/transactions";
  }

  if (data.entityType === "product" && data.entityId) {
    return `/product/${data.entityId}`;
  }

  if (data.entityType === "notification") {
    return "/notifications";
  }

  return "/";
}

// Handle background FCM messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};

    // Title: backend sends it in data.title (data-only FCM).
    // Fallback to notification.title for any legacy payloads.
    const title = data.title || payload.notification?.title || "AgriNet";

    // Body: backend sends it in data.body
    const body = data.body || payload.notification?.body || "";

    // Tag: deterministic per-event deduplication.
    // Messages use message-{messageId}, others use eventKey or type-based tag.
    // Prevents duplicate notifications without collapsing unrelated events.
    const tag = data.tag || "agrinet-notification";

    const options = {
      body,
      // senderAvatar as the notification icon.
      icon: data.senderAvatar || null,
      data,
      tag,
      vibrate: [100, 50, 100],
    };

    console.log("[FCM SW] background message:", {
      title,
      tag,
      type: data.type || data.entityType || "unknown",
    });

    self.registration.showNotification(title, options);
  });
}

// Handle notification click — deep-link into the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = resolveTargetUrl(data);

  console.log("[FCM SW] notification clicked:", {
    tag: event.notification.tag,
    targetUrl,
  });

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Try to find an existing AgriNet window to focus
        for (const client of clientList) {
          if ("focus" in client && client.url.includes(self.location.origin)) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        // No existing window — open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
