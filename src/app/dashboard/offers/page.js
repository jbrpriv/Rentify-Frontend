'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Tag, Building2, ChevronDown, ChevronUp, Check, X, ArrowLeftRight,
  Loader2, Clock, CheckCircle, XCircle, AlertCircle, Plus, RefreshCw,
  TrendingDown, TrendingUp, Minus, Calendar, FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── Palette ────────────────────────────────────────────────────────────── */
const STATUS_META = {
  pending: { label: 'Pending', color: '#0B2D72', bg: '#E6EAF2', border: 'rgba(11, 45, 114, 0.15)' },
  countered: { label: 'Countered', color: '#0B2D72', bg: '#E6EAF2', border: 'rgba(11, 45, 114, 0.15)' },
  accepted: { label: 'Accepted', color: '#0B2D72', bg: '#E6EAF2', border: 'rgba(11, 45, 114, 0.15)' },
  declined: { label: 'Declined', color: '#0B2D72', bg: '#E6EAF2', border: 'rgba(11, 45, 114, 0.15)' },
  withdrawn: { label: 'Withdrawn', color: '#0B2D72', bg: '#E6EAF2', border: 'rgba(11, 45, 114, 0.15)' },
};

/* ─── Diff badge ─────────────────────────────────────────────────────────── */
function DiffBadge({ listed, proposed }) {
  if (!listed || !proposed) return null;
  const diff = proposed - listed;
  const pct = Math.abs(Math.round((diff / listed) * 100));
  if (diff === 0) return <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>= listed</span>;
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: diff < 0 ? '#16A34A' : '#DC2626', display: 'flex', alignItems: 'center', gap: 2 }}>
      {diff < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
      {diff < 0 ? '-' : '+'}{pct}%
    </span>
  );
}

/* ─── History timeline ───────────────────────────────────────────────────── */
function NegotiationHistory({ history, listedTerms }) {
  const { formatMoney } = useCurrency();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
      {history.map((round, i) => {
        const isLatest = i === history.length - 1;
        const byLandlord = round.offeredBy === 'landlord';
        return (
          <div key={i} style={{
            display: 'flex', gap: 10, padding: '12px 14px',
            background: isLatest ? '#E6EAF2' : '#F8FAFC',
            borderRadius: 10, border: isLatest ? `1.5px solid rgba(11, 45, 114, 0.15)` : '1.5px solid #F1F5F9',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#0B2D72',
              color: 'white',
              fontSize: '0.65rem', fontWeight: 800,
            }}>
              {byLandlord ? 'LL' : 'T'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0B2D72' }}>
                  Round {round.round} — {byLandlord ? 'Landlord' : 'Tenant'}
                </span>
                {isLatest && <span style={{ fontSize: '0.65rem', background: '#F1F5F9', color: '#64748B', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>Latest</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {[
                  { label: 'Monthly Rent', val: round.monthlyRent, listed: listedTerms?.monthlyRent },
                  { label: 'Security Deposit', val: round.securityDeposit, listed: listedTerms?.securityDeposit },
                  { label: 'Duration', val: `${round.leaseDurationMonths} mo`, raw: round.leaseDurationMonths },
                ].map(({ label, val, listed }) => (
                  <div key={label}>
                    <p style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, marginBottom: 1 }}>{label}</p>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{typeof val === 'number' ? formatMoney(val) : val}</p>
                    {listed && typeof val === 'number' && <DiffBadge listed={listed} proposed={val} />}
                  </div>
                ))}
              </div>
              {round.note && (
                <p style={{ marginTop: 6, fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', background: '#F8FAFC', borderRadius: 6, padding: '6px 10px', borderLeft: '3px solid rgba(11, 45, 114, 0.3)' }}>
                  "{round.note}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Landlord: Counter form ─────────────────────────────────────────────── */
function CounterForm({ offer, onSubmit, onCancel, loading }) {
  const { currency, convertFromUSD } = useCurrency();
  const last = offer.history[offer.history.length - 1];
  const [form, setForm] = useState({
    monthlyRent: convertFromUSD(last?.monthlyRent || offer.listedTerms?.monthlyRent || 0) || '',
    securityDeposit: convertFromUSD(last?.securityDeposit || offer.listedTerms?.securityDeposit || 0) || '',
    leaseDurationMonths: last?.leaseDurationMonths || offer.listedTerms?.leaseDurationMonths || 12,
    note: '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ background: '#E6EAF2', border: '1.5px solid rgba(11, 45, 114, 0.15)', borderRadius: 12, padding: '16px 18px', marginTop: 12 }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0B2D72', marginBottom: 12 }}>Your Counter-Offer</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        {[
          { label: `Monthly Rent (${currency})`, key: 'monthlyRent' },
          { label: `Security Deposit (${currency})`, key: 'securityDeposit' },
          { label: 'Duration (months)', key: 'leaseDurationMonths' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>{label}</label>
            <input
              type="number" value={form[key]} onChange={set(key)} min={0}
              style={{ width: '100%', padding: '8px 10px', border: '1.5px solid rgba(11, 45, 114, 0.15)', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>Note (optional)</label>
        <input type="text" value={form.note} onChange={set('note')} maxLength={300} placeholder="Add a short note to the tenant…"
          style={{ width: '100%', padding: '8px 10px', border: '1.5px solid rgba(11, 45, 114, 0.15)', borderRadius: 8, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onSubmit(form)} disabled={loading}
          style={{ flex: 1, padding: '9px', background: '#0B2D72', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />}
          Send Counter
        </button>
        <button onClick={onCancel} style={{ padding: '9px 16px', border: '1.5px solid rgba(11, 45, 114, 0.15)', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, color: '#64748B', background: 'white', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Tenant: New offer form ─────────────────────────────────────────────── */
function TenantOfferForm({ properties, onSubmit, loading }) {
  const { formatMoney, currency, convertFromUSD } = useCurrency();
  const [selectedProp, setSelectedProp] = useState('');
  const [form, setForm] = useState({ monthlyRent: '', securityDeposit: '', leaseDurationMonths: '12' });
  const prop = properties.find(p => p._id === selectedProp);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const fields = [
    { key: 'monthlyRent', label: 'Monthly Rent', unit: currency, landlordVal: convertFromUSD(prop?.financials?.monthlyRent) },
    { key: 'securityDeposit', label: 'Security Deposit', unit: currency, landlordVal: convertFromUSD(prop?.financials?.securityDeposit) },
    { key: 'leaseDurationMonths', label: 'Duration', unit: 'mo', landlordVal: prop?.leaseTerms?.defaultDurationMonths || 12 },
  ];

  return (
    <motion.div
      style={{ background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: '24px', marginBottom: 24 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.21, 0.6, 0.35, 1] }}
    >
      <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', marginBottom: 16 }}>Submit a New Offer</h3>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 6 }}>Select Property</label>
        <select value={selectedProp} onChange={e => setSelectedProp(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
          <option value="">— Choose a listed property —</option>
          {properties.map(p => (
            <option key={p._id} value={p._id}>{p.title} — {p.address?.city} ({formatMoney(p.financials?.monthlyRent)}/mo)</option>
          ))}
        </select>
      </div>

      {prop && (
        <>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 14px', marginBottom: 16, border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>LANDLORD'S LISTED TERMS</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              <div><p style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Monthly Rent</p><p style={{ fontWeight: 700, color: '#0F172A' }}>{formatMoney(prop.financials.monthlyRent)}</p></div>
              <div><p style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Security Deposit</p><p style={{ fontWeight: 700, color: '#0F172A' }}>{formatMoney(prop.financials.securityDeposit)}</p></div>
              <div><p style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Duration</p><p style={{ fontWeight: 700, color: '#0F172A' }}>{prop.leaseTerms?.defaultDurationMonths || 12} months</p></div>
            </div>
          </div>

          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: 10 }}>YOUR OFFER</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {fields.map(({ key, label, unit, landlordVal }) => (
              <div key={key}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>
                  {label} ({unit})
                </label>
                <input
                  type="number" value={form[key]} onChange={set(key)} min={0}
                  placeholder={landlordVal ? String(landlordVal) : ''}
                  style={{ width: '100%', padding: '9px 11px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: '0.9rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                />
                {landlordVal && form[key] && <DiffBadge listed={landlordVal} proposed={Number(form[key])} />}
              </div>
            ))}
          </div>

            <button
            onClick={() => onSubmit({ 
              propertyId: selectedProp, 
              monthlyRent: convertToUSD(Number(form.monthlyRent) || 0),
              securityDeposit: convertToUSD(Number(form.securityDeposit) || 0),
            })}
            disabled={loading || !form.monthlyRent || !form.securityDeposit}
            style={{
              width: '100%', padding: '11px', background: '#0B2D72', color: 'white',
              border: 'none', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.8 : 1,
            }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Tag size={16} />}
            Submit Offer
          </button>
        </>
      )}
    </motion.div>
  );
}


/* ─── Accept modal — pick template + start date ─────────────────────────── */
function AcceptModal({ offer, onConfirm, onClose, loading }) {
  const { formatMoney } = useCurrency();
  const [templates, setTemplates] = React.useState([]);
  const [tmplLoading, setTmplLoad] = React.useState(true);
  const [templateId, setTemplateId] = React.useState('');
  const [startDate, setStartDate] = React.useState(() => new Date().toISOString().slice(0, 10));

  React.useEffect(() => {
    api.get('/agreement-templates?status=approved')
      .then(({ data }) => setTemplates(data))
      .catch(() => { })
      .finally(() => setTmplLoad(false));
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', margin: 0 }}>Accept Offer</h3>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '3px 0 0' }}>Choose a template and lease start date</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Offer summary */}
          <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agreed Terms</p>
            <p style={{ fontWeight: 700, color: '#0F172A', margin: 0 }}>{offer.property?.title}</p>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0' }}>
              {formatMoney(offer.history[offer.history.length - 1]?.monthlyRent || 0)}/mo · Deposit {formatMoney(offer.history[offer.history.length - 1]?.securityDeposit || 0)} · {offer.history[offer.history.length - 1]?.leaseDurationMonths} months
            </p>
          </div>

          {/* Start date */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <Calendar size={13} /> Lease Start Date
            </label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Template picker */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <FileText size={13} /> Agreement Template <span style={{ fontWeight: 400, color: '#94A3B8' }}>(optional)</span>
            </label>
            {tmplLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', color: '#94A3B8', fontSize: '0.82rem' }}>
                <Loader2 size={14} className="animate-spin" /> Loading templates…
              </div>
            ) : templates.length === 0 ? (
              <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, fontSize: '0.8rem', color: '#92400E' }}>
                No approved templates yet. <a href="/dashboard/agreement-templates" style={{ color: '#D97706', fontWeight: 700 }}>Create one →</a>
              </div>
            ) : (
              <>
                <div onClick={() => setTemplateId('')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${!templateId ? '#2563EB' : '#E2E8F0'}`, background: !templateId ? '#EFF6FF' : 'white', marginBottom: 6, cursor: 'pointer' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${!templateId ? '#2563EB' : '#CBD5E1'}`, background: !templateId ? '#2563EB' : 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!templateId && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: !templateId ? '#1D4ED8' : '#64748B' }}>No template — blank agreement</span>
                </div>
                {templates.map(t => (
                  <div key={t._id} onClick={() => setTemplateId(t._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${templateId === t._id ? '#2563EB' : '#E2E8F0'}`, background: templateId === t._id ? '#EFF6FF' : 'white', marginBottom: 6, cursor: 'pointer' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${templateId === t._id ? '#2563EB' : '#CBD5E1'}`, background: templateId === t._id ? '#2563EB' : 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {templateId === t._id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: templateId === t._id ? '#1D4ED8' : '#0F172A', margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: '2px 0 0' }}>{t.clauseIds?.length || 0} clauses{t.description ? ` · ${t.description}` : ''}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', color: '#64748B', background: 'white', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onConfirm({ templateId: templateId || null, startDate })} disabled={loading}
            style={{ flex: 2, padding: '11px', background: '#16A34A', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            Create Agreement
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Single offer card ───────────────────────────────────────────────────── */
function OfferCard({ offer, user, onAction, actionLoading }) {
  const { formatMoney } = useCurrency();
  const [expanded, setExpanded] = useState(false);
  const [countering, setCountering] = useState(false);

  const meta = STATUS_META[offer.status] || STATUS_META.pending;
  const last = offer.history[offer.history.length - 1];
  const isActive = ['pending', 'countered'].includes(offer.status);
  const isLandlordView = user.role === 'landlord';

  // Whose turn is it?
  const lastBy = last?.offeredBy;
  const myTurn = isLandlordView ? lastBy === 'tenant' : lastBy === 'landlord';

  return (
    <motion.div
      style={{
        background: 'white', borderRadius: 16, border: `1.5px solid ${meta.border}`,
        overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
      }}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1.25, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.01 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        {/* Property thumb */}
        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#E6EAF2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {offer.property?.images?.[0]
            ? <img src={offer.property.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Building2 size={20} color="#0B2D72" />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {offer.property?.title}
          </p>
          {isLandlordView
            ? <p style={{ fontSize: '0.76rem', color: '#64748B' }}>From: <strong>{offer.tenant?.name}</strong> · {offer.tenant?.email}</p>
            : <p style={{ fontSize: '0.76rem', color: '#64748B' }}>{offer.property?.address?.city}</p>
          }
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>{formatMoney(last?.monthlyRent || 0)}/mo</p>
          <p style={{ fontSize: '0.72rem', color: '#64748B' }}>Round {offer.history.length}</p>
        </div>

        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, whiteSpace: 'nowrap' }}>
          {meta.label}
        </span>

        {expanded ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: '1px solid #F1F5F9', padding: '14px 18px 18px' }}>
          <NegotiationHistory history={offer.history} listedTerms={offer.listedTerms} />

          {/* Action buttons */}
          {isActive && (
            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {isLandlordView && (
                <>
                  {myTurn && !countering && (
                    <>
                      <button onClick={() => onAction('accept', offer._id)} disabled={!!actionLoading}
                        style={{ padding: '9px 18px', background: '#16A34A', color: 'white', border: 'none', borderRadius: 9, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {actionLoading === `accept-${offer._id}` ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        Accept & Draft Agreement
                      </button>
                      <button onClick={() => setCountering(true)}
                        style={{ padding: '9px 16px', background: '#E6EAF2', color: '#0B2D72', border: '1.5px solid rgba(11, 45, 114, 0.15)', borderRadius: 9, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ArrowLeftRight size={13} /> Counter
                      </button>
                      <button onClick={() => onAction('decline', offer._id)} disabled={!!actionLoading}
                        style={{ padding: '9px 14px', background: '#FFF7F7', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 9, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                        Decline
                      </button>
                    </>
                  )}
                  {!myTurn && !countering && (
                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} /> Waiting for tenant to respond to your counter…
                    </p>
                  )}
                  {countering && (
                    <div style={{ width: '100%' }}>
                      <CounterForm
                        offer={offer}
                        loading={actionLoading === `counter-${offer._id}`}
                        onSubmit={(form) => { onAction('counter', offer._id, form); setCountering(false); }}
                        onCancel={() => setCountering(false)}
                      />
                    </div>
                  )}
                </>
              )}

              {!isLandlordView && (
                <>
                  {/* myTurn === true → landlord just countered, it's tenant's turn to act */}
                  {!myTurn ? (
                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} /> Waiting for landlord to respond to your offer…
                    </p>
                  ) : (
                    !countering && (
                      <>
                        <button onClick={() => setCountering(true)}
                          style={{ padding: '9px 16px', background: '#E6EAF2', color: '#0B2D72', border: '1.5px solid rgba(11, 45, 114, 0.15)', borderRadius: 9, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ArrowLeftRight size={13} /> Counter Back
                        </button>
                        <button onClick={() => onAction('withdraw', offer._id)} disabled={!!actionLoading}
                          style={{ padding: '9px 14px', background: '#FFF7F7', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 9, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                          Withdraw
                        </button>
                      </>
                    )
                  )}
                  {countering && (
                    <div style={{ width: '100%' }}>
                      <CounterForm
                        offer={offer}
                        loading={actionLoading === `counter-${offer._id}`}
                        onSubmit={(form) => { onAction('counter', offer._id, form); setCountering(false); }}
                        onCancel={() => setCountering(false)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {offer.status === 'accepted' && offer.agreement && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={15} color="#16A34A" />
              <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>Agreement drafted — go to Agreements tab to sign</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function OffersPage() {
  const router = useRouter();
  const { user } = useUser();
  const { convertToUSD } = useCurrency();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('active'); // 'active' | 'history'

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000); };

  const fetchOffers = useCallback(async () => {
    try {
      const { data } = await api.get('/offers');
      setOffers(data.offers || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, []); // eslint-disable-line

  const handleAction = async (type, offerId, form) => {
    if (type === 'accept') {
      // Redirect to the agreement draft page with offerId pre-filled
      // The full drag-and-drop clause picker lives there
      router.push(`/dashboard/agreements/new?offerId=${offerId}`);
      return;
    }
    const key = `${type}-${offerId}`;
    setActionLoading(key);
    try {
      if (type === 'decline') await api.put(`/offers/${offerId}/decline`);
      if (type === 'withdraw') await api.delete(`/offers/${offerId}`);
      if (type === 'counter') {
        // Convert counter offer amounts from selected currency to USD before posting
        const convertedForm = {
          ...form,
          monthlyRent: convertToUSD(Number(form.monthlyRent) || 0),
          securityDeposit: convertToUSD(Number(form.securityDeposit) || 0),
        };
        await api.post(`/offers/${offerId}/counter`, convertedForm);
      }
      showToast(`Offer ${type === 'withdraw' ? 'withdrawn' : type + 'd'} successfully`);
      fetchOffers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', false);
    } finally {
      setActionLoading(null);
    }
  };


  if (!user || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1.25, 0.36, 1] }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 16, background: '#1e293b', color: '#e5e7eb' }}
      >
        <Loader2 className="animate-spin" size={18} color="#6366f1" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading offers…</span>
      </motion.div>
    </div>
  );

  const active = offers.filter(o => ['pending', 'countered'].includes(o.status));
  const history = offers.filter(o => !['pending', 'countered'].includes(o.status));
  const displayed = filter === 'active' ? active : history;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&display=swap');`}</style>

      <motion.div
        style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.21, 0.6, 0.35, 1] }}
      >

        {/* Header */}
        <motion.div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.21, 0.6, 0.35, 1] }}
        >
          <div>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.9rem', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {user.role === 'landlord' ? 'Incoming Offers' : 'My Offers'}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: 4 }}>
              {user.role === 'landlord'
                ? `${active.length} active negotiation${active.length !== 1 ? 's' : ''} across your properties`
                : `${active.length} active offer${active.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={fetchOffers} style={{ padding: '8px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </motion.div>

        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.21, 0.6, 0.35, 1] }}
            style={{ padding: '12px 16px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, background: toast.ok ? '#F0FDF4' : '#FFF7F7', color: toast.ok ? '#16A34A' : '#DC2626', border: `1px solid ${toast.ok ? '#BBF7D0' : '#FECACA'}` }}
          >
            {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {toast.msg}
          </motion.div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 10, padding: 4, alignSelf: 'flex-start' }}>
          {[['active', `Active (${active.length})`], ['history', `History (${history.length})`]].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{
                padding: '6px 16px', borderRadius: 7, fontSize: '0.82rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                background: filter === k ? 'white' : 'transparent', color: filter === k ? '#0F172A' : '#94A3B8',
                boxShadow: filter === k ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Offer list */}
        {displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '2px dashed #E2E8F0' }}>
            <Tag size={40} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#475569', fontSize: '1.1rem' }}>
              {filter === 'active' ? 'No active offers' : 'No offer history'}
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: 4 }}>
              {filter === 'active' && user.role === 'tenant' ? (
                <>
                  No active offers.{' '}
                  <a href="/browse" style={{ color: '#4F46E5', fontWeight: 700 }}>Browse properties</a> to make one.
                </>
              ) : ''}
              {filter === 'active' && user.role === 'landlord' ? 'When tenants submit offers on your properties, they will appear here.' : ''}
              {filter === 'history' ? 'Completed negotiations will appear here.' : ''}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {displayed.map(offer => (
              <OfferCard
                key={offer._id}
                offer={offer}
                user={user}
                onAction={handleAction}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </motion.div>

    </>
  );
}