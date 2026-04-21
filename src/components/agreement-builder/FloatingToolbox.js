import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  GripVertical, X, Search, ChevronDown, ChevronRight,
  Sparkles, User, Landmark, Banknote, Calendar, MapPin,
  Home, ShieldCheck, Wallet, Clock, Hash, TrendingUp,
  ScrollText, Columns, Minus, Package
} from 'lucide-react';

const AGREEMENT_VARIABLE_GROUPS = [
  {
    label: 'Main Parties',
    vars: [
      { id: 'landlord_name', label: 'Landlord Name', icon: Landmark },
      { id: 'tenant_name', label: 'Tenant Name', icon: User },
    ],
  },
  {
    label: 'Property Info',
    vars: [
      { id: 'property_title', label: 'Property Title', icon: Home },
      { id: 'property_address', label: 'Full Address', icon: MapPin },
    ],
  },
  {
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
    label: 'Dates & Duration',
    vars: [
      { id: 'start_date', label: 'Lease Start Date', icon: Calendar },
      { id: 'end_date', label: 'Lease End Date', icon: Calendar },
      { id: 'duration_months', label: 'Duration (months)', icon: Clock },
    ],
  },
  {
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
    label: 'Tenant & Property',
    vars: [
      { id: 'tenant_name', label: 'Tenant Name', icon: User },
      { id: 'tenant_email', label: 'Tenant Email', icon: User },
      { id: 'property_title', label: 'Property Title', icon: Home },
      { id: 'property_address', label: 'Full Address', icon: MapPin },
    ],
  },
];

const FloatingToolbox = ({ editor, templateType = 'agreement' }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({ variables: true, blocks: true });
  const toolboxRef = useRef(null);
  const pillRef = useRef(null);

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
    if (e.target.tagName === 'INPUT') return;
    setIsDragging(true);
    const rect = (toolboxRef.current || pillRef.current)?.getBoundingClientRect();
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

  const addVariable = (name, label) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: 'variable',
      attrs: { name, label },
    }).run();
  };

  const insertClausesSection = () => {
    if (!editor) return;
    editor.chain().focus().insertContent({ type: 'clausesPlaceholder' }).run();
  };

  const insertDualColumn = () => {
    if (!editor) return;
    editor.chain().focus().insertContent({ type: 'dualColumn' }).run();
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const variableGroups = templateType === 'receipt' ? RECEIPT_VARIABLE_GROUPS : AGREEMENT_VARIABLE_GROUPS;

  // Filter variables by search
  const filteredGroups = variableGroups.map(group => ({
    ...group,
    vars: group.vars.filter(v =>
      v.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(group => group.vars.length > 0);

  // Minimized pill
  if (isMinimized) {
    return (
      <div
        ref={pillRef}
        className="floating-toolbox-pill"
        style={{ left: position.x, top: position.y }}
        onClick={() => setIsMinimized(false)}
        onMouseDown={handleMouseDown}
      >
        <Package size={14} />
        Toolbox
      </div>
    );
  }

  return (
    <div
      ref={toolboxRef}
      className="floating-toolbox"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Header — drag handle */}
      <div className="floating-toolbox-header" onMouseDown={handleMouseDown}>
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="opacity-60" />
          <h3>Toolbox</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Minimize"
          >
            <Minus size={12} className="text-white" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="floating-toolbox-body">
        {/* Search */}
        <input
          type="text"
          className="floating-toolbox-search"
          placeholder="Search variables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Variables Section */}
        <div className="toolbox-section">
          <div className="toolbox-section-header" onClick={() => toggleSection('variables')}>
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-500" />
              Variables
            </span>
            {expandedSections.variables ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </div>

          {expandedSections.variables && (
            <div className="toolbox-section-items px-1">
              {filteredGroups.map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2 pb-1">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap">
                    {group.vars.map((v) => {
                      const Icon = v.icon;
                      return (
                        <button
                          key={v.id}
                          className="toolbox-var-chip"
                          onClick={() => addVariable(v.id, v.label)}
                          title={`Insert {{${v.id}}}`}
                        >
                          <Icon size={11} className="opacity-50" />
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No variables match your search</p>
              )}
            </div>
          )}
        </div>

        {/* Blocks Section */}
        <div className="toolbox-section">
          <div className="toolbox-section-header" onClick={() => toggleSection('blocks')}>
            <span className="flex items-center gap-1.5">
              <Package size={12} className="text-emerald-500" />
              Blocks
            </span>
            {expandedSections.blocks ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </div>

          {expandedSections.blocks && (
            <div className="toolbox-section-items px-1 pt-1">
              {templateType !== 'receipt' && (
                <button className="toolbox-block-btn" onClick={insertClausesSection}>
                  <ScrollText size={14} className="text-emerald-600" />
                  <span>Insert Clauses Section</span>
                </button>
              )}
              <button className="toolbox-block-btn" onClick={insertDualColumn}>
                <Columns size={14} className="text-blue-600" />
                <span>Insert Dual Column</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingToolbox;
