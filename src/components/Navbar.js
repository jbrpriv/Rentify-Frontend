'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { Building2, Globe, LayoutDashboard, Tag, User, LogOut, Settings } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

function AvatarDropdown({ user, logout, isTransparent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user.name?.charAt(0).toUpperCase() || '?';

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex h-9 w-9 items-center justify-center rounded-full overflow-hidden ring-2 transition-all hover:scale-105 ${
          isTransparent ? 'ring-white/40 hover:ring-white/70' : 'ring-[#0992C2]/30 hover:ring-[#0992C2]/60'
        }`}
        aria-label="Account menu"
      >
        {user.profilePhoto ? (
          <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-sm font-black ${
            isTransparent ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-[#0992C2] to-[#0B2D72] text-white'
          }`}>
            {initial}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User info */}
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
          </div>

          {/* Profile Settings */}
          <button
            onClick={() => { setOpen(false); router.push('/dashboard/profile'); }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            Profile Settings
          </button>

          {/* Dashboard */}
          <button
            onClick={() => { setOpen(false); router.push('/dashboard'); }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-400" />
            Dashboard
          </button>

          <div className="border-t border-slate-100" />

          {/* Logout */}
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout }        = useUser();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`hidden items-center justify-center rounded-full p-2 transition-colors md:flex ${
              isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            <Globe className="h-4 w-4" />
          </button>

          {user ? (
            <AvatarDropdown user={user} logout={logout} isTransparent={isTransparent} />
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