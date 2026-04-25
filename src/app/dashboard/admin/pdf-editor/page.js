'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, FileText, Receipt, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';

// Dynamically import AgreementBuilder (SSR breaks Tiptap)
const AgreementBuilder = dynamic(
  () => import('@/components/agreement-builder/AgreementBuilder'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-64 text-sm text-slate-400 gap-2"><Loader2 className="animate-spin" size={16} /> Loading editor...</div> }
);

export default function AdminPdfEditorPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [templateType, setTemplateType] = useState(null);
  const [agreementTemplate, setAgreementTemplate] = useState(null);
  const [receiptTemplate, setReceiptTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

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
        // Fine — templates may not exist yet
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
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* ── Fullscreen top bar ── */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-3 gap-y-2 px-5 py-2 bg-white border-b border-slate-200">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[13px] font-bold text-slate-500 bg-slate-50 border border-slate-200 transition-all hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300"
        >
          <ArrowLeft size={15} />
          Admin
        </button>

        <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block" />

        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">PDF Template Studio</p>
          <p className="text-sm font-extrabold text-slate-900 leading-tight">Global Default Templates</p>
        </div>

        {/* Type switcher — in the top bar */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setTemplateType('agreement')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              templateType === 'agreement'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            <FileText size={13} />
            Agreement
            {agreementTemplate && (
              <span className="ml-0.5 bg-green-400 w-2 h-2 rounded-full inline-block" title="Template set" />
            )}
          </button>

          <button
            onClick={() => setTemplateType('receipt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              templateType === 'receipt'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            <Receipt size={13} />
            Receipt
            {receiptTemplate && (
              <span className="ml-0.5 bg-green-400 w-2 h-2 rounded-full inline-block" title="Template set" />
            )}
          </button>

          {currentTemplate && (
            <span className="flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-full text-[11px] font-bold">
              <Check size={11} /> Saved
            </span>
          )}
        </div>
      </div>

      {/* ── No type selected ── */}
      {!templateType && !loadingTemplates && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-gray-50">
          <div className="p-4 bg-slate-100 rounded-2xl">
            <AlertCircle size={32} className="text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-bold text-base">Select a template type to begin</p>
            <p className="text-slate-400 text-sm mt-1">Design the global default for all tenants and landlords</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTemplateType('agreement')}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
            >
              <FileText size={15} /> Edit Global Agreement
            </button>
            <button
              onClick={() => setTemplateType('receipt')}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-2 shadow-sm"
            >
              <Receipt size={15} /> Edit Global Receipt
            </button>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loadingTemplates && (
        <div className="flex-1 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Loader2 className="animate-spin" size={18} /> Loading saved global templates…
        </div>
      )}

      {/* ── Builder ── */}
      {!loadingTemplates && templateType && (
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Info strip */}
          <div className={`px-5 py-2 text-xs font-semibold flex items-center gap-2 flex-shrink-0 ${
            templateType === 'agreement'
              ? 'bg-blue-50 text-blue-800 border-b border-blue-100'
              : 'bg-purple-50 text-purple-800 border-b border-purple-100'
          }`}>
            {templateType === 'agreement' ? <FileText size={13} /> : <Receipt size={13} />}
            {templateType === 'agreement'
              ? 'Global Agreement Template — use the Toolbox to insert variables and clauses section.'
              : 'Global Receipt Template — insert payment-specific variables. Clauses do not apply.'}
          </div>

          <div className="flex-1 min-h-0">
            <AgreementBuilder
              key={templateType}
              templateType={templateType}
              initialContent={currentTemplate?.bodyHtml || ''}
              onSave={handleSave}
              isSaving={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
}