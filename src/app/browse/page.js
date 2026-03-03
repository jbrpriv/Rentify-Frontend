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
  { label: 'Any Price',      min: '',      max: ''      },
  { label: 'Under Rs. 30K',  min: '',      max: '30000' },
  { label: 'Rs. 30K – 60K',  min: '30000', max: '60000' },
  { label: 'Rs. 60K – 100K', min: '60000', max: '100000'},
  { label: 'Rs. 100K+',      min: '100000',max: ''      },
];
const TYPES = ['apartment','house','studio','commercial'];
const BEDS  = ['1','2','3','4','5+'];
const SORTS = ['Best Match','Price: Low to High','Price: High to Low','Newest'];

function PhotoCarousel({ images, title }) {
  const [idx, setIdx] = useState(0);
  const hasMany = images && images.length > 1;
  const src = images?.[idx] || null;
  const prev = (e) => { e.preventDefault(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.preventDefault(); setIdx(i => (i + 1) % images.length); };

  return (
    <div className="relative h-52 bg-gray-100 overflow-hidden select-none">
      {src
        ? <img src={src} alt={title} className="w-full h-full object-cover transition-opacity duration-300" loading="lazy"/>
        : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-slate-100">
            <Building2 className="h-14 w-14 text-violet-200"/>
          </div>
      }
      <button onClick={e => e.preventDefault()}
        className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm">
        <Heart size={13} className="text-gray-500 hover:text-red-500 transition-colors"/>
      </button>
      {hasMany && (
        <>
          <button onClick={prev}
            className="arrow-btn absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all opacity-0">
            <ChevronLeft size={14} className="text-gray-700"/>
          </button>
          <button onClick={next}
            className="arrow-btn absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all opacity-0">
            <ChevronRight size={14} className="text-gray-700"/>
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.slice(0, 5).map((_, i) => (
              <button key={i} onClick={e => { e.preventDefault(); setIdx(i); }}
                className={`h-1 rounded-full transition-all ${i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}/>
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
          ${open ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}>
        {label} <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>
      {open && (
        <div className={`absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden ${wide ? 'w-52' : 'w-44'}`}>
          {options.map(opt => (
            <button key={opt.value ?? opt} onClick={() => { onChange(opt.value ?? opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors font-medium
                ${(opt.value ?? opt) === value ? 'bg-violet-50 text-violet-700' : 'text-gray-700'}`}>
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
  const [listings,    setListings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [sort,        setSort]        = useState('Best Match');
  const [city,        setCity]        = useState(searchParams?.get('city') || '');
  const [type,        setType]        = useState('');
  const [priceKey,    setPriceKey]    = useState('Any Price');
  const [beds,        setBeds]        = useState('');
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
      const res  = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      let arr = Array.isArray(data) ? data : [];
      if (sort === 'Price: Low to High') arr.sort((a,b) => (a.financials?.monthlyRent||0)-(b.financials?.monthlyRent||0));
      if (sort === 'Price: High to Low') arr.sort((a,b) => (b.financials?.monthlyRent||0)-(a.financials?.monthlyRent||0));
      if (sort === 'Newest')             arr.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
      if (beds) { const min = parseInt(beds); arr = arr.filter(l => (l.specs?.bedrooms||0) >= min); }
      setListings(arr);
      setTotal(arr.length);
    } catch { setListings([]); }
    finally { setLoading(false); }
  }, [city, type, priceKey, beds, sort]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');
        *, body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .listing-card { background:white; border-radius:16px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.07); transition:transform .25s cubic-bezier(.34,1.2,.64,1),box-shadow .25s; cursor:pointer; }
        .listing-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(79,70,229,.13); }
        .listing-card:hover .arrow-btn { opacity:1 !important; }
        .filter-bar { background:white; border-bottom:1px solid #E8EAED; position:sticky; top:64px; z-index:40; }
        .search-input-wrap { display:flex; align-items:center; background:#F1F5F9; border-radius:12px; padding:0 14px; gap:8px; flex:1; max-width:300px; border:1.5px solid transparent; transition:border-color .2s; }
        .search-input-wrap:focus-within { border-color:#7C3AED; background:white; }
        .skeleton { animation:shimmer 1.5s infinite; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        .card-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:16px; }
        @media(max-width:1280px){.card-grid{grid-template-columns:repeat(4,minmax(0,1fr));}}
        @media(max-width:1024px){.card-grid{grid-template-columns:repeat(3,minmax(0,1fr));}}
        @media(max-width:640px) {.card-grid{grid-template-columns:repeat(1,minmax(0,1fr));}}
        .offer-btn { width:100%; padding:9px 0; border-radius:10px; border:1.5px solid #7C3AED; color:#6D28D9; font-weight:700; font-size:0.8rem; text-align:center; transition:all .2s; background:white; display:flex; align-items:center; justify-content:center; gap:6px; }
        .offer-btn:hover { background:#7C3AED; color:white; }
      `}</style>

      <Navbar />

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <form onSubmit={e => { e.preventDefault(); setCity(searchInput.trim()); }} className="search-input-wrap">
            <Search size={15} className="text-violet-400 flex-shrink-0"/>
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="City or address…"
              className="py-2.5 text-sm bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-400 min-w-0"/>
          </form>
          <Dropdown label={priceKey === 'Any Price' ? 'Price' : priceKey} value={priceKey} onChange={setPriceKey} wide options={PRICE_RANGES.map(r=>({label:r.label,value:r.label}))}/>
          <Dropdown label={type ? type[0].toUpperCase()+type.slice(1) : 'Type'} value={type} onChange={setType} options={[{label:'All Types',value:''},...TYPES.map(t=>({label:t[0].toUpperCase()+t.slice(1),value:t}))]}/>
          <Dropdown label={beds ? `${beds} Beds` : 'Beds'} value={beds} onChange={setBeds} options={[{label:'Any Beds',value:''},...BEDS.map(b=>({label:`${b} bed${b==='1'?'':'s'}`,value:b}))]}/>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
            <SlidersHorizontal size={14}/> Filters
          </button>
          <div className="ml-auto flex items-center gap-4 flex-shrink-0">
            {!loading && <p className="text-sm text-gray-500 font-medium whitespace-nowrap"><span className="text-gray-900 font-bold">{total.toLocaleString()}</span> listings</p>}
            <Dropdown label={<span className="flex items-center gap-1.5"><ArrowUpDown size={13}/> {sort}</span>} value={sort} onChange={setSort} wide options={SORTS.map(s=>({label:s,value:s}))}/>
          </div>
        </div>
      </div>

      <main className="flex-grow">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-5">
            <h1 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:'1.15rem'}} className="text-gray-900 capitalize">
              {city ? `${city} properties for rent` : 'All properties for rent'}
            </h1>
          </div>

          {loading && (
            <div className="card-grid">
              {[...Array(10)].map((_,i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-52 skeleton"/>
                  <div className="p-4 space-y-2.5">
                    <div className="h-5 skeleton rounded-lg w-1/2"/>
                    <div className="h-3.5 skeleton rounded w-3/4"/>
                    <div className="h-3.5 skeleton rounded w-2/3"/>
                    <div className="h-8 skeleton rounded-xl mt-3"/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && listings.length === 0 && (
            <div className="text-center py-28">
              <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Home className="h-10 w-10 text-violet-300"/>
              </div>
              <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700}} className="text-gray-800 text-xl mb-2">No listings found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search a different city</p>
              <button onClick={() => { setCity(''); setSearchInput(''); setType(''); setPriceKey('Any Price'); setBeds(''); }}
                className="mt-6 px-6 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 transition-all">
                Clear Filters
              </button>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="card-grid">
              {listings.map(listing => (
                <Link key={listing._id} href={`/browse/${listing._id}`} className="group listing-card block">
                  <PhotoCarousel images={listing.images} title={listing.title}/>
                  <div className="p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:'1.2rem'}} className="text-gray-900">
                        Rs. {(listing.financials?.monthlyRent||0).toLocaleString()}
                      </span>
                      <button onClick={e => e.preventDefault()} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-colors">
                        <Heart size={13} className="text-gray-400"/>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 font-semibold mb-1.5">
                      {listing.specs?.bedrooms != null && <span className="flex items-center gap-1"><Bed size={11} className="text-gray-400"/> {listing.specs.bedrooms}</span>}
                      {listing.specs?.bathrooms != null && <span className="flex items-center gap-1"><Bath size={11} className="text-gray-400"/> {listing.specs.bathrooms}</span>}
                      {listing.specs?.sizeSqFt && <span className="flex items-center gap-1"><Square size={11} className="text-gray-400"/> {listing.specs.sizeSqFt} sq ft</span>}
                      {!listing.specs?.bedrooms && !listing.specs?.bathrooms && !listing.specs?.sizeSqFt && (
                        <span className="capitalize text-violet-500">{listing.type}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium flex items-start gap-1 mb-3 leading-snug">
                      <MapPin size={10} className="flex-shrink-0 mt-0.5 text-gray-300"/>
                      {[listing.address?.street, listing.address?.city, listing.address?.state].filter(Boolean).join(', ')}
                    </p>
                    <button onClick={e => e.preventDefault()} className="offer-btn">
                      <Tag size={13}/> Make an Offer
                    </button>
                  </div>
                </Link>
              ))}

              {listings.length >= 4 && (
                <div className="listing-card bg-gradient-to-br from-violet-600 to-indigo-700 flex flex-col justify-center items-center p-6 text-center min-h-[300px]">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <Star size={20} className="text-white"/>
                  </div>
                  <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700}} className="text-white text-lg mb-2">Discover More</h3>
                  <p className="text-violet-100 text-xs mb-5 leading-relaxed">Quality properties — curated and verified.</p>
                  <Link href="/register" className="px-5 py-2.5 bg-white text-violet-700 font-bold text-xs rounded-xl hover:bg-violet-50 transition-all">
                    Save Search
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
      <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-violet-600" />
        </div>
        <Footer />
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}