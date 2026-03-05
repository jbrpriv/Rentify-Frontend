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
    // Guard: only runs in browser
    if (typeof window === 'undefined') return null;

    // Guard: Firebase not configured in this environment
    if (!isConfigured()) {
        console.info('FCM not configured — skipping push registration.');
        return null;
    }

    // Guard: browser doesn't support notifications API at all
    if (!('Notification' in window)) return null;

    // Guard: Service worker support required for Web Push
    if (!('serviceWorker' in navigator)) return null;

    const currentPermission = Notification.permission;

    // If the user has blocked notifications, there's nothing we can do
    if (currentPermission === 'denied') return null;

    // If permission not yet asked and the caller doesn't want a prompt, exit early
    if (currentPermission !== 'granted' && !promptPermission) return null;

    try {
        // Register (or re-use) the service worker that handles background messages
        const registration = await navigator.serviceWorker.register(
            '/firebase-messaging-sw.js',
            { scope: '/' }
        );

        const messaging = getFirebaseMessaging();

        // getToken() will trigger the browser permission dialog if promptPermission
        // is true and permission hasn't been granted yet.
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        if (!token) return null;

        // Persist to the backend (fire-and-forget; we don't block UX on this)
        await api.post('/auth/fcm-token', { fcmToken: token }).catch((err) => {
            console.warn('FCM token registration failed:', err.message);
        });

        return token;
    } catch (err) {
        // Common reasons: user dismissed the prompt, browser privacy mode, etc.
        console.warn('FCM token request failed:', err.message);
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
