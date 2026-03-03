'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/utils/api';
import {
  LayoutDashboard, Building2, FileText, Users, Key, User, Loader2,
  ShieldCheck, Wrench, MessageSquare, CreditCard, BarChart2, Scale,
  ClipboardList, X, Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_BY_ROLE = {
  landlord: [
    { name: 'Overview',    href: '/dashboard',                  icon: LayoutDashboard },
    { name: 'Properties',  href: '/dashboard/properties',       icon: Building2 },
    { name: 'Offers',      href: '/dashboard/offers',           icon: Tag,           badgeKey: 'offers' },
    { name: 'Agreements',  href: '/dashboard/agreements',       icon: FileText,      badgeKey: 'agreements' },
    { name: 'Tenants',     href: '/dashboard/landlord/tenants', icon: Users },
    { name: 'Maintenance', href: '/dashboard/maintenance',      icon: Wrench,        badgeKey: 'maintenance' },
    { name: 'Messages',    href: '/dashboard/messages',         icon: MessageSquare, badgeKey: 'messages' },
    { name: 'Disputes',    href: '/dashboard/disputes',         icon: Scale },
    { name: 'Profile',     href: '/dashboard/profile',          icon: User },
  ],
  tenant: [
    { name: 'Overview',    href: '/dashboard',             icon: LayoutDashboard },
    { name: 'My Lease',    href: '/dashboard/my-lease',    icon: Key },
    { name: 'Offers',      href: '/dashboard/offers',      icon: Tag,           badgeKey: 'offers' },
    { name: 'Payments',    href: '/dashboard/payments',    icon: CreditCard },
    { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench,        badgeKey: 'maintenance' },
    { name: 'Disputes',    href: '/dashboard/disputes',    icon: Scale },
    { name: 'Messages',    href: '/dashboard/messages',    icon: MessageSquare, badgeKey: 'messages' },
    { name: 'Profile',     href: '/dashboard/profile',     icon: User },
  ],
  admin: [
    { name: 'Overview',    href: '/dashboard',                  icon: LayoutDashboard },
    { name: 'Stats',       href: '/dashboard/admin',            icon: BarChart2 },
    { name: 'Users',       href: '/dashboard/admin/users',      icon: Users },
    { name: 'Agreements',  href: '/dashboard/admin/agreements', icon: FileText },
    { name: 'Properties',  href: '/dashboard/admin/properties', icon: Building2 },
    { name: 'Templates',   href: '/dashboard/admin/templates',  icon: ClipboardList },
    { name: 'Disputes',    href: '/dashboard/disputes',         icon: Scale },
    { name: 'Messages',    href: '/dashboard/messages',         icon: MessageSquare, badgeKey: 'messages' },
    { name: 'Audit Logs',  href: '/dashboard/admin/audit-logs', icon: ShieldCheck },
    { name: 'Profile',     href: '/dashboard/profile',          icon: User },
  ],
  property_manager: [
    { name: 'Overview',    href: '/dashboard',                icon: LayoutDashboard },
    { name: 'Properties',  href: '/dashboard/pm/properties',  icon: Building2 },
    { name: 'Tenants',     href: '/dashboard/pm/tenants',     icon: Users },
    { name: 'Maintenance', href: '/dashboard/pm/maintenance', icon: Wrench,        badgeKey: 'maintenance' },
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

const ROLE_PULSE  = { admin:'bg-rose-500', landlord:'bg-violet-500', property_manager:'bg-amber-500', tenant:'bg-emerald-500', law_reviewer:'bg-purple-500' };
const ROLE_BADGE  = { admin:'bg-rose-50 text-rose-700 border-rose-200', landlord:'bg-violet-50 text-violet-700 border-violet-200', property_manager:'bg-amber-50 text-amber-700 border-amber-200', tenant:'bg-emerald-50 text-emerald-700 border-emerald-200', law_reviewer:'bg-purple-50 text-purple-700 border-purple-200' };
const ROLE_COLORS = { landlord:{bg:'bg-violet-100',text:'text-violet-700'}, tenant:{bg:'bg-emerald-100',text:'text-emerald-700'}, property_manager:{bg:'bg-amber-100',text:'text-amber-700'}, admin:{bg:'bg-rose-100',text:'text-rose-700'}, law_reviewer:{bg:'bg-purple-100',text:'text-purple-700'} };

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
      onClick={() => { setShow(false); setTimeout(() => { onDismiss(); router.push('/dashboard/messages'); }, 200); }}
      className="fixed top-20 right-4 z-[200] cursor-pointer"
      style={{ transition:'all 400ms cubic-bezier(0.34,1.56,0.64,1)', transform: show ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.9)', opacity: show ? 1 : 0 }}
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

export default function DashboardLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]             = useState(null);
  const [badgeCounts, setBadgeCounts] = useState({});
  const [notification, setNotification] = useState(null);
  const socketRef = useRef(null);

  const fetchCounts = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/counts');
      setBadgeCounts(data);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchCounts();

    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    import('socket.io-client').then(({ io }) => {
      const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;
      socket.on('connect', () => socket.emit('register', u._id));
      socket.on('new_message', (msg) => {
        fetchCounts();
        window.dispatchEvent(new CustomEvent('dashboard:new_message', { detail: msg }));
        const sId = String(msg.sender?._id || msg.sender);
        if (String(u._id) !== sId && !window.__activeChatUserId) {
          setNotification({ senderName: msg.sender?.name || 'Someone', senderRole: msg.sender?.role, preview: msg.content?.slice(0, 60), propertyTitle: msg.property?.title });
        }
      });
    });

    const interval = setInterval(fetchCounts, 120_000);
    const handleRefresh = () => fetchCounts();
    window.addEventListener('dashboard:refresh_counts', handleRefresh);
    return () => { clearInterval(interval); window.removeEventListener('dashboard:refresh_counts', handleRefresh); socketRef.current?.disconnect(); };
  }, []); // eslint-disable-line

  useEffect(() => { if (pathname) fetchCounts(); }, [pathname, fetchCounts]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1.25, 0.36, 1] }}
          className="rf-card flex items-center gap-3 px-5 py-4 bg-slate-900/80"
        >
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
          <p className="text-sm font-semibold text-slate-100">
            Loading your dashboard…
          </p>
        </motion.div>
      </div>
    );
  }

  const role       = user.role || 'tenant';
  const currentNav = NAV_BY_ROLE[role] || NAV_BY_ROLE.tenant;
  const pulseColor = ROLE_PULSE[role]  || 'bg-gray-400';
  const badgeColor = ROLE_BADGE[role]  || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NotificationToast notification={notification} onDismiss={() => setNotification(null)} />

      {/* Sub-nav bar */}
      <motion.div
        className="mt-16 sticky top-16 z-40 w-full border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-xl"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.21, 0.6, 0.35, 1] }}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-14">
            <div className="flex space-x-0.5 overflow-x-auto no-scrollbar h-full items-center">
              {currentNav.map((item) => {
                const Icon     = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const count    = item.badgeKey ? (badgeCounts[item.badgeKey] || 0) : 0;
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center h-full px-3.5 text-[11px] font-bold tracking-wide border-b-2 transition-all whitespace-nowrap gap-1.5 ${
                      isActive ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200'
                    }`}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
                    {item.name}
                    {count > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-violet-600 text-white text-[9px] font-black leading-none">
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </motion.a>
                );
              })}
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-4 shrink-0">
              <div className={`w-2 h-2 rounded-full animate-pulse ${pulseColor}`} />
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-widest border ${badgeColor}`}>
                {role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.main
        className="flex-grow py-8 px-4 sm:px-8 lg:px-12 w-full max-w-[1600px] mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.21, 0.6, 0.35, 1] }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
