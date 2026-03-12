'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import api, { setAccessToken } from '@/utils/api';
import { useUser } from '@/context/UserContext';
import {
  User, Mail, Lock, Phone, Building2, Loader2, CheckCircle,
  ShieldCheck, Eye, EyeOff, ArrowLeft,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

const getRecaptchaToken = (action) =>
  new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.grecaptcha) return resolve(null);
    window.grecaptcha.ready(async () => {
      try {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!siteKey) return resolve(null);
        const token = await window.grecaptcha.execute(siteKey, { action });
        resolve(token);
      } catch { resolve(null); }
    });
  });

const STEPS = ['register', 'verify-email', 'verify-phone'];

const ROLE_OPTIONS = [
  { value: 'tenant', label: 'I am a Tenant', emoji: '🏠' },
  { value: 'landlord', label: 'I am a Landlord', emoji: '🏢' },
  { value: 'property_manager', label: 'I am a Property Manager', emoji: '🔑' },
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, user } = useUser();

  // SEC-05: redirect already-logged-in users away from register page
  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const [step, setStep] = useState('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [facebookNotice, setFacebookNotice] = useState(false);

  useEffect(() => {
    if (searchParams.get('notice') === 'facebook_no_email') setFacebookNotice(true);
  }, [searchParams]);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', phoneNumber: '', role: 'tenant' });
  const [emailToken, setEmailToken] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const recaptchaToken = await getRecaptchaToken('register');
      await api.post('/auth/register', { ...formData, recaptchaToken });
      setStep('verify-email');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/verify-email', { email: formData.email, code: emailToken });
      try { await api.post('/auth/send-otp', { email: formData.email }); }
      catch (otpErr) { setError(otpErr.response?.data?.message || 'Could not send OTP — tap Resend to try again.'); }
      setStep('verify-phone');
    } catch (err) { setError(err.response?.data?.message || 'Invalid code'); }
    finally { setLoading(false); }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await api.post('/auth/resend-verification', { email: formData.email });
      setSuccess('Email resent!'); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { email: formData.email, code: phoneOTP });
      setAccessToken(data.token);
      setUser({
        _id: data._id, name: data.name, role: data.role, email: data.email,
        isVerified: true, isPhoneVerified: true, twoFactorEnabled: data.twoFactorEnabled || false,
      });
      router.push('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email: formData.email });
      setSuccess('OTP resent!'); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 lg:gap-16">

          {/* Left: brand story */}
          <div className="hidden md:block">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-neutral-500 hover:text-neutral-700 transition-colors mb-8">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0992C2]/30 bg-white/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-neutral-500 shadow-sm shadow-[#0992C2]/20 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0992C2]" />
              Your rental workspace awaits
            </div>
            <h1 className="mt-6 text-hero text-left text-neutral-900">
              Join thousands already
              <br />
              <span className="bg-gradient-to-r from-[#0B2D72] via-[#0992C2] to-[#0AC4E0] bg-clip-text text-transparent">
                renting smarter.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-neutral-600">
              Create your free account in under two minutes. Agreements, payments, maintenance — all in one calm, premium workspace.
            </p>
            <div className="mt-8 space-y-3 max-w-md">
              {[
                { emoji: '✍️', title: 'Digital agreements', desc: 'Sign legally binding leases from any device.' },
                { emoji: '💳', title: 'Rent tracking', desc: 'Automated schedules, receipts and reminders.' },
                { emoji: '🔧', title: 'Maintenance requests', desc: 'Log, track and resolve issues in one thread.' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="rf-card-soft flex items-start gap-3 p-4">
                  <span className="text-xl leading-none mt-0.5">{emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{title}</p>
                    <p className="text-[0.78rem] text-neutral-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: register card */}
          <div className="rf-glass-dark rf-fade-in-up w-full max-w-md md:justify-self-end px-8 py-9">

            {/* Mobile back link */}
            <Link href="/" className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-slate-500 hover:text-slate-300 transition-colors mb-6 md:hidden">
              <ArrowLeft className="h-3 w-3" /> Home
            </Link>

            {/* Step progress */}
            <div className="flex gap-1.5 mb-7">
              {STEPS.map((s, i) => (
                <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < stepIndex ? 'bg-emerald-400' : i === stepIndex ? 'bg-sky-400' : 'bg-slate-700'
                  }`} />
              ))}
            </div>

            <div className="mb-7 text-center md:text-left">
              <p className="text-micro text-slate-400">
                {step === 'register' ? 'Step 1 of 3' : step === 'verify-email' ? 'Step 2 of 3' : 'Step 3 of 3'}
              </p>
              <h2 className="text-h2 mt-1 bg-gradient-to-r from-slate-50 via-sky-100 to-slate-200 bg-clip-text text-transparent">
                {step === 'register' ? 'Create account' : step === 'verify-email' ? 'Verify your email' : 'Verify your phone'}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                {step === 'register' && 'Join RentifyPro — free forever on the starter plan.'}
                {step === 'verify-email' && `Enter the 6‑digit code sent to ${formData.email}`}
                {step === 'verify-phone' && `Enter the 6‑digit code sent to ${formData.phoneNumber}`}
              </p>
            </div>

            {facebookNotice && (
              <div className="mb-5 rounded-xl border border-amber-500/40 bg-amber-950/60 px-4 py-3 text-xs text-amber-100">
                <strong>Facebook didn't share your email.</strong> Please sign up manually below.
              </div>
            )}
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/50 bg-red-950/60 px-4 py-3 text-xs text-red-100">{error}</div>
            )}
            {success && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/60 bg-emerald-900/60 px-4 py-3 text-xs text-emerald-100">
                <CheckCircle className="h-4 w-4 shrink-0" />{success}
              </div>
            )}

            {/* ── Step 1: Register ── */}
            {step === 'register' && (
              <>
                <form onSubmit={handleRegister} className="space-y-4" noValidate>
                  <TextField label="Full Name" type="text" name="name" required placeholder="Jane Smith" leadingIcon={User} onChange={handleChange} value={formData.name} />
                  <TextField label="Email" type="email" name="email" required placeholder="you@example.com" leadingIcon={Mail} onChange={handleChange} value={formData.email} />
                  <TextField label="Phone Number" type="tel" name="phoneNumber" required placeholder="+923xxxxxxxxx" leadingIcon={Phone} onChange={handleChange} value={formData.phoneNumber} />
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Password</label>
                    <div className="relative">
                      <TextField
                        type={showPwd ? 'text' : 'password'}
                        name="password"
                        required
                        placeholder="Min 8 characters"
                        leadingIcon={Lock}
                        onChange={handleChange}
                        value={formData.password}
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">I am a…</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLE_OPTIONS.map(({ value, label, emoji }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFormData(f => ({ ...f, role: value }))}
                          className={`rounded-xl border py-2.5 px-2 text-center text-[0.7rem] font-semibold transition-all ${formData.role === value
                            ? 'border-sky-400/70 bg-sky-900/40 text-sky-200 ring-1 ring-sky-400/40'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                            }`}
                        >
                          <div className="text-lg mb-0.5">{emoji}</div>
                          <div className="leading-tight">{value === 'property_manager' ? 'PM' : label.replace('I am a ', '')}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" variant="primary" disabled={loading} className="mt-2 w-full justify-center rounded-2xl py-3.5">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</> : 'Create account →'}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-800" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">Or</span>
                  <div className="h-px flex-1 bg-slate-800" />
                </div>

                <a href="/api/auth/google"
                  className="mb-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-600/70 bg-slate-900/70 py-3 text-sm text-slate-50 hover:bg-slate-800/90 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Continue with Google
                </a>
                <a href="/api/auth/facebook"
                  className="mb-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-600/70 bg-slate-900/70 py-3 text-sm text-slate-50 hover:bg-slate-800/90 transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Continue with Facebook
                </a>

                <p className="text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-sky-300 hover:text-sky-200">Sign in</Link>
                </p>
              </>
            )}

            {/* ── Step 2: Verify Email ── */}
            {step === 'verify-email' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/50 px-4 py-3 text-xs text-indigo-200 text-center">
                  We sent a <strong>6‑digit code</strong> to <strong>{formData.email}</strong>
                </div>
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                    value={emailToken} onChange={e => setEmailToken(e.target.value.replace(/\D/g, '').trim())}
                    placeholder="000000"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 py-4 text-center text-3xl font-black tracking-[0.5em] text-slate-50 outline-none ring-1 ring-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/70"
                  />
                  <Button type="submit" variant="primary" disabled={loading || emailToken.length < 6} className="w-full justify-center rounded-2xl py-3.5">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4" /> Verify email</>}
                  </Button>
                </form>
                <button onClick={handleResendEmail} disabled={loading} className="w-full text-xs text-slate-500 hover:text-sky-300 transition-colors">
                  Resend code
                </button>
              </div>
            )}

            {/* ── Step 3: Verify Phone ── */}
            {step === 'verify-phone' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/50 px-4 py-3 text-xs text-emerald-200 text-center">
                  Code sent to <strong>{formData.phoneNumber}</strong>
                </div>
                <form onSubmit={handleVerifyPhone} className="space-y-4">
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                    value={phoneOTP} onChange={e => setPhoneOTP(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full rounded-2xl border border-emerald-700 bg-slate-900/80 py-4 text-center text-3xl font-black tracking-[0.5em] text-emerald-100 outline-none ring-1 ring-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/70"
                  />
                  <Button type="submit" variant="primary" disabled={loading || phoneOTP.length < 6}
                    className="w-full justify-center rounded-2xl bg-emerald-600 py-3.5 hover:bg-emerald-500">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="h-4 w-4" /> Verify &amp; enter dashboard</>}
                  </Button>
                </form>
                <button onClick={handleResendOTP} disabled={loading} className="w-full text-xs text-slate-500 hover:text-sky-300 transition-colors">
                  Resend OTP
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}