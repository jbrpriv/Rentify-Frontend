'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import {
  FileText, Download, CheckCircle, Clock, PenLine, Loader2,
  Building2, User, Calendar, DollarSign, CreditCard,
  Eye, ChevronDown, ChevronUp, Mail, Phone, X,
} from 'lucide-react';
import SignatureModal from '@/components/SignatureModal';


// ─── Gateway metadata ─────────────────────────────────────────────────────────
const GATEWAY_META = {
  stripe: { label: 'Card / Stripe', desc: 'Visa, Mastercard, debit cards', icon: '💳', color: '#635bff' },
  razorpay: { label: 'Razorpay', desc: 'UPI, cards, net banking, wallets', icon: '⚡', color: '#2563eb' },
  paypal: { label: 'PayPal', desc: 'PayPal balance or linked card', icon: '🌐', color: '#0070ba' },
};

const ALL_GATEWAYS = [
  { id: 'stripe', name: 'Stripe' },
  { id: 'razorpay', name: 'Razorpay' },
];

// ─── Gateway Picker Modal (toast-style, slides up from bottom on mobile) ──────
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-black text-gray-900 text-lg">Choose Payment Option</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Amount due:{' '}
              <strong className="text-gray-800">Rs. {amount?.toLocaleString()}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gateway list */}
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
          Payments are secured and encrypted. You will not be charged until you confirm on the next screen.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyLeasePage() {
  const { toast } = useToast();

  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLandlord, setShowLandlord] = useState({});

  // Gateway picker state
  const [gateways, setGateways] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAgreement, setPendingAgreement] = useState(null); // agreement being paid
  const [gwLoading, setGwLoading] = useState(false);

  // Signature modal state
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [pendingSignId, setPendingSignId] = useState(null);
  const [pendingSignName, setPendingSignName] = useState('');
  const [signLoading, setSignLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agrRes, gwRes] = await Promise.all([
        api.get('/agreements'),
        api.get('/payments/gateways'),
      ]);
      setAgreements(agrRes.data);
      setGateways(gwRes.data?.gateways || []);
    } catch (err) {
      console.error(err);
      toast('Failed to load agreements', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open the draw-signature modal instead of confirm()
  const handleSign = (agreementId, propertyTitle) => {
    setPendingSignId(agreementId);
    setPendingSignName(propertyTitle || 'this agreement');
    setSignModalOpen(true);
  };

  const handleSignConfirm = async (drawData) => {
    setSignLoading(true);
    try {
      const { data } = await api.put(`/agreements/${pendingSignId}/sign`, { drawData });
      toast(`Signed! Agreement status: ${data.status}`, 'success');
      setSignModalOpen(false);
      fetchData();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to sign', 'error');
    } finally {
      setSignLoading(false);
    }
  };


  // Called when "Pay" button is clicked — always shows gateway picker
  const handlePaymentClick = (agreement) => {
    if (gateways.length === 0) {
      toast('No payment gateways configured. Please contact support.', 'warning');
      return;
    }
    // Always prompt — user picks the gateway consciously
    setPendingAgreement(agreement);
    setModalOpen(true);
  };

  // Called after gateway selected from modal
  const handleGatewaySelect = async (gatewayId) => {
    setModalOpen(false);
    if (pendingAgreement) {
      await processPayment(gatewayId, pendingAgreement);
    }
    setPendingAgreement(null);
  };

  const processPayment = async (gatewayId, agreement) => {
    setGwLoading(true);
    try {
      if (gatewayId === 'stripe') {
        const { data } = await api.post('/payments/create-checkout-session', {
          agreementId: agreement._id,
        });
        window.location.href = data.url;

      } else if (gatewayId === 'razorpay') {
        const { data: order } = await api.post('/payments/razorpay/create-order', {
          agreementId: agreement._id,
        });

        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: 'RentifyPro',
          description: 'Initial Deposit + 1st Month Rent',
          prefill: order.prefill,
          theme: { color: '#2563eb' },
          handler: async (response) => {
            setGwLoading(true);
            try {
              await api.post('/payments/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                agreementId: agreement._id,
              });
              toast('🎉 Payment successful! Lease is now active.', 'success');
              fetchData();
            } catch (err) {
              toast(err.response?.data?.message || 'Payment verification failed', 'error');
            } finally {
              setGwLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setGwLoading(false);
              toast('Payment cancelled', 'warning');
            },
          },
        });
        rzp.open();
        return; // Don't set gwLoading(false) yet — Razorpay modal is open

      } else if (gatewayId === 'paypal') {
        const { data } = await api.post('/payments/paypal/create-order', {
          agreementId: agreement._id,
        });
        window.location.href = data.approveUrl;
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to initiate payment', 'error');
    } finally {
      // Don't clear for Razorpay (handled in handler/ondismiss)
      if (gatewayId !== 'razorpay') setGwLoading(false);
    }
  };

  const handleDownload = async (id, title) => {
    try {
      const response = await api.get(`/agreements/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Lease-${title?.replace(/\s+/g, '-') || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast('Error downloading PDF', 'error');
    }
  };

  const toggleLandlordDetails = (id) => {
    setShowLandlord((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusStyles = (status, isPaid) => {
    if (status === 'active' || isPaid)
      return { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Active Lease' };
    if (status === 'signed')
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: CreditCard, label: 'Awaiting Initial Payment' };
    if (status === 'sent')
      return { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending Signatures' };
    return { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-700', icon: FileText, label: 'Draft' };
  };

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );

  // Amount shown in modal (deposit + rent)
  const pendingAmount = pendingAgreement
    ? (pendingAgreement.financials?.rentAmount || 0) + (pendingAgreement.financials?.depositAmount || 0)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Signature draw modal */}
      {signModalOpen && (
        <SignatureModal
          open={signModalOpen}
          onClose={() => { setSignModalOpen(false); setPendingSignId(null); }}
          onConfirm={handleSignConfirm}
          signerName={pendingSignName}
          loading={signLoading}
        />
      )}

      {/* Gateway picker modal */}
      {modalOpen && (
        <GatewayModal
          gateways={gateways}
          amount={pendingAmount}
          onSelect={handleGatewaySelect}
          onClose={() => { setModalOpen(false); setPendingAgreement(null); }}
          loading={gwLoading}
        />
      )}

      <h1 className="text-2xl font-bold text-gray-900">My Lease Agreements</h1>

      {agreements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow border-2 border-dashed border-gray-200 flex flex-col items-center">
          <FileText className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No lease agreements yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your landlord will send you an agreement to review and sign here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {agreements.map((ag) => {
            const tenantSigned = ag.signatures?.tenant?.signed;
            const landlordSigned = ag.signatures?.landlord?.signed;
            const style = getStatusStyles(ag.status, ag.isPaid);
            const StatusIcon = style.icon;
            const rent = ag.financials?.rentAmount || 0;
            const deposit = ag.financials?.depositAmount || 0;
            const totalDueAtSigning = rent + deposit;

            return (
              <div
                key={ag._id}
                className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 transition-all hover:shadow-lg"
              >
                {/* Status Bar */}
                <div className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b ${style.bg} ${style.border}`}>
                  <div className="flex items-center mb-2 sm:mb-0">
                    <StatusIcon className={`h-6 w-6 mr-2 ${style.text}`} />
                    <span className={`font-bold text-base ${style.text}`}>{style.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium bg-white/50 px-3 py-1 rounded-full">
                    Created: {new Date(ag.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-6">
                  {/* Property Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-100 gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Building2 className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{ag.property?.title}</h2>
                        <p className="text-sm text-gray-500">
                          {ag.property?.address?.street}, {ag.property?.address?.city}
                        </p>
                      </div>
                    </div>
                    {ag.property?._id && (
                      <Link
                        href={`/browse/${ag.property._id}?viewOnly=true`}
                        className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" /> View Listing
                      </Link>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center text-gray-500 mb-2">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Financials</span>
                      </div>
                      <p className="font-bold text-gray-900">
                        Rs. {rent.toLocaleString()} <span className="text-xs font-normal text-gray-500">/mo</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Deposit: Rs. {deposit.toLocaleString()}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Lease Term</span>
                      </div>
                      <p className="font-bold text-gray-900">{new Date(ag.term?.startDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500 mt-1">To: {new Date(ag.term?.endDate).toLocaleDateString()}</p>
                    </div>

                    <div className={`p-4 rounded-lg border ${tenantSigned ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                      <div className="flex items-center mb-2">
                        {tenantSigned
                          ? <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          : <Clock className="h-4 w-4 text-yellow-500 mr-1" />}
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">Your Signature</span>
                      </div>
                      {tenantSigned
                        ? <p className="text-sm font-medium text-green-700">Signed on {new Date(ag.signatures.tenant.signedAt).toLocaleDateString()}</p>
                        : <p className="text-sm font-medium text-yellow-700">Signature Required</p>}
                    </div>

                    <div className={`p-4 rounded-lg border ${landlordSigned ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center mb-2">
                        {landlordSigned
                          ? <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          : <Clock className="h-4 w-4 text-gray-400 mr-1" />}
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">Landlord</span>
                      </div>
                      {landlordSigned
                        ? <p className="text-sm font-medium text-green-700">Signed on {new Date(ag.signatures.landlord.signedAt).toLocaleDateString()}</p>
                        : <p className="text-sm font-medium text-gray-500">Awaiting Signature</p>}
                    </div>
                  </div>

                  {/* Landlord Details Toggle */}
                  <div className="mb-6 border border-gray-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleLandlordDetails(ag._id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="font-medium text-gray-700">Landlord Details: {ag.landlord?.name}</span>
                      </div>
                      {showLandlord[ag._id]
                        ? <ChevronUp className="h-5 w-5 text-gray-500" />
                        : <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </button>

                    {showLandlord[ag._id] && (
                      <div className="p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2 text-gray-400" /> {ag.landlord?.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" /> {ag.landlord?.email}
                        </div>
                        {ag.landlord?.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" /> {ag.landlord?.phone}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex w-full sm:w-auto gap-3">
                      {!tenantSigned && ag.status !== 'expired' && (
                        <button
                          onClick={() => handleSign(ag._id, ag.property?.title)}
                          disabled={signLoading && pendingSignId === ag._id}
                          className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors shadow-sm"
                        >
                          <PenLine className="h-4 w-4 mr-2" />
                          Sign Agreement
                        </button>
                      )}

                      <button
                        onClick={() => handleDownload(ag._id, ag.property?.title)}
                        className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <Download className="h-4 w-4 mr-2" /> Download PDF
                      </button>
                    </div>

                    {/* Initial Payment — opens gateway picker */}
                    {ag.status === 'signed' && !ag.isPaid && (
                      <div className="w-full sm:w-auto flex flex-col items-end">
                        <p className="text-xs text-blue-600 font-medium mb-1 mr-1">
                          Includes 1st Month Rent &amp; Deposit
                        </p>
                        <button
                          onClick={() => handlePaymentClick(ag)}
                          disabled={gwLoading}
                          className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5 transition-all disabled:opacity-60"
                        >
                          {gwLoading
                            ? <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            : <CreditCard className="h-5 w-5 mr-2" />}
                          Pay Total: Rs. {totalDueAtSigning.toLocaleString()}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}