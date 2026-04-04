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
                <div
                  className="mx-auto rounded-xl shadow-sm border"
                  style={{
                    maxWidth: 760,
                    minHeight: 980,
                    background: form.backgroundColor,
                    borderColor: form.accentColor,
                    color: '#0f172a',
                    fontFamily: form.fontFamily,
                    padding: 24,
                  }}
                >
                  {/* ── MODERN AGREEMENT ── */}
                  {previewType === 'agreement' && layoutStyle === 'modern' && (() => {
                    const navy = form.primaryColor;
                    const blue = form.accentColor;
                    const lightBlue = form.backgroundColor;
                    return (
                      <>
                        {/* Top bar */}
                        <div style={{ margin: '-24px -24px 0', padding: '0 20px', height: 36, background: navy, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
                          <span style={{ fontSize: 11 * scale, fontWeight: 700, color: '#fff' }}>{previewBrand}</span>
                          <span style={{ fontSize: 8 * scale, color: '#93C5FD' }}>RENTAL AGREEMENT</span>
                          <span style={{ fontSize: 8 * scale, color: '#93C5FD' }}>Page 1 of 2</span>
                        </div>

                        {/* Cover hero */}
                        <div style={{ margin: '0 -24px', padding: '28px 24px 20px', background: navy, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', right: -20, top: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                          <p style={{ fontSize: 22 * scale, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{previewBrand}</p>
                          <p style={{ fontSize: 9 * scale, color: '#93C5FD', marginBottom: 16 }}>Property Management Platform</p>
                          <p style={{ fontSize: 26 * scale, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>RESIDENTIAL RENTAL</p>
                          <p style={{ fontSize: 26 * scale, fontWeight: 700, color: '#60A5FA', lineHeight: 1.1, marginBottom: 10 }}>AGREEMENT</p>
                          <p style={{ fontSize: 8 * scale, color: '#93C5FD' }}>Generated: April 04, 2026 &nbsp;&nbsp;&nbsp; Agreement ID: AG-2026-DEMO</p>
                        </div>

                        {/* Party cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0 0' }}>
                          {[['LANDLORD', blue, 'Sample Landlord', 'landlord@example.com'], ['TENANT', blue, 'Sample Tenant', 'tenant@example.com']].map(([role, c, name, email]) => (
                            <div key={role} style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: 4, padding: '10px 12px' }}>
                              <p style={{ fontSize: 7 * scale, fontWeight: 700, color: c, letterSpacing: '0.06em', marginBottom: 4 }}>{role}</p>
                              <p style={{ fontSize: 11 * scale, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{name}</p>
                              <p style={{ fontSize: 8.5 * scale, color: '#6B7280' }}>{email}</p>
                            </div>
                          ))}
                        </div>

                        {/* Property card */}
                        <div style={{ background: lightBlue, border: `1px solid ${blue}`, borderLeft: `4px solid ${blue}`, borderRadius: 4, padding: '10px 12px', margin: '10px 0' }}>
                          <p style={{ fontSize: 7 * scale, fontWeight: 700, color: blue, marginBottom: 4 }}>PROPERTY</p>
                          <p style={{ fontSize: 11.5 * scale, fontWeight: 700, color: navy }}>Sunset Apartments — Unit 3B</p>
                          <p style={{ fontSize: 8.5 * scale, color: '#374151', marginTop: 2 }}>123 Main St, Los Angeles, CA</p>
                        </div>

                        {/* Term strip */}
                        <div style={{ background: navy, borderRadius: 4, padding: '10px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', margin: '0 0 14px' }}>
                          {[['START DATE', 'Apr 04, 2026'], ['END DATE', 'Apr 04, 2027'], ['DURATION', '12 months'], ['MONTHLY RENT', '$1,450.00']].map(([label, val], i) => (
                            <div key={label} style={{ padding: '0 12px', borderRight: i < 3 ? '0.5px solid #1E40AF' : 'none' }}>
                              <p style={{ fontSize: 6.5 * scale, fontWeight: 700, color: '#93C5FD', marginBottom: 4 }}>{label}</p>
                              <p style={{ fontSize: 10 * scale, fontWeight: 700, color: '#fff' }}>{val}</p>
                            </div>
                          ))}
                        </div>

                        {/* Section: Financial Terms */}
                        <div style={{ background: lightBlue, borderLeft: `4px solid ${blue}`, padding: '7px 12px', marginBottom: 8 }}>
                          <p style={{ fontSize: 8.25 * scale, fontWeight: 700, color: navy, letterSpacing: '0.05em' }}>01  FINANCIAL TERMS</p>
                        </div>
                        {[['Monthly Rent', '$1,450.00', false], ['Security Deposit', '$2,900.00', false], ['Late Fee', '$50.00', false], ['Total Move-In Cost', '$4,350.00', true]].map(([label, val, hi], i) => (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: hi ? lightBlue : i % 2 === 0 ? '#fff' : '#F3F4F6' }}>
                            <p style={{ fontSize: 9.5 * scale, fontWeight: hi ? 700 : 400, color: '#374151' }}>{label}</p>
                            <p style={{ fontSize: 9.5 * scale, fontWeight: hi ? 700 : 400, color: hi ? navy : '#111827' }}>{val}</p>
                          </div>
                        ))}

                        {/* Section: Standard Conditions */}
                        <div style={{ background: lightBlue, borderLeft: `4px solid ${blue}`, padding: '7px 12px', margin: '12px 0 8px' }}>
                          <p style={{ fontSize: 8.25 * scale, fontWeight: 700, color: navy, letterSpacing: '0.05em' }}>04  STANDARD CONDITIONS</p>
                        </div>
                        {['The Tenant shall keep the property in clean and habitable condition throughout the tenancy.', 'The Tenant shall not sublet or assign the property without prior written consent from the Landlord.'].map((text, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 9 * scale, fontWeight: 700, color: navy, minWidth: 14 }}>{i + 1}.</span>
                            <p style={{ fontSize: 9 * scale, color: '#374151' }}>{text}</p>
                          </div>
                        ))}

                        {/* Signature block */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                          {[['LANDLORD SIGNATURE', 'Sample Landlord', 'Pending Signature'], ['TENANT SIGNATURE', 'Sample Tenant', 'Pending Signature']].map(([label, name, status]) => (
                            <div key={label} style={{ border: '1px solid #D1D5DB', borderRadius: 7, overflow: 'hidden' }}>
                              <div style={{ background: navy, padding: '8px 10px' }}>
                                <p style={{ fontSize: 8 * scale, fontWeight: 700, color: '#fff' }}>{label}</p>
                              </div>
                              <div style={{ padding: '10px', minHeight: 62 }}>
                                <div style={{ borderBottom: '1px solid #6B7280', height: 28, marginBottom: 8 }} />
                                <p style={{ fontSize: 8.5 * scale, fontWeight: 700, color: '#111827', textAlign: 'center' }}>{name}</p>
                                <p style={{ fontSize: 7.5 * scale, color: '#374151', textAlign: 'center', marginTop: 2 }}>{status}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bottom bar */}
                        <div style={{ margin: '16px -24px -24px', background: navy, padding: '8px 20px', textAlign: 'center' }}>
                          <p style={{ fontSize: 7 * scale, color: '#93C5FD' }}>Generated by {previewBrand}. Digital signatures are legally binding.</p>
                        </div>
                      </>
                    );
                  })()}

                  {/* ── CLASSIC AGREEMENT ── */}
                  {previewType === 'agreement' && layoutStyle === 'classic' && (() => {
                    const gray900 = form.primaryColor;
                    const gray700 = form.accentColor;
                    return (
                      <>
                        {/* Page header */}
                        <div style={{ borderBottom: `1px solid ${gray900}`, marginBottom: 12, paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <p style={{ fontSize: 9 * scale, fontWeight: 700, color: gray900 }}>{previewBrand}</p>
                          <p style={{ fontSize: 8 * scale, color: gray700 }}>RENTAL AGREEMENT</p>
                          <p style={{ fontSize: 8 * scale, color: gray700 }}>Page 1 of 2</p>
                        </div>

                        {/* Double-rule title */}
                        <p style={{ fontSize: 10 * scale, fontWeight: 700, color: gray700, textAlign: 'center', marginBottom: 6 }}>{previewBrand.toUpperCase()}</p>
                        <div style={{ borderTop: `2px solid ${gray900}`, borderBottom: `0.5px solid ${gray700}`, padding: '10px 0', marginBottom: 4 }}>
                          <p style={{ fontSize: 20 * scale, fontWeight: 800, textAlign: 'center', color: gray900 }}>RESIDENTIAL RENTAL AGREEMENT</p>
                        </div>
                        <div style={{ borderTop: `0.5px solid ${gray700}`, borderBottom: `2px solid ${gray900}`, marginBottom: 8 }} />
                        <p style={{ fontSize: 9 * scale, color: gray700, textAlign: 'center', marginBottom: 4 }}>Agreement ID: AG-2026-DEMO</p>
                        <p style={{ fontSize: 9 * scale, color: gray700, textAlign: 'center', marginBottom: 18 }}>Date of Preparation: April 04, 2026</p>

                        {/* Preamble */}
                        <div style={{ borderTop: `2px solid ${gray900}`, marginBottom: 8 }} />
                        <p style={{ fontSize: 9.5 * scale, color: gray900, lineHeight: 1.65, textAlign: 'justify', marginBottom: 12 }}>
                          THIS RESIDENTIAL RENTAL AGREEMENT ("Agreement") is entered into as of April 04, 2026, by and between <strong>Sample Landlord</strong> ("Landlord") and <strong>Sample Tenant</strong> ("Tenant"), collectively referred to as the "Parties."
                        </p>
                        <div style={{ borderTop: `0.5px solid #6B7280`, marginBottom: 14 }} />

                        {/* Sections */}
                        {[
                          ['I', 'PARTIES TO THIS AGREEMENT', [['Landlord', 'Sample Landlord (landlord@example.com)'], ['Tenant', 'Sample Tenant (tenant@example.com)'], ['Property', 'Sunset Apartments, 123 Main St, Los Angeles, CA']]],
                          ['II', 'LEASE TERM', [['Commencement Date', 'April 04, 2026'], ['Expiration Date', 'April 04, 2027'], ['Duration', '12 months']]],
                          ['III', 'RENT AND FINANCIAL OBLIGATIONS', [['Monthly Rent', '$1,450.00'], ['Security Deposit', '$2,900.00'], ['Late Fee', '$50.00 (after 5 day grace period)'], ['Total Move-In Cost', '$4,350.00']]],
                        ].map(([num, title, rows]) => (
                          <div key={num} style={{ marginBottom: 14 }}>
                            <p style={{ fontSize: 11 * scale, fontWeight: 700, color: gray900, marginBottom: 4 }}>{num}. {title}</p>
                            <div style={{ borderTop: `0.5px solid ${gray700}`, marginBottom: 8 }} />
                            {rows.map(([label, val]) => (
                              <p key={label} style={{ fontSize: 9.5 * scale, lineHeight: 1.65, color: gray900 }}>
                                <strong>{label}:</strong> <span style={{ color: gray700 }}>  {val}</span>
                              </p>
                            ))}
                          </div>
                        ))}

                        {/* Standard conditions */}
                        <div style={{ marginBottom: 14 }}>
                          <p style={{ fontSize: 11 * scale, fontWeight: 700, color: gray900, marginBottom: 4 }}>V. STANDARD CONDITIONS</p>
                          <div style={{ borderTop: `0.5px solid ${gray700}`, marginBottom: 8 }} />
                          {['A. The Tenant shall keep the property in clean and habitable condition throughout the tenancy.', 'B. The Tenant shall not sublet or assign the property without prior written consent from the Landlord.', 'C. The Landlord shall provide 24 hours notice before entering the property except in emergencies.'].map((t) => (
                            <p key={t} style={{ fontSize: 9.5 * scale, lineHeight: 1.65, color: gray900, textAlign: 'justify', marginBottom: 4 }}>{t}</p>
                          ))}
                        </div>

                        {/* Signatures */}
                        <div style={{ marginTop: 16 }}>
                          <p style={{ fontSize: 11 * scale, fontWeight: 700, color: gray900, marginBottom: 4 }}>VII. SIGNATURES AND ACKNOWLEDGEMENT</p>
                          <div style={{ borderTop: `0.5px solid ${gray700}`, marginBottom: 10 }} />
                          <p style={{ fontSize: 9.5 * scale, color: gray900, textAlign: 'justify', marginBottom: 18 }}>
                            IN WITNESS WHEREOF, the parties hereto have executed this Residential Rental Agreement as of the date first written above.
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                            {[['LANDLORD', 'Sample Landlord', 'Date: _______________'], ['TENANT', 'Sample Tenant', 'Date: _______________']].map(([role, name, date]) => (
                              <div key={role}>
                                <p style={{ fontSize: 9 * scale, fontWeight: 700, color: gray900, marginBottom: 10 }}>{role}</p>
                                <div style={{ borderTop: `0.75px solid ${gray900}`, marginBottom: 6 }} />
                                <p style={{ fontSize: 8.5 * scale, color: gray900 }}>{name}</p>
                                <p style={{ fontSize: 8.5 * scale, color: gray700, marginTop: 4 }}>{date}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: `0.5px solid #6B7280`, marginTop: 20, paddingTop: 8, textAlign: 'center' }}>
                          <p style={{ fontSize: 7 * scale, color: '#6B7280' }}>Generated by {previewBrand}. Digital signatures are legally binding.</p>
                        </div>
                      </>
                    );
                  })()}

                  {/* ── MINIMALIST AGREEMENT ── */}
                  {previewType === 'agreement' && layoutStyle === 'minimalist' && (() => {
                    return (
                      <>
                        {/* Page header */}
                        <div style={{ borderBottom: '0.4px solid #D1D5DB', marginBottom: 20, paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ fontSize: 7 * scale, fontWeight: 700, color: '#111827', letterSpacing: '0.04em' }}>{previewBrand.toUpperCase()}</p>
                          <p style={{ fontSize: 7 * scale, color: '#6B7280' }}>Ref: AG-2026-DEMO</p>
                          <p style={{ fontSize: 7 * scale, color: '#6B7280' }}>1 / 3</p>
                        </div>

                        {/* Large wordmark */}
                        <p style={{ fontSize: 36 * scale, fontWeight: 700, color: '#111827', lineHeight: 1.05, marginBottom: 12 }}>{previewBrand}</p>
                        <div style={{ height: 3, width: 200, background: '#111827', marginBottom: 14 }} />
                        <p style={{ fontSize: 11 * scale, color: '#6B7280', marginBottom: 24 }}>RESIDENTIAL RENTAL AGREEMENT</p>

                        {/* Party cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                          {[['LANDLORD', 'Sample Landlord', 'landlord@example.com'], ['TENANT', 'Sample Tenant', 'tenant@example.com']].map(([role, name, email]) => (
                            <div key={role}>
                              <p style={{ fontSize: 7 * scale, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 4 }}>{role}</p>
                              <p style={{ fontSize: 13 * scale, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{name}</p>
                              <p style={{ fontSize: 8.5 * scale, color: '#6B7280' }}>{email}</p>
                            </div>
                          ))}
                        </div>

                        <div style={{ borderTop: '0.3px solid #D1D5DB', marginBottom: 14 }} />

                        {/* Term strip */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, marginBottom: 14 }}>
                          {[['START', 'Apr 04, 2026'], ['END', 'Apr 04, 2027'], ['DURATION', '12 mo.'], ['RENT', '$1,450']].map(([label, val], i) => (
                            <div key={label} style={{ padding: '0 8px', borderRight: i < 3 ? '0.3px solid #D1D5DB' : 'none' }}>
                              <p style={{ fontSize: 7 * scale, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
                              <p style={{ fontSize: 12 * scale, fontWeight: 700, color: '#111827' }}>{val}</p>
                            </div>
                          ))}
                        </div>

                        <div style={{ borderTop: '0.3px solid #D1D5DB', marginBottom: 18 }} />

                        {/* Financial Terms */}
                        <p style={{ fontSize: 7 * scale, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 10 }}>FINANCIAL TERMS</p>
                        <div style={{ borderTop: '0.3px solid #D1D5DB', marginBottom: 10 }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginBottom: 16 }}>
                          {[['MONTHLY RENT', '$1,450.00'], ['SECURITY DEPOSIT', '$2,900.00'], ['LATE FEE', '$50.00 after 5d'], ['TOTAL MOVE-IN', '$4,350.00']].map(([label, val]) => (
                            <div key={label}>
                              <p style={{ fontSize: 7.5 * scale, fontWeight: 700, color: '#6B7280' }}>{label}</p>
                              <p style={{ fontSize: 9.5 * scale, color: '#111827' }}>{val}</p>
                            </div>
                          ))}
                        </div>

                        {/* Standard Conditions */}
                        <p style={{ fontSize: 7 * scale, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 10 }}>STANDARD LEASE CONDITIONS</p>
                        <div style={{ borderTop: '0.3px solid #D1D5DB', marginBottom: 10 }} />
                        {['The Tenant shall keep the property in clean and habitable condition throughout the tenancy.', 'The Tenant shall not sublet or assign the property without prior written consent from the Landlord.'].map((text, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 8 * scale, fontWeight: 700, color: '#111827', minWidth: 14 }}>{i + 1}.</span>
                            <p style={{ fontSize: 9 * scale, color: '#374151' }}>{text}</p>
                          </div>
                        ))}

                        {/* Signatures */}
                        <p style={{ fontSize: 7 * scale, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginTop: 16, marginBottom: 10 }}>SIGNATURES</p>
                        <div style={{ borderTop: '0.3px solid #D1D5DB', marginBottom: 12 }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                          {[['LANDLORD', 'Sample Landlord'], ['TENANT', 'Sample Tenant']].map(([role, name]) => (
                            <div key={role}>
                              <p style={{ fontSize: 7 * scale, fontWeight: 700, color: '#6B7280', marginBottom: 18 }}>{role}</p>
                              <div style={{ borderTop: '0.5px solid #111827', marginBottom: 6 }} />
                              <p style={{ fontSize: 8.5 * scale, color: '#111827' }}>{name}</p>
                              <p style={{ fontSize: 7.5 * scale, color: '#6B7280', marginTop: 2 }}>Pending</p>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: '0.4px solid #D1D5DB', marginTop: 24, paddingTop: 8, textAlign: 'center' }}>
                          <p style={{ fontSize: 6.5 * scale, color: '#6B7280' }}>{previewBrand} · Rental Agreement · Digital signatures are legally binding</p>
                        </div>
                      </>
                    );
                  })()}

                  {/* ── MODERN RECEIPT ── */}
                  {previewType === 'receipt' && layoutStyle === 'modern' && (() => {
                    const navy = form.primaryColor;
                    const blue = form.accentColor;
                    const lightBlue = form.backgroundColor;
                    return (
                      <>
                        {/* Header stripe */}
                        <div style={{ margin: '-24px -24px 0', padding: '20px 24px 16px', background: navy, position: 'relative', overflow: 'hidden', marginBottom: 0 }}>
                          <div style={{ position: 'absolute', right: -10, top: -10, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p style={{ fontSize: 22 * scale, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{previewBrand}</p>
                              <p style={{ fontSize: 9 * scale, color: '#93C5FD' }}>Official Rent Payment Receipt</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ background: '#1D4ED8', padding: '4px 12px', borderRadius: 2, marginBottom: 4 }}>
                                <p style={{ fontSize: 9 * scale, fontWeight: 700, color: '#fff' }}>RECEIPT  #DEMO0001</p>
                              </div>
                              <p style={{ fontSize: 7 * scale, color: '#93C5FD', background: blue, padding: '2px 8px', borderRadius: 3, display: 'inline-block' }}>RENT</p>
                            </div>
                          </div>
                        </div>

                        {/* Amount hero */}
                        <div style={{ margin: '14px 0', background: '#F0F7FF', borderLeft: `5px solid ${blue}`, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: 9 * scale, fontWeight: 700, color: blue, marginBottom: 4 }}>TOTAL AMOUNT PAID</p>
                            <p style={{ fontSize: 30 * scale, fontWeight: 700, color: navy }}>$1,450.00</p>
                          </div>
                          <div style={{ background: '#DCFCE7', borderLeft: '4px solid #059669', padding: '8px 14px' }}>
                            <p style={{ fontSize: 13 * scale, fontWeight: 700, color: '#059669' }}>PAID</p>
                          </div>
                        </div>

                        {/* Two-column details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                            <div style={{ background: lightBlue, borderLeft: `4px solid ${blue}`, padding: '7px 12px' }}>
                              <p style={{ fontSize: 9 * scale, fontWeight: 700, color: navy }}>PAYMENT DETAILS</p>
                            </div>
                            {[['Payment Date', 'April 04, 2026'], ['Period Covered', 'April 2026'], ['Payment Method', 'Stripe (Card)'], ['Transaction ID', 'pi_3demo…']].map(([label, val], i) => (
                              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: i % 2 === 0 ? '#fff' : '#F3F4F6' }}>
                                <p style={{ fontSize: 7.5 * scale, fontWeight: 700, color: '#6B7280' }}>{label}</p>
                                <p style={{ fontSize: 8.5 * scale, color: '#111827' }}>{val}</p>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{ background: lightBlue, borderLeft: `4px solid ${blue}`, padding: '7px 12px' }}>
                              <p style={{ fontSize: 9 * scale, fontWeight: 700, color: navy }}>PROPERTY & TENANT</p>
                            </div>
                            {[['Tenant', 'Sample Tenant'], ['Email', 'tenant@example.com'], ['Property', 'Sunset Apartments'], ['Address', '123 Main St, Unit 3B, LA'], ['Receipt No.', '#RCP-DEMO-001']].map(([label, val], i) => (
                              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: i % 2 === 0 ? '#fff' : '#F3F4F6' }}>
                                <p style={{ fontSize: 7.5 * scale, fontWeight: 700, color: '#6B7280' }}>{label}</p>
                                <p style={{ fontSize: 8 * scale, color: '#111827' }}>{val}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div style={{ background: '#F3F4F6', borderLeft: '4px solid #6B7280', padding: '8px 14px', marginTop: 14 }}>
                          <p style={{ fontSize: 8 * scale, fontWeight: 700, color: '#374151', marginBottom: 4 }}>IMPORTANT:</p>
                          <p style={{ fontSize: 7.5 * scale, color: '#6B7280', lineHeight: 1.5 }}>This receipt confirms that the payment shown above has been received and processed. Please retain this document for your personal records and tax purposes.</p>
                        </div>

                        {/* Footer */}
                        <div style={{ margin: '16px -24px -24px', background: navy, padding: '8px 20px', textAlign: 'center' }}>
                          <p style={{ fontSize: 7 * scale, color: '#fff' }}>Generated by {previewBrand} on April 04, 2026. System-generated receipt.</p>
                        </div>
                      </>
                    );
                  })()}

                  {/* ── CLASSIC RECEIPT ── */}
                  {previewType === 'receipt' && layoutStyle === 'classic' && (() => {
                    const gray900 = form.primaryColor;
                    const gray700 = form.accentColor;
                    return (
                      <>
                        <p style={{ fontSize: 12 * scale, fontWeight: 700, textAlign: 'center', color: gray900, marginBottom: 8 }}>{previewBrand}</p>
                        <div style={{ borderTop: `1.5px solid ${gray900}`, borderBottom: `0.5px solid ${gray700}` }} />
                        <p style={{ fontSize: 18 * scale, fontWeight: 800, textAlign: 'center', color: gray900, padding: '10px 0' }}>OFFICIAL RENT RECEIPT</p>
                        <div style={{ borderTop: `0.5px solid ${gray700}`, borderBottom: `1.5px solid ${gray900}`, marginBottom: 16 }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                          <div>
                            <p style={{ fontSize: 9 * scale, color: gray700, lineHeight: 1.8 }}>Receipt No: RCP-DEMO-001</p>
                            <p style={{ fontSize: 9 * scale, color: gray700, lineHeight: 1.8 }}>Date Issued: April 04, 2026</p>
                            <p style={{ fontSize: 9 * scale, color: gray700, lineHeight: 1.8 }}>Payment Type: RENT</p>
                          </div>
                          <p style={{ fontSize: 11 * scale, fontWeight: 700, color: gray900, alignSelf: 'flex-start' }}>Amount Received: $1,450.00</p>
                        </div>

                        <div style={{ borderTop: `0.7px solid ${gray700}`, marginBottom: 16 }} />

                        {[['Tenant', 'Sample Tenant'], ['Tenant Email', 'tenant@example.com'], ['Property', 'Sunset Apartments'], ['Address', '123 Main St, Unit 3B, Los Angeles, CA'], ['Period Covered', 'April 2026'], ['Payment Method', 'Stripe (Card)'], ['Transaction ID', 'pi_3RDemo…']].map(([label, val]) => (
                          <p key={label} style={{ fontSize: 9 * scale, lineHeight: 1.8, color: gray900 }}>
                            <strong>{label}:</strong> <span style={{ color: gray700 }}>  {val}</span>
                          </p>
                        ))}

                        <div style={{ borderTop: `0.7px solid ${gray700}`, margin: '14px 0 10px' }} />

                        <p style={{ fontSize: 16 * scale, fontWeight: 700, color: gray900, textAlign: 'right', marginBottom: 14 }}>Total: $1,450.00</p>

                        <p style={{ fontSize: 8.5 * scale, color: gray700, textAlign: 'justify', lineHeight: 1.6 }}>
                          This receipt confirms that payment has been received by the landlord/property manager. Please retain this document for your records.
                        </p>

                        <div style={{ borderTop: `0.5px solid ${gray700}`, marginTop: 20, paddingTop: 8, textAlign: 'center' }}>
                          <p style={{ fontSize: 7.5 * scale, color: '#6B7280' }}>Generated by {previewBrand} on April 04, 2026</p>
                        </div>
                      </>
                    );
                  })()}

                  {/* ── MINIMALIST RECEIPT ── */}
                  {previewType === 'receipt' && layoutStyle === 'minimalist' && (() => {
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <p style={{ fontSize: 9 * scale, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 6 }}>{previewBrand.toUpperCase()}</p>
                            <p style={{ fontSize: 28 * scale, fontWeight: 700, color: '#111827', lineHeight: 1.05, marginBottom: 6 }}>RECEIPT</p>
                            <div style={{ height: 2, width: 140, background: '#111827' }} />
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 8.5 * scale, color: '#6B7280' }}>Ref RCP-DEMO-001</p>
                            <p style={{ fontSize: 8.5 * scale, color: '#6B7280', marginTop: 4 }}>Apr 04, 2026</p>
                          </div>
                        </div>

                        <p style={{ fontSize: 34 * scale, fontWeight: 700, color: '#111827', lineHeight: 1.1, marginTop: 16 }}>$1,450.00</p>
                        <p style={{ fontSize: 9 * scale, color: '#6B7280', marginBottom: 16 }}>Amount Received</p>

                        <div style={{ borderTop: '0.4px solid #D1D5DB', marginBottom: 16 }} />

                        {[['TENANT', 'Sample Tenant'], ['EMAIL', 'tenant@example.com'], ['PROPERTY', 'Sunset Apartments'], ['ADDRESS', '123 Main St, Unit 3B, LA, CA'], ['PERIOD', 'April 2026'], ['TYPE', 'RENT'], ['METHOD', 'Stripe (Card)'], ['TRANSACTION', 'pi_3RDemo…']].map(([label, val]) => (
                          <div key={label} style={{ display: 'grid', gridTemplateColumns: '30% 1fr', gap: 8, marginBottom: 10 }}>
                            <p style={{ fontSize: 7 * scale, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', paddingTop: 2 }}>{label}</p>
                            <p style={{ fontSize: 10 * scale, color: '#111827' }}>{val}</p>
                          </div>
                        ))}

                        <div style={{ borderTop: '0.4px solid #D1D5DB', marginTop: 20, paddingTop: 8, textAlign: 'center' }}>
                          <p style={{ fontSize: 7 * scale, color: '#6B7280' }}>{previewBrand} · Apr 04, 2026</p>
                        </div>
                      </>
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