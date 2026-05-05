'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  FileText, Search, Filter, Loader2, AlertCircle,
  CheckCircle, Clock, XCircle, Eye,
} from 'lucide-react';

const STATUS_STYLES = {
  draft: { bg: 'bg-[#E6EAF2]', text: 'text-[#0B2D72]', icon: Clock, label: 'Draft' },
  sent: { bg: 'bg-[#E6EAF2]', text: 'text-[#0B2D72]', icon: Clock, label: 'Sent' },
  signed: { bg: 'bg-[#0B2D72]', text: 'text-[#E6EAF2]', icon: CheckCircle, label: 'Signed' },
  active: { bg: 'bg-[#0B2D72]', text: 'text-[#E6EAF2]', icon: CheckCircle, label: 'Active' },
  expired: { bg: 'bg-[#CBD5E1]', text: 'text-[#1F2933]', icon: AlertCircle, label: 'Expired' },
  terminated: { bg: 'bg-[#CBD5E1]', text: 'text-[#1F2933]', icon: XCircle, label: 'Terminated' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  );
}

export default function AdminAgreementsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const { formatMoney, currency } = useCurrency();

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') router.push('/dashboard');
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const debounceRef = useRef(null);

  const fetchAgreements = useCallback(async (searchVal, statusVal) => {
    setLoading(true);
    try {
      const params = {};
      if (searchVal) params.search = searchVal;
      if (statusVal) params.status = statusVal;
      const { data } = await api.get('/admin/agreements', { params });
      setAgreements(Array.isArray(data) ? data : data.agreements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchAgreements('', ''); }, [fetchAgreements]);

  // Debounce search input — fire after 350 ms of no typing
  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAgreements(val, statusFilter), 350);
  };

  // Status filter fires immediately
  const handleStatusChange = (val) => {
    setStatusFilter(val);
    fetchAgreements(search, val);
  };

  // Status counts derived from current fetched set (accurate for current filter)
  const counts = agreements.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-[#0B2D72]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#0B2D72]" />
            All Agreements
          </h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide agreement monitor</p>
        </div>
        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
          {agreements.length} total
        </span>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(STATUS_STYLES).map(([status, s]) => {
          const Icon = s.icon;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${statusFilter === status
                ? 'border-[#0B2D72] ring-2 ring-[#CBD5E1]'
                : 'border-transparent bg-white hover:border-gray-200'
                } shadow-sm`}
            >
              <div className={`inline-flex p-1.5 rounded-lg mb-1.5 ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.text}`} />
              </div>
              <p className="text-lg font-bold text-gray-900">{counts[status] || 0}</p>
              <p className="text-xs text-gray-500 capitalize">{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by landlord, tenant or property..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2D72]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2D72] appearance-none"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_STYLES).map(([s, v]) => (
              <option key={s} value={s}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-[#0B2D72]" />
        </div>
      ) : agreements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-semibold text-gray-600">No agreements found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="md:hidden divide-y divide-gray-100">
            {agreements.map((a) => (
              <div key={a._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{a.property?.title || '—'}</p>
                    <p className="text-xs text-gray-500 truncate">{a.landlord?.name || '—'} → {a.tenant?.name || '—'}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <p className="text-gray-400">Term</p>
                    <p className="text-gray-700 font-medium leading-snug">
                      {a.term?.startDate
                        ? `${new Date(a.term.startDate).toLocaleDateString()} → ${new Date(a.term.endDate).toLocaleDateString()}`
                        : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2">
                    <p className="text-gray-400">Rent / mo</p>
                    <p className="text-gray-900 font-semibold">
                      {a.financials?.rentAmount ? formatMoney(a.financials.rentAmount) : '—'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setDownloadingId(a._id);
                    try {
                      const response = await api.get(
                        `/agreements/${a._id}/pdf`,
                        { responseType: 'blob', params: { currency } }
                      );
                      const bUrl = URL.createObjectURL(response.data);
                      const link = document.createElement('a');
                      link.href = bUrl;
                      link.download = `agreement-${a._id}.pdf`;
                      link.click();
                      URL.revokeObjectURL(bUrl);
                    } catch {
                      toast('Failed to download PDF. Please try again.', 'error');
                    } finally {
                      setDownloadingId(null);
                    }
                  }}
                  disabled={!!downloadingId}
                  className="inline-flex w-full items-center justify-center gap-1 text-xs text-[#0B2D72] border border-[#CBD5E1] rounded-lg py-2 hover:bg-[#E6EAF2] font-semibold disabled:opacity-50 transition-all"
                >
                  {downloadingId === a._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  Download PDF
                </button>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Property', 'Landlord', 'Tenant', 'Term', 'Rent / mo', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agreements.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">
                      {a.property?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {a.landlord?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {a.tenant?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {a.term?.startDate
                        ? `${new Date(a.term.startDate).toLocaleDateString()} → ${new Date(a.term.endDate).toLocaleDateString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-semibold whitespace-nowrap">
                      {a.financials?.rentAmount
                        ? formatMoney(a.financials.rentAmount)
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          setDownloadingId(a._id);
                          try {
                            const response = await api.get(
                              `/agreements/${a._id}/pdf`,
                              { responseType: 'blob', params: { currency } }
                            );
                            const bUrl = URL.createObjectURL(response.data);
                            const link = document.createElement('a');
                            link.href = bUrl;
                            link.download = `agreement-${a._id}.pdf`;
                            link.click();
                            URL.revokeObjectURL(bUrl);
                          } catch {
                            toast('Failed to download PDF. Please try again.', 'error');
                          } finally {
                            setDownloadingId(null);
                          }
                        }}
                        disabled={!!downloadingId}
                        className="inline-flex items-center gap-1 text-xs text-[#0B2D72] hover:opacity-80 font-semibold disabled:opacity-50 transition-all"
                      >
                        {downloadingId === a._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}