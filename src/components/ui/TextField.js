'use client';

import Input from './Input';

export default function TextField({
  label,
  hint,
  error,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block leading-none text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </label>
      )}
      <div className="relative">
        {LeadingIcon && (
          <LeadingIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        )}
        <Input
          className={`${LeadingIcon ? 'pl-9' : ''} ${
            TrailingIcon ? 'pr-9' : ''
          } ${error ? 'border-red-500/70 focus-visible:ring-red-500' : ''}`}
          {...props}
        />
        {TrailingIcon && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-200 transition"
          >
            <TrailingIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs font-medium text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

