'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, FileText, CreditCard, Users, ShieldCheck,
  CheckCircle2, ArrowRight, Building2, MapPin, Globe,
  LayoutDashboard, Bell, MessageSquare, Wrench, ClipboardList,
  TrendingUp, Star, Key, BarChart2, UserCheck, Home,
  Bed, Bath, Square
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MotionRevealSection } from '@/components/ui/Motion';

const CITIES = [
  { name: 'New York', country: 'USA', count: '12,400+ listings', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=700&q=80' },
  { name: 'London', country: 'UK', count: '9,800+ listings', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80' },
  { name: 'Los Angeles', country: 'USA', count: '7,200+ listings', img: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=700&q=80' },
  { name: 'Manchester', country: 'UK', count: '4,100+ listings', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=700&q=80' },
  { name: 'Dubai', country: 'UAE', count: '6,600+ listings', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80' },
  { name: 'Toronto', country: 'Canada', count: '5,300+ listings', img: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=700&q=80' },
];

const TENANT_FEATURES = [
  { icon: Search, color: '#0992C2', title: 'Smart Search & Discovery', desc: 'Browse verified listings by city, budget, and amenities. AI matching recommends properties based on your profile.' },
  { icon: ClipboardList, color: '#0284C7', title: 'One-Click Applications', desc: 'Apply with a single click. Track all your applications in real time — status, landlord responses, and offer rounds.' },
  { icon: FileText, color: '#0891B2', title: 'Digital Lease Signing', desc: 'Sign legally binding agreements from any device. No printing, no fax — your signed lease is instantly downloadable.' },
  { icon: CreditCard, color: '#0992C2', title: 'Rent Payments', desc: 'Pay rent securely via card or bank transfer. Automated reminders, downloadable receipts, and full payment history.' },
  { icon: Wrench, color: '#0284C7', title: 'Maintenance Requests', desc: 'Submit issues with photos and urgency levels. Track repair status end-to-end — no more chasing landlords.' },
  { icon: MessageSquare, color: '#0891B2', title: 'Direct Messaging', desc: 'All tenant-landlord communication in one place. Full audit trail, document sharing, and read receipts.' },
];

const LANDLORD_FEATURES = [
  { icon: Building2, color: '#1D4ED8', title: 'Verified Property Listings', desc: 'Publish listings with photos, amenities, and lease terms. Verified badge builds trust with quality tenants.' },
  { icon: UserCheck, color: '#0369A1', title: 'Tenant Screening', desc: 'One-click screening requests. Get credit reports, criminal background, employment verification — all in-platform.' },
  { icon: Users, color: '#0E7490', title: 'Application Management', desc: 'Centralized inbox for all applicants. Review profiles, message candidates, and accept or decline with one click.' },
  { icon: TrendingUp, color: '#1D4ED8', title: 'Rent Collection', desc: 'Automated rent schedules, overdue flagging, and a full collection dashboard. Late fees applied automatically.' },
  { icon: BarChart2, color: '#0369A1', title: 'Portfolio Analytics', desc: 'Track occupancy rates, payment status, maintenance costs, and lease expiries across all your properties.' },
  { icon: ShieldCheck, color: '#0E7490', title: 'Dispute Resolution', desc: 'Built-in dispute system with a transparent audit log. Admin mediation keeps every interaction documented.' },
];

const STATS = [
  { value: '60+', label: 'Countries' },
  { value: '2M+', label: 'Listings' },
  { value: '500K+', label: 'Landlords' },
  { value: '4.7★', label: 'Avg Rating' },
];

// SVG Cityscape illustration using the brand palette
function CityscapeSVG() {
  return (
    <svg
      viewBox="0 0 1200 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-x-0 bottom-0 w-full"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      {/* Reflection layer */}
      <rect x="0" y="280" width="1200" height="60" fill="rgba(10,196,224,0.15)" />

      {/* Far-background buildings */}
      <rect x="50" y="180" width="40" height="120" fill="rgba(11,45,114,0.25)" rx="3" />
      <rect x="100" y="160" width="30" height="140" fill="rgba(11,45,114,0.2)" rx="3" />
      <rect x="140" y="190" width="50" height="110" fill="rgba(11,45,114,0.22)" rx="3" />

      {/* Bridge towers (left) */}
      <rect x="30" y="100" width="18" height="180" fill="rgba(246,180,120,0.55)" rx="2" />
      <rect x="70" y="100" width="18" height="180" fill="rgba(246,180,120,0.55)" rx="2" />
      {/* Bridge cables */}
      <line x1="39" y1="105" x2="0" y2="280" stroke="rgba(246,180,120,0.4)" strokeWidth="1.5" />
      <line x1="39" y1="105" x2="160" y2="280" stroke="rgba(246,180,120,0.4)" strokeWidth="1.5" />
      <line x1="79" y1="105" x2="0" y2="280" stroke="rgba(246,180,120,0.4)" strokeWidth="1.5" />
      <line x1="79" y1="105" x2="160" y2="280" stroke="rgba(246,180,120,0.4)" strokeWidth="1.5" />

      {/* Mid buildings left cluster */}
      <rect x="160" y="140" width="60" height="140" fill="rgba(246,180,120,0.45)" rx="4" />
      <rect x="170" y="120" width="20" height="25" fill="rgba(246,180,120,0.5)" rx="2" />
      <rect x="230" y="100" width="45" height="180" fill="rgba(246,160,100,0.4)" rx="4" />
      <rect x="240" y="80" width="12" height="25" fill="rgba(246,160,100,0.5)" rx="2" />
      <rect x="285" y="150" width="55" height="130" fill="rgba(200,150,100,0.35)" rx="4" />

      {/* Tall center spire */}
      <rect x="360" y="60" width="35" height="220" fill="rgba(9,146,194,0.45)" rx="4" />
      <polygon points="360,60 377,20 395,60" fill="rgba(9,146,194,0.6)" />
      <rect x="368" y="70" width="6" height="8" fill="rgba(255,255,255,0.4)" rx="1" />
      <rect x="378" y="70" width="6" height="8" fill="rgba(255,255,255,0.4)" rx="1" />
      <rect x="368" y="85" width="6" height="8" fill="rgba(255,255,255,0.4)" rx="1" />
      <rect x="378" y="85" width="6" height="8" fill="rgba(255,255,255,0.4)" rx="1" />

      {/* Colorful mid-ground blocks */}
      <rect x="410" y="130" width="50" height="150" fill="rgba(9,146,194,0.5)" rx="4" />
      <rect x="420" y="110" width="14" height="24" fill="rgba(9,146,194,0.6)" rx="2" />
      <rect x="470" y="160" width="70" height="120" fill="rgba(246,231,188,0.55)" rx="4" />
      <rect x="480" y="140" width="20" height="24" fill="rgba(246,231,188,0.65)" rx="2" />

      {/* Center ground burst */}
      <rect x="550" y="170" width="80" height="110" fill="rgba(10,196,224,0.4)" rx="4" />
      <rect x="560" y="145" width="24" height="28" fill="rgba(10,196,224,0.5)" rx="2" />
      <rect x="592" y="155" width="16" height="18" fill="rgba(10,196,224,0.5)" rx="2" />
      <rect x="640" y="140" width="55" height="140" fill="rgba(9,146,194,0.6)" rx="4" />
      <rect x="650" y="118" width="18" height="26" fill="rgba(9,146,194,0.65)" rx="2" />

      {/* Right cluster – blues */}
      <rect x="710" y="100" width="45" height="180" fill="rgba(11,45,114,0.4)" rx="4" />
      <rect x="720" y="80" width="10" height="24" fill="rgba(11,45,114,0.5)" rx="2" />
      <rect x="765" y="130" width="60" height="150" fill="rgba(11,45,114,0.35)" rx="4" />
      <rect x="838" y="150" width="50" height="130" fill="rgba(9,146,194,0.35)" rx="4" />
      <rect x="848" y="130" width="14" height="24" fill="rgba(9,146,194,0.45)" rx="2" />

      {/* Far right towers */}
      <rect x="900" y="110" width="55" height="170" fill="rgba(10,196,224,0.38)" rx="4" />
      <rect x="912" y="90" width="12" height="24" fill="rgba(10,196,224,0.48)" rx="2" />
      <rect x="968" y="170" width="65" height="110" fill="rgba(11,45,114,0.3)" rx="4" />
      <rect x="980" y="155" width="16" height="18" fill="rgba(11,45,114,0.4)" rx="2" />
      <rect x="1045" y="140" width="45" height="140" fill="rgba(9,146,194,0.3)" rx="4" />
      <rect x="1100" y="165" width="60" height="115" fill="rgba(11,45,114,0.25)" rx="4" />
      <rect x="1165" y="180" width="35" height="100" fill="rgba(9,146,194,0.25)" rx="4" />

      {/* Windows sprinkled */}
      {[165, 175, 185, 195, 205, 215, 165, 175, 185, 195].map((x, i) => (
        <rect key={i} x={x} y={145 + (i % 4) * 20} width="8" height="6" fill="rgba(255,255,255,0.35)" rx="1" />
      ))}
      {[413, 424, 435, 413, 424, 435, 413, 424].map((x, i) => (
        <rect key={`w2-${i}`} x={x} y={138 + (i % 4) * 20} width="8" height="6" fill="rgba(255,255,255,0.3)" rx="1" />
      ))}

      {/* Seagulls */}
      <path d="M500 80 Q504 76 508 80" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" />
      <path d="M520 68 Q525 63 530 68" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <path d="M820 95 Q825 90 830 95" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" />

      {/* Ground shadow line */}
      <rect x="0" y="278" width="1200" height="4" fill="rgba(11,45,114,0.15)" />
    </svg>
  );
}

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('rent');
  const [roleTab, setRoleTab] = useState('tenant');
  const [query, setQuery] = useState('');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tenantBtnRef = useRef(null);
  const landlordBtnRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // user comes from UserContext — no localStorage read needed
  }, []);

  useEffect(() => {
    const btn = roleTab === 'tenant' ? tenantBtnRef.current : landlordBtnRef.current;
    if (!btn) return;
    const parent = btn.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicatorStyle({ left: btnRect.left - parentRect.left, width: btnRect.width });
  }, [roleTab]);

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

        {/* ── HERO – FULL VIEWPORT GRADIENT + CITYSCAPE ─────────────── */}
        <section className="relative min-h-[90vh] overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #F6C87A 0%, #0AC4E0 38%, #0992C2 60%, #0B2D72 100%)',
          }}
        >
          {/* Subtle radial overlays for depth */}
          <div className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 20% 30%, rgba(246,231,188,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 10%, rgba(10,196,224,0.25) 0%, transparent 55%)',
            }}
          />

          {/* Hero content */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 pb-48 pt-28 text-center">

            {/* Headline */}
            <h1 className="text-hero text-white drop-shadow-sm"
              style={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}
            >
              Renting Done Right. Finally.
            </h1>

            {/* Rent / Buy tabs + Search bar */}
            <div className="mt-10 w-full max-w-2xl">
              {/* Tab row */}
              <div className="flex justify-center mb-0">
                <div className="inline-flex rounded-t-2xl overflow-hidden border border-white/30 border-b-0">
                  {['Rent', 'Buy'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t.toLowerCase())}
                      className={`px-8 py-2.5 text-[0.85rem] font-semibold transition-all ${tab === t.toLowerCase()
                        ? 'bg-white text-[#0992C2]'
                        : 'bg-white/15 text-white hover:bg-white/25'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-3 rounded-b-3xl rounded-tr-3xl bg-white/95 px-5 py-3.5 shadow-2xl shadow-[#0B2D72]/30 backdrop-blur"
              >
                <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type in a city, address, or ZIP code"
                  className="flex-1 bg-transparent text-[0.95rem] text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-[#0B2D72] to-[#0992C2] px-5 py-2 text-[0.8rem] font-semibold text-white shadow-md shadow-[#0992C2]/30 transition-all hover:scale-105 hover:shadow-lg"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* SVG Cityscape */}
          <div className="absolute inset-x-0 bottom-0 h-80 pointer-events-none">
            <CityscapeSVG />
          </div>
        </section>

        {/* ── RENT AROUND THE WORLD ─────────────────────────────────── */}
        <MotionRevealSection className="py-20 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0 text-center">
            <h2 className="text-h2 text-neutral-900 mb-3">Rent Around the World</h2>
            <p className="mx-auto max-w-xl text-body text-neutral-600 mb-14">
              Explore millions of listings across 90+ countries. From local apartments to global stays,
              find your next home in minutes with our intelligent search.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-14">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border border-[#0992C2]/15 bg-[#F8FBFC] px-4 py-5">
                  <p className="text-3xl font-extrabold text-[#0B2D72] tracking-tight">{s.value}</p>
                  <p className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-neutral-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* City cards */}
            <div className="grid gap-5 md:grid-cols-3">
              {CITIES.map((city, idx) => (
                <Link
                  key={city.name}
                  href={`/browse?city=${city.name}`}
                  className={`group relative block overflow-hidden rounded-3xl shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:shadow-xl ${idx === 1 ? 'md:-mt-6' : idx === 2 ? 'md:mt-6' : ''
                    }`}
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
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link href="/browse" className="rf-btn rf-btn-secondary text-[0.8rem]">
                View all markets <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </MotionRevealSection>

        {/* ── TENANT / LANDLORD FEATURES – FULL WIDTH COLOR BLOCK ─────── */}
        <MotionRevealSection
          id="features"
          className="scroll-mt-20"
        >
          <div
            className={`relative overflow-hidden transition-colors duration-500 px-6 py-16 md:px-16 lg:px-24 ${roleTab === 'tenant'
              ? 'bg-[#F8843F]'
              : 'bg-[#0B2D72]'
              }`}
          >
            {/* Decorative blobs */}
            <div className={`pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full blur-3xl opacity-30 transition-colors duration-500 ${roleTab === 'tenant' ? 'bg-white' : 'bg-[#0AC4E0]'
              }`} />
            <div className={`pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full blur-3xl opacity-25 transition-colors duration-500 ${roleTab === 'tenant' ? 'bg-[#0B2D72]' : 'bg-[#F8843F]'
              }`} />

            <div className="relative flex flex-col gap-12 lg:flex-row mx-auto max-w-7xl">
              {/* Left: info + toggle */}
              <div className="flex-shrink-0 lg:w-72 xl:w-80 space-y-6">
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] ${roleTab === 'tenant'
                  ? 'bg-white/20 text-white ring-1 ring-white/30'
                  : 'bg-white/10 text-white/80 ring-1 ring-white/20'
                  }`}>
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Role-specific workspaces
                </div>

                <div className="space-y-3">
                  <h2 className="text-h2 text-white">
                    Built for
                    <span className="font-extrabold">
                      {' '}
                      {roleTab === 'tenant' ? 'tenants who expect calm.' : 'landlords who expect control.'}
                    </span>
                  </h2>
                  <p className={`text-body ${roleTab === 'tenant' ? 'text-white/75' : 'text-white/65'}`}>
                    Switch views to see how RentifyPro adapts instantly to tenants or landlords
                    — from application flows to analytics.
                  </p>
                </div>

                {/* Role toggle */}
                <div className={`inline-flex rounded-full p-1 shadow-sm ${roleTab === 'tenant' ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                  <div className="relative flex gap-1 overflow-hidden rounded-full">
                    <div
                      className={`absolute inset-y-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${roleTab === 'tenant' ? 'bg-white/30' : 'bg-white/20'
                        }`}
                      style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
                    />
                    <button
                      ref={tenantBtnRef}
                      type="button"
                      onClick={() => setRoleTab('tenant')}
                      className="relative z-10 flex items-center gap-1 rounded-full px-4 py-2 text-[0.75rem] font-semibold text-white transition-colors"
                    >
                      🏠 Tenant
                    </button>
                    <button
                      ref={landlordBtnRef}
                      type="button"
                      onClick={() => setRoleTab('landlord')}
                      className="relative z-10 flex items-center gap-1 rounded-full px-4 py-2 text-[0.75rem] font-semibold text-white/80 hover:text-white transition-colors"
                    >
                      🏢 Landlord
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {!user ? (
                    <Link
                      href="/register"
                      className={`rf-btn text-[0.8rem] font-bold ${roleTab === 'tenant'
                        ? 'bg-white text-[#F8843F] hover:bg-white/90 shadow-lg shadow-black/10'
                        : 'bg-white text-[#0B2D72] hover:bg-white/90 shadow-lg shadow-black/20'
                        }`}
                    >
                      Get started free
                      <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="rf-btn bg-white/20 text-white ring-1 ring-white/30 hover:bg-white/30 text-[0.8rem]"
                    >
                      Go to dashboard
                      <LayoutDashboard size={15} />
                    </Link>
                  )}
                  <Link
                    href="/browse"
                    className="rf-btn bg-transparent text-white/80 ring-1 ring-white/30 hover:bg-white/10 hover:text-white text-[0.8rem]"
                  >
                    Preview listings
                  </Link>
                </div>
              </div>

              {/* Right: feature cards */}
              <div className="flex-1">
                <div
                  key={roleTab}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {features.map((f, i) => {
                    const Icon = f.icon;
                    const isTenant = roleTab === 'tenant';
                    return (
                      <div
                        key={f.title}
                        style={{ animationDelay: `${i * 70}ms` }}
                        className={`rf-fade-in-stagger rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-1 ${isTenant
                          ? 'bg-white/20 ring-1 ring-white/25 hover:bg-white/25'
                          : 'bg-white/10 ring-1 ring-white/15 hover:bg-white/15'
                          }`}
                      >
                        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${isTenant ? 'bg-white/30' : 'bg-[#0AC4E0]/30'
                          }`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <h3 className="mb-1 text-[0.9rem] font-semibold text-white">
                          {f.title}
                        </h3>
                        <p className={`text-[0.75rem] leading-relaxed ${isTenant ? 'text-white/70' : 'text-white/60'}`}>
                          {f.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </MotionRevealSection>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <MotionRevealSection id="how-it-works" className="scroll-mt-24 py-20 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
            <div className="mb-12 text-center">
              <h2 className="text-h2 text-neutral-900">
                From search to signed keys in three calm steps.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-body text-neutral-600">
                Every workflow is opinionated enough to be fast, flexible enough to mirror how your team works.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { n: '01', title: 'Search & discover', desc: 'Verified listings, AI-powered recommendations, and filters that actually map to how you search.', icon: Search },
                { n: '02', title: 'Apply & sign', desc: 'Tenant applications, screening, and digital agreements live in a single trackable thread.', icon: FileText },
                { n: '03', title: 'Pay & stay synced', desc: 'Rent schedules, receipts, and maintenance all tied back to the same live agreement.', icon: Key },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.n} className="relative space-y-3 rounded-3xl border border-[#0992C2]/20 bg-white p-6 shadow-sm shadow-[#0992C2]/10">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[0.8rem] font-semibold text-neutral-500">Step {step.n}</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0AC4E0]/15">
                        <Icon className="h-4 w-4 text-[#0992C2]" />
                      </div>
                    </div>
                    <h3 className="text-[1rem] font-semibold text-neutral-900">{step.title}</h3>
                    <p className="text-[0.8rem] leading-relaxed text-neutral-600">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </MotionRevealSection>

        {/* ── TRUST SIGNALS ────────────────────────────────────────── */}
        <MotionRevealSection className="py-14 bg-[#F8FBFC]">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <p className="text-micro mb-6 text-neutral-500">TRUSTED BY TEAMS WHO CARE ABOUT THE EXPERIENCE</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[0.8rem] font-medium text-neutral-600">
              {[
                { icon: ShieldCheck, text: 'Verified listings & landlords' },
                { icon: Star, text: '4.7★ average satisfaction' },
                { icon: Globe, text: '60+ countries supported' },
                { icon: UserCheck, text: 'In-line tenant screening' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm shadow-[#0992C2]/15 border border-[#0992C2]/10">
                  <Icon size={16} className="text-[#0992C2]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </MotionRevealSection>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <MotionRevealSection className="py-16 bg-white">
          {!user && (
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
          )}


          {user && (
            <section
              className="relative overflow-hidden px-6 py-24 text-center"
              style={{
                background: 'linear-gradient(135deg, #F8FBFC 0%, #0AC4E0 35%, #0992C2 65%, #0B2D72 100%)',
              }}
            >
              {/* Radial overlays for depth, removed the plain blurry circles */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.45) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(246,231,188,0.2) 0%, transparent 40%)',
                }}
              />

              <div className="relative mx-auto max-w-2xl space-y-6">
                <h2 className="text-h2 text-white">
                  Welcome back, {user.name?.split(' ')[0]}.
                </h2>
                <p className="mx-auto max-w-md text-[1.05rem] leading-relaxed text-white/85">
                  Continue where you left off — your applications, leases, and payments are already synced.
                </p>

                <div className="mt-8 flex justify-center">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-[0.85rem] font-bold text-[#0992C2] shadow-md shadow-black/10 transition-all hover:scale-105 hover:shadow-lg hover:shadow-black/15"
                  >
                    <LayoutDashboard size={18} />
                    Go to dashboard
                  </Link>
                </div>
              </div>
            </section>
          )}
        </MotionRevealSection>
      </main>

      <Footer />
    </div>
  );
}