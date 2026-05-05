'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useBranding } from '@/context/BrandingContext';
import {
  Search, UserCheck, Calendar, FileText, Loader2,
  CheckSquare, Square, ChevronDown, ChevronUp, Tag,
  GripVertical, Eye, EyeOff, AlertTriangle, X, LayoutTemplate,
  ArrowRight, CheckCircle2, PawPrint, Zap, ScrollText,
} from 'lucide-react';
import { getThemeById, themeToCssVars, VISUAL_THEMES } from '@/components/agreement-builder/VisualThemes';
import { generateLayoutCss } from '@/components/agreement-builder/generateLayoutCss';

// ─── Flow Tracker ─────────────────────────────────────────────────────────────
function FlowTracker({ offerData }) {
  const { formatMoney } = useCurrency();
  const steps = [
    {
      key: 'browse',
      label: 'Property Listed',
      sublabel: offerData?.property?.title || 'Property',
      done: true,
    },
    {
      key: 'offer',
      label: 'Offer Negotiated',
      sublabel: offerData
        ? `${offerData.history?.length} round${offerData.history?.length !== 1 ? 's' : ''} · ${formatMoney(offerData.history?.[offerData.history.length - 1]?.monthlyRent || 0)}/mo`
        : 'Offer accepted',
      done: true,
    },
    {
      key: 'agreement',
      label: 'Draft Agreement',
      sublabel: 'Set terms & clauses',
      done: false,
      active: true,
    },
    {
      key: 'sign',
      label: 'Sign & Activate',
      sublabel: 'Both parties sign',
      done: false,
    },
  ];

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Rental Flow</p>
      <div className="flex items-start gap-0">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-0">
              {/* Circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border-2 transition-all
                ${step.done
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.active
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-300'}`}>
                {step.done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {/* Label */}
              <div className="mt-2 text-center px-1">
                <p className={`text-xs font-semibold leading-tight ${step.active ? 'text-blue-700' : step.done ? 'text-green-700' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight line-clamp-2">{step.sublabel}</p>
              </div>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-shrink-0 mt-4 w-4 mx-1 rounded-full ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Template Picker Modal ────────────────────────────────────────────────────
function TemplatePicker({ onApply, onClose, canUseTemplates = true }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    api.get('/agreement-templates/available')
      .then(({ data }) => {
        setTemplates(Array.isArray(data?.templates) ? data.templates : []);
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectTemplate = async (tpl) => {
    if (!canUseTemplates) return;
    setApplying(tpl._id);
    try {
      await api.post(`/agreement-templates/${tpl._id}/use`);
    } catch { }
    onApply({ type: 'template', id: tpl._id, name: tpl.name });
    setApplying(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[84vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <LayoutTemplate className="w-5 h-5 text-blue-600" />
            PDF Template Selection
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!canUseTemplates && (
          <div className="px-5 py-2 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-800">
            Custom agreement templates are available on the Enterprise plan only.
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
              <Loader2 className="animate-spin w-5 h-5" /> Loading templates...
            </div>
          )}

          {!loading && templates.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8 italic">
              No approved personal templates available yet.
            </p>
          )}

          {!loading && templates.map(tpl => (
            <div key={tpl._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm">{tpl.name}</h4>
                  {tpl.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tpl.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  disabled={!!applying}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition shrink-0"
                >
                  {applying === tpl._id
                    ? <Loader2 className="animate-spin w-3 h-3" />
                    : <LayoutTemplate className="w-3 h-3" />}
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t bg-gray-50">
          <p className="text-xs text-gray-400">
            Select one of your approved templates to override the global default for this agreement.
          </p>
        </div>
      </div>
    </div>
  );
}


// ─── Inline PDF Preview ───────────────────────────────────────────────────────
function InlinePDFPreview({ agreementId, onClose }) {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!agreementId) return;
    api.get(`/agreements/${agreementId}/preview`)
      .then(({ data }) => setPreviewData(data))
      .catch(err => setError(err.response?.data?.message || 'Preview unavailable'))
      .finally(() => setLoading(false));
  }, [agreementId]);

  const previewSrc = previewData?.url
    || (previewData?.base64 ? `data:application/pdf;base64,${previewData.base64}` : null);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <FileText className="w-5 h-5 text-blue-600" />
            Agreement Preview
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="h-full flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="animate-spin w-5 h-5" /> Loading PDF…
            </div>
          )}
          {error && (
            <div className="h-full flex items-center justify-center gap-2 text-red-500 text-sm">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          {previewSrc && !loading && (
            <iframe
              src={previewSrc}
              title="Agreement PDF Preview"
              className="w-full h-full"
              style={{ minHeight: '600px', border: 'none' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Variable Substitution Helper ─────────────────────────────────────────────
// Used for the inline clause preview only (not the final PDF).
// Supports both camelCase ({{tenantName}}) and snake_case ({{tenant_name}}) tokens
// since older clauses may use either convention.
function substituteVariables(text, offer, form, formatMoney) {
  if (!text) return '';
  let replaced = text;

  const petLabel = form?.petAllowed ? 'Pets allowed' : 'No pets';
  const petDeposit = form?.petAllowed && form?.petDeposit
    ? formatMoney(Number(form.petDeposit))
    : 'N/A';
  const utilities = form?.utilitiesIncluded ? 'Utilities included' : 'Utilities not included';
  const utilDetails = form?.utilitiesDetails || '';
  const termPolicy = form?.terminationPolicy || '';

  const rules = {
    // snake_case (Primary standard)
    '{{tenant_name}}': offer?.tenant?.name || '[Tenant Name]',
    '{{landlord_name}}': offer?.landlord?.name || offer?.property?.landlord?.name || '[Landlord Name]',
    '{{property_title}}': offer?.property?.title || '[Property Title]',
    '{{property_address}}': offer?.property?.address ? `${offer.property.address.street}, ${offer.property.address.city}` : '[Property Address]',
    '{{rent_amount}}': form?.rentAmount ? formatMoney(Number(form.rentAmount)) : '[Rent Amount]',
    '{{monthly_rent}}': form?.rentAmount ? formatMoney(Number(form.rentAmount)) : '[Monthly Rent]',
    '{{security_deposit}}': form?.depositAmount ? formatMoney(Number(form.depositAmount)) : '[Security Deposit]',
    '{{deposit_amount}}': form?.depositAmount ? formatMoney(Number(form.depositAmount)) : '[Deposit Amount]',
    '{{total_move_in}}': (form?.rentAmount && form?.depositAmount) ? formatMoney(Number(form.rentAmount) + Number(form.depositAmount)) : '[Total Move-in]',
    '{{maintenance_fee}}': form?.maintenanceFee ? formatMoney(Number(form.maintenanceFee)) : '[Maintenance Fee]',
    '{{late_fee}}': (form?.lateFeeAmount != null && form.lateFeeAmount !== '') ? formatMoney(Number(form.lateFeeAmount)) : '[Late Fee]',
    '{{late_fee_amount}}': (form?.lateFeeAmount != null && form.lateFeeAmount !== '') ? formatMoney(Number(form.lateFeeAmount)) : '[Late Fee Amount]',
    '{{late_fee_grace_days}}': (form?.lateFeeGracePeriodDays != null && form.lateFeeGracePeriodDays !== '') ? `${form.lateFeeGracePeriodDays} days` : '[Grace Period]',
    '{{start_date}}': form?.startDate ? new Date(form.startDate).toLocaleDateString() : '[Start Date]',
    '{{end_date}}': form?.endDate ? new Date(form.endDate).toLocaleDateString() : '[End Date]',
    '{{duration_months}}': form?.leaseDurationMonths || '[Duration]',
    '{{utilities_included}}': utilities,
    '{{utilities}}': utilities,
    '{{utilities_details}}': utilDetails || '[Utilities Details]',
    '{{rent_escalation_enabled}}': form?.rentEscalationEnabled ? 'Enabled' : 'Disabled',
    '{{rent_escalation_percentage}}': form?.rentEscalationEnabled
      ? `${form.rentEscalationPercentage || 5}%`
      : 'N/A',
    '{{pet_allowed}}': petLabel,
    '{{pet_policy}}': petLabel,
    '{{pet_deposit}}': petDeposit,
    '{{termination_policy}}': termPolicy || '[Termination Policy]',
    '{{current_date}}': new Date().toLocaleDateString(),
    '{{agreement_id}}': '[Draft ID]',

    // camelCase (Legacy/Admin support)
    '{{tenantName}}': offer?.tenant?.name || '[Tenant Name]',
    '{{landlordName}}': offer?.landlord?.name || offer?.property?.landlord?.name || '[Landlord Name]',
    '{{propertyTitle}}': offer?.property?.title || '[Property Title]',
    '{{propertyAddress}}': offer?.property?.address ? `${offer.property.address.street}, ${offer.property.address.city}` : '[Property Address]',
    '{{startDate}}': form?.startDate ? new Date(form.startDate).toLocaleDateString() : '[Start Date]',
    '{{endDate}}': form?.endDate ? new Date(form.endDate).toLocaleDateString() : '[End Date]',
    '{{rentAmount}}': form?.rentAmount ? formatMoney(Number(form.rentAmount)) : '[Rent Amount]',
    '{{depositAmount}}': form?.depositAmount ? formatMoney(Number(form.depositAmount)) : '[Deposit Amount]',
    '{{lateFeeAmount}}': (form?.lateFeeAmount != null && form.lateFeeAmount !== '') ? formatMoney(Number(form.lateFeeAmount)) : '[Late Fee]',
    '{{lateFeeGraceDays}}': (form?.lateFeeGracePeriodDays != null && form.lateFeeGracePeriodDays !== '') ? `${form.lateFeeGracePeriodDays} days` : '[Grace Period]',
    '{{petPolicy}}': petLabel,
    '{{petDeposit}}': petDeposit,
    '{{utilitiesDetails}}': utilDetails || '[Utilities Details]',
    '{{rentEscalationEnabled}}': form?.rentEscalationEnabled ? 'Enabled' : 'Disabled',
    '{{rentEscalationPercentage}}': form?.rentEscalationEnabled
      ? `${form.rentEscalationPercentage || 5}%`
      : 'N/A',
    '{{terminationPolicy}}': termPolicy || '[Termination Policy]',
    '{{currentDate}}': new Date().toLocaleDateString(),
    '{{agreementId}}': '[Draft ID]',
  };

  for (const [key, value] of Object.entries(rules)) {
    replaced = replaced.replace(
      new RegExp(key.replace(/[{}]/g, '\\$&'), 'gi'),
      `<span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-medium">${value}</span>`
    );
  }
  return replaced;
}

const pickThemeString = (value, fallback) => (
  typeof value === 'string' && value.trim() ? value.trim() : fallback
);


/**
 * resolveThemeObject(baseTheme, customizations)
 * Robustly extract the theme ID slug from various possible input formats
 * and returns the full theme object along with generated CSS variables.
 */
function resolveThemeObject(baseTheme, customizations) {
  let actualCustoms = customizations;
  if (typeof customizations === 'string') {
    try { actualCustoms = JSON.parse(customizations); } catch (e) { }
  }

  const themeId = (typeof baseTheme === 'string') 
    ? baseTheme 
    : (baseTheme?.themeSlug || baseTheme?.id || baseTheme?._id || 'blank');
    
  const theme = getThemeById(themeId);
  const themeVars = themeToCssVars(theme);

  // Apply customizations if any
  if (customizations?.customWatermark) {
    themeVars['--theme-watermark-text'] = `"${customizations.customWatermark}"`;
    themeVars['--theme-watermark-opacity'] = customizations.watermarkOpacity || 0.05;
  }

  return { 
    theme, 
    themeVars, 
    logoUrl: actualCustoms?.logoUrl || 
             actualCustoms?.customLogo || 
             actualCustoms?.logo || 
             actualCustoms?.brandingLogo || 
             actualCustoms?.headerLogo || 
             actualCustoms?.templateLogo || '' 
  };
}

function applyThemeLayout(html, layoutStyle = 'minimalist') {
  if (!html) return html;

  // Local helper for structure extraction
  const extract = (h, regex) => {
    const match = h.match(regex);
    if (!match) return { block: '', rest: h };
    return { block: match[0], rest: h.replace(match[0], '') };
  };

  let working = html;
  const { block: heading, rest: afterHeading } = extract(working, /<h1\b[^>]*>[\s\S]*?<\/h1>/i);
  working = afterHeading;
  const { block: intro, rest: afterIntro } = extract(working, /<p\b[^>]*>[\s\S]*?<\/p>/i);
  working = afterIntro;
  const { block: table, rest: afterTable } = extract(working, /<table\b[^>]*>[\s\S]*?<\/table>/i);
  working = afterTable;

  const safeHeading = heading || '<h1>Rental Agreement</h1>';

  switch (layoutStyle) {
    case 'classic':
      return `${safeHeading}${intro || ''}${table ? `<div class="layout-classic-table">${table}</div>` : ''}${working}`;
    case 'legal':
      return `<div class="layout-meta-strip"><span>Agreement Preview</span><span>${new Date().toLocaleDateString()}</span></div>${safeHeading}${intro || ''}${table ? `<div class="layout-legal-table">${table}</div>` : ''}${working}`;
    case 'premium':
      return `<div class="layout-premium-hero"><div>${safeHeading}${intro || ''}</div>${table ? `<div class="layout-premium-summary">${table}</div>` : ''}</div>${working}`;
    case 'contemporary':
      return `${safeHeading}<div class="layout-contemporary-top">${table ? `<div class="layout-contemporary-card">${table}</div>` : ''}${intro ? `<div class="layout-contemporary-card">${intro}</div>` : ''}</div>${working}`;
    case 'editorial':
      return `<div class="layout-editorial-header">${safeHeading}${intro || ''}</div>${table ? `<div class="layout-editorial-feature">${table}</div>` : ''}${working}`;
    case 'ledger':
      return `<div class="layout-meta-strip"><span>Ledger View</span><span>${new Date().toLocaleDateString()}</span></div>${safeHeading}${table ? `<div class="layout-ledger-block">${table}</div>` : ''}${intro || ''}${working}`;
    case 'modern':
      return `<div class="layout-modern-hero-grid"><div>${safeHeading}${intro || ''}</div>${table ? `<aside class="layout-modern-summary">${table}</aside>` : ''}</div>${working}`;
    default:
      return html;
  }
}

const makeBucket = (clauseId = null) => ({
  key: `bucket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  clauseId,
});

const arraysEqual = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (String(a[i]) !== String(b[i])) return false;
  }
  return true;
};

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

// ─── Clause Buckets Section ──────────────────────────────────────────────────
function ClauseBucketsSection({
  clauseBuckets, idxOffset = 0, clausesById, hoveredBucketKey,
  setHoveredBucketKey, handleDropToBucket, handleDragStart,
  moveBucketClause, handleRemoveClause, addClauseBucket,
  isClauseLimitFinite, clauseLimit, offerData, formData, formatMoney
}) {
  return (
    <div className="space-y-4 my-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <ScrollText size={16} className="text-blue-600" /> Clause Library Buckets
        </p>
        <button
          type="button"
          onClick={addClauseBucket}
          disabled={isClauseLimitFinite && clauseBuckets.length >= clauseLimit}
          className="px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          Add Clause Slot
        </button>
      </div>

      {clauseBuckets.map((bucket, idx) => {
        const letter = String.fromCharCode(65 + idx + idxOffset);
        const clause = bucket.clauseId ? clausesById.get(bucket.clauseId) : null;
        const isHovered = hoveredBucketKey === bucket.key;
        return (
          <div
            key={bucket.key}
            onDragOver={(e) => { e.preventDefault(); setHoveredBucketKey(bucket.key); }}
            onDragLeave={() => setHoveredBucketKey('')}
            onDrop={(e) => { e.preventDefault(); handleDropToBucket(bucket.key); }}
            className={`rounded-xl border-2 p-5 transition-all duration-200 ${isHovered ? 'border-blue-400 bg-blue-50/50 shadow-inner' : 'border-dashed border-gray-200 bg-white/50 hover:border-gray-300'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 bg-gray-900 text-white text-[10px] font-black rounded-md">{letter}</span>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{`Provision Slot`}</p>
              </div>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Drop Zone</span>
            </div>

            {!clause && (
              <div className="py-2 text-center">
                <p className="text-xs text-gray-400 font-medium italic">Drag a clause from the library panel and drop it here.</p>
              </div>
            )}

            {clause && (
              <div
                draggable
                onDragStart={() => handleDragStart(clause._id, 'bucket')}
                className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex flex-col items-center gap-1 text-blue-300 group-hover:text-blue-500 transition-colors">
                    <GripVertical size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h4 className="text-sm font-black text-gray-900 truncate">{clause.title}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          className="p-1 rounded bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 transition-colors"
                          onClick={(e) => { e.stopPropagation(); moveBucketClause(idx, 'up'); }}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === clauseBuckets.length - 1}
                          className="p-1 rounded bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 transition-colors"
                          onClick={(e) => { e.stopPropagation(); moveBucketClause(idx, 'down'); }}
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          className="ml-1 p-1 rounded bg-white border border-red-50 text-red-300 hover:text-red-600 hover:border-red-100 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleRemoveClause(clause._id); }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div
                      className="text-sm text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: substituteVariables(clause.body, offerData, formData, formatMoney) }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Template Document Renderer ───────────────────────────────────────────────
function TemplateDocument({
  templateHtml, offerData, formData, formatMoney,
  clauseBuckets, clausesById, hoveredBucketKey, setHoveredBucketKey,
  handleDropToBucket, dragState, handleDragStart, moveBucketClause,
  handleRemoveClause, addClauseBucket, isClauseLimitFinite, clauseLimit,
  baseTheme, customizations
}) {

  const { html, hasPortal } = useMemo(() => {
    if (!templateHtml) return { html: '', hasPortal: false };
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateHtml, 'text/html');

      // 1. Replace Tiptap Variables
      const variables = doc.querySelectorAll('span[data-type="variable"]');
      const samples = {
        // snake_case
        tenant_name: offerData?.tenant?.name || '[Tenant Name]',
        landlord_name: offerData?.landlord?.name || offerData?.property?.landlord?.name || '[Landlord Name]',
        property_title: offerData?.property?.title || '[Property Title]',
        property_address: offerData?.property?.address ? `${offerData.property.address.street}, ${offerData.property.address.city}` : '[Property Address]',
        rent_amount: formData?.rentAmount ? formatMoney(Number(formData.rentAmount)) : '[Rent Amount]',
        monthly_rent: formData?.rentAmount ? formatMoney(Number(formData.rentAmount)) : '[Monthly Rent]',
        security_deposit: formData?.depositAmount ? formatMoney(Number(formData.depositAmount)) : '[Security Deposit]',
        deposit_amount: formData?.depositAmount ? formatMoney(Number(formData.depositAmount)) : '[Deposit Amount]',
        total_move_in: (formData?.rentAmount && formData?.depositAmount) ? formatMoney(Number(formData.rentAmount) + Number(formData.depositAmount)) : '[Total Move-in]',
        maintenance_fee: formData?.maintenanceFee ? formatMoney(Number(formData.maintenanceFee)) : '[Maintenance Fee]',
        late_fee: (formData?.lateFeeAmount != null && formData.lateFeeAmount !== '') ? formatMoney(Number(formData.lateFeeAmount)) : '[Late Fee]',
        late_fee_amount: (formData?.lateFeeAmount != null && formData.lateFeeAmount !== '') ? formatMoney(Number(formData.lateFeeAmount)) : '[Late Fee Amount]',
        late_fee_grace_days: (formData?.lateFeeGracePeriodDays != null && formData.lateFeeGracePeriodDays !== '') ? `${formData.lateFeeGracePeriodDays} days` : '[Grace Period]',
        start_date: formData?.startDate ? new Date(formData.startDate).toLocaleDateString() : '[Start Date]',
        end_date: formData?.endDate ? new Date(formData.endDate).toLocaleDateString() : '[End Date]',
        duration_months: formData?.leaseDurationMonths || '[Duration]',
        utilities_included: formData?.utilitiesIncluded ? 'Included' : 'Not Included',
        utilities: formData?.utilitiesIncluded ? 'Included' : 'Not Included',
        utilities_details: formData?.utilitiesDetails || '[Utilities Details]',
        rent_escalation_enabled: formData?.rentEscalationEnabled ? 'Enabled' : 'Disabled',
        rent_escalation_percentage: formData?.rentEscalationEnabled
          ? `${formData.rentEscalationPercentage || 5}%`
          : 'N/A',
        pet_allowed: formData?.petAllowed ? 'Allowed' : 'Not Allowed',
        pet_policy: formData?.petAllowed ? 'Allowed' : 'Not Allowed',
        pet_deposit: formData?.petDeposit ? formatMoney(Number(formData.petDeposit)) : '[Pet Deposit]',
        termination_policy: formData?.terminationPolicy || '[Termination Policy]',
        current_date: new Date().toLocaleDateString(),
        agreement_id: '[Draft ID]',

        // camelCase aliases
        tenantName: offerData?.tenant?.name || '[Tenant Name]',
        landlordName: offerData?.landlord?.name || offerData?.property?.landlord?.name || '[Landlord Name]',
        propertyTitle: offerData?.property?.title || '[Property Title]',
        propertyAddress: offerData?.property?.address ? `${offerData.property.address.street}, ${offerData.property.address.city}` : '[Property Address]',
        rentAmount: formData?.rentAmount ? formatMoney(Number(formData.rentAmount)) : '[Rent Amount]',
        depositAmount: formData?.depositAmount ? formatMoney(Number(formData.depositAmount)) : '[Deposit Amount]',
        startDate: formData?.startDate ? new Date(formData.startDate).toLocaleDateString() : '[Start Date]',
        endDate: formData?.endDate ? new Date(formData.endDate).toLocaleDateString() : '[End Date]',
        lease_end_date: formData?.endDate ? new Date(formData.endDate).toLocaleDateString() : '[End Date]',
        leaseDuration: formData?.leaseDurationMonths || '[Duration]',
        maintenanceFee: formData?.maintenanceFee ? formatMoney(Number(formData.maintenanceFee)) : '[Maintenance Fee]',
        lateFeeAmount: (formData?.lateFeeAmount != null && formData.lateFeeAmount !== '') ? formatMoney(Number(formData.lateFeeAmount)) : '[Late Fee]',
        lateFeeGraceDays: (formData?.lateFeeGracePeriodDays != null && formData.lateFeeGracePeriodDays !== '') ? `${formData.lateFeeGracePeriodDays} days` : '[Grace Period]',
        currentDate: new Date().toLocaleDateString(),
        agreementId: '[Draft ID]',
      };

      variables.forEach(v => {
        const name = v.getAttribute('data-name');
        const replacement = samples[name] || `[${name}]`;
        const span = doc.createElement('strong');
        span.className = 'text-blue-700 font-extrabold bg-blue-50 px-1 rounded';
        span.innerText = replacement;
        v.parentNode.replaceChild(span, v);
      });

      // 2. Look for Placeholder and setup portal
      const placeholder = doc.querySelector('div[data-type="clauses-placeholder"]');
      if (placeholder) {
        const portalRoot = doc.createElement('div');
        portalRoot.id = 'clause-buckets-portal-root';
        placeholder.parentNode.replaceChild(portalRoot, placeholder);
        // 3. Remove first H1 (already pulled into hero-title)
        const firstH1 = doc.body.querySelector('h1');
        if (firstH1) firstH1.remove();

        return { html: doc.body.innerHTML, hasPortal: true };
      }

      // 3. Remove first H1 (already pulled into hero-title)
      const firstH1 = doc.body.querySelector('h1');
      if (firstH1) firstH1.remove();

      return { html: doc.body.innerHTML, hasPortal: false };
    } catch (error) {
      console.error('Template rendering error:', error);
      return { html: templateHtml, hasPortal: false };
    }
  }, [templateHtml, offerData, formData, formatMoney]);

  const containerRef = useRef(null);
  const lastInjectedHtml = useRef('');
  const [portalNode, setPortalNode] = useState(null);

  const { logoUrl: globalBrandingLogo } = useBranding();
  const { theme, themeVars, logoUrl } = useMemo(
    () => {
      const resolved = resolveThemeObject(baseTheme, customizations);
      // Fallback to global branding logo if no template customization exists
      if (!resolved.logoUrl) resolved.logoUrl = globalBrandingLogo;
      return resolved;
    },
    [baseTheme, customizations, globalBrandingLogo]
  );

  const layoutStyle = theme?.layoutStyle || 'minimalist';
  const laidOutHtml = useMemo(
    () => applyThemeLayout(html, layoutStyle),
    [html, layoutStyle]
  );

  useEffect(() => {
    // Debug: ensure resolved theme contains hero/table values while troubleshooting
    try {
      // eslint-disable-next-line no-console
      console.debug('[TemplateDocument] theme:', theme, 'themeVars:', themeVars);
    } catch (e) { }
  }, [theme, themeVars]);

  useEffect(() => {
    const fontUrl = theme?.fonts?.googleFontUrl;
    const linkId = 'agreement-template-theme-font';
    const existing = document.getElementById(linkId);
    if (existing) existing.remove();

    if (fontUrl) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
    }

    return () => {
      const el = document.getElementById(linkId);
      if (el) el.remove();
    };
  }, [theme?.fonts?.googleFontUrl]);

  useEffect(() => {
    if (!containerRef.current) return;

    const htmlContainer = containerRef.current.querySelector('#agreement-tiptap-html-container');
    if (htmlContainer && lastInjectedHtml.current !== laidOutHtml) {
      htmlContainer.innerHTML = laidOutHtml;
      lastInjectedHtml.current = laidOutHtml;
    }

    if (hasPortal) {
      const node = containerRef.current.querySelector('#clause-buckets-portal-root');
      if (node && node !== portalNode) {
        setPortalNode(node);
      }
    } else if (portalNode !== null) {
      setPortalNode(null);
    }
  }, [laidOutHtml, hasPortal, portalNode]);

  return (
    <div className="agreement-template-preview" ref={containerRef}>
      <style>{`
        ${generateLayoutCss(theme, themeVars)}
        .agreement-template-preview { display: flex; justify-content: center; padding: 40px 0; }
        .template-page { 
          transform: scale(0.9); 
          transform-origin: top center;
        }
      `}</style>
      <div className="agreement-preview-container theme-hero-band-host" style={themeVars}>
        <div 
          className={`template-page a4-page layout-${layoutStyle}`}
          style={{
            backgroundImage: theme?.textures?.pageBackground !== 'none' ? theme.textures.pageBackground : undefined,
          }}
        >
          {/* Unified Header System */}
          {(() => {
            const isHero = theme?.hero?.enabled;
            const t = theme;
            
            return (
              <div
                className={isHero ? "theme-hero-band" : "standard-header-box"}
                style={isHero ? {
                  height: t.hero.height,
                  minHeight: t.hero.height,
                  background: t.hero.background || t.colors.heroBackground || 'transparent',
                } : {}}
              >
                {logoUrl && (
                  <div className="hero-logo-container">
                    <img src={logoUrl} alt="Logo" className="hero-logo-img" />
                  </div>
                )}
                <div
                  className="hero-title"
                  style={{
                    fontFamily: t.fonts.heading,
                    color: isHero ? (t.hero.titleColor || '#FFFFFF') : t.colors.heading,
                    fontSize: isHero ? (t.hero.titleFontSize || '2.5rem') : `calc(2.25rem * ${t.spacing?.headingScale || 1})`,
                  }}
                >
                  {/* We rely on the CSS to hide the first H1 in the content layer if needed */}
                  {(() => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(templateHtml, 'text/html');
                    const h1 = doc.querySelector('h1');
                    return h1 ? h1.textContent : 'Agreement';
                  })()}
                </div>
              </div>
            );
          })()}

          <div className="content-layer agreement-tiptap-content">
            <div id="agreement-tiptap-html-container"></div>

          {hasPortal && portalNode && createPortal(
            <div className="not-prose my-10 border-2 border-dashed border-gray-100 rounded-2xl p-6 bg-gray-50/30">
              <ClauseBucketsSection
                clauseBuckets={clauseBuckets}
                clausesById={clausesById}
                hoveredBucketKey={hoveredBucketKey}
                setHoveredBucketKey={setHoveredBucketKey}
                handleDropToBucket={handleDropToBucket}
                handleDragStart={handleDragStart}
                moveBucketClause={moveBucketClause}
                handleRemoveClause={handleRemoveClause}
                addClauseBucket={addClauseBucket}
                isClauseLimitFinite={isClauseLimitFinite}
                clauseLimit={clauseLimit}
                offerData={offerData}
                formData={formData}
                formatMoney={formatMoney}
              />
            </div>,
            portalNode
          )}

          {(!hasPortal || !portalNode) && (
            <div className="not-prose mt-12 pt-12 border-t border-gray-100">
              <div className="mb-6 flex flex-col items-center opacity-30">
                <ScrollText className="text-gray-400" size={32} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2">End of Fixed Content</p>
              </div>
              <ClauseBucketsSection
                clauseBuckets={clauseBuckets}
                clausesById={clausesById}
                hoveredBucketKey={hoveredBucketKey}
                setHoveredBucketKey={setHoveredBucketKey}
                handleDropToBucket={handleDropToBucket}
                handleDragStart={handleDragStart}
                moveBucketClause={moveBucketClause}
                handleRemoveClause={handleRemoveClause}
                addClauseBucket={addClauseBucket}
                isClauseLimitFinite={isClauseLimitFinite}
                clauseLimit={clauseLimit}
                offerData={offerData}
                formData={formData}
                formatMoney={formatMoney}
              />
            </div>
          )}

          <div className="signature-preview">
            <h2>Signatures</h2>
            <div className="signature-preview-grid">
              <div>
                <p className="signature-preview-label">Landlord Signature</p>
                <div className="signature-preview-line"></div>
                <p className="signature-preview-name">{offerData?.landlord?.name || offerData?.property?.landlord?.name || 'Landlord'}</p>
              </div>
              <div>
                <p className="signature-preview-label">Tenant Signature</p>
                <div className="signature-preview-line"></div>
                <p className="signature-preview-name">{offerData?.tenant?.name || 'Tenant'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

function AgreementComposer({
  selectedClauseIds,
  onReorder,
  offerData,
  formData,
  showEditor = true,
  canUseClauses = false,
  clauseLimit = Number.POSITIVE_INFINITY,
  onClauseLimitReached = () => { },
  canUseAgreementTemplates = true,
  canSelectPdfTheme = true,
  formErrors = {},
  setField = () => { },
  clearFieldError = () => { },
  onOpenTemplate = () => { },
  onFinish = () => { },
  saving = false,
  onCancel = () => { },
  pdfSelection = null,
  templateHtml = '',
  loadingTemplate = false,
  templateTheme = null,
  templateCustomizations = null,
}) {
  const { formatMoney } = useCurrency();
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editorTab, setEditorTab] = useState('terms');
  const [dragState, setDragState] = useState(null);
  const [clauseBuckets, setClauseBuckets] = useState([makeBucket()]);
  const [hoveredBucketKey, setHoveredBucketKey] = useState('');
  const [panelPosition, setPanelPosition] = useState({ x: 24, y: 110 });
  const [draggingPanel, setDraggingPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const panelRef = useRef(null);
  const panelDragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobilePanelOpen(true);
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();
    if (jurisdictionFilter) params.set('jurisdiction', jurisdictionFilter);

    const query = params.toString();
    const endpoint = query ? `/agreements/clauses?${query}` : '/agreements/clauses';

    api.get(endpoint)
      .then(({ data }) => setClauses(data))
      .catch(() => setClauses([]))
      .finally(() => setLoading(false));
  }, [jurisdictionFilter]);

  const getClauseJurisdiction = (clause) => {
    const jurisdictionValue = clause?.jurisdiction;
    if (typeof jurisdictionValue === 'string') return jurisdictionValue.trim();

    return String(
      clause?.jurisdiction?.region ||
      ''
    ).trim();
  };

  const clauseBasePool = clauses.filter((c) =>
    !selectedClauseIds.includes(c._id) &&
    (!categoryFilter || c.category === categoryFilter) &&
    (!search || `${c.title} ${c.body}`.toLowerCase().includes(search.toLowerCase()))
  );

  const jurisdictionOptionsPool = clauseBasePool;

  const availableClauses = clauseBasePool.filter((c) =>
    (!jurisdictionFilter || getClauseJurisdiction(c).toLowerCase() === jurisdictionFilter.toLowerCase())
  );
  const categories = [...new Set(clauses.map(c => c.category))].sort();
  const jurisdictions = [...new Set(jurisdictionOptionsPool.map((c) => getClauseJurisdiction(c)).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (jurisdictionFilter && !jurisdictions.includes(jurisdictionFilter)) {
      setJurisdictionFilter('');
    }
  }, [jurisdictionFilter, jurisdictions]);

  const clausesById = new Map(clauses.map(c => [c._id, c]));
  const assignedClauses = selectedClauseIds.map(id => clausesById.get(id)).filter(Boolean);
  const isClauseLimitFinite = Number.isFinite(clauseLimit);
  const isClauseCapReached = isClauseLimitFinite && assignedClauses.length >= clauseLimit;
  const leaseDurationMonths = offerData?.history?.length
    ? offerData.history[offerData.history.length - 1]?.leaseDurationMonths
    : null;

  const pushBucketUpdate = (nextBuckets) => {
    const normalized = nextBuckets.map((b) => ({ ...b, clauseId: b.clauseId ? String(b.clauseId) : null }));
    setClauseBuckets(normalized);
    const nextIds = normalized.map((b) => b.clauseId).filter(Boolean);
    const currentIds = selectedClauseIds.map((id) => String(id));
    if (!arraysEqual(nextIds, currentIds)) {
      onReorder(nextIds);
    }
  };

  const handleDragStart = (clauseId, origin) => {
    setDragState({ clauseId, origin });
  };

  const handleDropToBucket = (bucketKey) => {
    if (!dragState?.clauseId) return;
    const clauseId = String(dragState.clauseId);

    const currentTarget = clauseBuckets.find((b) => b.key === bucketKey);
    const clauseAlreadyAssigned = clauseBuckets.some((b) => String(b.clauseId || '') === clauseId);
    const wouldIncreaseAssignedCount = !clauseAlreadyAssigned && !currentTarget?.clauseId;
    if (isClauseLimitFinite && wouldIncreaseAssignedCount && selectedClauseIds.length >= clauseLimit) {
      onClauseLimitReached(clauseLimit);
      setHoveredBucketKey('');
      setDragState(null);
      return;
    }

    const next = clauseBuckets.map((b) => ({ ...b, clauseId: b.clauseId === clauseId ? null : b.clauseId }));
    const targetIndex = next.findIndex((b) => b.key === bucketKey);
    if (targetIndex >= 0) next[targetIndex] = { ...next[targetIndex], clauseId };
    pushBucketUpdate(next);
    setHoveredBucketKey('');
    setDragState(null);
  };

  const handleRemoveClause = (clauseId) => {
    const id = String(clauseId);
    const next = clauseBuckets.map((b) => (b.clauseId === id ? { ...b, clauseId: null } : b));
    pushBucketUpdate(next);
  };

  const moveBucketClause = (bucketIndex, direction) => {
    const toIndex = direction === 'up' ? bucketIndex - 1 : bucketIndex + 1;
    if (bucketIndex < 0 || toIndex < 0 || toIndex >= clauseBuckets.length) return;
    const next = [...clauseBuckets];
    const currentId = next[bucketIndex].clauseId;
    next[bucketIndex] = { ...next[bucketIndex], clauseId: next[toIndex].clauseId };
    next[toIndex] = { ...next[toIndex], clauseId: currentId };
    pushBucketUpdate(next);
  };

  const addClauseBucket = () => {
    if (isClauseLimitFinite && clauseBuckets.length >= clauseLimit) {
      onClauseLimitReached(clauseLimit);
      return;
    }
    pushBucketUpdate([...clauseBuckets, makeBucket()]);
  };

  const handlePanelMouseDown = (e) => {
    if (isMobile) return;
    if (e.button !== 0) return;
    const panelRect = panelRef.current?.getBoundingClientRect();
    if (!panelRect) return;

    e.preventDefault();

    panelDragOffsetRef.current = {
      x: e.clientX - panelRect.left,
      y: e.clientY - panelRect.top,
    };
    setDraggingPanel(true);
  };

  useEffect(() => {
    if (isMobile) return;
    if (!draggingPanel) return;

    const handleMouseMove = (e) => {
      const panelRect = panelRef.current?.getBoundingClientRect();
      if (!panelRect) return;

      const rawX = e.clientX - panelDragOffsetRef.current.x;
      const rawY = e.clientY - panelDragOffsetRef.current.y;

      const maxX = Math.max(8, window.innerWidth - panelRect.width - 8);
      const maxY = Math.max(8, window.innerHeight - panelRect.height - 8);

      setPanelPosition({
        x: Math.min(Math.max(8, rawX), maxX),
        y: Math.min(Math.max(8, rawY), maxY),
      });
    };

    const handleMouseUp = () => setDraggingPanel(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPanel, isMobile]);

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-[#eef1ef] overflow-hidden min-h-[75vh]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_10%,rgba(37,99,235,0.10),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(22,163,74,0.08),transparent_40%)]" />

      <div className={`relative z-10 h-[75vh] overflow-y-auto p-4 sm:p-6 lg:p-8 xl:pl-8 ${isMobile ? 'pb-64' : ''}`}>
        <div className="max-w-4xl mx-auto">
          <div className="sticky top-0 z-10 mb-3 bg-white/80 backdrop-blur border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Agreement</p>
              <p className="text-sm text-gray-600">Styled as final document preview. Updates instantly as you edit.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Selector Row (Step 6.2) */}
              {canSelectPdfTheme && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full mr-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Theme:</span>
                  {VISUAL_THEMES.filter(t => t.id !== 'blank').slice(0, 8).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onOpenTemplate(); // Reuse picker logic or directly set theme
                        // For now, since we have templateTheme state in parent, 
                        // we might need a direct callback. But if we want it 
                        // simple, we just show they can click the template button.
                      }}
                      title={t.name}
                      className={`w-4 h-4 rounded-full border transition-all ${((templateTheme?.id || templateTheme) === t.id) ? 'ring-2 ring-blue-500 scale-110' : 'border-gray-300 hover:scale-110'}`}
                      style={{ background: t.preview?.primarySwatch || t.colors?.primary }}
                    />
                  ))}
                </div>
              )}
              
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
                {selectedClauseIds.length} clause{selectedClauseIds.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#d9ddd9] bg-[#f3f5f4] p-4 sm:p-6 shadow-sm min-h-[1000px]">
            <div className="mx-auto w-full bg-white border border-[#d7d7d7] shadow-[0_18px_38px_rgba(15,23,42,0.12)]">

              {loadingTemplate ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                  <Loader2 className="animate-spin w-8 h-8" />
                  <p className="text-sm font-medium">Loading document template...</p>
                </div>
              ) : templateHtml ? (
                /* ── Template-Driven Layout ── */
                <TemplateDocument
                  templateHtml={templateHtml}
                  offerData={offerData}
                  formData={formData}
                  formatMoney={formatMoney}
                  clauseBuckets={clauseBuckets}
                  clausesById={clausesById}
                  hoveredBucketKey={hoveredBucketKey}
                  setHoveredBucketKey={setHoveredBucketKey}
                  handleDropToBucket={handleDropToBucket}
                  dragState={dragState}
                  handleDragStart={handleDragStart}
                  moveBucketClause={moveBucketClause}
                  handleRemoveClause={handleRemoveClause}
                  addClauseBucket={addClauseBucket}
                  isClauseLimitFinite={isClauseLimitFinite}
                  clauseLimit={clauseLimit}
                  baseTheme={templateTheme}
                  customizations={templateCustomizations}
                />
              ) : (
                /* ── Legacy / Fallback Layout ── */
                <div className="px-8 sm:px-12 py-10 sm:py-12">
                  <div className="space-y-10">
                    <div className="text-center border-b border-gray-200 pb-8">
                      <p className="text-[11px] tracking-[0.25em] text-gray-400 uppercase font-bold">Residential Lease Contract</p>
                      <h3 className="mt-4 text-3xl font-black text-gray-900 tracking-tight">Rental Agreement</h3>
                      <p className="mt-2 text-sm text-gray-500 font-medium">Draft Version · Final Review Pending</p>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-xl bg-gray-50/50 border border-gray-100 p-6">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">I. Parties and Property</p>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-800">This agreement is made between <strong>{offerData?.landlord?.name || offerData?.property?.landlord?.name || 'Landlord'}</strong> and <strong>{offerData?.tenant?.name || 'Tenant'}</strong>.</p>
                          <p className="text-sm text-gray-800">The premises are located at: <strong>{offerData?.property?.title || 'Property'}{offerData?.property?.address?.street ? `, ${offerData.property.address.street}, ${offerData.property.address.city}` : ''}</strong>.</p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-gray-50/50 border border-gray-100 p-6">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">II. Core Lease Terms</p>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Start Date</p>
                            <p className="text-sm text-gray-800 font-bold">{formData?.startDate || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">End Date</p>
                            <p className="text-sm text-gray-800 font-bold">{formData?.endDate || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Monthly Rent</p>
                            <p className="text-sm text-gray-800 font-bold">{formatMoney(Number(formData?.rentAmount || 0))}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Security Deposit</p>
                            <p className="text-sm text-gray-800 font-bold">{formatMoney(Number(formData?.depositAmount || 0))}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-gray-50/50 border border-gray-100 p-6">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">III. Standard Policies</p>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Pets</p>
                            <p className="text-sm text-gray-800 font-bold">{formData?.petAllowed ? `Allowed (${formatMoney(Number(formData?.petDeposit || 0))} dep)` : 'Strictly Prohibited'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Utilities</p>
                            <p className="text-sm text-gray-800 font-bold">{formData?.utilitiesIncluded ? 'Landlord Paid' : 'Tenant Paid'}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Termination Policy</p>
                          <p className="text-sm text-gray-800 mt-1 leading-relaxed">{formData?.terminationPolicy || 'Standard 30-day notice applies.'}</p>
                        </div>
                      </div>
                    </div>

                    <ClauseBucketsSection
                      clauseBuckets={clauseBuckets}
                      clausesById={clausesById}
                      hoveredBucketKey={hoveredBucketKey}
                      setHoveredBucketKey={setHoveredBucketKey}
                      handleDropToBucket={handleDropToBucket}
                      handleDragStart={handleDragStart}
                      moveBucketClause={moveBucketClause}
                      handleRemoveClause={handleRemoveClause}
                      addClauseBucket={addClauseBucket}
                      isClauseLimitFinite={isClauseLimitFinite}
                      clauseLimit={clauseLimit}
                      offerData={offerData}
                      formData={formData}
                      formatMoney={formatMoney}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {showEditor && (
        <div
          ref={panelRef}
          className={isMobile ? `fixed z-[70] left-2 right-2 bottom-2 ${mobilePanelOpen ? 'max-h-[72vh]' : 'max-h-[170px]'}` : 'fixed z-[70] w-[330px] max-w-[calc(100%-1rem)]'}
          style={isMobile ? undefined : { left: panelPosition.x, top: panelPosition.y }}
        >
          <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-2xl shadow-xl overflow-hidden h-full">
            <div onMouseDown={handlePanelMouseDown} className="px-4 py-3 border-b bg-gray-50 cursor-move select-none flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Editor</p>
                <p className="text-sm font-semibold text-gray-800">Clause Library</p>
              </div>
              <div className="flex items-center gap-2">
                {isMobile && (
                  <button
                    type="button"
                    onClick={() => setMobilePanelOpen((v) => !v)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {mobilePanelOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                )}
                {!isMobile && <GripVertical className="w-4 h-4 text-gray-400" />}
              </div>
            </div>

            <div className="px-3 py-2 border-b bg-white">
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg">
                {[
                  { key: 'terms', label: 'Terms', locked: false },
                  { key: 'library', label: 'Library', locked: !canUseClauses },
                  { key: 'selected', label: 'Selected', locked: !canUseClauses },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => { if (!tab.locked) setEditorTab(tab.key); }}
                    className={`text-[11px] py-1.5 rounded-md font-semibold transition ${editorTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${tab.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-2.5 py-2 text-[11px] text-green-800">
                <p className="font-semibold">Offer: {offerData?.tenant?.name || 'Tenant'} · {formatMoney(Number(formData?.rentAmount || 0))}/mo</p>
                <p className="text-green-700">{offerData?.property?.title || 'Property'} · {leaseDurationMonths || '—'} months</p>
              </div>
            </div>

            {(!isMobile || mobilePanelOpen) && (
              <>
                <div className={`p-3 space-y-3 overflow-y-auto ${isMobile ? 'max-h-[38vh]' : 'max-h-[62vh]'}`}>
                  {editorTab === 'terms' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => { setField('startDate', e.target.value); clearFieldError('startDate'); }}
                            className={`w-full rounded-md border px-2 py-1.5 text-xs ${formErrors.startDate ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">End Date</label>
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => { setField('endDate', e.target.value); clearFieldError('endDate'); }}
                            className={`w-full rounded-md border px-2 py-1.5 text-xs ${formErrors.endDate ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Rent</label>
                          <input value={formData.rentAmount} disabled className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs bg-gray-50 text-gray-500" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Deposit</label>
                          <input value={formData.depositAmount} disabled className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs bg-gray-50 text-gray-500" />
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-2.5 space-y-2">
                        <Toggle
                          enabled={formData.rentEscalationEnabled}
                          onChange={(v) => setField('rentEscalationEnabled', v)}
                          label="Annual Escalation"
                          description="Increase each anniversary"
                        />
                        {formData.rentEscalationEnabled && (
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={formData.rentEscalationPercentage}
                            onChange={(e) => setField('rentEscalationPercentage', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                            placeholder="Escalation %"
                          />
                        )}
                        <Toggle
                          enabled={formData.petAllowed}
                          onChange={(v) => setField('petAllowed', v)}
                          label="Pets Allowed"
                        />
                        {formData.petAllowed && (
                          <input
                            type="number"
                            min="0"
                            value={formData.petDeposit}
                            onChange={(e) => setField('petDeposit', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                            placeholder="Pet deposit"
                          />
                        )}
                        <Toggle
                          enabled={formData.utilitiesIncluded}
                          onChange={(v) => setField('utilitiesIncluded', v)}
                          label="Utilities Included"
                        />
                        {formData.utilitiesIncluded && (
                          <input
                            type="text"
                            value={formData.utilitiesDetails}
                            onChange={(e) => setField('utilitiesDetails', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                            placeholder="Utilities details"
                          />
                        )}
                        <textarea
                          rows={2}
                          value={formData.terminationPolicy}
                          onChange={(e) => setField('terminationPolicy', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs resize-none"
                          placeholder="Termination policy"
                        />
                      </div>
                    </div>
                  )}

                  {editorTab === 'library' && (
                    <>
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search title or content..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Jurisdiction</label>
                          <select
                            value={jurisdictionFilter}
                            onChange={(e) => setJurisdictionFilter(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">All jurisdictions</option>
                            {jurisdictions.map((jurisdiction) => (
                              <option key={jurisdiction} value={jurisdiction}>{jurisdiction}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          <button type="button" onClick={() => setCategoryFilter('')}
                            className={`text-[11px] px-2.5 py-1 rounded-full border ${!categoryFilter ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                            All
                          </button>
                          {categories.map(cat => (
                            <button key={cat} type="button" onClick={() => setCategoryFilter(cat)}
                              className={`text-[11px] px-2.5 py-1 rounded-full border capitalize ${categoryFilter === cat ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                              {cat.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {loading && (
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-6">
                            <Loader2 className="animate-spin w-3.5 h-3.5" /> Loading clauses...
                          </div>
                        )}
                        {!loading && clauses.length === 0 && (
                          <p className="text-xs text-gray-400 py-3 text-center italic">
                            No approved clauses available yet. Ask admin to approve clauses.
                          </p>
                        )}
                        {!loading && clauses.length > 0 && availableClauses.length === 0 && (
                          <p className="text-sm text-gray-400 py-3 text-center italic">No matching clauses found.</p>
                        )}
                        {!loading && availableClauses.map((clause) => (
                          <div
                            key={clause._id}
                            draggable
                            onDragStart={() => handleDragStart(clause._id, 'library')}
                            className="border rounded-lg border-gray-200 hover:border-blue-300 transition bg-white p-2.5 cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-xs text-gray-900 truncate">{clause.title}</p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
                                    {clause.category?.replace(/_/g, ' ')}
                                  </span>
                                  {getClauseJurisdiction(clause) && (
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                      {getClauseJurisdiction(clause)}
                                    </span>
                                  )}
                                  {clause.isDefault && (
                                    <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Recommended</span>
                                  )}
                                </div>
                              </div>
                              <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {editorTab === 'selected' && (
                    <>
                      <p className="text-xs text-gray-500">Assigned clauses: <strong>{assignedClauses.length}</strong></p>
                      <div className="space-y-2">
                        {assignedClauses.length === 0 && (
                          <p className="text-xs text-gray-400 italic">No clauses assigned yet.</p>
                        )}
                        {assignedClauses.map((clause) => (
                          <div key={clause._id} className="border border-gray-200 rounded-lg p-2.5 bg-white">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-gray-800 truncate">{clause.title}</p>
                              <button
                                type="button"
                                onClick={() => handleRemoveClause(clause._id)}
                                className="text-[10px] px-2 py-0.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {!canUseClauses && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-[11px] text-blue-700">
                      Clause drag-and-drop is available on Pro/Enterprise plans.
                    </div>
                  )}

                  {isClauseLimitFinite && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800">
                      Free plan limit: up to {clauseLimit} clauses per agreement. Upgrade to Pro for unlimited clauses.
                    </div>
                  )}

                  {pdfSelection && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-2.5 text-[11px] text-green-700 flex items-center justify-between gap-2">
                      <span>PDF {pdfSelection.type === 'template' ? 'template' : 'theme'}: <strong>{pdfSelection.name}</strong></span>
                    </div>
                  )}
                </div>
              </>
            )}

            {(!isMobile || mobilePanelOpen) && (
              <div className="px-3 py-2.5 border-t bg-gray-50 flex items-center gap-2">
                {canUseAgreementTemplates ? (
                  <button
                    type="button"
                    onClick={onOpenTemplate}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    {pdfSelection?.type === 'template' ? `Template: ${pdfSelection.name}` : 'Select My Template'}
                  </button>
                ) : (
                  <span className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed">
                    Using Admin Default Template
                  </span>
                )}
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 border border-gray-300 bg-white rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onFinish}
                  disabled={saving}
                  className="ml-auto px-3 py-1.5 text-[11px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Finish Draft'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
function AgreementForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useUser();
  const offerId = searchParams.get('offerId');

  const normalizedTier = String(user?.subscriptionTier || '').trim().toLowerCase();
  const tier = ['free', 'pro', 'enterprise'].includes(normalizedTier)
    ? normalizedTier
    : 'free';
  const canUseAgreementTemplates = tier === 'enterprise';
  const clauseLimit = tier === 'free' ? 2 : Number.POSITIVE_INFINITY;
  const canUseClauses = true; // Everyone can pick and use clauses up to their tier limit
  const canSelectPdfTheme = tier === 'enterprise';

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedClauseIds, setSelectedClauseIds] = useState([]);
  const [createdAgreementId, setCreatedAgreementId] = useState(null);
  const [savingClauses, setSavingClauses] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [offerData, setOfferData] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templateHtml, setTemplateHtml] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [pdfSelection, setPdfSelection] = useState(null);
  const [globalDefaultHtml, setGlobalDefaultHtml] = useState(''); // preloaded global template
  const [globalDefaultTheme, setGlobalDefaultTheme] = useState(null);
  const [globalDefaultCustomizations, setGlobalDefaultCustomizations] = useState(null);
  const [templateTheme, setTemplateTheme] = useState(null);
  const [templateCustomizations, setTemplateCustomizations] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { logoUrl: globalBrandingLogo } = useBranding();

  useEffect(() => { setMounted(true); }, []);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    rentAmount: '',
    depositAmount: '',
    leaseDurationMonths: '',
    maintenanceFee: '',
    lateFeeAmount: '0',
    lateFeeGracePeriodDays: '5',
    rentEscalationEnabled: false,
    rentEscalationPercentage: '5',
    // ── New fields ────────────────────────────────────────────────────────────
    petAllowed: false,
    petDeposit: '',
    utilitiesIncluded: false,
    utilitiesDetails: '',
    terminationPolicy: '',
  });

  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const normalizeClauseIds = (ids = []) => Array.from(new Set(ids.map((id) => String(id))));

  // Pre-load offer details
  useEffect(() => {
    if (!offerId) return;
    setLoading(true);
    api.get(`/offers/${offerId}`)
      .then(({ data }) => {
        const lastRound = Array.isArray(data.history) && data.history.length ? data.history[data.history.length - 1] : null;
        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + (lastRound?.leaseDurationMonths || 12));
        setOfferData(data);
        setFormData(prev => ({
          ...prev,
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          rentAmount: String(lastRound?.monthlyRent || ''),
          depositAmount: String(lastRound?.securityDeposit || ''),
          leaseDurationMonths: String(lastRound?.leaseDurationMonths || ''),
          lateFeeAmount: String(data.property?.financials?.lateFeeAmount || 0),
          lateFeeGracePeriodDays: String(data.property?.financials?.lateFeeGracePeriodDays || 5),
          maintenanceFee: String(data.property?.financials?.maintenanceFee || ''),
        }));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [offerId]);

  // Load global default agreement template on mount (used as default live preview)
  useEffect(() => {
    api.get('/agreement-templates/available')
      .then(({ data }) => {
        const defaultAgreement = Array.isArray(data?.globalDefaults)
          ? data.globalDefaults.find((t) => t.templateType === 'agreement')
          : null;
        if (defaultAgreement?.bodyHtml) {
          setGlobalDefaultHtml(defaultAgreement.bodyHtml);
          setTemplateHtml(defaultAgreement.bodyHtml);

          if (defaultAgreement.baseTheme) {
            setGlobalDefaultTheme(defaultAgreement.baseTheme);
            setTemplateTheme(defaultAgreement.baseTheme);
          }

          const logo = defaultAgreement?.customizations?.logoUrl || 
                       defaultAgreement?.customizations?.customLogo || 
                       defaultAgreement?.logoUrl || 
                       defaultAgreement?.customLogo || 
                       defaultAgreement?.brandingLogo || 
                       defaultAgreement?.templateLogo || '';

          const customs = {
            ...(defaultAgreement?.customizations || {}),
            logoUrl: logo
          };
          setGlobalDefaultCustomizations(customs);
          setTemplateCustomizations(customs);
        }
      })
      .catch(() => { });
  }, []);

  // When user picks an enterprise custom template or a global PDF theme, load its data
  useEffect(() => {
    if (pdfSelection?.type === 'template' && pdfSelection.id) {
      setLoadingTemplate(true);
      api.get(`/agreement-templates/${pdfSelection.id}`)
        .then(({ data }) => {
          // The API wraps data inside `data.data` in some routes, handle both
          const doc = data?.data || data;
          const html = doc?.bodyHtml || '';
          setTemplateHtml(html);
          setTemplateTheme(doc?.baseTheme || null);
          const logo = doc?.customizations?.logoUrl || 
                       doc?.customizations?.customLogo || 
                       doc?.logoUrl || 
                       doc?.customLogo || 
                       doc?.brandingLogo || 
                       doc?.templateLogo || '';

          setTemplateCustomizations({
            ...(doc?.customizations || {}),
            logoUrl: logo
          });
        })
        .catch(() => {
          setTemplateHtml(globalDefaultHtml);
          setTemplateTheme(globalDefaultTheme);
          setTemplateCustomizations(globalDefaultCustomizations);
        })
        .finally(() => setLoadingTemplate(false));
    } else if (pdfSelection?.type === 'theme' && pdfSelection.id) {
      // Fetch the selected global theme so the live preview can apply its
      // hero gradient, table colours, typography, etc. 
      // We PRESERVE the current templateHtml and templateCustomizations 
      // so the theme is applied ON TOP of the selected template.
      api.get(`/pdf-themes/${pdfSelection.id}`)
        .then(({ data }) => {
          const theme = data?.data || data;
          setTemplateTheme(theme || null);
          // Do NOT clear templateCustomizations here, as we want to keep 
          // template-specific branding (like logos) if a template is active.
        })
        .catch(() => {
          setTemplateTheme(globalDefaultTheme);
        });
    } else if (!pdfSelection) {
      // Reset back to global default when deselected
      setTemplateHtml(globalDefaultHtml);
      setTemplateTheme(globalDefaultTheme);
      setTemplateCustomizations(globalDefaultCustomizations);
    }
  }, [pdfSelection, globalDefaultHtml, globalDefaultTheme, globalDefaultCustomizations]);

  // ── Build the accept-offer payload (single source of truth) ────────────────
  const buildAcceptPayload = () => ({
    startDate: formData.startDate,
    petAllowed: formData.petAllowed,
    petDeposit: formData.petAllowed ? Number(formData.petDeposit) || 0 : 0,
    utilitiesIncluded: formData.utilitiesIncluded,
    utilitiesDetails: formData.utilitiesIncluded ? formData.utilitiesDetails : '',
    terminationPolicy: formData.terminationPolicy,
    rentEscalationEnabled: formData.rentEscalationEnabled,
    rentEscalationPercentage: Number(formData.rentEscalationPercentage) || 5,
    ...(canUseAgreementTemplates && pdfSelection?.type === 'template' ? { templateId: pdfSelection.id } : {}),
    ...(canSelectPdfTheme && pdfSelection?.type === 'theme' ? { pdfTheme: pdfSelection.id } : {}),
    logoUrl: templateCustomizations?.logoUrl || 
             templateCustomizations?.customLogo || 
             templateCustomizations?.logo || 
             templateCustomizations?.brandingLogo || 
             globalBrandingLogo || '',
  });

  const validateAgreementForm = () => {
    const errors = {};
    const start = formData.startDate ? new Date(formData.startDate) : null;
    const end = formData.endDate ? new Date(formData.endDate) : null;

    if (!formData.startDate) errors.startDate = 'Start date is required.';
    if (!formData.endDate) errors.endDate = 'End date is required.';
    if (start && end && end <= start) errors.endDate = 'End date must be after start date.';

    const rent = Number(formData.rentAmount);
    const deposit = Number(formData.depositAmount);
    if (!formData.rentAmount || isNaN(rent) || rent <= 0) errors.rentAmount = 'Rent must be a positive number.';
    if (!formData.depositAmount || isNaN(deposit) || deposit < 0) errors.depositAmount = 'Deposit must be 0 or more.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReorderClauses = (reorderedIds) => {
    const normalized = normalizeClauseIds(reorderedIds);
    if (Number.isFinite(clauseLimit) && normalized.length > clauseLimit) {
      toast(`Free plan can include up to ${clauseLimit} clauses. Upgrade to Pro for unlimited clauses.`, 'error');
      setSelectedClauseIds(normalized.slice(0, clauseLimit));
      return;
    }
    setSelectedClauseIds(normalized);
  };

  const handleApplyTemplate = (selection) => {
    if (selection?.type === 'template' && !canUseAgreementTemplates) {
      toast('Agreement templates in drafting are available on Enterprise only.', 'error');
      setShowTemplatePicker(false);
      return;
    }
    setPdfSelection(selection);
    setShowTemplatePicker(false);
  };

  useEffect(() => {
    if (pdfSelection?.type === 'template' && !canUseAgreementTemplates) {
      setPdfSelection(null);
    }
  }, [canUseAgreementTemplates, pdfSelection]);

  const handleClauseLimitReached = (limit) => {
    toast(`Free plan can include up to ${limit} clauses. Upgrade to Pro for unlimited clauses.`, 'error');
  };

  const handleSaveClauses = async () => {
    if (!validateAgreementForm()) {
      toast('Please fix lease term errors before finishing the draft.', 'error');
      return;
    }
    if (Number.isFinite(clauseLimit) && selectedClauseIds.length > clauseLimit) {
      toast(`Free plan can include up to ${clauseLimit} clauses.`, 'error');
      return;
    }
    setSavingClauses(true);
    try {
      let createdId = createdAgreementId;

      if (!createdId) {
        if (!offerId) { toast('Offer ID is required to draft an agreement.', 'error'); return; }
        const { data } = await api.put(`/offers/${offerId}/accept`, buildAcceptPayload());
        createdId = data.agreement._id;
        setCreatedAgreementId(createdId);
      }

      if (selectedClauseIds.length > 0) {
        await api.put(`/agreements/${createdId}/clauses`, { clauseIds: selectedClauseIds });
      }
      router.push('/dashboard/agreements');
    } catch (error) {
      toast(error.response?.data?.message || 'Failed to save agreement', 'error');
    } finally {
      setSavingClauses(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto py-4 px-2 sm:px-4">

      {/* No offerId guard */}
      {!offerId && (
        <div className="bg-white shadow rounded-lg p-10 text-center flex flex-col items-center max-w-lg mx-auto mt-10">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <LayoutTemplate className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Start from an Offer</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            To create a valid agreement, you must first accept an offer from a prospective tenant. The agreement will be automatically populated with the negotiated rent and terms.
          </p>
          <button
            onClick={() => router.push('/dashboard/offers')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium w-full sm:w-auto"
          >
            View Applications & Offers
          </button>
        </div>
      )}

      {offerId && (
        <>
          <div className="mb-8">
            <LocalErrorBoundary>
              <AgreementComposer
                selectedClauseIds={selectedClauseIds}
                onReorder={handleReorderClauses}
                offerData={offerData}
                formData={formData}
                showEditor={true}
                canUseClauses={canUseClauses}
                clauseLimit={clauseLimit}
                onClauseLimitReached={handleClauseLimitReached}
                canUseAgreementTemplates={canUseAgreementTemplates}
                canSelectPdfTheme={canSelectPdfTheme}
                formErrors={formErrors}
                setField={set}
                clearFieldError={(key) => setFormErrors((prev) => ({ ...prev, [key]: null }))}
                onOpenTemplate={() => {
                  if (!canUseAgreementTemplates && !canSelectPdfTheme) {
                    toast('Pro and Free tiers use the admin global default PDF theme.', 'error');
                    return;
                  }
                  setShowTemplatePicker(true);
                }}
                onFinish={handleSaveClauses}
                saving={savingClauses}
                onCancel={() => router.push('/dashboard/agreements')}
                pdfSelection={pdfSelection}
                templateHtml={templateHtml}
                loadingTemplate={loadingTemplate}
                templateTheme={templateTheme}
                templateCustomizations={templateCustomizations}
              />
            </LocalErrorBoundary>
          </div>

          {showTemplatePicker && (
            <TemplatePicker
              onApply={handleApplyTemplate}
              onClose={() => setShowTemplatePicker(false)}
              canUseTemplates={canUseAgreementTemplates}
              canUseThemes={canSelectPdfTheme}
            />
          )}

          {showPDFPreview && createdAgreementId && (
            <InlinePDFPreview
              agreementId={createdAgreementId}
              onClose={() => setShowPDFPreview(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgreementForm />
    </Suspense>
  );
}

// Local Error Boundary to catch render/runtime errors inside the composer
class LocalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Log details to console so the stack is available in client logs
    console.error('[LocalErrorBoundary] Caught error in Agreement composer', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <div className="font-bold mb-2">An error occurred while rendering the Agreement editor.</div>
          <div className="mb-3">The error has been logged to the browser console for debugging.</div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.location.reload()} className="px-3 py-1 bg-white border rounded">Reload page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}