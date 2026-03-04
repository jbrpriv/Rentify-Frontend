'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import {
  LayoutDashboard, Building2, FileText, Users, Key, User, Loader2, FolderOpen, Zap,
  ShieldCheck, Wrench, MessageSquare, CreditCard, BarChart2, Scale,
  ClipboardList, X, Tag, BookOpen, Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_BY_ROLE = {
  landlord: [
    { name: 'Overview',       href: '/dashboard',                       icon: LayoutDashboard },
    { name: 'Properties',     href: '/dashboard/properties',            icon: Building2 },
    { name: 'Offers',         href: '/dashboard/offers',                icon: Tag,           badgeKey: 'offers' },
    { name: 'Agreements',     href: '/dashboard/agreements',            icon: FileText,      badgeKey: 'agreements' },
    { name: 'Agr. Templates', href: '/dashboard/agreement-templates',   icon: BookOpen },
    { name: 'Tenants',        href: '/dashboard/landlord/tenants',      icon: Users },
    { name: 'Maintenance',    href: '/dashboard/maintenance',           icon: Wrench,        badgeKey: 'maintenance' },
    { name: 'Messages',       href: '/dashboard/messages',              icon: MessageSquare, badgeKey: 'messages' },
    { name: 'Disputes',       href: '/dashboard/disputes',              icon: Scale },
    { name: 'Billing',        href: '/dashboard/billing',               icon: Zap },
    { name: 'Profile',        href: '/dashboard/profile',               icon: User },
  ],
  tenant: [
    { name: 'Overview',    href: '/dashboard',             icon: LayoutDashboard },
    { name: 'My Lease',    href: '/dashboard/my-lease',    icon: Key },
    { name: 'Offers',      href: '/dashboard/offers',      icon: Tag,           badgeKey: 'offers' },
    { name: 'Payments',    href: '/dashboard/payments',    icon: CreditCard },
    { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench,        badgeKey: 'maintenance' },
    { name: 'Documents',   href: '/dashboard/documents',   icon: FolderOpen },
    { name: 'Disputes',    href: '/dashboard/disputes',    icon: Scale },
    { name: 'Messages',    href: '/dashboard/messages',    icon: MessageSquare, badgeKey: 'messages' },
    { name: 'Profile',     href: '/dashboard/profile',     icon: User },
  ],
  admin: [
    { name: 'Overview',       href: '/dashboard',                           icon: LayoutDashboard },
    { name: 'Stats',          href: '/dashboard/admin',                     icon: BarChart2 },
    { name: 'Users',          href: '/dashboard/admin/users',               icon: Users },
    { name: 'Agreements',     href: '/dashboard/admin/agreements',          icon: FileText },
    { name: 'Properties',     href: '/dashboard/admin/properties',          icon: Building2 },
    { name: 'Templates',      href: '/dashboard/admin/templates',           icon: ClipboardList },
    { name: 'Agr. Templates', href: '/dashboard/admin/agreement-templates', icon: BookOpen },
    { name: 'Disputes',       href: '/dashboard/disputes',                  icon: Scale },
    { name: 'Messages',       href: '/dashboard/messages',                  icon: MessageSquare, badgeKey: 'messages' },
    { name: 'Audit Logs',     href: '/dashboard/admin/audit-logs',          icon: ShieldCheck },
    { name: 'Profile',        href: '/dashboard/profile',                   icon: User },
  ],
  property_manager: [
    { name: 'Overview',    href: '/dashboard',                icon: LayoutDashboard },
    { name: 'Properties',  href: '/dashboard/pm/properties',  icon: Building2 },
    { name: 'Tenants',     href: '/dashboard/pm/tenants',     icon: Users },
    { name: 'Maintenance', href: '/dashboard/pm/maintenance', icon: Wrench, badgeKey: 'maintenance' },
    { name: 'Messages',    href: '/dashboard/messages',       icon: MessageSquare, badgeKey: 'messages' },
    { name: 'Profile',     href: '/dashboard/profile',        icon: User },
  ],
  law_reviewer: [
    { name: 'Overview',   href: '/dashboard',                 icon: LayoutDashboard },
    { name: 'Templates',  href: '/dashboard/admin/templates', icon: Scale },
    { name: 'Agreements', href: '/dashboard/agreements',      icon: FileText, badgeKey: 'agreements' },
    { name: 'Messages',   href: '/dashboard/messages',        icon: MessageSquare, badgeKey: 'messages' },
    { name: 'Profile',    href: '/dashboard/profile',         icon: User },
  ],
};

const ROLE_PULSE = {
  admin: 'bg-[#0992C2]', landlord: 'bg-[#0992C2]',
  property_manager: 'bg-[#0992C2]', tenant: 'bg-[#0992C2]', law_reviewer: 'bg-[#0992C2]',
};
const ROLE_BADGE = {
  admin: 'bg-[#0AC4E0]/10 text-[#0B2D72] border-[#0992C2]/40',
  landlord: 'bg-[#0AC4E0]/10 text-[#0B2D72] border-[#0992C2]/40',
  property_manager: 'bg-[#0AC4E0]/10 text-[#0B2D72] border-[#0992C2]/40',
  tenant: 'bg-[#0AC4E0]/10 text-[#0B2D72] border-[#0992C2]/40',
  law_reviewer: 'bg-[#0AC4E0]/10 text-[#0B2D72] border-[#0992C2]/40',
};
const ROLE_COLORS = {
  landlord: { bg: 'bg-[#E6F4F8]', text: 'text-[#0B2D72]' },
  tenant: { bg: 'bg-[#E6F4F8]', text: 'text-[#0B2D72]' },
  property_manager: { bg: 'bg-[#E6F4F8]', text: 'text-[#0B2D72]' },
  admin: { bg: 'bg-[#E6F4F8]', text: 'text-[#0B2D72]' },
  law_reviewer: { bg: 'bg-[#E6F4F8]', text: 'text-[#0B2D72]' },
};

function NotificationToast({ notification, onDismiss }) {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!notification) return;
    const t1 = setTimeout(() => setShow(true), 10);
    const t2 = setTimeout(() => { setShow(false); setTimeout(onDismiss, 400); }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [notification, onDismiss]);

  if (!notification) return null;
  const c = ROLE_COLORS[notification.senderRole] || { bg: 'bg-slate-100', text: 'text-slate-600' };

  return (
    <div
      onClick={() => {
        setShow(false);
        setTimeout(() => { onDismiss(); router.push('/dashboard/messages'); }, 200);
      }}
      className="fixed top-20 right-4 z-[200] cursor-pointer"
      style={{ transition: 'all 400ms cubic-bezier(0.34,1.56,0.64,1)', transform: show ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.9)', opacity: show ? 1 : 0 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3 w-80">
        <div className={`w-10 h-10 ${c.bg} ${c.text} rounded-2xl flex items-center justify-center font-black flex-shrink-0 text-sm`}>
          {notification.senderName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-black text-gray-900 truncate">{notification.senderName}</p>
            <button onClick={e => { e.stopPropagation(); setShow(false); setTimeout(onDismiss, 400); }}>
              <X className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500" />
            </button>
          </div>
          <p className="text-xs text-gray-500 truncate">{notification.preview}</p>
          {notification.propertyTitle && <p className="text-[10px] text-gray-300 mt-0.5 truncate">{notification.propertyTitle}</p>}
          <p className="text-[10px] text-blue-400 font-semibold mt-1">Tap to open messages →</p>
        </div>
      </div>
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500" />
      </span>
    </div>
  );
}

/** Shared sidebar nav list — used in both desktop sidebar and mobile drawer */
function SidebarContent({ user, role, currentNav, pathname, badgeCounts, pulseColor, badgeColor, onNavClick }) {
  const router = useRouter();
  return (
    <>
      <div className="mb-4 flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0992C2] to-[#0B2D72] text-white font-semibold overflow-hidden flex-shrink-0">
          {user.profilePhoto
            ? <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
            : user.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">{user.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${badgeColor}`}>
              <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${pulseColor}`} />
              {role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-2 h-px rounded-full bg-[#E0EDC5]" />

      <nav className="flex flex-1 flex-col gap-1 pt-1">
        {currentNav.map((item, index) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const count = item.badgeKey ? (badgeCounts[item.badgeKey] || 0) : 0;
          return (
            <motion.button
              key={item.name}
              onClick={() => { router.push(item.href); onNavClick?.(); }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.04 * index, ease: [0.21, 0.6, 0.35, 1] }}
              className={`group mb-0.5 flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-[0.8rem] font-semibold transition-all ${
                isActive
                  ? 'bg-[#E6F4F8] text-neutral-900 shadow-sm shadow-[#0992C2]/25'
                  : 'text-neutral-500 hover:bg-[#F0F8FA] hover:text-neutral-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-2xl border ${
                  isActive
                    ? 'border-[#0992C2] bg-white'
                    : 'border-transparent bg-white/70 group-hover:border-[#99E0F2]'
                }`}>
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#0992C2]' : 'text-neutral-500'}`} />
                </span>
                {item.name}
              </span>
              {count > 0 && (
                <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#0992C2] px-1 text-[10px] font-bold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>
    </>
  );
}

export default function DashboardLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [badgeCounts, setBadgeCounts]     = useState({});
  const [notification, setNotification]   = useState(null);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const socketRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const fetchCounts = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/counts');
      setBadgeCounts(data);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }

    if (user.isPhoneVerified === false && user.provider) {
      logout();
      api.post('/auth/oauth/abandon').catch(() => {});
      return;
    }

    fetchCounts();

    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    import('socket.io-client').then(({ io }) => {
      const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;
      socket.on('connect', () => socket.emit('register', user._id));
      socket.on('new_message', (msg) => {
        fetchCounts();
        window.dispatchEvent(new CustomEvent('dashboard:new_message', { detail: msg }));
        const sId = String(msg.sender?._id || msg.sender);
        if (String(user._id) !== sId && !window.__activeChatUserId) {
          setNotification({
            senderName: msg.sender?.name || 'Someone',
            senderRole: msg.sender?.role,
            preview: msg.content?.slice(0, 60),
            propertyTitle: msg.property?.title,
          });
        }
      });
    });

    const interval = setInterval(fetchCounts, 120_000);
    const handleRefresh = () => fetchCounts();
    window.addEventListener('dashboard:refresh_counts', handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('dashboard:refresh_counts', handleRefresh);
      socketRef.current?.disconnect();
    };
  }, [user]); // eslint-disable-line

  useEffect(() => { if (pathname) fetchCounts(); }, [pathname, fetchCounts]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FBFC]">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1.25, 0.36, 1] }}
          className="rf-card flex items-center gap-3 px-5 py-4 bg-white/90 border border-[#0992C2]/15"
        >
          <Loader2 className="h-6 w-6 animate-spin text-[#0992C2]" />
          <p className="text-sm font-semibold text-neutral-800">Loading your dashboard…</p>
        </motion.div>
      </div>
    );
  }

  const role       = user.role || 'tenant';
  const currentNav = NAV_BY_ROLE[role] || NAV_BY_ROLE.tenant;
  const pulseColor = ROLE_PULSE[role]  || 'bg-gray-400';
  const badgeColor = ROLE_BADGE[role]  || 'bg-gray-100 text-gray-600 border-gray-200';

  const sidebarProps = { user, role, currentNav, pathname, badgeCounts, pulseColor, badgeColor };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FBFC]">
      <Navbar />
      <NotificationToast notification={notification} onDismiss={() => setNotification(null)} />

      {/* ── Mobile top bar (hamburger) ── */}
      <div className="lg:hidden fixed top-[60px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-2 flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F4F8] text-[#0992C2] hover:bg-[#d0eaf4] transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-neutral-700 truncate">
          {currentNav.find(n =>
            pathname === n.href ||
            (n.href !== '/dashboard' && pathname.startsWith(n.href))
          )?.name || 'Dashboard'}
        </p>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${pulseColor}`} />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
            {role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* ── Mobile drawer overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.21, 0.8, 0.3, 1] }}
              className="fixed left-0 top-0 bottom-0 z-[60] w-72 bg-white shadow-2xl p-4 overflow-y-auto lg:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0992C2] to-[#0B2D72]">
                    <Building2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-extrabold text-[#0B2D72]">RentifyPro</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1">
                <SidebarContent {...sidebarProps} onNavClick={() => setMobileOpen(false)} />
              </div>

              {/* Drawer footer */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl text-[0.8rem] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-transparent bg-red-50">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  Log Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Page body ── */}
      <div className="flex-1 pt-24 pb-10 lg:pt-24">
        {/* Extra top padding on mobile to account for the mobile top bar */}
        <div className="lg:hidden h-11" />

        <div className="mx-auto flex max-w-[1600px] gap-6 px-4 sm:px-8 lg:px-12">

          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.21, 0.8, 0.3, 1] }}
            className="sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto hidden w-64 shrink-0 flex-col rounded-3xl bg-white/85 p-4 shadow-[0_22px_70px_rgba(11,45,114,0.35)] ring-1 ring-[#0992C2]/15 lg:flex custom-scrollbar"
          >
            <SidebarContent {...sidebarProps} />
          </motion.aside>

          {/* Main content */}
          <motion.main
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.21, 0.6, 0.35, 1] }}
          >
            <div className="rounded-[2rem] bg-white/80 p-4 shadow-[0_24px_80px_rgba(148,163,120,0.45)] ring-1 ring-[#E0EDC5] sm:p-6 lg:p-8">
              {children}
            </div>
          </motion.main>
        </div>
      </div>

      <Footer />
    </div>
  );
}