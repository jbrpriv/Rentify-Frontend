'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { useCurrency } from '@/context/CurrencyContext';
import { Loader2, Save, ArrowLeft, UserCheck, UserX, Search } from 'lucide-react';
import Link from 'next/link';
import MapPicker from '@/components/MapPicker';

const AMENITIES_LIST = [
  'Parking','Gym','Elevator','Backup Generator','CCTV','Pool','Garden',
  'Security Guard','Balcony','Furnished','Pets Allowed','Internet Included',
  'Air Conditioning','Central Heating','Laundry','Rooftop Access'
];

function EditPropertyContent() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const id            = searchParams.get('id');
  const { currency, convertToUSD } = useCurrency();

  const [form, setForm]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  // ─── Assign Manager state ─────────────────────────────────────────
  const [currentManager, setCurrentManager] = useState(null); // {_id, name, email}
  const [managerEmail, setManagerEmail]       = useState('');
  const [managerSearch, setManagerSearch]     = useState(null); // found user object
  const [managerSearching, setManagerSearching] = useState(false);
  const [managerError, setManagerError]       = useState('');
  const [managerSuccess, setManagerSuccess]   = useState('');
  const [assigning, setAssigning]             = useState(false);
  const [mapVisible, setMapVisible]           = useState(false);
  const [mapCenter, setMapCenter]             = useState(null);
  const [mapMarker, setMapMarker]             = useState(null);
  const [mapQuery, setMapQuery]               = useState('');
  const [mapSearching, setMapSearching]       = useState(false);

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(({ data }) => {
        const existingLocation = Array.isArray(data.location?.coordinates) && data.location.coordinates.length === 2
          ? { lng: Number(data.location.coordinates[0]), lat: Number(data.location.coordinates[1]) }
          : null;

        setCurrentManager(data.managedBy || null);
        setForm({
          title:              data.title || '',
          type:               data.type  || 'apartment',
          listingDescription: data.listingDescription || '',
          isListed:           data.isListed || false,
          address: {
            street:     data.address?.street     || '',
            unitNumber: data.address?.unitNumber || '',
            city:       data.address?.city       || '',
            state:      data.address?.state      || '',
            zip:        data.address?.zip        || '',
          },
          specs: {
            bedrooms:  data.specs?.bedrooms  || '',
            bathrooms: data.specs?.bathrooms || '',
            sizeSqFt:  data.specs?.sizeSqFt  || '',
          },
          financials: {
            monthlyRent:            data.financials?.monthlyRent || '',
            securityDeposit:        data.financials?.securityDeposit || '',
            lateFeeAmount:          data.financials?.lateFeeAmount || 0,
            lateFeeGracePeriodDays: data.financials?.lateFeeGracePeriodDays || 5,
            taxId:                  data.financials?.taxId || '',
          },
          amenities: data.amenities || [],
        });
        setMapMarker(existingLocation);
        setMapCenter(existingLocation);
        setMapVisible(!!existingLocation);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load property'))
      .finally(() => setLoading(false));
  }, [id]);

  const buildAddressQuery = () => {
    const { street, unitNumber, city, state, zip } = form.address;
    return [street, unitNumber, city, state, zip].filter(Boolean).join(', ');
  };

  const geocodeAddress = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const results = await resp.json();
    if (!Array.isArray(results) || results.length === 0) return null;
    const first = results[0];
    return { lat: Number(first.lat), lng: Number(first.lon) };
  };

  const handleMarkOnMap = async () => {
    const addressQuery = buildAddressQuery();
    if (!addressQuery) {
      setError('Please enter the address before marking the location on the map.');
      return;
    }

    setMapVisible(true);
    setMapQuery(addressQuery);
    setMapSearching(true);
    setError('');

    try {
      const coords = await geocodeAddress(addressQuery);
      if (coords) {
        setMapCenter(coords);
        setMapMarker(coords);
      } else {
        setError('Unable to find that address. Try a more specific location.');
      }
    } catch {
      setError('Failed to search that address. Please try again.');
    } finally {
      setMapSearching(false);
    }
  };

  const handleSearchMap = async () => {
    if (!mapQuery.trim()) return;
    setMapSearching(true);
    setError('');
    try {
      const coords = await geocodeAddress(mapQuery.trim());
      if (coords) {
        setMapCenter(coords);
      } else {
        setError('No results found for that search.');
      }
    } catch {
      setError('Map search failed. Please try again.');
    } finally {
      setMapSearching(false);
    }
  };

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a.toLowerCase())
        ? f.amenities.filter(x => x !== a.toLowerCase())
        : [...f.amenities, a.toLowerCase()],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Convert financial values from selected currency to USD before saving
      const dataToSave = {
        ...form,
        ...(mapMarker ? {
          location: {
            type: 'Point',
            coordinates: [mapMarker.lng, mapMarker.lat],
          },
        } : {}),
        financials: {
          ...form.financials,
          monthlyRent: convertToUSD(Number(form.financials.monthlyRent) || 0),
          securityDeposit: convertToUSD(Number(form.financials.securityDeposit) || 0),
          lateFeeAmount: convertToUSD(Number(form.financials.lateFeeAmount) || 0),
        },
      };
      await api.put(`/properties/${id}`, dataToSave);
      router.push('/dashboard/properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

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

  // ─── Manager lookup ───────────────────────────────────────────────
  const handleSearchManager = async () => {
    if (!managerEmail.trim()) return;
    setManagerSearching(true);
    setManagerError('');
    setManagerSearch(null);
    try {
      const { data } = await api.post('/users/lookup', { email: managerEmail.trim() });
      if (data.role !== 'property_manager') {
        setManagerError(`${data.name} is registered as a "${data.role}", not a property_manager.`);
      } else {
        setManagerSearch(data);
      }
    } catch (err) {
      setManagerError(err.response?.data?.message || 'User not found');
    } finally {
      setManagerSearching(false);
    }
  };

  const handleAssignManager = async (managerId) => {
    setAssigning(true);
    setManagerError('');
    setManagerSuccess('');
    try {
      const { data } = await api.put(`/properties/${id}/assign-manager`, { managerId });
      setCurrentManager(data.property.managedBy || null);
      setManagerSearch(null);
      setManagerEmail('');
      setManagerSuccess(managerId ? 'Property manager assigned successfully.' : 'Property manager removed.');
    } catch (err) {
      setManagerError(err.response?.data?.message || 'Failed to assign manager');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-[#0B2D72]" /></div>;
  if (!form)   return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/properties" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Edit Property</h1>
          <p className="text-gray-400 text-sm mt-0.5">Update listing details and financials</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 rounded-2xl px-5 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">

        {/* Basic Info */}
        <Section title="Basic Info">
          <InputField label="Property Title" value={form.title} onChange={v => set('title', v)} required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field">
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="label">Listing Status</label>
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isListed} onChange={e => set('isListed', e.target.checked)} className="w-4 h-4 accent-[#0B2D72]" />
                <span className="text-sm text-gray-700">Listed publicly on marketplace</span>
              </label>
            </div>
          </div>
          <div>
            <label className="label">Listing Description</label>
            <textarea
              value={form.listingDescription}
              onChange={e => set('listingDescription', e.target.value)}
              rows={3}
              className="input-field"
              placeholder="Describe the property for potential tenants..."
            />
          </div>
        </Section>

        {/* Address */}
        <Section title="Address">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <InputField label="Street" value={form.address.street} onChange={v => set('address.street', v)} required />
            </div>
            <InputField label="Unit #" value={form.address.unitNumber} onChange={v => set('address.unitNumber', v)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="City"  value={form.address.city}  onChange={v => set('address.city', v)}  required />
            <InputField label="State" value={form.address.state} onChange={v => set('address.state', v)} required />
            <InputField label="ZIP"   value={form.address.zip}   onChange={v => set('address.zip', v)}   required />
          </div>
        </Section>

        <Section title="Location">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleMarkOnMap}
                disabled={mapSearching}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-[#0B2D72] transition hover:bg-gray-100 disabled:opacity-50"
              >
                {mapSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {mapSearching ? 'Finding address...' : 'Mark on Map'}
              </button>
              {mapMarker && (
                <span className="text-xs font-semibold text-emerald-600">Location marked</span>
              )}
              {mapMarker && (
                <button
                  type="button"
                  onClick={() => setMapMarker(null)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#0B2D72] transition hover:bg-gray-50"
                >
                  Remove Mark
                </button>
              )}
            </div>

            {mapVisible && (
              <>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={mapQuery}
                    onChange={e => setMapQuery(e.target.value)}
                    placeholder="Search a place or address"
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2D72]"
                  />
                  <button
                    type="button"
                    onClick={handleSearchMap}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold text-[#0B2D72] transition hover:bg-gray-100"
                  >
                    Search
                  </button>
                </div>

                <MapPicker
                  center={mapCenter}
                  marker={mapMarker}
                  onMarkerChange={setMapMarker}
                  height={320}
                />

                <p className="text-xs text-gray-500">
                  Click anywhere on the map to move the marker. The updated coordinates will be saved with the property.
                </p>
              </>
            )}
          </div>
        </Section>

        {/* Specs */}
        <Section title="Property Specs">
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Bedrooms"   type="number" value={form.specs.bedrooms}  onChange={v => set('specs.bedrooms', v)} />
            <InputField label="Bathrooms"  type="number" value={form.specs.bathrooms} onChange={v => set('specs.bathrooms', v)} />
            <InputField label="Size (sq ft)" type="number" value={form.specs.sizeSqFt} onChange={v => set('specs.sizeSqFt', v)} />
          </div>
        </Section>

        {/* Financials */}
        <Section title="Financials">
          <div className="grid grid-cols-2 gap-4">
            <InputField label={`Monthly Rent (${currency})`}     type="number" value={form.financials.monthlyRent}     onChange={v => set('financials.monthlyRent', v)}     required />
            <InputField label={`Security Deposit (${currency})`} type="number" value={form.financials.securityDeposit} onChange={v => set('financials.securityDeposit', v)} required />
            <InputField label={`Late Fee Amount (${currency})`}  type="number" value={form.financials.lateFeeAmount}   onChange={v => set('financials.lateFeeAmount', v)} />
            <InputField label="Grace Period (days)"    type="number" value={form.financials.lateFeeGracePeriodDays} onChange={v => set('financials.lateFeeGracePeriodDays', v)} />
            <div className="col-span-2">
              <InputField label="Tax / NTN ID" value={form.financials.taxId} onChange={v => set('financials.taxId', v)} placeholder="Optional landlord tax ID" />
            </div>
          </div>
        </Section>

        {/* Amenities */}
        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {AMENITIES_LIST.map(a => {
              const key = a.toLowerCase();
              const selected = form.amenities.includes(key);
              return (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    selected
                      ? 'bg-[#F1F5F9] text-[#0B2D72] border-[#0B2D72]'
                      : 'bg-[#F1F5F9] text-[#0B2D72] border-[#E2E8F0] hover:border-[#0B2D72]'
                  }`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Save Button */}
        <div className="flex gap-4">
          <Link href="/dashboard/properties" className="flex-1 text-center border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold hover:bg-gray-50 transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-[#F1F5F9] text-[#0B2D72] border border-[#E2E8F0] rounded-2xl py-3.5 text-sm font-black hover:bg-[#E2E8F0] disabled:bg-[#F1F5F9] disabled:opacity-50 transition"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </form>

      {/* ── Assign Property Manager (outside the save form) ─────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Property Manager</h3>

        {/* Current manager */}
        {currentManager ? (
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-sm">
                {currentManager.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{currentManager.name}</p>
                <p className="text-xs text-gray-500">{currentManager.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleAssignManager(null)}
              disabled={assigning}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition"
            >
              {assigning ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
              Remove
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No property manager assigned</p>
        )}

        {/* Search & assign */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-600">
            {currentManager ? 'Replace manager' : 'Assign a manager'}
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter property manager's email..."
              value={managerEmail}
              onChange={e => { setManagerEmail(e.target.value); setManagerSearch(null); setManagerError(''); setManagerSuccess(''); }}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchManager())}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2D72]"
            />
            <button
              type="button"
              onClick={handleSearchManager}
              disabled={managerSearching || !managerEmail.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B2D72] text-sm font-bold rounded-xl transition disabled:opacity-50"
            >
              {managerSearching ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
              Lookup
            </button>
          </div>

          {managerError   && <p className="text-xs text-red-600 font-medium">{managerError}</p>}
          {managerSuccess && <p className="text-xs text-green-600 font-medium">{managerSuccess}</p>}

          {managerSearch && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700 text-sm">
                  {managerSearch.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{managerSearch.name}</p>
                  <p className="text-xs text-gray-500">{managerSearch.email} · property_manager</p>
                </div>
              </div>
              <button
                onClick={() => handleAssignManager(managerSearch._id)}
                disabled={assigning}
                className="flex items-center gap-1.5 text-xs font-bold bg-[#F1F5F9] text-[#0B2D72] border border-[#E2E8F0] hover:bg-[#E2E8F0] rounded-lg px-4 py-1.5 transition"
              >
                {assigning ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                Assign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditPropertyPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D72]" />
      </div>
    }>
      <EditPropertyContent />
    </Suspense>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</h3>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', required, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2D72]"
      />
    </div>
  );
}