'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useBranding } from '@/context/BrandingContext';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { brandName } = useBranding();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
    ? 'strong' : password.length >= 6 ? 'medium' : 'weak';

  const strengthConfig = {
    weak: { width: 'w-1/3', color: 'bg-red-500', text: 'text-red-400', label: 'Weak' },
    medium: { width: 'w-2/3', color: 'bg-amber-400', text: 'text-amber-400', label: 'Medium' },
    strong: { width: 'w-full', color: 'bg-emerald-500', text: 'text-emerald-400', label: 'Strong' },
  };
  const sc = strengthConfig[strength];

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // ── Invalid / missing token state ────────────────────────────────────────────
  if (!token) return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="rf-glass-dark rf-fade-in-up w-full max-w-md px-8 py-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-900/40 border border-red-700/40">
            <XCircle className="h-7 w-7 text-red-400" />
          </div>
          <h1 className="text-h2 bg-gradient-to-r from-slate-50 via-red-200 to-slate-300 bg-clip-text text-transparent mb-3">
            Invalid Link
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            This password reset link is missing or malformed. Request a new one below.
          </p>
          <Button
            as={Link}
            href="/forgot-password"
            variant="primary"
            className="w-full justify-center rounded-2xl py-3.5"
          >
            Request New Link
          </Button>
          <Link href="/login" className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );

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
              Account security
            </div>
            <h1 className="mt-6 text-hero text-left text-neutral-900">
              Set a new<br />
              <span className="bg-gradient-to-r from-[#0B2D72] via-[#0992C2] to-[#0AC4E0] bg-clip-text text-transparent">
                secure password.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-neutral-600">
              Choose a strong password to keep your {brandName} account safe.
              You'll be signed in automatically after resetting.
            </p>

            {/* Password tips */}
            <div className="mt-8 max-w-md space-y-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-neutral-500">Password tips</p>
              {[
                'Use a mix of uppercase letters, numbers, and symbols',
                'Avoid reusing passwords from other accounts',
                'A passphrase of 3+ random words works great too',
              ].map((tip) => (
                <div key={tip} className="rf-card-soft flex items-start gap-3 p-3.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0992C2]" />
                  <p className="text-[0.8rem] text-neutral-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: reset card ─────────────────────────────────────────── */}
          <div className="rf-glass-dark rf-fade-in-up w-full max-w-md md:justify-self-end px-8 py-9">

            {/* Mobile back link */}
            <Link href="/login" className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-slate-500 hover:text-slate-300 transition-colors mb-6 md:hidden">
              <ArrowLeft className="h-3 w-3" /> Back to login
            </Link>

            {!success ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-900/40 border border-sky-700/40">
                    <Lock className="h-6 w-6 text-sky-300" />
                  </div>
                  <p className="text-micro text-slate-400">Password reset</p>
                  <h2 className="text-h2 mt-1 bg-gradient-to-r from-slate-50 via-sky-100 to-slate-200 bg-clip-text text-transparent">
                    Set new password
                  </h2>
                  <p className="mt-2 text-xs text-slate-400">
                    Must be at least 8 characters with one uppercase letter and one number.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-6 rounded-xl border border-red-500/50 bg-red-950/60 px-4 py-3 text-xs text-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      New Password
                    </label>
                    <div className="relative">
                      <TextField
                        type={showPwd ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        leadingIcon={Lock}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(v => !v)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-200 transition"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {password && (
                      <div className="pt-1 space-y-2">
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${sc.color} ${sc.width}`} />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-[10px] font-semibold uppercase tracking-wider ${sc.text}`}>
                            {sc.label} password
                          </p>
                          <div className="flex items-center gap-3">
                            {requirements.map(r => (
                              <span key={r.label} className={`text-[9px] flex items-center gap-1 ${r.met ? 'text-emerald-400' : 'text-slate-600'}`}>
                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${r.met ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                                {r.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <TextField
                        type={showCfm ? 'text' : 'password'}
                        required
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Repeat your password"
                        leadingIcon={Lock}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCfm(v => !v)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-200 transition"
                      >
                        {showCfm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirm && confirm !== password && (
                      <p className="text-[11px] text-red-400 font-medium">Passwords don't match</p>
                    )}
                    {confirm && confirm === password && password.length >= 8 && (
                      <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || (confirm.length > 0 && confirm !== password)}
                    className="mt-2 w-full justify-center rounded-2xl py-3.5"
                  >
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Resetting…</>
                      : 'Reset Password'}
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
              /* ── Success state ─────────────────────────────────────────── */
              <div className="rf-fade-in-up py-4 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-900/40 border border-emerald-700/40">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-h2 bg-gradient-to-r from-emerald-200 via-slate-50 to-slate-200 bg-clip-text text-transparent mb-3">
                  Password reset!
                </h2>
                <p className="text-sm text-slate-400 mb-2">
                  Your password has been updated successfully.
                </p>
                <p className="text-xs text-slate-500">
                  Redirecting you to login in 3 seconds…
                </p>
                <div className="mt-6 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0992C2] to-[#0AC4E0] animate-[progress_3s_linear_forwards]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}