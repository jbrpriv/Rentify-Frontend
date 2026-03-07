'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

// ─── Password strength helper ──────────────────────────────────────────────────
function getStrength(pwd) {
  if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 'strong';
  if (pwd.length >= 6) return 'medium';
  return 'weak';
}

const STRENGTH_META = {
  weak:   { label: 'Weak',   bar: 'w-1/3',  color: 'bg-red-400',    text: 'text-red-500'   },
  medium: { label: 'Medium', bar: 'w-2/3',  color: 'bg-amber-400',  text: 'text-amber-600' },
  strong: { label: 'Strong', bar: 'w-full', color: 'bg-green-500',  text: 'text-green-600' },
};

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token');

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  const strength = getStrength(password);
  const sm       = STRENGTH_META[strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 8)  return setError('Password must be at least 8 characters.');
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared card wrapper ────────────────────────────────────────────────────
  const Card = ({ children }) => (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0B2D72 0%, #0992C2 60%, #0AC4E0 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">RentifyPro</h1>
          <p className="text-blue-200/80 text-sm mt-1">Secure password reset</p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  );

  // ── Invalid token ──────────────────────────────────────────────────────────
  if (!token) return (
    <Card>
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">Invalid Link</h2>
        <p className="text-gray-500 text-sm mb-6">
          This reset link is missing or malformed. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="block w-full text-center py-3.5 rounded-2xl bg-[#0992C2] hover:bg-[#0B2D72] text-white text-sm font-black transition-colors"
        >
          Request New Link
        </Link>
      </div>
    </Card>
  );

  return (
    <Card>
      {!success ? (
        <>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
            <Lock className="w-6 h-6 text-[#0992C2]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Set New Password</h2>
          <p className="text-gray-400 text-sm mb-7">
            Choose a strong password — at least 8 characters, one uppercase letter, and one number.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-2xl text-sm font-medium bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0992C2]/20 focus:border-[#0992C2] transition-all placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {password && (
                <div className="mt-2.5">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${sm.color} ${sm.bar}`} />
                  </div>
                  <p className={`text-xs mt-1 font-semibold ${sm.text}`}>{sm.label} password</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm font-medium bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-gray-300 ${
                    confirm && confirm !== password
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-200 focus:ring-[#0992C2]/20 focus:border-[#0992C2]'
                  }`}
                />
              </div>
              {confirm && confirm !== password && (
                <p className="text-red-500 text-xs mt-1 font-medium">Passwords don&apos;t match</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!(confirm && confirm !== password)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0992C2] hover:bg-[#0B2D72] disabled:bg-gray-300 text-white text-sm font-black transition-colors"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Remember it?{' '}
            <Link href="/login" className="text-[#0992C2] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">Password Reset!</h2>
          <p className="text-gray-500 text-sm mb-1">Your password has been updated successfully.</p>
          <p className="text-xs text-gray-400">Redirecting to login in 3 seconds…</p>
        </div>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B2D72 0%, #0992C2 60%, #0AC4E0 100%)' }}>
          <Loader2 className="w-7 h-7 animate-spin text-white" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
