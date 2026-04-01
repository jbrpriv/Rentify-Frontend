'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';
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

/* ─── Colour tokens (Updated to New Palette) ─────────────────────────────── */
const ROLE_THEME = {
  landlord: { accent: '#0B2D72', light: '#E6EAF2', text: '#0B2D72', dot: '#0B2D72' }, // Deep Blue
  tenant: { accent: '#0992C2', light: '#E6F4F8', text: '#0992C2', dot: '#0992C2' }, // Mid Blue
  property_manager: { accent: '#0AC4E0', light: '#E6FAFD', text: '#078A9E', dot: '#0AC4E0' }, // Cyan
  admin: { accent: '#DC2626', light: '#FEE2E2', text: '#991B1B', dot: '#EF4444' }, // Kept semantic red for admin alerts
  law_reviewer: { accent: '#1F2933', light: '#F3F4F6', text: '#1F2933', dot: '#4B5563' }, // Neutral Slate
};

// Deep Blue, Mid Blue, Cyan, Cream, Slate
const CHART_COLORS = ['#0B2D72', '#0992C2', '#0AC4E0', '#F6E7BC', '#1F2933'];

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, theme, sub }) {
  return (
    <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: '1px solid rgba(11, 45, 114, 0.12)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: theme.light, opacity: .6 }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: '2.2rem', fontWeight: 800, color: '#1F2933', letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</p>
          {sub && <p style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.light, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
      background: theme.light, color: theme.accent, borderRadius: 40,
      fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none',
      border: `1.5px solid ${theme.accent}22`, transition: 'all .15s',
    }}>
      <Icon size={15} />{label}
    </Link>
  );
}

/* ─── Alert banner ───────────────────────────────────────────────────────── */
function AlertBanner({ tasks, role, theme }) {
  if (tasks.length === 0) return null;
  return (
    <div style={{ background: `${theme.accent}10`, borderLeft: `5px solid ${theme.accent}`, borderRadius: '0 14px 14px 0', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ background: theme.light, borderRadius: 10, padding: 8 }}>
          <Bell size={18} style={{ color: theme.accent }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2933', marginBottom: 2 }}>
            {tasks.length} task{tasks.length > 1 ? 's' : ''} need your attention
          </p>
          <p style={{ fontSize: '0.78rem', color: '#4B5563' }}>{tasks.join(' · ')}</p>
        </div>
      </div>
      <Link href={role === 'landlord' ? '/dashboard/offers' : '/dashboard/agreements'}
        style={{ padding: '8px 16px', background: theme.accent, color: 'white', borderRadius: 10, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
        Review
      </Link>
    </div>
  );
}

/* ─── Lease row ──────────────────────────────────────────────────────────── */
function LeaseRow({ lease, role }) {
  const { formatMoney } = useCurrency();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(11, 45, 114, 0.08)', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E6FAFD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={16} color="#0AC4E0" />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1F2933' }}>{lease.property?.title || 'Property'}</p>
          {role !== 'tenant' && lease.tenant && (
            <p style={{ fontSize: '0.72rem', color: '#6B7280' }}>{lease.tenant?.name}</p>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#1F2933' }}>{formatMoney(lease.financials?.rentAmount)}</p>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0992C2', background: '#E6F4F8', padding: '2px 8px', borderRadius: 20 }}>Active</span>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function DashboardHome() {
  const { user } = useUser();
  const { formatMoney, formatMoneyCompact } = useCurrency();
  const [agreements, setAgreements] = useState([]);
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [offers, setOffers] = useState([]);
  const [pendingDisputes, setPD] = useState(0);
  const [pendingMaint, setPM] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        // Use the lightweight dashboard summary endpoint for counts + recent items
        const [summaryResp, payResp] = await Promise.all([
          api.get('/users/dashboard-summary').catch(() => ({ data: null })),
          api.get('/payments?limit=200').catch(() => ({ data: { payments: [] } })),
        ]);

        const summary = summaryResp.data;
        if (summary) {
          setAgreements(summary.recentAgreements || []);
          setPayments(payResp.data?.payments || []);
          setPD(summary.counts?.pendingDisputes || 0);
          setPM(summary.counts?.pendingMaintenance || 0);
          // For property count and offers, use summary counts
          if (['landlord', 'property_manager', 'admin'].includes(user.role)) {
            // Properties list needed for calendar — fetch separately but lightweight
            api.get('/properties').catch(() => ({ data: [] }))
              .then(r => setProperties(Array.isArray(r.data) ? r.data : []));
          }
          setOffers([]); // offers list not needed for overview — count from summary
        } else {
          // Fallback: individual requests if summary endpoint unavailable
          const [agResp, offerResp] = await Promise.all([
            api.get('/agreements').catch(() => ({ data: [] })),
            api.get('/offers').catch(() => ({ data: { offers: [] } })),
          ]);
          setAgreements(agResp.data || []);
          setOffers((offerResp.data?.offers || []));

          if (['landlord', 'property_manager', 'admin'].includes(user.role)) {
            const propResp = await api.get('/properties').catch(() => ({ data: [] }));
            setProperties(Array.isArray(propResp.data) ? propResp.data : []);
          }

          setPayments(payResp.data?.payments || []);

          const [dispResp, maintResp] = await Promise.all([
            api.get('/disputes').catch(() => ({ data: { disputes: [] } })),
            api.get('/maintenance').catch(() => ({ data: [] })),
          ]);
          setPD((dispResp.data?.disputes || []).filter(d => ['open', 'under_review'].includes(d.status)).length);
          setPM((Array.isArray(maintResp.data) ? maintResp.data : []).filter(m => ['pending', 'in_progress'].includes(m.status)).length);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (!user || loading) return (
    <>
      <style>{`
        @keyframes shimmer { 0% { background-position: -600px 0 } 100% { background-position: 600px 0 } }
        .sk { background: linear-gradient(90deg, #f0f2f5 25%, #e4e7ec 50%, #f0f2f5 75%); background-size: 600px 100%; animation: shimmer 1.4s infinite linear; border-radius: 12px; }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto' }}>

        {/* Header skeleton */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="sk" style={{ width: 220, height: 38 }} />
            <div className="sk" style={{ width: 140, height: 14 }} />
          </div>
          <div className="sk" style={{ width: 120, height: 36, borderRadius: 40 }} />
        </div>

        {/* Stat cards skeleton — 4 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: '1px solid #e5e7eb' }}>
              <div className="sk" style={{ width: 44, height: 44, borderRadius: 14, marginBottom: 14 }} />
              <div className="sk" style={{ width: '55%', height: 12, marginBottom: 10 }} />
              <div className="sk" style={{ width: '70%', height: 32 }} />
            </div>
          ))}
        </div>

        {/* Quick actions skeleton */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sk" style={{ width: 130, height: 38, borderRadius: 40 }} />
          ))}
        </div>

        {/* Charts skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 18, padding: 24, border: '1px solid #e5e7eb' }}>
              <div className="sk" style={{ width: '45%', height: 14, marginBottom: 20 }} />
              <div className="sk" style={{ width: '100%', height: 160 }} />
            </div>
          ))}
        </div>

      </div>
    </>
  );

  const theme = ROLE_THEME[user.role] || ROLE_THEME.tenant;
  const activeLeases = agreements.filter(a => a.status === 'active');
  const pendingOffers = offers.filter(o => ['pending', 'countered'].includes(o.status));
  const totalRevenue = activeLeases.reduce((s, a) => s + (a.financials?.rentAmount || 0), 0);

  /* Alert tasks */
  const tasks = [];
  if (user.role === 'landlord') {
    if (pendingOffers.length) tasks.push(`${pendingOffers.length} offer(s) to review`);
    if (pendingDisputes > 0) tasks.push(`${pendingDisputes} open dispute(s)`);
    if (pendingMaint > 0) tasks.push(`${pendingMaint} maintenance request(s)`);

    const now = new Date();
    const RENEWAL_DAYS = 60;
    const expiringLeases = activeLeases.filter(a => {
      if (!a.term?.endDate) return false;
      const diff = (new Date(a.term.endDate) - now) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= RENEWAL_DAYS;
    });
    if (expiringLeases.length > 0) {
      tasks.push(`${expiringLeases.length} lease(s) ending within 60 days`);
    }
  } else if (user.role === 'tenant') {
    const awaitSign = agreements.filter(a => a.status === 'sent' && !a.signatures?.tenant?.signed);
    if (awaitSign.length) tasks.push(`${awaitSign.length} agreement(s) to sign`);
    if (pendingOffers.length) tasks.push(`${pendingOffers.length} offer in negotiation`);
  } else {
    if (pendingDisputes > 0) tasks.push(`${pendingDisputes} dispute(s)`);
    if (pendingMaint > 0) tasks.push(`${pendingMaint} maintenance(s)`);
  }

  /* Chart data */
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

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&display=swap');`}</style>

      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.21, 0.6, 0.35, 1] }}
      >

        {/* ── Header ── */}
        <motion.div
          style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.21, 0.6, 0.35, 1] }}
        >
          <div>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '2.4rem', color: '#1F2933', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
              Hi, {user.name?.split(' ')[0]}
            </h1>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {user.role === 'landlord' ? 'Landlord Dashboard'
                : user.role === 'tenant' ? 'Tenant Portal'
                  : user.role === 'property_manager' ? 'Property Manager Portal'
                    : user.role === 'admin' ? 'Admin Dashboard'
                      : 'Dashboard'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'white', borderRadius: 40, border: '1px solid rgba(11, 45, 114, 0.12)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: theme.dot, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {user.role?.replace('_', ' ')}
            </span>
          </div>
        </motion.div>

        {/* ── Alert ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.21, 0.6, 0.35, 1] }}
        >
          <AlertBanner tasks={tasks} role={user.role} theme={theme} />
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14, ease: [0.21, 0.6, 0.35, 1] }}
        >
          {user.role === 'landlord' && (
            <>
              <StatCard label="Monthly Income" value={formatMoneyCompact(totalRevenue)} icon={TrendingUp} theme={theme} sub={`${activeLeases.length} active lease(s)`} />
              <StatCard label="Late Fees" value={formatMoneyCompact(payments.reduce((s, p) => s + (p.lateFeeAmount || 0), 0))} icon={AlertCircle} theme={theme} sub={`${payments.filter(p => p.status === 'late_fee_applied').length} pending fee(s)`} />
              <StatCard label="Properties" value={properties.length} icon={Building2} theme={theme} />
              <StatCard label="Agreements" value={agreements.length} icon={FileText} theme={theme} />
              <StatCard label="Active Offers" value={pendingOffers.length} icon={Tag} theme={theme} />
              <StatCard label="Maintenance" value={pendingMaint} icon={Wrench} theme={theme} sub="pending" />
            </>
          )}
          {user.role === 'tenant' && (
            <>
              <StatCard label="Active Leases" value={activeLeases.length} icon={Key} theme={theme} />
              <StatCard label="My Offers" value={offers.length} icon={Tag} theme={theme} />
              <StatCard label="Payments Made" value={payments.filter(p => p.status === 'paid').length} icon={CreditCard} theme={theme} />
              <StatCard label="Open Disputes" value={pendingDisputes} icon={Scale} theme={theme} />
            </>
          )}
          {user.role === 'property_manager' && (
            <>
              <StatCard label="Properties" value={properties.length} icon={Building2} theme={theme} />
              <StatCard label="Active Tenants" value={activeLeases.length} icon={Users} theme={theme} />
              <StatCard label="Maintenance" value={pendingMaint} icon={Wrench} theme={theme} sub="pending" />
              <StatCard label="Open Disputes" value={pendingDisputes} icon={Scale} theme={theme} />
            </>
          )}
          {(user.role === 'admin' || user.role === 'law_reviewer') && (
            <>
              <StatCard label="Agreements" value={agreements.length} icon={FileText} theme={theme} />
              <StatCard label="Active Leases" value={activeLeases.length} icon={CheckCircle} theme={theme} />
              <StatCard label="Open Disputes" value={pendingDisputes} icon={Scale} theme={theme} />
              <StatCard label="Maintenance" value={pendingMaint} icon={Wrench} theme={theme} />
            </>
          )}
        </motion.div>

        {/* ── Quick Actions ── */}
        {qkActions.length > 0 && (
          <motion.div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.16, ease: [0.21, 0.6, 0.35, 1] }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 4 }}>Quick</span>
            {qkActions.map(a => <ActionPill key={a.href} href={a.href} icon={a.icon} label={a.label} theme={theme} />)}
          </motion.div>
        )}

        {/* ── Charts ── */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.21, 0.6, 0.35, 1] }}
        >
          {/* Bar chart */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(11, 45, 114, 0.12)', padding: '24px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Monthly Payments (last 6 months)</p>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => [formatMoney(v), 'Amount']} />
                  <Bar dataKey="amount" fill={theme.accent} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 600 }}>No payment data yet</div>}
          </div>

          {/* Pie chart */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(11, 45, 114, 0.12)', padding: '24px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Agreement Status</p>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 600 }}>No agreements yet</div>}
          </div>
        </motion.div>

        {/* ── Property status (landlord / PM) ── */}
        {propStatData.length > 0 && (
          <motion.div
            style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(11, 45, 114, 0.12)', padding: '24px' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.22, ease: [0.21, 0.6, 0.35, 1] }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Portfolio Status</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {propStatData.map((d, i) => (
                <div key={d.name} style={{ flex: 1, borderRadius: 14, padding: '18px', textAlign: 'center', background: `${CHART_COLORS[i]}12`, border: `1.5px solid ${CHART_COLORS[i]}30` }}>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: '2.2rem', fontWeight: 800, color: CHART_COLORS[i], lineHeight: 1 }}>{d.value}</p>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{d.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Active Occupancy ── */}
        <motion.div
          style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(11, 45, 114, 0.12)', overflow: 'hidden' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.21, 0.6, 0.35, 1] }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(11, 45, 114, 0.08)' }}>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#1F2933' }}>Active Occupancy</p>
            {user.role === 'landlord' && (
              <Link href="/dashboard/properties/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: theme.light, color: theme.accent, borderRadius: 10, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                <Plus size={13} /> Add Property
              </Link>
            )}
          </div>
          {activeLeases.length > 0 ? (
            activeLeases.map(l => <LeaseRow key={l._id} lease={l} role={user.role} />)
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9CA3AF' }}>
              <Building2 size={36} style={{ margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>No active leases found.</p>
            </div>
          )}
        </motion.div>

        {/* ── Payment Calendar (Landlord Only) ── */}
        {user.role === 'landlord' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28, ease: [0.21, 0.6, 0.35, 1] }}
          >
            <PaymentCalendar theme={theme} agreements={agreements} payments={payments} />
          </motion.div>
        )}

      </motion.div>
    </>
  );
}

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