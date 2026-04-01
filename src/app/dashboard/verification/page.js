'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import api from '@/utils/api';
import {
    BadgeCheck, Upload, FileText, CheckCircle, Clock,
    AlertCircle, Loader2, X, FileImage, Plus,
} from 'lucide-react';

const DOC_TYPES = [
    { value: 'cnic', label: 'CNIC (National ID Card)' },
    { value: 'passport', label: 'Passport' },
    { value: 'business_registration', label: 'Business Registration' },
    { value: 'ownership_deed', label: 'Property Ownership Deed' },
    { value: 'utility_bill', label: 'Utility Bill' },
    { value: 'other', label: 'Other' },
];

function FileIcon({ name }) {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext))
        return <FileImage className="w-5 h-5 text-[#0B2D72]" />;
    return <FileText className="w-5 h-5 text-[#0B2D72]" />;
}

export default function VerificationPage() {
    const { user } = useUser();
    const router = useRouter();

    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [docType, setDocType] = useState('cnic');
    const [files, setFiles] = useState([]);

    const inputRef = useRef(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 4000);
    };

    useEffect(() => {
        if (!user) return;
        if (!['landlord', 'property_manager'].includes(user.role)) {
            router.push('/dashboard');
            return;
        }
        api.get('/users/me')
            .then(({ data }) => setStatus(data.verificationStatus || 'none'))
            .catch(() => setStatus('none'))
            .finally(() => setLoading(false));
    }, [user]); // eslint-disable-line

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        if (selected.some(f => f.size > 10 * 1024 * 1024)) {
            showToast('Each file must be under 10 MB.', 'error');
            return;
        }
        setFiles(prev => {
            const combined = [...prev, ...selected];
            if (combined.length > 5) {
                showToast('Maximum 5 files allowed.', 'error');
                return prev;
            }
            return combined;
        });
        e.target.value = '';
    };

    const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) { showToast('Please select at least one file.', 'error'); return; }
        setUploading(true);
        try {
            const formData = new FormData();
            files.forEach(f => formData.append('documents', f));
            formData.append('documentType', docType);
            await api.post('/upload/verification-documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFiles([]);
            setStatus('pending');
            showToast('Documents uploaded! Awaiting admin review.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Upload failed. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-[#0B2D72]" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Toast */}
            {toast.msg && (
                <div className={`fixed top-6 right-6 z-50 border rounded-2xl px-5 py-3 shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 ${toast.type === 'error' ? 'bg-[#E6EAF2] border-[#CBD5E1] text-[#1F2933]' : 'bg-[#E6EAF2] border-[#CBD5E1] text-[#0B2D72]'
                    }`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BadgeCheck className="h-6 w-6 text-[#0B2D72]" />
                    Document Verification
                </h1>
                <p className="text-sm text-gray-500 mt-1">Submit your identity or ownership documents to get verified.</p>
            </div>

            {/* Status banners */}
            {status === 'approved' && (
                <div className="flex items-center gap-3 bg-[#E6EAF2] border border-[#CBD5E1] rounded-2xl px-5 py-4">
                    <CheckCircle className="h-8 w-8 text-[#0B2D72] shrink-0" />
                    <div>
                        <p className="font-bold text-[#0B2D72]">Documents Verified ✓</p>
                        <p className="text-sm text-[#0B2D72] opacity-80 mt-0.5">Your documents have been approved. Your profile now shows as a verified landlord.</p>
                    </div>
                </div>
            )}

            {status === 'pending' && (
                <div className="flex items-center gap-3 bg-[#E6EAF2] border border-[#CBD5E1] rounded-2xl px-5 py-4">
                    <Clock className="h-8 w-8 text-[#0B2D72] shrink-0" />
                    <div>
                        <p className="font-bold text-[#0B2D72]">Under Review</p>
                        <p className="text-sm text-[#0B2D72] opacity-80 mt-0.5">Your documents have been submitted and are awaiting admin review. This usually takes 1–2 business days.</p>
                    </div>
                </div>
            )}

            {status === 'rejected' && (
                <div className="flex items-center gap-3 bg-[#E6EAF2] border border-[#CBD5E1] rounded-2xl px-5 py-4">
                    <AlertCircle className="h-8 w-8 text-[#0B2D72] shrink-0" />
                    <div>
                        <p className="font-bold text-[#1F2933]">Documents Rejected</p>
                        <p className="text-sm text-[#1F2933] opacity-80 mt-0.5">Your documents were not accepted. Please re-submit clearer or correct documents below.</p>
                    </div>
                </div>
            )}

            {/* Upload form — shown when not yet approved */}
            {status !== 'approved' && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div>
                        <h2 className="font-bold text-gray-900 mb-0.5">
                            {status === 'pending' ? 'Re-submit Documents' : 'Submit Verification Documents'}
                        </h2>
                        <p className="text-xs text-gray-500">Accepted: PDF, JPG, PNG, WEBP · Max 5 files · 10 MB each · Stored securely in S3</p>
                    </div>

                    {/* Document type */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Document Type</label>
                        <select
                            value={docType}
                            onChange={e => setDocType(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2D72]"
                        >
                            {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    {/* Drop zone */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Files</label>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#0B2D72] hover:bg-[#E6EAF2]/40 rounded-2xl py-8 transition-colors cursor-pointer"
                        >
                            <Upload className="h-7 w-7 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-600">Click to select files</p>
                            <p className="text-xs text-gray-400">PDF, JPG, PNG, WEBP — up to 5 files</p>
                        </button>
                        <input
                            ref={inputRef}
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Selected files list */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                                    <FileIcon name={f.name} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{f.name}</p>
                                        <p className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                    <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-[#0B2D72] transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 text-sm font-semibold text-[#0B2D72] hover:opacity-80 mt-1">
                                <Plus className="h-4 w-4" /> Add more files
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || files.length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-[#0B2D72] hover:opacity-90 text-[#E6EAF2] font-bold py-3 rounded-2xl transition-colors disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {uploading ? 'Uploading…' : 'Submit Documents'}
                    </button>
                </form>
            )}

            {/* Info */}
            <div className="bg-[#E6EAF2] border border-[#CBD5E1] rounded-2xl px-5 py-4">
                <p className="text-xs font-semibold text-[#0B2D72] mb-2 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> What happens after submission?
                </p>
                <ul className="text-xs text-[#0B2D72] space-y-1 list-disc list-inside">
                    <li>The admin will review your documents from the S3 vault</li>
                    <li>Once approved, your profile shows a <strong>Verified Landlord</strong> badge</li>
                    <li>Verified listings build trust with tenants</li>
                </ul>
            </div>
        </div>
    );
}