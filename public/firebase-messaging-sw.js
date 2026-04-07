const CACHE_PREFIX = 'rentify';
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `${CACHE_PREFIX}-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

const CORE_ASSETS = ['/', OFFLINE_URL, '/manifest.webmanifest', '/favicon.ico', '/icons/icon.svg'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => undefined)
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

function isAssetRequest(request) {
    return ['style', 'script', 'font', 'image', 'worker'].includes(request.destination);
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    const networkPromise = fetch(request)
        .then((response) => {
            if (response && response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => undefined);

    return cached || networkPromise || Response.error();
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    const isSameOrigin = url.origin === self.location.origin;

    if (!isSameOrigin) return;

    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(request));
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(async () => {
                const offlineResponse = await caches.match(OFFLINE_URL);
                return offlineResponse || Response.error();
            })
        );
        return;
    }

    if (isAssetRequest(request)) {
        event.respondWith(staleWhileRevalidate(request));
    }
});

try {
    importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

    const firebaseConfig = {
        apiKey: 'AIzaSyAWAOtIA_9cC5hghbIj28GWgroQUJWqiLg',
        authDomain: 'rentifypro-778cd.firebaseapp.com',
        projectId: 'rentifypro-778cd',
        storageBucket: 'rentifypro-778cd.firebasestorage.app',
        messagingSenderId: '693283110573',
        appId: '1:693283110573:web:c86892664eebabf6d25024',
    };

    if (firebaseConfig.projectId && self.firebase) {
        firebase.initializeApp(firebaseConfig);
        const messaging = firebase.messaging();

        messaging.onBackgroundMessage((payload) => {
            if (!payload.notification && payload.data) {
                self.registration.showNotification(payload.data.title || 'RentifyPro', {
                    body: payload.data.body || '',
                    icon: '/icons/icon.svg',
                    badge: '/icons/icon.svg',
                    data: payload.data,
                });
            }
        });
    }
} catch {
    // Firebase SDK failed to load; app shell and offline support still work.
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes('/dashboard') && 'focus' in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) return clients.openWindow(url);
            return undefined;
        })
    );
});
