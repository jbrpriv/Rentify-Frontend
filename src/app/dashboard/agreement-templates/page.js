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
import PreviewModal from '@/components/agreement-builder/PreviewModal';

const STATUS_META = {
  pending: { label: 'Pending', icon: Clock3, color: '#A16207', bg: '#FEF3C7' },
  approved: { label: 'Approved', icon: CheckCircle2, color: '#166534', bg: '#DCFCE7' },
  rejected: { label: 'Rejected', icon: XCircle, color: '#991B1B', bg: '#FEE2E2' },
};

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
  const { cssVars } = useGlobalPdfTheme();
  const normalizedTier = String(user?.subscriptionTier || '').trim().toLowerCase();
  const tier = ['free', 'pro', 'enterprise'].includes(normalizedTier) ? normalizedTier : 'free';
  const canAccessTemplateStudio = user?.role === 'admin' || (user?.role === 'landlord' && tier === 'enterprise');

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

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
    if (!user) return;

    if (!canAccessTemplateStudio) {
      toast('Agreement template studio is available on the Enterprise plan only.', 'error');
      router.push(user.role === 'landlord' ? '/dashboard/billing' : '/dashboard');
      return;
    }

    fetchTemplates();
  }, [user, canAccessTemplateStudio, router, fetchTemplates, toast]);

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

  const handlePreview = (template) => setPreviewTemplate(template);

  const grouped = useMemo(() => ({
    pending: templates.filter((t) => t.status === 'pending'),
    approved: templates.filter((t) => t.status === 'approved'),
    rejected: templates.filter((t) => t.status === 'rejected'),
  }), [templates]);

  if (user && !canAccessTemplateStudio) return null;

  return (
    <div style={cssVars} className="max-w-6xl mx-auto pb-10">

      <div className="rounded-2xl p-6 border mb-6" style={{ borderColor: 'var(--brand-border)', background: 'linear-gradient(145deg, var(--brand-bg), #ffffff)' }}>
        <div className="flex flex-wrap gap-4 items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--brand-primary)' }}>Landlord Studio</p>
            <h1 className="text-3xl font-extrabold text-slate-900">My PDF Templates</h1>
            <p className="text-sm text-slate-600 mt-1">Create branded agreement PDFs using global base layouts, then submit for admin approval.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/agreement-templates/new')}
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
            onClick={() => router.push('/dashboard/agreement-templates/new')}
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
                          onClick={() => handlePreview(template)}
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

      <PreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        html={previewTemplate?.bodyHtml || ''}
      />
    </div>
  );
}
