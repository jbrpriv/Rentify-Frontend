'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import {
  Home, Loader2, X, ImagePlus, AlertCircle,
  MapPin, DollarSign, Layers, CheckCircle2, ArrowLeft, Upload
} from 'lucide-react';
import Link from 'next/link';

// ─── Country / Province / City data ──────────────────────────────────────────
const COUNTRIES = [
  'Pakistan', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Canada', 'Australia', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Kuwait',
  'Germany', 'France', 'India', 'Bangladesh', 'Other',
];

const PROVINCES_BY_COUNTRY = {
  'Pakistan': ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad Capital Territory'],
  'United Arab Emirates': ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al-Quwain', 'Ras Al Khaimah', 'Fujairah'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'United States': ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],
  'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan'],
  'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Australian Capital Territory', 'Northern Territory'],
};

const CITIES_BY_PROVINCE = {
  'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan', 'Sialkot', 'Sargodha', 'Bahawalpur', 'Sheikhupura', 'Islamabad'],
  'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas', 'Thatta'],
  'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Mardan', 'Mingora', 'Kohat', 'Dera Ismail Khan'],
  'Balochistan': ['Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Gwadar'],
  'Islamabad Capital Territory': ['Islamabad'],
  'Dubai': ['Dubai City', 'Deira', 'Bur Dubai', 'Jumeirah', 'Business Bay', 'Dubai Marina', 'Downtown Dubai'],
  'Abu Dhabi': ['Abu Dhabi City', 'Al Ain', 'Ruwais', 'Liwa'],
  'Sharjah': ['Sharjah City', 'Khor Fakkan', 'Kalba'],
  'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham'],
  'British Columbia': ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Kelowna', 'Abbotsford'],
  'England': ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol'],
  'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast', 'Maitland'],
  'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'],
};

const AMENITIES_LIST = [
  { label: 'Parking', emoji: '🚗' },
  { label: 'Gym', emoji: '💪' },
  { label: 'Elevator', emoji: '🛗' },
  { label: 'Backup Generator', emoji: '⚡' },
  { label: 'CCTV', emoji: '📹' },
  { label: 'Pool', emoji: '🏊' },
  { label: 'Garden', emoji: '🌿' },
  { label: 'Security Guard', emoji: '💂' },
  { label: 'Balcony', emoji: '🏙️' },
  { label: 'Furnished', emoji: '🛋️' },
  { label: 'Pets Allowed', emoji: '🐾' },
  { label: 'Internet Included', emoji: '📶' },
  { label: 'Air Conditioning', emoji: '❄️' },
  { label: 'Central Heating', emoji: '🔥' },
  { label: 'Laundry', emoji: '👕' },
  { label: 'Rooftop Access', emoji: '🏗️' },
];

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', emoji: '🏢' },
  { value: 'house', label: 'House', emoji: '🏠' },
  { value: 'studio', label: 'Studio', emoji: '🛏️' },
  { value: 'commercial', label: 'Commercial', emoji: '🏪' },
];

const inputStyle = {
  width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 12,
  padding: '10px 14px', fontSize: '0.875rem', color: '#0F172A',
  background: '#FAFBFF', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
  boxSizing: 'border-box',
};

// ─────────────────────────────────────────────────────────────────────────────
// BUG FIX: These helpers MUST live at MODULE scope (outside AddPropertyPage).
// When defined inside the component, React sees a new function reference on
// every render → full unmount+remount of every input → single-char input loss.
// ─────────────────────────────────────────────────────────────────────────────

function Card({ icon: Icon, color, title, sub, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>
      <div style={{ padding: '16px 22px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} style={{ color }} />
        </div>
        <div>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', lineHeight: 1 }}>{title}</p>
          {sub && <p style={{ fontSize: '0.73rem', color: '#94A3B8', marginTop: 2 }}>{sub}</p>}
        </div>
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>{children}</div>;
}

function F({ label, req, half, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: half ? '1 1 calc(50% - 6px)' : '1 1 100%', minWidth: half ? 140 : 'auto' }}>
      {/* Plain <span> intentionally — not a <label> — so it does NOT activate any input on click */}
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{req && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
      </span>
      {children}
    </div>
  );
}

export default function AddPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // BUG FIX: Use a ref on the hidden file input instead of wrapping it in a
  // <label>. A block-level <label> captures ALL clicks in its area and forwards
  // them to the associated input — even clicks on sibling cards below it.
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', listingDescription: '', type: 'apartment',
    address: { street: '', unitNumber: '', city: '', state: '', zip: '', country: 'Pakistan' },
    specs: { bedrooms: 1, bathrooms: 1, sizeSqFt: '' },
    financials: { monthlyRent: '', securityDeposit: '', maintenanceFee: '', lateFeeAmount: '', lateFeeGracePeriodDays: 5, taxId: '' },
    leaseTerms: { defaultDurationMonths: 12 },
    amenities: [],
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const set = (path, value) => {
    setForm(f => {
      const parts = path.split('.');
      const updated = { ...f };
      let cur = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return updated;
    });
  };

  const toggleAmenity = (label) => {
    const key = label.toLowerCase();
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(key)
        ? f.amenities.filter(x => x !== key)
        : [...f.amenities, key],
    }));
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPreviews = files.map(file => ({ preview: URL.createObjectURL(file), uploading: true }));
    setPreviews(prev => [...prev, ...newPreviews]);
    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      // Use api instance so auth token is handled by the interceptor,
      // not read directly from localStorage.
      const { data } = await api.post('/upload/property-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.urls) {
        setImages(prev => [...prev, ...data.urls]);
        setPreviews(prev =>
          prev.map(p =>
            newPreviews.find(n => n.preview === p.preview) ? { ...p, uploading: false } : p
          )
        );
      }
    } catch {
      toast('Image upload failed.', 'error');
      setPreviews(prev => prev.filter(p => !newPreviews.find(n => n.preview === p.preview)));
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (index) => {
    try { await api.delete('/upload/property-images', { data: { imageUrl: images[index] } }); } catch { }
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/properties', { ...form, images });
      router.push('/dashboard/properties');
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to create property', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .np-input:focus { border-color: #2563EB !important; outline: none; background: #F0F5FF !important; }
        .type-btn { cursor:pointer; border:2px solid #E2E8F0; border-radius:14px; padding:14px 10px; text-align:center; transition:all 0.2s; background:white; width:100%; }
        .type-btn:hover { border-color:#93C5FD; background:#F0F5FF; }
        .type-btn.sel { border-color:#2563EB; background:#EFF6FF; }
        .am-btn { cursor:pointer; border:1.5px solid #E2E8F0; border-radius:10px; padding:7px 13px; font-size:0.8rem; font-weight:600; display:flex; align-items:center; gap:6px; background:white; color:#475569; transition:all 0.2s; font-family:'Plus Jakarta Sans',sans-serif; }
        .am-btn:hover { border-color:#93C5FD; color:#2563EB; background:#F0F5FF; }
        .am-btn.sel { border-color:#2563EB; background:#EFF6FF; color:#1D4ED8; }
        .thumb-wrap { position:relative; border-radius:12px; overflow:hidden; aspect-ratio:16/9; background:#F1F5F9; }
        .thumb-wrap img { width:100%; height:100%; object-fit:cover; }
        .rm-btn { position:absolute; top:8px; right:8px; background:rgba(239,68,68,0.9); color:white; border:none; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity:0; transition:opacity 0.2s; }
        .thumb-wrap:hover .rm-btn { opacity:1; }
        .drop-zone {
          border: 2px dashed #CBD5E1; border-radius: 16px; padding: 28px;
          text-align: center; cursor: pointer; transition: all 0.2s;
          background: #FAFBFF; display: block;
          /* Contain the clickable zone — do NOT let it bleed outside this element */
          position: relative; z-index: 0;
        }
        .drop-zone:hover { border-color: #2563EB; background: #EFF6FF; }
      `}</style>

      <div style={{ maxWidth: 740, margin: '0 auto', paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Link href="/dashboard/properties"
            style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', textDecoration: 'none', background: 'white' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.65rem', color: '#0F172A', lineHeight: 1, letterSpacing: '-0.02em' }}>Add Property</h1>
            <p style={{ color: '#94A3B8', fontSize: '0.83rem', marginTop: 3 }}>Fill in all details to create your listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* ── Photos ───────────────────────────────────────────────────── */}
          <Card icon={ImagePlus} color="#7C3AED" title="Property Photos" sub="First photo is the cover · Max 5 images">

            {/* Hidden file input — triggered only via ref, never via a wrapping <label> */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              disabled={uploading}
            />

            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                {previews.map((img, i) => (
                  <div key={i} className="thumb-wrap">
                    <img src={img.preview} alt={`preview-${i}`} />
                    {img.uploading
                      ? <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 size={20} style={{ color: 'white', animation: 'spin 1s linear infinite' }} />
                      </div>
                      : <button type="button" className="rm-btn" onClick={() => handleRemoveImage(i)}>
                        <X size={12} />
                      </button>
                    }
                    {i === 0 && (
                      <span style={{ position: 'absolute', bottom: 7, left: 7, background: '#2563EB', color: 'white', fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 5 }}>
                        COVER
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {previews.length < 5 && (
              /* BUG FIX: <div onClick> instead of <label>.
                 A block <label> wrapping a hidden <input type="file"> intercepts
                 ALL clicks anywhere on the label — including areas users expect
                 to interact with other elements. Using div+ref.click() restricts
                 the trigger to this exact element only. */
              <div
                className="drop-zone"
                role="button"
                tabIndex={0}
                onClick={() => !uploading && fileInputRef.current?.click()}
                onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !uploading) fileInputRef.current?.click(); }}
              >
                <ImagePlus size={26} style={{ color: '#94A3B8', margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>
                  <span style={{ color: '#2563EB' }}>Click to upload</span> or drag and drop
                </p>
                <p style={{ fontSize: '0.73rem', color: '#94A3B8', marginTop: 3 }}>PNG, JPG, WEBP · Max 5MB each</p>
              </div>
            )}
          </Card>

          {/* ── Property Details ─────────────────────────────────────────── */}
          <Card icon={Home} color="#2563EB" title="Property Details" sub="Title, type and description">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <F label="Property Title" req>
                <input className="np-input" style={inputStyle} required
                  placeholder="e.g. Modern 2BR Apartment in Downtown"
                  value={form.title} onChange={e => set('title', e.target.value)} />
              </F>

              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
                  Property Type <span style={{ color: '#EF4444' }}>*</span>
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {PROPERTY_TYPES.map(t => (
                    <button type="button" key={t.value}
                      className={`type-btn ${form.type === t.value ? 'sel' : ''}`}
                      onClick={() => set('type', t.value)}>
                      <div style={{ fontSize: '1.4rem', marginBottom: 5 }}>{t.emoji}</div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: form.type === t.value ? '#1D4ED8' : '#475569' }}>{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <F label="Listing Description">
                <textarea className="np-input" style={{ ...inputStyle, resize: 'none', minHeight: 90 }}
                  placeholder="Describe the property — amenities, nearby places, special features, neighbourhood..."
                  value={form.listingDescription} onChange={e => set('listingDescription', e.target.value)} />
              </F>
            </div>
          </Card>

          {/* ── Location ─────────────────────────────────────────────────── */}
          <Card icon={MapPin} color="#0891B2" title="Location" sub="Full address with unit number and country">
            <Row>
              <F label="Street Address" req>
                <input className="np-input" style={inputStyle} required placeholder="123 Main Street"
                  value={form.address.street} onChange={e => set('address.street', e.target.value)} />
              </F>
              <F label="Unit / Flat #" half>
                <input className="np-input" style={inputStyle} placeholder="Unit 4B"
                  value={form.address.unitNumber} onChange={e => set('address.unitNumber', e.target.value)} />
              </F>
              <F label="Country" req half>
                <select style={inputStyle} required value={form.address.country}
                  onChange={e => { set('address.country', e.target.value); set('address.state', ''); set('address.city', ''); }}>
                  <option value="">Select Country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </F>
              <F label="State / Province" req half>
                {PROVINCES_BY_COUNTRY[form.address.country] ? (
                  <select style={inputStyle} required value={form.address.state}
                    onChange={e => { set('address.state', e.target.value); set('address.city', ''); }}>
                    <option value="">Select Province</option>
                    {PROVINCES_BY_COUNTRY[form.address.country].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input className="np-input" style={inputStyle} required placeholder="State / Province"
                    value={form.address.state} onChange={e => set('address.state', e.target.value)} />
                )}
              </F>
              <F label="City" req half>
                {CITIES_BY_PROVINCE[form.address.state] ? (
                  <select style={inputStyle} required value={form.address.city}
                    onChange={e => set('address.city', e.target.value)}>
                    <option value="">Select City</option>
                    {CITIES_BY_PROVINCE[form.address.state].map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__other">Other (type below)</option>
                  </select>
                ) : (
                  <input className="np-input" style={inputStyle} required placeholder="City"
                    value={form.address.city} onChange={e => set('address.city', e.target.value)} />
                )}
                {/* Show free-text input when "Other" is selected */}
                {form.address.city === '__other' && (
                  <input className="np-input" style={{ ...inputStyle, marginTop: 6 }} required placeholder="Enter city name"
                    onChange={e => set('address.city', e.target.value)} />
                )}
              </F>
              <F label="ZIP / Postal Code" req half>
                <input className="np-input" style={inputStyle} required placeholder="74000"
                  value={form.address.zip} onChange={e => set('address.zip', e.target.value)} />
              </F>
            </Row>
          </Card>

          {/* ── Specifications ───────────────────────────────────────────── */}
          <Card icon={Layers} color="#7C3AED" title="Specifications" sub="Bedrooms, bathrooms and size">
            <Row>
              <F label="Bedrooms" half>
                <input className="np-input" style={inputStyle} type="number" min="0" placeholder="2"
                  value={form.specs.bedrooms} onChange={e => set('specs.bedrooms', e.target.value)} />
              </F>
              <F label="Bathrooms" half>
                <input className="np-input" style={inputStyle} type="number" min="0" placeholder="1"
                  value={form.specs.bathrooms} onChange={e => set('specs.bathrooms', e.target.value)} />
              </F>
              <F label="Size (Sq Ft)">
                <input className="np-input" style={inputStyle} type="number" min="0" placeholder="850"
                  value={form.specs.sizeSqFt} onChange={e => set('specs.sizeSqFt', e.target.value)} />
              </F>
            </Row>
          </Card>

          {/* ── Amenities ────────────────────────────────────────────────── */}
          <Card icon={CheckCircle2} color="#16A34A" title="Amenities" sub="Select all that apply">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AMENITIES_LIST.map(a => {
                const key = a.label.toLowerCase();
                const sel = form.amenities.includes(key);
                return (
                  <button type="button" key={a.label}
                    className={`am-btn ${sel ? 'sel' : ''}`}
                    onClick={() => toggleAmenity(a.label)}>
                    <span>{a.emoji}</span> {a.label}
                    {sel && <CheckCircle2 size={12} style={{ color: '#2563EB' }} />}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* ── Financials ───────────────────────────────────────────────── */}
          <Card icon={DollarSign} color="#D97706" title="Financials & Lease Rules" sub="Rent, deposit, late fees and lease duration">
            <Row>
              <F label="Monthly Rent ($)" req half>
                <input className="np-input" style={inputStyle} type="number" required placeholder="50,000"
                  value={form.financials.monthlyRent} onChange={e => set('financials.monthlyRent', e.target.value)} />
              </F>
              <F label="Security Deposit ($)" req half>
                <input className="np-input" style={inputStyle} type="number" required placeholder="100,000"
                  value={form.financials.securityDeposit} onChange={e => set('financials.securityDeposit', e.target.value)} />
              </F>
              <F label="Maintenance Fee ($)" half>
                <input className="np-input" style={inputStyle} type="number" placeholder="0"
                  value={form.financials.maintenanceFee} onChange={e => set('financials.maintenanceFee', e.target.value)} />
              </F>
              <F label="Late Fee Amount ($)" half>
                <input className="np-input" style={inputStyle} type="number" placeholder="2,000"
                  value={form.financials.lateFeeAmount} onChange={e => set('financials.lateFeeAmount', e.target.value)} />
              </F>
              <F label="Grace Period (Days)" half>
                <input className="np-input" style={inputStyle} type="number" placeholder="5"
                  value={form.financials.lateFeeGracePeriodDays} onChange={e => set('financials.lateFeeGracePeriodDays', e.target.value)} />
              </F>
              <F label="Default Lease Duration (Months)" half>
                <input className="np-input" style={inputStyle} type="number" placeholder="12"
                  value={form.leaseTerms.defaultDurationMonths} onChange={e => set('leaseTerms.defaultDurationMonths', e.target.value)} />
              </F>
              <F label="Tax / NTN ID (Optional)">
                <input className="np-input" style={inputStyle} placeholder="Landlord tax ID for this property"
                  value={form.financials.taxId} onChange={e => set('financials.taxId', e.target.value)} />
              </F>
            </Row>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 14, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px' }}>
              <AlertCircle size={14} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.77rem', color: '#92400E', lineHeight: 1.6 }}>
                These rules auto-apply when generating a lease agreement. You can adjust them anytime from the Edit page.
              </p>
            </div>
          </Card>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/dashboard/properties"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', border: '1.5px solid #E2E8F0', borderRadius: 14, fontSize: '0.88rem', fontWeight: 700, color: '#64748B', textDecoration: 'none', background: 'white', textAlign: 'center' }}>
              Cancel
            </Link>
            <button type="submit" disabled={loading || uploading}
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: loading || uploading ? '#93C5FD' : 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white', border: 'none', borderRadius: 14, fontSize: '0.9rem', fontWeight: 700, cursor: loading || uploading ? 'not-allowed' : 'pointer', fontFamily: "'Outfit',sans-serif", boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                : uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                  : <><Upload size={16} /> Save Property</>}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}