'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useBranding } from '@/context/BrandingContext';
import {
  Building2, LayoutDashboard, Tag, User, LogOut,
  Settings, Menu, X, Home, DollarSign, Bell, Search, Globe,
  HeadphonesIcon, ChevronDown,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function CurrencyPicker({ isTransparent = false, compact = false }) {
  const { currency, supportedCurrencies, selectCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`
          ${compact ? 'h-9 px-2.5 gap-1.5 text-[0.7rem]' : 'h-8 px-2 gap-1 text-[0.68rem]'}
          inline-flex items-center justify-center rounded-full font-bold tracking-wide border transition-all duration-200
          ${isTransparent
            ? 'text-white/90 border-white/30 hover:bg-white/15'
            : 'text-slate-600 border-slate-200 bg-slate-100/80 hover:bg-[#0992C2]/8 hover:text-[#0992C2]'
          }
        `}
        aria-label="Select currency"
      >
        <Globe className={compact ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
        <span>{currency}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-10 z-50 w-28 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            {supportedCurrencies.map((code) => (
              <button
                key={code}
                onClick={() => { selectCurrency(code); setOpen(false); }}
                className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors ${currency === code ? 'bg-[#E6F4F8] text-[#0B2D72]' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {code}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Desktop Avatar Dropdown ──────────────────────────────────────────────────
function AvatarDropdown({ user, logout }) {
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
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-slate-200 hover:border-[#0992C2]/40 hover:bg-[#0992C2]/5 transition-all duration-200 group"
        aria-label="Account menu"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full overflow-hidden ring-2 ring-[#0992C2]/20 group-hover:ring-[#0992C2]/50 transition-all">
          {user.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-black bg-gradient-to-br from-[#0992C2] to-[#0B2D72] text-white">
              {initial}
            </div>
          )}
        </div>
        <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-11 z-50 w-54 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10"
            style={{ width: 210 }}
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
            </div>
            {[
              { label: 'Profile Settings', icon: Settings, href: '/dashboard/profile' },
              { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
            ].map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => { setOpen(false); router.push(href); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Icon className="h-4 w-4 text-slate-400" />
                {label}
              </button>
            ))}
            <div className="border-t border-slate-100" />
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ user, logout, isOpen, onClose, navLinks, publicNavLinks, pathname, brandName }) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const go = (href) => { onClose(); router.push(href); };
  const linksToRender = user ? navLinks : publicNavLinks;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ duration: 0.28, ease: [0.21, 0.8, 0.3, 1] }}
            className="fixed left-0 top-0 bottom-0 z-[70] w-72 bg-white shadow-2xl flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0992C2] to-[#0B2D72]">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-extrabold text-[#0B2D72]">{brandName}</span>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile / Guest header */}
            {user ? (
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-br from-[#F0F8FA] to-[#E6F4F8]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0992C2] to-[#0B2D72] text-white font-black text-base overflow-hidden flex-shrink-0 shadow-md shadow-[#0992C2]/25">
                    {user.profilePhoto
                      ? <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                      : user.name?.charAt(0).toUpperCase() || '?'}
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
              <div className="px-5 py-5 border-b border-gray-100 bg-gradient-to-br from-[#F0F8FA] to-[#E6F4F8]">
                <p className="text-base font-bold text-neutral-900">Welcome to {brandName}</p>
                <p className="text-[0.78rem] text-neutral-500 mt-1">Sign in to manage your rentals.</p>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => go('/login')} className="flex-1 rounded-xl bg-white px-3 py-2.5 text-[0.8rem] font-bold text-[#0992C2] shadow-sm border border-[#0992C2]/20 hover:bg-gray-50 transition-colors">Log In</button>
                  <button onClick={() => go('/register')} className="flex-1 rounded-xl bg-gradient-to-r from-[#0B2D72] to-[#0992C2] px-3 py-2.5 text-[0.8rem] font-bold text-white shadow-md hover:opacity-90 transition-opacity">Sign Up</button>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              <div className="px-1 pb-3">
                <CurrencyPicker compact />
              </div>

              {linksToRender.map(({ href, label, icon: Icon }) => {
                const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
                return (
                  <button key={label} onClick={() => go(href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${isActive ? 'bg-[#E6F4F8] text-[#0992C2] shadow-sm' : 'text-neutral-600 hover:bg-[#F0F8FA] hover:text-neutral-900'}`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${isActive ? 'border-[#0992C2] bg-white' : 'border-transparent bg-white/70'}`}>
                      {Icon ? <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#0992C2]' : 'text-neutral-400'}`} /> : <div className="h-3.5 w-3.5 rounded-full bg-neutral-200" />}
                    </span>
                    {label}
                  </button>
                );
              })}

              {/* Support link */}
              <button onClick={() => go('/support')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${pathname === '/support' ? 'bg-[#E6F4F8] text-[#0992C2] shadow-sm' : 'text-neutral-600 hover:bg-[#F0F8FA] hover:text-neutral-900'}`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${pathname === '/support' ? 'border-[#0992C2] bg-white' : 'border-transparent bg-white/70'}`}>
                  <HeadphonesIcon className={`h-3.5 w-3.5 ${pathname === '/support' ? 'text-[#0992C2]' : 'text-neutral-400'}`} />
                </span>
                Support
              </button>

              {user && (
                <>
                  <button onClick={() => go('/dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${pathname?.startsWith('/dashboard') && !pathname?.includes('/profile') ? 'bg-[#E6F4F8] text-[#0992C2] shadow-sm' : 'text-neutral-600 hover:bg-[#F0F8FA] hover:text-neutral-900'}`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${pathname?.startsWith('/dashboard') && !pathname?.includes('/profile') ? 'border-[#0992C2] bg-white' : 'border-transparent bg-white/70'}`}>
                      <LayoutDashboard className={`h-3.5 w-3.5 ${pathname?.startsWith('/dashboard') && !pathname?.includes('/profile') ? 'text-[#0992C2]' : 'text-neutral-400'}`} />
                    </span>
                    Dashboard
                  </button>
                  <button onClick={() => go('/dashboard/profile')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${pathname?.includes('/profile') ? 'bg-[#E6F4F8] text-[#0992C2] shadow-sm' : 'text-neutral-600 hover:bg-[#F0F8FA] hover:text-neutral-900'}`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${pathname?.includes('/profile') ? 'border-[#0992C2] bg-white' : 'border-transparent bg-white/70'}`}>
                      <Settings className={`h-3.5 w-3.5 ${pathname?.includes('/profile') ? 'text-[#0992C2]' : 'text-neutral-400'}`} />
                    </span>
                    Profile Settings
                  </button>
                </>
              )}
            </nav>

            {/* Logout */}
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

// ─── Nav Link Component ───────────────────────────────────────────────────────
function NavLink({ href, label, icon: Icon, isTransparent, isActive }) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.78rem] font-semibold
        transition-all duration-200 group
        ${isActive
          ? isTransparent
            ? 'text-white bg-white/15'
            : 'text-[#0B2D72] bg-[#0992C2]/10'
          : isTransparent
            ? 'text-white/75 hover:text-white hover:bg-white/10'
            : 'text-neutral-600 hover:text-[#0B2D72] hover:bg-slate-100/80'
        }
      `}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {label}
    </Link>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, logout } = useUser();
  const { brandName } = useBranding();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); // run once on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const activeNavLinks = user ? navLinks : publicNavLinks;

  return (
    <>
      {/*
        FIX: The "black bar flash" happens because backdrop-blur and box-shadow
        paint on separate GPU layers. By using a single bg-white element with
        opacity transition (never touching backdrop-filter mid-scroll), the
        flash is eliminated entirely.
      */}
      <nav className="fixed inset-x-0 top-0 z-50">
        {/* ── Frosted background layer — opacity-driven, no class swaps ── */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            backgroundColor: isTransparent ? 'transparent' : 'rgba(255,255,255,0.92)',
            backdropFilter: isTransparent ? 'none' : 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: isTransparent ? 'none' : 'blur(16px) saturate(180%)',
            borderBottom: isTransparent ? '1px solid transparent' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: isTransparent ? 'none' : '0 1px 16px rgba(9,146,194,0.06)',
          }}
        />

        <div className="relative flex w-full items-center justify-between px-5 py-3 md:px-10 lg:px-14">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0992C2] to-[#0B2D72] shadow-md shadow-[#0992C2]/30 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-[#0992C2]/50">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col leading-none select-none">
              <span className={`text-[0.55rem] font-bold uppercase tracking-[0.35em] transition-colors duration-300 ${isTransparent ? 'text-white/70' : 'text-[#0992C2]'}`}>
                {brandName}
              </span>
              <span className={`text-[0.9rem] font-extrabold transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-[#0B2D72]'}`} />
            </div>
          </Link>

          {/* ── Desktop nav center ── */}
          <div className="hidden md:flex items-center gap-1">
            {activeNavLinks.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={label}
                href={href}
                label={label}
                icon={Icon}
                isTransparent={isTransparent}
                isActive={href === '/' ? pathname === '/' : pathname?.startsWith(href)}
              />
            ))}

            {user && (
              <NavLink
                href="/dashboard"
                label="Dashboard"
                icon={LayoutDashboard}
                isTransparent={isTransparent}
                isActive={pathname?.startsWith('/dashboard')}
              />
            )}

            {/* ── Support link — subtle pill with icon ── */}
            <Link
              href="/support"
              className={`
                relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.78rem] font-semibold
                transition-all duration-200 ml-1
                ${pathname === '/support'
                  ? isTransparent
                    ? 'text-white bg-white/15'
                    : 'text-[#0B2D72] bg-[#0992C2]/10'
                  : isTransparent
                    ? 'text-white/75 hover:text-white border border-white/25 hover:border-white/50 hover:bg-white/10'
                    : 'text-[#0992C2] border border-[#0992C2]/30 hover:border-[#0992C2]/60 hover:bg-[#0992C2]/5'
                }
              `}
            >
              <HeadphonesIcon className="h-3.5 w-3.5 shrink-0" />
              Support
            </Link>
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <CurrencyPicker isTransparent={isTransparent} />

                {/* Notification bell */}
                <Link
                  href="/dashboard/notifications"
                  className={`
                    hidden md:flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200
                    ${isTransparent
                      ? 'text-white/80 hover:text-white hover:bg-white/15'
                      : 'text-slate-500 hover:text-[#0992C2] hover:bg-[#0992C2]/8 bg-slate-100/80'
                    }
                  `}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Link>

                {/* Avatar dropdown */}
                <AvatarDropdown user={user} logout={logout} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`
                    hidden sm:inline-flex items-center rounded-full px-4 py-1.5 text-[0.75rem] font-semibold transition-all duration-200
                    ${isTransparent
                      ? 'text-white/85 hover:text-white hover:bg-white/12'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-slate-100'
                    }
                  `}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className={`
                    hidden sm:inline-flex items-center rounded-full px-4 py-1.5 text-[0.75rem] font-bold transition-all duration-200 hover:scale-[1.03]
                    ${isTransparent
                      ? 'bg-white text-[#0B2D72] hover:bg-white/90 shadow-lg shadow-black/10'
                      : 'bg-gradient-to-r from-[#0B2D72] to-[#0992C2] text-white shadow-md shadow-[#0992C2]/25 hover:shadow-[#0992C2]/40'
                    }
                  `}
                >
                  List a Property
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            {!isDashboard && (
              <button
                onClick={() => setMobileOpen(true)}
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 md:hidden
                  ${isTransparent
                    ? 'text-white hover:bg-white/15'
                    : 'text-[#0992C2] bg-[#E6F4F8] hover:bg-[#d0eaf4]'
                  }
                `}
                aria-label="Open menu"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

        </div>
      </nav>

      <MobileDrawer
        user={user}
        logout={logout}
        brandName={brandName}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={navLinks}
        publicNavLinks={publicNavLinks}
        pathname={pathname}
      />
    </>
  );
}