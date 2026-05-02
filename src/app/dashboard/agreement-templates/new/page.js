'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import api from '@/utils/api';
import useGlobalPdfTheme from '@/hooks/useGlobalPdfTheme';
import AgreementBuilder from '@/components/agreement-builder/AgreementBuilder';

export default function CreateAgreementTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const normalizedTier = String(user?.subscriptionTier || '').trim().toLowerCase();
  const tier = ['free', 'pro', 'enterprise'].includes(normalizedTier) ? normalizedTier : 'free';
  const canAccessTemplateStudio = user?.role === 'admin' || (user?.role === 'landlord' && tier === 'enterprise');

  const { themes } = useGlobalPdfTheme();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!user) return;
    if (canAccessTemplateStudio) return;

    toast('Agreement template studio is available on the Enterprise plan only.', 'error');
    router.push(user.role === 'landlord' ? '/dashboard/billing' : '/dashboard');
  }, [user, canAccessTemplateStudio, router, toast]);

  const handleSave = React.useCallback(async (data) => {
    if (!name.trim()) {
      toast('Please enter a template name before saving', 'error');
      return;
    }

    setSaving(true);
    try {
      // Use the visual theme the landlord selected in the builder (data.themeId = VISUAL_THEMES id = PdfTheme.themeSlug)
      const baseTheme = themes.find(t => t.themeSlug === data.themeId)?._id
        || themes.find(t => t.isDefault)?._id
        || themes[0]?._id;

      if (!baseTheme) {
        throw new Error('No base themes available. Please contact support.');
      }

      await api.post('/agreement-templates', {
        name: name.trim(),
        description: description.trim(),
        baseTheme,
        bodyHtml: data.html,
        bodyJson: data.json,
        customizations: {
          primaryColor: '',
          accentColor: '',
          backgroundColor: '',
          fontFamily: '',
          fontSizeScale: 1.0,
          customWatermark: data.customWatermark || '',
        },
      });

      toast('Agreement template saved and submitted for review');
      router.push('/dashboard/agreement-templates');
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to save template', 'error');
    } finally {
      setSaving(false);
    }
  }, [name, description, toast, themes, router]);

  if (user && !canAccessTemplateStudio) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-gray-50">
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
            <FileText size={14} className="text-white" />
          </div>
          <span className="text-sm font-extrabold text-slate-900 hidden sm:block">New Template</span>
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
      </div>

      <div className="flex-1 min-h-0">
        <AgreementBuilder
          onSave={handleSave}
          isSaving={saving}
        />
      </div>
    </div>
  );
}