'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Users, FileText, Building2, Wrench, TrendingUp,
  CheckCircle, Clock, AlertCircle, Zap, Crown, Loader2,
  DollarSign, BarChart2, RefreshCw, ShieldAlert,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const TIER_COLORS = { free: '#CBD5E1', pro: '#0992C2', enterprise: '#0B2D72' };
const PIE_FALLBACK = ['#0B2D72', '#0992C2', '#0AC4E0', '#CBD5E1', '#E6EAF2'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthLabel({ year, month }) {
  return `${MONTHS[(month ?? 1) - 1]} ${year}`;
}

export default function AdminStatsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { formatMoney, formatMoneyCompact } = useCurrency();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') router.push('/dashboard');
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/analytics'),
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingSpinner />;
  if (loadError || !stats) return (
    <div className="text-center py-20">
      <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
      <p className="text-gray-500 font-semibold">Failed to load platform data</p>
      <button onClick={loadData} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1] rounded-xl text-sm font-bold hover:bg-[#DBE2ED]">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  const { totals, monthlySubscriptionRevenue, usersBySubscription, agreementsByMonth, generatedAt } = stats;

  const agreementsChartData = agreementsByMonth.map(m => ({ name: monthLabel(m._id), count: m.count }));

  const tierOrder = ['enterprise', 'pro', 'free'];
  const subChartData = tierOrder
    .map(tier => {
      const found = usersBySubscription.find(u => u._id === tier);
      return { name: tier.charAt(0).toUpperCase() + tier.slice(1), value: found?.count || 0 };
    })
    .filter(d => d.value > 0);

  const revenueChartData = analytics?.monthlyRentRevenue?.map(m => ({ name: monthLabel(m._id), revenue: m.total })) || [];
  const userGrowthData = analytics?.userGrowth?.map(m => ({ name: monthLabel(m._id), users: m.count })) || [];
  const disputeData = analytics?.disputeStats ? Object.entries(analytics.disputeStats).map(([k, v]) => ({ name: k, value: v })) : [];
  const maintenanceData = analytics?.maintenanceStats ? Object.entries(analytics.maintenanceStats).map(([k, v]) => ({ name: k, value: v })) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Platform Analytics</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Real-time platform health &amp; metrics</p>
          {generatedAt && (
            <p className="text-gray-300 text-xs mt-0.5">
              Data as of {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button onClick={loadData} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition" title="Refresh">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Users &amp; Subscriptions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total Users" value={totals.users} icon={Users} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
          <KpiCard label="Pro Subscribers" value={totals.pro} icon={Zap} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
          <KpiCard label="Enterprise Subscribers" value={totals.enterprise} icon={Crown} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
          <KpiCard label="Monthly Sub Revenue" value={formatMoneyCompact(monthlySubscriptionRevenue || 0)} icon={TrendingUp} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
        </div>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Platform Health</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Active Leases" value={totals.activeAgreements} icon={CheckCircle} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
          <KpiCard label="Pending Agreements" value={totals.pendingAgreements} icon={Clock} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
          <KpiCard label="Total Properties" value={totals.properties} icon={Building2} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
          <KpiCard label="Open Maintenance" value={totals.openMaintenanceRequests} icon={Wrench} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
        </div>
      </div>

      {analytics && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Revenue &amp; Churn</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Rent Collected" value={formatMoneyCompact(analytics.totalRentRevenue || 0)} icon={DollarSign} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
            <KpiCard label="Agreements Created (6m)" value={analytics.createdLast6 ?? 0} icon={FileText} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
            <KpiCard label="Expired / Churned (6m)" value={analytics.expiredLast6 ?? 0} icon={AlertCircle} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
            <KpiCard label="Churn Rate" value={`${analytics.churnRate ?? 0}%`} icon={BarChart2} color="text-[#0B2D72]" bg="bg-[#E6EAF2]" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6">New Agreements — Last 6 Months</h2>
          {agreementsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agreementsChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0B2D72" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-16">No data yet</p>}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6">Users by Subscription</h2>
          {subChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={subChartData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {subChartData.map((entry, i) => (
                      <Cell key={i} fill={TIER_COLORS[entry.name.toLowerCase()] || PIE_FALLBACK[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {subChartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: TIER_COLORS[entry.name.toLowerCase()] || '#94a3b8' }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-gray-400 text-sm text-center py-16">No data yet</p>}
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6">Rent Revenue — Last 6 Months</h2>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [formatMoney(v), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#0B2D72" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm text-center py-16">No payment data yet</p>}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6">User Growth — Last 6 Months</h2>
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={userGrowthData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#0B2D72" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm text-center py-16">No user growth data yet</p>}
          </div>
        </div>
      )}

      {analytics && (disputeData.length > 0 || maintenanceData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#0B2D72]" /> Disputes by Status
            </h2>
            {disputeData.length > 0 ? (
              <div className="space-y-3">
                {disputeData.map(({ name, value }) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{name.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-black text-gray-900 bg-gray-100 px-3 py-0.5 rounded-full">{value}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm text-center py-8">No disputes</p>}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#0B2D72]" /> Maintenance by Status
            </h2>
            {maintenanceData.length > 0 ? (
              <div className="space-y-3">
                {maintenanceData.map(({ name, value }) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{name.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-black text-gray-900 bg-gray-100 px-3 py-0.5 rounded-full">{value}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm text-center py-8">No maintenance data</p>}
          </div>
        </div>
      )}

    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 tracking-tighter">{value}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
    </div>
  );
}