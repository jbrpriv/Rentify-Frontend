'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import {
  CreditCard, CheckCircle, Clock, AlertCircle, Loader2,
  Calendar, X,
} from 'lucide-react';

const STATUS_CONFIG = {
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', icon: CheckCircle },
  pending: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400', icon: Clock },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: AlertCircle },
  late_fee_applied: { label: 'Late Fee Applied', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', icon: AlertCircle },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const GATEWAY_META = {
  stripe: { label: 'Card / Stripe', desc: 'Visa, Mastercard, debit cards', icon: '💳', color: '#635bff' },
  razorpay: { label: 'Razorpay', desc: 'UPI, cards, net banking, wallets', icon: '⚡', color: '#2563eb' },
  paypal: { label: 'PayPal', desc: 'PayPal balance or linked card', icon: '🌐', color: '#0070ba' },
};

// ─── Gateway Picker Modal ─────────────────────────────────────────────────────
const ALL_GATEWAYS = [
  { id: 'stripe', name: 'Stripe' },
  { id: 'razorpay', name: 'Razorpay' },
];

function GatewayModal({ gateways, amount, onSelect, onClose, loading }) {
  const enabledIds = gateways.map(g => g.id);
  const displayGateways = ALL_GATEWAYS.map(gw => ({ ...gw, enabled: enabledIds.includes(gw.id) }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', animation: 'gwFadeIn 0.2s ease' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes gwFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes gwSlideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .gw-sheet { animation: gwSlideUp 0.28s cubic-bezier(0.3,1,0.4,1) both; }
      `}</style>
      <div className="gw-sheet bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-black text-gray-900 text-lg">Choose Payment Option</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Amount: <strong className="text-gray-700">Rs. {amount?.toLocaleString()}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {displayGateways.map((gw) => {
            const meta = GATEWAY_META[gw.id] || { label: gw.name, desc: '', icon: '💰', color: '#374151' };
            const isDisabled = loading || !gw.enabled;
            return (
              <button
                key={gw.id}
                onClick={() => !isDisabled && onSelect(gw.id)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${!gw.enabled
                    ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 disabled:opacity-60'
                  }`}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${meta.color}18` }}
                >
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{meta.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {!gw.enabled ? 'Not configured by admin' : meta.desc}
                  </p>
                </div>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
                ) : gw.enabled ? (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-blue-400 transition flex-shrink-0" />
                ) : (
                  <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">Unavailable</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 pb-5 px-6">
          Payments are secured and encrypted. You will not be charged until you confirm.
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'tenant') { router.push('/dashboard/agreements'); }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const [agreements, setAgreements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [gateways, setGateways] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingIdx, setPendingIdx] = useState(null);
  const [gwLoading, setGwLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/agreements'),
      api.get('/payments/gateways'),
    ]).then(([agrRes, gwRes]) => {
      const active = agrRes.data.filter(a => a.status === 'active' && a.rentSchedule?.length > 0);
      setAgreements(active);
      if (active.length > 0) setSelected(active[0]);
      setGateways(gwRes.data?.gateways || []);
    }).catch(() => toast('Failed to load payment data', 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading)
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  const handlePayNow = (scheduleIndex) => {
    if (gateways.length === 0) {
      toast('No payment gateways available', 'warning');
      return;
    }
    // Always prompt — user picks the gateway consciously
    setPendingIdx(scheduleIndex);
    setModalOpen(true);
  };

  const handleGatewaySelect = async (gatewayId) => {
    setModalOpen(false);
    await processPayment(gatewayId, pendingIdx);
    setPendingIdx(null);
  };

  // Ensure Razorpay checkout.js is loaded
  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

  const processPayment = async (gatewayId, scheduleIndex) => {
    if (!selected) return;
    setPaying(scheduleIndex);

    try {
      if (gatewayId === 'stripe') {
        // Use pre-generated URL if available, otherwise create on-demand
        const entry = selected.rentSchedule?.[scheduleIndex];
        if (entry?.checkoutUrl) {
          window.location.href = entry.checkoutUrl;
          return;
        }
        // This calls the route that was previously missing (now fixed in paymentRoutes.js)
        const { data } = await api.get(`/payments/active-checkout/${selected._id}`);
        window.location.href = data.url;

      } else if (gatewayId === 'razorpay') {
        await loadRazorpayScript();
        const { data: order } = await api.post('/payments/razorpay/create-order', {
          agreementId: selected._id,
        });

        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: 'RentifyPro',
          description: 'Rent Payment',
          prefill: order.prefill,
          theme: { color: '#2563eb' },
          handler: async (response) => {
            setGwLoading(true);
            try {
              await api.post('/payments/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                agreementId: selected._id,
              });
              toast('🎉 Payment successful!', 'success');
              router.push('/dashboard/payments?success=razorpay');
            } catch (err) {
              toast(err.response?.data?.message || 'Payment verification failed', 'error');
            } finally {
              setGwLoading(false);
              setPaying(null);
            }
          },
          modal: {
            ondismiss: () => {
              setPaying(null);
              toast('Payment cancelled', 'warning');
            },
          },
        });
        rzp.open();
        return; // Don't reset paying — Razorpay handler will

      } else if (gatewayId === 'paypal') {
        const { data } = await api.post('/payments/paypal/create-order', {
          agreementId: selected._id,
        });
        window.location.href = data.approveUrl;
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to initiate payment', 'error');
      setPaying(null);
    }
  };

  const schedule = selected?.rentSchedule || [];
  const paid = schedule.filter(e => e.status === 'paid').length;
  const overdue = schedule.filter(e => ['overdue', 'late_fee_applied'].includes(e.status)).length;
  const pending = schedule.filter(e => e.status === 'pending').length;
  const totalPaid = schedule.filter(e => e.status === 'paid').reduce((s, e) => s + (e.paidAmount || e.amount), 0);

  const pendingEntry = pendingIdx !== null ? schedule[pendingIdx] : null;
  const pendingAmount = pendingEntry ? (pendingEntry.amount + (pendingEntry.lateFeeAmount || 0)) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {modalOpen && (
        <GatewayModal
          gateways={gateways}
          amount={pendingAmount}
          onSelect={handleGatewaySelect}
          onClose={() => { setModalOpen(false); setPendingIdx(null); }}
          loading={gwLoading}
        />
      )}

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
                <SummaryCard label="Total Paid" value={`Rs. ${totalPaid.toLocaleString()}`} icon={CreditCard} color="text-indigo-600" bg="bg-indigo-50" />
              </div>

              {/* Lease Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Active Lease</p>
                <h2 className="text-xl font-black text-gray-900">{selected.property?.title}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <span>Rent: <strong className="text-gray-900">Rs. {selected.financials?.rentAmount?.toLocaleString()}/mo</strong></span>
                  <span>Grace period: <strong className="text-gray-900">{selected.financials?.lateFeeGracePeriodDays} days</strong></span>
                  <span>Late fee: <strong className="text-gray-900">Rs. {selected.financials?.lateFeeAmount}</strong></span>
                  <span>Lease ends: <strong className="text-gray-900">{new Date(selected.term?.endDate).toLocaleDateString()}</strong></span>
                </div>
                {gateways.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Pay via:</span>
                    {gateways.map(gw => {
                      const meta = GATEWAY_META[gw.id] || { label: gw.name, icon: '💰' };
                      return (
                        <span key={gw.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                          {meta.icon} {meta.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Calendar Grid */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-black text-gray-900 mb-6 uppercase tracking-widest">Rent Calendar</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {schedule.map((entry, i) => {
                    const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    const date = new Date(entry.dueDate);
                    const isThisMonth =
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear();

                    return (
                      <div
                        key={i}
                        className={`rounded-2xl p-4 border-2 transition-all ${isThisMonth ? 'border-blue-400 shadow-md' : 'border-transparent bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-black uppercase text-gray-400">
                            {MONTHS[date.getMonth()]} {date.getFullYear()}
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
                          Rs. {entry.amount?.toLocaleString()}
                        </p>

                        {entry.lateFeeApplied && (
                          <p className="text-[10px] text-orange-600 mt-1">
                            +Rs. {entry.lateFeeAmount} late fee
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

                        {['pending', 'overdue', 'late_fee_applied'].includes(entry.status) && (
                          <button
                            type="button"
                            onClick={() => handlePayNow(i)}
                            disabled={paying === i || gwLoading}
                            className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-lg disabled:opacity-60 transition-colors"
                          >
                            {paying === i
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <CreditCard className="w-3 h-3" />}
                            {paying === i ? 'Processing…' : 'Pay Now'}
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