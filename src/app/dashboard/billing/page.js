'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import {
  Check, Loader2, Zap, Building2, Crown, AlertTriangle,
  CreditCard, ArrowUpRight,
} from 'lucide-react';

// ── Tier config ────────────────────────────────────────────────────────────────
const TIER_META = {
  free: { icon: Building2, color: 'text-gray-500', bg: 'bg-gray-100', badge: 'bg-gray-100 text-gray-600', label: 'Free' },
  pro: { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-100', badge: 'bg-blue-100 text-blue-700', label: 'Pro' },
  enterprise: { icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100', badge: 'bg-purple-100 text-purple-700', label: 'Enterprise' },
};

const CARD_RING = {
  free: 'border-gray-200 bg-white',
  pro: 'border-blue-400 bg-blue-50/30 ring-2 ring-blue-400/30',
  enterprise: 'border-purple-400 bg-purple-50/30 ring-2 ring-purple-400/30',
};

const BTN_STYLE = {
  free: 'bg-gray-100 text-gray-400 cursor-default',
  pro: 'bg-blue-600 text-white hover:bg-blue-700',
  enterprise: 'bg-purple-600 text-white hover:bg-purple-700',
};

// ── Main page content ──────────────────────────────────────────────────────────
function BillingContent() {
  const searchParams = useSearchParams();

  const [plans, setPlans] = useState([]);
  const [currentTier, setCurrentTier] = useState(null);
  const [stripeReady, setStripeReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 5000);
  };

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      showToast(`🎉 You are now on the ${searchParams.get('tier') || 'new'} plan!`);
    }
    if (searchParams.get('canceled') === 'true') showToast('Checkout cancelled.', 'warn');

    Promise.all([api.get('/billing/plans'), api.get('/billing/status')])
      .then(([plansRes, statusRes]) => {
        setPlans(plansRes.data.plans);
        setCurrentTier(statusRes.data.tier);
        setStripeReady(plansRes.data.stripeConfigured ?? true);
      })
      .catch(() => showToast('Failed to load billing info.', 'error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // ── Subscription flow ──────────────────────────────────────────────────────
  const handleSubscribe = async (tier) => {
    if (tier === 'free' || tier === currentTier) return;
    if (!stripeReady) {
      showToast('Online payments are not yet enabled. Please contact the administrator.', 'warn');
      return;
    }
    setSubscribing(tier);
    try {
      const { data } = await api.post('/billing/subscribe', { tier, gateway: 'stripe' });
      window.location.href = data.url;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start checkout.', 'error');
      setSubscribing('');
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data } = await api.post('/billing/portal');
      window.location.href = data.url;
    } catch (err) {
      showToast(err.response?.data?.message || 'Portal unavailable.', 'error');
      setPortalLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
    </div>
  );

  const tierMeta = TIER_META[currentTier] || TIER_META.free;
  const TierIcon = tierMeta.icon;



  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
          Subscription &amp; Billing
        </h1>
        <p className="text-gray-400 text-sm font-medium mt-1">
          Manage your RentifyPro plan and payment method.
        </p>
      </div>

      {/* ── Toast ────────────────────────────────────────────────── */}
      {toast.msg && (
        <div className={`px-5 py-3.5 rounded-2xl text-sm font-medium border ${toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
          toast.type === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-red-50 text-red-700 border-red-200'
          }`}>
          {toast.msg}
        </div>
      )}

      {/* ── No payment gateway configured banner ──────────────────── */}
      {!stripeReady && (
        <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Online payments not configured</p>
            <p className="text-amber-700 text-xs mt-0.5">
              No payment gateway is set up yet. Contact the administrator to enable plan upgrades.
            </p>
          </div>
        </div>
      )}

      {/* ── Current subscription hero ─────────────────────────────── */}
      {currentTier && (
        <div className={`rounded-3xl border-2 p-6 flex items-center justify-between gap-4 flex-wrap ${currentTier === 'enterprise' ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50' :
          currentTier === 'pro' ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50' :
            'border-gray-200 bg-gray-50'
          }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tierMeta.bg}`}>
              <TierIcon className={`w-7 h-7 ${tierMeta.color}`} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-0.5">
                Current Subscription
              </p>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                  {tierMeta.label} Plan
                </h2>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${tierMeta.badge}`}>
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {currentTier === 'free'
                  ? '1 property max · No analytics · No agreement templates'
                  : currentTier === 'pro'
                    ? 'Up to 5 properties · Analytics dashboard included'
                    : 'Unlimited properties · Analytics + Agreement templates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {stripeReady && (
              <button
                type="button"
                onClick={handlePortal}
                disabled={portalLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"
              >
                {portalLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                Manage Billing
              </button>
            )}
            {currentTier !== 'enterprise' && (
              <button
                type="button"
                onClick={() => handleSubscribe(currentTier === 'free' ? 'pro' : 'enterprise')}
                disabled={!!subscribing || !stripeReady}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Plan cards ────────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-black text-gray-900 uppercase tracking-widest mb-4">All Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const meta = TIER_META[plan.tier] || TIER_META.free;
            const PlanIcon = meta.icon;
            const isCurrent = plan.tier === currentTier;
            const isDowngrade = (currentTier === 'enterprise' && plan.tier === 'pro') ||
              (currentTier !== 'free' && plan.tier === 'free');
            const canUpgrade = !isCurrent && plan.tier !== 'free' && !isDowngrade && stripeReady;

            return (
              <div
                key={plan.tier}
                className={`rounded-2xl border-2 p-6 flex flex-col transition-all ${CARD_RING[plan.tier] || 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.bg}`}>
                    <PlanIcon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{plan.name}</h3>
                    {isCurrent && (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${meta.badge}`}>
                        Current
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-black text-gray-900 tracking-tighter">
                    {plan.price === 0 ? 'Free' : `$${plan.price.toLocaleString()}`}
                  </span>
                  {plan.price > 0 && <span className="text-gray-400 text-sm">/month</span>}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* ── CTA button (below features) ───────────── */}
                <button
                  type="button"
                  disabled={!canUpgrade || !!subscribing}
                  onClick={() => handleSubscribe(plan.tier)}
                  className={`w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${isCurrent || plan.tier === 'free' || isDowngrade
                    ? BTN_STYLE.free
                    : BTN_STYLE[plan.tier]
                    }`}
                >
                  {subscribing === plan.tier && <Loader2 className="animate-spin w-4 h-4" />}
                  {isCurrent
                    ? 'Current Plan'
                    : plan.tier === 'free'
                      ? 'Free Forever'
                      : isDowngrade
                        ? 'Current or Higher'
                        : !stripeReady
                          ? 'Contact Admin'
                          : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-center text-gray-400 pb-4">
        Payments processed securely. Cancel anytime from the billing portal.
      </p>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}