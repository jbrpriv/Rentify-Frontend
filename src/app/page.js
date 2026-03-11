'use client';

import { useRef, useState } from 'react';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, FileText, CreditCard, Users, ShieldCheck,
  ArrowRight, Building2, MapPin,
  LayoutDashboard, MessageSquare, Wrench, ClipboardList,
  TrendingUp, BarChart2, UserCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MotionRevealSection } from '@/components/ui/Motion';
import { useReveal } from '@/hooks/useReveal';

const CITIES = [
  { name: 'New York', country: 'USA', count: '12,400+ listings', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=700&q=80' },
  { name: 'London', country: 'UK', count: '9,800+ listings', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80' },
  { name: 'Los Angeles', country: 'USA', count: '7,200+ listings', img: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=700&q=80' },
  { name: 'Manchester', country: 'UK', count: '4,100+ listings', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=700&q=80' },
  { name: 'Dubai', country: 'UAE', count: '6,600+ listings', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80' },
  { name: 'Toronto', country: 'Canada', count: '5,300+ listings', img: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=700&q=80' },
];

const TENANT_FEATURES = [
  { icon: Search, title: 'Smart Search & Discovery', desc: 'Browse verified listings by city, budget, and amenities. AI matching recommends properties based on your profile.' },
  { icon: ClipboardList, title: 'One-Click Applications', desc: 'Apply with a single click. Track all your applications in real time — status, landlord responses, and offer rounds.' },
  { icon: FileText, title: 'Digital Lease Signing', desc: 'Sign legally binding agreements from any device. No printing, no fax — your signed lease is instantly downloadable.' },
  { icon: CreditCard, title: 'Rent Payments', desc: 'Pay rent securely via card or bank transfer. Automated reminders, downloadable receipts, and full payment history.' },
  { icon: Wrench, title: 'Maintenance Requests', desc: 'Submit issues with photos and urgency levels. Track repair status end-to-end — no more chasing landlords.' },
  { icon: MessageSquare, title: 'Direct Messaging', desc: 'All tenant-landlord communication in one place. Full audit trail, document sharing, and read receipts.' },
];

const LANDLORD_FEATURES = [
  { icon: Building2, title: 'Verified Property Listings', desc: 'Publish listings with photos, amenities, and lease terms. Verified badge builds trust with quality tenants.' },
  { icon: UserCheck, title: 'Tenant Screening', desc: 'One-click screening requests. Get credit reports, criminal background, employment verification — all in-platform.' },
  { icon: Users, title: 'Application Management', desc: 'Centralized inbox for all applicants. Review profiles, message candidates, and accept or decline with one click.' },
  { icon: TrendingUp, title: 'Rent Collection', desc: 'Automated rent schedules, overdue flagging, and a full collection dashboard. Late fees applied automatically.' },
  { icon: BarChart2, title: 'Portfolio Analytics', desc: 'Track occupancy rates, payment status, maintenance costs, and lease expiries across all your properties.' },
  { icon: ShieldCheck, title: 'Dispute Resolution', desc: 'Built-in dispute system with a transparent audit log. Admin mediation keeps every interaction documented.' },
];

const STATS = [
  { value: '60+', label: 'Countries' },
  { value: '2M+', label: 'Listings' },
  { value: '500K+', label: 'Landlords' },
  { value: '4.7★', label: 'Avg Rating' },
];

function RevealCard({ children, delay = 0, className = '' }) {
  const [ref, revealed] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${revealed ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { user } = useUser();
  const [roleTab, setRoleTab] = useState('tenant');
  const [query, setQuery] = useState('');
  const tenantBtnRef = useRef(null);
  const landlordBtnRef = useRef(null);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/browse?city=${encodeURIComponent(q)}` : '/browse');
  };

  const features = roleTab === 'tenant' ? TENANT_FEATURES : LANDLORD_FEATURES;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-grow">

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen overflow-hidden"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dj4a5robb/image/upload/v1773219846/dc8b78b92964aa388580d992003fb77f_bdwrll.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Directional dark overlay — heavy left where text lives, opens up right */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(105deg, rgba(4,12,35,0.94) 0%, rgba(4,12,35,0.80) 35%, rgba(4,12,35,0.45) 60%, rgba(4,12,35,0.12) 100%)' }}
          />
          {/* Professional bottom vignette — darkens into the page, no white */}
          <div
            className="absolute inset-x-0 bottom-0 h-36"
            style={{ background: 'linear-gradient(to top, rgba(4,12,35,0.65) 0%, transparent 100%)' }}
          />

          {/* Content — flush left, no centering container */}
          <div className="relative z-10 flex min-h-screen items-center">
            <div
              className="flex flex-col w-full max-w-[580px] px-8 sm:px-12 lg:pl-20 xl:pl-32 pb-16 pt-32"
            >
              {/* Eyebrow pill */}
              <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/8 px-4 py-1.5 text-[0.67rem] font-semibold uppercase tracking-[0.26em] text-white/70 ring-1 ring-white/12 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0992C2] animate-pulse" />
                Property management, reimagined
              </span>

              <h1
                className="text-white"
                style={{
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.04,
                  fontSize: 'clamp(2.8rem, 4.8vw, 4.4rem)',
                  textShadow: '0 4px 48px rgba(0,0,0,0.5)',
                }}
              >
                Renting Done Right.{' '}
                <span style={{ color: '#0AC4E0' }}>Finally.</span>
              </h1>

              <p className="mt-5 text-[0.97rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: '420px' }}>
                Find, apply, sign, and pay — all in one place. Built for modern tenants and landlords who expect more.
              </p>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="mt-8 flex items-center gap-3 rounded-2xl bg-white/95 px-5 py-3.5 shadow-2xl backdrop-blur-sm"
                style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.45)' }}
              >
                <Search className="h-4 w-4 shrink-0 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="City, address, or ZIP code"
                  className="flex-1 bg-transparent text-[0.9rem] text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#0B2D72] to-[#0992C2] px-5 py-2 text-[0.78rem] font-semibold text-white transition-all hover:scale-105"
                  style={{ boxShadow: '0 2px 12px rgba(9,146,194,0.4)' }}
                >
                  Search
                </button>
              </form>

              {/* CTAs */}
              <div className="mt-5 flex items-center gap-4">
                {!user ? (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0992C2] px-6 py-2.5 text-[0.82rem] font-bold text-white transition-all hover:scale-105 hover:brightness-110"
                    style={{ boxShadow: '0 4px 20px rgba(9,146,194,0.45)' }}
                  >
                    Get started free <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0992C2] px-6 py-2.5 text-[0.82rem] font-bold text-white transition-all hover:scale-105 hover:brightness-110"
                    style={{ boxShadow: '0 4px 20px rgba(9,146,194,0.45)' }}
                  >
                    <LayoutDashboard size={14} /> Go to dashboard
                  </Link>
                )}
                <Link
                  href="/browse"
                  className="text-[0.82rem] font-semibold transition-colors"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                >
                  Browse listings →
                </Link>
              </div>

              {/* Social proof */}
              <div className="mt-10 flex items-center gap-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <span className="text-[0.67rem] font-semibold uppercase tracking-widest">2M+ listings</span>
                <span className="h-2.5 w-px bg-white/15" />
                <span className="text-[0.67rem] font-semibold uppercase tracking-widest">60+ countries</span>
                <span className="h-2.5 w-px bg-white/15" />
                <span className="text-[0.67rem] font-semibold uppercase tracking-widest">500K+ landlords</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── RENT AROUND THE WORLD ──────────────────────────────── */}
        <MotionRevealSection className="py-20 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0 text-center">
            <h2 className="text-h2 text-neutral-900 mb-3">Rent Around the World</h2>
            <p className="mx-auto max-w-xl text-body text-neutral-600 mb-14">
              Explore millions of listings across 90+ countries. From local apartments to global stays,
              find your next home in minutes with our intelligent search.
            </p>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-14">
              {STATS.map((s, i) => (
                <RevealCard key={s.label} delay={i * 80}>
                  <div className="rounded-2xl border border-[#0992C2]/15 bg-[#F8FBFC] px-4 py-5 rf-glass-stat">
                    <p className="text-3xl font-extrabold text-[#0B2D72] tracking-tight">{s.value}</p>
                    <p className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-neutral-500">{s.label}</p>
                  </div>
                </RevealCard>
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {CITIES.map((city, idx) => (
                <RevealCard key={city.name} delay={idx * 80}>
                  <Link
                    href={`/browse?city=${city.name}`}
                    className={`group relative block overflow-hidden rounded-3xl shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:shadow-xl ${idx === 1 ? 'md:-mt-6' : idx === 2 ? 'md:mt-6' : ''}`}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={city.img}
                        alt={city.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-white">{city.name}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[0.7rem] font-medium text-white/80">
                              <MapPin size={11} />{city.count}
                            </p>
                          </div>
                          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm ring-1 ring-white/30">
                            {city.country}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </RevealCard>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link href="/browse" className="rf-btn rf-btn-secondary text-[0.8rem]">
                View all markets <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </MotionRevealSection>

        {/* ── TENANT / LANDLORD FEATURES ─────────────────────────── */}
        <MotionRevealSection id="features" className="scroll-mt-20">
          <div
            className={`relative overflow-hidden transition-colors duration-500 px-6 py-16 md:px-16 lg:px-24 ${roleTab === 'tenant' ? 'bg-[#F8843F]' : 'bg-[#0B2D72]'}`}
          >
            <div className={`pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full blur-3xl opacity-30 transition-colors duration-500 ${roleTab === 'tenant' ? 'bg-white' : 'bg-[#0AC4E0]'}`} />
            <div className={`pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full blur-3xl opacity-25 transition-colors duration-500 ${roleTab === 'tenant' ? 'bg-[#0B2D72]' : 'bg-[#F8843F]'}`} />

            <div className="relative flex flex-col gap-12 lg:flex-row mx-auto max-w-7xl">
              <div className="flex-shrink-0 lg:w-72 xl:w-80 space-y-6">
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] ${roleTab === 'tenant' ? 'bg-white/20 text-white ring-1 ring-white/30' : 'bg-white/10 text-white/80 ring-1 ring-white/20'}`}>
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Role-specific workspaces
                </div>
                <div className="space-y-3">
                  <h2 className="text-h2 text-white">
                    Built for
                    <span className="font-extrabold">
                      {' '}{roleTab === 'tenant' ? 'tenants who expect calm.' : 'landlords who expect control.'}
                    </span>
                  </h2>
                  <p className={`text-body ${roleTab === 'tenant' ? 'text-white/75' : 'text-white/65'}`}>
                    Switch views to see how RentifyPro adapts instantly to tenants or landlords — from application flows to analytics.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button ref={tenantBtnRef} type="button" onClick={() => setRoleTab('tenant')}
                    className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-200 shadow-lg ${roleTab === 'tenant' ? 'bg-white text-[#F8843F] scale-105 shadow-white/30' : 'bg-white/15 text-white hover:bg-white/25 border border-white/30'}`}>
                    🏠 <span>Tenant View</span>
                  </button>
                  <button ref={landlordBtnRef} type="button" onClick={() => setRoleTab('landlord')}
                    className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-200 shadow-lg ${roleTab === 'landlord' ? 'bg-white text-[#0B2D72] scale-105 shadow-white/30' : 'bg-white/15 text-white hover:bg-white/25 border border-white/30'}`}>
                    🏢 <span>Landlord View</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  {!user ? (
                    <Link href="/register"
                      className={`rf-btn text-[0.8rem] font-bold ${roleTab === 'tenant' ? 'bg-white text-[#F8843F] hover:bg-white/90 shadow-lg shadow-black/10' : 'bg-white text-[#0B2D72] hover:bg-white/90 shadow-lg shadow-black/20'}`}>
                      Get started free <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="rf-btn bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30 text-[0.8rem]">
                      Go to dashboard <LayoutDashboard size={15} />
                    </Link>
                  )}
                  <Link href="/browse" className="rf-btn bg-transparent text-white/80 ring-1 ring-white/30 hover:bg-white/10 hover:text-white text-[0.8rem]">
                    Preview listings
                  </Link>
                </div>
              </div>

              <div className="flex-1">
                <div key={roleTab} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {features.map((f, i) => {
                    const Icon = f.icon;
                    const isTenant = roleTab === 'tenant';
                    return (
                      <RevealCard key={f.title} delay={i * 70}>
                        <div className={`rf-glass-card rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-1 h-full ${isTenant ? 'bg-white/20 ring-1 ring-white/25 hover:bg-white/25' : 'bg-white/10 ring-1 ring-white/15 hover:bg-white/15'}`}>
                          <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${isTenant ? 'bg-white/30' : 'bg-[#0AC4E0]/30'}`}>
                            <Icon size={18} className="text-white" />
                          </div>
                          <h3 className="mb-1 text-[0.9rem] font-semibold text-white">{f.title}</h3>
                          <p className={`text-[0.75rem] leading-relaxed ${isTenant ? 'text-white/70' : 'text-white/60'}`}>{f.desc}</p>
                        </div>
                      </RevealCard>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </MotionRevealSection>

        {/* ── CTA — guests only ──────────────────────────────────── */}
        {!user && (
          <MotionRevealSection className="bg-white">
            <section
              className="relative overflow-hidden px-6 py-24 text-center"
              style={{ background: 'linear-gradient(135deg, #F6C87A 0%, #0AC4E0 45%, #0992C2 70%, #0B2D72 100%)' }}
            >
              <div className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
              <div className="relative mx-auto max-w-2xl space-y-5">
                <h2 className="text-h2 text-white">Ready to make renting feel premium?</h2>
                <p className="mx-auto max-w-md text-body text-white/85">
                  Join thousands of tenants and landlords who already manage their entire rental lifecycle inside RentifyPro.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-7 py-2.5 text-[0.85rem] font-bold text-[#0992C2] shadow-md transition-all hover:scale-105 hover:shadow-lg">
                    Get started free
                  </Link>
                  <Link href="/browse" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/60 px-7 py-2.5 text-[0.85rem] font-semibold text-white transition-all hover:bg-white/10">
                    Browse listings
                  </Link>
                </div>
              </div>
            </section>
          </MotionRevealSection>
        )}

      </main>
      <Footer />
    </div>
  );
}