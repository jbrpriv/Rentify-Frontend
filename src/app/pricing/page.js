'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import {
  Check, X, Building2, Zap, Crown, ArrowRight,
  HelpCircle, Loader2, Star, LayoutDashboard,
} from 'lucide-react';

const TIERS = {
  free: { icon: Building2, accent: '#6b7280', bg: 'bg-neutral-100', iconColor: 'text-neutral-500', highlight: false },
  pro: { icon: Zap, accent: '#0992C2', bg: 'bg-[#0992C2]/15', iconColor: 'text-[#0992C2]', highlight: true },
  enterprise: { icon: Crown, accent: '#0B2D72', bg: 'bg-[#0B2D72]/10', iconColor: 'text-[#0B2D72]', highlight: false },
};

const FEATURE_TABLE = [
  { label: 'Properties', free: '1', pro: 'Up to 20', enterprise: 'Unlimited' },
  { label: 'Agreement templates', free: 'Basic', pro: '50+ clauses', enterprise: 'Custom' },
  { label: 'Clause builder', free: false, pro: true, enterprise: true },
  { label: 'Document vault (S3)', free: false, pro: true, enterprise: true },
  { label: 'Email notifications', free: true, pro: true, enterprise: true },
  { label: 'SMS notifications', free: false, pro: true, enterprise: true },
  { label: 'Push notifications', free: false, pro: true, enterprise: true },
  { label: 'Tenant portal', free: true, pro: true, enterprise: true },
  { label: 'Priority support', free: false, pro: true, enterprise: true },
  { label: 'Analytics', free: false, pro: 'Advanced', enterprise: 'Advanced' },
  { label: 'Custom branding', free: false, pro: false, enterprise: true },
  { label: 'API access', free: false, pro: false, enterprise: true },
  { label: 'SLA guarantee', free: false, pro: false, enterprise: true },
  { label: 'Dedicated manager', free: false, pro: false, enterprise: true },
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
  if (value === true) return <Check className="w-5 h-5 text-[#0992C2] mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-neutral-300 mx-auto" />;
  return <span className="text-sm text-neutral-700 font-semibold">{value}</span>;
}

export default function PricingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [currentTier, setCurrentTier] = useState(null);
  const [stripeReady, setStripeReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetches = [api.get('/billing/plans')];
    const stored = localStorage.getItem('token');
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
    <div className="min-h-screen flex items-center justify-center bg-[#040C23]">
      <Loader2 className="animate-spin w-8 h-8 text-[#0992C2]" />
    </div>
  );

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-32 pb-28"
        style={{ background: 'linear-gradient(160deg, #040C23 0%, #0B2D72 55%, #0992C2 100%)' }}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl opacity-20 bg-[#0AC4E0]" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full blur-3xl opacity-15 bg-white" />

        <div className="relative z-10 text-center px-4">
          {/* Eyebrow pill — matches landing page style */}
          <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-1.5 text-[0.67rem] font-semibold uppercase tracking-[0.26em] text-white/70 ring-1 ring-white/12 backdrop-blur-sm mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0AC4E0] animate-pulse" />
            Simple, transparent pricing
          </span>

          <h1
            className="text-white mx-auto"
            style={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.04,
              fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
              textShadow: '0 4px 48px rgba(0,0,0,0.5)',
              maxWidth: 640,
            }}
          >
            Choose the right{' '}
            <span style={{ color: '#0AC4E0' }}>plan.</span>
          </h1>

          <p className="mt-5 text-[0.97rem] leading-relaxed mx-auto" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 420 }}>
            Start free and upgrade as your portfolio grows. No hidden fees, cancel any time.
          </p>
        </div>
      </section>

      {/* ── Plan Cards ────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const meta = TIERS[plan.tier] || TIERS.free;
            const PlanIcon = meta.icon;
            const isCurrent = plan.tier === currentTier;

            return (
              <div
                key={plan.tier}
                className={`relative flex flex-col rounded-3xl border-2 p-8 transition-all duration-300 ${meta.highlight
                    ? 'border-[#0992C2] shadow-xl shadow-[#0992C2]/15'
                    : 'border-[#0992C2]/15 bg-[#F8FBFC] hover:border-[#0992C2]/40'
                  }`}
                style={meta.highlight ? { background: 'linear-gradient(160deg, #f0f9ff 0%, #ffffff 100%)' } : {}}
              >
                {meta.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg"
                      style={{ background: 'linear-gradient(90deg, #0B2D72, #0992C2)' }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${meta.bg}`}>
                    <PlanIcon className={`w-6 h-6 ${meta.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-black text-neutral-900 text-lg tracking-tight">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#0992C2]">
                        ✓ Current plan
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span
                      className="text-4xl font-black tracking-tighter"
                      style={{ color: meta.highlight ? '#0B2D72' : '#111827' }}
                    >
                      {plan.price === 0 ? 'Free' : `Rs. ${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && <span className="text-neutral-400 mb-1 text-sm">/mo</span>}
                  </div>
                  {plan.price === 0 && (
                    <p className="text-neutral-400 text-xs mt-0.5">No credit card required</p>
                  )}
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-neutral-600">
                      <Check className="w-4 h-4 text-[#0992C2] shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.tier === 'free' ? (
                  isCurrent ? (
                    <Link
                      href="/dashboard/billing"
                      className="w-full py-3 rounded-xl font-black text-sm text-center bg-[#0992C2]/10 text-[#0992C2] transition"
                    >
                      ✓ Your Current Plan
                    </Link>
                  ) : user ? (
                    <Link
                      href="/dashboard"
                      className="w-full py-3 rounded-xl font-black text-sm text-center bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/register"
                      className="w-full py-3 rounded-xl font-black text-sm text-center bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                    >
                      Get Started Free
                    </Link>
                  )
                ) : isCurrent ? (
                  <Link
                    href="/dashboard/billing"
                    className="w-full py-3 rounded-xl font-black text-sm text-center bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
                  >
                    Manage Plan
                  </Link>
                ) : (
                  <Link
                    href={currentTier ? '/dashboard/billing' : '/register'}
                    className={`w-full py-3 rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 transition hover:scale-[1.02] hover:brightness-110 ${!stripeReady ? 'opacity-60 pointer-events-none' : ''
                      }`}
                    style={{
                      background: plan.tier === 'enterprise'
                        ? 'linear-gradient(90deg, #0B2D72, #0992C2)'
                        : 'linear-gradient(90deg, #0992C2, #0AC4E0)',
                      boxShadow: plan.tier === 'enterprise'
                        ? '0 4px 20px rgba(11,45,114,0.35)'
                        : '0 4px 20px rgba(9,146,194,0.40)',
                      color: 'white',
                    }}
                  >
                    {currentTier ? `Upgrade to ${plan.name}` : `Start with ${plan.name}`}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Feature Comparison Table ───────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 px-4"
        style={{ background: 'linear-gradient(160deg, #040C23 0%, #0B2D72 100%)' }}
      >
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full blur-3xl opacity-20 bg-[#0AC4E0]" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-60 w-60 rounded-full blur-3xl opacity-15 bg-white" />

        <div className="relative max-w-5xl mx-auto">
          <h2
            className="text-white text-center mb-10"
            style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}
          >
            Full feature comparison
          </h2>

          <div className="rounded-3xl overflow-hidden ring-1 ring-white/15" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-white/40 font-black uppercase text-[10px] tracking-widest">
                    Feature
                  </th>
                  {['Free', 'Pro', 'Enterprise'].map((h) => (
                    <th key={h} className={`text-center px-4 py-4 font-black text-sm ${h === 'Pro' ? 'text-[#0AC4E0]' : 'text-white/80'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_TABLE.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-white/5 transition-colors hover:bg-white/5 ${i % 2 === 0 ? 'bg-white/3' : ''}`}
                  >
                    <td className="px-6 py-3.5 text-white/70 font-medium">{row.label}</td>
                    <td className="px-4 py-3.5 text-center"><FeatureCell value={row.free} /></td>
                    <td className="px-4 py-3.5 text-center"><FeatureCell value={row.pro} /></td>
                    <td className="px-4 py-3.5 text-center"><FeatureCell value={row.enterprise} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-center mb-10"
            style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#0B2D72' }}
          >
            Frequently asked questions
          </h2>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 overflow-hidden transition-colors"
                style={{ borderColor: openFaq === i ? '#0992C2' : 'rgba(9,146,194,0.15)', background: openFaq === i ? '#f0f9ff' : '#F8FBFC' }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-neutral-900 hover:bg-[#0992C2]/5 transition"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#0992C2] shrink-0" />
                    {item.q}
                  </span>
                  <span
                    className="text-[#0992C2] text-lg transition-transform duration-200 font-black"
                    style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-neutral-600 text-sm leading-relaxed border-t border-[#0992C2]/10 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      {!user && (
        <section className="bg-white pb-20 px-4">
          <div className="max-w-2xl mx-auto">
            <div
              className="relative overflow-hidden rounded-3xl p-10 text-center text-white"
              style={{ background: 'linear-gradient(130deg, #040C23 0%, #0B2D72 50%, #0992C2 100%)' }}
            >
              <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full blur-2xl opacity-30 bg-[#0AC4E0]" />
              <div className="pointer-events-none absolute right-0 bottom-0 h-32 w-32 rounded-full blur-2xl opacity-20 bg-white" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-1.5 text-[0.67rem] font-semibold uppercase tracking-[0.26em] text-white/70 ring-1 ring-white/12 backdrop-blur-sm mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0AC4E0] animate-pulse" />
                  Join thousands of landlords
                </span>
                <h2
                  className="text-white mb-3"
                  style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', textShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                >
                  Ready to get started?
                </h2>
                <p className="mb-8" style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.97rem' }}>
                  Join landlords across Pakistan already managing their properties with RentifyPro.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-white font-black px-6 py-3 rounded-xl hover:scale-[1.03] hover:brightness-105 transition-all"
                  style={{ color: '#0B2D72', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
                >
                  Start for Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}