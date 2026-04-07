'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let isMounted = true;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller &&
              isMounted &&
              registration.waiting
            ) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      } catch {
        // Keep app functional even if SW registration fails.
      }
    };

    register();

    const onControllerChange = () => {
      if (isMounted) window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      isMounted = false;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  return null;
}