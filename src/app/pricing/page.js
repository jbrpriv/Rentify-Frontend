'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import {
  Check, X, Building2, Zap, Crown, ArrowRight,
  HelpCircle, Loader2, Star,
} from 'lucide-react';

const TIERS = {
  free:       { icon: Building2, color: 'text-gray-500',   accent: '#6b7280', ring: '',                             highlight: false },
  pro:        { icon: Zap,       color: 'text-blue-600',   accent: '#2563eb', ring: 'ring-2 ring-blue-500',         highlight: true  },
  enterprise: { icon: Crown,     color: 'text-purple-600', accent: '#7c3aed', ring: 'ring-2 ring-purple-500',       highlight: false },
};

const FEATURE_TABLE = [
  { label: 'Properties',         free: '1',    pro: 'Up to 20',     enterprise: 'Unlimited' },
  { label: 'Agreement templates', free: 'Basic', pro: '50+ clauses', enterprise: 'Custom'    },
  { label: 'Clause builder',     free: false,   pro: true,           enterprise: true        },
  { label: 'Document vault (S3)', free: false,  pro: true,           enterprise: true        },
  { label: 'Email notifications', free: true,   pro: true,           enterprise: true        },
  { label: 'SMS notifications',  free: false,   pro: true,           enterprise: true        },
  { label: 'Push notifications', free: false,   pro: true,           enterprise: true        },
  { label: 'Tenant portal',      free: true,    pro: true,           enterprise: true        },
  { label: 'Priority support',   free: false,   pro: true,           enterprise: true        },
  { label: 'Analytics',          free: false,   pro: 'Advanced',     enterprise: 'Advanced'  },
  { label: 'Custom branding',    free: false,   pro: false,          enterprise: true        },
  { label: 'API access',         free: false,   pro: false,          enterprise: true        },
  { label: 'SLA guarantee',      free: false,   pro: false,          enterprise: true        },
  { label: 'Dedicated manager',  free: false,   pro: false,          enterprise: true        },
];

const FAQ = [
  {
    q: 'Can I change plans at any time?',
    a: 'Yes. Upgrades take effect immediately via the Stripe billing portal. Downgrades take effect at the end of your current billing cycle.',
  },
  {
    q: 'What happens to my properties if I downgrade to Free?',
    a: 'Your existing properties are kept, but you will not be able to add new ones until you are within the Free tier limit (1 property). Occupied properties are unaffected.',
  },
  {
    q: 'Are payments secure?',
    a: 'All transactions are processed by Stripe, a PCI-DSS Level 1 certified payments provider. RentifyPro never stores your card details.',
  },
  {
    q: 'Is there a free trial?',
    a: 'We offer the Free plan indefinitely so you can explore the platform with one property at no cost. Paid features can be trialled upon request — contact support.',
  },
  {
    q: 'What currency are prices in?',
    a: 'All prices are in Pakistani Rupees (PKR) and are billed monthly. No hidden fees.',
  },
];

function FeatureCell({ value }) {
  if (value === true)  return <Check className="w-5 h-5 text-green-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-gray-300 mx-auto" />;
  return <span className="text-sm text-gray-700 font-medium">{value}</span>;
}

export default function PricingPage() {
  const { user }                      = useUser();
  const router                        = useRouter();
  const [plans, setPlans]             = useState([]);
  const [currentTier, setCurrentTier] = useState(null);
  const [stripeReady, setStripeReady] = useState(true);
  const [loading, setLoading]         = useState(true);
  const [openFaq, setOpenFaq]         = useState(null);

  useEffect(() => {
    const fetches = [api.get('/billing/plans')];
    const stored  = localStorage.getItem('token');
    if (stored) fetches.push(api.get('/billing/status'));

    Promise.allSettled(fetches).then(([plansRes, statusRes]) => {
      if (plansRes.status === 'fulfilled') {
        setPlans(plansRes.value.data.plans);
        setStripeReady(plansRes.value.data.stripeConfigured ?? true);
      }
      if (statusRes?.status === 'fulfilled') {
        setCurrentTier(statusRes.value.data.tier);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="text-center px-4 mb-16">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-4">
          <Star className="w-3.5 h-3.5" /> Simple, transparent pricing
        </span>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">
          Choose the right plan
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Start free and upgrade as your portfolio grows. No hidden fees, cancel any time.
        </p>
      </div>

      {/* ── Plan Cards ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {plans.map((plan) => {
          const meta      = TIERS[plan.tier] || TIERS.free;
          const PlanIcon  = meta.icon;
          const isCurrent = plan.tier === currentTier;

          return (
            <div
              key={plan.tier}
              className={`relative bg-white rounded-3xl border-2 p-8 flex flex-col shadow-sm transition-all ${
                meta.highlight ? 'border-blue-500 shadow-blue-100 shadow-lg' : 'border-gray-200'
              } ${meta.ring}`}
            >
              {meta.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  plan.tier === 'pro' ? 'bg-blue-100' : plan.tier === 'enterprise' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <PlanIcon className={`w-6 h-6 ${meta.color}`} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-green-600">
                      ✓ Current plan
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">
                    {plan.price === 0 ? 'Free' : `Rs. ${plan.price.toLocaleString()}`}
                  </span>
                  {plan.price > 0 && <span className="text-gray-400 mb-1">/mo</span>}
                </div>
                {plan.price === 0 && <p className="text-gray-400 text-xs mt-0.5">No credit card required</p>}
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              {plan.tier === 'free' ? (
                isCurrent ? (
                  <Link href="/dashboard/billing" className="w-full py-3 rounded-xl font-black text-sm text-center bg-green-100 text-green-700 transition">
                    ✓ Your Current Plan
                  </Link>
                ) : user ? (
                  <Link href="/dashboard" className="w-full py-3 rounded-xl font-black text-sm text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link href="/register" className="w-full py-3 rounded-xl font-black text-sm text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                    Get Started Free
                  </Link>
                )
              ) : isCurrent ? (
                <Link
                  href="/dashboard/billing"
                  className="w-full py-3 rounded-xl font-black text-sm text-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                  Manage Plan
                </Link>
              ) : (
                <Link
                  href={currentTier ? '/dashboard/billing' : '/register'}
                  className={`w-full py-3 rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 transition ${
                    plan.tier === 'enterprise'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${!stripeReady ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {currentTier ? `Upgrade to ${plan.name}` : `Start with ${plan.name}`}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Feature Comparison Table ───────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter text-center mb-8">
          Full feature comparison
        </h2>
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                  Feature
                </th>
                {['Free', 'Pro', 'Enterprise'].map((h) => (
                  <th key={h} className="text-center px-4 py-4 text-gray-900 font-black text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_TABLE.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                  <td className="px-6 py-3.5 text-gray-700 font-medium">{row.label}</td>
                  <td className="px-4 py-3.5 text-center"><FeatureCell value={row.free} /></td>
                  <td className="px-4 py-3.5 text-center"><FeatureCell value={row.pro} /></td>
                  <td className="px-4 py-3.5 text-center"><FeatureCell value={row.enterprise} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter text-center mb-8">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  {item.q}
                </span>
                <span className={`text-gray-400 text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      {!user && (
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-white">
          <h2 className="text-3xl font-black tracking-tighter mb-3">Ready to get started?</h2>
          <p className="text-blue-100 mb-6">
            Join landlords across Pakistan already managing their properties with RentifyPro.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-black px-6 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Start for Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      )}

    </div>
  );
}