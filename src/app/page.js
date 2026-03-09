'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, FileText, CreditCard, Users, ShieldCheck,
  CheckCircle2, ArrowRight, Building2, MapPin,
  LayoutDashboard, Bell, MessageSquare, Wrench, ClipboardList,
  TrendingUp, Star, Key, BarChart2, UserCheck, Home,
  Bed, Bath, Square
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

// ─── Beautiful Cityscape SVG ──────────────────────────────────────────────────
// Three depth layers: distant haze → mid skyline → foreground
// Brand palette: #F6C87A (cream/warm), #0AC4E0 (cyan), #0992C2 (mid-blue), #0B2D72 (deep-blue)
function CityscapeSVG() {
  return (
    <svg
      viewBox="0 0 1440 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-x-0 bottom-0 w-full"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="horizonGlow" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="rgba(246,231,188,0.5)" />
          <stop offset="100%" stopColor="rgba(10,196,224,0)" />
        </radialGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(10,196,224,0.4)" />
          <stop offset="100%" stopColor="rgba(11,45,114,0.12)" />
        </linearGradient>
        <linearGradient id="farBldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(10,196,224,0.2)" />
          <stop offset="100%" stopColor="rgba(11,45,114,0.35)" />
        </linearGradient>
        <linearGradient id="midBldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(10,196,224,0.6)" />
          <stop offset="100%" stopColor="rgba(9,146,194,0.8)" />
        </linearGradient>
        <linearGradient id="heroTower" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(246,231,188,0.95)" />
          <stop offset="40%" stopColor="rgba(10,196,224,0.9)" />
          <stop offset="100%" stopColor="rgba(11,45,114,1)" />
        </linearGradient>
        <linearGradient id="warmBldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(246,200,130,0.75)" />
          <stop offset="100%" stopColor="rgba(246,175,100,0.55)" />
        </linearGradient>
        <linearGradient id="fgBldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(11,45,114,0.7)" />
          <stop offset="100%" stopColor="rgba(11,45,114,0.95)" />
        </linearGradient>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="moonGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Horizon warm glow */}
      <rect x="0" y="240" width="1440" height="140" fill="url(#horizonGlow)" />

      {/* Water / reflection */}
      <rect x="0" y="345" width="1440" height="35" fill="url(#water)" opacity="0.55" />
      <line x1="80" y1="358" x2="380" y2="358" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
      <line x1="420" y1="365" x2="820" y2="365" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <line x1="880" y1="355" x2="1200" y2="355" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
      <line x1="1220" y1="362" x2="1420" y2="362" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

      {/* Moon / light orb — top right */}
      <circle cx="1080" cy="38" r="22" fill="rgba(246,231,188,0.18)" />
      <circle cx="1080" cy="38" r="14" fill="rgba(246,231,188,0.38)" />
      <circle cx="1080" cy="38" r="8" fill="rgba(246,231,188,0.75)" filter="url(#moonGlow)" />

      {/* Birds */}
      <path d="M310 50 Q315 44 320 50" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <path d="M330 38 Q336 32 342 38" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
      <path d="M680 32 Q685 26 690 32" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none" />
      <path d="M702 46 Q707 40 712 46" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" fill="none" />
      <path d="M910 40 Q916 34 922 40" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
      <path d="M1140 28 Q1145 22 1150 28" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />

      {/* ══ LAYER 1: Distant hazy silhouette ══ */}
      <rect x="0" y="230" width="38" height="150" fill="url(#farBldg)" rx="2" opacity="0.45" />
      <rect x="42" y="210" width="30" height="170" fill="url(#farBldg)" rx="2" opacity="0.4" />
      <rect x="76" y="222" width="24" height="158" fill="url(#farBldg)" rx="2" opacity="0.38" />
      <rect x="104" y="200" width="42" height="180" fill="url(#farBldg)" rx="2" opacity="0.45" />
      <rect x="150" y="212" width="32" height="168" fill="url(#farBldg)" rx="2" opacity="0.38" />
      <rect x="186" y="192" width="26" height="188" fill="url(#farBldg)" rx="2" opacity="0.42" />
      <rect x="216" y="218" width="40" height="162" fill="url(#farBldg)" rx="2" opacity="0.38" />

      <rect x="590" y="196" width="34" height="184" fill="url(#farBldg)" rx="2" opacity="0.38" />
      <rect x="628" y="180" width="28" height="200" fill="url(#farBldg)" rx="2" opacity="0.42" />
      <rect x="660" y="205" width="42" height="175" fill="url(#farBldg)" rx="2" opacity="0.35" />

      <rect x="1210" y="208" width="36" height="172" fill="url(#farBldg)" rx="2" opacity="0.38" />
      <rect x="1250" y="190" width="30" height="190" fill="url(#farBldg)" rx="2" opacity="0.42" />
      <rect x="1284" y="218" width="46" height="162" fill="url(#farBldg)" rx="2" opacity="0.35" />
      <rect x="1334" y="198" width="32" height="182" fill="url(#farBldg)" rx="2" opacity="0.4" />
      <rect x="1370" y="215" width="46" height="165" fill="url(#farBldg)" rx="2" opacity="0.32" />
      <rect x="1420" y="225" width="20" height="155" fill="url(#farBldg)" rx="2" opacity="0.28" />

      {/* ══ LAYER 2: Mid-ground skyline ══ */}

      {/* Left suspension bridge */}
      <rect x="34" y="128" width="16" height="252" fill="rgba(246,200,130,0.72)" rx="2" />
      <rect x="88" y="128" width="16" height="252" fill="rgba(246,200,130,0.72)" rx="2" />
      <rect x="0" y="270" width="150" height="8" fill="rgba(246,200,130,0.6)" rx="3" />
      <line x1="42" y1="131" x2="0" y2="270" stroke="rgba(246,200,130,0.5)" strokeWidth="1.5" />
      <line x1="42" y1="131" x2="150" y2="270" stroke="rgba(246,200,130,0.5)" strokeWidth="1.5" />
      <line x1="96" y1="131" x2="0" y2="270" stroke="rgba(246,200,130,0.5)" strokeWidth="1.5" />
      <line x1="96" y1="131" x2="150" y2="270" stroke="rgba(246,200,130,0.5)" strokeWidth="1.5" />
      {[18, 32, 48, 64, 80, 96, 112, 130].map((x, i) => (
        <line key={`hl${i}`} x1={x} y1="267" x2={x} y2="270" stroke="rgba(246,200,130,0.3)" strokeWidth="1" />
      ))}

      {/* Left cluster */}
      <rect x="158" y="158" width="56" height="222" fill="url(#warmBldg)" rx="4" />
      <rect x="165" y="138" width="18" height="24" fill="rgba(246,200,130,0.7)" rx="2" />
      {[0, 1, 2, 3, 4].map(r => [0, 1, 2].map(c => (
        <rect key={`w1${r}${c}`} x={165 + c * 16} y={166 + r * 24} width="10" height="8"
          fill="rgba(255,248,200,0.45)" rx="1" filter="url(#glow)" />
      )))}

      <rect x="220" y="132" width="48" height="248" fill="url(#midBldg)" rx="4" />
      <rect x="228" y="112" width="14" height="24" fill="rgba(10,196,224,0.85)" rx="2" />
      {[0, 1, 2, 3, 4, 5].map(r => [0, 1].map(c => (
        <rect key={`w2${r}${c}`} x={228 + c * 20} y={140 + r * 24} width="11" height="8"
          fill="rgba(255,255,255,0.28)" rx="1" />
      )))}

      <rect x="274" y="168" width="40" height="212" fill="url(#midBldg)" rx="3" opacity="0.85" />
      <rect x="320" y="148" width="52" height="232" fill="url(#warmBldg)" rx="4" />
      {[0, 1, 2, 3].map(r => [0, 1, 2].map(c => (
        <rect key={`w3${r}${c}`} x={327 + c * 15} y={156 + r * 26} width="9" height="8"
          fill="rgba(255,240,180,0.42)" rx="1" />
      )))}

      {/* ── HERO TOWER LEFT ── */}
      <rect x="380" y="65" width="54" height="315" fill="url(#heroTower)" rx="5" />
      {/* Setback crown */}
      <rect x="388" y="50" width="38" height="18" fill="rgba(246,231,188,0.92)" rx="3" />
      <rect x="394" y="35" width="26" height="17" fill="rgba(10,196,224,0.95)" rx="2" />
      <rect x="400" y="22" width="14" height="14" fill="rgba(246,231,188,1)" rx="2" />
      <line x1="407" y1="22" x2="407" y2="4" stroke="rgba(246,231,188,0.9)" strokeWidth="2" />
      <circle cx="407" cy="4" r="3.5" fill="rgba(246,231,188,1)" filter="url(#glow)" />
      {/* Glass facade stripes */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(r => (
        <rect key={`hf${r}`} x={380} y={72 + r * 20} width="54" height="2"
          fill="rgba(255,255,255,0.07)" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => [0, 1, 2].map(c => (
        <rect key={`hw${r}${c}`}
          x={386 + c * 17} y={74 + r * 24} width="11" height="9"
          fill={r % 4 === 0 ? "rgba(246,231,188,0.65)" : "rgba(255,255,255,0.22)"}
          rx="1" filter={r % 4 === 0 ? "url(#glow)" : undefined} />
      )))}

      {/* Stepped adjacent tower */}
      <rect x="442" y="108" width="50" height="272" fill="url(#midBldg)" rx="4" />
      <rect x="447" y="92" width="40" height="18" fill="rgba(10,196,224,0.75)" rx="3" />
      <rect x="452" y="76" width="30" height="18" fill="rgba(10,196,224,0.65)" rx="2" />
      <rect x="458" y="62" width="20" height="16" fill="rgba(10,196,224,0.55)" rx="2" />
      {[0, 1, 2, 3, 4, 5, 6].map(r => [0, 1, 2].map(c => (
        <rect key={`tw${r}${c}`} x={449 + c * 15} y={116 + r * 24} width="10" height="8"
          fill="rgba(255,255,255,0.26)" rx="1" />
      )))}

      <rect x="498" y="148" width="44" height="232" fill="url(#warmBldg)" rx="3" />
      {[0, 1, 2, 3, 4].map(r => [0, 1].map(c => (
        <rect key={`ww${r}${c}`} x={505 + c * 20} y={156 + r * 26} width="10" height="8"
          fill="rgba(255,240,180,0.42)" rx="1" />
      )))}

      <rect x="548" y="122" width="58" height="258" fill="url(#midBldg)" rx="4" opacity="0.92" />
      <rect x="554" y="104" width="46" height="20" fill="rgba(9,146,194,0.82)" rx="3" />
      <rect x="560" y="88" width="34" height="18" fill="rgba(9,146,194,0.72)" rx="2" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(r => (
        <rect key={`gs${r}`} x={548} y={130 + r * 19} width="58" height="2"
          fill="rgba(255,255,255,0.06)" />
      ))}
      {[0, 1, 2, 3, 4, 5].map(r => [0, 1, 2, 3].map(c => (
        <rect key={`mw${r}${c}`} x={555 + c * 13} y={134 + r * 26} width="9" height="9"
          fill="rgba(255,255,255,0.28)" rx="1" />
      )))}

      {/* ── HERO TOWER RIGHT ── */}
      <rect x="714" y="80" width="60" height="300" fill="url(#heroTower)" rx="5" opacity="0.93" />
      <rect x="722" y="64" width="44" height="18" fill="rgba(10,196,224,0.9)" rx="3" />
      <rect x="728" y="48" width="32" height="18" fill="rgba(246,231,188,0.95)" rx="2" />
      <rect x="735" y="34" width="18" height="15" fill="rgba(10,196,224,1)" rx="2" />
      <line x1="744" y1="34" x2="744" y2="14" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
      <circle cx="744" cy="14" r="3.5" fill="rgba(255,255,255,1)" filter="url(#glow)" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => [0, 1, 2, 3].map(c => (
        <rect key={`t2${r}${c}`}
          x={720 + c * 14} y={88 + r * 24} width="10" height="9"
          fill={c === 1 && r % 4 === 0 ? "rgba(246,231,188,0.62)" : "rgba(255,255,255,0.2)"}
          rx="1" filter={c === 1 && r % 4 === 0 ? "url(#glow)" : undefined} />
      )))}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(r => (
        <rect key={`t2f${r}`} x={714} y={88 + r * 20} width="60" height="2"
          fill="rgba(255,255,255,0.06)" />
      ))}

      {/* Right mid cluster */}
      <rect x="780" y="142" width="46" height="238" fill="url(#midBldg)" rx="3" />
      {[0, 1, 2, 3, 4].map(r => [0, 1].map(c => (
        <rect key={`rm${r}${c}`} x={787 + c * 20} y={150 + r * 28} width="11" height="9"
          fill="rgba(255,255,255,0.26)" rx="1" />
      )))}

      <rect x="832" y="112" width="54" height="268" fill="url(#warmBldg)" rx="4" />
      <rect x="839" y="94" width="40" height="20" fill="rgba(246,200,130,0.82)" rx="3" />
      <rect x="845" y="78" width="28" height="18" fill="rgba(246,200,130,0.7)" rx="2" />
      {[0, 1, 2, 3, 4, 5].map(r => [0, 1, 2].map(c => (
        <rect key={`wm2${r}${c}`} x={839 + c * 15} y={120 + r * 26} width="10" height="8"
          fill="rgba(255,240,180,0.4)" rx="1" />
      )))}

      <rect x="892" y="132" width="50" height="248" fill="url(#midBldg)" rx="3" opacity="0.88" />
      {[0, 1, 2, 3, 4, 5].map(r => [0, 1, 2].map(c => (
        <rect key={`mm${r}${c}`} x={899 + c * 14} y={140 + r * 26} width="9" height="8"
          fill="rgba(255,255,255,0.24)" rx="1" />
      )))}

      <rect x="948" y="118" width="56" height="262" fill="url(#midBldg)" rx="4" />
      <rect x="955" y="100" width="42" height="20" fill="rgba(10,196,224,0.8)" rx="3" />
      <rect x="962" y="84" width="28" height="18" fill="rgba(10,196,224,0.7)" rx="2" />
      {[0, 1, 2, 3, 4, 5, 6].map(r => [0, 1, 2, 3].map(c => (
        <rect key={`rs${r}${c}`} x={955 + c * 12} y={126 + r * 24} width="8" height="7"
          fill="rgba(255,255,255,0.25)" rx="1" />
      )))}

      <rect x="1010" y="148" width="46" height="232" fill="url(#warmBldg)" rx="3" opacity="0.85" />
      <rect x="1062" y="128" width="52" height="252" fill="url(#midBldg)" rx="4" opacity="0.86" />
      <rect x="1120" y="158" width="44" height="222" fill="url(#warmBldg)" rx="3" opacity="0.8" />
      <rect x="1170" y="138" width="56" height="242" fill="url(#midBldg)" rx="4" opacity="0.82" />
      {[0, 1, 2, 3, 4].map(r => [0, 1, 2].map(c => (
        <rect key={`rr${r}${c}`} x={1177 + c * 15} y={146 + r * 28} width="10" height="8"
          fill="rgba(255,255,255,0.23)" rx="1" />
      )))}
      <rect x="1232" y="168" width="46" height="212" fill="url(#warmBldg)" rx="3" opacity="0.75" />

      {/* Right suspension bridge */}
      <rect x="1298" y="135" width="16" height="245" fill="rgba(246,200,130,0.72)" rx="2" />
      <rect x="1352" y="135" width="16" height="245" fill="rgba(246,200,130,0.72)" rx="2" />
      <rect x="1284" y="270" width="150" height="8" fill="rgba(246,200,130,0.6)" rx="3" />
      <line x1="1306" y1="138" x2="1284" y2="270" stroke="rgba(246,200,130,0.5)" strokeWidth="1.5" />
      <line x1="1306" y1="138" x2="1434" y2="270" stroke="rgba(246,200,130,0.5)" strokeWidth="1.5" />
      <line x1="1360" y1="138" x2="1284" y2="270" stroke="rgba(246,200,130,0.5)" strokeWidth="1.5" />
      <line x1="1360" y1="138" x2="1434" y2="270" stroke="rgba(246,200,130,0.5)" strokeWidth="1.5" />
      {[1296, 1315, 1332, 1348, 1366, 1384, 1400, 1418].map((x, i) => (
        <line key={`hr${i}`} x1={x} y1="268" x2={x} y2="272" stroke="rgba(246,200,130,0.3)" strokeWidth="1" />
      ))}

      <rect x="1284" y="148" width="50" height="232" fill="url(#midBldg)" rx="4" opacity="0.75" />
      <rect x="1374" y="158" width="44" height="222" fill="url(#warmBldg)" rx="3" opacity="0.7" />
      <rect x="1424" y="175" width="16" height="205" fill="url(#farBldg)" rx="2" opacity="0.55" />

      {/* ══ LAYER 3: Foreground silhouette ══ */}
      <rect x="0" y="258" width="65" height="122" fill="url(#fgBldg)" rx="3" />
      <rect x="68" y="242" width="48" height="138" fill="url(#fgBldg)" rx="3" opacity="0.9" />
      {[0, 1].map(r => [0, 1, 2].map(c => (
        <rect key={`fg1${r}${c}`} x={7 + c * 20} y={268 + r * 24} width="11" height="9"
          fill="rgba(255,255,200,0.35)" rx="1" filter="url(#glow)" />
      )))}
      {[0, 1].map(r => [0, 1].map(c => (
        <rect key={`fg2${r}${c}`} x={75 + c * 20} y={252 + r * 24} width="11" height="9"
          fill="rgba(255,255,200,0.3)" rx="1" filter="url(#glow)" />
      )))}

      <rect x="1376" y="254" width="64" height="126" fill="url(#fgBldg)" rx="3" />
      <rect x="1328" y="240" width="44" height="140" fill="url(#fgBldg)" rx="3" opacity="0.9" />
      {[0, 1].map(r => [0, 1, 2].map(c => (
        <rect key={`fg3${r}${c}`} x={1383 + c * 18} y={264 + r * 24} width="11" height="9"
          fill="rgba(255,255,200,0.35)" rx="1" filter="url(#glow)" />
      )))}

      {/* Ground line */}
      <rect x="0" y="377" width="1440" height="3" fill="rgba(11,45,114,0.3)" />
    </svg>
  );
}

// Scroll-reveal wrapper
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
  const [user, setUser] = useState(null);
  const [roleTab, setRoleTab] = useState('tenant');
  const [query, setQuery] = useState('');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Mouse offset — applied to INNER div only
  // OUTER div carries the CSS float animation; INNER div carries the mouse translateX/Y.
  // They MUST be separate elements — CSS animation owns the full `transform` property
  // on whatever element it runs on, silently overriding any inline style on that same element.
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const tenantBtnRef = useRef(null);
  const landlordBtnRef = useRef(null);
  const heroRef = useRef(null);
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

  const handleHeroMouseMove = useCallback((e) => {
    if (window.innerWidth < 768) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const hero = heroRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setMouseOffset({ x: normX * 12, y: normY * 6 });
  }, []);

  const handleHeroMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
  }, []);

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
          ref={heroRef}
          className="relative min-h-[90vh] overflow-hidden flex flex-col"
          style={{ background: 'linear-gradient(135deg, #F6C87A 0%, #0AC4E0 38%, #0992C2 60%, #0B2D72 100%)' }}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
        >
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 20% 30%, rgba(246,231,188,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 10%, rgba(10,196,224,0.25) 0%, transparent 55%)' }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 pb-52 pt-28 text-center">
            <h1 className="text-hero text-white drop-shadow-sm"
              style={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}
            >
              Renting Done Right. Finally.
            </h1>

            <div className="mt-10 w-full max-w-2xl">
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-3 rounded-3xl bg-white/95 px-5 py-3.5 shadow-2xl shadow-[#0B2D72]/30 backdrop-blur"
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

          {/*
            ── Two-div cityscape trick ──────────────────────────────────
            OUTER  → `cityscape-float` CSS class (CSS @keyframes controls translateY)
            INNER  → inline style (JS-driven translateX + translateY from mouse)

            Why two divs? CSS animations claim full ownership of the `transform`
            property on whatever element they run on, overriding any inline style
            set on that same element. Splitting onto two wrappers lets each
            transform axis be controlled by the right system independently.
          */}
          <div className="absolute inset-x-0 bottom-0 h-[24rem] pointer-events-none cityscape-float">
            <div
              style={{
                width: '100%',
                height: '100%',
                transform: `translateX(${mouseOffset.x}px) translateY(${mouseOffset.y}px)`,
                transition: 'transform 0.35s ease-out',
              }}
            >
              <CityscapeSVG />
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

        {/* ── CTA ────────────────────────────────────────────────── */}
        <MotionRevealSection className="py-16 bg-white">
          {!user && (
            <section className="relative overflow-hidden px-6 py-24 text-center"
              style={{ background: 'linear-gradient(135deg, #F6C87A 0%, #0AC4E0 45%, #0992C2 70%, #0B2D72 100%)' }}>
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
            <section className="relative overflow-hidden px-6 py-24 text-center"
              style={{ background: 'linear-gradient(135deg, #F8FBFC 0%, #0AC4E0 35%, #0992C2 65%, #0B2D72 100%)' }}>
              <div className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.45) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(246,231,188,0.2) 0%, transparent 40%)' }}
              />
              <div className="relative mx-auto max-w-2xl space-y-6">
                <h2 className="text-h2 text-white">Welcome back, {user.name?.split(' ')[0]}.</h2>
                <p className="mx-auto max-w-md text-[1.05rem] leading-relaxed text-white/85">
                  Continue where you left off — your applications, leases, and payments are already synced.
                </p>
                <div className="mt-8 flex justify-center">
                  <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-[0.85rem] font-bold text-[#0992C2] shadow-md shadow-black/10 transition-all hover:scale-105 hover:shadow-lg">
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