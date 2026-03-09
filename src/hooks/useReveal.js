'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * useReveal — triggers a "revealed" state when the element enters the viewport.
 * Uses IntersectionObserver with threshold 0.12.
 * Once revealed, the element is unobserved so it doesn't re-animate.
 *
 * Usage:
 *   const [ref, revealed] = useReveal();
 *   <div ref={ref} className={revealed ? 'revealed' : 'reveal-on-scroll'} />
 */
export function useReveal(threshold = 0.12) {
    const ref = useRef(null);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        // Respect prefers-reduced-motion
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            setRevealed(true);
            return;
        }

        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRevealed(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, revealed];
}