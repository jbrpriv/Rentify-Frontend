'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import {
  Plus, ChevronDown, ChevronUp, Loader2, Trash2, Pencil,
  CheckCircle, Clock, XCircle, Tag, FileText, X, Save,
} from 'lucide-react';

const STATUS_META = {
  pending: { label: 'Pending Review', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  approved: { label: 'Approved', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  rejected: { label: 'Rejected', color: '#DC2626', bg: '#FFF7F7', border: '#FECACA' },
};

const CATEGORIES = ['general', 'rent', 'deposit', 'maintenance', 'utilities', 'pets', 'termination', 'renewal', 'late_fee', 'subletting', 'noise'];

// ─── Clause picker modal ──────────────────────────────────────────────────────
function ClausePickerModal({ selected, onSave, onClose }) {
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState(new Set(selected.map(c => c._id)));
  const [catFilter, setCat] = useState('');

  useEffect(() => {
    api.get('/agreements/clauses')
      .then(({ data }) => setClauses(data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setPicked(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filtered = catFilter ? clauses.filter(c => c.category === catFilter) : clauses;
  const categories = [...new Set(clauses.map(c => c.category))].sort();

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 620, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', margin: 0 }}>Select Clauses</h3>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '3px 0 0' }}>{picked.size} selected</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
        </div>

        {/* Category filter */}
        <div style={{ padding: '12px 24px', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid #F8FAFC' }}>
          <button onClick={() => setCat('')} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, border: `1.5px solid ${!catFilter ? '#2563EB' : '#E2E8F0'}`, background: !catFilter ? '#2563EB' : 'white', color: !catFilter ? 'white' : '#64748B', cursor: 'pointer' }}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, border: `1.5px solid ${catFilter === c ? '#2563EB' : '#E2E8F0'}`, background: catFilter === c ? '#2563EB' : 'white', color: catFilter === c ? 'white' : '#64748B', cursor: 'pointer', textTransform: 'capitalize' }}>{c.replace('_', ' ')}</button>
          ))}
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Loader2 className="animate-spin" size={24} color="#2563EB" /></div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94A3B8', padding: 32, fontSize: '0.85rem' }}>No clauses found</p>
          ) : (
            filtered.map(clause => {
              const isSelected = picked.has(clause._id);
              return (
                <div key={clause._id} onClick={() => toggle(clause._id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px', borderRadius: 12, border: `1.5px solid ${isSelected ? '#2563EB' : '#F1F5F9'}`, background: isSelected ? '#EFF6FF' : 'white', marginBottom: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${isSelected ? '#2563EB' : '#CBD5E1'}`, background: isSelected ? '#2563EB' : 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    {isSelected && <CheckCircle size={12} color="white" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>{clause.title}</span>
                      <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A', fontWeight: 700, border: '1px solid #BBF7D0' }}>
                        Approved
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '4px 0 0', textTransform: 'capitalize' }}>{clause.category?.replace('_', ' ')}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clause.body}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', color: '#64748B', background: 'white', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave(clauses.filter(c => picked.has(c._id)))} style={{ flex: 2, padding: '10px', background: '#2563EB', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Attach {picked.size} Clause{picked.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Template form (create / edit) ───────────────────────────────────────────
function TemplateForm({ initial, onSave, onCancel, saving }) {
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name || '');
  const [desc, setDesc] = useState(initial?.description || '');
  const [clauses, setClauses] = useState(initial?.clauseIds || []);
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) { toast('Template name is required', 'info'); return; }
    onSave({ name, description: desc, clauseIds: clauses.map(c => c._id) });
  };

  return (
    <>
      {showPicker && (
        <ClausePickerModal
          selected={clauses}
          onSave={(selected) => { setClauses(selected); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div style={{ background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', margin: '0 0 16px' }}>
          {initial ? 'Edit Template' : 'New Agreement Template'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 5 }}>Template Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder='e.g. "Standard 1-Year Residential"'
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 5 }}>Description (optional)</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="What kind of lease is this template for?"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Clauses ({clauses.length})</label>
              <button onClick={() => setShowPicker(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Tag size={13} /> {clauses.length > 0 ? 'Edit Clauses' : 'Add Clauses'}
              </button>
            </div>
            {clauses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {clauses.map(c => (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #F1F5F9' }}>
                    <Tag size={12} color="#2563EB" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', flex: 1 }}>{c.title}</span>
                    <span style={{ fontSize: '0.65rem', color: c.isApproved ? '#16A34A' : '#D97706', fontWeight: 700 }}>
                      {c.isApproved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: 10, border: '2px dashed #E2E8F0', textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8' }}>
                No clauses added yet. Click "Add Clauses" to pick from the library.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '10px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', color: '#64748B', background: 'white', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: '10px', background: '#2563EB', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {initial ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────
function TemplateCard({ template, onEdit, onDelete, deleting }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[template.status] || STATUS_META.pending;

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={18} color="#2563EB" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{template.name}</span>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>{meta.label}</span>
          </div>
          <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '3px 0 0' }}>
            {template.clauseIds?.length || 0} clause{template.clauseIds?.length !== 1 ? 's' : ''}
            {template.description ? ` · ${template.description}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onEdit(template); }} style={{ padding: '7px 12px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
            <Pencil size={12} /> Edit
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(template._id); }} disabled={deleting === template._id} style={{ padding: '7px 12px', background: '#FFF7F7', border: '1.5px solid #FECACA', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', opacity: deleting === template._id ? 0.5 : 1 }}>
            {deleting === template._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          </button>
          {expanded ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
        </div>
      </div>

      {/* Expanded clauses */}
      {expanded && (
        <div style={{ borderTop: '1px solid #F8FAFC', padding: '14px 20px' }}>
          {template.status === 'rejected' && template.rejectionReason && (
            <div style={{ padding: '10px 14px', background: '#FFF7F7', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 12, fontSize: '0.8rem', color: '#DC2626' }}>
              <strong>Rejected:</strong> {template.rejectionReason}
            </div>
          )}
          {template.status === 'pending' && (
            <div style={{ padding: '10px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, marginBottom: 12, fontSize: '0.8rem', color: '#92400E' }}>
              ⏳ This template is awaiting admin review. Your clauses are approved — the template itself needs a one-time admin sign-off before it can be used in lease creation.
            </div>
          )}
          {(!template.clauseIds || template.clauseIds.length === 0) ? (
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', fontStyle: 'italic' }}>No clauses in this template.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {template.clauseIds.map(c => (
                <div key={c._id} style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Tag size={12} color="#2563EB" />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>{c.title}</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 20, background: c.isApproved ? '#F0FDF4' : '#FFFBEB', color: c.isApproved ? '#16A34A' : '#D97706', fontWeight: 700, border: `1px solid ${c.isApproved ? '#BBF7D0' : '#FDE68A'}` }}>
                      {c.isApproved ? 'Approved' : 'Pending Review'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, fontStyle: 'italic' }}>{c.body?.slice(0, 140)}{c.body?.length > 140 ? '…' : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AgreementTemplatesPage() {
  const router = useRouter();
  const { user: parsed } = useUser();
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data } = await api.get('/agreement-templates');
      // Backend returns { templates: [...], jurisdictions: [...] }
      setTemplates(Array.isArray(data) ? data : (data.templates || []));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!['landlord', 'property_manager'].includes(parsed?.role)) { router.push('/dashboard'); return; }
    fetchTemplates();
  }, []); // eslint-disable-line

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/agreement-templates/${editing._id}`, form);
        toast('Template updated — pending admin review', 'success');
      } else {
        await api.post('/agreement-templates', form);
        toast('Template created — pending admin review', 'success');
      }
      setShowForm(false);
      setEditing(null);
      fetchTemplates();
    } catch (err) {
      toast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    setDeleting(id);
    try {
      await api.delete(`/agreement-templates/${id}`);
      toast('Template deleted', 'success');
      fetchTemplates();
    } catch (err) {
      toast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (template) => { setEditing(template); setShowForm(true); };
  const startCreate = () => { setEditing(null); setShowForm(true); };
  const cancelForm = () => { setShowForm(false); setEditing(null); };

  const approved = templates.filter(t => t.status === 'approved');
  const pending = templates.filter(t => t.status === 'pending');
  const rejected = templates.filter(t => t.status === 'rejected');

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Loader2 className="animate-spin" size={30} color="#2563EB" />
    </div>
  );

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.7rem', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Agreement Templates</h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: 4 }}>
            Create reusable clause bundles. When accepting a tenant's offer, pick a template and it will be pre-attached to the agreement.
          </p>
        </div>
        {!showForm && (
          <button onClick={startCreate} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#2563EB', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            <Plus size={16} /> New Template
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <TemplateForm initial={editing} onSave={handleSave} onCancel={cancelForm} saving={saving} />
      )}

      {/* Info banner */}
      <div style={{ padding: '12px 16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, marginBottom: 20, fontSize: '0.8rem', color: '#1D4ED8', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <Clock size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>All new and edited templates require <strong>admin approval</strong> before they can be used when accepting offers. Approved templates are shown in the offer acceptance flow.</span>
      </div>

      {/* Empty state */}
      {templates.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, border: '2px dashed #E2E8F0' }}>
          <FileText size={48} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontWeight: 700, color: '#475569', fontSize: '1.05rem', marginBottom: 6 }}>No templates yet</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: 20 }}>Create your first agreement template to speed up the lease creation process.</p>
          <button onClick={startCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: '#2563EB', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            <Plus size={15} /> Create Template
          </button>
        </div>
      )}

      {/* Sections */}
      {[
        { list: approved, title: 'Approved', icon: <CheckCircle size={15} color="#16A34A" />, color: '#16A34A' },
        { list: pending, title: 'Pending Review', icon: <Clock size={15} color="#D97706" />, color: '#D97706' },
        { list: rejected, title: 'Rejected', icon: <XCircle size={15} color="#DC2626" />, color: '#DC2626' },
      ].map(({ list, title, icon, color }) => list.length > 0 && (
        <div key={title} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            {icon}
            <h2 style={{ fontWeight: 800, fontSize: '0.85rem', color, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title} ({list.length})</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map(t => (
              <TemplateCard key={t._id} template={t} onEdit={startEdit} onDelete={handleDelete} deleting={deleting} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}