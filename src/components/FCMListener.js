'use client';

import { useEffect } from 'react';
import { onForegroundMessage } from '@/utils/firebase';
import toast from 'react-hot-toast';

export default function FCMListener() {
    useEffect(() => {
        const unsubscribe = onForegroundMessage((payload) => {
            console.log('[FCM Foreground] Message received:', payload);

            // Extract title and body from either the notification or data payload
            const { title, body } = payload.notification || payload.data || {};

            if (title || body) {
                toast((t) => (
                    <div className="flex flex-col gap-1 pr-2">
                        {title && <h3 className="font-semibold text-sm text-gray-900">{title}</h3>}
                        {body && <p className="text-xs text-gray-600">{body}</p>}
                    </div>
                ), {
                    duration: 6000,
                    position: 'top-right',
                    style: {
                        border: '1px solid #E5E7EB',
                        padding: '12px 16px',
                        color: '#111827',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    },
                });
            }
        });

        return unsubscribe;
    }, []);

    return null; // Invisible component, purely handles side logic
}
