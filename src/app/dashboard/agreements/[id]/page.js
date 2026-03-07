'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import {
    ArrowLeft, FileText, User, Building2, Calendar, DollarSign,
    CheckCircle, Clock, AlertCircle, PenLine, Download, GitBranch,
    TrendingUp, Shield, Loader2, Home, Mail, Phone, FolderOpen,
} from 'lucide-react';

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    sent: { label: 'Sent', color: 'bg-yellow-100 text-yellow-700' },
    pending_signature: { label: 'Pending Signature', color: 'bg-orange-100 text-orange-700' },
    signed: { label: 'Signed', color: 'bg-blue-100 text-blue-700' },
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-700' },
    terminated: { label: 'Terminated', color: 'bg-red-100 text-red-800' },
};

function StatusBadge({ status }) {
    const s = STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${s.color}`}>
            {s.label}
        </span>
    );
}

function InfoRow({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{value || '—'}</p>
            </div>
        </div>
    );
}

function PartyCard({ label, person }) {
    if (!person) return null;
    return (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="font-bold text-gray-900">{person.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {person.email}
                    </p>
                    {person.phoneNumber && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {person.phoneNumber}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function SignatureBadge({ signed, label }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${signed ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
            {signed ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {label}: {signed ? 'Signed' : 'Pending'}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AgreementDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();

    const [agreement, setAgreement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    const isLandlordOrAdmin = user && ['landlord', 'property_manager', 'admin'].includes(user.role);

    useEffect(() => {
        if (!id) return;
        api.get(`/agreements/${id}`)
            .then(({ data }) => setAgreement(data))
            .catch((err) => {
                toast(err.response?.data?.message || 'Failed to load agreement', 'error');
                router.push('/dashboard/agreements');
            })
            .finally(() => setLoading(false));
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const response = await api.get(`/agreements/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Agreement-${agreement?.property?.title?.replace(/\s+/g, '-') || id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast('Failed to download PDF', 'error');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (!agreement) return null;

    const { landlord, tenant, property, term, financials, signatures, status, rentEscalation, clauseSet } = agreement;

    const startDate = term?.startDate ? new Date(term.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
    const endDate = term?.endDate ? new Date(term.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-400">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
                            {property?.title || 'Agreement Detail'}
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Agreement ID: <span className="font-mono text-xs">{id}</span>
                        </p>
                    </div>
                    <StatusBadge status={status} />
                </div>

                {/* Action bar */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition"
                    >
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Download PDF
                    </button>
                    <button
                        onClick={() => router.push(`/dashboard/agreements/${id}/history`)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 transition"
                    >
                        <GitBranch className="w-4 h-4" />
                        Version History
                    </button>

                    {/* Tenant Documents — landlord / PM / admin only */}
                    {isLandlordOrAdmin && tenant && (
                        <button
                            onClick={() => router.push(`/dashboard/agreements/${id}/tenant-documents`)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-sm font-semibold rounded-xl text-blue-700 hover:bg-blue-100 transition"
                        >
                            <FolderOpen className="w-4 h-4" />
                            Tenant Documents
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left column: Parties */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Parties</h2>
                            <PartyCard label="Landlord" person={landlord} />
                            <PartyCard label="Tenant" person={tenant} />
                        </div>

                        {/* Signatures */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Signatures</h2>
                            <SignatureBadge signed={signatures?.landlord?.signed} label="Landlord" />
                            <SignatureBadge signed={signatures?.tenant?.signed} label="Tenant" />
                            {signatures?.landlord?.signedAt && (
                                <p className="text-xs text-gray-400">
                                    Landlord signed: {new Date(signatures.landlord.signedAt).toLocaleString()}
                                </p>
                            )}
                            {signatures?.tenant?.signedAt && (
                                <p className="text-xs text-gray-400">
                                    Tenant signed: {new Date(signatures.tenant.signedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right column: Details */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Property */}
                        {property && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Property</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoRow label="Property" value={property.title} icon={Home} />
                                    <InfoRow label="Type" value={property.type} icon={Building2} />
                                    {property.address && (
                                        <InfoRow
                                            label="Address"
                                            value={`${property.address.street}, ${property.address.city}, ${property.address.state}`}
                                            icon={Building2}
                                        />
                                    )}
                                    {property.specs && (
                                        <InfoRow
                                            label="Specs"
                                            value={`${property.specs.bedrooms} bed · ${property.specs.bathrooms} bath`}
                                            icon={Home}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Lease Terms */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Lease Terms</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoRow label="Start Date" value={startDate} icon={Calendar} />
                                <InfoRow label="End Date" value={endDate} icon={Calendar} />
                                <InfoRow label="Monthly Rent" value={`Rs. ${financials?.rentAmount?.toLocaleString()}`} icon={DollarSign} />
                                <InfoRow label="Security Deposit" value={`Rs. ${financials?.depositAmount?.toLocaleString()}`} icon={Shield} />
                                {financials?.lateFeeAmount > 0 && (
                                    <InfoRow label="Late Fee" value={`Rs. ${financials.lateFeeAmount} after ${financials.lateFeeGracePeriodDays} days`} icon={AlertCircle} />
                                )}
                            </div>

                            {rentEscalation?.enabled && (
                                <div className="mt-4 flex items-center gap-2 bg-purple-50 rounded-xl px-4 py-3">
                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-semibold text-purple-700">
                                        Annual rent escalation: +{rentEscalation.percentage}% per year
                                    </span>
                                    {rentEscalation.nextScheduledAt && (
                                        <span className="ml-auto text-xs text-purple-500">
                                            Next: {new Date(rentEscalation.nextScheduledAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Clauses */}
                        {clauseSet?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                                    Agreement Clauses ({clauseSet.length})
                                </h2>
                                <div className="space-y-3">
                                    {clauseSet.map((clause, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{clause.title || `Clause ${i + 1}`}</p>
                                                {clause.body && (
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{clause.body}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}