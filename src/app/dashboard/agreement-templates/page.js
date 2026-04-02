'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Brush,
  CheckCircle2,
  Clock3,
  FileDown,
  Layers,
  Palette,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import useGlobalPdfTheme from '@/hooks/useGlobalPdfTheme';

const STATUS_META = {
  pending: { label: 'Pending', icon: Clock3, color: '#A16207', bg: '#FEF3C7' },
  approved: { label: 'Approved', icon: CheckCircle2, color: '#166534', bg: '#DCFCE7' },
  rejected: { label: 'Rejected', icon: XCircle, color: '#991B1B', bg: '#FEE2E2' },
};

function ThemePickerModal({ open, themes, onClose, onPick }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 sm:p-8 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-5xl max-h-[88vh] bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Choose Base Layout</h2>
            <p className="text-sm text-slate-500">Pick a global theme to start your branded PDF template.</p>
          </div>
          <button onClick={onClose} className="text-sm font-semibold text-slate-500 hover:text-slate-700">Close</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto max-h-[72vh]">
          {themes.map((theme) => (
            <div key={theme._id} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400 transition">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">{theme.name}</p>
                {theme.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold">Default</span>}
              </div>
              <p className="text-xs text-slate-500 mt-1 min-h-8">{theme.description || 'Global branding preset'}</p>

              <div className="mt-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full border border-slate-200" style={{ background: theme.primaryColor }} />
                <span className="w-5 h-5 rounded-full border border-slate-200" style={{ background: theme.accentColor }} />
                <span className="w-5 h-5 rounded-full border border-slate-200" style={{ background: theme.backgroundColor }} />
              </div>

              <div className="mt-4 h-24 rounded-lg border border-slate-200 p-3" style={{ background: theme.backgroundColor || '#fff' }}>
                <div className="h-2.5 rounded-full" style={{ background: theme.primaryColor }} />
                <div className="h-2 rounded-full mt-2 w-3/4" style={{ background: theme.accentColor }} />
                <div className="h-2 rounded-full mt-2 w-1/2 bg-slate-200" />
              </div>

              <button
                onClick={() => onPick(theme)}
                className="mt-4 w-full rounded-lg px-3 py-2 text-sm font-bold border"
                style={{ borderColor: 'var(--brand-primary)', color: 'white', background: 'var(--brand-primary)' }}
              >
                Choose
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ color: meta.color, background: meta.bg }}>
      <Icon size={12} /> {meta.label}
    </span>
  );
}

export default function AgreementTemplatesPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const { themes, cssVars } = useGlobalPdfTheme();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [deleting, setDeleting] = useState('');

  const fetchTemplates = useCallback(async () => {
    try {
      const { data } = await api.get('/agreement-templates');
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!['landlord', 'property_manager'].includes(user?.role)) {
      router.push('/dashboard');
      return;
    }
    fetchTemplates();
  }, [user, router, fetchTemplates]);

  const onDelete = async (id) => {
    if (!confirm('Archive this template?')) return;

    setDeleting(id);
    try {
      await api.delete(`/agreement-templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
      toast('Template archived', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to archive template', 'error');
    } finally {
      setDeleting('');
    }
  };

  const previewTemplate = async (template) => {
    try {
      const params = {
        primaryColor: template.customizations?.primaryColor || undefined,
        accentColor: template.customizations?.accentColor || undefined,
        backgroundColor: template.customizations?.backgroundColor || undefined,
        fontFamily: template.customizations?.fontFamily || undefined,
        fontSizeScale: template.customizations?.fontSizeScale || undefined,
      };

      const { data } = await api.get(`/pdf-themes/${template.baseTheme?._id || template.baseTheme}/preview`, {
        params,
        responseType: 'blob',
      });

      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch {
      toast('Preview unavailable for this template right now', 'error');
    }
  };

  const grouped = useMemo(() => ({
    pending: templates.filter((t) => t.status === 'pending'),
    approved: templates.filter((t) => t.status === 'approved'),
    rejected: templates.filter((t) => t.status === 'rejected'),
  }), [templates]);

  return (
    <div style={cssVars} className="max-w-6xl mx-auto pb-10">
      <ThemePickerModal
        open={showThemePicker}
        themes={themes}
        onClose={() => setShowThemePicker(false)}
        onPick={(theme) => router.push(`/dashboard/agreement-templates/new?themeId=${theme._id}`)}
      />

      <div className="rounded-2xl p-6 border mb-6" style={{ borderColor: 'var(--brand-border)', background: 'linear-gradient(145deg, var(--brand-bg), #ffffff)' }}>
        <div className="flex flex-wrap gap-4 items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--brand-primary)' }}>Landlord Studio</p>
            <h1 className="text-3xl font-extrabold text-slate-900">My PDF Templates</h1>
            <p className="text-sm text-slate-600 mt-1">Create branded agreement PDFs using global base layouts, then submit for admin approval.</p>
          </div>
          <button
            onClick={() => setShowThemePicker(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border"
            style={{ background: 'var(--brand-primary)', color: 'white', borderColor: 'var(--brand-primary)' }}
          >
            <Plus size={16} /> Create New Template
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading templates...</p>}

      {!loading && templates.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed p-10 text-center" style={{ borderColor: 'var(--brand-border)', background: 'white' }}>
          <Palette size={36} className="mx-auto mb-3" style={{ color: 'var(--brand-primary)' }} />
          <p className="text-xl font-bold text-slate-800">No templates yet</p>
          <p className="text-sm text-slate-500 mt-1">Start by choosing a base layout and customizing colors, typography, and clause language.</p>
          <button
            onClick={() => setShowThemePicker(true)}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-bold border"
            style={{ borderColor: 'var(--brand-primary)', color: 'white', background: 'var(--brand-primary)' }}
          >
            Create your first template
          </button>
        </div>
      )}

      {!loading && templates.length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([key, list]) => {
            if (list.length === 0) return null;

            return (
              <section key={key}>
                <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--brand-primary)' }}>
                  {key} ({list.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {list.map((template) => (
                    <article key={template._id} className="rounded-2xl border p-4 bg-white shadow-sm" style={{ borderColor: 'var(--brand-border)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900">{template.name}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description || 'No description'}</p>
                        </div>
                        <StatusBadge status={template.status} />
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                        <Layers size={13} />
                        <span>{template.baseTheme?.name || 'Base theme'}</span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-slate-200" style={{ background: template.customizations?.primaryColor || template.baseTheme?.primaryColor }} />
                        <span className="w-4 h-4 rounded-full border border-slate-200" style={{ background: template.customizations?.accentColor || template.baseTheme?.accentColor }} />
                        <span className="w-4 h-4 rounded-full border border-slate-200" style={{ background: template.customizations?.backgroundColor || template.baseTheme?.backgroundColor }} />
                      </div>

                      {template.status === 'rejected' && template.rejectionReason && (
                        <div className="mt-3 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: '#FCA5A5', background: '#FEF2F2', color: '#991B1B' }}>
                          <p className="font-bold inline-flex items-center gap-1"><AlertCircle size={12} /> Rejection feedback</p>
                          <p className="mt-1">{template.rejectionReason}</p>
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/agreement-templates/${template._id}/edit`)}
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-bold border"
                          style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', background: '#E6EAF2' }}
                        >
                          <span className="inline-flex items-center gap-1"><Brush size={12} /> {template.status === 'approved' ? 'View' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => previewTemplate(template)}
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-bold border"
                          style={{ borderColor: 'var(--brand-accent)', color: 'white', background: 'var(--brand-accent)' }}
                        >
                          <span className="inline-flex items-center gap-1"><FileDown size={12} /> Preview</span>
                        </button>
                        <button
                          onClick={() => onDelete(template._id)}
                          disabled={deleting === template._id}
                          className="px-3 py-2 rounded-lg text-xs font-bold border"
                          style={{ color: 'var(--brand-primary)', borderColor: 'var(--brand-border)', background: '#E6EAF2' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
