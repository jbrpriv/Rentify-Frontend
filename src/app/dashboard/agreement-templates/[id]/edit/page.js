'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import AgreementBuilder from '@/components/agreement-builder/AgreementBuilder';

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

  useEffect(() => {
    if (user && !canAccessTemplateStudio) {
      setLoading(false);
      return;
    }

    api.get(`/agreement-templates/${id}`)
      .then(({ data }) => {
        setTemplate(data);
        setMetadata({
          name: data.name || '',
          description: data.description || '',
        });
      })
      .catch((err) => toast(err.response?.data?.message || 'Failed to load template', 'error'))
      .finally(() => setLoading(false));
  }, [id, toast, user, canAccessTemplateStudio]);

  if (user && !canAccessTemplateStudio) return null;
  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-bold">Loading Template Builder...</p>
    </div>
  );

  // Construct initial content from old clauses if no HTML is present
  const initialContent = template?.htmlContent || `
    <h1>${template?.name || 'Agreement'}</h1>
    <p>${template?.description || 'Residential Rental Agreement'}</p>
    <h2>Standard Clauses</h2>
    <ul>
      <li><strong>Maintenance:</strong> ${template?.standardClauses?.maintenance || '...'}</li>
      <li><strong>Subletting:</strong> ${template?.standardClauses?.subletting || '...'}</li>
      <li><strong>Entry:</strong> ${template?.standardClauses?.entry || '...'}</li>
    </ul>
  `;

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
          <h1 className="text-3xl font-extrabold text-gray-900">Edit Template: {metadata.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Update your agreement document below. Changes captured locally for frontend demo.</p>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest border border-blue-100">
          Status: {template?.status || 'Pending'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Template Name</label>
          <input 
            type="text"
            value={metadata.name}
            onChange={(e) => setMetadata({...metadata, name: e.target.value})}
            className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
          />
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description (Optional)</label>
          <input 
            type="text"
            value={metadata.description}
            onChange={(e) => setMetadata({...metadata, description: e.target.value})}
            className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900"
          />
        </div>
      </div>

      <AgreementBuilder 
        initialContent={initialContent}
        onSave={(data) => {
          console.log('Document Updated:', { ...metadata, ...data });
          toast.success('Agreement template updated successfully');
        }}
      />
    </div>
  );
}
