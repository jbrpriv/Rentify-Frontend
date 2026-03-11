'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import {
  Plus, CheckCircle, XCircle, Archive, Loader2,
  Scale, ChevronDown, ChevronUp, AlertTriangle, X,
  GripVertical, Eye, EyeOff, Info, Sparkles,
} from 'lucide-react';

const CATEGORIES = ['general', 'rent', 'deposit', 'maintenance', 'utilities', 'pets', 'termination', 'renewal', 'late_fee', 'subletting', 'noise'];

const GROUP_COLORS = {
  Parties: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-400' },
  Property: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
  Financials: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  Term: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  Policies: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-400' },
  System: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────
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

// ─── Variable Chip (draggable) ────────────────────────────────────────────────
function VariableChip({ variable, onInsert }) {
  const colors = GROUP_COLORS[variable.group] || GROUP_COLORS.System;
  const token = `{{${variable.key}}}`;

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('text/plain', token);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => onInsert(token)}
      title={variable.description}
      className={`
        group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-grab active:cursor-grabbing
        select-none text-xs font-semibold transition-all duration-150
        hover:shadow-sm hover:-translate-y-px active:translate-y-0
        ${colors.bg} ${colors.text} ${colors.border}
      `}
    >
      <GripVertical className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
      {variable.label}
    </div>
  );
}

// ─── Clause Body Editor ───────────────────────────────────────────────────────
function ClauseBodyEditor({ value, onChange, variables }) {
  const textareaRef = useRef(null);
  const cursorRef = useRef(0);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const groups = [...new Set(variables.map(v => v.group))];

  // Initialise activeGroup once variables load
  useEffect(() => {
    if (groups.length && activeGroup === null) setActiveGroup(groups[0]);
  }, [groups.length]); // eslint-disable-line

  const filteredVars = activeGroup
    ? variables.filter(v => v.group === activeGroup)
    : variables;

  // Insert token at last known cursor position
  const insertToken = useCallback((token) => {
    const el = textareaRef.current;
    if (!el) return;

    el.focus();
    const pos = cursorRef.current;
    const before = value.slice(0, pos);
    const after = value.slice(pos);
    const newVal = before + token + after;
    onChange(newVal);

    // Move cursor to end of inserted token
    const newPos = pos + token.length;
    cursorRef.current = newPos;
    requestAnimationFrame(() => {
      el.setSelectionRange(newPos, newPos);
      el.focus();
    });
  }, [value, onChange]);

  // Build a rich preview replacing {{var}} with highlighted spans
  const buildPreview = () => {
    if (!value) return <span className="text-gray-400 italic">Nothing to preview yet…</span>;

    const parts = [];
    let last = 0;
    const re = /\{\{(\w+)\}\}/g;
    let match;

    while ((match = re.exec(value)) !== null) {
      if (match.index > last) parts.push({ type: 'text', content: value.slice(last, match.index) });
      const varDef = variables.find(v => v.key === match[1]);
      const colors = varDef ? (GROUP_COLORS[varDef.group] || GROUP_COLORS.System) : GROUP_COLORS.System;
      parts.push({ type: 'var', key: match[1], label: varDef?.label || match[1], colors });
      last = re.lastIndex;
    }
    if (last < value.length) parts.push({ type: 'text', content: value.slice(last) });

    return parts.map((p, i) =>
      p.type === 'text' ? (
        <span key={i} className="whitespace-pre-wrap">{p.content}</span>
      ) : (
        <span
          key={i}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-bold mx-0.5 ${p.colors.bg} ${p.colors.text}`}
        >
          <Sparkles className="w-2.5 h-2.5" />
          {p.label}
        </span>
      )
    );
  };

  return (
    <div className="space-y-3">
      {/* Variable palette */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-black text-gray-700 uppercase tracking-wide">Available Variables</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">drag into text · or click to insert</span>
        </div>

        {/* Group tabs */}
        {groups.length > 0 && (
          <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-hide">
            {groups.map(g => {
              const colors = GROUP_COLORS[g] || GROUP_COLORS.System;
              const isActive = activeGroup === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveGroup(g)}
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                    ${isActive
                      ? `${colors.bg} ${colors.text} border ${colors.border} shadow-sm`
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent'
                    }
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  {g}
                </button>
              );
            })}
          </div>
        )}

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 px-3 pb-3">
          {variables.length === 0 ? (
            <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading variables…
            </div>
          ) : filteredVars.length === 0 ? (
            <span className="text-xs text-gray-400 py-1">No variables in this group.</span>
          ) : (
            filteredVars.map(v => (
              <VariableChip key={v.key} variable={v} onInsert={insertToken} />
            ))
          )}
        </div>
      </div>

      {/* Textarea drop zone */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          required
          rows={7}
          placeholder="Write your clause body here. Drag variables from the palette above — or click any variable to insert it at the cursor."
          value={value}
          onChange={e => onChange(e.target.value)}
          onSelect={e => { cursorRef.current = e.target.selectionStart; }}
          onBlur={e => { cursorRef.current = e.target.selectionStart; }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragOver(false);
            const token = e.dataTransfer.getData('text/plain');
            if (!token.startsWith('{{')) return;

            // Calculate approximate cursor position from drop coords
            const el = textareaRef.current;
            // Use stored cursor as fallback — browser drop position in textarea isn't
            // reliably available cross-browser without a library, so we use the last
            // known selection position (onSelect/onBlur). Most users will click into
            // the textarea first anyway, making this accurate enough.
            insertToken(token);
          }}
          className={`
            w-full rounded-xl px-4 py-3 text-sm font-mono leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y
            transition-all duration-150
            ${isDragOver
              ? 'border-2 border-blue-400 bg-blue-50 ring-2 ring-blue-200'
              : 'border border-gray-200 bg-white'
            }
          `}
        />
        {isDragOver && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl">
            <div className="bg-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg">
              Drop to insert variable
            </div>
          </div>
        )}
      </div>

      {/* Preview toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowPreview(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-semibold transition-colors"
        >
          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPreview ? 'Hide preview' : 'Show formatted preview'}
        </button>

        {showPreview && (
          <div className="mt-2 rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-700 leading-relaxed min-h-[60px]">
            {buildPreview()}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [catFilter, setCat] = useState('');
  const [approvedFilter, setApproved] = useState('');

  // Variable definitions fetched from backend
  const [variables, setVariables] = useState([]);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'general',
    jurisdiction: 'Pakistan',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  // Modal state
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => { fetchClauses(); }, [catFilter, approvedFilter]); // eslint-disable-line

  // Fetch available template variables once on mount
  useEffect(() => {
    api.get('/admin/clauses/variables')
      .then(({ data }) => setVariables(data))
      .catch(err => console.error('Failed to load clause variables:', err));
  }, []);

  const fetchClauses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (catFilter) params.set('category', catFilter);
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
      toast('Clause created successfully', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to create clause', 'error'); }
    finally { setSaving(false); }
  };

  const isAdmin = user?.role === 'admin';
  const isReviewer = user?.role === 'law_reviewer';

  // Highlight {{variables}} in existing clause bodies for the list view
  const renderClauseBody = (body) => {
    if (!body) return null;
    const parts = [];
    let last = 0;
    const re = /\{\{(\w+)\}\}/g;
    let match;
    while ((match = re.exec(body)) !== null) {
      if (match.index > last) parts.push(<span key={`t${last}`}>{body.slice(last, match.index)}</span>);
      const varDef = variables.find(v => v.key === match[1]);
      const colors = varDef ? (GROUP_COLORS[varDef.group] || GROUP_COLORS.System) : GROUP_COLORS.System;
      parts.push(
        <span key={`v${match.index}`} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-bold mx-0.5 ${colors.bg} ${colors.text}`}>
          <Sparkles className="w-2.5 h-2.5" />
          {varDef?.label || match[1]}
        </span>
      );
      last = re.lastIndex;
    }
    if (last < body.length) parts.push(<span key={`t${last}`}>{body.slice(last)}</span>);
    return parts;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
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
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'New Clause'}
          </button>
        )}
      </div>

      {/* ── Create Form ─────────────────────────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 space-y-5"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-black text-gray-900">New Clause Template</h3>
          </div>

          {/* Title */}
          <input
            required
            placeholder="Clause title (e.g. Late Payment Penalty)"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Drag-and-drop clause body editor */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Clause Body
            </label>
            <ClauseBodyEditor
              value={form.body}
              onChange={body => setForm(f => ({ ...f, body }))}
              variables={variables}
            />
          </div>

          {/* Meta fields */}
          <div className="flex flex-wrap gap-3 pt-1">
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              placeholder="Jurisdiction (e.g. Punjab)"
              value={form.jurisdiction}
              onChange={e => setForm(f => ({ ...f, jurisdiction: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                className="rounded"
              />
              Default clause (auto-include in all agreements)
            </label>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Variables like <code className="font-mono bg-blue-100 px-1 rounded">{'{{tenantName}}'}</code> are substituted with real data when the PDF is generated.
              Drag variables from the palette into the clause body, or click them to insert at the cursor.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm({ title: '', body: '', category: 'general', jurisdiction: 'Pakistan', isDefault: false });
              }}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-black hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {saving ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Create Clause'}
            </button>
          </div>
        </form>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <select
          value={catFilter}
          onChange={e => setCat(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={approvedFilter}
          onChange={e => setApproved(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="true">Approved</option>
          <option value="false">Pending Review</option>
        </select>
      </div>

      {/* ── Clause List ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
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
                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-blue-100 text-blue-700 shrink-0">
                      Default
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate" title={c.title}>{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <span className="capitalize">{c.category?.replace(/_/g, ' ')}</span>
                      {c.jurisdiction && <span> · <span className="text-blue-500">{c.jurisdiction}</span></span>}
                      <span> · v{c.version}</span>
                      <span> · Used {c.usageCount}×</span>
                    </p>
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
                      {actionId === c._id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <><CheckCircle className="w-3 h-3" /> Approve</>
                      }
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
                  {/* Rendered body with variable highlights */}
                  <div className="mt-4 text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 font-sans whitespace-pre-wrap">
                    {variables.length > 0 ? renderClauseBody(c.body) : c.body}
                  </div>
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

      {/* ── Archive confirmation modal ─────────────────────────────────────── */}
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

      {/* ── Reject with reason modal ───────────────────────────────────────── */}
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