'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import {
  FileText, ChevronDown, ChevronUp, Loader2, Trash2,
  CheckCircle, XCircle, Clock, Tag, Filter,
} from 'lucide-react';

const STATUS_META = {
  pending:  { label: 'Pending Review', color: '#0B2D72', bg: '#E6EAF2', border: '#CBD5E1' },
  approved: { label: 'Approved',       color: '#E6EAF2', bg: '#0B2D72', border: '#0B2D72' },
  rejected: { label: 'Rejected',       color: '#1F2933', bg: '#CBD5E1', border: '#94A3B8' },
};

function TemplateRow({ template, onReview, onDelete, actionId }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[template.status] || STATUS_META.pending;
  const busy = actionId === template._id;

  return (
    <div style={{ background:'white', borderRadius:16, border:'1.5px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(15,23,42,0.04)' }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 20px', cursor:'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ width:40, height:40, borderRadius:12, background:'#E6EAF2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <FileText size={17} color="#0B2D72"/>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontWeight:800, fontSize:'0.95rem', color:'#0F172A' }}>{template.name}</span>
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.67rem', fontWeight:700, background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>{meta.label}</span>
          </div>
          <p style={{ fontSize:'0.75rem', color:'#64748B', margin:'3px 0 0' }}>
            By <strong>{template.landlord?.name}</strong> ({template.landlord?.email}) ·{' '}
            {template.clauseIds?.length || 0} clause{template.clauseIds?.length !== 1 ? 's' : ''} ·{' '}
            {new Date(template.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }} onClick={e => e.stopPropagation()}>
          {template.status !== 'approved' && (
            <button
              onClick={() => onReview(template._id, true)}
              disabled={busy}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', background:'#0B2D72', color:'#E6EAF2', border:'1.5px solid #0B2D72', borderRadius:9, fontSize:'0.78rem', fontWeight:700, cursor:'pointer', opacity: busy ? 0.6 : 1 }}
            >
              {busy ? <Loader2 size={12} className="animate-spin"/> : <CheckCircle size={13}/>} Approve
            </button>
          )}
          {template.status !== 'rejected' && (
            <button
              onClick={() => onReview(template._id, false)}
              disabled={busy}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', background:'#E6EAF2', color:'#1F2933', border:'1.5px solid #CBD5E1', borderRadius:9, fontSize:'0.78rem', fontWeight:700, cursor:'pointer', opacity: busy ? 0.6 : 1 }}
            >
              {busy ? <Loader2 size={12} className="animate-spin"/> : <XCircle size={13}/>} Reject
            </button>
          )}
          <button
            onClick={() => onDelete(template._id)}
            disabled={busy}
            style={{ padding:'7px 12px', background:'#F8FAFC', color:'#64748B', border:'1.5px solid #E2E8F0', borderRadius:9, cursor:'pointer', opacity: busy ? 0.6 : 1 }}
          >
            <Trash2 size={13}/>
          </button>
        </div>

        {expanded ? <ChevronUp size={16} color="#94A3B8"/> : <ChevronDown size={16} color="#94A3B8"/>}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop:'1px solid #F8FAFC', padding:'14px 20px' }}>
          {template.description && (
            <p style={{ fontSize:'0.82rem', color:'#475569', fontStyle:'italic', marginBottom:12 }}>{template.description}</p>
          )}
          {template.rejectionReason && (
            <div style={{ padding:'10px 14px', background:'#E6EAF2', border:'1px solid #CBD5E1', borderRadius:10, marginBottom:12, fontSize:'0.8rem', color:'#0B2D72' }}>
              <strong>Rejection reason:</strong> {template.rejectionReason}
            </div>
          )}
          {template.reviewedBy && (
            <p style={{ fontSize:'0.75rem', color:'#94A3B8', marginBottom:12 }}>
              Reviewed by <strong>{template.reviewedBy.name}</strong> on {new Date(template.reviewedAt).toLocaleDateString()}
            </p>
          )}
          {(!template.clauseIds || template.clauseIds.length === 0) ? (
            <p style={{ fontSize:'0.82rem', color:'#94A3B8', fontStyle:'italic' }}>No clauses in this template.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {template.clauseIds.map(c => (
                <div key={c._id} style={{ padding:'10px 14px', background:'#F8FAFC', borderRadius:10, border:'1px solid #F1F5F9' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <Tag size={12} color="#0B2D72"/>
                    <span style={{ fontWeight:700, fontSize:'0.85rem', color:'#0F172A' }}>{c.title}</span>
                    <span style={{ fontSize:'0.65rem', padding:'2px 7px', borderRadius:20, background: c.isApproved ? '#0B2D72' : '#E6EAF2', color: c.isApproved ? '#E6EAF2' : '#0B2D72', fontWeight:700, border:`1px solid ${c.isApproved ? '#0B2D72' : '#CBD5E1'}` }}>
                      {c.isApproved ? 'Approved' : 'Pending Clause'}
                    </span>
                  </div>
                  <p style={{ fontSize:'0.74rem', color:'#64748B', margin:0 }}>{c.body?.slice(0, 160)}{c.body?.length > 160 ? '…' : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminAgreementTemplatesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState(null);
  const [statusFilter, setFilter] = useState('');
  const [toast, setToast]         = useState(null);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000); };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const { data } = await api.get(`/agreement-templates${params}`);
      // Backend returns { templates: [...], jurisdictions: [...] }
      setTemplates(Array.isArray(data) ? data : (data.templates || []));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/dashboard'); return; }
    fetchTemplates();
  }, [fetchTemplates]); // eslint-disable-line

  const handleReview = async (id, approved) => {
    let rejectionReason = '';
    if (!approved) {
      rejectionReason = prompt('Reason for rejection (shown to landlord):') || '';
      if (rejectionReason === null) return; // cancelled
    }
    setActionId(id);
    try {
      await api.put(`/agreement-templates/${id}/review`, { approved, rejectionReason });
      showToast(`Template ${approved ? 'approved' : 'rejected'}`);
      fetchTemplates();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', false);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this template?')) return;
    setActionId(id);
    try {
      await api.delete(`/agreement-templates/${id}`);
      showToast('Template deleted');
      fetchTemplates();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', false);
    } finally {
      setActionId(null);
    }
  };

  const counts = {
    all:      templates.length,
    pending:  templates.filter(t => t.status === 'pending').length,
    approved: templates.filter(t => t.status === 'approved').length,
    rejected: templates.filter(t => t.status === 'rejected').length,
  };

  return (
    <div style={{ maxWidth:900, margin:'0 auto', paddingBottom:60 }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontWeight:800, fontSize:'1.7rem', color:'#0F172A', margin:0, letterSpacing:'-0.02em' }}>Agreement Templates</h1>
        <p style={{ color:'#64748B', fontSize:'0.85rem', marginTop:4 }}>
          Review and approve landlord-created agreement templates before they can be used in lease creation.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ padding:'12px 16px', borderRadius:10, fontSize:'0.85rem', fontWeight:600, display:'flex', alignItems:'center', gap:8, marginBottom:16, background: toast.ok ? '#E6EAF2' : '#E6EAF2', color: toast.ok ? '#0B2D72' : '#1F2933', border:`1px solid ${toast.ok ? '#CBD5E1' : '#CBD5E1'}` }}>
          {toast.ok ? <CheckCircle size={15}/> : <XCircle size={15}/>} {toast.msg}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {[
          { key:'',         label:`All (${counts.all})` },
          { key:'pending',  label:`Pending (${counts.pending})`,  color:'#0B2D72' },
          { key:'approved', label:`Approved (${counts.approved})`, color:'#0B2D72' },
          { key:'rejected', label:`Rejected (${counts.rejected})`, color:'#1F2933' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{ padding:'7px 16px', borderRadius:20, fontWeight:700, fontSize:'0.78rem', cursor:'pointer', border:`1.5px solid ${statusFilter===f.key ? (f.color||'#0B2D72') : '#E2E8F0'}`, background: statusFilter===f.key ? (f.color||'#0B2D72') : 'white', color: statusFilter===f.key ? '#E6EAF2' : (f.color||'#64748B'), transition:'all 0.15s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
          <Loader2 className="animate-spin" size={28} color="#0B2D72"/>
        </div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign:'center', padding:'64px 20px', background:'white', borderRadius:16, border:'2px dashed #E2E8F0' }}>
          <FileText size={48} color="#CBD5E1" style={{ margin:'0 auto 12px' }}/>
          <p style={{ fontWeight:700, color:'#374151', fontSize:'1.05rem' }}>No templates found</p>
          <p style={{ color:'#94A3B8', fontSize:'0.85rem', marginTop:4 }}>
            {statusFilter ? `No ${statusFilter} templates.` : 'When landlords create agreement templates, they will appear here for review.'}
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {templates.map(t => (
            <TemplateRow key={t._id} template={t} onReview={handleReview} onDelete={handleDelete} actionId={actionId}/>
          ))}
        </div>
      )}
    </div>
  );
}