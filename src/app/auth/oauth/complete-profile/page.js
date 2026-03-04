'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { User, Phone, Building2, Mail, Loader2, CheckCircle, Lock } from 'lucide-react';

function CompleteProfileContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const providerEmail  = searchParams.get('email')      || '';
  const providerName   = searchParams.get('name')       || '';
  const provider       = searchParams.get('provider')   || 'google';
  const needsEmail     = searchParams.get('needsEmail') === 'true';
  const facebookId     = searchParams.get('facebookId') || '';
  const urlToken       = searchParams.get('token')      || '';

  // Email is locked when the provider supplied it; editable only for FB no-email case
  const emailLocked = !!providerEmail && !needsEmail;

  const [step, setStep]     = useState('profile');
  const [formData, setFormData] = useState({
    name:        providerName,
    email:       providerEmail,
    role:        'tenant',
    phoneNumber: '',
  });
  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Save token from URL immediately on mount — this ensures API calls work
  // even if localStorage was cleared between the success page redirect and here
  useEffect(() => {
    if (urlToken) {
      localStorage.setItem('token', urlToken);
    }
    // Pre-fill from URL params (in case localStorage userInfo isn't set yet)
    setFormData(f => ({
      ...f,
      name:  f.name  || providerName,
      email: f.email || providerEmail,
    }));
  }, [urlToken, providerName, providerEmail]);

  // ── Step 1: save profile ──────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.phoneNumber || formData.phoneNumber.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      if (needsEmail && facebookId) {
        // Facebook no-email: create account first, get token back
        const { data } = await api.post('/auth/facebook/complete', {
          facebookId,
          email:       formData.email,
          name:        formData.name,
          role:        formData.role,
          phoneNumber: formData.phoneNumber,
        });

        // Save the token returned by the endpoint so all subsequent calls work
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userInfo', JSON.stringify({
            _id:   data._id,
            name:  data.name,
            email: data.email,
            role:  data.role,
            isPhoneVerified: false,
            isVerified:      true,
          }));
        }

        // If the email matched an existing account, they're already set up —
        // just send the phone OTP to finish the flow
      } else {
        // Standard case: account exists, just update profile fields
        await api.put('/users/profile', {
          name:        formData.name,
          role:        formData.role,
          phoneNumber: formData.phoneNumber,
        });
      }

      // Refresh localStorage with latest data from server
      const { data: freshUser } = await api.get('/users/me');
      localStorage.setItem('userInfo', JSON.stringify({
        _id:             freshUser._id,
        name:            freshUser.name,
        role:            freshUser.role,
        email:           freshUser.email,
        phoneNumber:     freshUser.phoneNumber,
        isPhoneVerified: freshUser.isPhoneVerified,
        isVerified:      freshUser.isVerified,
      }));

      await api.post('/auth/send-otp');
      setStep('verify-phone');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify phone OTP ──────────────────────────────────────────────
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { code: otp });
      const { data: freshUser } = await api.get('/users/me');
      localStorage.setItem('userInfo', JSON.stringify({
        _id:             freshUser._id,
        name:            freshUser.name,
        role:            freshUser.role,
        email:           freshUser.email,
        phoneNumber:     freshUser.phoneNumber,
        isPhoneVerified: true,
        isVerified:      freshUser.isVerified,
      }));
      router.replace('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setSending(true);
    try {
      await api.post('/auth/send-otp');
      setSuccess('OTP resent!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setSending(false);
    }
  };

  const providerLabel = provider === 'facebook' ? 'Facebook' : 'Google';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {step === 'profile'
              ? <User className="w-8 h-8 text-blue-600" />
              : <Phone className="w-8 h-8 text-green-600" />}
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
            {step === 'profile' ? 'Complete Your Profile' : 'Verify Phone Number'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {step === 'profile'
              ? `Almost there! A few more details to finish your ${providerLabel} account.`
              : `We sent a 6-digit code to ${formData.phoneNumber}`}
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {['profile', 'verify-phone'].map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${
              step === s ? 'bg-blue-600'
              : i < ['profile', 'verify-phone'].indexOf(step) ? 'bg-green-500'
              : 'bg-gray-200'
            }`} />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}

        {step === 'profile' ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                {emailLocked
                  ? <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                  : <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />}
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => !emailLocked && setFormData(f => ({ ...f, email: e.target.value }))}
                  readOnly={emailLocked}
                  placeholder="you@example.com"
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none transition ${
                    emailLocked
                      ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>
              {emailLocked && (
                <p className="text-xs text-gray-400 mt-1">
                  Confirmed by {providerLabel} — cannot be changed here.
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Account Type</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  value={formData.role}
                  onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="tenant">I am a Tenant</option>
                  <option value="landlord">I am a Landlord</option>
                  <option value="property_manager">I am a Property Manager</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={e => setFormData(f => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="+923001234567"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">A verification code will be sent to this number</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3.5 font-black hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Continue →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyPhone} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center text-3xl font-black tracking-[0.5em] border-2 border-gray-200 rounded-2xl py-4 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-3.5 font-black hover:bg-green-700 disabled:bg-green-400 transition"
            >
              {loading
                ? <Loader2 className="animate-spin w-4 h-4" />
                : <><CheckCircle className="w-4 h-4" /> Verify &amp; Enter Dashboard</>}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={sending}
                className="text-blue-600 text-sm hover:underline font-medium"
              >
                {sending ? 'Sending...' : "Didn't receive it? Resend OTP"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
}