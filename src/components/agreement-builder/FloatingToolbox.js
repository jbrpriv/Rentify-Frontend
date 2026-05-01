import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  GripVertical, X, Sparkles, User, Landmark, Banknote, Calendar, MapPin,
  Home, Wallet, Clock, Hash, TrendingUp, ScrollText, LayoutTemplate
} from 'lucide-react';

const AGREEMENT_VARIABLE_GROUPS = [
  {
    category: 'parties',
    label: 'Main Parties',
    vars: [
      { id: 'landlord_name', label: 'Landlord Name', icon: Landmark },
      { id: 'tenant_name', label: 'Tenant Name', icon: User },
    ],
  },
  {
    category: 'property',
    label: 'Property Info',
    vars: [
      { id: 'property_title', label: 'Property Title', icon: Home },
      { id: 'property_address', label: 'Full Address', icon: MapPin },
    ],
  },
  {
    category: 'financials',
    label: 'Financials',
    vars: [
      { id: 'rent_amount', label: 'Monthly Rent', icon: Wallet },
      { id: 'security_deposit', label: 'Security Deposit', icon: Banknote },
      { id: 'total_move_in', label: 'Total Move-in Cost', icon: Landmark },
      { id: 'maintenance_fee', label: 'Maintenance Fee', icon: Hash },
      { id: 'late_fee', label: 'Late Payment Fee', icon: Clock },
      { id: 'late_fee_grace_days', label: 'Grace Period (Days)', icon: Clock },
    ],
  },
  {
    category: 'dates',
    label: 'Dates & Duration',
    vars: [
      { id: 'start_date', label: 'Lease Start Date', icon: Calendar },
      { id: 'end_date', label: 'Lease End Date', icon: Calendar },
      { id: 'duration_months', label: 'Duration (months)', icon: Clock },
    ],
  },
  {
    category: 'policies',
    label: 'Policies',
    vars: [
      { id: 'utilities_included', label: 'Utilities Included?', icon: Sparkles },
      { id: 'utilities_details', label: 'Utilities Details', icon: ScrollText },
      { id: 'pet_allowed', label: 'Pets Allowed?', icon: Sparkles },
      { id: 'pet_deposit', label: 'Pet Deposit', icon: Banknote },
      { id: 'rent_escalation_enabled', label: 'Rent Escalation?', icon: TrendingUp },
      { id: 'rent_escalation_percentage', label: 'Rent Escalation %', icon: TrendingUp },
      { id: 'termination_policy', label: 'Termination Notice', icon: ScrollText },
    ],
  },
];

const RECEIPT_VARIABLE_GROUPS = [
  {
    category: 'receipt',
    label: 'Receipt Info',
    vars: [
      { id: 'receipt_number', label: 'Receipt No.', icon: Hash },
      { id: 'payment_date', label: 'Payment Date', icon: Calendar },
      { id: 'transaction_id', label: 'Transaction ID', icon: Hash },
      { id: 'payment_method', label: 'Payment Method', icon: Banknote },
      { id: 'paid_amount', label: 'Paid Amount', icon: Wallet },
      { id: 'period_covered', label: 'Period Covered', icon: Calendar },
    ],
  },
  {
    category: 'tenant',
    label: 'Tenant & Property',
    vars: [
      { id: 'tenant_name', label: 'Tenant Name', icon: User },
      { id: 'tenant_email', label: 'Tenant Email', icon: User },
      { id: 'property_title', label: 'Property Title', icon: Home },
      { id: 'property_address', label: 'Full Address', icon: MapPin },
    ],
  },
];

const FloatingToolbox = ({ editor, templateType = 'agreement', templates = [], isOpen, onClose, onApplyTemplate }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('variables');
  const toolboxRef = useRef(null);

  // Initialize position
  useEffect(() => {
    const saved = localStorage.getItem('toolbox-position');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch {
        setPosition({ x: window.innerWidth - 310, y: 120 });
      }
    } else {
      setPosition({ x: window.innerWidth - 310, y: 120 });
    }
  }, []);

  // Save position
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('toolbox-position', JSON.stringify(position));
    }
  }, [position]);

  // Drag handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    setIsDragging(true);
    const rect = toolboxRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const addVariable = (name, label, category) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: 'variable',
      attrs: { name, label, category },
    }).run();
  };

  const variableGroups = templateType === 'receipt' ? RECEIPT_VARIABLE_GROUPS : AGREEMENT_VARIABLE_GROUPS;
  const canShowTemplates = templateType !== 'receipt';

  // Filter variables by search
  const filteredGroups = variableGroups.map(group => ({
    ...group,
    vars: group.vars.filter(v =>
      v.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(group => group.vars.length > 0);

  const filteredTemplates = useMemo(() => {
    if (!Array.isArray(templates)) return [];
    return templates.filter((template) => {
      const haystack = `${template?.name || ''} ${template?.description || ''}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [templates, searchTerm]);

  useEffect(() => {
    if (templateType === 'receipt' && activeTab !== 'variables') {
      setActiveTab('variables');
    }
  }, [templateType, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      ref={toolboxRef}
      className="floating-toolbox"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default',
        width: 320
      }}
    >
      {/* Header — drag handle */}
      <div className="floating-toolbox-header" onMouseDown={handleMouseDown}>
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="opacity-60" />
          <h3>{activeTab === 'templates' ? 'Templates Library' : 'Variables Library'}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="floating-toolbox-body">
        {/* Search */}
        <input
          type="text"
          className="floating-toolbox-search"
          placeholder={activeTab === 'templates' ? 'Search templates...' : 'Search variables...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {canShowTemplates && (
          <div className="flex items-center gap-1 px-1 mb-2">
            <button
              onClick={() => setActiveTab('variables')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                activeTab === 'variables'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              Variables
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                activeTab === 'templates'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              Templates
            </button>
          </div>
        )}

        {/* Variables Section */}
        <div className="toolbox-section-items px-1 mt-2">
          {activeTab === 'variables' && filteredGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="h-px bg-gray-100 flex-1"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.label}
                </p>
                <div className="h-px bg-gray-100 flex-1"></div>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {group.vars.map((v) => {
                  const Icon = v.icon;
                  // Use same category styles as the node view for the buttons (approximated)
                  let chipClass = "toolbox-var-chip";
                  if(group.category === 'parties') chipClass += " bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
                  else if(group.category === 'property') chipClass += " bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
                  else if(group.category === 'financials') chipClass += " bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
                  else if(group.category === 'dates') chipClass += " bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
                  else if(group.category === 'policies') chipClass += " bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";
                  else if(group.category === 'receipt') chipClass += " bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100";
                  else if(group.category === 'tenant') chipClass += " bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100";

                  return (
                    <button
                      key={v.id}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold cursor-pointer transition-transform active:scale-95 ${chipClass}`}
                      onClick={() => addVariable(v.id, v.label, group.category)}
                      title={`Insert {{${v.id}}}`}
                    >
                      <Icon size={12} className="opacity-60" />
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {activeTab === 'variables' && filteredGroups.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No variables match your search</p>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-2 px-1">
              {filteredTemplates.map((template) => (
                <button
                  key={template._id || template.name}
                  className="w-full text-left px-3 py-2 rounded-lg border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50 transition-colors"
                  onClick={() => onApplyTemplate?.(template)}
                  title="Apply template to document"
                >
                  <div className="flex items-center gap-2">
                    <LayoutTemplate size={13} className="text-indigo-600" />
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {template.name || 'Untitled Template'}
                    </p>
                  </div>
                  {template.description && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </button>
              ))}
              {filteredTemplates.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No templates match your search</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingToolbox;
