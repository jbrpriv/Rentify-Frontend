'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import {
  Building2, FileText, CreditCard, Wrench, Tag, Scale,
  TrendingUp, CheckCircle, Clock, AlertCircle, ArrowRight,
  Plus, Bell, Users, Key,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import PaymentCalendar from '@/components/PaymentCalendar';

/* ─── Colour tokens ─────────────────────────────────────────────────────── */
const ROLE_THEME = {
  landlord: { accent: '#0B2D72', light: 'rgba(11,45,114,0.12)', text: '#0B2D72', dot: '#0B2D72' },
  tenant: { accent: '#0992C2', light: 'rgba(9,146,194,0.12)', text: '#0992C2', dot: '#0992C2' },
  property_manager: { accent: '#0AC4E0', light: 'rgba(10,196,224,0.12)', text: '#078A9E', dot: '#0AC4E0' },
  admin: { accent: '#DC2626', light: 'rgba(220,38,38,0.1)', text: '#991B1B', dot: '#EF4444' },
  law_reviewer: { accent: '#1F2933', light: 'rgba(31,41,51,0.08)', text: '#1F2933', dot: '#4B5563' },
};
const CHART_COLORS = ['#0B2D72', '#0992C2', '#0AC4E0', '#F6E7BC', '#1F2933'];

/* ─── Glass surface tokens ───────────────────────────────────────────────── */
const GLASS = {
  card: 'rgba(255,255,255,0.82)',
  cardBdr: 'rgba(255,255,255,0.62)',
  panel: 'rgba(255,255,255,0.78)',
  blur: 'blur(18px)',
  shadow: '0 8px 32px rgba(11,45,114,0.14), inset 0 1px 0 rgba(255,255,255,0.7)',
  shadowSm: '0 4px 16px rgba(11,45,114,0.1),  inset 0 1px 0 rgba(255,255,255,0.6)',
};

/* ─── Background scene (fixed, behind everything) ───────────────────────── */
function DashboardBackground({ mouse }) {
  // Each orb moves at a different parallax depth
  const o = (factor) => ({
    transform: `translate(${mouse.x * factor}px, ${mouse.y * factor}px)`,
    transition: 'transform 0.6s cubic-bezier(0.21,0.6,0.35,1)',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
      // Rich deep-navy base
      background: 'linear-gradient(145deg, #020914 0%, #051631 35%, #0A2558 65%, #051631 100%)',
    }}>
      {/* Subtle grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(9,146,194,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(9,146,194,0.045) 1px, transparent 1px)
        `,
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
      }} />

      {/* Orb 1 — large cyan, top-left, slow */}
      <div style={{
        position: 'absolute', top: '-12%', left: '-8%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(10,196,224,0.22) 0%, transparent 70%)',
        ...o(0.018),
      }} />

      {/* Orb 2 — mid-blue, center, medium */}
      <div style={{
        position: 'absolute', top: '30%', left: '38%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(9,146,194,0.16) 0%, transparent 65%)',
        ...o(0.032),
      }} />

      {/* Orb 3 — warm cream, bottom-right, fast */}
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: 550, height: 550, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(246,231,188,0.14) 0%, transparent 65%)',
        ...o(0.05),
      }} />

      {/* Orb 4 — deep blue mid-right, slowest */}
      <div style={{
        position: 'absolute', top: '5%', right: '8%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(11,45,114,0.5) 0%, transparent 70%)',
        ...o(0.012),
      }} />

      {/* Orb 5 — cyan accent, bottom-left, medium-fast */}
      <div style={{
        position: 'absolute', bottom: '10%', left: '5%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(10,196,224,0.12) 0%, transparent 65%)',
        ...o(0.04),
      }} />

      {/* Fine noise texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '256px 256px',
        opacity: 0.6,
      }} />
    </div>
  );
}

/* ─── Stat card (glass) ──────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, theme, sub }) {
  return (
    <div style={{
      background: GLASS.card,
      backdropFilter: GLASS.blur,
      WebkitBackdropFilter: GLASS.blur,
      borderRadius: 18,
      padding: '22px 24px',
      border: `1px solid ${GLASS.cardBdr}`,
      boxShadow: GLASS.shadow,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Corner accent circle */}
      <div style={{
        position: 'absolute', top: -18, right: -18, width: 80, height: 80,
        borderRadius: '50%', background: theme.light, opacity: 0.9,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5A6475', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{label}</p>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: '2.2rem', fontWeight: 800, color: '#0D1B2A', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ fontSize: '0.7rem', color: '#7C8799', marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: theme.light,
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          border: `1px solid ${theme.accent}22`,
        }}>
          <Icon size={20} style={{ color: theme.accent }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Quick action pill ──────────────────────────────────────────────────── */
function ActionPill({ href, icon: Icon, label, theme }) {
  return (
    <Link href={href} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: theme.accent,
      borderRadius: 40,
      fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none',
      border: `1.5px solid ${theme.accent}28`,
      boxShadow: '0 2px 8px rgba(11,45,114,0.08)',
      transition: 'all .18s',
    }}>
      <Icon size={15} />{label}
    </Link>
  );
}

/* ─── Alert banner (glass) ───────────────────────────────────────────────── */
function AlertBanner({ tasks, role, theme }) {
  if (tasks.length === 0) return null;
  return (
    <div style={{
      background: `rgba(255,255,255,0.82)`,
      backdropFilter: GLASS.blur,
      WebkitBackdropFilter: GLASS.blur,
      borderLeft: `4px solid ${theme.accent}`,
      borderRadius: '0 16px 16px 0',
      padding: '16px 22px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      border: `1px solid ${GLASS.cardBdr}`,
      borderLeftColor: theme.accent,
      boxShadow: GLASS.shadowSm,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ background: theme.light, borderRadius: 10, padding: 8 }}>
          <Bell size={18} style={{ color: theme.accent }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0D1B2A', marginBottom: 2 }}>
            {tasks.length} task{tasks.length > 1 ? 's' : ''} need your attention
          </p>
          <p style={{ fontSize: '0.78rem', color: '#5A6475' }}>{tasks.join(' · ')}</p>
        </div>
      </div>
      <Link href={role === 'landlord' ? '/dashboard/offers' : '/dashboard/agreements'}
        style={{
          padding: '8px 16px', background: theme.accent, color: 'white',
          borderRadius: 10, fontSize: '0.78rem', fontWeight: 700,
          textDecoration: 'none', whiteSpace: 'nowrap',
          boxShadow: `0 4px 12px ${theme.accent}44`,
        }}>
        Review
      </Link>
    </div>
  );
}

/* ─── Lease row ──────────────────────────────────────────────────────────── */
function LeaseRow({ lease, role }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderBottom: '1px solid rgba(11,45,114,0.07)', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(10,196,224,0.12)',
          border: '1px solid rgba(10,196,224,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Building2 size={16} color="#0AC4E0" />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0D1B2A' }}>{lease.property?.title || 'Property'}</p>
          {role !== 'tenant' && lease.tenant && (
            <p style={{ fontSize: '0.72rem', color: '#7C8799' }}>{lease.tenant?.name}</p>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#0D1B2A' }}>
          Rs. {(lease.financials?.rentAmount || 0).toLocaleString()}
        </p>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, color: '#0992C2',
          background: 'rgba(9,146,194,0.1)', padding: '2px 8px', borderRadius: 20,
          border: '1px solid rgba(9,146,194,0.15)',
        }}>Active</span>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function DashboardHome() {
  const { user } = useUser();
  const [agreements, setAgreements] = useState([]);
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [offers, setOffers] = useState([]);
  const [pendingDisputes, setPD] = useState(0);
  const [pendingMaint, setPM] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mouse parallax state
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Track mouse on window so the background reacts even near the sidebar
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let raf;
    let raw = { x: 0, y: 0 };
    let curr = { x: 0, y: 0 };

    const onMove = (e) => {
      // Normalise to [-1, 1] from window center
      raw.x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      raw.y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    // Lerp to smooth out jitter
    const tick = () => {
      curr.x += (raw.x - curr.x) * 0.08;
      curr.y += (raw.y - curr.y) * 0.08;
      // Convert to px offset (max ±60px)
      setMouse({ x: curr.x * 60, y: curr.y * 60 });
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [agResp, offerResp] = await Promise.all([
          api.get('/agreements').catch(() => ({ data: [] })),
          api.get('/offers').catch(() => ({ data: { offers: [] } })),
        ]);
        setAgreements(agResp.data || []);
        setOffers(offerResp.data?.offers || []);

        if (['landlord', 'property_manager', 'admin'].includes(user.role)) {
          const propResp = await api.get('/properties').catch(() => ({ data: [] }));
          setProperties(Array.isArray(propResp.data) ? propResp.data : []);
        }

        const payResp = await api.get('/payments').catch(() => ({ data: { payments: [] } }));
        setPayments(payResp.data?.payments || []);

        const [dispResp, maintResp] = await Promise.all([
          api.get('/disputes').catch(() => ({ data: { disputes: [] } })),
          api.get('/maintenance').catch(() => ({ data: [] })),
        ]);
        setPD((dispResp.data?.disputes || []).filter(d => ['open', 'under_review'].includes(d.status)).length);
        setPM((Array.isArray(maintResp.data) ? maintResp.data : []).filter(m => ['pending', 'in_progress'].includes(m.status)).length);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (!user || loading) return (
    <>
      <DashboardBackground mouse={mouse} />
      <style>{`
        @keyframes shimmer { 0%{background-position:-600px 0}100%{background-position:600px 0} }
        .sk{background:linear-gradient(90deg,rgba(255,255,255,0.15)25%,rgba(255,255,255,0.28)50%,rgba(255,255,255,0.15)75%);background-size:600px 100%;animation:shimmer 1.4s infinite linear;border-radius:12px;}
      `}</style>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="sk" style={{ width: 220, height: 38 }} />
            <div className="sk" style={{ width: 140, height: 14 }} />
          </div>
          <div className="sk" style={{ width: 120, height: 36, borderRadius: 40 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(18px)', borderRadius: 18, padding: '22px 24px', border: '1px solid rgba(255,255,255,0.5)' }}>
              <div className="sk" style={{ width: 44, height: 44, borderRadius: 14, marginBottom: 14 }} />
              <div className="sk" style={{ width: '55%', height: 12, marginBottom: 10 }} />
              <div className="sk" style={{ width: '70%', height: 32 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[...Array(4)].map((_, i) => <div key={i} className="sk" style={{ width: 130, height: 38, borderRadius: 40 }} />)}
        </div>
      </div>
    </>
  );

  const theme = ROLE_THEME[user.role] || ROLE_THEME.tenant;
  const activeLeases = agreements.filter(a => a.status === 'active');
  const pendingOffers = offers.filter(o => ['pending', 'countered'].includes(o.status));
  const totalRevenue = activeLeases.reduce((s, a) => s + (a.financials?.rentAmount || 0), 0);

  const tasks = [];
  if (user.role === 'landlord') {
    if (pendingOffers.length) tasks.push(`${pendingOffers.length} offer(s) to review`);
    if (pendingDisputes > 0) tasks.push(`${pendingDisputes} open dispute(s)`);
    if (pendingMaint > 0) tasks.push(`${pendingMaint} maintenance request(s)`);
    const now = new Date();
    const expiring = activeLeases.filter(a => {
      if (!a.term?.endDate) return false;
      const diff = (new Date(a.term.endDate) - now) / 86400000;
      return diff > 0 && diff <= 60;
    });
    if (expiring.length) tasks.push(`${expiring.length} lease(s) ending within 60 days`);
  } else if (user.role === 'tenant') {
    const awaitSign = agreements.filter(a => a.status === 'sent' && !a.signatures?.tenant?.signed);
    if (awaitSign.length) tasks.push(`${awaitSign.length} agreement(s) to sign`);
    if (pendingOffers.length) tasks.push(`${pendingOffers.length} offer in negotiation`);
  } else {
    if (pendingDisputes > 0) tasks.push(`${pendingDisputes} dispute(s)`);
    if (pendingMaint > 0) tasks.push(`${pendingMaint} maintenance(s)`);
  }

  const monthlyData = buildMonthly(payments);
  const statusData = buildStatus(agreements);
  const propStatData = buildPropStatus(properties);

  const qkActions = {
    landlord: [
      { href: '/dashboard/properties/new', icon: Plus, label: 'Add Property' },
      { href: '/dashboard/offers', icon: Tag, label: 'View Offers' },
      { href: '/dashboard/agreements', icon: FileText, label: 'Agreements' },
      { href: '/dashboard/maintenance', icon: Wrench, label: 'Maintenance' },
    ],
    tenant: [
      { href: '/dashboard/my-lease', icon: Key, label: 'My Lease' },
      { href: '/dashboard/offers', icon: Tag, label: 'Make an Offer' },
      { href: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
      { href: '/dashboard/maintenance', icon: Wrench, label: 'Maintenance' },
    ],
    property_manager: [
      { href: '/dashboard/pm/properties', icon: Building2, label: 'Properties' },
      { href: '/dashboard/pm/tenants', icon: Users, label: 'Tenants' },
      { href: '/dashboard/pm/maintenance', icon: Wrench, label: 'Maintenance' },
    ],
  }[user.role] || [];

  /* shared glass panel style */
  const glassPanel = {
    background: GLASS.panel,
    backdropFilter: GLASS.blur,
    WebkitBackdropFilter: GLASS.blur,
    borderRadius: 20,
    border: `1px solid ${GLASS.cardBdr}`,
    boxShadow: GLASS.shadow,
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&display=swap');`}</style>

      {/* Parallax background — behind everything */}
      <DashboardBackground mouse={mouse} />

      <motion.div
        style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', gap: 28,
          maxWidth: 1200, margin: '0 auto',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.21, 0.6, 0.35, 1] }}
      >

        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div
          style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.21, 0.6, 0.35, 1] }}
        >
          <div>
            <h1 style={{
              fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '2.4rem',
              color: '#FFFFFF', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6,
              textShadow: '0 2px 24px rgba(0,0,0,0.3)',
            }}>
              Hi, {user.name?.split(' ')[0]}
            </h1>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(200,220,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              {user.role === 'landlord' ? 'Landlord Dashboard'
                : user.role === 'tenant' ? 'Tenant Portal'
                  : user.role === 'property_manager' ? 'Property Manager Portal'
                    : user.role === 'admin' ? 'Admin Dashboard'
                      : 'Dashboard'}
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderRadius: 40,
            border: '1px solid rgba(255,255,255,0.22)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: theme.dot, boxShadow: `0 0 8px ${theme.dot}` }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {user.role?.replace('_', ' ')}
            </span>
          </div>
        </motion.div>

        {/* ── Alert ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.21, 0.6, 0.35, 1] }}
        >
          <AlertBanner tasks={tasks} role={user.role} theme={theme} />
        </motion.div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14, ease: [0.21, 0.6, 0.35, 1] }}
        >
          {user.role === 'landlord' && <>
            <StatCard label="Monthly Income" value={`Rs. ${totalRevenue.toLocaleString()}`} icon={TrendingUp} theme={theme} sub={`${activeLeases.length} active lease(s)`} />
            <StatCard label="Late Fees" value={`Rs. ${payments.reduce((s, p) => s + (p.lateFeeAmount || 0), 0).toLocaleString()}`} icon={AlertCircle} theme={ROLE_THEME.admin} sub={`${payments.filter(p => p.status === 'late_fee_applied').length} pending fee(s)`} />
            <StatCard label="Properties" value={properties.length} icon={Building2} theme={ROLE_THEME.property_manager} />
            <StatCard label="Agreements" value={agreements.length} icon={FileText} theme={theme} />
            <StatCard label="Active Offers" value={pendingOffers.length} icon={Tag} theme={ROLE_THEME.tenant} />
            <StatCard label="Maintenance" value={pendingMaint} icon={Wrench} theme={ROLE_THEME.admin} sub="pending" />
          </>}
          {user.role === 'tenant' && <>
            <StatCard label="Active Leases" value={activeLeases.length} icon={Key} theme={theme} />
            <StatCard label="My Offers" value={offers.length} icon={Tag} theme={ROLE_THEME.property_manager} />
            <StatCard label="Payments Made" value={payments.filter(p => p.status === 'paid').length} icon={CreditCard} theme={ROLE_THEME.admin} />
            <StatCard label="Open Disputes" value={pendingDisputes} icon={Scale} theme={ROLE_THEME.landlord} />
          </>}
          {user.role === 'property_manager' && <>
            <StatCard label="Properties" value={properties.length} icon={Building2} theme={theme} />
            <StatCard label="Active Tenants" value={activeLeases.length} icon={Users} theme={ROLE_THEME.tenant} />
            <StatCard label="Maintenance" value={pendingMaint} icon={Wrench} theme={ROLE_THEME.admin} sub="pending" />
            <StatCard label="Open Disputes" value={pendingDisputes} icon={Scale} theme={ROLE_THEME.landlord} />
          </>}
          {(user.role === 'admin' || user.role === 'law_reviewer') && <>
            <StatCard label="Agreements" value={agreements.length} icon={FileText} theme={theme} />
            <StatCard label="Active Leases" value={activeLeases.length} icon={CheckCircle} theme={ROLE_THEME.tenant} />
            <StatCard label="Open Disputes" value={pendingDisputes} icon={Scale} theme={ROLE_THEME.admin} />
            <StatCard label="Maintenance" value={pendingMaint} icon={Wrench} theme={ROLE_THEME.property_manager} />
          </>}
        </motion.div>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        {qkActions.length > 0 && (
          <motion.div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.16, ease: [0.21, 0.6, 0.35, 1] }}
          >
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(200,220,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginRight: 4 }}>Quick</span>
            {qkActions.map(a => <ActionPill key={a.href} href={a.href} icon={a.icon} label={a.label} theme={theme} />)}
          </motion.div>
        )}

        {/* ── Charts ───────────────────────────────────────────────────── */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.21, 0.6, 0.35, 1] }}
        >
          {/* Bar chart */}
          <div style={{ ...glassPanel, padding: '24px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7C8799', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
              Monthly Payments (last 6 months)
            </p>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600, fill: '#7C8799' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#7C8799' }} />
                  <Tooltip
                    formatter={v => [`Rs. ${v.toLocaleString()}`, 'Amount']}
                    contentStyle={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 12, boxShadow: '0 8px 24px rgba(11,45,114,0.12)' }}
                  />
                  <Bar dataKey="amount" fill={theme.accent} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0', fontSize: '0.85rem', fontWeight: 600 }}>
                No payment data yet
              </div>
            )}
          </div>

          {/* Pie chart */}
          <div style={{ ...glassPanel, padding: '24px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7C8799', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
              Agreement Status
            </p>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72}
                    labelLine={false} label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0', fontSize: '0.85rem', fontWeight: 600 }}>
                No agreements yet
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Portfolio Status ──────────────────────────────────────────── */}
        {propStatData.length > 0 && (
          <motion.div
            style={{ ...glassPanel, padding: '24px' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.22, ease: [0.21, 0.6, 0.35, 1] }}
          >
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7C8799', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>Portfolio Status</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {propStatData.map((d, i) => (
                <div key={d.name} style={{
                  flex: 1, borderRadius: 14, padding: '18px', textAlign: 'center',
                  background: `${CHART_COLORS[i]}14`,
                  border: `1.5px solid ${CHART_COLORS[i]}30`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: '2.2rem', fontWeight: 800, color: CHART_COLORS[i], lineHeight: 1 }}>{d.value}</p>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7C8799', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{d.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Active Occupancy ──────────────────────────────────────────── */}
        <motion.div
          style={{ ...glassPanel, overflow: 'hidden' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.21, 0.6, 0.35, 1] }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(11,45,114,0.07)' }}>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#0D1B2A' }}>Active Occupancy</p>
            {user.role === 'landlord' && (
              <Link href="/dashboard/properties/new" style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                background: theme.light, color: theme.accent,
                borderRadius: 10, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none',
                border: `1px solid ${theme.accent}20`,
              }}>
                <Plus size={13} /> Add Property
              </Link>
            )}
          </div>
          {activeLeases.length > 0 ? (
            activeLeases.map(l => <LeaseRow key={l._id} lease={l} role={user.role} />)
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#A0AEC0' }}>
              <Building2 size={36} style={{ margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>No active leases found.</p>
            </div>
          )}
        </motion.div>

        {/* ── Payment Calendar ─────────────────────────────────────────── */}
        {user.role === 'landlord' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28, ease: [0.21, 0.6, 0.35, 1] }}
          >
            <div style={glassPanel}>
              <PaymentCalendar theme={theme} agreements={agreements} payments={payments} />
            </div>
          </motion.div>
        )}

      </motion.div>
    </>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function buildMonthly(payments) {
  const map = {};
  payments.filter(p => p.status === 'paid').forEach(p => {
    const d = new Date(p.paidAt || p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + (p.amount || 0);
  });
  return Object.entries(map).sort().slice(-6).map(([month, amount]) => ({ month, amount }));
}
function buildStatus(agreements) {
  const map = {};
  agreements.forEach(a => { map[a.status] = (map[a.status] || 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}
function buildPropStatus(properties) {
  const map = {};
  properties.forEach(p => { map[p.status] = (map[p.status] || 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}