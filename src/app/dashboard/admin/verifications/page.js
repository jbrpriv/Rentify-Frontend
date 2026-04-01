'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import api from '@/utils/api';
import {
    BadgeCheck, Clock, CheckCircle, XCircle, Loader2,
    Eye, FileText, ExternalLink, FileImage,
} from 'lucide-react';

function Toast({ msg, type }) {
    if (!msg) return null;
    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
    };
    return (
        <div className={`fixed top-6 right-6 z-50 border rounded-2xl px-5 py-3 shadow-xl text-sm font-medium ${colors[type] || colors.success} animate-in fade-in slide-in-from-top-2`}>
            {msg}
        </div>
    );
}

function FileIcon({ name }) {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext))
        return <FileImage className="h-3.5 w-3.5 text-[#0B2D72]" />;
    return <FileText className="h-3.5 w-3.5 text-[#0B2D72]" />;
}

export default function AdminVerificationsPage() {
    const { user } = useUser();
    const router = useRouter();
    const [tab, setTab] = useState('pending');
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 4000);
    };

    useEffect(() => {
        if (!user) return;
        if (!['admin', 'law_reviewer'].includes(user.role)) { router.push('/dashboard'); return; }
        fetchAll();
    }, [user]); // eslint-disable-line

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [p, a] = await Promise.all([
                api.get('/admin/verifications/pending'),
                api.get('/admin/verifications/approved'),
            ]);
            setPending(Array.isArray(p.data) ? p.data : []);
            setApproved(Array.isArray(a.data) ? a.data : []);
        } catch {
            showToast('Failed to load verifications.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        setActionLoading(userId + '_approve');
        try {
            await api.put(`/admin/verifications/${userId}/approve`);
            showToast('User documents approved!');
            fetchAll();
        } catch {
            showToast('Failed to approve.', 'error');
        } finally {
            setActionLoading('');
        }
    };

    const handleReject = async (userId) => {
        setActionLoading(userId + '_reject');
        try {
            await api.put(`/admin/verifications/${userId}/reject`);
            showToast('Documents rejected.');
            fetchAll();
        } catch {
            showToast('Failed to reject.', 'error');
        } finally {
            setActionLoading('');
        }
    };

    // Open a verification document — URLs are already signed and loaded in state
    const handleViewDoc = (userId, docIndex) => {
        const allUsers = [...pending, ...approved];
        const u = allUsers.find(u => u._id === userId);
        const doc = u?.verificationDocuments?.[docIndex];
        if (doc?.url) {
            window.open(doc.url, '_blank', 'noopener,noreferrer');
        } else {
            showToast('Document URL not available.', 'error');
        }
    };

    const list = tab === 'pending' ? pending : approved;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-[#0B2D72]" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BadgeCheck className="h-6 w-6 text-[#0B2D72]" />
                        Document Verifications
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Review and approve landlord & property manager documents</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-[#E6EAF2] text-[#1F2933] border border-[#CBD5E1] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {pending.length} pending
                    </span>
                    <span className="bg-[#0B2D72] text-[#E6EAF2] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> {approved.length} approved
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-100">
                {['pending', 'approved'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors capitalize ${tab === t
                                ? 'bg-white border border-b-white border-gray-100 text-[#0B2D72] -mb-px'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t} ({t === 'pending' ? pending.length : approved.length})
                    </button>
                ))}
            </div>

            {/* List */}
            {list.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <BadgeCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="font-semibold text-gray-500">No {tab} verifications</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {list.map((u) => (
                        <div key={u._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-start justify-between gap-4">
                                {/* User info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-[#0B2D72] flex items-center justify-center text-white font-bold text-lg shrink-0">
                                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{u.name}</p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                        <span className="mt-1 inline-block bg-[#E6EAF2] border border-[#CBD5E1] text-[#0B2D72] text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                                            {u.role?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {tab === 'pending' && (
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleApprove(u._id)}
                                            disabled={!!actionLoading}
                                            className="flex items-center gap-1.5 bg-[#0B2D72] hover:opacity-90 text-[#E6EAF2] text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === u._id + '_approve' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(u._id)}
                                            disabled={!!actionLoading}
                                            className="flex items-center gap-1.5 bg-[#E6EAF2] hover:bg-[#CBD5E1] text-[#1F2933] text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === u._id + '_reject' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                                            Reject
                                        </button>
                                    </div>
                                )}

                                {tab === 'approved' && (
                                    <span className="flex items-center gap-1.5 bg-[#DBE2ED] text-[#0B2D72] text-xs font-bold px-4 py-2 rounded-xl border border-[#CBD5E1]">
                                        <CheckCircle className="h-3.5 w-3.5" /> Approved
                                    </span>
                                )}
                            </div>

                            {/* Documents */}
                            {u.verificationDocuments?.length > 0 && (
                                <div className="mt-4 border-t border-gray-50 pt-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" /> Submitted Documents ({u.verificationDocuments.length})
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {u.verificationDocuments.map((doc, i) => {
                                            return (
                                                <div key={i} className="flex items-center justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FileIcon name={doc.originalName} />
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-gray-700 capitalize">{doc.documentType?.replace(/_/g, ' ')}</p>
                                                            {doc.originalName && <p className="text-[10px] text-gray-400 truncate">{doc.originalName}</p>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleViewDoc(u._id, i)}
                                                        className="flex items-center gap-1 text-[#0B2D72] hover:opacity-80 text-xs font-semibold shrink-0"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" /> View <ExternalLink className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* No documents fallback */}
                            {(!u.verificationDocuments || u.verificationDocuments.length === 0) && (
                                <p className="mt-4 text-xs text-gray-400 italic border-t border-gray-50 pt-4">No documents submitted yet.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}