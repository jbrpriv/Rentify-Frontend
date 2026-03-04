'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Shield, Save, Loader2, Bell, MessageSquare,
  ShieldCheck, ShieldOff, QrCode, CheckCircle, AlertTriangle,
  Camera, Upload, X, Calendar, Lock, Award,
} from 'lucide-react';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';

/* ─── Config ─────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User    },
  { id: 'security',      label: 'Security',      icon: Lock    },
  { id: 'notifications', label: 'Notifications', icon: Bell    },
];

const ROLE_CONFIG = {
  admin:            { label: 'Administrator', color: '#DC2626', bg: 'rgba(220,38,38,0.12)', icon: '⚡' },
  landlord:         { label: 'Landlord',      color: '#ffffff', bg: 'rgba(255,255,255,0.2)', icon: '🏠' },
  property_manager: { label: 'Prop. Manager', color: '#ffffff', bg: 'rgba(255,255,255,0.2)', icon: '🔑' },
  tenant:           { label: 'Tenant',        color: '#ffffff', bg: 'rgba(255,255,255,0.2)', icon: '🏡' },
  law_reviewer:     { label: 'Law Reviewer',  color: '#ffffff', bg: 'rgba(255,255,255,0.2)', icon: '⚖️' },
};

/* ─── Small helpers ───────────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, valueColor = 'text-gray-700', mono = false }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
        </div>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${valueColor} ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}

function ToggleSwitch({ checked, onToggle, color = '#0992C2' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={{ background: checked ? color : '#E5E7EB' }}
      aria-checked={checked}
      role="switch"
    >
      <div
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
        style={{ transform: checked ? 'translateX(28px)' : 'translateX(4px)' }}
      />
    </button>
  );
}

/* ─── Tabs ─────────────────────────────────────────────────────────────────── */
function ProfileTab({ user, form, setForm, saving, onSubmit, photoFile, photoPreview, photoUploading, onPhotoSelect, onPhotoUpload, onPhotoClear, fileInputRef }) {
  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.tenant;
  const displayRoleLabel = user.role?.replace(/_/g, ' ');
  return (
    <div className="space-y-5">
      {/* Personal Information */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7">
        <h3 className="text-base font-extrabold text-gray-900 mb-1">Personal Information</h3>
        <p className="text-xs text-gray-400 mb-6">Update your name and contact details</p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-350" style={{color:'#9CA3AF'}} />
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0992C2]/20 focus:border-[#0992C2] transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'#9CA3AF'}} />
                <input
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="+923001234567"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0992C2]/20 focus:border-[#0992C2] transition-all placeholder:text-gray-300"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 ml-1">Changing phone requires re-verification</p>
            </div>
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  value={user.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed select-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Role</label>
              <div className="flex items-center gap-2.5 pl-3.5 pr-4 py-3 border border-gray-100 rounded-2xl bg-gray-50">
                <span className="text-base leading-none">{roleConfig.icon}</span>
                <span className="text-sm font-semibold text-gray-500 capitalize">{displayRoleLabel}</span>
                <span className="ml-auto text-xs text-gray-400">Read-only</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#0B2D72] to-[#0992C2] text-white rounded-2xl px-7 py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-blue-800/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0992C2] focus-visible:ring-offset-2"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Profile Photo Upload */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7">
        <h3 className="text-base font-extrabold text-gray-900 mb-1">Profile Photo</h3>
        <p className="text-xs text-gray-400 mb-5">Upload a photo to personalise your account</p>

        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Preview */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-gray-100 bg-gradient-to-br from-[#0992C2]/10 to-[#0B2D72]/10 flex items-center justify-center">
              {photoPreview || user.profilePhoto ? (
                <img
                  src={photoPreview || user.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-[#0992C2]">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Upload controls */}
          <div className="flex-1 space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:border-[#0992C2] hover:text-[#0992C2] hover:bg-[#E6F4F8]/50 transition-all w-full sm:w-auto"
            >
              <Camera className="w-4 h-4" />
              Choose Photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoSelect} />
            <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 5MB</p>

            <AnimatePresence>
              {photoFile && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-3 bg-[#E6F4F8] rounded-2xl px-4 py-2.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0992C2] flex-shrink-0" />
                  <span className="text-xs text-[#0B2D72] font-medium flex-1 truncate">{photoFile.name}</span>
                  <button
                    type="button"
                    onClick={onPhotoUpload}
                    disabled={photoUploading}
                    className="px-3 py-1 bg-[#0992C2] text-white rounded-xl text-xs font-bold hover:bg-[#0B2D72] disabled:opacity-60 transition-colors flex items-center gap-1"
                  >
                    {photoUploading && <Loader2 className="w-3 h-3 animate-spin" />}
                    {photoUploading ? 'Uploading…' : 'Upload'}
                  </button>
                  <button type="button" onClick={onPhotoClear} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityTab({ user, twoFAEnabled, show2FASetup, qrCode, totpInput, setTotpInput, twoFALoading, showDisable, disableOTP, setDisableOTP, disableVia, onSetup2FA, on2FAVerify, onSendDisableOTP, on2FADisable, onCancelSetup, onCancelDisable }) {
  return (
    <div className="space-y-5">
      {/* 2FA Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7">
        <h3 className="text-base font-extrabold text-gray-900 mb-1">Two-Factor Authentication</h3>
        <p className="text-xs text-gray-400 mb-5">Add a second verification step to protect your account</p>

        {/* Status */}
        <div className={`rounded-2xl p-5 border ${twoFAEnabled ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/60' : 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50/60'}`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${twoFAEnabled ? 'bg-green-100' : 'bg-amber-100'}`}>
                {twoFAEnabled
                  ? <ShieldCheck className="w-6 h-6 text-green-600" />
                  : <ShieldOff className="w-6 h-6 text-amber-600" />}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">
                  {twoFAEnabled ? '2FA Active' : '2FA Inactive'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {twoFAEnabled
                    ? 'Protected with authenticator app'
                    : 'Enable for enhanced account security'}
                </p>
              </div>
            </div>
            {!twoFAEnabled ? (
              <button
                onClick={onSetup2FA}
                disabled={twoFALoading}
                className="flex items-center gap-2 bg-gradient-to-r from-[#0B2D72] to-[#0992C2] text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all shadow-md shadow-blue-800/15 focus:outline-none"
              >
                {twoFALoading ? <Loader2 className="animate-spin w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                Enable 2FA
              </button>
            ) : (
              <button
                onClick={onSendDisableOTP}
                disabled={twoFALoading}
                className="flex items-center gap-2 bg-white text-red-600 border border-red-200 rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-red-50 disabled:opacity-60 transition-all focus:outline-none"
              >
                {twoFALoading ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                Disable 2FA
              </button>
            )}
          </div>
        </div>

        {/* QR Setup Panel */}
        <AnimatePresence>
          {show2FASetup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 border border-[#0992C2]/25 bg-blue-50/60 rounded-2xl p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E6F4F8] flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-4 h-4 text-[#0992C2]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Scan with your authenticator app</p>
                    <p className="text-xs text-gray-500 mt-0.5">Google Authenticator, Authy, or any TOTP-compatible app</p>
                  </div>
                </div>
                {qrCode && (
                  <div className="flex justify-center">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <img src={qrCode} alt="2FA QR Code" className="w-44 h-44 rounded-xl" />
                    </div>
                  </div>
                )}
                <form onSubmit={on2FAVerify} className="space-y-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Enter the 6-digit code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={totpInput}
                    onChange={e => setTotpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    className="w-full text-center text-3xl font-black tracking-[0.5em] border-2 border-[#0992C2]/25 rounded-2xl py-4 focus:outline-none focus:border-[#0992C2] bg-white transition-all placeholder:text-gray-200"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={twoFALoading || totpInput.length < 6}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#0B2D72] to-[#0992C2] text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {twoFALoading ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      Confirm & Enable
                    </button>
                    <button type="button" onClick={onCancelSetup} className="px-5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Disable OTP Panel */}
          {showDisable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 border border-red-200 bg-red-50/60 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="font-bold text-red-900 text-sm">Confirm via OTP sent to your {disableVia}</p>
                </div>
                <form onSubmit={on2FADisable} className="space-y-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={disableOTP}
                    onChange={e => setDisableOTP(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    className="w-full text-center text-3xl font-black tracking-[0.5em] border-2 border-red-200 rounded-2xl py-4 focus:outline-none focus:border-red-500 bg-white transition-all placeholder:text-gray-200"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={twoFALoading || disableOTP.length < 6}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-all"
                    >
                      {twoFALoading && <Loader2 className="animate-spin w-4 h-4" />}
                      Confirm Disable
                    </button>
                    <button type="button" onClick={onCancelDisable} className="px-5 text-sm text-gray-500 hover:text-gray-700 font-medium">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7">
        <h3 className="text-base font-extrabold text-gray-900 mb-5">Account Details</h3>
        <div className="divide-y divide-gray-50">
          <InfoRow icon={Mail}  label="Email"          value={user.email} />
          <InfoRow icon={Phone} label="Phone"          value={user.phoneNumber} />
          <InfoRow icon={Shield} label="Role"          value={user.role?.replace(/_/g, ' ')} />
          <InfoRow
            icon={CheckCircle}
            label="Email Verified"
            value={user.isEmailVerified ? 'Verified' : 'Not verified'}
            valueColor={user.isEmailVerified ? 'text-green-600' : 'text-amber-500'}
          />
          <InfoRow
            icon={Calendar}
            label="Member Since"
            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : null}
          />
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({ prefs, setPrefs, prefSaving, onSave }) {
  const channels = [
    {
      key: 'emailOptIn',
      icon: Mail,
      label: 'Email Notifications',
      desc: 'Rent reminders, agreements, receipts, and important account updates',
      color: '#0992C2',
      bg: '#E0F2FE',
    },
    {
      key: 'smsOptIn',
      icon: MessageSquare,
      label: 'SMS Notifications',
      desc: 'Rent due alerts, overdue notices, and one-time OTP codes',
      color: '#059669',
      bg: '#F0FDF4',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7">
      <h3 className="text-base font-extrabold text-gray-900 mb-1">Notification Preferences</h3>
      <p className="text-xs text-gray-400 mb-6">Choose how you want RentifyPro to reach you</p>

      <div className="space-y-3">
        {channels.map(({ key, icon: Icon, label, desc, color, bg }) => (
          <div
            key={key}
            onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 cursor-pointer transition-colors select-none"
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
            <ToggleSwitch checked={prefs[key]} onToggle={() => setPrefs(p => ({ ...p, [key]: !p[key] }))} color={color} />
          </div>
        ))}
      </div>

      <button
        onClick={onSave}
        disabled={prefSaving}
        className="mt-6 flex items-center gap-2 bg-gradient-to-r from-[#0B2D72] to-[#0992C2] text-white rounded-2xl px-7 py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-blue-800/20 focus:outline-none"
      >
        {prefSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Bell className="w-4 h-4" />}
        {prefSaving ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  );
}

/* ─── Main page component ─────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user: ctxUser, refreshUser } = useUser();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [dbUser,    setDbUser]    = useState(null);
  const [loading,   setLoading]   = useState(true);

  // Profile form
  const [form,   setForm]   = useState({ name: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);

  // Photo upload
  const [photoFile,      setPhotoFile]      = useState(null);
  const [photoPreview,   setPhotoPreview]   = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Notification prefs
  const [prefs,       setPrefs]       = useState({ smsOptIn: false, emailOptIn: true });
  const [prefSaving,  setPrefSaving]  = useState(false);

  // 2FA
  const [twoFAEnabled, set2FAEnabled]   = useState(false);
  const [show2FASetup,  setShow2FASetup] = useState(false);
  const [qrCode,        setQrCode]       = useState('');
  const [totpInput,     setTotpInput]    = useState('');
  const [twoFALoading,  set2FALoading]   = useState(false);
  const [showDisable,   setShowDisable]  = useState(false);
  const [disableOTP,    setDisableOTP]   = useState('');
  const [disableVia,    setDisableVia]   = useState('');

  /* Fetch from server */
  useEffect(() => {
    api.get('/users/me')
      .then(({ data }) => {
        setDbUser(data);
        setPrefs({ smsOptIn: data.smsOptIn || false, emailOptIn: data.emailOptIn !== false });
        set2FAEnabled(data.twoFactorEnabled || false);
        setForm({ name: data.name || '', phoneNumber: data.phoneNumber || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Handlers */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', form);
      await refreshUser();
      toast('Profile updated successfully!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Please select an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024)    { toast('Image must be under 5MB', 'error');       return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      await api.post('/upload/profile-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      setPhotoFile(null);
      setPhotoPreview(null);
      toast('Profile photo updated!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to upload photo', 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePhotoClear = () => { setPhotoFile(null); setPhotoPreview(null); };

  const handleSavePrefs = async () => {
    setPrefSaving(true);
    try {
      await api.patch('/users/me/preferences', prefs);
      toast('Notification preferences saved!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setPrefSaving(false);
    }
  };

  const handle2FASetup = async () => {
    set2FALoading(true);
    try {
      const { data } = await api.post('/auth/2fa/setup');
      setQrCode(data.qrCode);
      setShow2FASetup(true);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to set up 2FA', 'error');
    } finally { set2FALoading(false); }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    set2FALoading(true);
    try {
      await api.post('/auth/2fa/verify', { token: totpInput });
      set2FAEnabled(true);
      setShow2FASetup(false);
      setTotpInput('');
      toast('2FA enabled successfully!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Invalid code', 'error');
    } finally { set2FALoading(false); }
  };

  const handleSendDisableOTP = async () => {
    set2FALoading(true);
    try {
      const { data } = await api.post('/auth/2fa/disable/send-otp');
      setDisableVia(data.via);
      setShowDisable(true);
      toast(`OTP sent to your ${data.via}`, 'info');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send OTP', 'error');
    } finally { set2FALoading(false); }
  };

  const handle2FADisable = async (e) => {
    e.preventDefault();
    set2FALoading(true);
    try {
      await api.post('/auth/2fa/disable', { otpCode: disableOTP });
      set2FAEnabled(false);
      setShowDisable(false);
      setDisableOTP('');
      toast('2FA disabled successfully', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Invalid OTP', 'error');
    } finally { set2FALoading(false); }
  };

  /* Loading state */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#0992C2]" />
      </div>
    );
  }

  const user = dbUser || ctxUser;
  if (!user) return null;

  const roleConfig  = ROLE_CONFIG[user.role] || ROLE_CONFIG.tenant;
  const joinedDate  = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;
  const displayPhoto = photoPreview || user.profilePhoto;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* ── Identity Hero Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.21, 0.6, 0.35, 1] }}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2D72] via-[#0862a0] to-[#0AC4E0]" />
        {/* Decorative orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-white/5" />

        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white/25 shadow-xl bg-white/20">
                {displayPhoto ? (
                  <img src={displayPhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-black text-white/90">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-[#E6F4F8] transition-colors group"
                title="Change photo"
              >
                <Camera className="w-4 h-4 text-[#0992C2] group-hover:scale-110 transition-transform" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
            </div>

            {/* Identity */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
                {user.name}
              </h2>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: roleConfig.bg, color: roleConfig.color }}
              >
                <span className="text-xs leading-none">{roleConfig.icon}</span>
                {roleConfig.label}
              </span>
              <div className="space-y-1 mt-1">
                <p className="text-blue-200/90 text-sm">{user.email}</p>
                {user.phoneNumber && <p className="text-blue-200/70 text-sm">{user.phoneNumber}</p>}
              </div>
              {joinedDate && (
                <div className="flex items-center gap-1.5 mt-3 justify-center sm:justify-start">
                  <Calendar className="w-3.5 h-3.5 text-blue-300/70" />
                  <span className="text-xs text-blue-200/70">Member since {joinedDate}</span>
                </div>
              )}
            </div>

            {/* Status pills */}
            <div className="flex sm:flex-col gap-2 flex-wrap justify-center">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                {twoFAEnabled ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-green-300" />
                    <span className="text-xs text-green-200 font-semibold whitespace-nowrap">2FA Active</span>
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-xs text-amber-200 font-semibold whitespace-nowrap">2FA Off</span>
                  </>
                )}
              </div>
              {user.isEmailVerified && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <CheckCircle className="w-3.5 h-3.5 text-green-300" />
                  <span className="text-xs text-green-200 font-semibold">Verified</span>
                </div>
              )}
              {user.provider && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <Award className="w-3.5 h-3.5 text-blue-200" />
                  <span className="text-xs text-blue-100 font-semibold capitalize">{user.provider}</span>
                </div>
              )}
            </div>
          </div>

          {/* Photo upload action banner */}
          <AnimatePresence>
            {photoFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-5 flex items-center gap-3 bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/10"
              >
                <Upload className="w-4 h-4 text-white/80 flex-shrink-0" />
                <p className="text-sm text-white/90 flex-1 truncate font-medium">{photoFile.name}</p>
                <button
                  onClick={handlePhotoUpload}
                  disabled={photoUploading}
                  className="px-4 py-1.5 bg-white text-[#0B2D72] rounded-xl text-xs font-bold hover:bg-blue-50 disabled:opacity-60 transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  {photoUploading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {photoUploading ? 'Uploading…' : 'Save Photo'}
                </button>
                <button onClick={handlePhotoClear} className="text-white/50 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Tab navigation ── */}
      <div className="flex gap-1 bg-gray-100/80 rounded-2xl p-1.5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none ${
                active
                  ? 'bg-white text-[#0B2D72] shadow-sm shadow-black/5'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <ProfileTab
              user={user}
              form={form}
              setForm={setForm}
              saving={saving}
              onSubmit={handleSaveProfile}
              photoFile={photoFile}
              photoPreview={photoPreview}
              photoUploading={photoUploading}
              onPhotoSelect={handlePhotoSelect}
              onPhotoUpload={handlePhotoUpload}
              onPhotoClear={handlePhotoClear}
              fileInputRef={fileInputRef}
            />
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <SecurityTab
              user={user}
              twoFAEnabled={twoFAEnabled}
              show2FASetup={show2FASetup}
              qrCode={qrCode}
              totpInput={totpInput}
              setTotpInput={setTotpInput}
              twoFALoading={twoFALoading}
              showDisable={showDisable}
              disableOTP={disableOTP}
              setDisableOTP={setDisableOTP}
              disableVia={disableVia}
              onSetup2FA={handle2FASetup}
              on2FAVerify={handle2FAVerify}
              onSendDisableOTP={handleSendDisableOTP}
              on2FADisable={handle2FADisable}
              onCancelSetup={() => setShow2FASetup(false)}
              onCancelDisable={() => { setShowDisable(false); setDisableOTP(''); }}
            />
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div key="notifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <NotificationsTab prefs={prefs} setPrefs={setPrefs} prefSaving={prefSaving} onSave={handleSavePrefs} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}