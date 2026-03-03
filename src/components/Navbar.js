'use client';

import Link from 'next/link';
import { Building2, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const isDashboard = pathname?.startsWith('/dashboard');

  const linkBase =
    'rf-link text-[0.68rem] font-semibold tracking-[0.18em] uppercase text-neutral-600';

  const desktopLinks = (
    <div className="hidden items-center gap-6 md:flex">
      <Link
        href="/browse"
        className={`${linkBase} ${
          pathname === '/browse' ? 'text-neutral-900' : 'text-neutral-600'
        }`}
      >
        Browse
      </Link>
      <Link
        href="/#features"
        className={linkBase}
      >
        Features
      </Link>
      <Link
        href="/#how-it-works"
        className={linkBase}
      >
        How it works
      </Link>
      {user && (
        <Link
          href="/dashboard"
          className={`${linkBase} flex items-center gap-1 ${
            isDashboard ? 'text-emerald-800' : 'text-neutral-600'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Link>
      )}
    </div>
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-4 sm:px-4 md:px-6">
      <nav className="pointer-events-auto max-w-6xl flex-1 rounded-full bg-white/80 px-4 py-2.5 shadow-[0_18px_60px_rgba(148,163,120,0.45)] ring-1 ring-[#E0EDC5] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + primary links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E8F5BD] via-[#FFFFFF] to-[#C7EABB] px-1.5 py-1 pr-3 shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.22,1.25,0.36,1)] hover:-translate-y-0.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#A2CB8B] to-[#84B179] shadow-md shadow-[#A2CB8B]/40">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-neutral-800 via-emerald-900 to-lime-800 bg-clip-text text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-transparent">
                  Rentify
                </span>
                <span className="text-[0.9rem] font-semibold text-neutral-900">
                  Pro
                </span>
              </div>
            </Link>
            {desktopLinks}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden flex-col items-end sm:flex">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    Signed in as
                  </p>
                  <p className="text-xs font-semibold text-neutral-900">
                    {user.name}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rf-btn rf-btn-danger text-[0.7rem] px-3 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rf-btn rf-btn-ghost hidden text-[0.7rem] sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rf-btn rf-btn-primary text-[0.7rem] px-4 py-2"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}