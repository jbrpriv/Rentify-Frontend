import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Type, Heading1, Heading2, User, Landmark, Banknote, Calendar, 
  ChevronDown, Image as ImageIcon, Sparkles, Loader2, Minus, Plus
} from 'lucide-react';

const Toolbar = ({ editor, approvedClauses = [], loadingClauses = false }) => {
  const [showClauses, setShowClauses] = useState(false);
  const [showFontSizes, setShowFontSizes] = useState(false);

  if (!editor) return null;

  const addVariable = (name, label) => {
    editor.chain().focus().insertContent({
      type: 'variable',
      attrs: { name, label },
    }).run();
  };

  const insertImage = () => {
    const url = window.prompt('Enter Logo/Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setFontSize = (size) => {
    editor.chain().focus().setFontSize(size).run();
    setShowFontSizes(false);
  };

  const insertClause = (clause) => {
    editor.chain().focus().insertContent(`<h2>${clause.title}</h2><p>${clause.body}</p>`).run();
    setShowClauses(false);
  };

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px'];

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
      <div className="relative border-r border-gray-100 px-2 group">
        <button
          onClick={() => setShowFontSizes(!showFontSizes)}
          className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded transition-colors whitespace-nowrap"
        >
          Size <ChevronDown size={14} />
        </button>
        {showFontSizes && (
          <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
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
          title="Insert Logo"
        >
          <ImageIcon size={18} />
        </button>
      </div>

      {/* Variables */}
      <div className="flex items-center gap-2 px-2 border-r border-gray-100">
        <span className="text-[10px] uppercase font-bold text-gray-400">Insert Info:</span>
        <button
          onClick={() => addVariable('tenant_name', 'Tenant')}
          className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all border border-blue-100 active:scale-95"
        >
          <User size={12} /> Tenant
        </button>
        <button
          onClick={() => addVariable('landlord_name', 'Landlord')}
          className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all border border-blue-100 active:scale-95"
        >
          <Landmark size={12} /> Landlord
        </button>
        <button
          onClick={() => addVariable('rent_amount', 'Rent')}
          className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all border border-blue-100 active:scale-95"
        >
          <Banknote size={12} /> Rent
        </button>
        <button
          onClick={() => addVariable('start_date', 'Start Date')}
          className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all border border-blue-100 active:scale-95"
        >
          <Calendar size={12} /> Date
        </button>
      </div>

      {/* Dynamic Clauses */}
      <div className="relative px-2">
        <button
          onClick={() => setShowClauses(!showClauses)}
          disabled={loadingClauses}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-extrabold rounded-xl transition-all shadow-sm border
            ${showClauses ? 'bg-green-600 text-white border-green-700 shadow-green-100' : 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'}`}
        >
          {loadingClauses ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Clause Library
          <ChevronDown size={14} className={`transition-transform duration-200 ${showClauses ? 'rotate-180' : ''}`} />
        </button>

        {showClauses && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in duration-200">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Select an approved clause</h4>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {approvedClauses.length > 0 ? (
                approvedClauses.map((clause) => (
                  <button
                    key={clause._id || clause.id}
                    onClick={() => insertClause(clause)}
                    className="w-full text-left p-2.5 hover:bg-green-50 rounded-xl transition-all group"
                  >
                    <p className="text-xs font-bold text-gray-900 group-hover:text-green-700 transition-colors">{clause.title}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{clause.body}</p>
                    {clause.category && (
                      <span className="inline-block mt-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded uppercase">
                        {clause.category}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400 font-medium italic">No approved clauses found in the library.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
