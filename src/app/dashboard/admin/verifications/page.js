'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import api from '@/utils/api';
import {
    BadgeCheck, Upload, FileText, CheckCircle, Clock,
    AlertCircle, Loader2, X, Plus,
} from 'lucide-react';

const DOC_TYPES = [
    { value: 'cnic', label: 'CNIC (National ID Card)' },
    { value: 'passport', label: 'Passport' },
    { value: 'business_registration', label: 'Business Registration' },
    { value: 'ownership_deed', label: 'Property Ownership Deed' },
    { value: 'utility_bill', label: 'Utility Bill' },
    { value: 'other', label: 'Other' },
];

export default function VerificationPage() {
    const { user } = useUser();
    const router = useRouter();
    const [status, setStatus] = useState(null); // 'none' | 'pending' | 'approved' | 'rejected'
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState('');
    const [documents, setDocuments] = useState([
        { url: '', documentType: 'cnic', originalName: '' },
    ]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 4000);
    };

    useEffect(() => {
        if (!user) return;
        if (!['landlord', 'property_manager'].includes(user.role)) {
            router.push('/dashboard');
            return;
        }
        // Fetch current verification status from profile
        api.get('/users/me')
            .then(({ data }) => {
                setStatus(data.verificationStatus || 'none');
            })
            .catch(() => setStatus('none'))
            .finally(() => setLoading(false));
    }, [user]); // eslint-disable-line

    const addDocument = () => {
        setDocuments(prev => [...prev, { url: '', documentType: 'cnic', originalName: '' }]);
    };

    const removeDocument = (idx) => {
        setDocuments(prev => prev.filter((_, i) => i !== idx));
    };

    const updateDocument = (idx, field, value) => {
        setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const valid = documents.filter(d => d.url.trim());
        if (valid.length === 0) {
            showToast('Please provide at least one document URL.');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/users/verification/submit', { documents: valid });
            setStatus('pending');
            showToast('Documents submitted! Awaiting admin review.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 bg-white border border-blue-200 rounded-2xl px-5 py-3 shadow-xl text-sm font-medium text-blue-800 animate-in fade-in slide-in-from-top-2">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BadgeCheck className="h-6 w-6 text-blue-600" />
                    Document Verification
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Submit your identity and ownership documents to get verified.
                </p>
            </div>

            {/* Status Card */}
            {status === 'approved' && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                    <CheckCircle className="h-8 w-8 text-green-600 shrink-0" />
                    <div>
                        <p className="font-bold text-green-800">Documents Verified ✓</p>
                        <p className="text-sm text-green-700 mt-0.5">Your documents have been reviewed and approved by the admin. Your profile now shows as a verified landlord.</p>
                    </div>
                </div>
            )}

            {status === 'pending' && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                    <Clock className="h-8 w-8 text-amber-600 shrink-0" />
                    <div>
                        <p className="font-bold text-amber-800">Under Review</p>
                        <p className="text-sm text-amber-700 mt-0.5">Your documents have been submitted and are awaiting admin review. This usually takes 1–2 business days.</p>
                    </div>
                </div>
            )}

            {status === 'rejected' && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                    <AlertCircle className="h-8 w-8 text-red-600 shrink-0" />
                    <div>
                        <p className="font-bold text-red-800">Documents Rejected</p>
                        <p className="text-sm text-red-700 mt-0.5">Your documents were not accepted. Please re-submit clearer or correct documents below.</p>
                    </div>
                </div>
            )}

            {/* Submission Form */}
            {(status === 'none' || status === 'rejected') && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div>
                        <h2 className="font-bold text-gray-900 mb-1">Submit Verification Documents</h2>
                        <p className="text-xs text-gray-500">Upload links to your documents from S3, Cloudinary, or any accessible URL. Accepted: CNIC, Passport, Business Registration, etc.</p>
                    </div>

                    {documents.map((doc, idx) => (
                        <div key={idx} className="rounded-xl border border-gray-200 p-4 space-y-3 relative">
                            {documents.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeDocument(idx)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Document Type</label>
                                <select
                                    value={doc.documentType}
                                    onChange={e => updateDocument(idx, 'documentType', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Document URL</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={doc.url}
                                    onChange={e => updateDocument(idx, 'url', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">File Name (optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. cnic-front.jpg"
                                    value={doc.originalName}
                                    onChange={e => updateDocument(idx, 'originalName', e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addDocument}
                        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                        <Plus className="h-4 w-4" /> Add another document
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-colors disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {submitting ? 'Submitting…' : 'Submit Documents'}
                    </button>
                </form>
            )}

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
                <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> What happens after submission?
                </p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>The admin will review your submitted documents</li>
                    <li>Once approved, your profile will show a <strong>Verified Landlord</strong> badge</li>
                    <li>Verified listings build trust with tenants and rank higher</li>
                </ul>
            </div>
        </div>
    );
}