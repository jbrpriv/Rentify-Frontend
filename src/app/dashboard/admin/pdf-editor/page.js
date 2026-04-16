'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Save, FileText, Receipt, AlertCircle, Check } from 'lucide-react';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';

// Dynamically import AgreementBuilder (SSR breaks Tiptap)
const AgreementBuilder = dynamic(
  () => import('@/components/agreement-builder/AgreementBuilder'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-64 text-sm text-slate-400 gap-2"><Loader2 className="animate-spin" size={16} /> Loading editor...</div> }
);

export default function AdminPdfEditorPage() {
  const { toast } = useToast();

  // Which global template we're editing: 'agreement' | 'receipt'
  const [templateType, setTemplateType] = useState(null); // null = modal open
  const [showTypeModal, setShowTypeModal] = useState(true);

  // The loaded template data
  const [agreementTemplate, setAgreementTemplate] = useState(null);
  const [receiptTemplate, setReceiptTemplate] = useState(null);

  const [saving, setSaving] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Load global templates on mount
  useEffect(() => {
    const load = async () => {
      setLoadingTemplates(true);
      try {
        const { data } = await api.get('/agreement-templates/admin/global');
        const agreement = data.find((t) => t.templateType === 'agreement') || null;
        const receipt = data.find((t) => t.templateType === 'receipt') || null;
        setAgreementTemplate(agreement);
        setReceiptTemplate(receipt);
      } catch {
        // It's fine — templates may not exist yet (admin creates them fresh)
      } finally {
        setLoadingTemplates(false);
      }
    };
    load();
  }, []);

  const currentTemplate = templateType === 'agreement' ? agreementTemplate : receiptTemplate;

  const handleSave = useCallback(async (content) => {
    if (!templateType) return;
    setSaving(true);
    try {
      const { data } = await api.post('/agreement-templates/admin/global', {
        templateType,
        bodyHtml: content.html,
        bodyJson: content.json,
      });
      if (templateType === 'agreement') setAgreementTemplate(data);
      else setReceiptTemplate(data);
      toast('Global template saved!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }, [templateType, toast]);

  return (
    <div className="max-w-full pb-10">
      {/* Page header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Global PDF Template Studio</h1>
          <p className="text-sm text-slate-500 mt-1">
            Design the global default templates for Agreements and Receipts. All tiers use these unless an Enterprise landlord selects their own template.
          </p>
        </div>
      </div>

      {/* Type switcher tabs */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setTemplateType('agreement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
            templateType === 'agreement'
              ? 'bg-blue-600 text-white border-blue-600 shadow'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
          }`}
        >
          <FileText size={15} />
          Global Agreement Template
          {agreementTemplate && (
            <span className="ml-1 bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              SET
            </span>
          )}
        </button>
        <button
          onClick={() => setTemplateType('receipt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
            templateType === 'receipt'
              ? 'bg-purple-600 text-white border-purple-600 shadow'
              : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
          }`}
        >
          <Receipt size={15} />
          Global Receipt Template
          {receiptTemplate && (
            <span className="ml-1 bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              SET
            </span>
          )}
        </button>
      </div>

      {/* No type selected — prompt */}
      {!templateType && !loadingTemplates && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-4 py-20">
          <AlertCircle size={36} className="text-slate-300" />
          <p className="text-slate-500 font-semibold text-sm">Select a template type above to start editing.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTemplateType('agreement')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FileText size={15} /> Edit Global Agreement
            </button>
            <button
              onClick={() => setTemplateType('receipt')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-2"
            >
              <Receipt size={15} /> Edit Global Receipt
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loadingTemplates && (
        <div className="flex items-center justify-center py-20 gap-2 text-slate-400 text-sm">
          <Loader2 className="animate-spin" size={18} /> Loading saved global templates…
        </div>
      )}

      {/* Builder */}
      {!loadingTemplates && templateType && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Info bar */}
          <div className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 ${templateType === 'agreement' ? 'bg-blue-50 text-blue-800 border-b border-blue-100' : 'bg-purple-50 text-purple-800 border-b border-purple-100'}`}>
            {templateType === 'agreement' ? <FileText size={15} /> : <Receipt size={15} />}
            {templateType === 'agreement'
              ? 'Editing the Global Agreement Template — use "Insert Variables" to add dynamic fields, and "Clauses Section" to mark where Pro users can drag-and-drop their clauses.'
              : 'Editing the Global Receipt Template — use "Insert Variables" to add payment-specific dynamic fields. Clauses do not apply to receipts.'}
            {currentTemplate && (
              <span className="ml-auto flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                <Check size={11} /> Saved version exists
              </span>
            )}
          </div>

          <AgreementBuilder
            key={templateType} // force remount when switching type
            templateType={templateType}
            initialContent={currentTemplate?.bodyHtml || ''}
            onSave={handleSave}
            isSaving={saving}
          />
        </div>
      )}
    </div>
  );
}