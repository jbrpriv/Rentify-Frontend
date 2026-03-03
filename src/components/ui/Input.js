'use client';

import clsx from 'clsx';

export default function Input({ className, ...props }) {
  return (
    <input
      className={clsx(
        'w-full rounded-xl border rf-border-subtle bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition duration-200 ease-[cubic-bezier(0.21,0.6,0.35,1)]',
        className
      )}
      {...props}
    />
  );
}