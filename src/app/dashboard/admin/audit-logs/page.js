'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { ShieldCheck, Loader2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const ACTION_COLORS = {
  CREATED: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
  SIGNED: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
  REMINDER_SENT: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
  LATE_FEE_APPLIED: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
  AUTO_EXPIRED: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
  OVERDUE_NOTICE_SENT: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
  PAYMENT_RECEIVED: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
};

export default function AuditLogsPage() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') router.push('/dashboard');
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [action, setAction] = useState('');

  const LIMIT = 50;

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (action) params.set('action', action);
      const { data } = await api.get(`/admin/audit-logs?${params}`);
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(page); }, [page, action]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Audit Logs</h1>
        <p className="text-gray-400 text-sm mt-1">Platform-wide agreement activity trail</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={action}
          onChange={e => { setAction(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2D72]"
        >
          <option value="">All Actions</option>
          <option value="CREATED">Created</option>
          <option value="SIGNED">Signed</option>
          <option value="PAYMENT_RECEIVED">Payment Received</option>
          <option value="LATE_FEE_APPLIED">Late Fee Applied</option>
          <option value="REMINDER_SENT">Reminder Sent</option>
          <option value="AUTO_EXPIRED">Auto Expired</option>
          <option value="OVERDUE_NOTICE_SENT">Overdue Notice Sent</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin h-8 w-8 text-[#0B2D72]" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Action</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Agreement</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">IP Address</th>
                <th className="text-left px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center">
                      <ShieldCheck className="w-10 h-10 mb-3 opacity-30" />
                      <p className="font-bold">No audit logs found</p>
                    </div>
                  </td>
                </tr>
              ) : logs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${ACTION_COLORS[log.action] || 'bg-[#E6EAF2] text-[#1F2933]'}`}>
                      {log.action?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">
                    {String(log.agreementId).slice(-8)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{log.ipAddress || '—'}</td>
                  <td className="px-6 py-3 text-xs text-gray-600 max-w-xs truncate">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">Page {page} of {totalPages} &nbsp;·&nbsp; {totalCount} total entries</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#0B2D72] transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#0B2D72] transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}