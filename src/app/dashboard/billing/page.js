'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import api from '@/utils/api';
import { Check, Loader2, Zap, Building2, Star, Crown } from 'lucide-react';

const TIER_ICONS = { free: Building2, pro: Zap, enterprise: Crown };
const TIER_COLORS = {
  free:       'border-gray-200 bg-white',
  pro:        'border-blue-500 bg-blue-50 ring-2 ring-blue-500',
  enterprise: 'border-purple-500 bg-purple-50 ring-2 ring-purple-500',
};
const TIER_BTN = {
  free:       'bg-gray-200 text-gray-600 cursor-default',
  pro:        'bg-blue-600 text-white hover:bg-blue-700',
  enterprise: 'bg-purple-600 text-white hover:bg-purple-700',
};

function BillingContent() {
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [currentTier, setCurrentTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setToast(`🎉 Subscription to ${searchParams.get('tier') || 'new plan'} activated!`);
    }
    if (searchParams.get('canceled') === 'true') setToast('Subscription cancelled.');

    Promise.all([api.get('/billing/plans'), api.get('/billing/status')])
      .then(([plansRes, statusRes]) => {
        setPlans(plansRes.data.plans);
        setCurrentTier(statusRes.data.tier);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (tier) => {
    if (tier === 'free' || tier === currentTier) return;
    setSubscribing(tier);
    try {
      const { data } = await api.post('/billing/subscribe', { tier });
      window.location.href = data.url;
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to start checkout');
      setSubscribing('');
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data } = await api.post('/billing/portal');
      window.location.href = data.url;
    } catch (err) {
      setToast(err.response?.data?.message || 'Portal unavailable');
      setPortalLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
        <p className="text-gray-500 mt-1">Manage your RentifyPro plan.</p>
      </div>

      {toast && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {toast}
        </div>
      )}

      {/* Current plan banner */}
      {currentTier && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-500">Current plan</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{currentTier}</p>
          </div>
          {currentTier !== 'free' && (
            <button
              type="button"
              onClick={handlePortal}
              disabled={portalLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-60"
            >
              {portalLoading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
              Manage Subscription
            </button>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = TIER_ICONS[plan.tier] || Star;
          const isCurrentPlan = plan.tier === currentTier;
          return (
            <div key={plan.tier} className={`rounded-xl border-2 p-6 flex flex-col ${TIER_COLORS[plan.tier] || 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`w-6 h-6 ${plan.tier === 'pro' ? 'text-blue-600' : plan.tier === 'enterprise' ? 'text-purple-600' : 'text-gray-500'}`} />
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  {isCurrentPlan && <span className="text-xs text-green-600 font-medium">Current plan</span>}
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price === 0 ? 'Free' : `Rs. ${plan.price.toLocaleString()}`}
                </span>
                {plan.price > 0 && <span className="text-gray-500 text-sm">/month</span>}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isCurrentPlan || plan.tier === 'free' || !!subscribing}
                onClick={() => handleSubscribe(plan.tier)}
                className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${isCurrentPlan || plan.tier === 'free' ? TIER_BTN.free : TIER_BTN[plan.tier]}`}
              >
                {subscribing === plan.tier && <Loader2 className="animate-spin w-4 h-4" />}
                {isCurrentPlan ? 'Current Plan' : plan.tier === 'free' ? 'Free Forever' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-center text-gray-400">
        Payments are processed securely via Stripe. Cancel anytime from the Manage Subscription portal.
      </p>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>}>
      <BillingContent />
    </Suspense>
  );
}
