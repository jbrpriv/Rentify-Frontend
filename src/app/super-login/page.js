'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck, Scale, UserPlus, LogIn, Phone, CheckCircle } from 'lucide-react';

const ROLE_CONFIG = {
  admin: {
    label: 'System Administrator',
    icon: ShieldCheck,
    color: 'from-[#0B2D72] via-[#0992C2] to-[#0AC4E0]',
    badge: 'ADMIN PORTAL',
    description: 'Full platform management & oversight',
  },
  law_reviewer: {
    label: 'Law Reviewer',
    icon: Scale,
    color: 'from-[#0B2D72] via-[#0992C2] to-[#0AC4E0]',
    badge: 'LEGAL PORTAL',
    description: 'Clause review, template management & legal oversight',
  },
};

export default function SuperLoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [sending, setSending] = useState(false);

  const [step, setStep] = useState('main');
  const [emailCode, setEmailCode] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [userId2FA, setUserId2FA] = useState('');
  const [totp, setTotp] = useState('');
  const [totpLoading, setTotpLoading] = useState(false);

  const cfg = ROLE_CONFIG[selectedRole];
  const Icon = cfg.icon;

  const clearAlerts = () => { setError(''); setSuccess(''); };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    clearAlerts();
  };

  const proceedAfterLogin = (loginData) => {
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('userInfo', JSON.stringify(loginData));
    router.push('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearAlerts();
    try {
      if (mode === 'register') {
        const payload = { ...formData, role: selectedRole };
        const { data } = await api.post('/auth/register', payload);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data));
        setSuccess(`A 6-digit verification code was sent to ${formData.email}`);
        setStep('email');
      } else {
        const { data } = await api.post('/auth/login', { email: formData.email, password: formData.password });
        if (!['admin', 'law_reviewer'].includes(data.role)) {
          setError('Access denied. This portal is for admins and law reviewers only.');
          return;
        }
        if (data.twoFactorEnabled) {
          setUserId2FA(data._id);
          setStep('2fa');
          return;
        }
        proceedAfterLogin(data);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'EMAIL_NOT_VERIFIED') {
        setSuccess(`Check your email ${formData.email} for the verification code.`);
        setStep('email');
      } else if (msg === 'PHONE_NOT_VERIFIED') {
        const d = err.response?.data;
        localStorage.setItem('token', d.token);
        localStorage.setItem('userInfo', JSON.stringify({ email: formData.email }));
        await api.post('/auth/send-otp');
        setSuccess('A verification code was sent to your phone number.');
        setStep('phone');
      } else {
        setError(msg || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearAlerts();
    try {
      await api.post('/auth/verify-email', { email: formData.email, code: emailCode });
      try {
        const { data } = await api.post('/auth/login', { email: formData.email, password: formData.password });
        proceedAfterLogin(data);
      } catch (loginErr) {
        const msg = loginErr.response?.data?.message;
        if (msg === 'PHONE_NOT_VERIFIED') {
          const d = loginErr.response?.data;
          localStorage.setItem('token', d.token);
          localStorage.setItem('userInfo', JSON.stringify({ email: formData.email }));
          await api.post('/auth/send-otp');
          setEmailCode('');
          setSuccess('Email verified! A code was sent to your phone number.');
          setStep('phone');
        } else {
          setError(msg || 'Login failed after email verification. Please try signing in.');
          setStep('main');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Try resending.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearAlerts();
    try {
      await api.post('/auth/verify-otp', { code: phoneOTP });
      const { data } = await api.post('/auth/login', { email: formData.email, password: formData.password });
      proceedAfterLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setTotpLoading(true);
    clearAlerts();
    try {
      const { data } = await api.post('/auth/2fa/validate', { userId: userId2FA, token: totp });
      proceedAfterLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid 2FA code');
    } finally {
      setTotpLoading(false);
    }
  };

  const handleResendEmailCode = async () => {
    setSending(true);
    clearAlerts();
    try {
      await api.post('/auth/resend-verification', { email: formData.email });
      setSuccess('Verification code resent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    } finally {
      setSending(false);
    }
  };

  const handleResendOTP = async () => {
    setSending(true);
    clearAlerts();
    try {
      await api.post('/auth/send-otp');
      setSuccess('OTP resent to your phone.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFC] flex items-stretch">
      {/* Left secure panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-gradient-to-br from-[#0B2D72] via-[#0992C2] to-[#0AC4E0] px-10 py-10 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-white/18 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-[-40px] h-56 w-56 rounded-full bg-[#0AC4E0]/40 blur-3xl" />

        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-200" />
            Zero-trust staff access
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight">
            RentifyPro
          </h1>
          <p className="mt-2 text-sm text-cyan-50/90">
            Internal control center for agreements, risk and oversight.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-50/80">
              Security snapshot
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-lg font-extrabold leading-none">99.9%</p>
                <p className="mt-1 text-[11px] text-cyan-50/80">
                  Uptime
                </p>
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none">256-bit</p>
                <p className="mt-1 text-[11px] text-cyan-50/80">
                  Encryption
                </p>
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none">24/7</p>
                <p className="mt-1 text-[11px] text-cyan-50/80">
                  Monitoring
                </p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-cyan-50/80">
            Access is logged and audited. Use only if you are an authorized admin or legal reviewer.
          </p>
        </div>
      </div>

      {/* Right auth card */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0B2D72] shadow-sm shadow-[#0992C2]/40">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0AC4E0]" />
              Restricted Staff Access
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-[#0B2D72]">
              Staff sign-in
            </h2>
            <p className="mt-1 text-sm text-[#4B5563]">
              Admin and legal teams sign into the secure RentifyPro console here.
            </p>
          </div>

          {/* Role selector — only on main step */}
          {step === 'main' && (
            <div className="mb-5 flex gap-2">
              {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                const RIcon = config.icon;
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedRole === role
                        ? 'border-[#0992C2] bg-white text-[#0B2D72] shadow-sm shadow-[#0992C2]/25'
                        : 'border-transparent bg-white/70 text-[#64748B] hover:border-[#99E0F2] hover:text-[#0B2D72]'
                    }`}
                  >
                    <RIcon className="h-4 w-4" />
                    {config.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          )}

          <div className="rounded-3xl bg-white/90 p-7 shadow-[0_22px_70px_rgba(9,146,194,0.45)] ring-1 ring-[#0992C2]/18">

            {/* Alerts */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle className="h-4 w-4 shrink-0" />{success}
              </div>
            )}

            {/* ── MAIN FORM ──────────────────────────────────────────────────────── */}
            {step === 'main' && (
              <>
                <div className={`mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r ${cfg.color} px-4 py-3 text-white`}>
                  <div className="rounded-xl bg-white/20 p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                      {cfg.badge}
                    </p>
                    <p className="text-sm font-bold">{cfg.description}</p>
                  </div>
                </div>

                <div className="mb-6 flex gap-1 rounded-xl bg-[#F0F8FA] p-1">
                  {['login', 'register'].map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); clearAlerts(); }}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all ${
                        mode === m
                          ? 'bg-white text-[#0B2D72] shadow-sm shadow-[#0992C2]/25'
                          : 'text-[#6B7280] hover:text-[#111827]'
                      }`}
                    >
                      {m === 'login' ? (
                        <LogIn className="h-3.5 w-3.5" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      {m === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                        placeholder=" "
                        className="peer w-full rounded-xl border border-[#D1E7F0] bg-white/70 px-3.5 pt-5 pb-2.5 text-sm text-[#111827] placeholder-transparent outline-none transition-colors focus:border-[#0992C2]"
                      />
                      <label className="pointer-events-none absolute left-3.5 top-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#9CA3AF] peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#0992C2]">
                        Full name
                      </label>
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#9CA3AF]" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                      placeholder=" "
                      className="peer w-full rounded-xl border border-[#D1E7F0] bg-white/70 pl-9 pr-3.5 pt-5 pb-2.5 text-sm text-[#111827] placeholder-transparent outline-none transition-colors focus:border-[#0992C2]"
                    />
                    <label className="pointer-events-none absolute left-9 top-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#9CA3AF] peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#0992C2]">
                      Email address
                    </label>
                  </div>

                  {mode === 'register' && (
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={e => setFormData(f => ({ ...f, phoneNumber: e.target.value }))}
                        placeholder=" "
                        className="peer w-full rounded-xl border border-[#D1E7F0] bg-white/70 px-3.5 pt-5 pb-2.5 text-sm text-[#111827] placeholder-transparent outline-none transition-colors focus:border-[#0992C2]"
                      />
                      <label className="pointer-events-none absolute left-3.5 top-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#9CA3AF] peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#0992C2]">
                        Phone number
                      </label>
                    </div>
                  )}

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#9CA3AF]" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                      placeholder=" "
                      className="peer w-full rounded-xl border border-[#D1E7F0] bg-white/70 pl-9 pr-9 pt-5 pb-2.5 text-sm text-[#111827] placeholder-transparent outline-none transition-colors focus:border-[#0992C2]"
                    />
                    <label className="pointer-events-none absolute left-9 top-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#9CA3AF] peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#0992C2]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3.5 top-3.5 text-[#9CA3AF] hover:text-[#111827]"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`mt-2 flex w-full transform items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${cfg.color} py-3.5 text-sm font-black text-white shadow-md shadow-[#0992C2]/40 transition-transform transition-colors hover:scale-[1.02] hover:shadow-lg hover:shadow-[#0B2D72]/60 active:scale-[0.97] disabled:opacity-60`}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : mode === 'login' ? (
                      <>
                        <LogIn className="h-4 w-4" /> Sign in
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" /> Create account
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ── EMAIL VERIFICATION ──────────────────────────────────────────────── */}
            {step === 'email' && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="font-black text-[#1F2933] text-xl mb-1">Verify Your Email</h3>
                  <p className="text-[#4B5563] text-sm">
                    Enter the 6-digit code sent to{' '}
                    <span className="text-[#1F2933] font-semibold">{formData.email}</span>
                  </p>
                </div>
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                    value={emailCode} onChange={e => setEmailCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-black tracking-[0.5em] bg-[#F8FBFC] border border-[#D1E7F0] text-[#111827] rounded-2xl py-4 focus:outline-none focus:border-[#0992C2]" />
                  <button type="submit" disabled={loading || emailCode.length < 6}
                    className="w-full flex items-center justify-center gap-2 bg-[#0992C2] text-white rounded-xl py-3.5 font-black text-sm hover:bg-[#0B2D72] disabled:opacity-50 transition">
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><CheckCircle className="w-4 h-4" /> Verify Email</>}
                  </button>
                </form>
                <button onClick={handleResendEmailCode} disabled={sending}
                  className="w-full text-sm text-[#4B5563] hover:text-[#111827] transition">
                  {sending ? 'Sending...' : "Didn't receive it? Resend code"}
                </button>
                <button onClick={() => { setStep('main'); setEmailCode(''); clearAlerts(); }}
                  className="w-full text-[#9CA3AF] text-sm hover:text-[#4B5563]">← Back</button>
              </div>
            )}

            {/* ── PHONE VERIFICATION ──────────────────────────────────────────────── */}
            {step === 'phone' && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="bg-green-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="font-black text-[#1F2933] text-xl mb-1">Verify Phone Number</h3>
                  <p className="text-[#4B5563] text-sm">Enter the 6-digit OTP sent to your phone.</p>
                </div>
                <form onSubmit={handleVerifyPhone} className="space-y-4">
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                    value={phoneOTP} onChange={e => setPhoneOTP(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-black tracking-[0.5em] bg-[#F8FBFC] border border-[#D1E7F0] text-[#111827] rounded-2xl py-4 focus:outline-none focus:border-[#0992C2]" />
                  <button type="submit" disabled={loading || phoneOTP.length < 6}
                    className="w-full flex items-center justify-center gap-2 bg-[#0992C2] text-white rounded-xl py-3.5 font-black text-sm hover:bg-[#0B2D72] disabled:opacity-50 transition">
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><CheckCircle className="w-4 h-4" /> Verify & Sign In</>}
                  </button>
                </form>
                <button onClick={handleResendOTP} disabled={sending}
                  className="w-full text-sm text-[#4B5563] hover:text-[#111827] transition">
                  {sending ? 'Sending...' : "Didn't receive it? Resend OTP"}
                </button>
              </div>
            )}

            {/* ── 2FA ─────────────────────────────────────────────────────────────── */}
            {step === '2fa' && (
              <form onSubmit={handle2FASubmit} className="space-y-6">
                <div className="text-center">
                  <div className="bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-7 h-7 text-indigo-500" />
                  </div>
                  <h3 className="font-black text-[#1F2933] text-xl mb-1">Two-Factor Auth</h3>
                  <p className="text-[#4B5563] text-sm">Enter the 6-digit code from your authenticator app.</p>
                </div>
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                  value={totp} onChange={e => setTotp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                    className="w-full text-center text-3xl font-black tracking-[0.5em] bg-[#F8FBFC] border border-[#D1E7F0] text-[#111827] rounded-2xl py-4 focus:outline-none focus:border-[#0992C2]" />
                <button type="submit" disabled={totpLoading || totp.length < 6}
                    className="w-full flex items-center justify-center gap-2 bg-[#0992C2] text-white rounded-xl py-3.5 font-black text-sm hover:bg-[#0B2D72] disabled:opacity-50 transition">
                  {totpLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Verify & Sign In'}
                </button>
                <button type="button" onClick={() => { setStep('main'); setTotp(''); clearAlerts(); }}
                  className="w-full text-[#9CA3AF] text-sm hover:text-[#4B5563]">← Back to login</button>
              </form>
            )}

          </div>

          <p className="mt-6 text-center text-xs text-[#6B7280]">
            This portal is restricted to authorized staff only.
            <br />Regular users should use the{' '}
            <a href="/login" className="font-semibold text-[#234224] underline underline-offset-2">standard login</a>.
          </p>

        </div>
      </div>
    </div>
  );
}