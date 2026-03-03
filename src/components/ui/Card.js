'use client';

import clsx from 'clsx';

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        'rf-card rf-hover-card border border-[#E0EDC5] text-neutral-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

