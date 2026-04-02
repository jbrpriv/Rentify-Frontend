'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import useGlobalPdfTheme from '@/hooks/useGlobalPdfTheme';

export default function EditAgreementTemplatePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { themes, cssVars } = useGlobalPdfTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [template, setTemplate] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    let ignore = false;

    api.get(`/agreement-templates/${id}`)
      .then(({ data }) => {
        if (ignore) return;
        setTemplate(data);
        setForm({
          name: data.name || '',
          description: data.description || '',
          baseTheme: data.baseTheme?._id || data.baseTheme || '',
          customizations: {
            primaryColor: data.customizations?.primaryColor || data.baseTheme?.primaryColor || '#0B2D72',
            accentColor: data.customizations?.accentColor || data.baseTheme?.accentColor || '#0992C2',
            backgroundColor: data.customizations?.backgroundColor || data.baseTheme?.backgroundColor || '#F5FAFF',
            fontFamily: data.customizations?.fontFamily || data.baseTheme?.fontFamily || 'Helvetica',
            fontSizeScale: data.customizations?.fontSizeScale || data.baseTheme?.fontSizeScale || 1,
          },
          standardClauses: {
            maintenance: data.standardClauses?.maintenance || '',
            subletting: data.standardClauses?.subletting || '',
            entry: data.standardClauses?.entry || '',
            damage: data.standardClauses?.damage || '',
            repairs: data.standardClauses?.repairs || '',
          },
        });
      })
      .catch((err) => toast(err.response?.data?.message || 'Failed to load template', 'error'))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id, toast]);

  const readOnly = template?.status === 'approved';

  useEffect(() => {
    if (!form?.baseTheme) return;

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/pdf-themes/${form.baseTheme}/preview`, {
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
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [form]);

  const submit = async () => {
    if (!form?.name.trim()) {
      toast('Template name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/agreement-templates/${id}`, form);
      toast('Template updated and submitted for review', 'success');
      router.push('/dashboard/agreement-templates');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const themeOptions = useMemo(() => themes || [], [themes]);

  if (loading || !form) return <p className="text-sm text-slate-500">Loading...</p>;

  return (
    <div style={cssVars} className="max-w-7xl mx-auto pb-8">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Edit PDF Template</h1>
        <p className="text-sm text-slate-500">
          Status: <strong className="capitalize">{template.status}</strong>
          {readOnly ? ' (read-only after approval)' : ' (editable)'}
        </p>
      </div>

      {template.status === 'rejected' && template.rejectionReason && (
        <div className="mb-4 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: '#FCA5A5', background: '#FEF2F2', color: '#991B1B' }}>
          <strong>Rejection feedback:</strong> {template.rejectionReason}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4 items-start">
        <aside className="rounded-2xl border p-4 bg-white sticky top-24" style={{ borderColor: 'var(--brand-border)' }}>
          <div className="space-y-3">
            <input disabled={readOnly} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--brand-border)' }} />
            <textarea disabled={readOnly} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--brand-border)' }} />

            <select disabled={readOnly} value={form.baseTheme} onChange={(e) => setForm((p) => ({ ...p, baseTheme: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--brand-border)' }}>
              {themeOptions.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            {['primaryColor', 'accentColor', 'backgroundColor'].map((k) => (
              <div key={k} className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 capitalize">{k.replace('Color', '')}</label>
                <input disabled={readOnly} type="color" value={form.customizations[k]} onChange={(e) => setForm((p) => ({ ...p, customizations: { ...p.customizations, [k]: e.target.value } }))} className="w-16 h-8 rounded border" style={{ borderColor: 'var(--brand-border)' }} />
              </div>
            ))}

            <div className="space-y-2 pt-1">
              {Object.keys(form.standardClauses || {}).map((k) => (
                <div key={k}>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">{k}</label>
                  <textarea
                    disabled={readOnly}
                    value={form.standardClauses[k]}
                    onChange={(e) => setForm((p) => ({ ...p, standardClauses: { ...p.standardClauses, [k]: e.target.value } }))}
                    rows={2}
                    className="mt-1 w-full rounded-lg border px-2 py-2 text-xs"
                    style={{ borderColor: 'var(--brand-border)' }}
                  />
                </div>
              ))}
            </div>

            {!readOnly && (
              <button onClick={submit} disabled={saving} className="w-full rounded-xl px-4 py-2.5 text-sm font-extrabold text-white" style={{ background: 'var(--brand-primary)' }}>
                {saving ? 'Saving...' : 'Save & Resubmit'}
              </button>
            )}
          </div>
        </aside>

        <section className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
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
