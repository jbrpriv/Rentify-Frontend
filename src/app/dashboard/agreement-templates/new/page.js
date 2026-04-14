'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!user) return;
    if (canAccessTemplateStudio) return;

    toast('Agreement template studio is available on the Enterprise plan only.', 'error');
    router.push(user.role === 'landlord' ? '/dashboard/billing' : '/dashboard');
  }, [user, canAccessTemplateStudio, router, toast]);

  const handleSave = React.useCallback(async (data) => {
    if (!metadata.name.trim()) {
      toast('Please enter a template name before saving', 'error');
      return;
    }

    setSaving(true);
    try {
      const baseTheme = themes.find(t => t.isDefault)?._id || themes[0]?._id;
      
      if (!baseTheme) {
        throw new Error('No base themes available. Please contact support.');
      }

      await api.post('/agreement-templates', {
        name: metadata.name,
        description: metadata.description,
        baseTheme,
        bodyHtml: data.html,
        bodyJson: data.json,
        customizations: {
          primaryColor: '',
          accentColor: '',
          backgroundColor: '',
          fontFamily: '',
          fontSizeScale: 1.0
        }
      });

      toast('Agreement template saved and submitted for review');
      router.push('/dashboard/agreement-templates');
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to save template', 'error');
    } finally {
      setSaving(false);
    }
  }, [metadata, toast, themes, router]);

  if (user && !canAccessTemplateStudio) return null;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Templates
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">New Agreement Template</h1>
          <p className="text-sm text-gray-500 mt-1">Design your custom agreement document using the builder below.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Template Name</label>
          <input 
            type="text"
            value={metadata.name}
            onChange={(e) => setMetadata({...metadata, name: e.target.value})}
            placeholder="e.g., Standard Residential Lease 2026"
            className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
          />
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description (Optional)</label>
          <input 
            type="text"
            value={metadata.description}
            onChange={(e) => setMetadata({...metadata, description: e.target.value})}
            placeholder="e.g., Used for multi-family units in downtown"
            className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
          />
        </div>
      </div>

      <AgreementBuilder 
        onSave={handleSave}
        isSaving={saving}
      />
    </div>
  );
}
