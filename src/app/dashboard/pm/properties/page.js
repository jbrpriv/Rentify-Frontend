'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Building2, Loader2, MapPin, Users, CheckCircle, XCircle, Clock, Bell } from 'lucide-react';

const STATUS_COLORS = {
  vacant:      'bg-[#E6EAF2] text-[#0B2D72]',
  occupied:    'bg-[#0B2D72] text-[#E6EAF2]',
  maintenance: 'bg-[#CBD5E1] text-[#1F2933]',
};

export default function PMPropertiesPage() {
  const router = useRouter();
  const { user } = useUser();
  const { formatMoney } = useCurrency();

  useEffect(() => {
    if (!user) return;
    if (!['property_manager','admin'].includes(user.role)) router.push('/dashboard');
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const [properties,   setProperties]   = useState([]);
  const [invitations,  setInvitations]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [responding,   setResponding]   = useState('');
  const [msg,          setMsg]          = useState('');

  const load = async () => {
    try {
      const [propResp, invResp] = await Promise.all([
        api.get('/properties'),
        api.get('/properties/my-invitations'),
      ]);
      setProperties(propResp.data || []);
      setInvitations(invResp.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (propertyId, accept) => {
    setResponding(propertyId);
    try {
      await api.put(`/properties/${propertyId}/respond-invitation`, { accept });
      setMsg(accept ? '✅ Invitation accepted — property assigned to you!' : 'Invitation declined.');
      setTimeout(() => setMsg(''), 4000);
      await load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to respond');
    } finally { setResponding(''); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-[#0B2D72]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">My Properties</h1>
        <p className="text-gray-400 text-sm mt-1">{properties.length} properties assigned to you</p>
      </div>

      {msg && <div className={`rounded-2xl px-5 py-3 text-sm font-medium ${msg.startsWith('✅') ? 'bg-[#DBE2ED] text-[#0B2D72]' : 'bg-[#E6EAF2] text-[#1F2933] border border-[#CBD5E1]'}`}>{msg}</div>}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-[#0B2D72]" />
            Pending Invitations ({invitations.length})
          </h2>
          {invitations.map(inv => (
            <div key={inv._id} className="bg-[#E6EAF2] border border-[#CBD5E1] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{inv.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {inv.address?.street}, {inv.address?.city}
                </p>
                <p className="text-xs text-[#0B2D72] font-medium mt-1">
                  Invited by: {inv.landlord?.name} ({inv.landlord?.email})
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleRespond(inv._id, true)} disabled={responding === inv._id}
                  className="flex items-center gap-1.5 bg-[#0B2D72] text-[#E6EAF2] rounded-xl px-4 py-2 text-sm font-black hover:opacity-90 disabled:opacity-50 transition">
                  {responding === inv._id ? <Loader2 className="animate-spin w-3 h-3" /> : <CheckCircle className="w-4 h-4" />}
                  Accept
                </button>
                <button onClick={() => handleRespond(inv._id, false)} disabled={responding === inv._id}
                  className="flex items-center gap-1.5 bg-[#E6EAF2] text-[#1F2933] border border-[#CBD5E1] rounded-xl px-4 py-2 text-sm font-black hover:bg-[#CBD5E1] disabled:opacity-50 transition">
                  <XCircle className="w-4 h-4" /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assigned Properties */}
      {properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-bold text-gray-500">No properties assigned yet</p>
          <p className="text-sm text-gray-400 mt-1">Wait for a landlord to invite you to manage their property</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="h-40 bg-[#E6EAF2] flex items-center justify-center">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-12 h-12 text-[#0B2D72] opacity-30" />
                )}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-gray-900">{p.title}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {p.address?.city}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || 'bg-[#E6EAF2] text-[#1F2933]'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.landlord?.name || 'Landlord'}</span>
                  <span className="font-bold text-gray-900">{formatMoney(p.financials?.monthlyRent)}/mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}