/* global importScripts, firebase, clients */
// Firebase Cloud Messaging background handler.
//
// This runs even when the app is closed, which is the whole point — the older
// utils/notifications.js can only fire while a tab is open.
//
// It registers under FCM's own scope (/firebase-cloud-messaging-push-scope),
// so it coexists with the PWA cache worker at /sw.js rather than replacing it.
//
// The config is duplicated here on purpose: a service worker cannot import
// from the app bundle. Keep it in sync with src/firebase.js. These are public
// client identifiers, not secrets.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBUgvaew_XA3QRZzlQ_eEv1JA375IfgZKs",
  authDomain: "chandabook-utsav.firebaseapp.com",
  projectId: "chandabook-utsav",
  storageBucket: "chandabook-utsav.firebasestorage.app",
  messagingSenderId: "870424515514",
  appId: "1:870424515514:web:375d8cd414437deba3c383"
});

const messaging = firebase.messaging();

// Fired when a data-only message arrives with the app in the background.
// The Cloud Function sends data-only payloads so the title/body are built here
// and Chrome does not also show its own duplicate notification.
messaging.onBackgroundMessage((payload) => {
  const { title, body, url } = payload.data || {};
  if (!title) return;

  self.registration.showNotification(title, {
    body: body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.tag || 'chandabook-activity',
    data: { url: url || '/' }
  });
});

// Focus an existing tab if the app is already open, otherwise open a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(target);
          return client.focus();
        }
      }
      return clients.openWindow(target);
    })
  );
});
