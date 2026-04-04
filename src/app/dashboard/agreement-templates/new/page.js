'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, RefreshCcw } from 'lucide-react';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import useGlobalPdfTheme from '@/hooks/useGlobalPdfTheme';

const defaultClauses = {
  maintenance: 'Tenant shall keep the property in clean and habitable condition throughout tenancy.',
  subletting: 'Tenant shall not sublet without prior written landlord consent.',
  entry: 'Landlord shall provide at least 24 hours notice before entry except in emergencies.',
  damage: 'Damage beyond normal wear and tear may be deducted from security deposit.',
  repairs: 'Tenant is responsible for minor repairs up to a reasonable monthly limit.',
};

export default function CreateAgreementTemplatePage() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { themes, activeTheme, cssVars } = useGlobalPdfTheme();

  const [themeId, setThemeId] = useState(params.get('themeId') || '');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewMode, setPreviewMode] = useState('realtime');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    customizations: {
      primaryColor: '',
      accentColor: '',
      backgroundColor: '',
      fontFamily: 'Helvetica',
      fontSizeScale: 1,
    },
    standardClauses: defaultClauses,
  });

  const selectedTheme = useMemo(
    () => themes.find((t) => t._id === themeId) || activeTheme,
    [themes, themeId, activeTheme]
  );

  useEffect(() => {
    if (!selectedTheme) return;

    setForm((prev) => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        primaryColor: prev.customizations.primaryColor || selectedTheme.primaryColor || '#0B2D72',
        accentColor: prev.customizations.accentColor || selectedTheme.accentColor || '#0992C2',
        backgroundColor: prev.customizations.backgroundColor || selectedTheme.backgroundColor || '#F5FAFF',
        fontFamily: prev.customizations.fontFamily || selectedTheme.fontFamily || 'Helvetica',
        fontSizeScale: prev.customizations.fontSizeScale || selectedTheme.fontSizeScale || 1,
      },
    }));
  }, [selectedTheme]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const renderPdfPreview = async () => {
    if (!themeId) return;

    setPreviewLoading(true);
    try {
      const { data } = await api.get(`/pdf-themes/${themeId}/preview`, {
        params: {
          primaryColor: form.customizations.primaryColor,
          accentColor: form.customizations.accentColor,
          backgroundColor: form.customizations.backgroundColor,
          fontFamily: form.customizations.fontFamily,
          fontSizeScale: form.customizations.fontSizeScale,
          maintenance: form.standardClauses.maintenance,
          subletting: form.standardClauses.subletting,
          entry: form.standardClauses.entry,
          damage: form.standardClauses.damage,
          repairs: form.standardClauses.repairs,
        },
        responseType: 'blob',
      });

      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch {
      setPreviewUrl('');
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (!themeId || previewMode !== 'pdf') return;

    const timer = setTimeout(async () => {
      void renderPdfPreview();
    }, 700);

    return () => clearTimeout(timer);
  }, [themeId, previewMode, form.customizations, form.standardClauses]);

  const submit = async () => {
    if (!form.name.trim()) {
      toast('Template name is required', 'error');
      return;
    }

    if (!themeId) {
      toast('Please select a base theme', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.post('/agreement-templates', {
        name: form.name,
        description: form.description,
        baseTheme: themeId,
        customizations: form.customizations,
        standardClauses: form.standardClauses,
      });
      toast('Template submitted for approval', 'success');
      router.push('/dashboard/agreement-templates');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const scale = Number(form.customizations.fontSizeScale || 1);
  const layoutStyle = selectedTheme?.layoutStyle || 'modern';
  const previewBrand = 'Brand Name';

  return (
    <div style={cssVars} className="max-w-7xl mx-auto pb-8">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Create PDF Template</h1>
        <p className="text-sm text-slate-500">Customize branding and standard clauses, then submit for admin approval.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4 items-start">
        <aside className="rounded-2xl border p-4 bg-white sticky top-24" style={{ borderColor: 'var(--brand-border)' }}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500">Template Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--brand-border)' }}
                placeholder="Classic Corporate Lease"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--brand-border)' }}
                rows={2}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Base Theme</label>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--brand-border)' }}
              >
                <option value="">Select theme</option>
                {themes.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['primaryColor', 'accentColor', 'backgroundColor'].map((key) => (
                <div key={key}>
                  <label className="text-[11px] font-bold text-slate-500 capitalize">{key.replace('Color', '')}</label>
                  <input
                    type="color"
                    value={form.customizations[key] || '#000000'}
                    onChange={(e) => setForm((p) => ({ ...p, customizations: { ...p.customizations, [key]: e.target.value } }))}
                    className="mt-1 w-full h-9 rounded border"
                    style={{ borderColor: 'var(--brand-border)' }}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500">Font</label>
                <select
                  value={form.customizations.fontFamily}
                  onChange={(e) => setForm((p) => ({ ...p, customizations: { ...p.customizations, fontFamily: e.target.value } }))}
                    className="mt-1 w-full rounded-lg border px-2 py-2 text-xs"
                    style={{ borderColor: 'var(--brand-border)' }}
                >
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times-Roman">Times-Roman</option>
                  <option value="Courier">Courier</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500">Font Scale: {Number(form.customizations.fontSizeScale).toFixed(2)}x</label>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={form.customizations.fontSizeScale}
                  onChange={(e) => setForm((p) => ({ ...p, customizations: { ...p.customizations, fontSizeScale: Number(e.target.value) } }))}
                  className="mt-2 w-full"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {Object.keys(defaultClauses).map((k) => (
                <div key={k}>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">{k}</label>
                  <textarea
                    value={form.standardClauses[k]}
                    onChange={(e) => setForm((p) => ({ ...p, standardClauses: { ...p.standardClauses, [k]: e.target.value } }))}
                    rows={2}
                    className="mt-1 w-full rounded-lg border px-2 py-2 text-xs"
                    style={{ borderColor: 'var(--brand-border)' }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={submit}
              disabled={saving || !form.name.trim()}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-extrabold text-white"
              style={{ background: 'var(--brand-primary)', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </aside>

        <section className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Live Preview</p>
              <p className="text-xs text-slate-500">
                Realtime uses the same dummy values as admin preview clones; PDF mode renders backend output.
              </p>
            </div>
            <div className="flex items-center gap-2">
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

              {previewMode === 'pdf' && (
                <button onClick={renderPdfPreview} className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1">
                  {previewLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} Render PDF
                </button>
              )}
            </div>
          </div>

          <div className="h-[76vh] bg-slate-50">
            {previewMode === 'realtime' ? (
              <AgreementRealtimeClonePreview
                layoutStyle={layoutStyle}
                scale={scale}
                form={form}
                previewBrand={previewBrand}
              />
            ) : previewUrl ? (
              <iframe title="template-preview" src={previewUrl} className="w-full h-full" style={{ border: 'none' }} />
            ) : previewLoading ? (
              <div className="h-full grid place-items-center text-sm text-slate-400">
                <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Rendering PDF...</span>
              </div>
            ) : (
              <div className="h-full grid place-items-center text-sm text-slate-400">Preview unavailable</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function AgreementRealtimeClonePreview({ layoutStyle, scale, form, previewBrand }) {
  return (
    <div className="w-full h-full p-4 overflow-auto">
      <div
        className="mx-auto shadow-sm"
        style={{
          maxWidth: 680,
          minHeight: 960,
          background: '#fff',
          color: '#111827',
          fontFamily:
            form.customizations.fontFamily === 'Times-Roman'
              ? 'Georgia, serif'
              : form.customizations.fontFamily === 'Courier'
                ? 'monospace'
                : 'Helvetica Neue, Arial, sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {layoutStyle === 'modern' && (() => {
          const navy = form.customizations.primaryColor;
          const blue = form.customizations.accentColor;
          const lightBlue = form.customizations.backgroundColor;
          return (
            <div>
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

                <div style={{ background: lightBlue, border: `1px solid ${blue}`, borderLeft: `4px solid ${blue}`, padding: '10px 12px', marginBottom: 10 }}>
                  <p style={{ fontSize: 7 * scale, fontWeight: 700, color: blue, letterSpacing: '0.06em', marginBottom: 4 }}>PROPERTY</p>
                  <p style={{ fontSize: 11.5 * scale, fontWeight: 700, color: navy, marginBottom: 2 }}>Sunset Apartments - Unit 3B</p>
                  <p style={{ fontSize: 8.5 * scale, color: '#374151' }}>123 Sample Street, Sample City, Sample State</p>
                </div>

                <div style={{ background: navy, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', marginBottom: 18 }}>
                  {[['START DATE', 'April 4, 2026'], ['END DATE', 'April 4, 2027'], ['DURATION', '12 months'], ['MONTHLY RENT', '$1,450']].map(([label, val], i) => (
                    <div key={label} style={{ padding: '10px 12px', borderRight: i < 3 ? '0.5px solid rgba(30,64,175,0.6)' : 'none' }}>
                      <p style={{ fontSize: 6.5 * scale, fontWeight: 700, color: '#93C5FD', marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: 10 * scale, fontWeight: 700, color: '#fff' }}>{val}</p>
                    </div>
                  ))}
                </div>

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

              <div style={{ background: navy, padding: '8px 32px', textAlign: 'center' }}>
                <p style={{ fontSize: 7 * scale, color: '#93C5FD' }}>Generated by {previewBrand}. Digital signatures are legally binding.</p>
              </div>
            </div>
          );
        })()}

        {layoutStyle === 'classic' && (() => {
          const gray900 = form.customizations.primaryColor;
          const gray700 = form.customizations.accentColor;
          const fs = (n) => n * scale;
          return (
            <div style={{ padding: '0 40px 32px' }}>
              <div style={{ textAlign: 'center', padding: '18px 0 8px' }}>
                <p style={{ fontSize: fs(10), fontWeight: 700, color: gray700, letterSpacing: '0.08em' }}>{previewBrand.toUpperCase()}</p>
              </div>
              <div style={{ borderTop: `2px solid ${gray900}`, borderBottom: `0.5px solid ${gray700}`, padding: '10px 0' }}>
                <p style={{ fontSize: fs(20), fontWeight: 800, textAlign: 'center', color: gray900 }}>RESIDENTIAL RENTAL AGREEMENT</p>
              </div>
              <div style={{ borderTop: `0.5px solid ${gray700}`, borderBottom: `2px solid ${gray900}`, marginBottom: 10 }} />
              <p style={{ fontSize: fs(9), color: gray700, textAlign: 'center', marginBottom: 2 }}>Agreement ID: 69cec0ab9be345e97d0b0440</p>
              <p style={{ fontSize: fs(9), color: gray700, textAlign: 'center', marginBottom: 18 }}>Date of Preparation: April 4, 2026</p>

              <div style={{ borderTop: `2px solid ${gray900}`, marginBottom: 10 }} />
              <p style={{ fontSize: fs(9.5), color: gray900, lineHeight: 1.65, textAlign: 'justify', marginBottom: 10 }}>
                THIS RESIDENTIAL RENTAL AGREEMENT ("Agreement") is entered into as of April 4, 2026, by and between Sample Landlord ("Landlord") and Sample Tenant ("Tenant"), collectively referred to as the "Parties." The Landlord agrees to lease the property described herein to the Tenant, and the Tenant agrees to lease said property from the Landlord, subject to the terms and conditions set forth in this Agreement.
              </p>
              <div style={{ borderTop: `0.5px solid ${gray700}`, marginBottom: 18 }} />

              {[
                {
                  num: 'I', title: 'PARTIES TO THIS AGREEMENT',
                  rows: [
                    ['Landlord', 'Sample Landlord (landlord@example.com)'],
                    ['Tenant', 'Sample Tenant (tenant@example.com)'],
                    ['Property', 'Sunset Apartments - Unit 3B, 123 Sample Street, Sample City, Sample State'],
                  ],
                },
                {
                  num: 'II', title: 'LEASE TERM',
                  rows: [
                    ['Commencement Date', 'April 4, 2026'],
                    ['Expiration Date', 'April 4, 2027'],
                    ['Duration', '12 months'],
                  ],
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
                  ],
                },
                {
                  num: 'IV', title: 'POLICIES',
                  rows: [
                    ['Utilities', 'Not included in rent'],
                    ['Utility Details', 'Electricity, gas and internet are tenant responsibility.'],
                    ['Pet Policy', 'Permitted (Deposit: $150)'],
                    ['Termination Policy', '30-day written notice required by either party.'],
                  ],
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

              <div style={{ borderTop: `0.5px solid ${gray700}`, marginTop: 28, paddingTop: 8, textAlign: 'center' }}>
                <p style={{ fontSize: fs(7), color: '#6B7280' }}>Generated by {previewBrand}. Digital signatures are legally binding.</p>
              </div>
            </div>
          );
        })()}

        {layoutStyle === 'minimalist' && (() => {
          const fs = (n) => n * scale;
          return (
            <div>
              <div style={{ borderBottom: '0.4px solid #D1D5DB', padding: '14px 32px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: fs(7), fontWeight: 700, color: '#111827', letterSpacing: '0.05em' }}>{previewBrand.toUpperCase()}</p>
                <p style={{ fontSize: fs(7), color: '#6B7280' }}>Ref: AG-2026-DEMO</p>
                <p style={{ fontSize: fs(7), color: '#6B7280' }}>1 / 2</p>
              </div>

              <div style={{ padding: '28px 32px 32px' }}>
                <p style={{ fontSize: fs(36), fontWeight: 700, color: '#111827', lineHeight: 1.0, marginBottom: 10 }}>{previewBrand}</p>
                <div style={{ height: 3, width: 200, background: '#111827', marginBottom: 14 }} />
                <p style={{ fontSize: fs(11), color: '#6B7280', letterSpacing: '0.03em', marginBottom: 22 }}>RESIDENTIAL RENTAL AGREEMENT</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 10 }}>
                  {[['LANDLORD', 'Sample Landlord', 'landlord@example.com'], ['TENANT', 'Sample Tenant', 'tenant@example.com']].map(([role, name, email]) => (
                    <div key={role}>
                      <p style={{ fontSize: fs(7), fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 4 }}>{role}</p>
                      <p style={{ fontSize: fs(13), fontWeight: 700, color: '#111827', marginBottom: 2 }}>{name}</p>
                      <p style={{ fontSize: fs(8.5), color: '#6B7280' }}>{email}</p>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '0.3px solid #D1D5DB', borderBottom: '0.3px solid #D1D5DB', padding: '8px 0', margin: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: fs(7), fontWeight: 700, color: '#6B7280', marginBottom: 3 }}>PROPERTY</p>
                    <p style={{ fontSize: fs(13), fontWeight: 700, color: '#111827' }}>Sunset Apartments - Unit 3B</p>
                  </div>
                  <p style={{ fontSize: fs(8.5), color: '#374151', textAlign: 'right', maxWidth: '45%' }}>123 Sample Street, Sample City, Sample State</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '0.3px solid #D1D5DB', padding: '10px 0', marginBottom: 18 }}>
                  {[['START DATE', 'April 4, 2026'], ['END DATE', 'April 4, 2027'], ['DURATION', '12 mo.'], ['MONTHLY RENT', '$1,450']].map(([label, val], i) => (
                    <div key={label} style={{ paddingRight: 8, borderRight: i < 3 ? '0.3px solid #D1D5DB' : 'none', paddingLeft: i > 0 ? 8 : 0 }}>
                      <p style={{ fontSize: fs(7), color: '#6B7280', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</p>
                      <p style={{ fontSize: fs(12), fontWeight: 700, color: '#111827' }}>{val}</p>
                    </div>
                  ))}
                </div>

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

              <div style={{ borderTop: '0.4px solid #D1D5DB', padding: '8px 32px', textAlign: 'center' }}>
                <p style={{ fontSize: fs(6.5), color: '#6B7280' }}>{previewBrand} · Rental Agreement · Digital signatures are legally binding</p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
