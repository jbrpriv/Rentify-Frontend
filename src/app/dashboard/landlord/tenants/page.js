'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';
import Link from 'next/link';
import { Users, Loader2, Mail, Phone, Building2, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export default function LandlordTenantsPage() {
  const router = useRouter();
  const { user: parsed } = useUser();
  const { formatMoney } = useCurrency();
  // ── Role guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!['landlord','admin'].includes(parsed.role)) {
      router.push('/dashboard');
      return;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ─────────────────────────────────────────────────────────────────────────

  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('active');

  useEffect(() => {
    api.get('/agreements')
      .then(({ data }) => setAgreements(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Map signed/sent → "payment_pending" bucket for display purposes
  const normaliseStatus = (status) => {
    if (status === 'signed' || status === 'sent') return 'payment_pending';
    return status;
  };

  const filtered = filter === 'all'
    ? agreements
    : filter === 'payment_pending'
      ? agreements.filter(a => a.status === 'signed' || a.status === 'sent')
      : agreements.filter(a => a.status === filter);

  // Determine days until lease expiry for expiry alerts
  const withExpiry = filtered.map(a => ({
    ...a,
    daysLeft: Math.ceil((new Date(a.term?.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
  }));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Tenant Overview</h1>
        <p className="text-gray-400 text-sm mt-1">{filtered.length} leases shown</p>
      </div>

      {/* Expiry Alerts */}
      {withExpiry.filter(a => a.daysLeft <= 30 && a.daysLeft >= 0 && a.status === 'active').map(a => (
        <div key={a._id} className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-4 flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">
              Lease expiring in {a.daysLeft} day{a.daysLeft !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-amber-700">{a.property?.title} — {a.tenant?.name}</p>
          </div>
          <Link href="/dashboard/agreements" className="text-xs font-black text-amber-800 uppercase tracking-widest hover:underline">
            View
          </Link>
        </div>
      ))}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 10, padding: 4, alignSelf: 'flex-start', width: 'fit-content', flexWrap: 'wrap' }}>
        {['active','payment_pending','expired','all'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px', borderRadius: 7, fontSize: '0.82rem', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: filter === s ? 'white' : 'transparent', color: filter === s ? '#0F172A' : '#94A3B8',
              boxShadow: filter === s ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}
          >
            {s === 'payment_pending' ? 'Payment Pending' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-bold text-gray-500">No tenants found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="md:hidden divide-y divide-gray-100">
            {withExpiry.map(a => {
              const expiringSoon = a.daysLeft <= 30 && a.daysLeft >= 0 && a.status === 'active';
              return (
                <div key={a._id} className={`p-4 space-y-3 ${expiringSoon ? 'bg-amber-50/30' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{a.tenant?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{a.tenant?.email}</p>
                    </div>
                    <span className="bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1] text-[10px] font-black uppercase px-2 py-1 rounded-full">
                      {(a.status === 'signed' || a.status === 'sent') ? 'Payment Pending' : a.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">Property: {a.property?.title}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-gray-400">Rent</p>
                      <p className="font-semibold text-gray-900">{formatMoney(a.financials?.rentAmount || 0)}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-gray-400">Lease End</p>
                      <p className={`${expiringSoon ? 'text-amber-600 font-bold' : 'text-gray-700'}`}>
                        {new Date(a.term?.endDate).toLocaleDateString()} {expiringSoon ? `(${a.daysLeft}d)` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {a.tenant?.email && (
                      <a href={`mailto:${a.tenant.email}`} className="text-blue-400 hover:text-blue-600">
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {a.tenant?.phoneNumber && (
                      <a href={`tel:${a.tenant.phoneNumber}`} className="text-green-400 hover:text-green-600">
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    {a.tenant?._id && (
                      <Link
                        href={`/dashboard/landlord/tenant-documents?tenantId=${a.tenant._id}&name=${encodeURIComponent(a.tenant.name || 'Tenant')}`}
                        className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1] px-2.5 py-1 rounded-lg hover:bg-[#DBE2ED] transition"
                        title="View tenant documents (secure, view-only)"
                      >
                        Docs
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Tenant</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Property</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Rent</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Lease End</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="text-right px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {withExpiry.map(a => {
                const expiringSoon = a.daysLeft <= 30 && a.daysLeft >= 0 && a.status === 'active';
                return (
                  <tr key={a._id} className={`hover:bg-gray-50 transition-colors ${expiringSoon ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{a.tenant?.name}</p>
                      <p className="text-xs text-gray-400">{a.tenant?.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-300 shrink-0" />
                        <span className="text-xs text-gray-700">{a.property?.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {formatMoney(a.financials?.rentAmount || 0)}
                    </td>
                    <td className="px-4 py-4">
                      <div className={`flex items-center gap-1 text-xs ${expiringSoon ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                        <Calendar className="w-3 h-3" />
                        {new Date(a.term?.endDate).toLocaleDateString()}
                        {expiringSoon && <span className="ml-1 text-amber-600">({a.daysLeft}d)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1] text-[10px] font-black uppercase px-2 py-1 rounded-full">
                        {(a.status === 'signed' || a.status === 'sent') ? 'Payment Pending' : a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 items-center">
                        {a.tenant?.email && (
                          <a href={`mailto:${a.tenant.email}`} className="text-blue-400 hover:text-blue-600">
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {a.tenant?.phoneNumber && (
                          <a href={`tel:${a.tenant.phoneNumber}`} className="text-green-400 hover:text-green-600">
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        {a.tenant?._id && (
                          <Link
                            href={`/dashboard/landlord/tenant-documents?tenantId=${a.tenant._id}&name=${encodeURIComponent(a.tenant.name || 'Tenant')}`}
                            className="text-[10px] font-bold uppercase tracking-widest bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1] px-2.5 py-1 rounded-lg hover:bg-[#DBE2ED] transition"
                            title="View tenant documents (secure, view-only)"
                          >
                            Docs
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}