// Firebase Cloud Messaging Service Worker
// This file handles background notifications when the app is not in focus

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyA8e3lUkkoyfp42HIwxLX9IgKGqmOacxl0",
  authDomain: "just-us-53056.firebaseapp.com",
  projectId: "just-us-53056",
  storageBucket: "just-us-53056.firebasestorage.app",
  messagingSenderId: "247025722834",
  appId: "1:247025722834:web:e534ff23c1d58e05cd140b"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Memory Added';
  const notificationOptions = {
    body: payload.notification?.body || 'A new memory was added',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'memory-notification',
    data: payload.data,
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
