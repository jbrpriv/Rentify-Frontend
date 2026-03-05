'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import {
  Plus, CheckCircle, XCircle, Archive, Loader2,
  Scale, Filter, ChevronDown, ChevronUp, AlertTriangle, X,
} from 'lucide-react';

const CATEGORIES = ['general','rent','deposit','maintenance','utilities','pets','termination','renewal','late_fee','subletting','noise'];

// ─── Reusable confirm modal ───────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-yellow-600'}`} />
          </div>
          <div>
            <h3 className="font-black text-gray-900">{title}</h3>
            {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}
          </div>
        </div>
        {children}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold text-white transition ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [clauses, setClauses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [catFilter, setCat]     = useState('');
  const [approvedFilter, setApproved] = useState('');

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'general', jurisdiction: 'Pakistan', isDefault: false });
  const [saving, setSaving] = useState(false);

  // Modal state — archive confirm + rejection reason
  const [archiveTarget, setArchiveTarget]   = useState(null); // clause id
  const [rejectTarget, setRejectTarget]     = useState(null); // clause id
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchClauses();
  }, [catFilter, approvedFilter]);

  const fetchClauses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (catFilter)       params.set('category', catFilter);
      if (approvedFilter !== '') params.set('isApproved', approvedFilter);
      const { data } = await api.get(`/admin/clauses?${params}`);
      setClauses(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await api.put(`/admin/clauses/${id}/approve`, { approved: true, rejectionReason: '' });
      fetchClauses();
    } catch (err) { toast(err.response?.data?.message || 'Failed to approve clause', 'error'); }
    finally { setActionId(null); }
  };

  const handleRejectConfirm = async () => {
    const id = rejectTarget;
    setRejectTarget(null);
    setActionId(id);
    try {
      await api.put(`/admin/clauses/${id}/approve`, { approved: false, rejectionReason });
      setRejectionReason('');
      fetchClauses();
    } catch (err) { toast(err.response?.data?.message || 'Failed to reject clause', 'error'); }
    finally { setActionId(null); }
  };

  const handleArchiveConfirm = async () => {
    const id = archiveTarget;
    setArchiveTarget(null);
    setActionId(id + '-archive');
    try {
      await api.put(`/admin/clauses/${id}/archive`);
      fetchClauses();
    } catch (err) { toast(err.response?.data?.message || 'Failed to archive clause', 'error'); }
    finally { setActionId(null); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/clauses', form);
      setShowForm(false);
      setForm({ title: '', body: '', category: 'general', jurisdiction: 'Pakistan', isDefault: false });
      fetchClauses();
    } catch (err) { toast(err.response?.data?.message || 'Failed to create clause', 'error'); }
    finally { setSaving(false); }
  };

  const isAdmin = user?.role === 'admin';
  const isReviewer = user?.role === 'law_reviewer';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Clause Templates</h1>
          <p className="text-gray-400 text-sm mt-1">{clauses.length} templates</p>
        </div>
        {(isAdmin || isReviewer) && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-black hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> New Clause
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-gray-900">New Clause Template</h3>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            required
            placeholder="Clause body text. Use {{tenantName}}, {{rentAmount}} etc. for dynamic fields."
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              placeholder="Jurisdiction (e.g. Punjab)"
              value={form.jurisdiction}
              onChange={e => setForm(f => ({ ...f, jurisdiction: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} />
              Default clause (auto-include in all agreements)
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-black hover:bg-blue-700 disabled:bg-blue-400">
              {saving ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Create Clause'}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={catFilter} onChange={e => setCat(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={approvedFilter} onChange={e => setApproved(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="true">Approved</option>
          <option value="false">Pending Review</option>
        </select>
      </div>

      {/* Clause List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
      ) : clauses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Scale className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-bold">No clauses found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clauses.map(c => (
            <div key={c._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full shrink-0 ${c.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {c.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  {c.isDefault && (
                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-blue-100 text-blue-700 shrink-0">Default</span>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.category} • {c.jurisdiction} • v{c.version} • Used {c.usageCount}x</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => setExpanded(ex => ({ ...ex, [c._id]: !ex[c._id] }))}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {expanded[c._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {(isAdmin || isReviewer) && !c.isApproved && (
                    <button
                      onClick={() => handleApprove(c._id)}
                      disabled={actionId === c._id}
                      className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition"
                    >
                      {actionId === c._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3" /> Approve</>}
                    </button>
                  )}
                  {(isAdmin || isReviewer) && c.isApproved && (
                    <button
                      onClick={() => { setRejectTarget(c._id); setRejectionReason(''); }}
                      disabled={actionId === c._id}
                      className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                    >
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setArchiveTarget(c._id)}
                      disabled={actionId === c._id + '-archive'}
                      className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Archive className="w-3 h-3" /> Archive
                    </button>
                  )}
                </div>
              </div>

              {expanded[c._id] && (
                <div className="px-5 pb-5 border-t border-gray-50">
                  <pre className="mt-4 text-sm text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 rounded-xl p-4">{c.body}</pre>
                  {c.rejectionReason && (
                    <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2">
                      Rejection reason: {c.rejectionReason}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-gray-400">
                    Created by {c.createdBy?.name || 'Unknown'} •{' '}
                    {c.approvedBy ? `Approved by ${c.approvedBy.name}` : 'Not yet approved'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Archive confirmation modal */}
      {archiveTarget && (
        <ConfirmModal
          title="Archive this clause?"
          message="It will be hidden from landlords but not deleted. You can restore it later."
          confirmLabel="Archive"
          danger
          onConfirm={handleArchiveConfirm}
          onClose={() => setArchiveTarget(null)}
        />
      )}

      {/* Reject with reason modal */}
      {rejectTarget && (
        <ConfirmModal
          title="Reject this clause?"
          message="Optionally provide a reason so the author knows what to fix."
          confirmLabel="Reject"
          danger
          onConfirm={handleRejectConfirm}
          onClose={() => { setRejectTarget(null); setRejectionReason(''); }}
        >
          <textarea
            rows={3}
            placeholder="Rejection reason (optional)"
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            className="w-full mt-2 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none resize-none"
          />
        </ConfirmModal>
      )}
    </div>
  );
}