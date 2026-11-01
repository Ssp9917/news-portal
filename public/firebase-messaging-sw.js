/* eslint-disable no-restricted-globals */
// Firebase Messaging Service Worker for Bharat Pulse

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
// If config is dynamic, it defaults to standard project parameters
const firebaseConfig = {
  apiKey: "AIzaSyDOljvGkGqjbybnxTgY4a7YRHtyPhN5NxY",
  authDomain: "news-portal-5f3ad.firebaseapp.com",
  projectId: "news-portal-5f3ad",
  storageBucket: "news-portal-5f3ad.firebasestorage.app",
  messagingSenderId: "262703183628",
  appId: "1:262703183628:web:2559e2b7031e9dd984bb29",
  measurementId: "G-8617PKNEFF"
};

if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (e) {
    console.warn("Firebase SW initialization error:", e);
  }
}

// Background message handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.notification?.title || data.data?.title || "Bharat Pulse | ब्रेकिंग न्यूज़";
    const body = data.notification?.body || data.data?.body || data.data?.message || "ताज़ा समाचार पढ़ने के लिए टैप करें।";
    const icon = data.notification?.icon || data.data?.icon || "/favicon.svg";
    const image = data.notification?.image || data.data?.image || null;
    const url = data.data?.url || data.notification?.click_action || "/";

    const options = {
      body,
      icon,
      badge: "/favicon.svg",
      image,
      data: { url },
      vibrate: [200, 100, 200],
      actions: [
        { action: "open", title: "खबर पढ़ें (Read Story)" },
        { action: "close", title: "हटाएं (Dismiss)" },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    // If not JSON, show raw text
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Bharat Pulse News", {
        body: text,
        icon: "/favicon.svg",
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
