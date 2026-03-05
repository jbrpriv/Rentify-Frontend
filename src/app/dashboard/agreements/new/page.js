'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import {
  Search, UserCheck, Calendar, FileText, Loader2,
  CheckSquare, Square, ChevronDown, ChevronUp, Tag,
  GripVertical, Eye, EyeOff, AlertTriangle, X, LayoutTemplate,
} from 'lucide-react';

// ─── Template Picker Modal ────────────────────────────────────────────────────
function TemplatePicker({ onApply, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    api.get('/agreement-templates')
      .then(({ data }) => setTemplates(Array.isArray(data) ? data.filter(t => t.status === 'approved') : []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (tpl) => {
    setApplying(tpl._id);
    try {
      // Track usage
      await api.post(`/agreement-templates/${tpl._id}/use`);
      // Collect clause IDs from template (support both populated objects and bare IDs)
      const clauseIds = (tpl.clauses || []).map(c => c._id || c);
      onApply(clauseIds, tpl.name);
    } catch {
      // Still apply even if usage tracking fails
      const clauseIds = (tpl.clauses || []).map(c => c._id || c);
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
                    {(tpl.clauses || []).length} clause{(tpl.clauses || []).length !== 1 ? 's' : ''} included
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

// ─── Drag-and-Drop Clause Picker ──────────────────────────────────────────────
function ClausePicker({ selectedClauseIds, onToggle, onReorder }) {
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    api.get('/agreements/clauses')
      .then(({ data }) => setClauses(data))
      .catch(() => setClauses([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedClauses = clauses.filter(c => selectedClauseIds.includes(c._id));
  const availableClauses = clauses.filter(c =>
    !selectedClauseIds.includes(c._id) &&
    (!categoryFilter || c.category === categoryFilter) &&
    (!search || c.title.toLowerCase().includes(search.toLowerCase()))
  );
  const categories = [...new Set(clauses.map(c => c.category))].sort();

  // Drag handlers for reordering selected clauses
  const handleDragStart = (idx) => { dragItem.current = idx; };
  const handleDragEnter = (idx) => { dragOverItem.current = idx; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...selectedClauses];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);
    dragItem.current = null;
    dragOverItem.current = null;
    onReorder(reordered.map(c => c._id));
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
      <Loader2 className="animate-spin w-4 h-4" /> Loading clauses…
    </div>
  );

  if (clauses.length === 0) return (
    <p className="text-sm text-gray-400 italic py-2">
      No approved clauses available yet. Ask an admin to add clauses from the template library.
    </p>
  );

  return (
    <div className="space-y-4">
      {/* Selected / draggable clauses */}
      {selectedClauses.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <GripVertical className="w-3 h-3" /> Selected Clauses — drag to reorder
          </p>
          <div className="space-y-1.5">
            {selectedClauses.map((clause, idx) => (
              <div
                key={clause._id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 cursor-grab active:cursor-grabbing group"
              >
                <GripVertical className="w-4 h-4 text-blue-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-800 truncate">{clause.title}</p>
                  <p className="text-xs text-blue-500 capitalize">{clause.category?.replace(/_/g, ' ')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(clause._id)}
                  className="text-blue-400 hover:text-red-500 transition flex-shrink-0"
                  title="Remove clause"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available clause library */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Clause Library {selectedClauses.length > 0 ? '— click to add' : ''}
        </p>

        {/* Search + category filters */}
        <div className="space-y-2 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clauses…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => setCategoryFilter('')}
              className={`text-xs px-3 py-1 rounded-full border ${!categoryFilter ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => setCategoryFilter(cat)}
                className={`text-xs px-3 py-1 rounded-full border capitalize ${categoryFilter === cat ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {availableClauses.length === 0 && (
            <p className="text-sm text-gray-400 py-3 text-center italic">No matching clauses found.</p>
          )}
          {availableClauses.map((clause) => {
            const open = expanded[clause._id];
            return (
              <div key={clause._id} className="border rounded-lg border-gray-200 hover:border-blue-300 transition">
                <div className="flex items-start gap-3 p-3">
                  <button type="button" onClick={() => onToggle(clause._id)} className="mt-0.5 flex-shrink-0">
                    <Square className="w-4 h-4 text-gray-400 hover:text-blue-600 transition" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{clause.title}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize">
                        {clause.category?.replace(/_/g, ' ')}
                      </span>
                      {clause.isDefault && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Recommended</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpanded(prev => ({ ...prev, [clause._id]: !prev[clause._id] }))}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {open && (
                  <div className="px-11 pb-3">
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{clause.body}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedClauseIds.length > 0 && (
          <p className="text-xs text-blue-600 font-medium">
            {selectedClauseIds.length} clause{selectedClauseIds.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
function AgreementForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const offerId = searchParams.get('offerId'); // ← pre-fill from accepted offer

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Find Tenant, 2: Terms, 3: Clauses
  const [tenantEmail, setTenantEmail] = useState('');
  const [foundTenant, setFoundTenant] = useState(null);
  const [selectedClauseIds, setSelectedClauseIds] = useState([]);
  const [createdAgreementId, setCreatedAgreementId] = useState(null);
  const [savingClauses, setSavingClauses] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [offerData, setOfferData] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState('');

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    rentAmount: '',
    depositAmount: '',
    lateFeeAmount: '0',
    lateFeeGracePeriodDays: '5',
    rentEscalationEnabled: false,
    rentEscalationPercentage: '5',
  });

  // ── When coming from "Accept & Draft Agreement" — pre-load offer details ──
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
        setFoundTenant(data.tenant);
        setTenantEmail(data.tenant?.email || '');
        setFormData({
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          rentAmount: String(lastRound?.monthlyRent || ''),
          depositAmount: String(lastRound?.securityDeposit || ''),
          lateFeeAmount: String(data.property?.financials?.lateFeeAmount || 0),
          lateFeeGracePeriodDays: String(data.property?.financials?.lateFeeGracePeriodDays || 5),
        });
        setStep(2); // skip "Find Tenant" — tenant is already known from offer
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [offerId]);

  // H6 fix — Pre-fill rent/deposit from property defaults (only when no offer)
  useEffect(() => {
    if (offerId || !propertyId) return;
    api.get(`/properties/${propertyId}`)
      .then(({ data }) => {
        setFormData((prev) => ({
          ...prev,
          rentAmount: data.financials?.monthlyRent ? String(data.financials.monthlyRent) : prev.rentAmount,
          depositAmount: data.financials?.securityDeposit ? String(data.financials.securityDeposit) : prev.depositAmount,
          lateFeeAmount: String(data.financials?.lateFeeAmount || 0),
          lateFeeGracePeriodDays: String(data.financials?.lateFeeGracePeriodDays || 5),
        }));
      })
      .catch(() => { });
  }, [propertyId, offerId]);

  const lookupTenant = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/users/lookup', { email: tenantEmail });
      if (data.role !== 'tenant') {
        alert('This user is registered as a Landlord, not a Tenant.');
        setFoundTenant(null);
      } else {
        setFoundTenant(data);
        setStep(2);
      }
    } catch {
      alert('Tenant not found. Please ask them to register first.');
      setFoundTenant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offerId && (!foundTenant || !propertyId)) return;

    // We defer the actual creation API call until Step 3 (handleSaveClauses), 
    // so if the landlord navigates away in the middle of drafting, 
    // the offer doesn't get prematurely "accepted" before clauses are done.
    setStep(3);
  };

  const handleToggleClause = (clauseId) => {
    setSelectedClauseIds((prev) =>
      prev.includes(clauseId) ? prev.filter((id) => id !== clauseId) : [...prev, clauseId]
    );
  };

  const handleReorderClauses = (reorderedIds) => {
    setSelectedClauseIds(reorderedIds);
  };

  const handleApplyTemplate = (clauseIds, templateName) => {
    setSelectedClauseIds(clauseIds);
    setAppliedTemplate(templateName);
    setShowTemplatePicker(false);
  };

  const handleSaveClauses = async () => {
    setSavingClauses(true);
    try {
      let createdId = createdAgreementId;

      // If we deferred creation to the end:
      if (!createdId) {
        if (offerId) {
          const { data } = await api.put(`/offers/${offerId}/accept`, {
            startDate: formData.startDate,
          });
          createdId = data.agreement._id;
        } else {
          const { data: agreement } = await api.post('/agreements', {
            tenantId: foundTenant._id,
            propertyId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            rentAmount: Number(formData.rentAmount),
            depositAmount: Number(formData.depositAmount),
            lateFeeAmount: Number(formData.lateFeeAmount) || 0,
            lateFeeGracePeriodDays: Number(formData.lateFeeGracePeriodDays) || 5,
            rentEscalationEnabled: formData.rentEscalationEnabled,
            rentEscalationPercentage: Number(formData.rentEscalationPercentage) || 0,
          });
          createdId = agreement._id;
        }
        setCreatedAgreementId(createdId);
      }

      if (selectedClauseIds.length > 0) {
        await api.put(`/agreements/${createdId}/clauses`, { clauseIds: selectedClauseIds });
      }
      router.push('/dashboard/agreements');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save agreement');
    } finally {
      setSavingClauses(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {offerId ? 'Accept Offer & Draft Agreement' : 'Create Rental Agreement'}
        </h1>
        <p className="text-gray-500">
          {offerId
            ? 'Review the negotiated terms, add clauses, and finalise the agreement.'
            : 'Draft a new legal contract for your property.'}
        </p>
      </div>

      {/* Banner shown when pre-filling from an offer */}
      {offerId && offerData && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm">
          <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800">
              Accepting offer from {offerData.tenant?.name}
            </p>
            <p className="text-green-700 mt-0.5">
              {offerData.property?.title} · Rs.{' '}
              {offerData.history[offerData.history.length - 1]?.monthlyRent?.toLocaleString()}/mo ·{' '}
              {offerData.history[offerData.history.length - 1]?.leaseDurationMonths} months
            </p>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center mb-8">
        {['Find Tenant', 'Lease Terms', 'Clauses'].map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step > i + 1 || (offerId && i === 0) ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > i + 1 || (offerId && i === 0) ? '✓' : i + 1}
            </div>
            <span className={`ml-2 text-sm font-medium ${step === i + 1 ? 'text-blue-600' : 'text-gray-500'}`}>{label}</span>
            {i < 2 && <div className="mx-4 flex-1 h-px bg-gray-200 w-8" />}
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Step 1: Tenant Lookup — hidden/auto-completed when coming from offer */}
        <div className={`p-6 ${step !== 1 ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
            <Search className="w-5 h-5 mr-2 text-blue-500" />
            Step 1: Find Tenant
          </h2>
          {offerId && foundTenant ? (
            <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center">
              <CheckSquare className="w-5 h-5 mr-2" />
              Tenant pre-filled from offer: <strong className="ml-1">{foundTenant.name}</strong>&nbsp;({foundTenant.email})
            </div>
          ) : (
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Enter Tenant's Email"
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                value={tenantEmail}
                onChange={(e) => setTenantEmail(e.target.value)}
                disabled={step !== 1}
              />
              <button
                type="button"
                onClick={lookupTenant}
                disabled={loading || !tenantEmail || step !== 1}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Search'}
              </button>
            </div>
          )}
          {foundTenant && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Found: <strong className="ml-1">{foundTenant.name}</strong>&nbsp;({foundTenant.email})
            </div>
          )}
        </div>

        {/* Step 2: Lease Terms */}
        {step >= 2 && (
          <div className={`p-6 border-t border-gray-100 ${step !== 2 ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-medium text-gray-900 flex items-center mb-6">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              Step 2: Lease Terms
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Monthly Rent (Rs.)
                    {formData.rentAmount && <span className="text-green-600 text-xs ml-2">Pre-filled from property</span>}
                  </label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Security Deposit (Rs.)
                    {formData.depositAmount && <span className="text-green-600 text-xs ml-2">Pre-filled from property</span>}
                  </label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  />
                </div>
              </div>

              {/* Late Fee Settings */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Late Fee Amount (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    value={formData.lateFeeAmount}
                    onChange={(e) => setFormData({ ...formData, lateFeeAmount: e.target.value })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Pre-filled from property settings</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grace Period (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    value={formData.lateFeeGracePeriodDays}
                    onChange={(e) => setFormData({ ...formData, lateFeeGracePeriodDays: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">Pre-filled from property settings</p>
                </div>
              </div>

              {/* Rent Escalation */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Annual Rent Escalation</label>
                    <p className="text-xs text-gray-400">Automatically increase rent on each lease anniversary</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, rentEscalationEnabled: !formData.rentEscalationEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.rentEscalationEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.rentEscalationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {formData.rentEscalationEnabled && (
                  <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-4 py-3">
                    <label className="text-sm font-medium text-gray-700 flex-shrink-0">Increase by</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.rentEscalationPercentage}
                      onChange={(e) => setFormData({ ...formData, rentEscalationPercentage: e.target.value })}
                    />
                    <span className="text-sm text-gray-700">% per year</span>
                    <span className="text-xs text-blue-600 ml-auto">
                      Rs. {formData.rentAmount ? Math.round(Number(formData.rentAmount) * (Number(formData.rentEscalationPercentage) / 100)).toLocaleString() : '—'} increase on year 1
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <FileText className="h-5 w-5 mr-2" />}
                  Create Agreement Draft
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-blue-500" />
                Step 3: Additional Clauses
                <span className="ml-2 text-sm font-normal text-gray-500">(optional)</span>
              </h2>
              {/* Use Template button */}
              <button
                type="button"
                onClick={() => setShowTemplatePicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
              >
                <LayoutTemplate className="w-4 h-4" />
                Use Template
              </button>
            </div>

            {appliedTemplate && (
              <div className="mb-3 flex items-center gap-2 text-xs px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckSquare className="w-3.5 h-3.5" />
                Template applied: <strong>{appliedTemplate}</strong> — you can still adjust clauses below.
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
              Select approved clauses to include. Drag to reorder. Or start from a template above.
            </p>

            <ClausePicker
              selectedClauseIds={selectedClauseIds}
              onToggle={handleToggleClause}
              onReorder={handleReorderClauses}
            />

            {/* PDF Preview button */}
            {createdAgreementId && (
              <button
                type="button"
                onClick={() => setShowPDFPreview(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition"
              >
                <Eye className="w-4 h-4" />
                Preview Agreement PDF
              </button>
            )}

            <div className="mt-6 flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.push('/dashboard/agreements')}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Cancel Draft
              </button>
              <button
                type="button"
                onClick={handleSaveClauses}
                disabled={savingClauses}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
              >
                {savingClauses ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                {selectedClauseIds.length > 0
                  ? `Attach ${selectedClauseIds.length} Clause${selectedClauseIds.length !== 1 ? 's' : ''} & Finish`
                  : 'Finish Without Clauses'}
              </button>
            </div>
          </div>
        )}

        {/* Template Picker Modal */}
        {showTemplatePicker && (
          <TemplatePicker
            onApply={handleApplyTemplate}
            onClose={() => setShowTemplatePicker(false)}
          />
        )}

        {/* PDF Preview Modal */}
        {showPDFPreview && createdAgreementId && (
          <InlinePDFPreview
            agreementId={createdAgreementId}
            onClose={() => setShowPDFPreview(false)}
          />
        )}
      </div>
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