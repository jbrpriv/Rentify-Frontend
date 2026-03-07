'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import {
  TrendingUp, Building2, CreditCard, AlertCircle, CheckCircle,
  Clock, Users, FileText, Wrench, Scale, Zap, BarChart2,
  ArrowUpRight, ArrowDownRight, Calendar, Loader2, Download,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

// ─── Palette ──────────────────────────────────────────────────────────────────
const COLORS = ['#0B2D72', '#0992C2', '#0AC4E0', '#F59E0B', '#10B981', '#EF4444'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtMonth({ year, month }) {
  return `${MONTH_NAMES[(month || 1) - 1]} ${String(year).slice(2)}`;
}

function KpiCard({ label, value, sub, icon: Icon, color = 'text-blue-600', bg = 'bg-blue-50', trend, trendUp }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full ${bg} opacity-40 -translate-y-6 translate-x-6`} />
      <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{children}</p>;
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
      <p className="text-sm font-black text-gray-800 mb-5 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .sk { background: linear-gradient(90deg,#f0f2f5 25%,#e4e7ec 50%,#f0f2f5 75%); background-size:600px 100%; animation: shimmer 1.4s infinite linear; border-radius:12px; }
      `}</style>
      <div className="space-y-6">
        <div className="sk h-9 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5"><div className="sk h-10 w-10 rounded-xl mb-3" /><div className="sk h-3 w-20 mb-2" /><div className="sk h-8 w-28" /></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6"><div className="sk h-4 w-32 mb-5" /><div className="sk h-48 w-full" /></div>)}
        </div>
      </div>
    </>
  );
}

const PAYMENT_STATUS = {
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-blue-100 text-blue-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  retry_scheduled: { label: 'Retrying', color: 'bg-orange-100 text-orange-700' },
};

// ─── LANDLORD VIEW ────────────────────────────────────────────────────────────
function LandlordAnalytics({ data }) {
  const { toast } = useToast();
  const { monthlyRevenue, paymentHealth, lateFeeCollected, occupancy,
    expiringLeases, agreementStatus, lifetimeRevenue, activeTenantsCount } = data;

  const [recentPayments, setRecentPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [tenantFilter, setTenantFilter] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    api.get('/payments/history?limit=20&status=paid')
      .then(({ data: d }) => setRecentPayments(d.payments || []))
      .catch(() => { })
      .finally(() => setPaymentsLoading(false));
  }, []);

  const handleDownloadReceipt = useCallback(async (paymentId) => {
    setDownloading(paymentId);
    try {
      const { data: d } = await api.get(`/payments/${paymentId}/receipt`);
      if (d.url) {
        window.open(d.url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // Fallback: blob download
      try {
        const response = await api.get(`/payments/${paymentId}/receipt`, { responseType: 'blob' });
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url; a.download = `receipt-${paymentId}.pdf`; a.click();
        URL.revokeObjectURL(url);
      } catch {
        toast('Failed to download receipt', 'error');
      }
    } finally {
      setDownloading(null);
    }
  }, [toast]);

  const filteredPayments = tenantFilter.trim()
    ? recentPayments.filter(p =>
      p.tenant?.name?.toLowerCase().includes(tenantFilter.toLowerCase()) ||
      p.tenant?.email?.toLowerCase().includes(tenantFilter.toLowerCase())
    )
    : recentPayments;

  const revenueChartData = monthlyRevenue.map(m => ({
    name: fmtMonth(m._id),
    Revenue: m.total,
    'Late Fees': m.lateFeeTotal,
  }));

  const healthData = [
    { name: 'Paid', value: paymentHealth.paid, color: '#10B981' },
    { name: 'Pending', value: paymentHealth.pending, color: '#0992C2' },
    { name: 'Overdue', value: paymentHealth.overdue, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const statusData = Object.entries(agreementStatus).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1), value: v,
  }));

  const occupancyPct = occupancy.total > 0
    ? Math.round((occupancy.leased / occupancy.total) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div>
        <SectionTitle>Portfolio Overview</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Lifetime Revenue" value={`Rs. ${lifetimeRevenue.toLocaleString()}`} icon={TrendingUp} color="text-blue-600" bg="bg-blue-50" />
          <KpiCard label="Active Tenants" value={activeTenantsCount} icon={Users} color="text-cyan-600" bg="bg-cyan-50" />
          <KpiCard label="Occupancy Rate" value={`${occupancyPct}%`}
            sub={`${occupancy.leased} / ${occupancy.total} units`}
            icon={Building2}
            color={occupancyPct >= 75 ? 'text-green-600' : 'text-orange-500'}
            bg={occupancyPct >= 75 ? 'bg-green-50' : 'bg-orange-50'}
          />
          <KpiCard label="Late Fees Collected" value={`Rs. ${lateFeeCollected.toLocaleString()}`} icon={AlertCircle} color="text-orange-600" bg="bg-orange-50" />
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Monthly Revenue (6 months)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueChartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `Rs. ${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Revenue" fill="#0B2D72" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Late Fees" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Rent Payment Health">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={healthData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {healthData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={v => `${v} payments`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {healthData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs font-semibold text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">{d.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Collection rate</span>
                  <span className="font-black text-green-600">
                    {paymentHealth.paid + paymentHealth.pending + paymentHealth.overdue > 0
                      ? Math.round(paymentHealth.paid / (paymentHealth.paid + paymentHealth.pending + paymentHealth.overdue) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Agreement status + expiring leases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Agreement Status Breakdown">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={statusData} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Upcoming Renewals (${expiringLeases.length})`}>
          {expiringLeases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <Calendar className="w-10 h-10 mb-2" />
              <p className="text-sm font-semibold text-gray-400">No leases expiring in 90 days</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {expiringLeases.map(lease => {
                const daysLeft = Math.ceil((new Date(lease.term.endDate) - new Date()) / 86400000);
                return (
                  <div key={lease._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{lease.property?.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{lease.tenant?.name} · Rs. {lease.financials?.rentAmount?.toLocaleString()}/mo</p>
                    </div>
                    <div className={`text-right`}>
                      <span className={`text-xs font-black px-2 py-1 rounded-lg ${daysLeft <= 30 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {daysLeft}d left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Recent Payments ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-black text-gray-800 uppercase tracking-wider">Recent Payments</p>
          <input
            type="text"
            placeholder="Filter by tenant name or email…"
            value={tenantFilter}
            onChange={e => setTenantFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {paymentsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No payments found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Tenant', 'Property', 'Type', 'Amount', 'Date', 'Status', 'Receipt'].map(h => (
                    <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p, i) => {
                  const st = PAYMENT_STATUS[p.status] || PAYMENT_STATUS.pending;
                  return (
                    <tr key={p._id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-gray-900 text-xs">{p.tenant?.name || '—'}</p>
                        <p className="text-[10px] text-gray-400">{p.tenant?.email || '—'}</p>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-600 max-w-[140px] truncate">
                        {p.property?.title || '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {(p.type || '—').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-black text-gray-900 text-xs whitespace-nowrap">
                        Rs. {Number(p.amount).toLocaleString()}
                        {p.lateFeeIncluded && p.lateFeeAmount > 0 && (
                          <span className="block text-[10px] font-normal text-orange-500">
                            +Rs. {Number(p.lateFeeAmount).toLocaleString()} late fee
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-PK') : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3">
                        {p.status === 'paid' ? (
                          <button
                            onClick={() => handleDownloadReceipt(p._id)}
                            disabled={downloading === p._id}
                            className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition whitespace-nowrap"
                          >
                            {downloading === p._id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Download className="w-3 h-3" />}
                            {downloading === p._id ? 'Downloading…' : 'Receipt'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminAnalytics({ data, templateData }) {
  const { monthlyRentRevenue, totalRentRevenue, revenueByGateway,
    churnRate, expiredLast6, createdLast6, userGrowth,
    disputeStats, maintenanceStats } = data;

  const revenueChartData = monthlyRentRevenue.map(m => ({
    name: fmtMonth(m._id),
    Revenue: m.total,
    Payments: m.count,
  }));

  const userGrowthData = userGrowth.map(m => ({
    name: fmtMonth(m._id),
    Users: m.count,
  }));

  const gatewayData = revenueByGateway.map(g => ({
    name: (g._id || 'unknown').charAt(0).toUpperCase() + (g._id || 'unknown').slice(1),
    value: g.total,
    count: g.count,
  }));

  const disputeData = Object.entries(disputeStats).map(([k, v]) => ({
    name: k.replace('_', ' '), value: v,
  }));

  const maintenanceData = Object.entries(maintenanceStats).map(([k, v]) => ({
    name: k.replace('_', ' '), value: v,
  }));

  const topTemplates = templateData?.topTemplates?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div>
        <SectionTitle>Platform Health</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Rent Revenue"
            value={`Rs. ${(totalRentRevenue / 100000).toFixed(1)}L`}
            sub="All time, all landlords"
            icon={TrendingUp}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <KpiCard
            label="Churn Rate (6mo)"
            value={`${churnRate}%`}
            sub={`${expiredLast6} expired / ${createdLast6} created`}
            icon={ArrowDownRight}
            color={churnRate > 30 ? 'text-red-600' : 'text-green-600'}
            bg={churnRate > 30 ? 'bg-red-50' : 'bg-green-50'}
          />
          <KpiCard
            label="Template Usage"
            value={templateData?.totalUsage || 0}
            sub={`${templateData?.totalTemplates || 0} templates`}
            icon={FileText}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <KpiCard
            label="Open Disputes"
            value={(disputeStats.open || 0) + (disputeStats.under_review || 0)}
            sub={`${disputeStats.resolved || 0} resolved`}
            icon={Scale}
            color="text-orange-600"
            bg="bg-orange-50"
          />
        </div>
      </div>

      {/* Revenue + User growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Monthly Rent Revenue (6 months)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueChartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v, n) => n === 'Revenue' ? `Rs. ${v.toLocaleString()}` : v} />
              <Bar dataKey="Revenue" fill="#0B2D72" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New User Signups (6 months)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="Users" stroke="#0992C2" strokeWidth={2.5} dot={{ r: 4, fill: '#0992C2' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Gateway + Disputes + Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Revenue by Gateway">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={gatewayData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                {gatewayData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `Rs. ${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Dispute Status">
          {disputeData.length === 0
            ? <p className="text-sm text-gray-400 mt-6 text-center">No disputes</p>
            : (
              <div className="space-y-3 mt-2">
                {disputeData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700 capitalize">{d.name}</span>
                        <span className="font-black text-gray-900">{d.value}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, d.value / Math.max(...disputeData.map(x => x.value)) * 100)}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </ChartCard>

        <ChartCard title="Maintenance Requests">
          {maintenanceData.length === 0
            ? <p className="text-sm text-gray-400 mt-6 text-center">No data</p>
            : (
              <div className="space-y-3 mt-2">
                {maintenanceData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700 capitalize">{d.name}</span>
                        <span className="font-black text-gray-900">{d.value}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, d.value / Math.max(...maintenanceData.map(x => x.value)) * 100)}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </ChartCard>
      </div>

      {/* Top templates */}
      {topTemplates.length > 0 && (
        <ChartCard title="Top Agreement Templates by Usage">
          <div className="space-y-3">
            {topTemplates.map((t, i) => (
              <div key={t._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                <span className="text-lg font-black text-gray-200 w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.jurisdiction} · {t.status}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-blue-600">{t.usageCount}</p>
                  <p className="text-[10px] text-gray-400">uses</p>
                </div>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (t.usageCount / (topTemplates[0]?.usageCount || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [templateData, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!['landlord', 'admin'].includes(user.role)) { router.push('/dashboard'); return; }

    const fetchAll = async () => {
      try {
        if (user.role === 'landlord') {
          const { data: d } = await api.get('/users/landlord-analytics');
          setData(d);
        } else {
          const [analyticsRes, templateRes] = await Promise.all([
            api.get('/admin/analytics'),
            api.get('/agreement-templates/analytics'),
          ]);
          setData(analyticsRes.data);
          setTemplate(templateRes.data);
        }
      } catch (e) {
        setError('Failed to load analytics data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  if (loading) return <Skeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <AlertCircle className="w-12 h-12 mb-3 text-red-300" />
      <p className="font-semibold">{error}</p>
    </div>
  );

  const isAdmin = user?.role === 'admin';
  const isLandlord = user?.role === 'landlord';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">
            {isAdmin && 'Platform-wide metrics and health indicators'}
            {isLandlord && 'Your portfolio performance and lease insights'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2">
          <BarChart2 className="w-3.5 h-3.5" />
          Live data
        </div>
      </div>

      {isLandlord && data && <LandlordAnalytics data={data} />}
      {isAdmin && data && <AdminAnalytics data={data} templateData={templateData} />}
    </div>
  );
}