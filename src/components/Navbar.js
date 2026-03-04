'use client';

import Link from 'next/link';
import { Building2, Globe, LayoutDashboard, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser]       = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const isDashboard   = pathname?.startsWith('/dashboard');
  const isHeroPage    = pathname === '/';
  const isTransparent = isHeroPage && !scrolled;

  const navLinks = [
    { href: '/browse',    label: 'Browse' },
    { href: '/#features', label: 'Features' },
    { href: '/pricing',   label: 'Pricing', icon: Tag },
  ];

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      isTransparent
        ? 'bg-transparent'
        : 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-black/5'
    }`}>
      <div className="flex w-full items-center justify-between px-6 py-3.5 md:px-12 lg:px-16">

        {/* Logo + Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0992C2] to-[#0B2D72] shadow-md shadow-[#0992C2]/30 transition-transform duration-200 group-hover:scale-105">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`text-[0.6rem] font-bold uppercase tracking-[0.3em] transition-colors ${isTransparent ? 'text-white/80' : 'text-[#0992C2]'}`}>
                Rentify
              </span>
              <span className={`text-[0.95rem] font-extrabold transition-colors ${isTransparent ? 'text-white' : 'text-[#0B2D72]'}`}>
                Pro
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-1 text-[0.8rem] font-semibold transition-colors ${
                  pathname === href
                    ? isTransparent ? 'text-white' : 'text-[#0B2D72]'
                    : isTransparent ? 'text-white/80 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
              </Link>
            ))}

            {user && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 text-[0.8rem] font-semibold transition-colors ${
                  isTransparent ? 'text-white/80 hover:text-white' : isDashboard ? 'text-[#0B2D72]' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`hidden items-center justify-center rounded-full p-2 transition-colors md:flex ${
              isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            <Globe className="h-4 w-4" />
          </button>

          {user ? (
            <>
              <div className="hidden flex-col items-end sm:flex mr-1">
                <p className={`text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${isTransparent ? 'text-white/50' : 'text-neutral-400'}`}>
                  Signed in as
                </p>
                <p className={`text-xs font-semibold ${isTransparent ? 'text-white' : 'text-neutral-900'}`}>
                  {user.name}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={`rounded-full border px-4 py-1.5 text-[0.75rem] font-semibold transition-all hover:scale-[1.02] ${
                  isTransparent
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`hidden rounded-full px-4 py-1.5 text-[0.75rem] font-semibold transition-all sm:inline-flex ${
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className={`rounded-full border px-4 py-1.5 text-[0.75rem] font-semibold transition-all hover:scale-[1.02] ${
                  isTransparent
                    ? 'border-white text-white hover:bg-white/10'
                    : 'border-[#0992C2] text-[#0992C2] hover:bg-[#0992C2]/5'
                }`}
              >
                List a Property
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}