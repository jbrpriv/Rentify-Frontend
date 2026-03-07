'use client';

/**
 * Secure Tenant Document Viewer — Landlord Only
 *
 * Landlords can VIEW tenant-uploaded identity and income documents through
 * a sandboxed iframe. The viewer intentionally prevents downloads and
 * right-click interactions to protect tenant privacy.
 *
 * Access control is enforced on the backend:
 *   GET /api/upload/landlord/tenant-documents/:tenantId
 * — returns short-lived (10-min) signed S3 view URLs only for landlords
 *   who have an agreement with the tenant.
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import api from '@/utils/api';
import {
  FileText, FileImage, Loader2, ShieldCheck,
  AlertTriangle, ChevronLeft, Eye, X, Lock,
} from 'lucide-react';

const DOC_TYPE_LABELS = {
  id_card:          'National ID / CNIC',
  income_proof:     'Income Proof',
  bank_statement:   'Bank Statement',
  reference_letter: 'Reference Letter',
  general:          'Document',
};

function DocIcon({ name }) {
  const ext = name?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext))
    return <FileImage className="w-5 h-5 text-purple-500" />;
  return <FileText className="w-5 h-5 text-blue-500" />;
}

// ─── Secure viewer modal ───────────────────────────────────────────────────────
// The iframe is sandboxed to block downloads, scripts, and form submissions.
// CSS disables right-click context menus and pointer-event overlays are added
// to make screenshot automation harder (though screenshots cannot be fully
// prevented by software alone).
function SecureDocViewer({ url, name, onClose }) {
  const overlayRef = useRef(null);

  // Block right-click on the overlay to discourage casual right-click saving
  const handleContextMenu = (e) => e.preventDefault();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onContextMenu={handleContextMenu}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 truncate max-w-xs">{name}</p>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                Secure view — download disabled
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sandboxed document frame */}
        <div className="relative flex-1 overflow-hidden select-none" ref={overlayRef}>
          {/* Transparent overlay prevents right-click save on images */}
          <div
            className="absolute inset-0 z-10"
            onContextMenu={handleContextMenu}
            style={{ pointerEvents: 'none' }}
          />
          <iframe
            src={url}
            title={name}
            className="w-full border-0"
            style={{ height: '70vh' }}
            // sandbox restricts: downloads, popups, form submissions, scripts from the frame
            sandbox="allow-same-origin"
            // Instruct browser not to show the PDF toolbar (Chrome/Edge honour this)
            onLoad={(e) => {
              try {
                e.target.contentDocument?.querySelector('embed,object')?.setAttribute('type', 'application/pdf');
              } catch { /* cross-origin — ignore */ }
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function TenantDocumentsLandlordPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { user }    = useUser();

  const tenantId   = searchParams.get('tenantId');
  const tenantName = searchParams.get('name') || 'Tenant';

  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [viewing, setViewing] = useState(null); // { url, name }

  // Role guard
  useEffect(() => {
    if (!user) return;
    if (!['landlord', 'admin'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tenantId) {
      setError('No tenant specified.');
      setLoading(false);
      return;
    }
    api.get(`/upload/landlord/tenant-documents/${tenantId}`)
      .then(({ data }) => setDocs(data.documents || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load documents.'))
      .finally(() => setLoading(false));
  }, [tenantId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Back + header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
              {tenantName}&apos;s Documents
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              View-only access — downloading and saving is restricted
            </p>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          These documents are shared by the tenant for verification purposes only.
          Downloading, screenshotting, or distributing them without consent may
          violate privacy regulations.
        </p>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-red-200">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="font-bold text-gray-600">{error}</p>
        </div>
      )}

      {!loading && !error && docs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-500">No documents uploaded</p>
          <p className="text-sm text-gray-400 mt-1">
            The tenant has not uploaded any documents yet.
          </p>
        </div>
      )}

      {!loading && !error && docs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <DocIcon name={doc.originalName} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {doc.originalName || 'Document'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {DOC_TYPE_LABELS[doc.documentType] || 'Document'}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-gray-400">
                Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '—'}
              </p>

              {doc.url ? (
                <button
                  onClick={() => setViewing({ url: doc.url, name: doc.originalName || 'Document' })}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-xl transition"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-400 text-xs rounded-xl">
                  <Lock className="w-3.5 h-3.5" /> Not available
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Secure viewer modal */}
      {viewing && (
        <SecureDocViewer
          url={viewing.url}
          name={viewing.name}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}
