'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Trash2, ArrowLeft, CheckCircle, Loader2, Mail, AlertTriangle } from 'lucide-react';

const CONTACT_EMAIL = 'privacy@rentifypro.com';
const COMPANY_NAME = 'RentifyPro';

export default function DataDeletionPage() {
  const [email, setEmail]     = useState('');
  const [reason, setReason]   = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFC]">

      {/* Header */}
      <header className="border-b border-[#0992C2]/15 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0992C2] to-[#0B2D72] shadow-md shadow-[#0992C2]/30">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-neutral-900">{COMPANY_NAME}</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#0992C2] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0B2D72] via-[#0992C2] to-[#0AC4E0] px-6 py-14 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Trash2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Data Deletion</h1>
          <p className="mt-4 text-white/75 text-sm leading-relaxed max-w-lg mx-auto">
            You have the right to request deletion of all your personal data from
            {' '}{COMPANY_NAME}. Submit the form below and we will process your request
            within 30 days.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-6 py-14">

        {/* What gets deleted */}
        <div className="mb-10 rounded-2xl border border-[#0992C2]/20 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-[#0B2D72] text-lg">What will be deleted</h2>
          <ul className="space-y-2.5 text-sm text-neutral-600">
            {[
              'Your account and login credentials',
              'Profile information (name, phone number, profile photo)',
              'All property listings you have created',
              'Messages and conversations',
              'Maintenance requests and dispute records',
              'Notification preferences and FCM tokens',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0992C2]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What is retained */}
        <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold text-amber-800 mb-1">What we are required to retain</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                By law, we are required to retain certain financial and legal records for up to
                7 years. This includes payment transaction records and signed lease agreements
                that constitute legally binding contracts. These records will be anonymised
                where possible but cannot be fully deleted within this retention period.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        {!submitted ? (
          <div className="rounded-2xl border border-[#0992C2]/15 bg-white p-8 shadow-sm">
            <h2 className="mb-6 font-bold text-[#0B2D72] text-lg">Submit a deletion request</h2>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Email address on your account <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0992C2]/50 focus:border-[#0992C2]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                  Reason for deletion <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. No longer using the platform, privacy concerns..."
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0992C2]/50 focus:border-[#0992C2] resize-none"
                />
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                By submitting this form you confirm that you are the account holder for the
                email address provided. We may send a verification email to confirm your
                identity before processing the deletion.
              </p>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {loading ? 'Submitting…' : 'Request Account Deletion'}
              </button>
            </form>
          </div>
        ) : (
          /* Success state */
          <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-2">Request received</h2>
            <p className="text-sm text-green-700 leading-relaxed max-w-sm mx-auto">
              We have received your deletion request for <strong>{email}</strong>.
              We will process it within 30 days and send a confirmation to your email.
            </p>
          </div>
        )}

        {/* Manual email fallback */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 flex items-center gap-4 shadow-sm">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0992C2]/10">
            <Mail className="h-5 w-5 text-[#0992C2]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">Prefer to email us?</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Send a deletion request directly to{' '}
              <a href={`mailto:${CONTACT_EMAIL}?subject=Data Deletion Request`} className="text-[#0992C2] hover:underline font-medium">
                {CONTACT_EMAIL}
              </a>
              {' '}with your account email address.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-neutral-400">
          Read our{' '}
          <Link href="/privacy" className="text-[#0992C2] hover:underline">Privacy Policy</Link>
          {' '}for full details on how we handle your data.
        </div>
      </main>

      <footer className="border-t border-[#0992C2]/15 py-6 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved. &nbsp;·&nbsp;
        <Link href="/privacy" className="hover:text-[#0992C2] transition-colors">Privacy Policy</Link>
        &nbsp;·&nbsp;
        <Link href="/data-deletion" className="hover:text-[#0992C2] transition-colors">Data Deletion</Link>
      </footer>
    </div>
  );
}
