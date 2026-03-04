'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import {
  Building2, CheckCircle, XCircle, Loader2, Phone, Mail,
  MessageSquare, Calendar, Clock, ChevronDown, ChevronUp,
  Shield, Wrench, Tag,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
const OFFER_META = {
  rent:        { label: 'Rent Offer',        color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', Icon: Tag    },
  security:    { label: 'Security Offer',    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', Icon: Shield },
  maintenance: { label: 'Maintenance Offer', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', Icon: Wrench },
};

function OfferTypeBadge({ type }) {
  const m = OFFER_META[type] || OFFER_META.rent;
  const { Icon } = m;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 10px', borderRadius:20,
      background: m.bg, border:`1px solid ${m.border}`,
      color: m.color, fontSize:'0.72rem', fontWeight:700,
    }}>
      <Icon size={11}/> {m.label}
    </span>
  );
}

function OfferCard({ offer, processingId, onDecision }) {
  let borderColor = '#FBBF24';
  if (offer.status === 'accepted') borderColor = '#22C55E';
  if (offer.status === 'rejected') borderColor = '#EF4444';

  return (
    <div style={{
      background: offer.status !== 'pending' ? '#FAFAFA' : 'white',
      borderRadius: '0 12px 12px 0',
      border: '1px solid #F1F5F9',
      borderLeft: `4px solid ${borderColor}`,
      padding: '16px 20px',
      opacity: offer.status !== 'pending' ? 0.75 : 1,
      transition: 'opacity 0.2s',
    }}>
      <div style={{display:'flex', flexWrap:'wrap', justifyContent:'space-between', gap:12}}>
        {/* Left: tenant info */}
        <div style={{display:'flex', alignItems:'flex-start', gap:14, flex:1}}>
          <div style={{
            width:44, height:44, borderRadius:'50%',
            background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0, fontWeight:800, fontSize:'1.1rem', color:'#2563EB',
          }}>
            {offer.tenant?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4}}>
              <span style={{fontWeight:700, fontSize:'0.95rem', color:'#0F172A'}}>{offer.tenant?.name}</span>
              <OfferTypeBadge type={offer.offerType} />
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap:12, fontSize:'0.8rem', color:'#64748B', marginBottom:8}}>
              <span style={{display:'flex',alignItems:'center',gap:4}}><Mail size={12}/>{offer.tenant?.email}</span>
              {offer.tenant?.phoneNumber && (
                <span style={{display:'flex',alignItems:'center',gap:4}}><Phone size={12}/>{offer.tenant?.phoneNumber}</span>
              )}
            </div>

            {/* Proposed Terms */}
            {offer.offerType === 'rent' && offer.proposedTerms?.monthlyRent && (
              <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:8,padding:'6px 12px',marginBottom:8,fontSize:'0.8rem',color:'#1E40AF'}}>
                💰 Proposed Rent: <strong>Rs. {offer.proposedTerms.monthlyRent?.toLocaleString()}/mo</strong>
              </div>
            )}
            {offer.offerType === 'security' && offer.proposedTerms?.securityDeposit && (
              <div style={{background:'#F5F3FF',border:'1px solid #DDD6FE',borderRadius:8,padding:'6px 12px',marginBottom:8,fontSize:'0.8rem',color:'#5B21B6'}}>
                🛡️ Proposed Deposit: <strong>Rs. {offer.proposedTerms.securityDeposit?.toLocaleString()}</strong>
              </div>
            )}
            {offer.offerType === 'maintenance' && offer.proposedTerms?.maintenanceScope && (
              <div style={{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:8,padding:'6px 12px',marginBottom:8,fontSize:'0.8rem',color:'#065F46'}}>
                🔧 Scope: {offer.proposedTerms.maintenanceScope}
                {offer.proposedTerms.rentReductionRequested && (
                  <span style={{marginLeft:8,fontWeight:700}}> | Reduction: Rs. {offer.proposedTerms.rentReductionRequested?.toLocaleString()}</span>
                )}
              </div>
            )}

            {/* Tenant Message */}
            {offer.message && (
              <div style={{background:'#F8FAFF',border:'1px solid #E2E8F0',borderRadius:8,padding:'8px 12px',marginBottom:8}}>
                <div style={{display:'flex',alignItems:'center',gap:4,fontSize:'0.65rem',fontWeight:700,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>
                  <MessageSquare size={10}/> Message
                </div>
                <p style={{fontSize:'0.82rem',color:'#374151',fontStyle:'italic',margin:0}}>"{offer.message}"</p>
              </div>
            )}

            <p style={{fontSize:'0.7rem',color:'#94A3B8',display:'flex',alignItems:'center',gap:4}}>
              <Calendar size={11}/> Submitted: {new Date(offer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{display:'flex',flexDirection:'column',gap:8,justifyContent:'center',alignItems:'flex-end',flexShrink:0}}>
          {offer.status === 'pending' ? (
            <>
              <button
                onClick={() => onDecision(offer._id, 'accepted')}
                disabled={processingId === offer._id}
                style={{
                  display:'flex',alignItems:'center',gap:6,padding:'8px 16px',
                  background:'#16A34A',color:'white',border:'none',borderRadius:10,
                  fontWeight:700,fontSize:'0.82rem',cursor:'pointer',whiteSpace:'nowrap',
                  opacity: processingId === offer._id ? 0.6 : 1,
                }}>
                {processingId === offer._id
                  ? <Loader2 size={13} className="animate-spin"/>
                  : <><CheckCircle size={13}/> Accept & Draft Lease</>
                }
              </button>
              <button
                onClick={() => onDecision(offer._id, 'rejected')}
                disabled={processingId === offer._id}
                style={{
                  display:'flex',alignItems:'center',gap:6,padding:'8px 16px',
                  background:'white',color:'#DC2626',border:'1px solid #FECACA',borderRadius:10,
                  fontWeight:700,fontSize:'0.82rem',cursor:'pointer',
                  opacity: processingId === offer._id ? 0.5 : 1,
                }}>
                <XCircle size={13}/> Decline
              </button>
            </>
          ) : (
            <span style={{
              display:'inline-flex',alignItems:'center',gap:6,
              padding:'6px 14px',borderRadius:20,fontWeight:700,fontSize:'0.82rem',
              background: offer.status === 'accepted' ? '#F0FDF4' : '#FFF1F2',
              color: offer.status === 'accepted' ? '#15803D' : '#BE123C',
              border: `1px solid ${offer.status === 'accepted' ? '#BBF7D0' : '#FECDD3'}`,
            }}>
              {offer.status === 'accepted'
                ? <><CheckCircle size={13}/> Accepted</>
                : <><XCircle size={13}/> Declined</>
              }
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PropertyGroup({ group, processingId, onDecision, filterType }) {
  const [expanded, setExpanded] = useState(true);

  const filteredOffers = filterType === 'all'
    ? group.offers
    : group.offers.filter(o => o.offerType === filterType);

  const pendingCount = filteredOffers.filter(o => o.status === 'pending').length;

  if (filteredOffers.length === 0) return null;

  const pending  = filteredOffers.filter(o => o.status === 'pending');
  const decided  = filteredOffers.filter(o => o.status !== 'pending');

  return (
    <div style={{background:'white',borderRadius:16,border:'1px solid #E2E8F0',overflow:'hidden',boxShadow:'0 1px 6px rgba(15,23,42,0.06)'}}>
      {/* Property Header */}
      <button
        onClick={() => setExpanded(x => !x)}
        style={{
          width:'100%',padding:'16px 20px',display:'flex',alignItems:'center',
          justifyContent:'space-between',background:'none',border:'none',cursor:'pointer',
          borderBottom: expanded ? '1px solid #F1F5F9' : 'none',
        }}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:38,height:38,borderRadius:10,background:'#EFF6FF',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Building2 size={18} style={{color:'#2563EB'}}/>
          </div>
          <div style={{textAlign:'left'}}>
            <p style={{fontWeight:700,fontSize:'0.95rem',color:'#0F172A',margin:0}}>{group.property?.title}</p>
            <p style={{fontSize:'0.75rem',color:'#64748B',margin:0}}>
              {group.property?.address?.city}, {group.property?.address?.state} · Rs. {group.property?.financials?.monthlyRent?.toLocaleString()}/mo
            </p>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {pendingCount > 0 && (
            <span style={{background:'#FBBF24',color:'white',borderRadius:20,padding:'2px 10px',fontSize:'0.72rem',fontWeight:800}}>
              {pendingCount} Pending
            </span>
          )}
          <span style={{fontSize:'0.75rem',color:'#94A3B8',fontWeight:600}}>{filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''}</span>
          {expanded ? <ChevronUp size={16} style={{color:'#94A3B8'}}/> : <ChevronDown size={16} style={{color:'#94A3B8'}}/>}
        </div>
      </button>

      {expanded && (
        <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:10}}>
          {pending.length > 0 && (
            <>
              <p style={{fontSize:'0.7rem',fontWeight:800,color:'#92400E',textTransform:'uppercase',letterSpacing:'0.06em',display:'flex',alignItems:'center',gap:5,margin:'0 0 4px'}}>
                <Clock size={11}/> Needs Review
              </p>
              {pending.map(offer => (
                <OfferCard key={offer._id} offer={offer} processingId={processingId} onDecision={onDecision}/>
              ))}
            </>
          )}
          {decided.length > 0 && (
            <>
              {pending.length > 0 && <hr style={{border:'none',borderTop:'1px solid #F1F5F9',margin:'4px 0'}}/>}
              <p style={{fontSize:'0.7rem',fontWeight:800,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 4px'}}>
                Decision History
              </p>
              {decided.map(offer => (
                <OfferCard key={offer._id} offer={offer} processingId={processingId} onDecision={onDecision}/>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ScreeningPage() {
  const router = useRouter();
  const { user: parsed } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (parsed && !['landlord', 'admin'].includes(parsed.role)) {
      router.push('/dashboard');
    }
  }, [parsed, router]);

  const [grouped, setGrouped]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    try {
      const { data } = await api.get('/listings/offers');
      setGrouped(data.grouped || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (offerId, status) => {
    const action = status === 'accepted' ? 'accept and create a lease draft for' : 'decline';
    if (!window.confirm(`Are you sure you want to ${action} this offer?`)) return;

    setProcessingId(offerId);
    try {
      await api.put(`/listings/offers/${offerId}`, { status });
      if (status === 'accepted') {
        toast('Offer accepted! A draft agreement has been automatically generated in your Agreements tab.', 'success');
      }
      fetchOffers();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update offer', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const totalPending = grouped.reduce(
    (acc, g) => acc + g.offers.filter(o => o.status === 'pending').length, 0
  );

  if (loading) return (
    <div style={{display:'flex',justifyContent:'center',padding:40}}>
      <Loader2 className="animate-spin" style={{width:32,height:32,color:'#2563EB'}}/>
    </div>
  );

  return (
    <div style={{maxWidth:900,margin:'0 auto',paddingBottom:60}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:'1.6rem',color:'#0F172A',margin:0,letterSpacing:'-0.02em'}}>Tenant Screening</h1>
          <p style={{color:'#64748B',fontSize:'0.85rem',marginTop:4}}>Review Rent, Security, and Maintenance offers from prospective tenants</p>
        </div>
        {totalPending > 0 && (
          <span style={{background:'#FBBF24',color:'white',borderRadius:20,padding:'5px 16px',fontSize:'0.8rem',fontWeight:800,flexShrink:0}}>
            {totalPending} Pending Review
          </span>
        )}
      </div>

      {/* Filter Bar */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[
          { key:'all',         label:'All Offers'         },
          { key:'rent',        label:'Rent Offers'        },
          { key:'security',    label:'Security Offers'    },
          { key:'maintenance', label:'Maintenance Offers' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterType(f.key)}
            style={{
              padding:'6px 14px',borderRadius:20,fontWeight:700,fontSize:'0.78rem',cursor:'pointer',
              border:`1.5px solid ${filterType===f.key ? '#2563EB' : '#E2E8F0'}`,
              background: filterType===f.key ? '#2563EB' : 'white',
              color: filterType===f.key ? 'white' : '#64748B',
              transition:'all 0.15s',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Groups */}
      {grouped.length === 0 ? (
        <div style={{textAlign:'center',padding:'64px 0',background:'white',borderRadius:16,border:'2px dashed #E2E8F0'}}>
          <Building2 size={48} style={{color:'#CBD5E1',margin:'0 auto 12px'}}/>
          <p style={{fontWeight:700,color:'#374151',fontSize:'1.05rem'}}>No offers yet</p>
          <p style={{color:'#94A3B8',fontSize:'0.85rem',marginTop:4}}>When tenants submit offers on your listed properties, they will appear here grouped by property.</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {grouped.map(group => (
            <PropertyGroup
              key={group.property?._id}
              group={group}
              processingId={processingId}
              onDecision={handleDecision}
              filterType={filterType}
            />
          ))}
        </div>
      )}
    </div>
  );
}