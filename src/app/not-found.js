import Link from 'next/link';
import { Building2, Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FBFC] flex flex-col">
      {/* Mini header */}
      <header className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0992C2] to-[#0B2D72] shadow-sm">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-extrabold text-[#0B2D72]">RentifyPro</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Big 404 */}
          <div className="relative mb-8">
            <p
              className="text-[120px] sm:text-[160px] font-black leading-none select-none"
              style={{
                background: 'linear-gradient(135deg, #0B2D72 0%, #0992C2 50%, #0AC4E0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                opacity: 0.15,
              }}
            >
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-[#E6F4F8] border border-[#0992C2]/15 flex items-center justify-center shadow-sm">
                <Search className="w-9 h-9 text-[#0992C2]" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
            Page not found
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0B2D72] to-[#0992C2] text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-blue-800/20"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}