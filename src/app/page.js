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
    <div className="min-h-screen flex flex-col bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap');

        *, body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .hero-bg {
          background: linear-gradient(160deg, #1e40af 0%, #2563eb 35%, #3b82f6 65%, #60a5fa 100%);
          position: relative;
          overflow: hidden;
          min-height: 540px;
        }
        .hero-bg::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 15% 40%, rgba(255,255,255,0.08) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 20%, rgba(30,64,175,0.5) 0%, transparent 50%);
        }
        .hero-bg::after {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .hero-content { position: relative; z-index: 10; }

        .search-card {
          background: white;
          border-radius: 0 20px 20px 20px;
          box-shadow: 0 24px 64px rgba(30, 64, 175, 0.3);
        }

        .search-tab-active {
          background: white; color: #2563eb;
          border-radius: 12px 12px 0 0;
          font-weight: 700;
        }
        .search-tab-inactive {
          color: rgba(255,255,255,0.75);
          border-radius: 12px 12px 0 0;
          transition: color 0.2s;
        }
        .search-tab-inactive:hover { color: white; }

        .city-card {
          border-radius: 18px; overflow: hidden;
          position: relative; cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
        }
        .city-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 48px rgba(0,0,0,0.18);
        }
        .city-card img {
          width: 100%; height: 210px; object-fit: cover;
          transition: transform 0.5s ease;
        }
        .city-card:hover img { transform: scale(1.08); }
        .city-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(15,23,42,0.78) 0%, transparent 100%);
          padding: 24px 16px 16px;
          color: white;
        }

        .role-toggle-wrap {
          background: #F1F5F9;
          border-radius: 16px;
          position: relative;
          padding: 5px;
          display: inline-flex;
        }
        .role-indicator {
          position: absolute;
          top: 5px; bottom: 5px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(37,99,235,0.15);
          transition: left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 0;
        }
        .role-btn {
          position: relative; z-index: 1;
          padding: 12px 36px;
          border-radius: 12px;
          font-weight: 700; font-size: 0.9rem;
          transition: color 0.3s;
          cursor: pointer;
          background: none; border: none;
          white-space: nowrap;
        }
        .role-btn-active  { color: #2563EB; }
        .role-btn-inactive { color: #64748B; }

        .feature-card {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 28px;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(37,99,235,0.1);
          border-color: #BFDBFE;
        }

        .features-grid-enter { animation: fadeSlideUp 0.45s cubic-bezier(0.34,1.1,0.64,1) both; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .stat-item {
          text-align: center;
          padding: 28px 20px;
        }

        .cta-section {
          background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%);
          position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 80% 50%, rgba(96,165,250,0.25) 0%, transparent 60%);
        }

        .seagull { position: absolute; opacity: 0.5; }

        .how-step-num {
          font-family: 'Outfit', sans-serif;
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(135deg, #93C5FD, #2563EB);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <Navbar />

      <main className="flex-grow pt-16">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="hero-bg pb-0 pt-16">
          {/* Seagulls */}
          <svg className="seagull" style={{top:'20%',left:'14%',width:38}} viewBox="0 0 60 20"><path d="M0 10 Q15 0 30 10 Q45 0 60 10" stroke="white" strokeWidth="2.5" fill="none"/></svg>
          <svg className="seagull" style={{top:'32%',left:'10%',width:24}} viewBox="0 0 60 20"><path d="M0 10 Q15 0 30 10 Q45 0 60 10" stroke="white" strokeWidth="2.5" fill="none"/></svg>
          <svg className="seagull" style={{top:'15%',right:'15%',width:32}} viewBox="0 0 60 20"><path d="M0 10 Q15 0 30 10 Q45 0 60 10" stroke="white" strokeWidth="2.5" fill="none"/></svg>
          <svg className="seagull" style={{top:'40%',right:'10%',width:20}} viewBox="0 0 60 20"><path d="M0 10 Q15 0 30 10 Q45 0 60 10" stroke="white" strokeWidth="2.5" fill="none"/></svg>

          <div className="hero-content max-w-4xl mx-auto px-4 text-center">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.25em] mb-4">60+ Countries · 2M+ Listings</p>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.08,
              marginBottom: '2.2rem',
              textShadow: '0 2px 24px rgba(30,58,138,0.4)',
              letterSpacing: '-0.02em'
            }}>
              Renting Done Right.<br/>Finally.
            </h1>

            {/* Search tabs + box */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-0 justify-start">
                {['Rent','Buy'].map(t => (
                  <button key={t} onClick={() => setTab(t.toLowerCase())}
                    className={`px-7 py-2.5 text-sm font-bold transition-all ${tab === t.toLowerCase() ? 'search-tab-active' : 'search-tab-inactive'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSearch} className="search-card flex items-center gap-3 p-2 pl-5">
                <Search className="text-blue-400 flex-shrink-0" size={19} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Type a city, address, or ZIP code"
                  className="flex-1 py-3 text-gray-700 bg-transparent outline-none text-base placeholder-gray-400"
                />
                <button type="submit"
                  className="px-7 py-3 rounded-xl text-white text-sm font-bold flex-shrink-0 transition-all hover:brightness-110 active:scale-95"
                  style={{background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)'}}>
                  Search
                </button>
              </form>
            </div>

            <div className="mt-5 flex items-center justify-center gap-5 flex-wrap">
              {['Verified Listings','Digital Leases','Secure Payments','AI Matching'].map(t => (
                <span key={t} className="text-white/80 text-xs flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 size={13} className="text-blue-200"/>  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Cityscape */}
          <div style={{marginTop:'2.5rem', position:'relative', height:220}}>
            {HERO_CITYSCAPE_URL ? (
              <img src={HERO_CITYSCAPE_URL} alt="City skyline"
                style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:900,opacity:0.85,mixBlendMode:'luminosity',zIndex:1}}/>
            ) : (
              <svg style={{position:'absolute',bottom:0,left:0,right:0,width:'100%'}} viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="b1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(147,197,253,0.5)"/>
                    <stop offset="100%" stopColor="rgba(59,130,246,0.2)"/>
                  </linearGradient>
                  <linearGradient id="b2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(191,219,254,0.4)"/>
                    <stop offset="100%" stopColor="rgba(37,99,235,0.2)"/>
                  </linearGradient>
                </defs>
                <rect x="0" y="195" width="1440" height="25" fill="rgba(30,64,175,0.25)" rx="0"/>
                {/* Buildings */}
                <rect x="60"  y="120" width="48" height="100" fill="url(#b1)" rx="2"/>
                <rect x="118" y="80"  width="40" height="140" fill="url(#b2)" rx="2"/>
                <rect x="168" y="100" width="60" height="120" fill="url(#b1)" rx="2"/>
                <rect x="238" y="60"  width="36" height="160" fill="url(#b2)" rx="2"/>
                <rect x="284" y="95"  width="65" height="125" fill="url(#b1)" rx="2"/>
                <rect x="360" y="130" width="45" height="90"  fill="url(#b2)" rx="2"/>
                <rect x="415" y="65"  width="38" height="155" fill="url(#b1)" rx="2"/>
                <rect x="463" y="90"  width="72" height="130" fill="url(#b2)" rx="2"/>
                {/* Central tower */}
                <rect x="555" y="18"  width="55" height="202" fill="url(#b1)" rx="3"/>
                <rect x="568" y="4"   width="28" height="18"  fill="rgba(147,197,253,0.5)" rx="2"/>
                <rect x="545" y="105" width="75" height="7"   fill="rgba(191,219,254,0.5)" rx="3"/>
                <line x1="545" y1="105" x2="490" y2="175" stroke="rgba(191,219,254,0.35)" strokeWidth="3"/>
                <line x1="620" y1="105" x2="675" y2="175" stroke="rgba(191,219,254,0.35)" strokeWidth="3"/>
                {/* Right side */}
                <rect x="645" y="95"  width="52" height="125" fill="url(#b2)" rx="2"/>
                <rect x="707" y="70"  width="42" height="150" fill="url(#b1)" rx="2"/>
                <rect x="759" y="105" width="65" height="115" fill="url(#b2)" rx="2"/>
                <rect x="834" y="55"  width="38" height="165" fill="url(#b1)" rx="2"/>
                <rect x="882" y="88"  width="58" height="132" fill="url(#b2)" rx="2"/>
                <rect x="950" y="115" width="48" height="105" fill="url(#b1)" rx="2"/>
                <rect x="1008" y="72" width="43" height="148" fill="url(#b2)" rx="2"/>
                <rect x="1061" y="98" width="62" height="122" fill="url(#b1)" rx="2"/>
                <rect x="1133" y="85" width="38" height="135" fill="url(#b2)" rx="2"/>
                <rect x="1181" y="118" width="52" height="102" fill="url(#b1)" rx="2"/>
                <rect x="1243" y="92" width="58" height="128" fill="url(#b2)" rx="2"/>
                <rect x="1311" y="110" width="70" height="110" fill="url(#b1)" rx="2"/>
                {/* Window dots */}
                {[130,145,160,175,190].map(y =>
                  [128,138,250,260,430,470,570,585,720,730,848,858,1018,1028,1145,1155,1256,1266].map(x => (
                    <rect key={`${x}-${y}`} x={x} y={y} width="5" height="3" fill="rgba(255,255,255,0.3)" rx="1"/>
                  ))
                )}
                <rect x="0" y="218" width="1440" height="2" fill="rgba(59,130,246,0.3)"/>
              </svg>
            )}
          </div>
        </section>

        {/* ── STATS STRIP ───────────────────────────────────────────────── */}
        <section style={{background:'#1E3A8A'}}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-blue-700/40">
              {STATS.map(s => (
                <div key={s.label} className="stat-item">
                  <p style={{fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'2rem', color:'white', lineHeight:1}}>{s.value}</p>
                  <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CITIES ────────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                <Globe size={13}/> Global Coverage
              </div>
              <h2 style={{fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'clamp(1.8rem,3vw,2.5rem)', letterSpacing:'-0.02em'}} className="text-gray-900 mb-3">
                Rent Around the World
              </h2>
              <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
                Explore millions of listings across 60+ countries. From studio apartments to luxury homes — find your next place in minutes.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CITIES.map((city) => (
                <Link key={city.name} href={`/browse?city=${city.name}`} className="city-card block">
                  <img src={city.img} alt={city.name} loading="lazy"/>
                  <div className="city-overlay">
                    <div className="flex items-end justify-between">
                      <div>
                        <p style={{fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:'1.1rem'}}>{city.name}</p>
                        <p className="text-white/65 text-xs mt-0.5 flex items-center gap-1"><MapPin size={10}/>{city.count}</p>
                      </div>
                      <span className="bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">{city.country}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/browse"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-bold text-blue-700 border-2 border-blue-200 hover:bg-blue-50 transition-all">
                View All Cities <ArrowRight size={15}/>
              </Link>
            </div>
          </div>
        </section>

        {/* ── TENANT / LANDLORD FEATURES ────────────────────────────────── */}
        <section id="features" className="py-20 scroll-mt-16" style={{background:'#F8FAFF'}}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 style={{fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'clamp(1.8rem,3vw,2.5rem)', letterSpacing:'-0.02em'}} className="text-gray-900 mb-3">
                Built for Every Role
              </h2>
              <p className="text-gray-500 text-base max-w-sm mx-auto mb-8">
                Whether you're searching for a home or managing properties — we've got you covered.
              </p>

              {/* Role toggle */}
              <div className="flex justify-center">
                <div className="role-toggle-wrap">
                  <div className="role-indicator" style={indicatorStyle}/>
                  <button ref={tenantBtnRef}
                    onClick={() => setRoleTab('tenant')}
                    className={`role-btn ${roleTab === 'tenant' ? 'role-btn-active' : 'role-btn-inactive'}`}>
                    🏠 Tenant
                  </button>
                  <button ref={landlordBtnRef}
                    onClick={() => setRoleTab('landlord')}
                    className={`role-btn ${roleTab === 'landlord' ? 'role-btn-active' : 'role-btn-inactive'}`}>
                    🏢 Landlord
                  </button>
                </div>
              </div>
            </div>

            {/* Features grid — re-renders with animation on tab switch */}
            <div key={roleTab} className="features-grid-enter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="feature-card" style={{animationDelay: `${i * 55}ms`}}>
                    <div style={{width:48,height:48,borderRadius:14,background:f.bg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                      <Icon size={22} style={{color:f.color}}/>
                    </div>
                    <h3 style={{fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:'1rem', color:'#0F172A', marginBottom:8}}>{f.title}</h3>
                    <p style={{color:'#64748B', fontSize:'0.875rem', lineHeight:1.65}}>{f.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA under features */}
            <div className="text-center mt-10">
              <Link href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white text-sm font-bold shadow-lg shadow-blue-200 transition-all hover:brightness-110 active:scale-95"
                style={{background:'linear-gradient(135deg,#1D4ED8,#3B82F6)'}}>
                Get Started Free <ArrowRight size={15}/>
              </Link>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-white scroll-mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 style={{fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'clamp(1.8rem,3vw,2.5rem)', letterSpacing:'-0.02em'}} className="text-gray-900 mb-3">
                From Search to Keys — In Minutes
              </h2>
              <p className="text-gray-500 max-w-sm mx-auto text-base">The entire rental lifecycle, digitized end to end.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { n:'01', title:'Search & Discover',   desc:'Browse verified listings globally. Filter by city, price, type, and amenities. AI matches you with the best options.', icon: Search },
                { n:'02', title:'Apply & Sign',         desc:'Submit applications in one click. Landlords review, accept, and send digital agreements — no paper, no delays.', icon: FileText },
                { n:'03', title:'Pay & Move In',        desc:'Security deposit and rent collected securely. Automated monthly schedules, receipts, and real-time tracking.', icon: Key },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.n} className="text-center">
                    <div className="how-step-num mb-2">{step.n}</div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon size={20} className="text-blue-600"/>
                    </div>
                    <h3 style={{fontFamily:"'Outfit',sans-serif", fontWeight:700}} className="text-gray-900 text-lg mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TRUST SIGNALS ─────────────────────────────────────────────── */}
        <section style={{background:'#F1F5FF'}} className="py-14">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Trusted Worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {[
                { icon: ShieldCheck, text: 'Verified Listings & Landlords' },
                { icon: Star,        text: '4.7★ Average Rating' },
                { icon: Globe,       text: '60+ Countries Covered' },
                { icon: UserCheck,   text: 'Tenant Screening Built-in' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-gray-600 text-sm font-semibold">
                  <Icon size={18} className="text-blue-500"/> {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        {!user && (
          <section className="cta-section py-20">
            <div className="max-w-3xl mx-auto px-4 text-center" style={{position:'relative',zIndex:1}}>
              <h2 style={{fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:'clamp(1.8rem,3vw,2.2rem)', color:'white', marginBottom:'1rem', letterSpacing:'-0.02em'}}>
                Ready to simplify your rental?
              </h2>
              <p className="text-white/75 mb-8 text-base">Join 500,000+ landlords and tenants already on RentifyPro.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  className="px-9 py-4 bg-white text-blue-700 font-bold rounded-2xl shadow-2xl hover:bg-blue-50 transition-all text-sm">
                  Get Started Free
                </Link>
                <Link href="/browse"
                  className="px-9 py-4 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-sm">
                  Browse Listings
                </Link>
              </div>
            </div>
          </section>
        )}

        {user && (
          <section className="cta-section py-16">
            <div className="max-w-2xl mx-auto px-4 text-center" style={{position:'relative',zIndex:1}}>
              <h2 style={{fontFamily:"'Outfit',sans-serif", fontWeight:800, color:'white', marginBottom:'0.75rem', fontSize:'1.8rem', letterSpacing:'-0.02em'}}>
                Welcome back, {user.name?.split(' ')[0]}!
              </h2>
              <p className="text-white/70 mb-6 text-sm">Head to your dashboard to manage your properties and leases.</p>
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-bold rounded-2xl shadow-xl hover:bg-blue-50 transition-all text-sm">
                <LayoutDashboard size={15}/> Go to Dashboard
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}