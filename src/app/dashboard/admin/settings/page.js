'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useBranding } from '@/context/BrandingContext';
import { Loader2, Save, Shield, Sparkles, Mail, ImageIcon, UploadCloud } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { refreshBranding } = useBranding();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [form, setForm] = useState({ brandName: '', supportEmail: '', logoUrl: '', faviconUrl: '/favicon.ico' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const load = async () => {
      setLoading(true);
      setErr('');
      try {
        const { data } = await api.get('/admin/settings/branding');
        setForm({
          brandName: data.brandName || 'RentifyPro',
          supportEmail: data.supportEmail || 'support@rentifypro.com',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '/favicon.ico',
        });
      } catch (e) {
        setErr(e.response?.data?.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, router]);

  const save = async () => {
    setSaving(true);
    setMsg('');
    setErr('');
    try {
      await api.put('/admin/settings/branding', form);
      await refreshBranding();
      setMsg('Global branding settings updated.');
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const uploadBrandingAsset = async (kind, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErr('Please select a valid image file.');
      return;
    }

    const maxBytes = kind === 'favicon' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErr(kind === 'favicon' ? 'Favicon must be under 2MB.' : 'Logo image must be under 5MB.');
      return;
    }

    setErr('');
    setMsg('');
    if (kind === 'logo') setLogoUploading(true);
    if (kind === 'favicon') setFaviconUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const endpoint = kind === 'logo' ? '/upload/branding/logo' : '/upload/branding/favicon';

      const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const nextUrl = data?.url || '';
      if (!nextUrl) {
        throw new Error('Upload succeeded but no URL was returned.');
      }

      if (kind === 'logo') {
        setForm((prev) => ({ ...prev, logoUrl: nextUrl }));
        setMsg('Logo uploaded. Click Save Global Branding Settings to publish it.');
      } else {
        setForm((prev) => ({ ...prev, faviconUrl: nextUrl }));
        setMsg('Favicon uploaded. Click Save Global Branding Settings to publish it.');
      }
    } catch (e) {
      setErr(e.response?.data?.message || e.message || 'Image upload failed.');
    } finally {
      if (kind === 'logo') setLogoUploading(false);
      if (kind === 'favicon') setFaviconUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Branding Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Platform-wide branding controls for names, contact, and logos.</p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-11 w-11 rounded-2xl bg-[#E6F4F8] flex items-center justify-center text-[#0B2D72]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Global Branding</h2>
            <p className="text-xs text-slate-500 mt-0.5">Changes here update navbar logos, browser tab icon, and platform branding across frontend and notifications.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-[0.12em]">Brand Name</span>
            <div className="mt-1.5 relative">
              <Shield className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm((p) => ({ ...p, brandName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0992C2]/35"
                placeholder="e.g. Your Platform"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-[0.12em]">Support Email</span>
            <div className="mt-1.5 relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm((p) => ({ ...p, supportEmail: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0992C2]/35"
                placeholder="support@yourbrand.com"
              />
            </div>
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-[0.12em]">Navbar Logo</span>
            <div className="mt-2 rounded-xl border border-slate-200 p-3 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                  {form.logoUrl
                    ? <img src={form.logoUrl} alt="Brand logo preview" className="h-full w-full object-cover" />
                    : <ImageIcon className="h-5 w-5 text-slate-400" />}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      void uploadBrandingAsset('logo', file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {logoUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                    Upload Logo
                  </button>
                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, logoUrl: '' }))}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Use Default Icon
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Used in navigation headers. Leave empty to use the default icon.</p>
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-[0.12em]">Browser Tab Icon (Favicon)</span>
            <div className="mt-2 rounded-xl border border-slate-200 p-3 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                  {form.faviconUrl
                    ? <img src={form.faviconUrl} alt="Favicon preview" className="h-8 w-8 object-contain" />
                    : <ImageIcon className="h-5 w-5 text-slate-400" />}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      void uploadBrandingAsset('favicon', file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={faviconUploading}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {faviconUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                    Upload Favicon
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, faviconUrl: '/favicon.ico' }))}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Reset Default Favicon
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">This controls the icon shown on the browser tab.</p>
          </label>
        </div>

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
        {msg && <p className="mt-4 text-sm text-emerald-600">{msg}</p>}

        <div className="mt-5 flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B2D72] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#113784] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Global Branding Settings
          </button>
        </div>
      </section>
    </div>
  );
}
