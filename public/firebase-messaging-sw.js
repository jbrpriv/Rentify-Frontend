/**
 * firebase-messaging-sw.js — Service Worker for Background Push Notifications
 *
 * Browser pushes that arrive while the app is in the background (or closed)
 * are handled here by Firebase Messaging. The service worker must be at the
 * root of the public dir so it has the correct scope to intercept /api calls.
 *
 * IMPORTANT: This file runs in a Service Worker context — it has no access to
 * `window`, `document`, React, or your Next.js app state. Keep it plain JS.
 *
 * The FIREBASE_* values below are replaced at build-time by Next.js when
 * injected via next.config.mjs env. However, service workers run before
 * Next.js can inject env vars, so we use importScripts and read them from a
 * separate injected file, or hardcode config here for the service worker only.
 *
 * EASIEST APPROACH (used here): Self-configure via the Firebase compat SDK
 * which lets us call `firebase.initializeApp` with a global config injected
 * from the HTML page via a `<link rel="preload">` or meta tag. We use the
 * recommended pattern of reading from a self-configuring bundle.
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ─── Firebase config ─────────────────────────────────────────────────────────
// These are the *public* web config values (safe to expose in client code).
// They mirror your NEXT_PUBLIC_FIREBASE_* env vars.
// Keep these in sync with src/utils/firebase.js.
//
// You MUST replace the placeholder values below with your actual Firebase
// project config from the Firebase Console → Project Settings → Your apps.

const firebaseConfig = {
    apiKey: 'AIzaSyAWAOtIA_9cC5hghbIj28GWgroQUJWqiLg',
    authDomain: 'rentifypro-778cd.firebaseapp.com',
    projectId: 'rentifypro-778cd',
    storageBucket: 'rentifypro-778cd.firebasestorage.app',
    messagingSenderId: '693283110573',
    appId: '1:693283110573:web:c86892664eebabf6d25024',
};

// ─── Init ─────────────────────────────────────────────────────────────────────
if (firebaseConfig.projectId) {
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    // ─── Background message handler ───────────────────────────────────────────
    // Called when a push arrives while the page is in the background/closed.
    // NOTE: If the push payload contains a `notification` object, Firebase will
    // AUTOMATICALLY display an OS notification. We do NOT need to call 
    // `showNotification` manually unless we are handling pure "data" messages.
    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw] Received background message:', payload);

        // Only show manually if Firebase didn't automatically show it (i.e. data-only push)
        if (!payload.notification && payload.data) {
            self.registration.showNotification(payload.data.title || 'RentifyPro', {
                body: payload.data.body || '',
                icon: '/icons/icon-192x192.png',
                data: payload.data,
            });
        }
    });

    // ─── Notification click handler ───────────────────────────────────────────
    self.addEventListener('notificationclick', (event) => {
        event.notification.close();
        const url = event.notification.data?.url || '/dashboard';
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
                // If the dashboard is already open, focus it
                for (const client of windowClients) {
                    if (client.url.includes('/dashboard') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open a new tab
                if (clients.openWindow) return clients.openWindow(url);
            })
        );
    });
} else {
    console.warn('[firebase-messaging-sw] Firebase not configured — push notifications disabled.');
}
