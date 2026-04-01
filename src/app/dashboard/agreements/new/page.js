'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { useUser } from '@/context/UserContext';
import {
  Search, UserCheck, Calendar, FileText, Loader2,
  CheckSquare, Square, ChevronDown, ChevronUp, Tag,
  GripVertical, Eye, EyeOff, AlertTriangle, X, LayoutTemplate,
  ArrowRight, CheckCircle2, PawPrint, Zap, ScrollText,
} from 'lucide-react';

// ─── Flow Tracker ─────────────────────────────────────────────────────────────
function FlowTracker({ offerData }) {
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
        ? `${offerData.history?.length} round${offerData.history?.length !== 1 ? 's' : ''} · $${offerData.history?.[offerData.history.length - 1]?.monthlyRent?.toLocaleString()}/mo`
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
function TemplatePicker({ onApply, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    api.get('/agreement-templates')
      .then(({ data }) => {
        const tpls = data.templates || data;
        setTemplates(Array.isArray(tpls) ? tpls.filter(t => t.status === 'approved') : []);
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (tpl) => {
    setApplying(tpl._id);
    try {
      await api.post(`/agreement-templates/${tpl._id}/use`);
      const clauseIds = (tpl.clauseIds || []).map(c => c._id || c);
      onApply(clauseIds, tpl.name);
    } catch {
      const clauseIds = (tpl.clauseIds || []).map(c => c._id || c);
      onApply(clauseIds, tpl.name);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <LayoutTemplate className="w-5 h-5 text-blue-600" />
            Agreement Templates
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
              <Loader2 className="animate-spin w-5 h-5" /> Loading templates…
            </div>
          )}
          {!loading && templates.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8 italic">
              No approved templates available. Ask an admin to create and approve templates.
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
                  <p className="text-xs text-blue-600 mt-1">
                    {(tpl.clauseIds || []).length} clause{(tpl.clauseIds || []).length !== 1 ? 's' : ''} included
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelect(tpl)}
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
            Applying a template loads its clauses. You can still add or remove individual clauses after.
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
function substituteVariables(text, offer, form) {
  if (!text) return '';
  let replaced = text;

  const petLabel = form?.petAllowed ? 'Pets allowed' : 'No pets';
  const petDeposit = form?.petAllowed && form?.petDeposit
    ? `$${Number(form.petDeposit).toLocaleString()}`
    : 'N/A';
  const utilities = form?.utilitiesIncluded ? 'Utilities included' : 'Utilities not included';
  const utilDetails = form?.utilitiesDetails || '';
  const termPolicy = form?.terminationPolicy || '';

  const rules = {
    // camelCase tokens (used by the admin clause builder)
    '{{tenantName}}': offer?.tenant?.name || '[Tenant Name]',
    '{{landlordName}}': offer?.property?.landlord?.name || '[Landlord Name]',
    '{{propertyTitle}}': offer?.property?.title || '[Property Title]',
    '{{propertyAddress}}': offer?.property?.address ? `${offer.property.address.street}, ${offer.property.address.city}` : '[Property Address]',
    '{{startDate}}': form?.startDate ? new Date(form.startDate).toLocaleDateString() : '[Start Date]',
    '{{endDate}}': form?.endDate ? new Date(form.endDate).toLocaleDateString() : '[End Date]',
    '{{rentAmount}}': form?.rentAmount ? `$${Number(form.rentAmount).toLocaleString()}` : '[Rent Amount]',
    '{{depositAmount}}': form?.depositAmount ? `$${Number(form.depositAmount).toLocaleString()}` : '[Deposit Amount]',
    '{{lateFeeAmount}}': form?.lateFeeAmount ? `$${Number(form.lateFeeAmount).toLocaleString()}` : '[Late Fee]',
    '{{lateFeeGraceDays}}': form?.lateFeeGracePeriodDays ? `${form.lateFeeGracePeriodDays} days` : '[Grace Period]',
    '{{petPolicy}}': petLabel,
    '{{petDeposit}}': petDeposit,
    '{{utilities}}': utilities,
    '{{utilitiesDetails}}': utilDetails || '[Utilities Details]',
    '{{terminationPolicy}}': termPolicy || '[Termination Policy]',
    '{{currentDate}}': new Date().toLocaleDateString(),
    // snake_case tokens (legacy)
    '{{tenant_name}}': offer?.tenant?.name || '[Tenant Name]',
    '{{landlord_name}}': offer?.property?.landlord?.name || '[Landlord Name]',
    '{{property_address}}': offer?.property?.address ? `${offer.property.address.street}, ${offer.property.address.city}` : '[Property Address]',
    '{{start_date}}': form?.startDate ? new Date(form.startDate).toLocaleDateString() : '[Start Date]',
    '{{end_date}}': form?.endDate ? new Date(form.endDate).toLocaleDateString() : '[End Date]',
    '{{rent_amount}}': form?.rentAmount ? `$${Number(form.rentAmount).toLocaleString()}` : '[Rent Amount]',
    '{{deposit_amount}}': form?.depositAmount ? `$${Number(form.depositAmount).toLocaleString()}` : '[Deposit Amount]',
    '{{late_fee_amount}}': form?.lateFeeAmount ? `$${Number(form.lateFeeAmount).toLocaleString()}` : '[Late Fee]',
    '{{grace_period}}': form?.lateFeeGracePeriodDays ? `${form.lateFeeGracePeriodDays} days` : '[Grace Period]',
  };

  for (const [key, value] of Object.entries(rules)) {
    replaced = replaced.replace(
      new RegExp(key.replace(/[{}]/g, '\\$&'), 'gi'),
      `<span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-medium">${value}</span>`
    );
  }
  return replaced;
}

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

const CLAUSE_SECTION_CONFIG = [
  { key: 'general', title: 'Section A: General Clauses', droppable: true },
  { key: 'payment', title: 'Section B: Payment and Fees', droppable: true },
  { key: 'occupancy', title: 'Section C: Occupancy and Use', droppable: true },
  { key: 'maintenance', title: 'Section D: Maintenance and Repairs', droppable: true },
  { key: 'utilities', title: 'Section E: Utilities and Services', droppable: true },
  { key: 'pets', title: 'Section F: Pets and Visitors', droppable: true },
  { key: 'legal', title: 'Section G: Legal and Compliance', droppable: true },
  { key: 'misc', title: 'Section H: Additional Terms', droppable: true },
];

const EMPTY_SECTION_MAP = CLAUSE_SECTION_CONFIG.reduce((acc, section) => {
  acc[section.key] = [];
  return acc;
}, {});

function mapCategoryToSectionKey(category = '') {
  const value = String(category).toLowerCase();
  if (value.includes('general')) return 'general';
  if (value.includes('payment') || value.includes('rent') || value.includes('fee')) return 'payment';
  if (value.includes('occup') || value.includes('tenant') || value.includes('use')) return 'occupancy';
  if (value.includes('maint') || value.includes('repair')) return 'maintenance';
  if (value.includes('utilit') || value.includes('service')) return 'utilities';
  if (value.includes('pet') || value.includes('visitor')) return 'pets';
  if (value.includes('legal') || value.includes('law') || value.includes('compliance')) return 'legal';
  return 'misc';
}

function AgreementComposer({
  selectedClauseIds,
  onReorder,
  offerData,
  formData,
  showEditor = true,
  canUseClauses = false,
  formErrors = {},
  setField = () => {},
  clearFieldError = () => {},
  onOpenTemplate = () => {},
  onFinish = () => {},
  saving = false,
  onCancel = () => {},
  appliedTemplate = '',
  onRemoveTemplate = () => {},
}) {
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editorTab, setEditorTab] = useState('terms');
  const [dragState, setDragState] = useState(null);
  const [sectionAssignments, setSectionAssignments] = useState(EMPTY_SECTION_MAP);
  const [hoveredSection, setHoveredSection] = useState('');
  const [panelPosition, setPanelPosition] = useState({ x: 24, y: 110 });
  const [draggingPanel, setDraggingPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const panelRef = useRef(null);
  const panelDragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isMobile) setMobilePanelOpen(true);
  }, [isMobile]);

  useEffect(() => {
    api.get('/agreements/clauses')
      .then(({ data }) => setClauses(data))
      .catch(() => setClauses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!clauses.length) return;
    const byId = new Map(clauses.map(c => [c._id, c]));
    const next = { ...EMPTY_SECTION_MAP };

    selectedClauseIds.forEach((id) => {
      const clause = byId.get(id);
      const sectionKey = mapCategoryToSectionKey(clause?.category);
      next[sectionKey] = [...next[sectionKey], id];
    });

    setSectionAssignments(next);
  }, [clauses, selectedClauseIds]);

  const availableClauses = clauses.filter(c =>
    !selectedClauseIds.includes(c._id) &&
    (!categoryFilter || c.category === categoryFilter) &&
    (!search || `${c.title} ${c.body}`.toLowerCase().includes(search.toLowerCase()))
  );
  const categories = [...new Set(clauses.map(c => c.category))].sort();

  const clausesById = new Map(clauses.map(c => [c._id, c]));
  const assignedClauses = selectedClauseIds.map(id => clausesById.get(id)).filter(Boolean);

  const pushUpdate = (nextAssignments) => {
    setSectionAssignments(nextAssignments);
    const flattened = CLAUSE_SECTION_CONFIG.flatMap(section => nextAssignments[section.key] || []);
    onReorder(flattened);
  };

  const removeClauseFromAssignments = (currentAssignments, clauseId) => {
    const next = { ...currentAssignments };
    for (const section of CLAUSE_SECTION_CONFIG) {
      next[section.key] = (next[section.key] || []).filter(id => id !== clauseId);
    }
    return next;
  };

  const addClauseToSection = (sectionKey, clauseId) => {
    const next = removeClauseFromAssignments(sectionAssignments, clauseId);
    next[sectionKey] = [...(next[sectionKey] || []), clauseId];
    pushUpdate(next);
  };

  const handleDragStart = (clauseId, origin) => {
    setDragState({ clauseId, origin });
  };

  const handleDropToSection = (sectionKey) => {
    if (!dragState?.clauseId) return;
    addClauseToSection(sectionKey, dragState.clauseId);
    setHoveredSection('');
    setDragState(null);
  };

  const handleRemoveClause = (clauseId) => {
    const next = removeClauseFromAssignments(sectionAssignments, clauseId);
    pushUpdate(next);
  };

  const moveClauseWithinSection = (sectionKey, fromIndex, toIndex) => {
    const current = [...(sectionAssignments[sectionKey] || [])];
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= current.length || toIndex >= current.length) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    const next = { ...sectionAssignments, [sectionKey]: current };
    pushUpdate(next);
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
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
              {selectedClauseIds.length} clause{selectedClauseIds.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="rounded-xl border border-[#d9ddd9] bg-[#f3f5f4] p-4 sm:p-6 shadow-sm">
            <div className="mx-auto w-full max-w-[850px] bg-white border border-[#d7d7d7] shadow-[0_18px_38px_rgba(15,23,42,0.12)] px-8 sm:px-12 py-10 sm:py-12 space-y-6" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
              <div className="text-center border-b border-gray-200 pb-6">
                <p className="text-[11px] tracking-[0.22em] text-gray-500 uppercase">Residential Lease Contract</p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">Rental Agreement</h3>
                <p className="mt-1 text-sm text-gray-500">Draft Version - Live Preview</p>
              </div>

          <div className="rounded-md bg-white border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Permanent Section: Parties and Property</p>
            <p className="text-sm text-gray-700"><strong>Landlord:</strong> {offerData?.property?.landlord?.name || 'Landlord'}</p>
            <p className="text-sm text-gray-700"><strong>Tenant:</strong> {offerData?.tenant?.name || 'Tenant'}</p>
            <p className="text-sm text-gray-700"><strong>Premises:</strong> {offerData?.property?.title || 'Property'}{offerData?.property?.address?.street ? `, ${offerData.property.address.street}, ${offerData.property.address.city}` : ''}</p>
          </div>

          <div className="rounded-md bg-white border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Permanent Section: Core Lease Terms</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
              <p><strong>Start Date:</strong> {formData?.startDate || 'N/A'}</p>
              <p><strong>End Date:</strong> {formData?.endDate || 'N/A'}</p>
              <p><strong>Monthly Rent:</strong> ${Number(formData?.rentAmount || 0).toLocaleString()}</p>
              <p><strong>Security Deposit:</strong> ${Number(formData?.depositAmount || 0).toLocaleString()}</p>
              <p><strong>Late Fee:</strong> ${Number(formData?.lateFeeAmount || 0).toLocaleString()}</p>
              <p><strong>Grace Period:</strong> {formData?.lateFeeGracePeriodDays || '0'} days</p>
            </div>
          </div>

          <div className="rounded-md bg-white border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Permanent Section: Policies</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
              <p><strong>Pets:</strong> {formData?.petAllowed ? 'Allowed' : 'Not allowed'}</p>
              <p><strong>Pet Deposit:</strong> {formData?.petAllowed ? `$${Number(formData?.petDeposit || 0).toLocaleString()}` : 'N/A'}</p>
              <p><strong>Utilities Included:</strong> {formData?.utilitiesIncluded ? 'Yes' : 'No'}</p>
              <p><strong>Utilities Details:</strong> {formData?.utilitiesIncluded ? (formData?.utilitiesDetails || 'Not specified') : 'N/A'}</p>
              <p className="md:col-span-2"><strong>Termination Policy:</strong> {formData?.terminationPolicy || 'Default policy applies.'}</p>
            </div>
          </div>

            {CLAUSE_SECTION_CONFIG.map((section) => {
              const ids = sectionAssignments[section.key] || [];
              const isHovered = hoveredSection === section.key;
              return (
                <div
                  key={section.key}
                  onDragOver={(e) => { e.preventDefault(); setHoveredSection(section.key); }}
                  onDragLeave={() => setHoveredSection('')}
                  onDrop={(e) => { e.preventDefault(); handleDropToSection(section.key); }}
                  className={`rounded-md border-2 p-4 transition ${isHovered ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300 bg-white'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800">{section.title}</p>
                    <span className="text-xs text-gray-400">Drop zone</span>
                  </div>

                  {ids.length === 0 && (
                    <p className="text-xs text-gray-400 italic">Drag clauses here from the floating editor.</p>
                  )}

                  <div className="space-y-2">
                    {ids.map((id, idx) => {
                      const clause = clausesById.get(id);
                      if (!clause) return null;
                      return (
                        <div
                          key={id}
                          draggable
                          onDragStart={() => handleDragStart(id, section.key)}
                          className="rounded-md border border-blue-100 bg-blue-50 p-3 cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-blue-900 truncate">{clause.title}</p>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    className="text-xs px-2 py-0.5 rounded border border-blue-200 text-blue-700 hover:bg-blue-100"
                                    onClick={() => moveClauseWithinSection(section.key, idx, Math.max(0, idx - 1))}
                                  >
                                    Up
                                  </button>
                                  <button
                                    type="button"
                                    className="text-xs px-2 py-0.5 rounded border border-blue-200 text-blue-700 hover:bg-blue-100"
                                    onClick={() => moveClauseWithinSection(section.key, idx, Math.min(ids.length - 1, idx + 1))}
                                  >
                                    Down
                                  </button>
                                  <button
                                    type="button"
                                    className="text-xs px-2 py-0.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => handleRemoveClause(id)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              <p
                                className="mt-2 text-xs text-gray-700 leading-relaxed whitespace-pre-line"
                                dangerouslySetInnerHTML={{ __html: substituteVariables(clause.body, offerData, formData) }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

              <div className="pt-3 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
                <span>Generated by Rentify Agreement Studio</span>
                <span>Page 1 (Live)</span>
              </div>
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
            <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'terms', label: 'Terms', locked: false },
                { key: 'library', label: 'Library', locked: !canUseClauses },
                { key: 'selected', label: 'Selected', locked: !canUseClauses },
                { key: 'sections', label: 'Sections', locked: !canUseClauses },
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
              <p className="font-semibold">Offer: {offerData?.tenant?.name || 'Tenant'} · ${Number(formData?.rentAmount || 0).toLocaleString()}/mo</p>
              <p className="text-green-700">{offerData?.property?.title || 'Property'} · {(offerData?.history?.[offerData.history.length - 1]?.leaseDurationMonths) || '—'} months</p>
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

            {editorTab === 'sections' && (
              <div className="space-y-2">
                {CLAUSE_SECTION_CONFIG.map(section => {
                  const count = (sectionAssignments[section.key] || []).length;
                  return (
                    <div key={section.key} className="border border-gray-200 rounded-lg bg-white p-2.5 flex items-center justify-between">
                      <p className="text-xs text-gray-700 font-medium">{section.title}</p>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {!canUseClauses && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-[11px] text-blue-700">
                Clause drag-and-drop is available on Pro/Enterprise plans.
              </div>
            )}

            {canUseClauses && appliedTemplate && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-2.5 text-[11px] text-green-700 flex items-center justify-between gap-2">
                <span>Template applied: <strong>{appliedTemplate}</strong></span>
                <button
                  type="button"
                  onClick={onRemoveTemplate}
                  className="px-2 py-0.5 rounded border border-red-200 bg-white text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          </>
          )}

          {(!isMobile || mobilePanelOpen) && (
          <div className="px-3 py-2.5 border-t bg-gray-50 flex items-center gap-2">
            {canUseClauses && (
              <button
                type="button"
                onClick={onOpenTemplate}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                Use Template
              </button>
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

  // Clause access: pro and enterprise only
  const tier = user?.subscriptionTier || 'free';
  const canUseClauses = tier === 'pro' || tier === 'enterprise';

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedClauseIds, setSelectedClauseIds] = useState([]);
  const [createdAgreementId, setCreatedAgreementId] = useState(null);
  const [savingClauses, setSavingClauses] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [offerData, setOfferData] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState('');
  const [templateClauseIds, setTemplateClauseIds] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    rentAmount: '',
    depositAmount: '',
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
        const lastRound = data.history[data.history.length - 1];
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
          lateFeeAmount: String(data.property?.financials?.lateFeeAmount || 0),
          lateFeeGracePeriodDays: String(data.property?.financials?.lateFeeGracePeriodDays || 5),
        }));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [offerId]);

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
    setSelectedClauseIds(normalized);

    if (appliedTemplate && templateClauseIds.length > 0) {
      const idSet = new Set(normalized.map((id) => String(id)));
      const stillContainsTemplate = templateClauseIds.every((id) => idSet.has(String(id)));
      if (!stillContainsTemplate) {
        setAppliedTemplate('');
        setTemplateClauseIds([]);
      }
    }
  };

  const handleApplyTemplate = (clauseIds, templateName) => {
    const normalized = normalizeClauseIds(clauseIds);
    setSelectedClauseIds(normalized);
    setTemplateClauseIds(normalized);
    setAppliedTemplate(templateName);
    setShowTemplatePicker(false);
  };

  const handleRemoveTemplate = () => {
    if (templateClauseIds.length > 0) {
      const templateIdSet = new Set(templateClauseIds.map((id) => String(id)));
      setSelectedClauseIds((prev) => prev.filter((id) => !templateIdSet.has(String(id))));
    }
    setAppliedTemplate('');
    setTemplateClauseIds([]);
  };

  const handleSaveClauses = async () => {
    if (!validateAgreementForm()) {
      toast('Please fix lease term errors before finishing the draft.', 'error');
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
            <AgreementComposer
              selectedClauseIds={selectedClauseIds}
              onReorder={handleReorderClauses}
              offerData={offerData}
              formData={formData}
              showEditor={true}
              canUseClauses={canUseClauses}
              formErrors={formErrors}
              setField={set}
              clearFieldError={(key) => setFormErrors((prev) => ({ ...prev, [key]: null }))}
              onOpenTemplate={() => setShowTemplatePicker(true)}
              onFinish={handleSaveClauses}
              saving={savingClauses}
              onCancel={() => router.push('/dashboard/agreements')}
              appliedTemplate={appliedTemplate}
              onRemoveTemplate={handleRemoveTemplate}
            />
          </div>

          {showTemplatePicker && canUseClauses && (
            <TemplatePicker
              onApply={handleApplyTemplate}
              onClose={() => setShowTemplatePicker(false)}
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