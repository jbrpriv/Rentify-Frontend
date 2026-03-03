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
  }, [pathname]); // Refresh user state on page change

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const isDashboard = pathname?.startsWith('/dashboard');

  const linkBase =
    'relative text-xs font-semibold tracking-[0.16em] uppercase rf-link';

  const desktopLinks = (
    <div className="hidden md:flex items-center gap-6">
      <Link
        href="/browse"
        className={`${linkBase} ${
          pathname === '/browse' ? 'text-slate-50' : 'text-slate-300'
        }`}
      >
        Browse
      </Link>
      <Link
        href="/#features"
        className={`${linkBase} text-slate-300`}
      >
        Features
      </Link>
      <Link
        href="/#how-it-works"
        className={`${linkBase} text-slate-300`}
      >
        How it works
      </Link>
      {user && (
        <Link
          href="/dashboard"
          className={`${linkBase} flex items-center gap-1 ${
            isDashboard ? 'text-sky-300' : 'text-slate-300'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Link>
      )}
    </div>
  );

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + primary links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 shadow-xl">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-slate-50 via-sky-100 to-slate-300 bg-clip-text text-sm font-semibold uppercase tracking-[0.22em] text-transparent">
                Rentify
              </span>
              <span className="text-[15px] font-semibold text-slate-100">
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
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Signed in as
                </p>
                <p className="text-xs font-semibold text-slate-50">
                  {user.name}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="rf-btn rf-btn-danger text-[11px] px-3 py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rf-btn rf-btn-ghost hidden text-[11px] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rf-btn rf-btn-primary text-[11px] px-4 py-2"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}