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
                  <p style={{ fontSize: 10 * scale, letterSpacing: '0.08em', color: form.accentColor, textTransform: 'uppercase', marginBottom: 12 }}>
                    Realtime {layoutStyle} {previewType} layout preview
                  </p>

                  {previewType === 'agreement' && layoutStyle === 'modern' && (
                    <>
                      <div className="rounded-xl p-5" style={{ background: form.primaryColor, color: '#fff', marginBottom: 16 }}>
                        <p style={{ fontSize: 11 * scale, opacity: 0.9 }}>RENTAL AGREEMENT</p>
                        <h2 style={{ fontSize: 26 * scale, fontWeight: 800, lineHeight: 1.2, marginTop: 4 }}>{previewBrand}</h2>
                        <p style={{ fontSize: 11 * scale, opacity: 0.92, marginTop: 8 }}>Agreement ID: AG-2026-0001</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {['Start Date', 'End Date', 'Monthly Rent'].map((k, i) => (
                          <div key={k} className="rounded-lg border p-3" style={{ borderColor: form.accentColor }}>
                            <p style={{ fontSize: 9 * scale, color: form.accentColor, textTransform: 'uppercase' }}>{k}</p>
                            <p style={{ fontSize: 14 * scale, fontWeight: 700 }}>{i === 0 ? 'Apr 04, 2026' : i === 1 ? 'Apr 04, 2027' : '$1,450'}</p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg border p-4 mb-3" style={{ borderColor: form.accentColor }}>
                        <p style={{ fontSize: 10 * scale, color: form.accentColor, textTransform: 'uppercase', marginBottom: 8 }}>Parties</p>
                        <p style={{ fontSize: 12 * scale, lineHeight: 1.6 }}>Landlord: Sample Landlord</p>
                        <p style={{ fontSize: 12 * scale, lineHeight: 1.6 }}>Tenant: Sample Tenant</p>
                      </div>
                      <div className="rounded-lg border p-4" style={{ borderColor: form.accentColor }}>
                        <p style={{ fontSize: 10 * scale, color: form.accentColor, textTransform: 'uppercase', marginBottom: 8 }}>Key Clause</p>
                        <p style={{ fontSize: 12 * scale, lineHeight: 1.7 }}>Tenant agrees to pay rent on or before the 1st of each month and maintain the property in good condition.</p>
                      </div>
                    </>
                  )}

                  {previewType === 'agreement' && layoutStyle === 'classic' && (
                    <>
                      <p style={{ fontSize: 10 * scale, textAlign: 'center', color: '#334155', marginBottom: 4 }}>{previewBrand.toUpperCase()}</p>
                      <div style={{ borderTop: `2px solid ${form.primaryColor}`, borderBottom: `1px solid ${form.accentColor}`, paddingTop: 10, paddingBottom: 10, marginBottom: 8 }}>
                        <h2 style={{ fontSize: 22 * scale, fontWeight: 800, textAlign: 'center' }}>RESIDENTIAL RENTAL AGREEMENT</h2>
                      </div>
                      <p style={{ fontSize: 10 * scale, textAlign: 'center', color: '#475569', marginBottom: 16 }}>Date of Preparation: April 04, 2026</p>

                      {['I. Parties to this Agreement', 'II. Lease Term', 'III. Rent and Financial Obligations'].map((s) => (
                        <div key={s} style={{ marginBottom: 14 }}>
                          <p style={{ fontSize: 12 * scale, fontWeight: 700 }}>{s}</p>
                          <div style={{ height: 1, background: form.accentColor, marginTop: 6, marginBottom: 8 }} />
                          <p style={{ fontSize: 11 * scale, lineHeight: 1.7 }}>Lorem ipsum style legal content displayed in traditional paragraph formatting to mirror classic PDF structure.</p>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-8 mt-6">
                        <div>
                          <div style={{ borderTop: '1px solid #111827', marginTop: 28 }} />
                          <p style={{ fontSize: 10 * scale, marginTop: 6 }}>Landlord Signature</p>
                        </div>
                        <div>
                          <div style={{ borderTop: '1px solid #111827', marginTop: 28 }} />
                          <p style={{ fontSize: 10 * scale, marginTop: 6 }}>Tenant Signature</p>
                        </div>
                      </div>
                    </>
                  )}

                  {previewType === 'agreement' && layoutStyle === 'minimalist' && (
                    <>
                      <h2 style={{ fontSize: 34 * scale, fontWeight: 800, color: form.primaryColor, lineHeight: 1.05 }}>{previewBrand}</h2>
                      <div style={{ height: 3, width: 220, background: form.primaryColor, marginTop: 12, marginBottom: 14 }} />
                      <p style={{ fontSize: 11 * scale, color: '#64748b', marginBottom: 18 }}>RESIDENTIAL RENTAL AGREEMENT</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="border rounded-lg p-3" style={{ borderColor: '#cbd5e1' }}>
                          <p style={{ fontSize: 9 * scale, textTransform: 'uppercase', color: '#64748b' }}>Landlord</p>
                          <p style={{ fontSize: 15 * scale, fontWeight: 700 }}>Sample Landlord</p>
                        </div>
                        <div className="border rounded-lg p-3" style={{ borderColor: '#cbd5e1' }}>
                          <p style={{ fontSize: 9 * scale, textTransform: 'uppercase', color: '#64748b' }}>Tenant</p>
                          <p style={{ fontSize: 15 * scale, fontWeight: 700 }}>Sample Tenant</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {['Start', 'End', 'Duration', 'Rent'].map((k) => (
                          <div key={k} className="border rounded p-2" style={{ borderColor: '#cbd5e1' }}>
                            <p style={{ fontSize: 8 * scale, color: '#64748b', textTransform: 'uppercase' }}>{k}</p>
                            <p style={{ fontSize: 11 * scale, fontWeight: 700 }}>{k === 'Rent' ? '$1,450' : 'Sample'}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {previewType === 'receipt' && layoutStyle === 'modern' && (
                    <>
                      <div className="rounded-xl p-5 mb-4" style={{ background: form.primaryColor, color: '#fff' }}>
                        <p style={{ fontSize: 10 * scale, opacity: 0.9 }}>OFFICIAL RECEIPT</p>
                        <h2 style={{ fontSize: 24 * scale, fontWeight: 800, lineHeight: 1.15 }}>Rent Payment Received</h2>
                        <p style={{ fontSize: 11 * scale, marginTop: 8, opacity: 0.95 }}>Receipt No: RCP-DEMO-001</p>
                      </div>
                      <div className="rounded-lg border p-4 mb-3" style={{ borderColor: form.accentColor }}>
                        <p style={{ fontSize: 11 * scale, color: form.accentColor }}>Amount Received</p>
                        <p style={{ fontSize: 34 * scale, fontWeight: 800, color: form.primaryColor }}>$1,450.00</p>
                      </div>
                      <div className="rounded-lg border p-4" style={{ borderColor: form.accentColor }}>
                        <p style={{ fontSize: 11 * scale, lineHeight: 1.8 }}>Tenant: Sample Tenant</p>
                        <p style={{ fontSize: 11 * scale, lineHeight: 1.8 }}>Property: Sunset Apartments - Unit 3B</p>
                        <p style={{ fontSize: 11 * scale, lineHeight: 1.8 }}>Method: Stripe (Card)</p>
                      </div>
                    </>
                  )}

                  {previewType === 'receipt' && layoutStyle === 'classic' && (
                    <>
                      <p style={{ fontSize: 12 * scale, textAlign: 'center', fontWeight: 700 }}>{previewBrand}</p>
                      <div style={{ borderTop: `2px solid ${form.primaryColor}`, borderBottom: `1px solid ${form.accentColor}`, marginTop: 8, paddingTop: 10, paddingBottom: 10 }}>
                        <h2 style={{ fontSize: 20 * scale, fontWeight: 800, textAlign: 'center' }}>OFFICIAL RENT RECEIPT</h2>
                      </div>
                      <div className="mt-4 mb-4">
                        <p style={{ fontSize: 10 * scale, lineHeight: 1.8 }}>Receipt No: RCP-DEMO-001</p>
                        <p style={{ fontSize: 10 * scale, lineHeight: 1.8 }}>Date Issued: Apr 04, 2026</p>
                        <p style={{ fontSize: 10 * scale, lineHeight: 1.8 }}>Payment Type: RENT</p>
                      </div>
                      <p style={{ fontSize: 18 * scale, fontWeight: 700, textAlign: 'right', marginBottom: 14, color: form.primaryColor }}>$1,450.00</p>
                      <div className="border rounded-lg p-4" style={{ borderColor: form.accentColor }}>
                        <p style={{ fontSize: 11 * scale, lineHeight: 1.8 }}>Tenant: Sample Tenant</p>
                        <p style={{ fontSize: 11 * scale, lineHeight: 1.8 }}>Property: Sunset Apartments - Unit 3B</p>
                        <p style={{ fontSize: 11 * scale, lineHeight: 1.8 }}>Period Covered: April 2026</p>
                      </div>
                    </>
                  )}

                  {previewType === 'receipt' && layoutStyle === 'minimalist' && (
                    <>
                      <p style={{ fontSize: 9 * scale, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em' }}>{previewBrand.toUpperCase()}</p>
                      <h2 style={{ fontSize: 30 * scale, fontWeight: 800, marginTop: 8 }}>RECEIPT</h2>
                      <div style={{ height: 2, width: 140, background: '#0f172a', marginTop: 8, marginBottom: 16 }} />
                      <p style={{ fontSize: 36 * scale, fontWeight: 800, color: form.primaryColor, lineHeight: 1.1 }}>$1,450.00</p>
                      <p style={{ fontSize: 10 * scale, color: '#64748b', marginBottom: 18 }}>Amount Received</p>
                      <div className="space-y-3">
                        {[
                          ['Tenant', 'Sample Tenant'],
                          ['Property', 'Sunset Apartments - Unit 3B'],
                          ['Method', 'Stripe (Card)'],
                          ['Transaction', 'pi_demo_receipt_preview'],
                        ].map(([k, v]) => (
                          <div key={k} className="grid grid-cols-[130px_1fr] gap-2">
                            <p style={{ fontSize: 9 * scale, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{k}</p>
                            <p style={{ fontSize: 11 * scale }}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
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
