import { getAccessToken } from '@/utils/api';
/**
 * firebase.js — Frontend Firebase / FCM push notification utility
 *
 * HOW IT WORKS
 * ─────────────
 * On the web, Firebase Cloud Messaging uses a Service Worker
 * (`public/firebase-messaging-sw.js`) to receive background notifications.
 * This file handles:
 *   1. Initialising the Firebase web app (client-side, safe for browser)
 *   2. Requesting permission and obtaining the FCM registration token
 *   3. Sending that token to the Rentify backend via POST /api/auth/fcm-token
 *      so the server can target pushes to this specific browser/device
 *
 * ENV VARS REQUIRED (add to .env.local):
 *   NEXT_PUBLIC_FIREBASE_API_KEY
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *   NEXT_PUBLIC_FIREBASE_APP_ID
 *   NEXT_PUBLIC_FIREBASE_VAPID_KEY   ← Web Push certificate from Firebase Console
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from '@/utils/api';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// ─── Lazy singletons so we don't re-init on every import ─────────────────────
let _app = null;
let _messaging = null;

function getFirebaseApp() {
    if (!_app) {
        _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    }
    return _app;
}

function getFirebaseMessaging() {
    if (!_messaging) {
        _messaging = getMessaging(getFirebaseApp());
    }
    return _messaging;
}

/**
 * isConfigured — returns false if any required env var is missing so we can
 * silently skip FCM registration in environments where Firebase isn't set up.
 */
function isConfigured() {
    return !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
        VAPID_KEY
    );
}

/**
 * requestFCMToken
 *
 * @param {boolean} promptPermission
 *   true  → show the browser notification permission dialog if not yet granted
 *          (call this on explicit login/signup events)
 *   false → only fetch a token if permission is already 'granted'; never prompt
 *          (call this on silent re-hydration like page load)
 *
 * @returns {Promise<string|null>} the FCM token, or null on failure/denied/unsupported
 */
export async function requestFCMToken(promptPermission = false) {
    if (typeof window === 'undefined') return null;

    if (!isConfigured()) {
        console.error('[FCM] Not configured. Missing NEXT_PUBLIC_FIREBASE_* vars.');
        return null;
    }

    if (!('Notification' in window)) {
        if (process.env.NODE_ENV !== 'production') console.warn('[FCM] Browser does not support notifications.');
        return null;
    }

    if (!('serviceWorker' in navigator)) {
        if (process.env.NODE_ENV !== 'production') console.warn('[FCM] Browser does not support service workers.');
        return null;
    }

    const currentPermission = Notification.permission;
    if (process.env.NODE_ENV !== 'production') console.log(`[FCM] Current permission: ${currentPermission}, Prompting: ${promptPermission}`);

    if (currentPermission === 'denied') return null;

    if (currentPermission !== 'granted' && !promptPermission) {
        if (process.env.NODE_ENV !== 'production') console.log('[FCM] Permission not granted and prompt=false. Exiting.');
        return null;
    }

    try {
        if (process.env.NODE_ENV !== 'production') console.log('[FCM] Registering service worker...');
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
        if (process.env.NODE_ENV !== 'production') console.log('[FCM] SW registered:', registration.active ? 'active' : 'installing');

        const messaging = getFirebaseMessaging();

        if (process.env.NODE_ENV !== 'production') console.log('[FCM] Requesting token...');
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        if (!token) {
            if (process.env.NODE_ENV !== 'production') console.warn('[FCM] getToken returned null or empty.');
            return null;
        }

        if (process.env.NODE_ENV !== 'production') console.log('[FCM] Token acquired, sending to backend...');

        // Wait until the auth token is in localStorage (set during login) before
        // calling the backend — poll for up to 5 seconds instead of a blind delay.
        const authReady = await new Promise((resolve) => {
            if (getAccessToken()) { resolve(true); return; }
            // Poll with exponential back-off instead of a tight 100ms interval
            let attempts = 0;
            const delays = [100, 200, 400, 800, 1500, 2000];
            function check() {
                if (getAccessToken()) { resolve(true); return; }
                if (attempts >= delays.length) { resolve(false); return; }
                setTimeout(check, delays[attempts++]);
            }
            setTimeout(check, delays[attempts++]);
        });

        if (!authReady) {
            if (process.env.NODE_ENV !== 'production') console.warn('[FCM] Auth token not available after 5s — skipping backend registration.');
            return token;
        }

        await api.post('/auth/fcm-token', { fcmToken: token }).then(() => {
            if (process.env.NODE_ENV !== 'production') console.log('[FCM] Successfully registered token with backend.');
        }).catch((err) => {
            console.error('[FCM] Backend registration failed:', err.response?.data?.message || err.message);
        });

        return token;
    } catch (err) {
        console.error('[FCM] Fatal error during token request:', err);
        return null;
    }
}

/**
 * onForegroundMessage
 *
 * Subscribe to messages while the app is in the foreground.
 * Firebase does NOT show an OS notification when the app is in focus —
 * call this to handle them manually (e.g. show a toast).
 *
 * @param {(payload: object) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function onForegroundMessage(callback) {
    if (typeof window === 'undefined' || !isConfigured()) return () => { };
    try {
        const messaging = getFirebaseMessaging();
        return onMessage(messaging, callback);
    } catch {
        return () => { };
    }
}
