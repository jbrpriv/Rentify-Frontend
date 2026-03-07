'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import {
    ArrowLeft, FolderOpen, FileCheck, File, ExternalLink,
    Loader2, AlertCircle, User, Shield,
} from 'lucide-react';

const DOC_LABELS = {
    cnic: 'CNIC / National ID',
    salary_slip: 'Salary Slip',
    bank_statement: 'Bank Statement',
    employment_letter: 'Employment Letter',
    reference_letter: 'Reference Letter',
    other: 'Other',
};

export default function TenantDocumentsPage() {
    const { id } = useParams();           // agreement id
    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast();

    const [agreement, setAgreement] = useState(null);
    const [docs, setDocs] = useState([]);
    const [tenantName, setTenantName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Role guard
    useEffect(() => {
        if (user && !['landlord', 'property_manager', 'admin'].includes(user.role)) {
            router.push('/dashboard/agreements');
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!id) return;

        // First fetch the agreement to get the tenant id
        api.get(`/agreements/${id}`)
            .then(({ data }) => {
                setAgreement(data);
                const tenantId = data.tenant?._id;
                if (!tenantId) {
                    setError('No tenant linked to this agreement.');
                    setLoading(false);
                    return;
                }
                // Then fetch the tenant's documents
                return api.get(`/upload/landlord/tenant-documents/${tenantId}`);
            })
            .then((res) => {
                if (!res) return;
                setTenantName(res.data.tenantName || '');
                setDocs(res.data.documents || []);
            })
            .catch((err) => {
                const msg = err.response?.data?.message || 'Failed to load documents';
                setError(msg);
                toast(msg, 'error');
            })
            .finally(() => setLoading(false));
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-400">

            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push(`/dashboard/agreements/${id}`)}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
                        Tenant Documents
                    </h1>
                    {tenantName && (
                        <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> {tenantName}
                        </p>
                    )}
                </div>
            </div>

            {/* Access notice */}
            <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-700">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <span>View-only access. Documents are provided by the tenant for verification purposes only.</span>
            </div>

            {/* Error state */}
            {error && (
                <div className="flex flex-col items-center py-16 text-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="font-bold text-gray-700">{error}</p>
                    <button
                        onClick={() => router.push(`/dashboard/agreements/${id}`)}
                        className="mt-2 text-sm font-semibold text-blue-600 hover:underline"
                    >
                        Back to agreement
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!error && docs.length === 0 && (
                <div className="flex flex-col items-center py-16 text-center gap-3 bg-white rounded-2xl border border-dashed border-gray-200">
                    <FolderOpen className="w-12 h-12 text-gray-300" />
                    <p className="font-bold text-gray-500">No documents uploaded</p>
                    <p className="text-sm text-gray-400">
                        {tenantName} hasn't uploaded any verification documents yet.
                    </p>
                </div>
            )}

            {/* Documents list */}
            {docs.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                            {docs.length} document{docs.length !== 1 ? 's' : ''} on file
                        </p>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {docs.map((doc, i) => (
                            <div
                                key={doc._id || i}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition group"
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    {doc.url
                                        ? <FileCheck className="w-5 h-5 text-green-600" />
                                        : <File className="w-5 h-5 text-gray-400" />
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        {DOC_LABELS[doc.documentType] || doc.documentType || 'Document'}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {doc.originalName || 'Uploaded file'}
                                    </p>
                                    {doc.uploadedAt && (
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-GB', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </p>
                                    )}
                                </div>

                                {/* View button */}
                                {doc.url ? (
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition flex-shrink-0"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        View
                                    </a>
                                ) : (
                                    <span className="text-[10px] text-gray-400 flex-shrink-0 px-3 py-2 bg-gray-100 rounded-lg">
                                        Unavailable
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}