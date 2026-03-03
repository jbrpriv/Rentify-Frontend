'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2 } from 'lucide-react';

export default function Footer() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  // Check auth state whenever the route changes
  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) setUser(JSON.parse(stored));
    else setUser(null);
  }, [pathname]);

  return (
    <footer className="mt-auto border-t border-[#0992C2]/20 bg-gradient-to-t from-[#0AC4E0]/10 via-[#F6E7BC]/20 to-transparent">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0992C2] to-[#0B2D72] shadow-md shadow-[#0992C2]/30">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-900">
              RentifyPro
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Rental platform
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs font-medium text-neutral-500">
          <Link href="/browse" className="rf-link">
            Browse
          </Link>
          {!user ? (
            <>
              <Link href="/login" className="rf-link">
                Sign in
              </Link>
              <Link href="/register" className="rf-link">
                Get started
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className="rf-link">
              Dashboard
            </Link>
          )}
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-neutral-500">
          © {new Date().getFullYear()} RentifyPro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}