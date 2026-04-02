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
    if (!activeId || !form) return;

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/pdf-themes/${activeId}/preview`, {
          params: {
            primaryColor: form.primaryColor,
            accentColor: form.accentColor,
            backgroundColor: form.backgroundColor,
            fontFamily: form.fontFamily,
            fontSizeScale: form.fontSizeScale,
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
    }, 500);

    return () => clearTimeout(timer);
  }, [activeId, form]);

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

  return (
    <div style={cssVars} className="max-w-7xl mx-auto pb-10">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Global PDF Branding</h1>
        <p className="text-sm text-slate-500">Changes affect future generated PDFs for agreements using each layout.</p>
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
                  setForm({
                    primaryColor: theme.primaryColor,
                    accentColor: theme.accentColor,
                    backgroundColor: theme.backgroundColor,
                    fontFamily: theme.fontFamily,
                    fontSizeScale: theme.fontSizeScale || 1,
                    description: theme.description || '',
                    isDefault: !!theme.isDefault,
                  });
                }}
                className="w-full text-left rounded-lg border px-3 py-2"
                style={theme._id === activeId ? { borderColor: 'var(--brand-primary)', background: 'var(--brand-primary-soft)' } : { borderColor: '#E2E8F0' }}
              >
                <p className="text-sm font-bold text-slate-900">{theme.name}</p>
                <p className="text-xs text-slate-500">{theme.layoutStyle}</p>
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

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Changes affect all future PDF downloads for agreements using this layout.
            </div>

            <button onClick={save} disabled={saving} className="w-full rounded-xl px-4 py-2.5 text-sm font-extrabold text-white inline-flex items-center justify-center gap-2" style={{ background: 'var(--brand-primary)' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
            </button>
          </div>
        </section>

        <section className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Live Preview</p>
            <button onClick={() => loadThemes()} className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1"><RefreshCcw size={12} /> Refresh</button>
          </div>
          <div className="h-[74vh] bg-slate-50">
            {previewUrl ? (
              <iframe title="theme-preview" src={previewUrl} className="w-full h-full" style={{ border: 'none' }} />
            ) : (
              <div className="h-full grid place-items-center text-sm text-slate-400">No preview yet</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
