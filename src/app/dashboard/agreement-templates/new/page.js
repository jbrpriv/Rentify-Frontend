'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    if (!themeId) return;

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/pdf-themes/${themeId}/preview`, {
          params: {
            primaryColor: form.customizations.primaryColor,
            accentColor: form.customizations.accentColor,
            backgroundColor: form.customizations.backgroundColor,
            fontFamily: form.customizations.fontFamily,
            fontSizeScale: form.customizations.fontSizeScale,
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
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [themeId, form.customizations]);

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
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Classic Corporate Lease"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={2}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Base Theme</label>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                    className="mt-1 w-full h-9 rounded border border-slate-200"
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
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs"
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
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs"
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
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800">Live Preview</p>
            <p className="text-xs text-slate-500">Preview refreshes with an 800ms debounce after changes.</p>
          </div>

          <div className="h-[76vh] bg-slate-50">
            {previewUrl ? (
              <iframe title="template-preview" src={previewUrl} className="w-full h-full" style={{ border: 'none' }} />
            ) : (
              <div className="h-full grid place-items-center text-sm text-slate-400">Preview unavailable</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
