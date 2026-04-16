import React, { useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Type, Heading1, Heading2, User, Landmark, Banknote, Calendar, 
  ChevronDown, Image as ImageIcon, Sparkles, ScrollText, Plus,
  MapPin, Home, ShieldCheck, Wallet, Clock, Users, Hash
} from 'lucide-react';

const Toolbar = ({ editor, templateType = 'agreement' }) => {
  const [showFontSizes, setShowFontSizes] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  // Dynamically load Cloudinary Upload Widget script
  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!editor) return null;

  const addVariable = (name, label) => {
    editor.chain().focus().insertContent({
      type: 'variable',
      attrs: { name, label },
    }).run();
    setShowVariables(false);
  };

  const insertImage = () => {
    if (!window.cloudinary) {
      const url = window.prompt('Cloudinary widget not loaded yet. Enter URL manually:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
      return;
    }

    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dj4a5robb',
        uploadPreset: 'rentify_unsigned',
        sources: ['local', 'url', 'camera'],
        showAdvancedOptions: false,
        cropping: true,
        multiple: false,
        defaultSource: 'local',
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceHover: '#E4EBF1'
          }
        }
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          editor.chain().focus().setImage({ src: result.info.secure_url }).run();
        }
      }
    );
    myWidget.open();
  };

  const setFontSize = (size) => {
    editor.chain().focus().setFontSize(size).run();
    setShowFontSizes(false);
  };

  const insertClausesSection = () => {
    editor.chain().focus().insertContent({ type: 'clausesPlaceholder' }).run();
  };

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];

  const agreementVariableGroups = [
    {
      label: 'Main Parties',
      vars: [
        { id: 'landlord_name', label: 'Landlord Name', icon: Landmark },
        { id: 'tenant_name', label: 'Tenant Name', icon: User },
      ]
    },
    {
      label: 'Property Info',
      vars: [
        { id: 'property_title', label: 'Property Title', icon: Home },
        { id: 'property_address', label: 'Full Address', icon: MapPin },
      ]
    },
    {
      label: 'Financials',
      vars: [
        { id: 'monthly_rent', label: 'Monthly Rent', icon: Wallet },
        { id: 'security_deposit', label: 'Security Deposit', icon: Banknote },
        { id: 'maintenance_fee', label: 'Maintenance Fee', icon: Hash },
        { id: 'late_fee', label: 'Late Payment Fee', icon: Clock },
      ]
    },
    {
      label: 'Dates & Duration',
      vars: [
        { id: 'start_date', label: 'Lease Start Date', icon: Calendar },
        { id: 'end_date', label: 'Lease End Date', icon: Calendar },
        { id: 'lease_duration', label: 'Duration (months)', icon: Clock },
      ]
    },
    // 'Other' group intentionally omitted (witness/name & CNIC removed)
  ];

  const receiptVariableGroups = [
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
      ]
    }
  ];

  const variableGroups = templateType === 'receipt' ? receiptVariableGroups : agreementVariableGroups;

  return (
    <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 sticky top-0 z-50">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 px-2 border-r border-gray-100">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Underline"
        >
          <Underline size={18} />
        </button>
      </div>

      {/* Font Size */}
      <div className="relative border-r border-gray-100 px-2">
        <button
          onClick={() => setShowFontSizes(!showFontSizes)}
          className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded transition-colors whitespace-nowrap"
        >
          Size <ChevronDown size={14} />
        </button>
        {showFontSizes && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setShowFontSizes(false)} />
            <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[100]">
              {fontSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {size}
                </button>
              ))}
              <button
                onClick={() => editor.chain().focus().unsetFontSize().run()}
                className="w-full text-left px-4 py-2 text-xs font-bold border-t border-gray-100 text-red-500 hover:bg-red-50"
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1 px-2 border-r border-gray-100">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 px-2 border-r border-gray-100">
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('paragraph') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Paragraph"
        >
          <Type size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
      </div>

      {/* Media */}
      <div className="flex items-center gap-1 px-2 border-r border-gray-100">
        <button
          onClick={insertImage}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
          title="Upload Logo (Cloudinary)"
        >
          <ImageIcon size={18} />
        </button>
      </div>

      {/* Variable Dropdown */}
      <div className="relative px-2 border-r border-gray-100">
        <button
          onClick={() => setShowVariables(!showVariables)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
          title="Insert dynamic variables"
        >
          <Sparkles size={14} />
          Insert Variables
          <ChevronDown size={14} />
        </button>

        {showVariables && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setShowVariables(false)} />
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[100] max-h-[80vh] overflow-y-auto">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Variable Library</p>
              </div>
              {variableGroups.map((group, idx) => (
                <div key={group.label} className={idx > 0 ? 'border-t border-gray-50' : ''}>
                  <p className="px-4 pt-3 pb-1 text-[9px] font-bold text-blue-600 uppercase tracking-wider bg-white">{group.label}</p>
                  <div className="p-1 space-y-0.5">
                    {group.vars.map(v => (
                      <button
                        key={v.id}
                        onClick={() => addVariable(v.id, v.label)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                      >
                        <v.icon size={14} className="opacity-50" />
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dynamic Clauses Section Placeholder */}
      {templateType !== 'receipt' && (
      <div className="px-2">
        <button
          onClick={insertClausesSection}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
          title="Insert the dynamic clauses zone"
        >
          <ScrollText size={14} />
          Clauses Section
          <Plus size={10} strokeWidth={3} />
        </button>
      </div>
      )}
    </div>
  );
};

export default Toolbar;
