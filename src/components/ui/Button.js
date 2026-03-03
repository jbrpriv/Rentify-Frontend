'use client';

import clsx from 'clsx';

const base =
  'inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed transition-transform duration-150 ease-[cubic-bezier(0.22,1.25,0.36,1)]';

const variants = {
  primary:
    'rf-btn-primary focus-visible:ring-blue-600',
  secondary:
    'rf-btn-secondary focus-visible:ring-slate-500',
  ghost:
    'rf-btn-ghost hover:bg-slate-800/80 focus-visible:ring-slate-600',
  danger:
    'rf-btn-danger focus-visible:ring-red-500',
};

export default function Button({
  variant = 'primary',
  className,
  children,
  ...props
}) {
  const classes = clsx(base, variants[variant], className);
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}