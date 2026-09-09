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

// Handle background FCM messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    const title = payload.data?.title || payload.notification?.title || "AgriNet";
    const options = {
      body: payload.data?.body || payload.notification?.body || "",
      icon: payload.data?.senderAvatar || "/icon-192x192.png",
      badge: "/icon-192x192.png",
      image: payload.data?.senderAvatar || payload.notification?.image || undefined,
      data: payload.data || {},
      tag: payload.data?.tag || "agrinet-notification",
      renotify: true,
      vibrate: [100, 50, 100],
    };

    console.log("[FCM SW] background push:", { title, tag: options.tag });

    self.registration.showNotification(title, options);
  });
}

// Handle notification click — deep-link into the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};

  let targetUrl = data.url || "/";
  if (!data.url) {
    if (data.conversationId) {
      targetUrl = "/messages";
    } else if (data.inquiryId) {
      targetUrl = "/transactions";
    } else if (data.type === "message") {
      targetUrl = "/messages";
    } else if (data.type === "inquiry" || data.type === "transaction") {
      targetUrl = "/transactions";
    }
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
