'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api, { setAccessToken } from '@/utils/api';
import { requestFCMToken } from '@/utils/firebase';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useBranding } from '@/context/BrandingContext';
import {
  Lock, Mail, Loader2, Eye, EyeOff,
  ShieldCheck, Phone, CheckCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { ArrowLeft } from 'lucide-react';

// ─── reCAPTCHA v3 helper ──────────────────────────────────────────────────────
const getRecaptchaToken = (action) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.grecaptcha) return resolve(null);
    window.grecaptcha.ready(async () => {
      try {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!siteKey) return resolve(null);
        const token = await window.grecaptcha.execute(siteKey, { action });
        resolve(token);
      } catch {
        resolve(null);
      }
    });
  });
};

function LoginContent() {
  const router = useRouter();
  const { setUser, user } = useUser();
  const { brandName } = useBranding();

  // SEC-05: redirect already-logged-in users away from login page
  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const searchParams = useSearchParams();
  const [facebookNotice, setFacebookNotice] = useState(false);

  useEffect(() => {
    if (searchParams.get('notice') === 'facebook_no_email') setFacebookNotice(true);
  }, [searchParams]);

  // 2FA flow
  const [needs2FA, setNeeds2FA] = useState(false);
  const [userId2FA, setUserId2FA] = useState('');
  const [totp, setTotp] = useState('');
  const [totpLoading, setTotpLoading] = useState(false);

  // Email verification flow
  const [needsEmailVerify, setNeedsEmailVerify] = useState(false);
  const [emailForVerify, setEmailForVerify] = useState('');
  const [emailToken, setEmailToken] = useState('');

  // Phone verification flow
  // pendingEmail is the only thing held between the login response and the
  // successful OTP confirm.  No token, no userInfo enters localStorage until
  // verifyPhoneOTP returns a real JWT.
  const [needsPhoneVerify, setNeedsPhoneVerify] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  // ─── Login submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // reCAPTCHA v3 token (null if not configured — backend accepts gracefully)
      const recaptchaToken = await getRecaptchaToken('login');

      const { data } = await api.post('/auth/login', { ...formData, recaptchaToken });

      if (data.twoFactorEnabled) {
        setUserId2FA(data._id);
        setNeeds2FA(true);
      } else {
        setAccessToken(data.token);
        setUser(data);
        requestFCMToken(true).catch(() => { }); // async, non-blocking
        router.push('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'EMAIL_NOT_VERIFIED') {
        setEmailForVerify(formData.email);
        setNeedsEmailVerify(true);
      } else if (msg === 'PHONE_NOT_VERIFIED') {
        // Server confirmed email is verified but phone is not.
        // Store ONLY the email in React state — nothing goes into localStorage
        // until the user proves phone ownership below.
        // If the user closes the tab now and comes back days later, localStorage
        // is empty so the dashboard guard sends them back to /login, which
        // hits the server again and returns PHONE_NOT_VERIFIED again — correct flow.
        const email = err.response?.data?.email || formData.email;
        setPendingEmail(email);
        setNeedsPhoneVerify(true);
        try {
          await api.post('/auth/send-otp', { email });
        } catch (otpErr) {
          setError(otpErr.response?.data?.message || 'Could not send OTP — tap Resend to try again.');
        }
      } else if (msg === 'OAUTH_ACCOUNT') {
        // This email was registered via Google/Facebook — no password exists
        const providerLabel = err.response?.data?.provider === 'google' ? 'Google'
          : err.response?.data?.provider === 'facebook' ? 'Facebook'
            : 'social login';
        setError(`This account was created with ${providerLabel}. Please use the "Continue with ${providerLabel}" button below to sign in.`);
      } else {
        setError(msg || 'Login failed');
      }
    } finally { setLoading(false); }
  };

  // ─── 2FA ────────────────────────────────────────────────────────────────────
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setTotpLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/2fa/validate', { userId: userId2FA, token: totp });
      setAccessToken(data.token);
      setUser(data);
      requestFCMToken(true).catch(() => { }); // async, non-blocking
      router.push('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Invalid 2FA code'); }
    finally { setTotpLoading(false); }
  };

  // ─── Email verification ──────────────────────────────────────────────────────
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/verify-email', { email: emailForVerify, code: emailToken });

      // Email is confirmed. Phone verification always comes after email in the
      // register flow, so if the user was stuck on email verify, their phone is
      // definitely not verified either. Go straight to phone OTP — no need to
      // hit /auth/login first (which would just bounce back with PHONE_NOT_VERIFIED
      // anyway, plus require a reCAPTCHA round-trip).
      const email = emailForVerify || formData.email;
      setPendingEmail(email);
      setNeedsEmailVerify(false);
      setNeedsPhoneVerify(true);
      try {
        await api.post('/auth/send-otp', { email });
      } catch (otpErr) {
        setError(otpErr.response?.data?.message || 'Could not send OTP — tap Resend to try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
    }
    finally { setLoading(false); }
  };

  // ─── Phone verification ─────────────────────────────────────────────────────
  // verify-otp is now public and returns a real JWT on success.
  // This is the ONLY place anything is written to localStorage in the phone flow.
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { email: pendingEmail, code: phoneOTP });
      // Server confirmed OTP and returned real tokens — safe to persist now
      setAccessToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        role: data.role,
        email: data.email,
        isVerified: true,
        isPhoneVerified: true,
        twoFactorEnabled: data.twoFactorEnabled || false,
      });
      requestFCMToken(true).catch(() => { }); // async, non-blocking
      router.push('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    setSending(true);
    try {
      await api.post('/auth/send-otp', { email: pendingEmail });
      setSuccess('OTP resent!');
      setTimeout(() => setSuccess(''), 3000);
    }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSending(false); }
  };

  const handleResendEmailVerification = async () => {
    setSending(true);
    try { await api.post('/auth/resend-verification', { email: emailForVerify }); setSuccess('Verification email resent!'); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSending(false); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      {/* Back to home — always visible, anchored top-left */}
      <div className="px-6 pt-6 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-neutral-500 hover:text-neutral-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 lg:gap-16">

          {/* Left: brand story */}
          <div className="hidden md:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0992C2]/30 bg-white/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-neutral-500 shadow-sm shadow-[#0992C2]/20 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0992C2]" />
              Secure rental workspace
            </div>
            <h1 className="mt-6 text-hero text-left text-neutral-900">
              Sign in to your
              <br />
              <span className="bg-gradient-to-r from-[#0B2D72] via-[#0992C2] to-[#0AC4E0] bg-clip-text text-transparent">
                calm renting HQ.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-neutral-600">
              One place for applications, agreements, payments, and maintenance —
              with an interface that feels as premium as the homes you manage.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-3 text-left text-[0.8rem]">
              <div className="rf-card-soft p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-500">For tenants</p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">Track every application and lease from a single, calm dashboard.</p>
              </div>
              <div className="rf-card-soft p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-neutral-500">For landlords</p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">See payments, renewals, and maintenance in real time.</p>
              </div>
            </div>
          </div>

          {/* Right: login card */}
          <div className="rf-glass-dark rf-fade-in-up w-full max-w-md md:justify-self-end px-8 py-9">
            <div className="mb-8 text-center md:text-left">
              <p className="text-micro text-slate-400">Welcome back</p>
              <h2 className="text-h2 mt-1 bg-gradient-to-r from-slate-50 via-sky-100 to-slate-200 bg-clip-text text-transparent">
                Sign in to {brandName}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Manage your rentals, agreements, and tenants in one premium dashboard.
              </p>
            </div>

            {facebookNotice && (
              <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-950/60 px-4 py-3 text-xs text-amber-100">
                <strong>Facebook didn't share your email.</strong> Please sign up manually below.
              </div>
            )}
            {error && (
              <div
                data-testid="auth-error"
                role="alert"
                aria-live="polite"
                className="mb-6 rounded-xl border border-red-500/50 bg-red-950/60 px-4 py-3 text-xs text-red-100"
              >
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/60 bg-emerald-900/60 px-4 py-3 text-xs text-emerald-100">
                <CheckCircle className="h-4 w-4" />{success}
              </div>
            )}

            {/* Normal Login */}
            {!needs2FA && !needsEmailVerify && !needsPhoneVerify && (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <TextField
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    leadingIcon={Mail}
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block leading-none text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Password</label>
                      <Link href="/forgot-password" className="text-[11px] font-medium text-sky-300 hover:text-sky-200">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <TextField
                        type={showPwd ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        leadingIcon={Lock}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700"
                        title={showPwd ? 'Hide password' : 'Show password'}
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="mt-3 w-full justify-center rounded-2xl py-3.5"
                  >
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> : 'Sign in'}
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-800" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">Or</span>
                  <div className="h-px flex-1 bg-slate-800" />
                </div>

                {/* Google OAuth */}
                <a
                  href="/api/auth/google"
                  className="mb-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#0992C2]/50 bg-white/10 py-3 text-sm font-semibold text-slate-100 hover:bg-white/20 hover:border-[#0992C2] transition-all ring-1 ring-white/10"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </a>

                {/* Facebook OAuth */}
                <a
                  href="/api/auth/facebook"
                  className="mb-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#0992C2]/50 bg-white/10 py-3 text-sm font-semibold text-slate-100 hover:bg-white/20 hover:border-[#0992C2] transition-all ring-1 ring-white/10"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </a>

                <p className="mt-4 text-center text-xs text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="font-semibold text-sky-300 hover:text-sky-200">Sign up</Link>
                </p>
                <p className="mt-2 text-center text-[11px] text-slate-500">
                  Staff?{' '}
                  <Link href="/super-login" className="font-semibold text-purple-300 hover:text-purple-200">
                    Admin / Law Reviewer Portal →
                  </Link>
                </p>
              </>
            )}

            {/* 2FA */}
            {needs2FA && (
              <form onSubmit={handle2FASubmit} className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20">
                    <ShieldCheck className="h-7 w-7 text-indigo-300" />
                  </div>
                  <h3 className="text-h3 text-slate-50">Two-Factor Auth</h3>
                  <p className="mt-1 text-xs text-slate-400">Enter the 6‑digit code from your authenticator app.</p>
                </div>
                <input
                  type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                  value={totp} onChange={(e) => setTotp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 py-4 text-center text-3xl font-black tracking-[0.5em] text-slate-50 shadow-sm outline-none ring-1 ring-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/70"
                />
                <Button type="submit" variant="primary" disabled={totpLoading || totp.length < 6} className="w-full justify-center rounded-2xl py-3.5">
                  {totpLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying…</> : 'Verify & Sign in'}
                </Button>
                <button type="button" onClick={() => { setNeeds2FA(false); setError(''); }} className="w-full text-xs text-slate-500 hover:text-slate-300">
                  ← Back to login
                </button>
              </form>
            )}

            {/* Email Verification — N8 fixed: sends { email, code } */}
            {needsEmailVerify && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20">
                    <Mail className="h-7 w-7 text-indigo-200" />
                  </div>
                  <h3 className="text-h3 text-slate-50">Verify your email</h3>
                  <p className="mt-1 text-xs text-slate-400">Enter the 6‑digit code from the email sent to <strong>{emailForVerify}</strong>.</p>
                </div>
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <TextField
                    type="text"
                    required
                    value={emailToken}
                    onChange={(e) => setEmailToken(e.target.value.replace(/\D/g, '').trim())}
                    placeholder="Enter 6-digit code"
                  />
                  <Button type="submit" variant="primary" disabled={loading || !emailToken} className="w-full justify-center rounded-2xl py-3.5">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4" />Verify email</>}
                  </Button>
                </form>
                <button onClick={handleResendEmailVerification} disabled={sending} className="w-full text-xs text-slate-500 hover:text-sky-300">
                  {sending ? 'Sending…' : 'Resend verification email'}
                </button>
                <button onClick={() => { setNeedsEmailVerify(false); setError(''); }} className="w-full text-xs text-slate-500 hover:text-slate-300">
                  ← Back to login
                </button>
              </div>
            )}

            {/* Phone Verification — N7 fixed: fetches full profile on success */}
            {needsPhoneVerify && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/20">
                    <Phone className="h-7 w-7 text-emerald-200" />
                  </div>
                  <h3 className="text-h3 text-slate-50">Verify phone number</h3>
                  <p className="mt-1 text-xs text-slate-400">We&apos;ve sent a 6‑digit code to your phone.</p>
                </div>
                <form onSubmit={handleVerifyPhone} className="space-y-4">
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                    value={phoneOTP} onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full rounded-2xl border border-emerald-700 bg-slate-900/80 py-4 text-center text-3xl font-black tracking-[0.5em] text-emerald-100 shadow-sm outline-none ring-1 ring-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/70"
                  />
                  <Button type="submit" variant="primary" disabled={loading || phoneOTP.length < 6} className="w-full justify-center rounded-2xl bg-emerald-600 py-3.5 hover:bg-emerald-500">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4" />Verify &amp; sign in</>}
                  </Button>
                </form>
                <button onClick={handleResendOTP} disabled={sending} className="w-full text-xs text-slate-500 hover:text-sky-300">
                  {sending ? 'Sending…' : 'Resend OTP'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>}>
      <LoginContent />
    </Suspense>
  );
}