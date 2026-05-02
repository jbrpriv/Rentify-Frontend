'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Brush } from 'lucide-react';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import AgreementBuilder from '@/components/agreement-builder/AgreementBuilder';

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function EditAgreementTemplatePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const normalizedTier = String(user?.subscriptionTier || '').trim().toLowerCase();
  const tier = ['free', 'pro', 'enterprise'].includes(normalizedTier) ? normalizedTier : 'free';
  const canAccessTemplateStudio = user?.role === 'admin' || (user?.role === 'landlord' && tier === 'enterprise');

  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!user) return;
    if (canAccessTemplateStudio) return;

    toast('Agreement template studio is available on the Enterprise plan only.', 'error');
    router.push(user.role === 'landlord' ? '/dashboard/billing' : '/dashboard');
  }, [user, canAccessTemplateStudio, router, toast]);

  useEffect(() => {
    if (user && !canAccessTemplateStudio) {
      setLoading(false);
      return;
    }

    api.get(`/agreement-templates/${id}`)
      .then(({ data }) => {
        setTemplate(data);
        setName(data.name || '');
        setDescription(data.description || '');
      })
      .catch((err) => toast(err.response?.data?.message || 'Failed to load template', 'error'))
      .finally(() => setLoading(false));
  }, [id, toast, user, canAccessTemplateStudio]);

  const handleSave = React.useCallback(async (data) => {
    if (!name.trim()) {
      toast('Please enter a template name before saving', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/agreement-templates/${id}`, {
        name: name.trim(),
        description: description.trim(),
        bodyHtml: data.html,
        bodyJson: data.json,
        customizations: {
          customWatermark: data.customWatermark || '',
        },
      });

      toast('Template saved and resubmitted for review', 'success');
      router.push('/dashboard/agreement-templates');
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to save template', 'error');
    } finally {
      setSaving(false);
    }
  }, [id, name, description, toast, router]);

  if (user && !canAccessTemplateStudio) return null;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center text-gray-400 bg-gray-50">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-bold text-sm">Loading Template Builder...</p>
    </div>
  );

  const initialContent = template?.bodyHtml || `<h1>${template?.name || 'Agreement'}</h1><p>${template?.description || 'Residential Rental Agreement'}</p>`;
  const statusClass = STATUS_COLORS[template?.status] || STATUS_COLORS.pending;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Compact fullscreen top bar */}
      <div className="builder-fullscreen-topbar flex-shrink-0">
        <button
          onClick={() => router.push('/dashboard/agreement-templates')}
          className="back-btn"
        >
          <ArrowLeft size={15} />
          Templates
        </button>

        <div className="flex items-center gap-2 ml-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Brush size={14} className="text-white" />
          </div>
          <span className="text-sm font-extrabold text-slate-900 hidden sm:block">Edit Template</span>
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1" />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template name (required)..."
          className="meta-input flex-1 min-w-0"
          style={{ maxWidth: 300 }}
        />

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description (optional)..."
          className="meta-input flex-1 min-w-0 hidden md:block"
          style={{ maxWidth: 300 }}
        />

        {template?.status && (
          <span className={`ml-auto flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${statusClass}`}>
            {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
          </span>
        )}
      </div>

      {/* Builder — fills remaining height */}
      <div className="flex-1 min-h-0">
        <AgreementBuilder
          initialContent={initialContent}
          onSave={handleSave}
          isSaving={saving}
        />
      </div>
    </div>
  );
}