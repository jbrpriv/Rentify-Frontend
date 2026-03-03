'use client';

import clsx from 'clsx';

const base =
  'inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-full px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-transform duration-150 ease-[cubic-bezier(0.22,1.25,0.36,1)] hover:scale-[1.02] active:scale-[0.97]';

const variants = {
  primary:
    'rf-btn-primary focus-visible:ring-[#0B2D72]',
  secondary:
    'rf-btn-secondary focus-visible:ring-[#0992C2]',
  ghost:
    'rf-btn-ghost focus-visible:ring-[#0AC4E0]',
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