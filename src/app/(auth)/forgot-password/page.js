'use client';

import { useState } from 'react';
import api from '@/utils/api';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, Send, CheckCircle, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 lg:gap-16">

          {/* ── Left: brand story ──────────────────────────────────────────── */}
          <div className="hidden md:block">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-neutral-500 hover:text-neutral-700 transition-colors mb-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to login
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0992C2]/30 bg-white/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-neutral-500 shadow-sm shadow-[#0992C2]/20 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0992C2]" />
              Account recovery
            </div>
            <h1 className="mt-6 text-hero text-left text-neutral-900">
              Recover your<br />
              <span className="bg-gradient-to-r from-[#0B2D72] via-[#0992C2] to-[#0AC4E0] bg-clip-text text-transparent">
                account access.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-neutral-600">
              Enter your email and we'll send a secure reset link straight to your inbox.
              The link is valid for 1 hour.
            </p>
            <div className="mt-8 max-w-md space-y-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-neutral-500">What happens next</p>
              {[
                'We\'ll email you a secure one-time reset link',
                'Click the link and choose a new strong password',
                'You\'ll be signed back in automatically',
              ].map((tip) => (
                <div key={tip} className="rf-card-soft flex items-start gap-3 p-3.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0992C2]" />
                  <p className="text-[0.8rem] text-neutral-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: card ───────────────────────────────────────────────── */}
          <div className="rf-glass-dark rf-fade-in-up w-full max-w-md md:justify-self-end px-8 py-9">

            {/* Mobile back link */}
            <Link href="/login" className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-slate-500 hover:text-slate-300 transition-colors mb-6 md:hidden">
              <ArrowLeft className="h-3 w-3" /> Back to login
            </Link>

            {!sent ? (
              <>
                <div className="mb-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-900/40 border border-sky-700/40">
                    <Mail className="h-6 w-6 text-sky-300" />
                  </div>
                  <p className="text-micro text-slate-400">Password recovery</p>
                  <h2 className="text-h2 mt-1 bg-gradient-to-r from-slate-50 via-sky-100 to-slate-200 bg-clip-text text-transparent">
                    Forgot password?
                  </h2>
                  <p className="mt-2 text-xs text-slate-400">
                    Enter your account email and we'll send you a reset link. It expires in 1 hour.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 rounded-xl border border-red-500/50 bg-red-950/60 px-4 py-3 text-xs text-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <TextField
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    leadingIcon={Mail}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="mt-2 w-full justify-center rounded-2xl py-3.5"
                  >
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</>
                      : <><Send className="h-4 w-4" />Send Reset Link</>}
                  </Button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-500">
                  Remembered it?{' '}
                  <Link href="/login" className="font-semibold text-sky-300 hover:text-sky-200">
                    Sign in
                  </Link>
                </p>
              </>
            ) : (
              /* ── Sent state ────────────────────────────────────────────── */
              <div className="rf-fade-in-up py-4 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-900/40 border border-emerald-700/40">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-h2 bg-gradient-to-r from-emerald-200 via-slate-50 to-slate-200 bg-clip-text text-transparent mb-3">
                  Check your inbox
                </h2>
                <p className="text-sm text-slate-400 mb-2">
                  If <strong className="text-slate-200">{email}</strong> exists in our system, a reset link is on its way.
                </p>
                <p className="text-xs text-slate-500 mb-8">
                  Don't see it? Check your spam folder.
                </p>
                <Button
                  as={Link}
                  href="/login"
                  variant="primary"
                  className="w-full justify-center rounded-2xl py-3.5"
                >
                  Return to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}