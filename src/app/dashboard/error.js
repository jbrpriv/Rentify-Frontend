'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log to console — swap with Sentry in production
    console.error('[app error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FBFC] px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
            <AlertTriangle className="w-9 h-9 text-red-500" />
          </div>
        </div>

        {/* Copy */}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          An unexpected error occurred. Our team has been notified. You can try
          refreshing the page or returning to the dashboard.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0B2D72] to-[#0992C2] text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-blue-800/20"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>

        {/* Error detail (dev only) */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <details className="mt-8 text-left">
            <summary className="text-xs text-gray-400 cursor-pointer font-medium">
              Error details (development only)
            </summary>
            <pre className="mt-2 p-3 bg-gray-900 text-red-400 rounded-xl text-xs overflow-auto max-h-32 leading-relaxed">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}