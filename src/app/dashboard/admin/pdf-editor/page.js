'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCcw, Save } from 'lucide-react';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import useGlobalPdfTheme from '@/hooks/useGlobalPdfTheme';

export default function AdminPdfEditorPage() {
  const { toast } = useToast();
  const { cssVars } = useGlobalPdfTheme();

  const [themes, setThemes] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('agreement');
  const [previewMode, setPreviewMode] = useState('realtime');
  const [previewLoading, setPreviewLoading] = useState(false);

  const activeTheme = useMemo(() => themes.find((t) => t._id === activeId) || null, [themes, activeId]);

  const loadThemes = async () => {
    try {
      const { data } = await api.get('/pdf-themes');
      const list = Array.isArray(data) ? data : [];
      setThemes(list);
      const chosen = list.find((t) => t.isDefault) || list[0] || null;
      if (chosen) {
        setActiveId(chosen._id);
        setForm({
          primaryColor: chosen.primaryColor,
          accentColor: chosen.accentColor,
          backgroundColor: chosen.backgroundColor,
          fontFamily: chosen.fontFamily,
          fontSizeScale: chosen.fontSizeScale || 1,
          description: chosen.description || '',
          isDefault: !!chosen.isDefault,
          isReceiptDefault: !!chosen.isReceiptDefault,
        });
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load PDF themes', 'error');
    }
  };

  useEffect(() => {
    loadThemes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const renderPdfPreview = async () => {
    if (!activeId || !form) return;

    setPreviewLoading(true);
    try {
      const { data } = await api.get(`/pdf-themes/${activeId}/preview`, {
        params: {
          primaryColor: form.primaryColor,
          accentColor: form.accentColor,
          backgroundColor: form.backgroundColor,
          fontFamily: form.fontFamily,
          fontSizeScale: form.fontSizeScale,
          previewType,
        },
        responseType: 'blob',
      });

      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      setPreviewUrl('');
      toast(err.response?.data?.message || 'Failed to render PDF preview', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const save = async () => {
    if (!activeId || !form) return;

    setSaving(true);
    try {
      await api.put(`/pdf-themes/${activeId}`, {
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        backgroundColor: form.backgroundColor,
        fontFamily: form.fontFamily,
        fontSizeScale: form.fontSizeScale,
        description: form.description,
      });

      if (form.isDefault && !activeTheme?.isDefault) {
        await api.put(`/pdf-themes/${activeId}/set-default`);
      }

      if (form.isReceiptDefault && !activeTheme?.isReceiptDefault) {
        await api.put(`/pdf-themes/${activeId}/set-receipt-default`);
      }

      toast('Theme saved', 'success');
      await loadThemes();
    } catch (err) {
      toast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return <p className="text-sm text-slate-500">Loading branding editor...</p>;
  }

  const scale = Number(form.fontSizeScale || 1);
  const layoutStyle = activeTheme?.layoutStyle || 'modern';
  const previewBrand = 'Brand Name';

  return (
    <div style={cssVars} className="max-w-7xl mx-auto pb-10">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Global PDF Branding</h1>
        <p className="text-sm text-slate-500">Changes affect future generated PDFs for agreements and receipts using each layout.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[260px_380px_1fr] gap-4">
        <aside className="rounded-2xl border bg-white p-3" style={{ borderColor: 'var(--brand-border)' }}>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 px-2 py-1">Theme List</p>
          <div className="mt-1 space-y-1">
            {themes.map((theme) => (
              <button
                key={theme._id}
                onClick={() => {
                  setActiveId(theme._id);
                  setPreviewUrl('');
                  setForm({
                    primaryColor: theme.primaryColor,
                    accentColor: theme.accentColor,
                    backgroundColor: theme.backgroundColor,
                    fontFamily: theme.fontFamily,
                    fontSizeScale: theme.fontSizeScale || 1,
                    description: theme.description || '',
                    isDefault: !!theme.isDefault,
                    isReceiptDefault: !!theme.isReceiptDefault,
                  });
                }}
                className="w-full text-left rounded-lg border px-3 py-2"
                style={theme._id === activeId ? { borderColor: 'var(--brand-primary)', background: 'var(--brand-primary-soft)' } : { borderColor: 'var(--brand-border)', background: '#E6EAF2' }}
              >
                <p className="text-sm font-bold text-slate-900">{theme.name}</p>
                <p className="text-xs text-slate-500">
                  {theme.layoutStyle}
                  {theme.isDefault ? ' • agreement default' : ''}
                  {theme.isReceiptDefault ? ' • receipt default' : ''}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border bg-white p-4" style={{ borderColor: 'var(--brand-border)' }}>
          <p className="text-sm font-bold text-slate-800 mb-3">Editor</p>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {['primaryColor', 'accentColor', 'backgroundColor'].map((k) => (
                <div key={k}>
                  <label className="text-[11px] font-bold text-slate-500 capitalize">{k.replace('Color', '')}</label>
                  <input type="color" value={form[k]} onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))} className="mt-1 w-full h-10 rounded border border-slate-200" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500">Font Family</label>
                <select value={form.fontFamily} onChange={(e) => setForm((p) => ({ ...p, fontFamily: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times-Roman">Times-Roman</option>
                  <option value="Courier">Courier</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500">Font Scale: {Number(form.fontSizeScale).toFixed(2)}x</label>
                <input type="range" min="0.8" max="1.4" step="0.05" value={form.fontSizeScale} onChange={(e) => setForm((p) => ({ ...p, fontSizeScale: Number(e.target.value) }))} className="mt-2 w-full" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} />
              Set as Global Default
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isReceiptDefault}
                onChange={(e) => setForm((p) => ({ ...p, isReceiptDefault: e.target.checked }))}
              />
              Set as Receipt Default
            </label>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Changes affect all future PDF downloads for agreements and receipts using this layout.
            </div>

            <button onClick={save} disabled={saving} className="w-full rounded-xl px-4 py-2.5 text-sm font-extrabold text-white inline-flex items-center justify-center gap-2" style={{ background: 'var(--brand-primary)' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
            </button>
          </div>
        </section>

        <section className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Live Preview</p>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  onClick={() => setPreviewMode('realtime')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md"
                  style={previewMode === 'realtime' ? { background: 'var(--brand-primary)', color: '#fff' } : { color: '#334155' }}
                >
                  Realtime
                </button>
                <button
                  onClick={() => setPreviewMode('pdf')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md"
                  style={previewMode === 'pdf' ? { background: 'var(--brand-primary)', color: '#fff' } : { color: '#334155' }}
                >
                  PDF
                </button>
              </div>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  onClick={() => setPreviewType('agreement')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md"
                  style={previewType === 'agreement' ? { background: 'var(--brand-primary)', color: '#fff' } : { color: '#334155' }}
                >
                  Agreement
                </button>
                <button
                  onClick={() => setPreviewType('receipt')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md"
                  style={previewType === 'receipt' ? { background: 'var(--brand-primary)', color: '#fff' } : { color: '#334155' }}
                >
                  Receipt
                </button>
              </div>
              {previewMode === 'pdf' ? (
                <button onClick={renderPdfPreview} className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1">
                  {previewLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} Render PDF
                </button>
              ) : (
                <button onClick={() => loadThemes()} className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1"><RefreshCcw size={12} /> Refresh Themes</button>
              )}
            </div>
          </div>
          <div className="h-[74vh] bg-slate-50">
            {previewMode === 'realtime' ? (
              <div className="w-full h-full p-4 overflow-auto">
                {/* Outer page shell — white background always, no border on container */}
                <div
                  className="mx-auto shadow-sm"
                  style={{
                    maxWidth: 680,
                    minHeight: 960,
                    background: '#fff',
                    color: '#111827',
                    fontFamily: form.fontFamily === 'Times-Roman' ? 'Georgia, serif' : form.fontFamily === 'Courier' ? 'monospace' : 'Helvetica Neue, Arial, sans-serif',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >

                  {/* ═══════════════════════════════════════════════
                      MODERN AGREEMENT — exact clone of PDF
                  ═══════════════════════════════════════════════ */}
                  {previewType === 'agreement' && layoutStyle === 'modern' && (() => {
                    const navy = form.primaryColor;
                    const blue = form.accentColor;
                    const lightBlue = form.backgroundColor;
                    return (
                      <div>
                        {/* Navy cover hero — full bleed */}
                        <div style={{ background: navy, padding: '28px 32px 22px', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                          <div style={{ position: 'absolute', right: 10, bottom: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                          <p style={{ fontSize: 22 * scale, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 2 }}>{previewBrand}</p>
                          <p style={{ fontSize: 9 * scale, color: '#93C5FD', marginBottom: 20 }}>Property Management Platform</p>
                          <p style={{ fontSize: 26 * scale, fontWeight: 700, color: '#fff', lineHeight: 1.05 }}>RESIDENTIAL RENTAL</p>
                          <p style={{ fontSize: 26 * scale, fontWeight: 700, color: '#60A5FA', lineHeight: 1.05, marginBottom: 10 }}>AGREEMENT</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p style={{ fontSize: 8 * scale, color: '#93C5FD' }}>Generated: April 4, 2026</p>
                            <p style={{ fontSize: 8 * scale, color: '#93C5FD' }}>Agreement ID: AG-2026-DEMO</p>
                          </div>
                        </div>

                        {/* Party + property cards */}
                        <div style={{ padding: '18px 32px 0' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                            {[['LANDLORD', blue, 'Sample Landlord', 'landlord@example.com'], ['TENANT', blue, 'Sample Tenant', 'tenant@example.com']].map(([role, c, name, email]) => (
                              <div key={role} style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', padding: '10px 12px' }}>
                                <p style={{ fontSize: 7 * scale, fontWeight: 700, color: c, letterSpacing: '0.06em', marginBottom: 6 }}>{role}</p>
                                <p style={{ fontSize: 11 * scale, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{name}</p>
                                <p style={{ fontSize: 8.5 * scale, color: '#6B7280' }}>{email}</p>
                              </div>
                            ))}
                          </div>

                          {/* Property card */}
                          <div style={{ background: lightBlue, border: `1px solid ${blue}`, borderLeft: `4px solid ${blue}`, padding: '10px 12px', marginBottom: 10 }}>
                            <p style={{ fontSize: 7 * scale, fontWeight: 700, color: blue, letterSpacing: '0.06em', marginBottom: 4 }}>PROPERTY</p>
                            <p style={{ fontSize: 11.5 * scale, fontWeight: 700, color: navy, marginBottom: 2 }}>Sunset Apartments - Unit 3B</p>
                            <p style={{ fontSize: 8.5 * scale, color: '#374151' }}>123 Sample Street, Sample City, Sample State</p>
                          </div>

                          {/* 4-col term strip */}
                          <div style={{ background: navy, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', marginBottom: 18 }}>
                            {[['START DATE', 'April 4, 2026'], ['END DATE', 'April 4, 2027'], ['DURATION', '12 months'], ['MONTHLY RENT', '$1,450']].map(([label, val], i) => (
                              <div key={label} style={{ padding: '10px 12px', borderRight: i < 3 ? '0.5px solid rgba(30,64,175,0.6)' : 'none' }}>
                                <p style={{ fontSize: 6.5 * scale, fontWeight: 700, color: '#93C5FD', marginBottom: 4 }}>{label}</p>
                                <p style={{ fontSize: 10 * scale, fontWeight: 700, color: '#fff' }}>{val}</p>
                              </div>
                            ))}
                          </div>

                          {/* 01 Financial Terms section heading */}
                          <div style={{ background: lightBlue, borderLeft: `4px solid ${blue}`, padding: '7px 12px', marginBottom: 0 }}>
                            <p style={{ fontSize: 8.25 * scale, fontWeight: 700, color: navy, letterSpacing: '0.05em' }}>01  FINANCIAL TERMS</p>
                            <p style={{ fontSize: 7 * scale, color: '#6B7280', marginTop: 1 }}>Core rent, deposit, and move-in financial obligations.</p>
                          </div>
                          {[
                            ['Monthly Rent', '$1,450', false],
                            ['Security Deposit', '$1,450', false],
                            ['Maintenance Fee', '$80', false],
                            ['Late Fee', '$50', false],
                            ['Late Fee Grace Period', '5 days', false],
                            ['Pet Deposit (non-refundable)', '$150', false],
                            ['Total Move-In Cost', '$3,130', true],
                          ].map(([label, val, hi], i) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: hi ? lightBlue : i % 2 === 0 ? '#fff' : '#F3F4F6' }}>
                              <p style={{ fontSize: 9.5 * scale, fontWeight: hi ? 700 : 400, color: '#374151' }}>{label}</p>
                              <p style={{ fontSize: 9.5 * scale, fontWeight: hi ? 700 : 400, color: hi ? navy : '#111827' }}>{val}</p>
                            </div>
                          ))}

                          {/* 04 Standard Conditions */}
                          <div style={{ background: lightBlue, borderLeft: `4px solid ${blue}`, padding: '7px 12px', marginTop: 14, marginBottom: 0 }}>
                            <p style={{ fontSize: 8.25 * scale, fontWeight: 700, color: navy, letterSpacing: '0.05em' }}>04  STANDARD CONDITIONS</p>
                          </div>
                          {[
                            'The Tenant shall keep the property in clean and habitable condition throughout the tenancy.',
                            'The Tenant shall not sublet or assign the property without prior written consent from the Landlord.',
                            'The Landlord shall provide 24 hours notice before entering the property except in emergencies.',
                          ].map((text, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 10px', background: '#fff' }}>
                              <span style={{ fontSize: 9 * scale, fontWeight: 700, color: navy, minWidth: 14 }}>{i + 1}.</span>
                              <p style={{ fontSize: 9 * scale, color: '#374151', lineHeight: 1.55 }}>{text}</p>
                            </div>
                          ))}

                          {/* 06 Signatures */}
                          <div style={{ background: lightBlue, borderLeft: `4px solid ${blue}`, padding: '7px 12px', marginTop: 14, marginBottom: 10 }}>
                            <p style={{ fontSize: 8.25 * scale, fontWeight: 700, color: navy, letterSpacing: '0.05em' }}>06  DIGITAL SIGNATURES</p>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                            {[['LANDLORD SIGNATURE', 'Sample Landlord'], ['TENANT SIGNATURE', 'Sample Tenant']].map(([label, name]) => (
                              <div key={label} style={{ border: '1px solid #D1D5DB', borderRadius: 6, overflow: 'hidden' }}>
                                <div style={{ background: navy, padding: '7px 10px' }}>
                                  <p style={{ fontSize: 8 * scale, fontWeight: 700, color: '#fff' }}>{label}</p>
                                </div>
                                <div style={{ padding: '10px', minHeight: 56 }}>
                                  <div style={{ borderBottom: '1px solid #9CA3AF', height: 22, marginBottom: 8 }} />
                                  <p style={{ fontSize: 8.5 * scale, fontWeight: 700, color: '#111827', textAlign: 'center' }}>{name}</p>
                                  <p style={{ fontSize: 7.5 * scale, color: '#374151', textAlign: 'center', marginTop: 2 }}>Pending Signature</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom bar */}
                        <div style={{ background: navy, padding: '8px 32px', textAlign: 'center' }}>
                          <p style={{ fontSize: 7 * scale, color: '#93C5FD' }}>Generated by {previewBrand}. Digital signatures are legally binding.</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═══════════════════════════════════════════════
                      CLASSIC AGREEMENT — exact clone of PDF
                  ═══════════════════════════════════════════════ */}
                  {previewType === 'agreement' && layoutStyle === 'classic' && (() => {
                    const gray900 = form.primaryColor;
                    const gray700 = form.accentColor;
                    const fs = (n) => n * scale;
                    return (
                      <div style={{ padding: '0 40px 32px' }}>
                        {/* Header: RENTBERRY centered, double rules, big title */}
                        <div style={{ textAlign: 'center', padding: '18px 0 8px' }}>
                          <p style={{ fontSize: fs(10), fontWeight: 700, color: gray700, letterSpacing: '0.08em' }}>{previewBrand.toUpperCase()}</p>
                        </div>
                        <div style={{ borderTop: `2px solid ${gray900}`, borderBottom: `0.5px solid ${gray700}`, padding: '10px 0' }}>
                          <p style={{ fontSize: fs(20), fontWeight: 800, textAlign: 'center', color: gray900 }}>RESIDENTIAL RENTAL AGREEMENT</p>
                        </div>
                        <div style={{ borderTop: `0.5px solid ${gray700}`, borderBottom: `2px solid ${gray900}`, marginBottom: 10 }} />
                        <p style={{ fontSize: fs(9), color: gray700, textAlign: 'center', marginBottom: 2 }}>Agreement ID: 69cec0ab9be345e97d0b0440</p>
                        <p style={{ fontSize: fs(9), color: gray700, textAlign: 'center', marginBottom: 18 }}>Date of Preparation: April 4, 2026</p>

                        {/* Thick rule + preamble */}
                        <div style={{ borderTop: `2px solid ${gray900}`, marginBottom: 10 }} />
                        <p style={{ fontSize: fs(9.5), color: gray900, lineHeight: 1.65, textAlign: 'justify', marginBottom: 10 }}>
                          THIS RESIDENTIAL RENTAL AGREEMENT ("Agreement") is entered into as of April 4, 2026, by and between Sample Landlord ("Landlord") and Sample Tenant ("Tenant"), collectively referred to as the "Parties." The Landlord agrees to lease the property described herein to the Tenant, and the Tenant agrees to lease said property from the Landlord, subject to the terms and conditions set forth in this Agreement.
                        </p>
                        <div style={{ borderTop: `0.5px solid ${gray700}`, marginBottom: 18 }} />

                        {/* Sections I–V */}
                        {[
                          {
                            num: 'I', title: 'PARTIES TO THIS AGREEMENT',
                            rows: [
                              ['Landlord', 'Sample Landlord (landlord@example.com)'],
                              ['Tenant', 'Sample Tenant (tenant@example.com)'],
                              ['Property', 'Sunset Apartments - Unit 3B, 123 Sample Street, Sample City, Sample State'],
                            ]
                          },
                          {
                            num: 'II', title: 'LEASE TERM',
                            rows: [
                              ['Commencement Date', 'April 4, 2026'],
                              ['Expiration Date', 'April 4, 2027'],
                              ['Duration', '12 months'],
                            ]
                          },
                          {
                            num: 'III', title: 'RENT AND FINANCIAL OBLIGATIONS',
                            rows: [
                              ['Monthly Rent', '$1,450'],
                              ['Security Deposit', '$1,450'],
                              ['Maintenance Fee', '$80'],
                              ['Late Fee', '$50 (after 5 day grace period)'],
                              ['Pet Deposit (non-refundable)', '$150'],
                              ['Total Move-In Cost', '$3,130'],
                            ]
                          },
                          {
                            num: 'IV', title: 'POLICIES',
                            rows: [
                              ['Utilities', 'Not included in rent'],
                              ['Utility Details', 'Electricity, gas and internet are tenant responsibility.'],
                              ['Pet Policy', 'Permitted (Deposit: $150)'],
                              ['Termination Policy', '30-day written notice required by either party.'],
                            ]
                          },
                        ].map(({ num, title, rows }) => (
                          <div key={num} style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: fs(11), fontWeight: 700, color: gray900, marginBottom: 4 }}>{num}. {title}</p>
                            <div style={{ borderBottom: `0.5px solid ${gray700}`, marginBottom: 8 }} />
                            {rows.map(([label, val]) => (
                              <p key={label} style={{ fontSize: fs(9.5), lineHeight: 1.7, color: gray900, paddingLeft: 12 }}>
                                <strong>{label}:</strong><span style={{ color: gray700 }}>{'  '}{val}</span>
                              </p>
                            ))}
                          </div>
                        ))}

                        {/* V. Standard Conditions */}
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ fontSize: fs(11), fontWeight: 700, color: gray900, marginBottom: 4 }}>V. STANDARD CONDITIONS</p>
                          <div style={{ borderBottom: `0.5px solid ${gray700}`, marginBottom: 8 }} />
                          {[
                            'The Tenant shall keep the property in clean and habitable condition throughout the tenancy.',
                            'The Tenant shall not sublet or assign the property without prior written consent from the Landlord.',
                            'The Landlord shall provide 24 hours notice before entering the property except in emergencies.',
                            'Any damage beyond normal wear and tear shall be deducted from the security deposit.',
                            'The Tenant is responsible for minor maintenance and repairs up to $5,000.',
                          ].map((text, i) => (
                            <p key={i} style={{ fontSize: fs(9.5), lineHeight: 1.65, color: gray900, textAlign: 'justify', paddingLeft: 12, marginBottom: 2 }}>
                              {String.fromCharCode(65 + i)}. {text}
                            </p>
                          ))}
                        </div>

                        {/* VII. Signatures */}
                        <div style={{ marginBottom: 0 }}>
                          <p style={{ fontSize: fs(11), fontWeight: 700, color: gray900, marginBottom: 4 }}>VII. SIGNATURES AND ACKNOWLEDGEMENT</p>
                          <div style={{ borderBottom: `0.5px solid ${gray700}`, marginBottom: 10 }} />
                          <p style={{ fontSize: fs(9.5), color: gray900, textAlign: 'justify', lineHeight: 1.6, marginBottom: 20 }}>
                            IN WITNESS WHEREOF, the parties hereto have executed this Residential Rental Agreement as of the date first written above. By executing this Agreement below, both parties declare that they have read, understood, and agree to be bound by all terms and conditions set forth herein.
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                            {[['LANDLORD', 'Sample Landlord'], ['TENANT', 'Sample Tenant']].map(([role, name]) => (
                              <div key={role}>
                                <p style={{ fontSize: fs(9), fontWeight: 700, color: gray900, marginBottom: 28 }}>{role}</p>
                                <div style={{ borderTop: `0.75px solid ${gray900}`, marginBottom: 6 }} />
                                <p style={{ fontSize: fs(8.5), color: gray900 }}>{name}</p>
                                <p style={{ fontSize: fs(8.5), color: gray700, marginTop: 4 }}>Date: _______________</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Page footer */}
                        <div style={{ borderTop: `0.5px solid ${gray700}`, marginTop: 28, paddingTop: 8, textAlign: 'center' }}>
                          <p style={{ fontSize: fs(7), color: '#6B7280' }}>Generated by {previewBrand}. Digital signatures are legally binding.</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═══════════════════════════════════════════════
                      MINIMALIST AGREEMENT — exact clone of PDF
                  ═══════════════════════════════════════════════ */}
                  {previewType === 'agreement' && layoutStyle === 'minimalist' && (() => {
                    const fs = (n) => n * scale;
                    return (
                      <div>
                        {/* Slim page header */}
                        <div style={{ borderBottom: '0.4px solid #D1D5DB', padding: '14px 32px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ fontSize: fs(7), fontWeight: 700, color: '#111827', letterSpacing: '0.05em' }}>{previewBrand.toUpperCase()}</p>
                          <p style={{ fontSize: fs(7), color: '#6B7280' }}>Ref: AG-2026-DEMO</p>
                          <p style={{ fontSize: fs(7), color: '#6B7280' }}>1 / 2</p>
                        </div>

                        <div style={{ padding: '28px 32px 32px' }}>
                          {/* Big wordmark */}
                          <p style={{ fontSize: fs(36), fontWeight: 700, color: '#111827', lineHeight: 1.0, marginBottom: 10 }}>{previewBrand}</p>
                          <div style={{ height: 3, width: 200, background: '#111827', marginBottom: 14 }} />
                          <p style={{ fontSize: fs(11), color: '#6B7280', letterSpacing: '0.03em', marginBottom: 22 }}>RESIDENTIAL RENTAL AGREEMENT</p>

                          {/* Parties — two inline columns, no box */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 10 }}>
                            {[['LANDLORD', 'Sample Landlord', 'landlord@example.com'], ['TENANT', 'Sample Tenant', 'tenant@example.com']].map(([role, name, email]) => (
                              <div key={role}>
                                <p style={{ fontSize: fs(7), fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 4 }}>{role}</p>
                                <p style={{ fontSize: fs(13), fontWeight: 700, color: '#111827', marginBottom: 2 }}>{name}</p>
                                <p style={{ fontSize: fs(8.5), color: '#6B7280' }}>{email}</p>
                              </div>
                            ))}
                          </div>

                          {/* Property row — thin rule above/below */}
                          <div style={{ borderTop: '0.3px solid #D1D5DB', borderBottom: '0.3px solid #D1D5DB', padding: '8px 0', margin: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p style={{ fontSize: fs(7), fontWeight: 700, color: '#6B7280', marginBottom: 3 }}>PROPERTY</p>
                              <p style={{ fontSize: fs(13), fontWeight: 700, color: '#111827' }}>Sunset Apartments - Unit 3B</p>
                            </div>
                            <p style={{ fontSize: fs(8.5), color: '#374151', textAlign: 'right', maxWidth: '45%' }}>123 Sample Street, Sample City, Sample State</p>
                          </div>

                          {/* 4-col term strip with thin dividers */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '0.3px solid #D1D5DB', padding: '10px 0', marginBottom: 18 }}>
                            {[['START DATE', 'April 4, 2026'], ['END DATE', 'April 4, 2027'], ['DURATION', '12 mo.'], ['MONTHLY RENT', '$1,450']].map(([label, val], i) => (
                              <div key={label} style={{ paddingRight: 8, borderRight: i < 3 ? '0.3px solid #D1D5DB' : 'none', paddingLeft: i > 0 ? 8 : 0 }}>
                                <p style={{ fontSize: fs(7), color: '#6B7280', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</p>
                                <p style={{ fontSize: fs(12), fontWeight: 700, color: '#111827' }}>{val}</p>
                              </div>
                            ))}
                          </div>

                          {/* FINANCIAL TERMS section */}
                          <p style={{ fontSize: fs(7), fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', marginBottom: 6 }}>FINANCIAL TERMS</p>
                          <div style={{ borderTop: '0.3px solid #D1D5DB', marginBottom: 10 }} />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', marginBottom: 18 }}>
                            {[['MONTHLY RENT', '$1,450'], ['SECURITY DEPOSIT', '$1,450'], ['LATE FEE', '$50 after 5d'], ['TOTAL MOVE-IN', '$3,130']].map(([label, val]) => (
                              <div key={label} style={{ marginBottom: 4 }}>
                                <p style={{ fontSize: fs(7.5), fontWeight: 700, color: '#6B7280' }}>{label}</p>
                                <p style={{ fontSize: fs(9.5), color: '#111827' }}>{val}</p>
                              </div>
                            ))}
                          </div>

                          {/* POLICIES & TERMS */}
                          <p style={{ fontSize: fs(7), fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', marginBottom: 6 }}>POLICIES & TERMS</p>
                          <div style={{ borderTop: '0.3px solid #D1D5DB', marginBottom: 10 }} />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', marginBottom: 18 }}>
                            {[['UTILITIES', 'Excluded'], ['PET POLICY', 'Allowed — $150 dep.']].map(([label, val]) => (
                              <div key={label}>
                                <p style={{ fontSize: fs(7.5), fontWeight: 700, color: '#6B7280' }}>{label}</p>
                                <p style={{ fontSize: fs(9.5), color: '#111827' }}>{val}</p>
                              </div>
                            ))}
                          </div>

                          {/* STANDARD LEASE CONDITIONS */}
                          <p style={{ fontSize: fs(7), fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', marginBottom: 6 }}>STANDARD LEASE CONDITIONS</p>
                          <div style={{ borderTop: '0.3px solid #D1D5DB', marginBottom: 10 }} />
                          {[
                            'The Tenant shall keep the property in clean and habitable condition throughout the tenancy.',
                            'The Tenant shall not sublet or assign the property without prior written consent from the Landlord.',
                            'The Landlord shall provide 24 hours notice before entering the property except in emergencies.',
                            'Any damage beyond normal wear and tear shall be deducted from the security deposit.',
                            'The Tenant is responsible for minor maintenance and repairs up to $5,000.',
                          ].map((text, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                              <span style={{ fontSize: fs(8), fontWeight: 700, color: '#111827', minWidth: 16 }}>{i + 1}.</span>
                              <p style={{ fontSize: fs(9), color: '#374151', lineHeight: 1.55 }}>{text}</p>
                            </div>
                          ))}

                          {/* SIGNATURES */}
                          <p style={{ fontSize: fs(7), fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', marginTop: 18, marginBottom: 6 }}>SIGNATURES</p>
                          <div style={{ borderTop: '0.3px solid #D1D5DB', marginBottom: 10 }} />
                          <p style={{ fontSize: fs(9), color: '#374151', lineHeight: 1.55, marginBottom: 20 }}>
                            By signing below, each party confirms they have read and fully accept all terms of this Agreement. Electronic signatures applied through {previewBrand} are legally binding under applicable e-signature laws.
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                            {[['LANDLORD', 'Sample Landlord'], ['TENANT', 'Sample Tenant']].map(([role, name]) => (
                              <div key={role}>
                                <p style={{ fontSize: fs(7), fontWeight: 700, color: '#6B7280', marginBottom: 24 }}>{role}</p>
                                <div style={{ borderTop: '0.5px solid #111827', marginBottom: 6 }} />
                                <p style={{ fontSize: fs(8.5), color: '#111827' }}>{name}</p>
                                <p style={{ fontSize: fs(7.5), color: '#6B7280', marginTop: 2 }}>Pending</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Slim page footer */}
                        <div style={{ borderTop: '0.4px solid #D1D5DB', padding: '8px 32px', textAlign: 'center' }}>
                          <p style={{ fontSize: fs(6.5), color: '#6B7280' }}>{previewBrand} · Rental Agreement · Digital signatures are legally binding</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═══════════════════════════════════════════════
                      MODERN RECEIPT — exact clone of PDF
                  ═══════════════════════════════════════════════ */}
                  {previewType === 'receipt' && layoutStyle === 'modern' && (() => {
                    const navy = form.primaryColor;
                    const blue = form.accentColor;
                    const lightBlue = form.backgroundColor;
                    const fs = (n) => n * scale;
                    return (
                      <div>
                        {/* Navy header stripe */}
                        <div style={{ background: navy, padding: '20px 28px 16px', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', right: -10, top: -10, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p style={{ fontSize: fs(22), fontWeight: 700, color: '#fff', marginBottom: 4 }}>{previewBrand}</p>
                              <p style={{ fontSize: fs(9), color: '#93C5FD' }}>Official Rent Payment Receipt</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ background: '#1D4ED8', padding: '5px 12px', marginBottom: 6 }}>
                                <p style={{ fontSize: fs(9), fontWeight: 700, color: '#fff' }}>RECEIPT  #RCP-0B043F</p>
                              </div>
                              <div style={{ background: blue, padding: '2px 10px', display: 'inline-block' }}>
                                <p style={{ fontSize: fs(7), fontWeight: 700, color: '#fff' }}>RENT</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ padding: '16px 28px' }}>
                          {/* Amount hero */}
                          <div style={{ background: '#F0F7FF', borderLeft: `5px solid ${blue}`, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                              <p style={{ fontSize: fs(9), fontWeight: 700, color: blue, marginBottom: 4 }}>TOTAL AMOUNT PAID</p>
                              <p style={{ fontSize: fs(30), fontWeight: 700, color: navy, lineHeight: 1.1 }}>$1,450</p>
                            </div>
                            <div style={{ background: '#DCFCE7', borderLeft: '4px solid #059669', padding: '8px 16px' }}>
                              <p style={{ fontSize: fs(13), fontWeight: 700, color: '#059669' }}>PAID</p>
                            </div>
                          </div>

                          {/* Two-column detail grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {/* Left — Payment Details */}
                            <div>
                              <div style={{ background: lightBlue, borderLeft: `4px solid ${blue}`, padding: '6px 12px', marginBottom: 0 }}>
                                <p style={{ fontSize: fs(8.25), fontWeight: 700, color: navy }}>PAYMENT DETAILS</p>
                              </div>
                              {[
                                ['Payment Date', 'April 4, 2026'],
                                ['Period Covered', 'April 2026'],
                                ['Payment Method', 'Stripe (Card)'],
                                ['Transaction ID', 'pi_demo_receipt_previe…'],
                              ].map(([label, val], i) => (
                                <div key={label} style={{ display: 'flex', padding: '6px 10px', background: i % 2 === 0 ? '#fff' : '#F3F4F6', gap: 8 }}>
                                  <p style={{ fontSize: fs(7.5), fontWeight: 700, color: '#6B7280', flex: '0 0 44%' }}>{label}</p>
                                  <p style={{ fontSize: fs(8.5), color: '#111827' }}>{val}</p>
                                </div>
                              ))}
                            </div>

                            {/* Right — Property & Tenant */}
                            <div>
                              <div style={{ background: lightBlue, borderLeft: `4px solid ${blue}`, padding: '6px 12px', marginBottom: 0 }}>
                                <p style={{ fontSize: fs(8.25), fontWeight: 700, color: navy }}>PROPERTY & TENANT</p>
                              </div>
                              {[
                                ['Tenant', 'Sample Tenant'],
                                ['Email', 'tenant@example.com'],
                                ['Property', 'Sunset Apartments - Unit 3B'],
                                ['Address', '123 Sample Street, Sample City, Sample State'],
                                ['Receipt No.', '#RCP-0B043F'],
                              ].map(([label, val], i) => (
                                <div key={label} style={{ display: 'flex', padding: '6px 10px', background: i % 2 === 0 ? '#fff' : '#F3F4F6', gap: 8 }}>
                                  <p style={{ fontSize: fs(7.5), fontWeight: 700, color: '#6B7280', flex: '0 0 36%' }}>{label}</p>
                                  <p style={{ fontSize: fs(8), color: '#111827', wordBreak: 'break-word' }}>{val}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* HR */}
                          <div style={{ borderTop: '0.5px solid #D1D5DB', margin: '16px 0' }} />

                          {/* IMPORTANT notes box */}
                          <div style={{ background: '#F3F4F6', borderLeft: '4px solid #9CA3AF', padding: '10px 14px' }}>
                            <p style={{ fontSize: fs(8), fontWeight: 700, color: '#374151', marginBottom: 4 }}>IMPORTANT:</p>
                            <p style={{ fontSize: fs(7.5), color: '#6B7280', lineHeight: 1.55 }}>
                              This receipt confirms that the payment shown above has been received and processed in USD. All amounts are in US Dollars. Please retain this document for your personal records and tax purposes. This receipt does not waive any other obligations under the lease agreement.
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div style={{ background: navy, padding: '8px 28px', textAlign: 'center' }}>
                          <p style={{ fontSize: fs(7), color: '#fff' }}>Generated by {previewBrand} on April 4, 2026. System-generated receipt.</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═══════════════════════════════════════════════
                      CLASSIC RECEIPT — exact clone of PDF
                  ═══════════════════════════════════════════════ */}
                  {previewType === 'receipt' && layoutStyle === 'classic' && (() => {
                    const gray900 = form.primaryColor;
                    const gray700 = form.accentColor;
                    const fs = (n) => n * scale;
                    return (
                      <div style={{ padding: '0 40px 32px' }}>
                        {/* Centered brand + thick double-rule + title */}
                        <div style={{ textAlign: 'center', padding: '18px 0 6px' }}>
                          <p style={{ fontSize: fs(12), fontWeight: 700, color: gray900 }}>{previewBrand}</p>
                        </div>
                        <div style={{ borderTop: `1.5px solid ${gray900}`, borderBottom: `0.5px solid ${gray700}` }} />
                        <p style={{ fontSize: fs(22), fontWeight: 800, textAlign: 'center', color: gray900, padding: '9px 0' }}>OFFICIAL RENT RECEIPT</p>
                        <div style={{ borderTop: `0.5px solid ${gray700}`, borderBottom: `1.5px solid ${gray900}`, marginBottom: 18 }} />

                        {/* Meta + amount on same row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                          <div>
                            <p style={{ fontSize: fs(9), color: gray700, lineHeight: 1.8 }}>Receipt No: RCP-0B0440</p>
                            <p style={{ fontSize: fs(9), color: gray700, lineHeight: 1.8 }}>Date Issued: April 4, 2026</p>
                            <p style={{ fontSize: fs(9), color: gray700, lineHeight: 1.8 }}>Payment Type: RENT</p>
                          </div>
                          <p style={{ fontSize: fs(11), fontWeight: 700, color: gray900 }}>Amount Received: $1,450</p>
                        </div>

                        {/* Field rows — bold label: value */}
                        {[
                          ['Tenant', 'Sample Tenant'],
                          ['Tenant Email', 'tenant@example.com'],
                          ['Property', 'Sunset Apartments - Unit 3B'],
                          ['Address', '123 Sample Street, Sample City, Sample State'],
                          ['Period Covered', 'April 2026'],
                          ['Payment Method', 'Stripe (Card)'],
                          ['Transaction ID', 'pi_demo_receipt_preview'],
                        ].map(([label, val]) => (
                          <p key={label} style={{ fontSize: fs(9), lineHeight: 1.8, color: gray900 }}>
                            <strong>{label}:</strong><span style={{ color: gray700, fontWeight: 400 }}>{'  '}{val}</span>
                          </p>
                        ))}

                        {/* HR + disclaimer */}
                        <div style={{ borderTop: `1px solid ${gray700}`, margin: '16px 0 14px' }} />
                        <p style={{ fontSize: fs(8.5), color: gray700, lineHeight: 1.6, textAlign: 'justify' }}>
                          This receipt confirms that payment has been received by the landlord/property manager. Please retain this document for your records.
                        </p>

                        {/* Page footer */}
                        <div style={{ borderTop: `0.5px solid ${gray700}`, marginTop: 24, paddingTop: 8, textAlign: 'center' }}>
                          <p style={{ fontSize: fs(7.5), color: '#6B7280' }}>Generated by {previewBrand} on April 4, 2026</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═══════════════════════════════════════════════
                      MINIMALIST RECEIPT — exact clone of PDF
                  ═══════════════════════════════════════════════ */}
                  {previewType === 'receipt' && layoutStyle === 'minimalist' && (() => {
                    const fs = (n) => n * scale;
                    return (
                      <div>
                        {/* Top header — no background bar */}
                        <div style={{ padding: '28px 32px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p style={{ fontSize: fs(9), fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', marginBottom: 4 }}>{previewBrand.toUpperCase()}</p>
                              <p style={{ fontSize: fs(28), fontWeight: 700, color: '#111827', lineHeight: 1.0, marginBottom: 6 }}>RECEIPT</p>
                              <div style={{ height: 2, width: 140, background: '#111827' }} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: fs(8.5), color: '#6B7280' }}>Ref RCP-0B0441</p>
                              <p style={{ fontSize: fs(8.5), color: '#6B7280', marginTop: 4 }}>Apr 04, 2026</p>
                            </div>
                          </div>

                          {/* Big amount */}
                          <p style={{ fontSize: fs(34), fontWeight: 700, color: '#111827', lineHeight: 1.0, marginTop: 20 }}>$1,450</p>
                          <p style={{ fontSize: fs(9), color: '#6B7280', marginBottom: 18 }}>Amount Received</p>

                          {/* Thin rule */}
                          <div style={{ borderTop: '0.4px solid #D1D5DB', marginBottom: 16 }} />

                          {/* Field rows: LABEL (bold small-caps gray) | value */}
                          {[
                            ['TENANT', 'Sample Tenant'],
                            ['EMAIL', 'tenant@example.com'],
                            ['PROPERTY', 'Sunset Apartments - Unit 3B'],
                            ['ADDRESS', '123 Sample Street, Sample City, Sample State'],
                            ['PERIOD', 'April 2026'],
                            ['TYPE', 'RENT'],
                            ['METHOD', 'Stripe (Card)'],
                            ['TRANSACTION', 'pi_demo_receipt_preview'],
                          ].map(([label, val]) => (
                            <div key={label} style={{ display: 'grid', gridTemplateColumns: '28% 1fr', gap: 8, marginBottom: 10, alignItems: 'baseline' }}>
                              <p style={{ fontSize: fs(7), fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                              <p style={{ fontSize: fs(10), color: '#111827' }}>{val}</p>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: '0.4px solid #D1D5DB', margin: '20px 0 0', padding: '8px 32px', textAlign: 'center' }}>
                          <p style={{ fontSize: fs(7), color: '#6B7280' }}>Generated by {previewBrand} · Apr 04, 2026</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : previewUrl ? (
              <iframe title="theme-preview" src={previewUrl} className="w-full h-full" style={{ border: 'none' }} />
            ) : previewLoading ? (
              <div className="h-full grid place-items-center text-sm text-slate-400">
                <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Rendering PDF...</span>
              </div>
            ) : (
              <div className="h-full grid place-items-center text-sm text-slate-400">Click Render PDF to generate backend preview</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}