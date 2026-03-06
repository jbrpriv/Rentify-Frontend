'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import {
  Building2, Globe, LayoutDashboard, Tag, User, LogOut,
  Settings, Menu, X, Home, DollarSign, Bell
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Desktop-only Avatar Dropdown ────────────────────────────────────────────
function AvatarDropdown({ user, logout, isTransparent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user.name?.charAt(0).toUpperCase() || '?';

  return (
    <div ref={ref} className="relative hidden md:block">
      {/* Avatar button — desktop only */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex h-9 w-9 items-center justify-center rounded-full overflow-hidden ring-2 transition-all hover:scale-105 ${isTransparent ? 'ring-white/40 hover:ring-white/70' : 'ring-[#0992C2]/30 hover:ring-[#0992C2]/60'
          }`}
        aria-label="Account menu"
      >
        {user.profilePhoto ? (
          <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-sm font-black ${isTransparent ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-[#0992C2] to-[#0B2D72] text-white'
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

          <button
            onClick={() => { setOpen(false); router.push('/dashboard/profile'); }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            Profile Settings
          </button>

          <button
            onClick={() => { setOpen(false); router.push('/dashboard'); }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-400" />
            Dashboard
          </button>

          <div className="border-t border-slate-100" />

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

// ─── Mobile Side-Panel Drawer ────────────────────────────────────────────────
function MobileDrawer({ user, logout, isOpen, onClose, navLinks, publicNavLinks, pathname }) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const go = (href) => { onClose(); router.push(href); };

  // Decide which links to show based on auth state
  const linksToRender = user ? navLinks : publicNavLinks;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.21, 0.8, 0.3, 1] }}
            className="fixed left-0 top-0 bottom-0 z-[70] w-72 bg-white shadow-2xl flex flex-col overflow-y-auto"
          >
            {/* Drawer header — logo + close */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0992C2] to-[#0B2D72]">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-extrabold text-[#0B2D72]">RentifyPro</span>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conditional Profile Header */}
            {user ? (
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-br from-[#F0F8FA] to-[#E6F4F8]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0992C2] to-[#0B2D72] text-white font-black text-lg overflow-hidden flex-shrink-0 shadow-md shadow-[#0992C2]/25">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                    ) : (user.name?.charAt(0).toUpperCase() || '?')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    {user.role && (
                      <span className="mt-1 inline-block rounded-full bg-[#0992C2]/10 border border-[#0992C2]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0B2D72]">
                        {user.role.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 py-6 border-b border-gray-100 bg-gradient-to-br from-[#F0F8FA] to-[#E6F4F8]">
                <p className="text-lg font-bold text-neutral-900">Welcome to RentifyPro</p>
                <p className="text-[0.8rem] text-neutral-500 mt-1">Sign in to manage your rentals.</p>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => go('/login')} className="flex-1 rounded-xl bg-white px-3 py-2.5 text-[0.8rem] font-bold text-[#0992C2] shadow-sm border border-[#0992C2]/20 hover:bg-gray-50 transition-colors">
                    Log In
                  </button>
                  <button onClick={() => go('/register')} className="flex-1 rounded-xl bg-gradient-to-r from-[#0B2D72] to-[#0992C2] px-3 py-2.5 text-[0.8rem] font-bold text-white shadow-md hover:opacity-90 transition-opacity">
                    Sign Up
                  </button>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {linksToRender.map(({ href, label, icon: Icon }) => {
                // Ensure exact match for root '/' or startsWith for deeper links
                const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
                return (
                  <button
                    key={label}
                    onClick={() => go(href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${isActive
                      ? 'bg-[#E6F4F8] text-[#0992C2] shadow-sm'
                      : 'text-neutral-600 hover:bg-[#F0F8FA] hover:text-neutral-900'
                      }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${isActive ? 'border-[#0992C2] bg-white' : 'border-transparent bg-white/70'
                      }`}>
                      {Icon ? <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#0992C2]' : 'text-neutral-400'}`} /> : <div className="h-3.5 w-3.5 rounded-full bg-neutral-200" />}
                    </span>
                    {label}
                  </button>
                );
              })}

              {/* Logged in exclusive links */}
              {user && (
                <>
                  <button
                    onClick={() => go('/dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${pathname?.startsWith('/dashboard') && !pathname?.includes('/profile')
                      ? 'bg-[#E6F4F8] text-[#0992C2] shadow-sm'
                      : 'text-neutral-600 hover:bg-[#F0F8FA] hover:text-neutral-900'
                      }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${pathname?.startsWith('/dashboard') && !pathname?.includes('/profile') ? 'border-[#0992C2] bg-white' : 'border-transparent bg-white/70'
                      }`}>
                      <LayoutDashboard className={`h-3.5 w-3.5 ${pathname?.startsWith('/dashboard') && !pathname?.includes('/profile') ? 'text-[#0992C2]' : 'text-neutral-400'}`} />
                    </span>
                    Dashboard
                  </button>

                  <button
                    onClick={() => go('/dashboard/profile')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${pathname?.includes('/profile')
                      ? 'bg-[#E6F4F8] text-[#0992C2] shadow-sm'
                      : 'text-neutral-600 hover:bg-[#F0F8FA] hover:text-neutral-900'
                      }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${pathname?.includes('/profile') ? 'border-[#0992C2] bg-white' : 'border-transparent bg-white/70'
                      }`}>
                      <Settings className={`h-3.5 w-3.5 ${pathname?.includes('/profile') ? 'text-[#0992C2]' : 'text-neutral-400'}`} />
                    </span>
                    Profile Settings
                  </button>
                </>
              )}
            </nav>

            {/* Footer — logout (Only for logged in users) */}
            {user && (
              <div className="px-4 pb-6 pt-2 border-t border-gray-100">
                <button
                  onClick={() => { onClose(); logout(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent bg-red-50">
                    <LogOut className="h-3.5 w-3.5 text-red-400" />
                  </span>
                  Log Out
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, logout } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isDashboard = pathname?.startsWith('/dashboard');
  const isHeroPage = pathname === '/';
  const isTransparent = isHeroPage && !scrolled;

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse', icon: Building2 },
    { href: '/pricing', label: 'Pricing', icon: DollarSign },
  ];

  const publicNavLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse', icon: Search },
    { href: '/#features', label: 'Features', icon: Tag },
    { href: '/pricing', label: 'Pricing', icon: DollarSign },
  ];

  return (
    <>
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isTransparent
        ? 'bg-transparent'
        : 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-black/5'
        }`}>
        <div className="flex w-full items-center justify-between px-6 py-3.5 md:px-12 lg:px-16">

          {/* ── Left: Logo + desktop nav links ── */}
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

            {/* Desktop nav links */}
            <div className="hidden items-center gap-6 md:flex">
              {(user ? navLinks : publicNavLinks).map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-1 text-[0.8rem] font-semibold transition-colors ${pathname === href
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
                  className={`flex items-center gap-1.5 text-[0.8rem] font-semibold transition-colors ${isTransparent ? 'text-white/80 hover:text-white' : isDashboard ? 'text-[#0B2D72]' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* ── Right: actions ── */}
          <div className="flex items-center gap-3">
            {/* Globe — desktop only */}
            <button
              type="button"
              className={`hidden items-center justify-center rounded-full p-2 transition-colors md:flex ${isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:bg-neutral-100'
                }`}
            >
              <Globe className="h-4 w-4" />
            </button>

            {user ? (
              <>
                {/* Desktop: notifications bell */}
                <Link
                  href="/dashboard/messages"
                  className={`hidden md:flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-105 ${isTransparent ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  aria-label="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                </Link>

                {/* Desktop: avatar dropdown */}
                <AvatarDropdown user={user} logout={logout} isTransparent={isTransparent} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`hidden rounded-full px-4 py-1.5 text-[0.75rem] font-semibold transition-all sm:inline-flex ${isTransparent ? 'text-white hover:bg-white/10' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className={`hidden sm:inline-flex rounded-full border px-4 py-1.5 text-[0.75rem] font-semibold transition-all hover:scale-[1.02] ${isTransparent
                    ? 'border-white text-white hover:bg-white/10'
                    : 'border-[#0992C2] text-[#0992C2] hover:bg-[#0992C2]/5'
                    }`}
                >
                  List a Property
                </Link>
              </>
            )}

            {/* Mobile: hamburger button (shows for BOTH guests and users, hidden on dashboard) */}
            {!isDashboard && (
              <button
                onClick={() => setMobileOpen(true)}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all md:hidden ${isTransparent
                  ? 'bg-white/15 text-white hover:bg-white/25'
                  : 'bg-[#E6F4F8] text-[#0992C2] hover:bg-[#d0eaf4]'
                  }`}
                aria-label="Open menu"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile side-panel drawer — Render unconditionally to support guests */}
      <MobileDrawer
        user={user}
        logout={logout}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={navLinks}
        publicNavLinks={publicNavLinks}
        pathname={pathname}
      />
    </>
  );
}