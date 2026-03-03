'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck, Scale, UserPlus, LogIn, Phone, CheckCircle } from 'lucide-react';

const ROLE_CONFIG = {
  admin: {
    label: 'System Administrator',
    icon: ShieldCheck,
    color: 'from-red-600 to-red-700',
    badge: 'ADMIN PORTAL',
    description: 'Full platform management & oversight',
  },
  law_reviewer: {
    label: 'Law Reviewer',
    icon: Scale,
    color: 'from-purple-600 to-purple-700',
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

  // step: 'main' | 'email' | 'phone' | '2fa'
  const [step, setStep] = useState('main');

  // Email verify
  const [emailCode, setEmailCode] = useState('');

  // Phone verify
  const [phoneOTP, setPhoneOTP] = useState('');

  // 2FA
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

  // After login fully succeeds, store and redirect
  const proceedAfterLogin = (loginData) => {
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('userInfo', JSON.stringify(loginData));
    router.push('/dashboard');
  };

  // ─── REGISTER / LOGIN ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearAlerts();
    try {
      if (mode === 'register') {
        const payload = { ...formData, role: selectedRole };
        const { data } = await api.post('/auth/register', payload);
        // Store token so verify-email and send-otp calls work
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data));
        // Backend sends email OTP on register automatically
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
        // Code was already sent when they registered — just show the step
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

  // ─── VERIFY EMAIL → then auto-check phone ────────────────────────────────────
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearAlerts();
    try {
      // 1. Verify the email code
      await api.post('/auth/verify-email', { email: formData.email, code: emailCode });

      // 2. Re-login — handle PHONE_NOT_VERIFIED inline, don't let it bubble up
      try {
        const { data } = await api.post('/auth/login', { email: formData.email, password: formData.password });
        // Both verified — go to dashboard
        proceedAfterLogin(data);
      } catch (loginErr) {
        const msg = loginErr.response?.data?.message;
        if (msg === 'PHONE_NOT_VERIFIED') {
          // Store the token the backend returns with the 403
          const d = loginErr.response?.data;
          localStorage.setItem('token', d.token);
          localStorage.setItem('userInfo', JSON.stringify({ email: formData.email }));
          // Auto-send the phone OTP
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

  // ─── VERIFY PHONE → final re-login → dashboard ───────────────────────────────
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearAlerts();
    try {
      await api.post('/auth/verify-otp', { code: phoneOTP });
      // Final clean login to get full user data
      const { data } = await api.post('/auth/login', { email: formData.email, password: formData.password });
      proceedAfterLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── 2FA ──────────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Restricted Access</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">RentifyPro</h1>
          <p className="text-white/40 text-sm mt-1">Internal Staff Portal</p>
        </div>

        {/* Role selector — only on main step */}
        {step === 'main' && (
          <div className="flex gap-2 mb-6">
            {Object.entries(ROLE_CONFIG).map(([role, config]) => {
              const RIcon = config.icon;
              return (
                <button key={role} onClick={() => handleRoleSelect(role)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-sm font-bold transition-all ${
                    selectedRole === role
                      ? 'bg-white text-gray-900 border-white'
                      : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}>
                  <RIcon className="w-4 h-4" />
                  {config.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8">

          {/* Alerts */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />{success}
            </div>
          )}

          {/* ── MAIN FORM ──────────────────────────────────────────────────────── */}
          {step === 'main' && (
            <>
              <div className={`bg-gradient-to-r ${cfg.color} rounded-2xl px-4 py-3 flex items-center gap-3 mb-6`}>
                <div className="bg-white/20 p-2 rounded-xl">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{cfg.badge}</p>
                  <p className="text-white font-bold text-sm">{cfg.description}</p>
                </div>
              </div>

              <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
                {['login', 'register'].map(m => (
                  <button key={m} onClick={() => { setMode(m); clearAlerts(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                      mode === m ? 'bg-white text-gray-900' : 'text-white/50 hover:text-white'
                    }`}>
                    {m === 'login' ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input type="text" required value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-white/30" />
                    <input type="email" required value={formData.email}
                      onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@company.com"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5">Phone Number</label>
                    <input type="tel" required value={formData.phoneNumber}
                      onChange={e => setFormData(f => ({ ...f, phoneNumber: e.target.value }))}
                      placeholder="+923001234567"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-white/30" />
                    <input type={showPwd ? 'text' : 'password'} required value={formData.password}
                      onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-white/30" />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-3.5 text-white/30 hover:text-white/60">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${cfg.color} text-white rounded-xl py-3.5 font-black text-sm hover:opacity-90 disabled:opacity-50 transition mt-2`}>
                  {loading
                    ? <Loader2 className="animate-spin w-4 h-4" />
                    : mode === 'login'
                      ? <><LogIn className="w-4 h-4" /> Sign In</>
                      : <><UserPlus className="w-4 h-4" /> Create Account</>
                  }
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
                <h3 className="font-black text-white text-xl mb-1">Verify Your Email</h3>
                <p className="text-white/50 text-sm">
                  Enter the 6-digit code sent to{' '}
                  <span className="text-white/80 font-semibold">{formData.email}</span>
                </p>
              </div>
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                  value={emailCode} onChange={e => setEmailCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-3xl font-black tracking-[0.5em] bg-white/5 border border-white/20 text-white rounded-2xl py-4 focus:outline-none focus:border-white/50" />
                <button type="submit" disabled={loading || emailCode.length < 6}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3.5 font-black text-sm hover:bg-blue-700 disabled:opacity-50 transition">
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><CheckCircle className="w-4 h-4" /> Verify Email</>}
                </button>
              </form>
              <button onClick={handleResendEmailCode} disabled={sending}
                className="w-full text-sm text-white/40 hover:text-white/70 transition">
                {sending ? 'Sending...' : "Didn't receive it? Resend code"}
              </button>
              <button onClick={() => { setStep('main'); setEmailCode(''); clearAlerts(); }}
                className="w-full text-white/30 text-sm hover:text-white/60">← Back</button>
            </div>
          )}

          {/* ── PHONE VERIFICATION ──────────────────────────────────────────────── */}
          {step === 'phone' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="bg-green-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="font-black text-white text-xl mb-1">Verify Phone Number</h3>
                <p className="text-white/50 text-sm">Enter the 6-digit OTP sent to your phone.</p>
              </div>
              <form onSubmit={handleVerifyPhone} className="space-y-4">
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                  value={phoneOTP} onChange={e => setPhoneOTP(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-3xl font-black tracking-[0.5em] bg-white/5 border border-white/20 text-white rounded-2xl py-4 focus:outline-none focus:border-white/50" />
                <button type="submit" disabled={loading || phoneOTP.length < 6}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-3.5 font-black text-sm hover:bg-green-700 disabled:opacity-50 transition">
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><CheckCircle className="w-4 h-4" /> Verify & Sign In</>}
                </button>
              </form>
              <button onClick={handleResendOTP} disabled={sending}
                className="w-full text-sm text-white/40 hover:text-white/70 transition">
                {sending ? 'Sending...' : "Didn't receive it? Resend OTP"}
              </button>
            </div>
          )}

          {/* ── 2FA ─────────────────────────────────────────────────────────────── */}
          {step === '2fa' && (
            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div className="text-center">
                <div className="bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="font-black text-white text-xl mb-1">Two-Factor Auth</h3>
                <p className="text-white/50 text-sm">Enter the 6-digit code from your authenticator app.</p>
              </div>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                value={totp} onChange={e => setTotp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center text-3xl font-black tracking-[0.5em] bg-white/5 border border-white/20 text-white rounded-2xl py-4 focus:outline-none focus:border-white/50" />
              <button type="submit" disabled={totpLoading || totp.length < 6}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-3.5 font-black text-sm hover:bg-indigo-700 disabled:opacity-50 transition">
                {totpLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Verify & Sign In'}
              </button>
              <button type="button" onClick={() => { setStep('main'); setTotp(''); clearAlerts(); }}
                className="w-full text-white/30 text-sm hover:text-white/60">← Back to login</button>
            </form>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          This portal is restricted to authorized staff only.
          <br />Regular users should use the{' '}
          <a href="/login" className="text-white/40 hover:text-white underline">standard login</a>.
        </p>
      </div>
    </div>
  );
}