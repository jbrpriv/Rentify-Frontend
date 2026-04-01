'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  MapPin, Bed, Bath, SquareCode, ShieldCheck, ArrowLeft,
  Loader2, FileText, ChevronLeft, ChevronRight,
  CheckCircle, Eye, Clock, Heart, PawPrint,
  Tag, ArrowRight, TrendingDown, TrendingUp, X,
} from 'lucide-react';
import { MotionFadeIn } from '@/components/ui/Motion';

/* ─── Diff badge ──────────────────────────────────────────────────── */
function DiffBadge({ listed, proposed }) {
  if (!listed || !proposed || Number(proposed) === 0) return null;
  const diff = Number(proposed) - listed;
  const pct = Math.abs(Math.round((diff / listed) * 100));
  if (pct === 0) return <span style={{ fontSize: '0.67rem', color: '#94A3B8' }}>= listed</span>;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.7rem', fontWeight: 700, color: diff < 0 ? '#16A34A' : '#EF4444' }}>
      {diff < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
      {diff < 0 ? '−' : '+'}{pct}%
    </span>
  );
}

/* ─── Photo lightbox ──────────────────────────────────────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const total = images.length;
  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'lbFadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes lbFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes lbImgIn  { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
      `}</style>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 20,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: '1.5px solid rgba(255,255,255,0.25)',
          color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontWeight: 600 }}>
        {idx + 1} / {total}
      </div>

      {/* Prev arrow */}
      {total > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          style={{
            position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
            width: 50, height: 50, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Image */}
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          key={idx}
          src={images[idx]}
          alt={`Photo ${idx + 1}`}
          style={{
            maxWidth: '88vw', maxHeight: '85vh',
            objectFit: 'contain', borderRadius: 12,
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            animation: 'lbImgIn 0.22s cubic-bezier(0.34,1.2,0.64,1)',
          }}
        />
      </div>

      {/* Next arrow */}
      {total > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          style={{
            position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
            width: 50, height: 50, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Thumbnail strip */}
      {total > 1 && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6, padding: '8px 12px',
          background: 'rgba(0,0,0,0.5)', borderRadius: 12,
          backdropFilter: 'blur(8px)', maxWidth: '80vw', overflowX: 'auto',
        }}>
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              onClick={e => { e.stopPropagation(); setIdx(i); }}
              style={{
                width: 52, height: 36, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', flexShrink: 0,
                border: i === idx ? '2px solid white' : '2px solid transparent',
                opacity: i === idx ? 1 : 0.55,
                transition: 'all .15s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Offer form ──────────────────────────────────────────────────── */
function OfferForm({ listing, user, router, listingId }) {
  const { formatMoney, currency, convertToUSD } = useCurrency();
  const defaultDuration = String(listing.leaseTerms?.defaultDurationMonths || 12);
  const [form, setForm] = useState({ monthlyRent: '', securityDeposit: '', leaseDurationMonths: defaultDuration });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const fields = [
    { key: 'monthlyRent', label: 'Monthly Rent', prefix: currency, listedVal: listing.financials?.monthlyRent },
    { key: 'securityDeposit', label: 'Security Deposit', prefix: currency, listedVal: listing.financials?.securityDeposit },
    { key: 'leaseDurationMonths', label: 'Lease Duration', prefix: 'mo', listedVal: listing.leaseTerms?.defaultDurationMonths || 12 },
  ];

  const handleSubmit = async () => {
    if (!user) { router.push(`/login?redirect=/browse/${listingId}`); return; }
    if (!form.monthlyRent || !form.securityDeposit || !form.leaseDurationMonths) {
      setError('Please fill in all three fields.'); return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/offers', {
        propertyId: listingId,
        monthlyRent: convertToUSD(Number(form.monthlyRent)),
        securityDeposit: convertToUSD(Number(form.securityDeposit)),
        leaseDurationMonths: Number(form.leaseDurationMonths),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit offer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div style={{ padding: '20px', background: '#F0FDF4', borderRadius: 14, border: '1px solid #BBF7D0', textAlign: 'center' }}>
      <CheckCircle size={28} style={{ color: '#16A34A', margin: '0 auto 10px' }} />
      <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#15803D', fontSize: '1rem', marginBottom: 6 }}>Offer Submitted!</p>
      <p style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.55, marginBottom: 14 }}>
        The landlord will review and respond. Track it in your Offers tab.
      </p>
      <a href="/dashboard/offers" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#16A34A', color: 'white', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
        View My Offers <ArrowRight size={13} />
      </a>
    </div>
  );

  return (
    <div style={{ padding: '0 20px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingTop: 4 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Tag size={15} color="#7C3AED" />
        </div>
        <div>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.92rem', color: '#0F172A', lineHeight: 1 }}>Make an Offer</p>
          <p style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Enter your proposed terms — no message needed</p>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fields.map(({ key, label, prefix, listedVal }) => (
          <div key={key} style={{ background: '#F8FAFC', borderRadius: 11, padding: '11px 13px', border: '1px solid #E8EAF0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
              <span style={{ fontSize: '0.66rem', color: '#64748B', background: 'white', border: '1px solid #E2E8F0', borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap' }}>
                Landlord: <strong style={{ color: '#0F172A' }}>{prefix === 'mo' ? `${listedVal} mo` : formatMoney(listedVal)}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', pointerEvents: 'none' }}>
                  {prefix}
                </span>
                <input
                  type="number" min={0} value={form[key]} onChange={set(key)}
                  placeholder={String(listedVal)}
                  style={{ width: '100%', padding: `9px 10px 9px ${prefix === 'mo' ? 36 : 40}px`, border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box', background: 'white', color: '#0F172A', transition: 'border-color .15s' }}
                  onFocus={e => e.target.style.borderColor = '#7C3AED'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
              {form[key] && prefix !== 'mo' && <DiffBadge listed={listedVal} proposed={form[key]} />}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p style={{ marginTop: 8, fontSize: '0.78rem', color: '#DC2626', background: '#FFF7F7', border: '1px solid #FECACA', borderRadius: 7, padding: '7px 11px' }}>{error}</p>
      )}

      {!user && (
        <p style={{ marginTop: 8, fontSize: '0.76rem', color: '#64748B', textAlign: 'center' }}>
          <a href={`/login?redirect=/browse/${listingId}`} style={{ color: '#7C3AED', fontWeight: 700 }}>Log in</a> to submit your offer
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%', marginTop: 12, padding: '12px 0',
          background: submitting ? '#C4B5FD' : 'linear-gradient(135deg,#5B21B6,#7C3AED)',
          color: 'white', border: 'none', borderRadius: 11,
          fontSize: '0.9rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: "'Outfit',sans-serif", transition: 'opacity .2s',
        }}
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Tag size={16} />}
        {submitting ? 'Submitting…' : user ? 'Submit Offer' : 'Login to Offer'}
      </button>
    </div>
  );
}

/* ─── Main content ────────────────────────────────────────────────── */
function ListingDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { formatMoney } = useCurrency();
  const isViewOnly = searchParams.get('viewOnly') === 'true';

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const [saved, setSaved] = useState(false);
  const [hasExistingOffer, setHasExistingOffer] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        setListing(data);

        // Check for existing offer
        if (user?.role === 'tenant') {
          try {
            const offerResp = await api.get(`/offers?propertyId=${id}`);
            const myOffers = (offerResp.data?.offers || []).filter(o => ['pending', 'countered', 'accepted'].includes(o.status));
            if (myOffers.length > 0) setHasExistingOffer(true);
          } catch { /* silent */ }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const openLightbox = (i) => { setLightboxStart(i); setLightboxOpen(true); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8" style={{ color: '#7C3AED' }} />
    </div>
  );
  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 font-medium text-lg">Listing not found.</p>
    </div>
  );

  const images = listing.images?.length ? listing.images : [];
  const heroImg = images[activeImage] || null;
  const rent = listing.financials?.monthlyRent;
  const deposit = listing.financials?.securityDeposit;
  const address = [listing.address?.street, listing.address?.city, listing.address?.state].filter(Boolean).join(', ');
  const listedDate = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : '—';

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Properties', href: '/browse' },
    { label: listing.address?.city || 'City', href: `/browse?city=${listing.address?.city}` },
    { label: listing.title, href: null },
  ];

  const showOfferForm = !isViewOnly && user?.role === 'tenant' && !hasExistingOffer;
  const showActiveOffer = !isViewOnly && user?.role === 'tenant' && hasExistingOffer;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');
        *, body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .hero-wrapper { position:relative; width:100%; min-height:480px; overflow:hidden; display:flex; flex-direction:column; justify-content:flex-end; }
        .hero-bg-img  { position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0; }
        .hero-overlay { position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,.45) 0%,rgba(15,23,42,.72) 100%);z-index:1; }
        .hero-content { position:relative;z-index:2; }
        .stat-chip    { display:flex;flex-direction:column;align-items:center;gap:3px; }
        .stat-val     { color:white;font-weight:700;font-size:1.1rem;line-height:1;font-family:'Outfit',sans-serif; }
        .stat-label   { color:rgba(255,255,255,.55);font-size:.67rem;text-transform:uppercase;letter-spacing:.05em;font-weight:600; }
        .sticky-panel { background:white;border:1px solid #E2E8F0;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(15,23,42,.1);position:sticky;top:88px; }
        .tour-date-btn { padding:10px 14px;border-radius:12px;border:1.5px solid #E2E8F0;cursor:pointer;text-align:center;transition:all .2s;background:white;flex:1; }
        .tour-date-btn:hover { border-color:#7C3AED; }
        .tour-date-btn.sel   { border-color:#7C3AED;box-shadow:0 0 0 3px rgba(124,58,237,.12); }
        .photo-thumb { cursor:pointer;border-radius:10px;overflow:hidden;transition:transform .2s,opacity .2s; }
        .photo-thumb:hover { transform:scale(1.03);opacity:.88; }
        .info-card { background:white;border:1px solid #E2E8F0;border-radius:16px;padding:24px; }
        .section-title { font-family:'Outfit',sans-serif;font-weight:700;font-size:1.1rem;color:#0F172A;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #F1F5F9; }
        .amenity-chip  { display:inline-flex;align-items:center;gap:6px;background:#F5F3FF;border:1px solid #DDD6FE;color:#5B21B6;border-radius:8px;padding:6px 12px;font-size:.8rem;font-weight:600; }
      `}</style>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <Lightbox images={images} startIndex={lightboxStart} onClose={() => setLightboxOpen(false)} />
      )}

      <MotionFadeIn y={16} delay={0.05}>
        <main className="flex-grow pt-16 bg-[#F7FAF0]">

          {/* ── HERO ─────────────────────────────────────────── */}
          <div className="hero-wrapper" style={{ minHeight: heroImg ? 480 : 340 }}>
            {heroImg
              ? <img src={heroImg} alt="Property" className="hero-bg-img" />
              : <div className="hero-bg-img" style={{ background: 'linear-gradient(135deg,#1E1B4B,#4C1D95)' }} />
            }
            <div className="hero-overlay" />

            <button onClick={() => router.back()}
              className="hero-content absolute top-20 left-4 sm:left-8 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
              style={{ zIndex: 3 }}>
              <ArrowLeft size={16} /> Back
            </button>

            <div className="hero-content w-full px-4 sm:px-8 pb-8">
              <div className="max-w-6xl mx-auto">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-1 mb-4">
                  {breadcrumbs.map((b, i) => (
                    <span key={i} className="flex items-center">
                      {i > 0 && <span style={{ color: 'rgba(255,255,255,.4)', margin: '0 5px', fontSize: '0.75rem' }}>›</span>}
                      {b.href && i < breadcrumbs.length - 1
                        ? <a href={b.href} style={{ color: 'rgba(255,255,255,.65)', fontSize: '0.75rem', fontWeight: 500 }}>{b.label}</a>
                        : <span style={{ color: 'rgba(255,255,255,.9)', fontSize: '0.75rem', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{b.label}</span>
                      }
                    </span>
                  ))}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                  <div className="flex-1">
                    <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', color: 'white', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-0.02em' }}>
                      {listing.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="stat-chip"><Bed size={17} style={{ color: 'rgba(255,255,255,.7)' }} /><span className="stat-val">{listing.specs?.bedrooms ?? '—'}</span><span className="stat-label">Beds</span></div>
                      <div className="stat-chip"><Bath size={17} style={{ color: 'rgba(255,255,255,.7)' }} /><span className="stat-val">{listing.specs?.bathrooms ?? '—'}</span><span className="stat-label">Baths</span></div>
                      <div className="stat-chip"><SquareCode size={17} style={{ color: 'rgba(255,255,255,.7)' }} /><span className="stat-val">{listing.specs?.sizeSqFt || '—'}</span><span className="stat-label">Sq Ft</span></div>
                      <div className="stat-chip"><PawPrint size={17} style={{ color: 'rgba(255,255,255,.7)' }} /><span className="stat-val" style={{ fontSize: '0.82rem' }}>{listing.amenities?.includes('pets allowed') ? 'Pets OK' : 'No Pets'}</span><span className="stat-label">Policy</span></div>
                      <div className="stat-chip"><ShieldCheck size={17} style={{ color: 'rgba(255,255,255,.7)' }} /><span className="stat-val" style={{ fontSize: '0.82rem' }}>{deposit ? formatMoney(deposit) : '—'}</span><span className="stat-label">Deposit</span></div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.2)', color: 'white', borderRadius: 40, padding: '8px 20px', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-end' }}>
                    <MapPin size={13} style={{ color: 'rgba(255,255,255,.7)', flexShrink: 0 }} />{address}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── MAIN ─────────────────────────────────────────── */}
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

              {/* LEFT */}
              <div className="lg:col-span-2 space-y-5">

                {/* ── Photo gallery ── */}
                {images.length > 0 && (
                  <div className="info-card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <p className="section-title" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none', fontSize: '0.85rem' }}>
                        Photos <span style={{ color: '#94A3B8', fontWeight: 500 }}>({images.length})</span>
                      </p>
                      <button onClick={() => openLightbox(0)} style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={13} /> View all
                      </button>
                    </div>
                    {/* Main photo */}
                    <div
                      className="photo-thumb"
                      style={{ width: '100%', height: 240, marginBottom: 8, overflow: 'hidden' }}
                      onClick={() => openLightbox(activeImage)}
                    >
                      <img src={images[activeImage]} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                    </div>
                    {/* Thumbnails row */}
                    {images.length > 1 && (
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)`, gap: 6 }}>
                        {images.slice(0, 5).map((img, i) => (
                          <div
                            key={i}
                            className="photo-thumb"
                            onClick={() => { setActiveImage(i); openLightbox(i); }}
                            style={{ height: 72, position: 'relative' }}
                          >
                            <img src={img} alt={`Thumb ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, display: 'block', border: i === activeImage ? '2.5px solid #7C3AED' : '2.5px solid transparent' }} />
                            {i === 4 && images.length > 5 && (
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', fontFamily: "'Outfit',sans-serif" }}>
                                +{images.length - 5}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {listing.listingDescription && (
                  <div className="info-card">
                    <p className="section-title">About This Property</p>
                    <p style={{ color: '#475569', lineHeight: 1.75, fontSize: '0.9rem' }}>{listing.listingDescription}</p>
                  </div>
                )}

                {/* Financials */}
                <div className="info-card">
                  <p className="section-title">Financial Details</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Monthly Rent', value: formatMoney(rent), color: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE' },
                      { label: 'Security Deposit', value: formatMoney(deposit), color: '#0F172A', bg: '#F8FAFC', border: '#E2E8F0' },
                      { label: 'Maintenance Fee', value: formatMoney(listing.financials?.maintenanceFee), color: '#0F172A', bg: '#F8FAFC', border: '#E2E8F0' },
                    ].map(f => (
                      <div key={f.label} style={{ background: f.bg, border: `1px solid ${f.border}`, borderRadius: 12, padding: '14px 16px' }}>
                        <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{f.label}</p>
                        <p style={{ color: f.color, fontWeight: 800, fontSize: '1.1rem', fontFamily: "'Outfit',sans-serif" }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                {listing.amenities?.length > 0 && (
                  <div className="info-card">
                    <p className="section-title">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.map((a, i) => (
                        <span key={i} className="amenity-chip"><CheckCircle size={13} /> {a}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Listed by */}
                <div className="info-card">
                  <p className="section-title">Listed By</p>
                  <div className="flex items-center gap-4">
                    <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                      {listing.landlord?.profilePhoto ? (
                        <img src={listing.landlord.profilePhoto} alt={listing.landlord.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#5B21B6,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', fontFamily: "'Outfit',sans-serif" }}>
                          {(listing.landlord?.name || 'L')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{listing.landlord?.name || 'Landlord'}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <ShieldCheck size={13} style={{ color: '#22C55E' }} /><span style={{ color: '#16A34A', fontSize: '0.75rem', fontWeight: 600 }}>Verified Landlord</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — sticky panel */}
              <div>
                <div className="sticky-panel">
                  {/* Price header */}
                  <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Eye size={13} style={{ color: '#94A3B8' }} />
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{listing.views || 0} views</span>
                        <span style={{ color: '#E2E8F0' }}>·</span>
                        <Clock size={13} style={{ color: '#94A3B8' }} />
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Listed {listedDate}</span>
                      </div>
                      <button onClick={() => setSaved(!saved)} style={{ display: 'flex', alignItems: 'center', gap: 5, color: saved ? '#EF4444' : '#94A3B8', fontWeight: 600, fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'color .2s' }}>
                        <Heart size={14} fill={saved ? '#EF4444' : 'none'} /> {saved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Monthly Rent</p>
                      <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '2rem', color: '#0F172A', lineHeight: 1 }}>{rent ? formatMoney(rent) : '—'}</p>
                      <p style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, marginTop: 4 }}>Available Now</p>
                    </div>
                  </div>

                  {/* Offer / status area */}
                  {isViewOnly ? (
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                        <FileText size={20} style={{ color: '#7C3AED', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#5B21B6' }}>You have an active lease for this property.</p>
                      </div>
                    </div>
                  ) : showActiveOffer ? (
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                        <Tag size={22} style={{ color: '#2563EB', margin: '0 auto 8px' }} />
                        <p style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '0.9rem', marginBottom: 6 }}>Offer in Progress</p>
                        <p style={{ fontSize: '0.78rem', color: '#3B82F6', marginBottom: 12 }}>You already have an active offer on this property.</p>
                        <a href="/dashboard/offers" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#2563EB', color: 'white', borderRadius: 9, fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                          Track Offer <ArrowRight size={12} />
                        </a>
                      </div>
                    </div>
                  ) : showOfferForm ? (
                    <OfferForm listing={listing} user={user} router={router} listingId={id} />
                  ) : !user ? (
                    <div style={{ padding: '16px 20px' }}>
                      <a href={`/login?redirect=/browse/${id}`} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        width: '100%', padding: '13px 0',
                        background: 'linear-gradient(135deg,#5B21B6,#7C3AED)',
                        color: 'white', borderRadius: 11, fontSize: '0.9rem', fontWeight: 700,
                        textDecoration: 'none', fontFamily: "'Outfit',sans-serif",
                      }}>
                        <Tag size={16} /> Login to Make an Offer
                      </a>
                    </div>
                  ) : null}

                </div>
              </div>

            </div>
          </div>
        </main>
      </MotionFadeIn>
    </>
  );
}

export default function ListingDetailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF0]">
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow pt-20 flex justify-center items-center">
          <Loader2 className="animate-spin h-8 w-8" style={{ color: '#0992C2' }} />
        </div>
      }>
        <ListingDetailContent />
      </Suspense>
      <Footer />
    </div>
  );
}