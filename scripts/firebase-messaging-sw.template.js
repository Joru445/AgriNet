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

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Allow the page to signal this SW to skip the waiting phase.
// This is required on Android Chrome where push events are only
// delivered to ACTIVE service workers.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// When activated, claim all open clients immediately so push
// events are routed here instead of a competing SW.
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle background FCM messages
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || "AgriNet";
  const options = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    image: payload.notification?.image || payload.data?.image || undefined,
    data: payload.data || {},
    tag: payload.data?.tag || "agrinet-notification",
    renotify: true,
    vibrate: [100, 50, 100],
  };

  self.registration.showNotification(title, options);
});

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
