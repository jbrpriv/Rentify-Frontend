'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  CreditCard, CheckCircle, Clock, AlertCircle, Loader2,
  Calendar, Download,
} from 'lucide-react';

const STATUS_CONFIG = {
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', icon: CheckCircle },
  pending: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400', icon: Clock },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: AlertCircle },
  late_fee_applied: { label: 'Late Fee Applied', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', icon: AlertCircle },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const { formatMoney, currency } = useCurrency();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'tenant') { router.push('/dashboard/agreements'); }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const [agreements, setAgreements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

  // payment history for the selected agreement
  const [paymentMap, setPaymentMap] = useState({});   // "YYYY-MM" (UTC) → paymentId
  const [downloading, setDownloading] = useState(null); // paymentId being downloaded

  useEffect(() => {
    api.get('/agreements')
      .then((agrRes) => {
        const active = agrRes.data.filter(a => a.status === 'active' && a.rentSchedule?.length > 0);
        setAgreements(active);
        if (active.length > 0) setSelected(active[0]);
      })
      .catch(() => toast('Failed to load payment data', 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When selected agreement changes, load its payment history and build a lookup map.
  // Use UTC month/year to avoid timezone off-by-one flipping the month key.
  useEffect(() => {
    if (!selected) return;
    setPaymentMap({});
    api.get(`/payments/history?agreementId=${selected._id}&status=paid&limit=100`)
      .then(({ data }) => {
        const map = {};
        (data.payments || []).forEach(p => {
          if (p.dueDate) {
            const d = new Date(p.dueDate);
            const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
            map[key] = p._id;
          }
        });
        setPaymentMap(map);
      })
      .catch(() => { }); // non-fatal — receipt buttons just won't appear
  }, [selected?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading)
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  const handlePayNow = async (scheduleIndex) => {
    if (!selected) return;
    const entry = selected.rentSchedule?.[scheduleIndex];
    if (!entry) return;
    setPaying(scheduleIndex);
    try {
      if (entry.checkoutUrl) { window.location.href = entry.checkoutUrl; return; }
      const { data } = await api.get(`/payments/active-checkout/${selected._id}`);
      window.location.href = data.url;
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to initiate payment', 'error');
      setPaying(null);
    }
  };

  // Use responseType:'blob' so Axios never tries to JSON-parse a binary PDF stream.
  // Branch on content-type: JSON means S3 signed URL, otherwise stream the PDF inline.
  const handleDownloadReceipt = async (paymentId) => {
    if (!paymentId) return;
    setDownloading(paymentId);
    try {
      const response = await api.get(`/payments/${paymentId}/receipt`, {
        params: { currency },
        responseType: 'blob',
      });
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        // S3 path — parse blob back to JSON to get the signed URL
        const text = await response.data.text();
        const { url } = JSON.parse(text);
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // Binary PDF fallback — trigger browser download
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${paymentId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to download receipt', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const schedule = selected?.rentSchedule || [];
  const paid = schedule.filter(e => e.status === 'paid').length;
  const overdue = schedule.filter(e => ['overdue', 'late_fee_applied'].includes(e.status)).length;
  const pending = schedule.filter(e => e.status === 'pending').length;
  const totalPaid = schedule.filter(e => e.status === 'paid').reduce((s, e) => s + (e.paidAmount || e.amount), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Payment Schedule</h1>
        <p className="text-gray-400 text-sm mt-1">Track your rent payments across all months</p>
      </div>

      {agreements.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-bold text-gray-500">No active payment schedule</p>
          <p className="text-sm text-gray-400 mt-1">Your payment calendar will appear here after your initial payment</p>
        </div>
      ) : (
        <>
          {agreements.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {agreements.map(a => (
                <button
                  key={a._id}
                  onClick={() => setSelected(a)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${selected?._id === a._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'
                    }`}
                >
                  {a.property?.title}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Months Paid" value={paid} icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
                <SummaryCard label="Pending" value={pending} icon={Clock} color="text-blue-600" bg="bg-blue-50" />
                <SummaryCard label="Overdue" value={overdue} icon={AlertCircle} color="text-red-600" bg="bg-red-50" />
                <SummaryCard label="Total Paid" value={formatMoney(totalPaid)} icon={CreditCard} color="text-indigo-600" bg="bg-indigo-50" />
              </div>

              {/* Lease Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Active Lease</p>
                <h2 className="text-xl font-black text-gray-900">{selected.property?.title}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <span>Rent: <strong className="text-gray-900">{formatMoney(selected.financials?.rentAmount)}/mo</strong></span>
                  <span>Grace period: <strong className="text-gray-900">{selected.financials?.lateFeeGracePeriodDays} days</strong></span>
                  <span>Late fee: <strong className="text-gray-900">{formatMoney(selected.financials?.lateFeeAmount)}</strong></span>
                  <span>Lease ends: <strong className="text-gray-900">{new Date(selected.term?.endDate).toLocaleDateString()}</strong></span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-black text-gray-900 mb-6 uppercase tracking-widest">Rent Calendar</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {schedule.map((entry, i) => {
                    const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    const date = new Date(entry.dueDate);
                    // Use UTC parts to match the paymentMap keys built above
                    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
                    const paymentId = paymentMap[monthKey];
                    const isThisMonth = date.getUTCMonth() === new Date().getUTCMonth() &&
                      date.getUTCFullYear() === new Date().getUTCFullYear();

                    return (
                      <div
                        key={i}
                        className={`rounded-2xl p-4 border-2 transition-all ${isThisMonth ? 'border-blue-400 shadow-md' : 'border-transparent bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-black uppercase text-gray-400">
                            {MONTHS[date.getUTCMonth()]} {date.getUTCFullYear()}
                          </p>
                          {isThisMonth && (
                            <span className="text-[9px] bg-blue-100 text-blue-700 font-black uppercase px-1.5 py-0.5 rounded-full">
                              This Month
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mb-3">
                          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>

                        <p className="font-black text-gray-900 text-sm">
                          {formatMoney(entry.amount)}
                        </p>

                        {entry.lateFeeApplied && (
                          <p className="text-[10px] text-orange-600 mt-1">
                            +{formatMoney(entry.lateFeeAmount)} late fee
                          </p>
                        )}

                        {entry.paidDate && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            Paid: {new Date(entry.paidDate).toLocaleDateString()}
                          </p>
                        )}

                        <p className="text-[10px] text-gray-400 mt-1">
                          Due: {date.toLocaleDateString()}
                        </p>

                        {/* Pay Now — unpaid entries */}
                        {['pending', 'overdue', 'late_fee_applied'].includes(entry.status) && (
                          <button
                            type="button"
                            onClick={() => handlePayNow(i)}
                            disabled={paying === i}
                            className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-lg disabled:opacity-60 transition-colors"
                          >
                            {paying === i
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <CreditCard className="w-3 h-3" />}
                            {paying === i ? 'Processing…' : 'Pay Now'}
                          </button>
                        )}

                        {/* Download Receipt — paid entries with a matched payment record */}
                        {entry.status === 'paid' && paymentId && (
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(paymentId)}
                            disabled={downloading === paymentId}
                            className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-green-50 hover:bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg disabled:opacity-60 transition-colors border border-green-200"
                          >
                            {downloading === paymentId
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Download className="w-3 h-3" />}
                            {downloading === paymentId ? 'Downloading…' : 'Receipt'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className={`${bg} ${color} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </div>
  );
}