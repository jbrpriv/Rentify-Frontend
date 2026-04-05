'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  Clock,
  Wallet,
  CreditCard,
} from 'lucide-react';

const STATUS_BADGE = {
  pending_approval: 'bg-amber-100 text-amber-800 border border-amber-200',
  paid: 'bg-green-100 text-green-800 border border-green-200',
  failed: 'bg-red-100 text-red-800 border border-red-200',
};

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const { formatMoney, formatMoneyCompact } = useCurrency();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('pending_approval');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: '25',
        status,
      });
      const res = await api.get(`/admin/payments?${query.toString()}`);
      setData(res.data);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load payment approvals', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, status, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (paymentId) => {
    if (!paymentId) return;
    setApprovingId(paymentId);
    try {
      await api.put(`/admin/payments/${paymentId}/approve`, {});
      toast('Payment approved and payout transferred', 'success');
      await fetchData();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to approve payment', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const payments = data?.payments || [];
  const pagination = data?.pagination;
  const summary = data?.summary || {
    pendingCount: 0,
    pendingTenantPaidTotal: 0,
    pendingLandlordPayoutTotal: 0,
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Payment Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Approve tenant-paid rent before landlord payouts are released.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={Clock}
          label="Pending Payments"
          value={summary.pendingCount}
          sub="Awaiting admin approval"
        />
        <SummaryCard
          icon={CreditCard}
          label="Tenant Paid Total"
          value={formatMoneyCompact(summary.pendingTenantPaidTotal || 0)}
          sub={formatMoney(summary.pendingTenantPaidTotal || 0)}
        />
        <SummaryCard
          icon={Wallet}
          label="Landlord Payout Total"
          value={formatMoneyCompact(summary.pendingLandlordPayoutTotal || 0)}
          sub={formatMoney(summary.pendingLandlordPayoutTotal || 0)}
        />
      </div>

      <div className="flex items-center gap-2">
        {[
          { key: 'pending_approval', label: 'Pending Approval' },
          { key: 'paid', label: 'Approved' },
          { key: 'all', label: 'All' },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => {
              setPage(1);
              setStatus(opt.key);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              status === opt.key
                ? 'bg-[#0B2D72] text-white border-[#0B2D72]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#0B2D72]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Tenant</th>
                <th className="px-4 py-3 text-left">Landlord</th>
                <th className="px-4 py-3 text-left">Property</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Tenant Paid</th>
                <th className="px-4 py-3 text-left">Landlord Payout</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Paid At</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 font-medium">
                    No payments found for this filter.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const statusBadge = STATUS_BADGE[payment.status] || 'bg-gray-100 text-gray-700 border border-gray-200';
                  const payoutAmount = Number(
                    payment.landlordPayoutAmount ?? payment.agreement?.financials?.rentAmount ?? payment.amount ?? 0
                  );
                  const canApprove = payment.status === 'pending_approval' && !!payment.landlord?.stripeId;

                  return (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{payment.tenant?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{payment.tenant?.email || 'N/A'}</p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{payment.landlord?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{payment.landlord?.email || 'N/A'}</p>
                      </td>

                      <td className="px-4 py-3 text-gray-700">{payment.property?.title || 'N/A'}</td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-bold uppercase bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]">
                          {String(payment.type || 'rent').replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-black text-gray-900">{formatMoney(Number(payment.amount || 0))}</td>
                      <td className="px-4 py-3 font-black text-[#0B2D72]">{formatMoney(payoutAmount)}</td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${statusBadge}`}>
                          {String(payment.status || 'pending').replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : '-'}
                      </td>

                      <td className="px-4 py-3">
                        {payment.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApprove(payment._id)}
                            disabled={!canApprove || approvingId === payment._id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-[#E6EAF2] text-[#0B2D72] border-[#CBD5E1] hover:bg-[#DBE2ED] disabled:opacity-50"
                            title={!payment.landlord?.stripeId ? 'Landlord must connect Stripe first' : ''}
                          >
                            {approvingId === payment._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            {approvingId === payment._id
                              ? 'Approving...'
                              : payment.landlord?.stripeId
                                ? 'Approve Payout'
                                : 'Stripe Not Connected'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-semibold text-gray-600">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="w-10 h-10 rounded-xl bg-[#E6EAF2] text-[#0B2D72] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
