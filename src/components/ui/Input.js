'use client';

import clsx from 'clsx';

export default function Input({ className, ...props }) {
  return (
    <input
      className={clsx(
        'w-full rounded-xl border rf-border-subtle bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition duration-normal ease-rf-standard',
        className
      )}
      {...props}
    />
  );
}

