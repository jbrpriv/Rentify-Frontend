'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Download, Loader2, XCircle } from 'lucide-react';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import useGlobalPdfTheme from '@/hooks/useGlobalPdfTheme';

function statusColor(status) {
  if (status === 'approved') return { color: '#166534', bg: '#DCFCE7' };
  if (status === 'rejected') return { color: '#991B1B', bg: '#FEE2E2' };
  return { color: '#A16207', bg: '#FEF3C7' };
}

export default function AdminAgreementTemplatesPage() {
  const { toast } = useToast();
  const { cssVars } = useGlobalPdfTheme();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const { data } = await api.get(`/agreement-templates${query}`);
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load template queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const previewPdf = async (id) => {
    try {
      const { data } = await api.get(`/agreement-templates/${id}/preview-pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to preview PDF', 'error');
    }
  };

  const approve = async (id) => {
    setBusyId(id);
    try {
      await api.put(`/agreement-templates/${id}/approve`);
      toast('Template approved', 'success');
      await fetchTemplates();
    } catch (err) {
      toast(err.response?.data?.message || 'Approve failed', 'error');
    } finally {
      setBusyId('');
    }
  };

  const reject = async () => {
    if (!rejectTarget) return;
    if (!rejectionReason.trim()) {
      toast('Rejection reason is required', 'error');
      return;
    }

    setBusyId(rejectTarget);
    try {
      await api.put(`/agreement-templates/${rejectTarget}/reject`, { rejectionReason });
      toast('Template rejected', 'success');
      setRejectTarget(null);
      setRejectionReason('');
      await fetchTemplates();
    } catch (err) {
      toast(err.response?.data?.message || 'Reject failed', 'error');
    } finally {
      setBusyId('');
    }
  };

  const counts = useMemo(() => ({
    all: templates.length,
    pending: templates.filter((t) => t.status === 'pending').length,
    approved: templates.filter((t) => t.status === 'approved').length,
    rejected: templates.filter((t) => t.status === 'rejected').length,
  }), [templates]);

  return (
    <div style={cssVars} className="max-w-6xl mx-auto pb-10">
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-5">
            <h3 className="text-lg font-extrabold text-slate-900">Reject Template</h3>
            <p className="text-sm text-slate-500 mt-1">Explain why this template is rejected. Landlord will see this feedback inline.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Add review feedback"
            />
            <div className="mt-4 flex items-center gap-2 justify-end">
              <button className="px-3 py-2 rounded-lg border text-sm font-semibold" onClick={() => setRejectTarget(null)}>Cancel</button>
              <button className="px-3 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#B91C1C' }} onClick={reject}>Reject</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900">Template Approval Queue</h1>
        <p className="text-sm text-slate-500">Review landlord branding templates before they can be used in agreement drafting.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'pending', label: `Pending (${counts.pending})` },
          { key: 'approved', label: `Approved (${counts.approved})` },
          { key: 'rejected', label: `Rejected (${counts.rejected})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="px-3 py-1.5 rounded-full text-xs font-bold border"
            style={filter === tab.key
              ? { background: 'var(--brand-primary)', borderColor: 'var(--brand-primary)', color: 'white' }
              : { borderColor: 'var(--brand-border)', color: 'var(--brand-primary)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
        <div className="grid grid-cols-[1.2fr_1.1fr_1fr_0.8fr_1fr] gap-3 px-4 py-3 border-b border-slate-100 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
          <p>Landlord</p>
          <p>Template</p>
          <p>Base Layout</p>
          <p>Submitted</p>
          <p>Actions</p>
        </div>

        {loading && <div className="p-8 text-sm text-slate-500 inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading queue...</div>}

        {!loading && templates.length === 0 && <p className="p-8 text-sm text-slate-500">No templates in this filter.</p>}

        {!loading && templates.map((t) => {
          const badge = statusColor(t.status);
          return (
            <div key={t._id} className="grid grid-cols-[1.2fr_1.1fr_1fr_0.8fr_1fr] gap-3 px-4 py-3 border-b border-slate-100 text-sm items-center">
              <div>
                <p className="font-semibold text-slate-900">{t.landlord?.name || '-'}</p>
                <p className="text-xs text-slate-500">{t.landlord?.email || '-'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">{t.name}</p>
                <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ color: badge.color, background: badge.bg }}>{t.status}</span>
              </div>
              <p className="text-slate-700">{t.baseTheme?.name || '-'}</p>
              <p className="text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => previewPdf(t._id)} className="px-2.5 py-1.5 rounded-lg border text-xs font-bold inline-flex items-center gap-1" style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-primary)' }}>
                  <Download size={12} /> Preview
                </button>
                <button onClick={() => approve(t._id)} disabled={busyId === t._id} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white inline-flex items-center gap-1" style={{ background: '#166534' }}>
                  <CheckCircle2 size={12} /> Approve
                </button>
                <button onClick={() => { setRejectTarget(t._id); setRejectionReason(''); }} disabled={busyId === t._id} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white inline-flex items-center gap-1" style={{ background: '#B91C1C' }}>
                  <XCircle size={12} /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
