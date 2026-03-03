'use client';

import clsx from 'clsx';

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        'rf-card rf-hover-card bg-slate-900/80 border border-slate-700/60 text-slate-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

