'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  FileText, CheckCircle, XCircle, Loader2, Shield, Calendar, User, Building,
  AlertTriangle, Eye, Download,
} from 'lucide-react';

// ─── Inline PDF Preview ───────────────────────────────────────────────────────
function PDFPreview({ agreementId, token }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!agreementId || !token) return;
    fetch(`/api/agreements/${agreementId}/preview`, {
      headers: { 'x-sign-token': token },
    })
      .then(r => r.json())
      .then(data => {
        if (data.url) {
          setPreviewUrl(data.url);
        } else if (data.base64) {
          setPreviewUrl(`data:application/pdf;base64,${data.base64}`);
        }
      })
      .catch(() => setError('Could not load preview'))
      .finally(() => setLoading(false));
  }, [agreementId, token]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg text-gray-500 text-sm gap-2">
      <AlertTriangle className="w-4 h-4" /> {error}
    </div>
  );

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 text-sm text-gray-600 border-b">
        <Eye className="w-4 h-4" />
        <span>Agreement Preview</span>
      </div>
      <iframe
        src={previewUrl}
        title="Agreement PDF Preview"
        className="w-full"
        style={{ height: '600px', border: 'none' }}
      />
    </div>
  );
}

// ─── Main Signing Page ────────────────────────────────────────────────────────
function SignPageContent() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const token  = searchParams.get('token');
  const party  = searchParams.get('party');

  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [signing, setSigning]     = useState(false);
  const [signed, setSigned]       = useState(false);
  const [error, setError]         = useState('');
  const [agreed, setAgreed]       = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!params.id || !token) {
      setError('Invalid signing link — token is missing.');
      setLoading(false);
      return;
    }

    // Fetch agreement summary (public endpoint using token)
    fetch(`/api/agreements/${params.id}?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.message) setError(data.message);
        else setAgreement(data);
      })
      .catch(() => setError('Could not load agreement details.'))
      .finally(() => setLoading(false));
  }, [params.id, token]);

  const handleSign = async () => {
    if (!agreed) return;
    setSigning(true);
    setError('');
    try {
      const res = await fetch(`/api/agreements/${params.id}/sign-via-token`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, party }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signing failed');
      setSigned(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSigning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center gap-3 text-gray-600">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        <p className="text-sm">Loading agreement…</p>
      </div>
    </div>
  );

  if (signed) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full mx-4 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Agreement Signed!</h1>
        <p className="text-gray-600 mb-2">
          Your signature has been recorded with a timestamp and your IP address for legal verification.
        </p>
        <p className="text-sm text-gray-400 mt-6">
          You may close this window. A copy will be sent to all parties once everyone has signed.
        </p>
        <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-green-700">
          <Shield className="w-4 h-4 inline mr-1.5" />
          Legally binding e-signature recorded
        </div>
      </div>
    </div>
  );

  if (error && !agreement) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full mx-4 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Invalid Link</h1>
        <p className="text-gray-600">{error}</p>
        <p className="text-sm text-gray-400 mt-4">
          This link may have expired or already been used. Contact the landlord for a new invitation.
        </p>
      </div>
    </div>
  );

  const partyLabel = party === 'landlord' ? 'Landlord' : 'Tenant';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border text-sm text-gray-600 mb-4">
            <Shield className="w-4 h-4 text-blue-600" />
            Secure Document Signing
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Review & Sign Agreement</h1>
          <p className="text-gray-500 mt-2">Signing as: <span className="font-semibold text-blue-700">{partyLabel}</span></p>
        </div>

        {/* Agreement Details Card */}
        {agreement && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <div>
                  <h2 className="font-semibold text-lg">Rental Agreement</h2>
                  <p className="text-blue-200 text-sm">ID: {params.id}</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agreement.property && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Property</p>
                    <p className="font-medium text-gray-800">{agreement.property?.title || '—'}</p>
                    <p className="text-sm text-gray-500">
                      {agreement.property?.address?.city}, {agreement.property?.address?.state}
                    </p>
                  </div>
                </div>
              )}
              {agreement.term && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Lease Term</p>
                    <p className="font-medium text-gray-800">{agreement.term?.durationMonths || '—'} months</p>
                    <p className="text-sm text-gray-500">
                      {agreement.term?.startDate
                        ? new Date(agreement.term.startDate).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Landlord</p>
                  <p className="font-medium text-gray-800">{agreement.landlord?.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Tenant</p>
                  <p className="font-medium text-gray-800">{agreement.tenant?.name || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowPreview(v => !v)}
            className="flex items-center gap-2 text-sm text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 transition px-4 py-2 rounded-lg border border-blue-200 w-full justify-center"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'View'} Full Agreement PDF
          </button>
          {showPreview && (
            <div className="mt-4">
              <PDFPreview agreementId={params.id} token={token} />
            </div>
          )}
        </div>

        {/* Consent checkbox + sign button */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> Legal Acknowledgement
          </h3>

          <label className="flex items-start gap-3 cursor-pointer mb-6 group">
            <div className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              agreed ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
            }`}
              onClick={() => setAgreed(v => !v)}
            >
              {agreed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>}
            </div>
            <span className="text-sm text-gray-600 leading-relaxed">
              I, as the <strong>{partyLabel}</strong>, have read and understood the complete rental agreement above.
              I agree to all terms and conditions. I understand that my electronic signature is legally
              binding and equivalent to a handwritten signature under applicable law.
            </span>
          </label>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleSign}
            disabled={!agreed || signing}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
              agreed && !signing
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {signing ? (
              <><Loader2 className="animate-spin w-5 h-5" /> Signing…</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Sign Agreement as {partyLabel}</>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Your IP address and timestamp will be recorded as part of the legally binding signature.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    }>
      <SignPageContent />
    </Suspense>
  );
}
