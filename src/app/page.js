'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, FileText, CreditCard, Users, ShieldCheck,
  CheckCircle2, ArrowRight, Building2, MapPin, Globe,
  LayoutDashboard, Bell, MessageSquare, Wrench, ClipboardList,
  TrendingUp, Star, Key, BarChart2, UserCheck, Home
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MotionRevealSection } from '@/components/ui/Motion';

// ── CLOUDINARY IMAGE ──────────────────────────────────────────────────────────
// Upload your cityscape to Cloudinary, paste the URL below
const HERO_CITYSCAPE_URL = '';
// ─────────────────────────────────────────────────────────────────────────────

const CITIES = [
  { name: 'New York',   country: 'USA',        count: '12,400+ listings', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=700&q=80' },
  { name: 'London',     country: 'UK',         count: '9,800+ listings',  img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80' },
  { name: 'Los Angeles',country: 'USA',        count: '7,200+ listings',  img: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=700&q=80' },
  { name: 'Manchester', country: 'UK',         count: '4,100+ listings',  img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=700&q=80' },
  { name: 'Dubai',      country: 'UAE',        count: '6,600+ listings',  img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80' },
  { name: 'Toronto',    country: 'Canada',     count: '5,300+ listings',  img: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=700&q=80' },
];

const TENANT_FEATURES = [
  { icon: Search,       color: '#2563EB', bg: '#EFF6FF', title: 'Smart Search & Discovery',  desc: 'Browse verified listings by city, budget, and amenities. AI matching recommends properties based on your profile.' },
  { icon: ClipboardList,color: '#0284C7', bg: '#F0F9FF', title: 'One-Click Applications',    desc: 'Apply with a single click. Track all your applications in real time — status, landlord responses, and offer rounds.' },
  { icon: FileText,     color: '#0891B2', bg: '#ECFEFF', title: 'Digital Lease Signing',     desc: 'Sign legally binding agreements from any device. No printing, no fax — your signed lease is instantly downloadable.' },
  { icon: CreditCard,   color: '#2563EB', bg: '#EFF6FF', title: 'Rent Payments',             desc: 'Pay rent securely via card or bank transfer. Automated reminders, downloadable receipts, and full payment history.' },
  { icon: Wrench,       color: '#0284C7', bg: '#F0F9FF', title: 'Maintenance Requests',      desc: 'Submit issues with photos and urgency levels. Track repair status end-to-end — no more chasing landlords.' },
  { icon: MessageSquare,color: '#0891B2', bg: '#ECFEFF', title: 'Direct Messaging',          desc: 'All tenant-landlord communication in one place. Full audit trail, document sharing, and read receipts.' },
];

const LANDLORD_FEATURES = [
  { icon: Building2,    color: '#1D4ED8', bg: '#EFF6FF', title: 'Verified Property Listings', desc: 'Publish listings with photos, amenities, and lease terms. Verified badge builds trust with quality tenants.' },
  { icon: UserCheck,    color: '#0369A1', bg: '#F0F9FF', title: 'Tenant Screening',           desc: 'One-click screening requests. Get credit reports, criminal background, employment verification — all in-platform.' },
  { icon: Users,        color: '#0E7490', bg: '#ECFEFF', title: 'Application Management',    desc: 'Centralized inbox for all applicants. Review profiles, message candidates, and accept or decline with one click.' },
  { icon: TrendingUp,   color: '#1D4ED8', bg: '#EFF6FF', title: 'Rent Collection',           desc: 'Automated rent schedules, overdue flagging, and a full collection dashboard. Late fees applied automatically.' },
  { icon: BarChart2,    color: '#0369A1', bg: '#F0F9FF', title: 'Portfolio Analytics',       desc: 'Track occupancy rates, payment status, maintenance costs, and lease expiries across all your properties.' },
  { icon: ShieldCheck,  color: '#0E7490', bg: '#ECFEFF', title: 'Dispute Resolution',        desc: 'Built-in dispute system with a transparent audit log. Admin mediation keeps every interaction documented.' },
];

const STATS = [
  { value: '60+',    label: 'Countries' },
  { value: '2M+',    label: 'Listings' },
  { value: '500K+',  label: 'Landlords' },
  { value: '4.7★',   label: 'Avg Rating' },
];

export default function LandingPage() {
  const [user, setUser]       = useState(null);
  const [tab, setTab]         = useState('rent');
  const [roleTab, setRoleTab] = useState('tenant');
  const [query, setQuery]     = useState('');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tenantBtnRef  = useRef(null);
  const landlordBtnRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Animate the sliding pill indicator for the role toggle
  useEffect(() => {
    const btn = roleTab === 'tenant' ? tenantBtnRef.current : landlordBtnRef.current;
    if (!btn) return;
    const parent = btn.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const btnRect    = btn.getBoundingClientRect();
    setIndicatorStyle({
      left:  btnRect.left  - parentRect.left,
      width: btnRect.width,
    });
  }, [roleTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/browse?city=${encodeURIComponent(q)}` : '/browse');
  };

  const features = roleTab === 'tenant' ? TENANT_FEATURES : LANDLORD_FEATURES;

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="flex-grow pt-24">

        {/* ── HERO – GREEN BENTO LAYOUT ─────────────────────────────────── */}
        <MotionRevealSection
          className="relative"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-10 md:flex-row md:items-stretch md:gap-8 lg:px-0">
            {/* Left column – copy + search */}
            <div className="flex flex-1 flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E0EDC5] bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-neutral-500 shadow-sm shadow-[#C7EABB]/40 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#84B179]" />
                60+ countries · 2M+ listings
              </div>

              <div className="space-y-4">
                <h1 className="text-hero text-neutral-900">
                  Renting, reimagined in
                  <span className="bg-gradient-to-r from-[#84B179] via-[#A2CB8B] to-[#C7EABB] bg-clip-text text-transparent">
                    {' '}
                    one calm workspace.
                  </span>
                </h1>
                <p className="max-w-xl text-body text-neutral-600">
                  RentifyPro replaces scattered calls, PDFs, and spreadsheets with a single
                  premium hub for tenants and landlords — from discovery to signed keys.
                </p>
              </div>

              {/* Search bento card */}
              <div className="mt-2 grid gap-3 md:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]">
                <div className="rf-card-soft relative overflow-hidden">
                  <div className="pointer-events-none absolute -left-6 -top-10 h-28 w-28 rounded-full bg-[#E8F5BD] blur-2xl" />
                  <div className="pointer-events-none absolute -right-10 bottom-0 h-28 w-28 rounded-full bg-[#C7EABB] blur-2xl" />
                  <div className="relative space-y-3">
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[0.65rem] font-medium text-neutral-500 ring-1 ring-[#E0EDC5]">
                      <CheckCircle2 className="h-3 w-3 text-[#84B179]" />
                      <span>Verified listings & digital leases</span>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-[#F2F7E5] p-1 text-[0.7rem] font-semibold text-neutral-600">
                      {['Rent', 'Buy'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTab(t.toLowerCase())}
                          className={`flex-1 rounded-full px-3 py-1.5 transition-all ${
                            tab === t.toLowerCase()
                              ? 'bg-white text-neutral-900 shadow-sm shadow-[#C7EABB]/60'
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <form
                      onSubmit={handleSearch}
                      className="flex items-center gap-2 rounded-2xl border border-[#E0EDC5] bg-white/90 px-3 py-2.5 shadow-sm shadow-[#E1F0C9]/50 backdrop-blur"
                    >
                      <Search className="h-4 w-4 text-[#84B179]" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by city, address, or ZIP"
                        className="flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rf-btn rf-btn-primary hidden text-[0.7rem] md:inline-flex"
                      >
                        Search
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-3 text-[0.7rem] text-neutral-500">
                      {['Verified landlords', 'Secure payments', 'AI match suggestions'].map(
                        (item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1 rounded-full bg-[#F5FAE9] px-2 py-1"
                          >
                            <CheckCircle2 className="h-3 w-3 text-[#84B179]" />
                            {item}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* Compact stat stack */}
                <div className="flex flex-col gap-3">
                  <div className="rf-card h-full min-h-[120px] rounded-2xl border border-[#E0EDC5] bg-gradient-to-br from-[#F9FCEB] via-white to-[#E8F5BD] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                          Live activity
                        </p>
                        <p className="mt-1 text-sm font-semibold text-neutral-900">
                          Applications processed in the last 24h
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 shadow-sm shadow-[#C7EABB]/60">
                        <Home className="h-5 w-5 text-[#84B179]" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-2xl font-semibold text-neutral-900">8,412</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[0.65rem] font-medium text-[#1F7A3A]">
                        <TrendingUp className="h-3 w-3" />
                        +18% this week
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column – overlapping cards bento */}
            <div className="relative mt-4 flex flex-1 items-stretch md:mt-0">
              <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-[#C7EABB] opacity-70 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[#E8F5BD] opacity-80 blur-3xl" />

              <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4">
                {/* Main vertical card */}
                <div className="col-span-1 row-span-2 space-y-3 rounded-3xl bg-white/90 p-4 shadow-[0_24px_65px_rgba(148,163,120,0.55)] ring-1 ring-[#E0EDC5] backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#F2F7E5] px-2 py-1 text-[0.7rem] font-medium text-neutral-600">
                      Tenant view
                    </span>
                    <span className="text-[0.65rem] font-medium text-neutral-400">
                      Digital lease · 12 mo
                    </span>
                  </div>
                  <div className="mt-1 space-y-1.5">
                    <p className="text-sm font-semibold text-neutral-900">
                      2-bed in Uptown Green District
                    </p>
                    <p className="text-[0.7rem] text-neutral-500">
                      ₹45,000 / month · Fully managed
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[0.7rem] text-neutral-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F5FAE9] px-2 py-1">
                      <Bed size={11} /> 2
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F5FAE9] px-2 py-1">
                      <Bath size={11} /> 2
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F5FAE9] px-2 py-1">
                      <Square size={11} /> 920 sq ft
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                        Status
                      </p>
                      <p className="inline-flex items-center gap-1 rounded-full bg-[#E3F4D2] px-2 py-1 text-[0.7rem] font-semibold text-[#1F7A3A]">
                        <ShieldCheck size={11} />
                        Verified listing
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rf-btn rf-btn-primary text-[0.7rem]"
                      onClick={() => router.push('/browse')}
                    >
                      Explore listings
                    </button>
                  </div>
                </div>

                {/* Small landlord tile */}
                <div className="rf-card-soft relative mt-6 flex flex-col justify-between rounded-3xl border border-[#E0EDC5] bg-white/80 p-3 shadow-md shadow-[#C7EABB]/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#F5FAE9] px-2 py-1 text-[0.65rem] font-semibold text-neutral-600">
                      Landlord inbox
                    </span>
                    <Bell className="h-3.5 w-3.5 text-[#84B179]" />
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-[0.8rem] font-semibold text-neutral-900">
                      5 new applications
                    </p>
                    <p className="text-[0.7rem] text-neutral-500">
                      Screening queued · Auto reminders on
                    </p>
                  </div>
                </div>

                {/* Stats tile */}
                <div className="rf-card-soft relative -mt-4 flex flex-col justify-between rounded-3xl border border-[#E0EDC5] bg-gradient-to-br from-[#F9FCEB] via-white to-[#E8F5BD] p-3 shadow-md shadow-[#C7EABB]/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.7rem] font-semibold text-neutral-600">
                      Satisfaction
                    </span>
                    <Star className="h-3.5 w-3.5 fill-[#FACC15] text-[#EAB308]" />
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-xl font-semibold text-neutral-900">4.7</p>
                    <span className="text-[0.65rem] text-neutral-500">Avg rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionRevealSection>

        {/* ── STATS STRIP – ASYMMETRIC BENTO ───────────────────────────── */}
        <MotionRevealSection delay={0.05}>
          <div className="mx-auto max-w-6xl px-4 lg:px-0">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
              <div className="rf-card flex items-center justify-between rounded-3xl bg-gradient-to-r from-[#F2F7E5] via-[#FFFFFF] to-[#E8F5BD] px-6 py-5">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-neutral-500">
                    Trusted around the world
                  </p>
                  <p className="mt-2 text-base font-semibold text-neutral-900">
                    Built for modern operators who want renting to feel like a premium product.
                  </p>
                </div>
                <div className="hidden flex-col gap-1 text-right text-[0.75rem] text-neutral-500 sm:flex">
                  {STATS.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-end gap-1">
                      <span className="text-base font-semibold text-neutral-900">
                        {s.value}
                      </span>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rf-card-soft rounded-3xl bg-white/90 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F2F7E5]">
                    <Globe className="h-4 w-4 text-[#84B179]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[0.8rem] font-semibold text-neutral-900">
                      Global-ready from day one
                    </p>
                    <p className="text-[0.7rem] text-neutral-500">
                      Localized for major hubs with consistent, compliant workflows.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionRevealSection>

        {/* ── CITIES – FLOATING GRID ───────────────────────────────────── */}
        <MotionRevealSection className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
            <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F2F7E5] px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-neutral-600">
                  <Globe size={13} />
                  Global coverage
                </div>
                <div>
                  <h2 className="text-h2 text-neutral-900">
                    A calm layer over
                    <br />
                    chaotic rental markets.
                  </h2>
                  <p className="mt-2 max-w-md text-body text-neutral-600">
                    Explore curated rental markets around the world. Tap into trusted inventory
                    without losing the local nuance that matters.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-[#E0EDC5] bg-white/80 px-4 py-3 text-[0.8rem] text-neutral-600 shadow-sm">
                <p className="font-semibold text-neutral-800">
                  24 new markets added in the last year
                </p>
                <p className="text-[0.7rem] text-neutral-500">
                  Your workflows stay identical while we handle the complexity.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {CITIES.map((city, idx) => (
                <Link
                  key={city.name}
                  href={`/browse?city=${city.name}`}
                  className={`group relative block overflow-hidden rounded-3xl border border-[#E0EDC5] bg-white/90 shadow-sm shadow-[#DCEAC4]/40 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:shadow-[0_24px_70px_rgba(148,163,120,0.55)] ${
                    idx === 1 ? 'md:-mt-6' : idx === 2 ? 'md:mt-6' : ''
                  }`}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={city.img}
                      alt={city.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3.5">
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {city.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-[0.7rem] font-medium text-white/80">
                            <MapPin size={11} />
                            {city.count}
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
              <Link
                href="/browse"
                className="rf-btn rf-btn-secondary text-[0.75rem]"
              >
                View all markets
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </MotionRevealSection>

        {/* ── TENANT / LANDLORD FEATURES – COLOR-SWITCHING TABS ────────── */}
        <MotionRevealSection
          id="features"
          className="scroll-mt-20 py-20"
        >
          <div
            className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-0`}
          >
            <div
              className={`relative overflow-hidden rounded-[2rem] border bg-gradient-to-br p-6 shadow-[0_28px_90px_rgba(148,163,120,0.5)] transition-colors duration-500 ${
                roleTab === 'tenant'
                  ? 'from-[#F5FAE9] via-white to-[#E8F5BD] border-[#E0EDC5]'
                  : 'from-[#DCEAC4] via-[#F5FAE9] to-[#C7EABB] border-[#C0DBA5]'
              }`}
            >
              <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-[#E8F5BD] opacity-70 blur-3xl" />
              <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-[#C7EABB] opacity-80 blur-3xl" />

              <div className="relative flex flex-col gap-8 lg:flex-row">
                <div className="flex-1 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-neutral-600 ring-1 ring-[#E0EDC5]">
                    <LayoutDashboard className="h-3.5 w-3.5 text-[#84B179]" />
                    Role-specific workspaces
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-h2 text-neutral-900">
                      Built for
                      <span className="font-extrabold">
                        {' '}
                        {roleTab === 'tenant' ? 'tenants who expect calm.' : 'landlords who expect control.'}
                      </span>
                    </h2>
                    <p className="max-w-md text-body text-neutral-600">
                      Switch views to see how RentifyPro adapts instantly to tenants or landlords
                      — from application flows to analytics.
                    </p>
                  </div>

                  {/* Role toggle */}
                  <div className="inline-flex rounded-full border border-[#E0EDC5] bg-white/80 p-1 shadow-sm shadow-[#DCEAC4]/50">
                    <div
                      className="relative flex gap-1 overflow-hidden rounded-full"
                    >
                      <div
                        className="absolute inset-y-1 rounded-full bg-[#F2F7E5] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        style={{
                          left: indicatorStyle.left,
                          width: indicatorStyle.width,
                        }}
                      />
                      <button
                        ref={tenantBtnRef}
                        type="button"
                        onClick={() => setRoleTab('tenant')}
                        className={`relative z-10 flex items-center gap-1 rounded-full px-4 py-2 text-[0.75rem] font-semibold transition-colors ${
                          roleTab === 'tenant'
                            ? 'text-neutral-900'
                            : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                      >
                        🏠 Tenant
                      </button>
                      <button
                        ref={landlordBtnRef}
                        type="button"
                        onClick={() => setRoleTab('landlord')}
                        className={`relative z-10 flex items-center gap-1 rounded-full px-4 py-2 text-[0.75rem] font-semibold transition-colors ${
                          roleTab === 'landlord'
                            ? 'text-neutral-900'
                            : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                      >
                        🏢 Landlord
                      </button>
                    </div>
                  </div>

                  {/* Auth-aware CTA specific to this section */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {!user ? (
                      <Link
                        href="/register"
                        className="rf-btn rf-btn-primary text-[0.8rem]"
                      >
                        Get started free
                        <ArrowRight size={15} />
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        className="rf-btn rf-btn-secondary text-[0.8rem]"
                      >
                        Go to dashboard
                        <LayoutDashboard size={15} />
                      </Link>
                    )}
                    <Link
                      href="/browse"
                      className="rf-btn rf-btn-ghost text-[0.8rem]"
                    >
                      Preview listings
                    </Link>
                  </div>
                </div>

                {/* Features grid – re-render with color theme */}
                <div className="relative flex-1">
                  <div
                    key={roleTab}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    {features.map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <div
                          key={f.title}
                          style={{ animationDelay: `${i * 70}ms` }}
                          className="rf-hover-card rf-fade-in-stagger rounded-2xl border border-[#E0EDC5] bg-white/80 p-4 text-sm shadow-sm shadow-[#DCEAC4]/40"
                        >
                          <div
                            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${
                              roleTab === 'tenant'
                                ? 'bg-[#EAF5D6]'
                                : 'bg-[#D8ECC3]'
                            }`}
                          >
                            <Icon
                              size={18}
                              className="text-[#84B179]"
                            />
                          </div>
                          <h3 className="mb-1 text-[0.9rem] font-semibold text-neutral-900">
                            {f.title}
                          </h3>
                          <p className="text-[0.75rem] leading-relaxed text-neutral-600">
                            {f.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionRevealSection>

        {/* ── HOW IT WORKS – STEPPED RAIL ──────────────────────────────── */}
        <MotionRevealSection
          id="how-it-works"
          className="scroll-mt-24 py-20"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-0">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <h2 className="text-h2 text-neutral-900">
                  From search to signed keys
                  <br />
                  in three calm steps.
                </h2>
                <p className="max-w-md text-body text-neutral-600">
                  Every workflow is opinionated enough to be fast, but flexible enough to mirror
                  how your team already works.
                </p>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  n: '01',
                  title: 'Search & discover',
                  desc: 'Verified listings, AI-powered recommendations, and filters that actually map to how you search.',
                  icon: Search,
                },
                {
                  n: '02',
                  title: 'Apply & sign',
                  desc: 'Tenant applications, screening, and digital agreements live in a single trackable thread.',
                  icon: FileText,
                },
                {
                  n: '03',
                  title: 'Pay & stay synced',
                  desc: 'Rent schedules, receipts, and maintenance all tied back to the same live agreement.',
                  icon: Key,
                },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.n}
                    className="relative space-y-3 rounded-3xl border border-[#E0EDC5] bg-white/80 p-5 shadow-sm shadow-[#DCEAC4]/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[0.8rem] font-semibold text-neutral-500">
                        Step {step.n}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F2F7E5]">
                        <Icon className="h-4 w-4 text-[#84B179]" />
                      </div>
                    </div>
                    <h3 className="text-[1rem] font-semibold text-neutral-900">
                      {step.title}
                    </h3>
                    <p className="text-[0.8rem] leading-relaxed text-neutral-600">
                      {step.desc}
                    </p>
                    {idx < 2 && (
                      <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-5 bg-gradient-to-r from-[#C7EABB] to-transparent md:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </MotionRevealSection>

        {/* ── TRUST SIGNALS – LIGHT BAND ───────────────────────────────── */}
        <MotionRevealSection className="py-14">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-0">
            <p className="text-micro mb-6 text-neutral-500">
              TRUSTED BY TEAMS WHO CARE ABOUT THE EXPERIENCE
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-[0.8rem] font-medium text-neutral-600">
              {[
                { icon: ShieldCheck, text: 'Verified listings & landlords' },
                { icon: Star, text: '4.7★ average satisfaction' },
                { icon: Globe, text: '60+ countries supported' },
                { icon: UserCheck, text: 'In-line tenant screening' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm shadow-[#DCEAC4]/40"
                >
                  <Icon size={16} className="text-[#84B179]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </MotionRevealSection>

        {/* ── CTA – LOGGED OUT / IN VARIANTS ───────────────────────────── */}
        <MotionRevealSection className="py-16">
          {!user && (
            <section className="relative">
              <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-0">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#A2CB8B] via-[#C7EABB] to-[#E8F5BD] px-6 py-10 shadow-[0_28px_90px_rgba(148,163,120,0.7)]">
                  <div className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-white/50 blur-2xl" />
                  <div className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
                  <div className="relative space-y-5">
                    <h2 className="text-h2 text-neutral-900">
                      Ready to make renting feel premium?
                    </h2>
                    <p className="mx-auto max-w-md text-body text-neutral-700">
                      Join thousands of tenants and landlords who already manage their entire
                      rental lifecycle inside RentifyPro.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <Link
                        href="/register"
                        className="rf-btn rf-btn-primary w-full justify-center text-[0.8rem] sm:w-auto"
                      >
                        Get started free
                      </Link>
                      <Link
                        href="/browse"
                        className="rf-btn rf-btn-secondary w-full justify-center text-[0.8rem] sm:w-auto"
                      >
                        Browse listings
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {user && (
            <section className="relative">
              <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-0">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#F5FAE9] via-white to-[#E8F5BD] px-6 py-10 shadow-[0_22px_70px_rgba(148,163,120,0.5)] ring-1 ring-[#E0EDC5]">
                  <div className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-[#C7EABB]/60 blur-2xl" />
                  <div className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-[#E8F5BD]/70 blur-3xl" />
                  <div className="relative space-y-4">
                    <h2 className="text-h2 text-neutral-900">
                      Welcome back, {user.name?.split(' ')[0]}.
                    </h2>
                    <p className="mx-auto max-w-md text-body text-neutral-600">
                      Continue where you left off — your applications, leases, and payments are
                      already synced.
                    </p>
                    <Link
                      href="/dashboard"
                      className="rf-btn rf-btn-primary inline-flex items-center justify-center text-[0.8rem]"
                    >
                      <LayoutDashboard size={16} />
                      Go to dashboard
                    </Link>
                  </div>
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