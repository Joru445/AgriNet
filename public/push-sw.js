/*
 * AgriNet Push Notification Service Worker
 *
 * This is a lightweight SW registered alongside the Workbox-generated SW.
 * It handles:
 *   - push events → show system notification
 *   - notificationclick events → deep-link navigation into the app
 *
 * The Workbox SW (sw.js) handles caching/precaching.
 * This SW handles push notifications only.
 */

// eslint-disable-next-line no-undef
const sw = self;

sw.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: "AgriNet",
      body: event.data.text(),
    };
  }

  const title = payload.title || "AgriNet";
  const options = {
    body: payload.body || "",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    image: payload.image || undefined,
    data: payload.data || {},
    tag: payload.tag || "agrinet-notification",
    renotify: true,
    vibrate: [100, 50, 100],
    actions: payload.actions || [],
  };

  event.waitUntil(sw.registration.showNotification(title, options));
});

sw.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || "/";

  event.waitUntil(
    sw.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }

      // Otherwise, open a new window
      if (sw.clients.openWindow) {
        return sw.clients.openWindow(targetUrl);
      }
    }),
  );
});

// Handle notification close (for analytics if needed in the future)
sw.addEventListener("notificationclose", () => {
  // No-op for now
});
