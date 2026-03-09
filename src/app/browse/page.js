'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, MapPin, Building2, Bed, Bath, Square,
  Heart, ChevronLeft, ChevronRight, SlidersHorizontal,
  ChevronDown, Home, Star, ArrowUpDown, Tag, Loader2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PRICE_RANGES = [
  { label: 'Any Price', min: '', max: '' },
  { label: 'Under Rs. 30K', min: '', max: '30000' },
  { label: 'Rs. 30K – 60K', min: '30000', max: '60000' },
  { label: 'Rs. 60K – 100K', min: '60000', max: '100000' },
  { label: 'Rs. 100K+', min: '100000', max: '' },
];
const TYPES = ['apartment', 'house', 'studio', 'commercial'];
const BEDS = ['1', '2', '3', '4', '5+'];
const SORTS = ['Best Match', 'Price: Low to High', 'Price: High to Low', 'Newest'];

function PhotoCarousel({ images, title }) {
  const [idx, setIdx] = useState(0);
  const hasMany = images && images.length > 1;
  const src = images?.[idx] || null;
  const prev = (e) => { e.preventDefault(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.preventDefault(); setIdx(i => (i + 1) % images.length); };

  return (
    <div className="relative h-52 select-none overflow-hidden rounded-3xl bg-[#0AC4E0]/10">
      {src
        ? <img src={src} alt={title} className="h-full w-full object-cover transition-opacity duration-300" loading="lazy" />
        : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F6E7BC]/80 to-[#0AC4E0]/30">
          <Building2 className="h-14 w-14 text-white/80" />
        </div>
      }
      <button onClick={e => e.preventDefault()}
        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm transition-all hover:bg-white"
      >
        <Heart size={13} className="text-neutral-400 transition-colors hover:text-red-500" />
      </button>
      {hasMany && (
        <>
          <button onClick={prev}
            className="arrow-btn absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-white"
          >
            <ChevronLeft size={14} className="text-[#0B2D72]" />
          </button>
          <button onClick={next}
            className="arrow-btn absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-white"
          >
            <ChevronRight size={14} className="text-[#0B2D72]" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.slice(0, 5).map((_, i) => (
              <button key={i} onClick={e => { e.preventDefault(); setIdx(i); }}
                className={`h-1 rounded-full transition-all ${i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Dropdown({ label, options, value, onChange, wide }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all whitespace-nowrap
          ${open ? 'border-[#0992C2] bg-[#0992C2]/10 text-[#0B2D72]' : 'border-gray-200 bg-white text-gray-700 hover:border-[#0992C2]/30 hover:bg-[#F0F8FA]'}`}>
        {label} <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden ${wide ? 'w-52' : 'w-44'}`}>
          {options.map(opt => (
            <button key={opt.value ?? opt} onClick={() => { onChange(opt.value ?? opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#0992C2]/10 hover:text-[#0B2D72] transition-colors font-medium
                ${(opt.value ?? opt) === value ? 'bg-[#0992C2]/10 text-[#0B2D72]' : 'text-gray-700'}`}>
              {opt.label ?? opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('Best Match');
  const [city, setCity] = useState(searchParams?.get('city') || '');
  const [type, setType] = useState('');
  const [priceKey, setPriceKey] = useState('Any Price');
  const [beds, setBeds] = useState('');
  const [searchInput, setSearchInput] = useState(searchParams?.get('city') || '');

  const selectedPrice = PRICE_RANGES.find(r => r.label === priceKey) || PRICE_RANGES[0];

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (type) params.append('type', type);
      if (selectedPrice.min) params.append('minRent', selectedPrice.min);
      if (selectedPrice.max) params.append('maxRent', selectedPrice.max);
      if (beds) params.append('minBeds', parseInt(beds));
      if (sort === 'Price: Low to High') params.append('sort', 'price_asc');
      else if (sort === 'Price: High to Low') params.append('sort', 'price_desc');
      else if (sort === 'Newest') params.append('sort', 'newest');

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      let arr = Array.isArray(data) ? data : [];

      setListings(arr);
      setTotal(arr.length);
    } catch { setListings([]); }
    finally { setLoading(false); }
  }, [city, type, priceKey, beds, sort]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FBFC]">
      <Navbar />
      <div className="h-20" />

      {/* Filter bar */}
      <div className="sticky top-20 z-40 border-b border-[#0992C2]/15 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <form
            onSubmit={e => {
              e.preventDefault();
              const term = searchInput.trim();
              setCity(term);
              if (term) {
                const url = new URL(window.location);
                url.searchParams.set('city', term);
                window.history.replaceState(null, '', url.pathname + url.search);
              } else {
                window.history.replaceState(null, '', '/browse');
              }
            }}
            className="flex max-w-xs flex-1 items-center gap-2 rounded-2xl border border-transparent bg-[#0AC4E0]/10 px-3 py-2.5 transition-colors focus-within:border-[#0992C2] focus-within:bg-white"
          >
            <Search size={15} className="flex-shrink-0 text-[#0992C2]" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="City or address…"
              className="min-w-0 flex-1 bg-transparent py-0 text-sm text-neutral-700 outline-none placeholder:text-neutral-400" />
          </form>
          <Dropdown label={priceKey === 'Any Price' ? 'Price' : priceKey} value={priceKey} onChange={setPriceKey} wide options={PRICE_RANGES.map(r => ({ label: r.label, value: r.label }))} />
          <Dropdown label={type ? type[0].toUpperCase() + type.slice(1) : 'Type'} value={type} onChange={setType} options={[{ label: 'All Types', value: '' }, ...TYPES.map(t => ({ label: t[0].toUpperCase() + t.slice(1), value: t }))]} />
          <Dropdown label={beds ? `${beds} Beds` : 'Beds'} value={beds} onChange={setBeds} options={[{ label: 'Any Beds', value: '' }, ...BEDS.map(b => ({ label: `${b} bed${b === '1' ? '' : 's'}`, value: b }))]} />
          <div className="ml-auto flex items-center gap-4 flex-shrink-0">
            {!loading && <p className="whitespace-nowrap text-sm font-medium text-neutral-500"><span className="font-bold text-neutral-900">{total.toLocaleString()}</span> listings</p>}
            <Dropdown label={<span className="flex items-center gap-1.5"><ArrowUpDown size={13} /> {sort}</span>} value={sort} onChange={setSort} wide options={SORTS.map(s => ({ label: s, value: s }))} />
          </div>
        </div>
      </div>

      <main className="flex-grow">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-[1.15rem] font-semibold capitalize text-neutral-900">
              {city ? `${city} properties for rent` : 'All properties for rent'}
            </h1>
          </div>

          {loading && (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <div className="h-52 animate-pulse bg-[#0AC4E0]/10" />
                  <div className="space-y-2.5 p-4">
                    <div className="h-5 w-1/2 rounded-lg bg-[#0992C2]/15" />
                    <div className="h-3.5 w-3/4 rounded bg-[#0992C2]/10" />
                    <div className="h-3.5 w-2/3 rounded bg-[#0992C2]/10" />
                    <div className="mt-3 h-8 rounded-xl bg-[#0AC4E0]/15" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="py-28 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#0AC4E0]/10">
                <Home className="h-10 w-10 text-[#0992C2]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-800">No listings found</h3>
              <p className="text-sm text-neutral-500">Try adjusting your filters or search a different city</p>
              <button onClick={() => {
                setCity(''); setSearchInput(''); setType(''); setPriceKey('Any Price'); setBeds('');
                window.history.replaceState(null, '', '/browse');
                fetchListings(); // Force Cypress mock reload intercept immediately
              }}
                className="mt-6 rounded-full bg-[#0992C2] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0B2D72]">
                Clear Filters
              </button>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {listings.map(listing => (
                <Link
                  key={listing._id}
                  href={`/browse/${listing._id}`}
                  className="group block overflow-hidden rounded-3xl border border-[#0992C2]/20 bg-white/95 shadow-[0_8px_26px_rgba(11,45,114,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.2,0.64,1)] hover:-translate-y-2 hover:shadow-[0_22px_70px_rgba(11,45,114,0.25)]"
                >
                  <PhotoCarousel images={listing.images} title={listing.title} />
                  <div className="p-3.5">
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[1.1rem] font-semibold text-neutral-900 line-clamp-1" title={listing.title}>
                          {listing.title}
                        </span>
                        <span className="text-[0.95rem] font-bold text-[#0992C2]">
                          Rs. {(listing.financials?.monthlyRent || 0).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={e => e.preventDefault()}
                        className="mt-1 self-start flex h-7 w-7 items-center justify-center rounded-full border border-[#0992C2]/20 text-neutral-400 transition-colors hover:border-red-300 hover:text-red-500"
                      >
                        <Heart size={13} />
                      </button>
                    </div>
                    <div className="mb-1.5 flex items-center gap-3 text-[11px] font-semibold text-neutral-500">
                      {listing.specs?.bedrooms != null && <span className="flex items-center gap-1"><Bed size={11} className="text-neutral-400" /> {listing.specs.bedrooms}</span>}
                      {listing.specs?.bathrooms != null && <span className="flex items-center gap-1"><Bath size={11} className="text-neutral-400" /> {listing.specs.bathrooms}</span>}
                      {listing.specs?.sizeSqFt && <span className="flex items-center gap-1"><Square size={11} className="text-neutral-400" /> {listing.specs.sizeSqFt} sq ft</span>}
                      {!listing.specs?.bedrooms && !listing.specs?.bathrooms && !listing.specs?.sizeSqFt && (
                        <span className="capitalize text-[#0992C2]">{listing.type}</span>
                      )}
                    </div>
                    <p className="mb-3 flex items-start gap-1 text-[11px] font-medium leading-snug text-neutral-400">
                      <MapPin size={10} className="mt-0.5 flex-shrink-0 text-neutral-300" />
                      {[listing.address?.street, listing.address?.city, listing.address?.state].filter(Boolean).join(', ')}
                    </p>
                    <div
                      onClick={e => e.stopPropagation()}
                      className="flex w-full items-center justify-center gap-2 rounded-full border border-[#0992C2]/30 bg-white px-4 py-2 text-[0.8rem] font-semibold text-[#0992C2] transition-all hover:bg-[#0992C2] hover:text-white"
                    >
                      <Tag size={13} />
                      View
                    </div>
                  </div>
                </Link>
              ))}

              {listings.length >= 4 && (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-[#0992C2] via-[#0AC4E0] to-[#F6E7BC] p-6 text-center text-white shadow-[0_22px_70px_rgba(11,45,114,0.3)]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Star size={20} className="text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">Discover more</h3>
                  <p className="mb-5 text-xs leading-relaxed text-white/90">
                    Quality properties — curated, verified, and always in sync with your filters.
                  </p>
                  <Link
                    href="/register"
                    className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#0B2D72] transition-all hover:bg-[#F6E7BC]"
                  >
                    Save this search
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-[#F8FBFC]">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0992C2]" />
        </div>
        <Footer />
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}