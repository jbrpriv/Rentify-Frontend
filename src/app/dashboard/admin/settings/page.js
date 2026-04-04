'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useUser } from '@/context/UserContext';
import { useBranding } from '@/context/BrandingContext';
import { Loader2, Save, Shield, Sparkles, Mail, ImageIcon } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { refreshBranding } = useBranding();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ brandName: '', supportEmail: '', logoUrl: '', faviconUrl: '/favicon.ico' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

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
            <span className="text-xs font-bold text-slate-700 uppercase tracking-[0.12em]">Navbar Logo URL</span>
            <div className="mt-1.5 relative">
              <ImageIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={form.logoUrl}
                onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0992C2]/35"
                placeholder="https://cdn.example.com/brand-logo.png"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Used in navigation headers. Leave empty to use the default icon.</p>
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-[0.12em]">Browser Tab Icon URL (Favicon)</span>
            <div className="mt-1.5 relative">
              <ImageIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={form.faviconUrl}
                onChange={(e) => setForm((p) => ({ ...p, faviconUrl: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0992C2]/35"
                placeholder="/favicon.ico or https://cdn.example.com/favicon.ico"
              />
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
