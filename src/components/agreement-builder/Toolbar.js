import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  User, 
  Home, 
  DollarSign, 
  Calendar,
  Type
} from 'lucide-react';

const Toolbar = ({ editor }) => {
  if (!editor) return null;

  const addVariable = (name, label) => {
    editor.chain().focus().insertContent({
      type: 'variable',
      attrs: { name, label }
    }).run();
  };

  const ToggleButton = ({ onClick, isActive, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="sticky top-0 z-10 w-full bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap items-center gap-1 shadow-sm">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 pr-4 border-r border-gray-100">
        <ToggleButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={18} />
        </ToggleButton>
        <ToggleButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={18} />
        </ToggleButton>
        <ToggleButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <Underline size={18} />
        </ToggleButton>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1 px-4 border-r border-gray-100">
        <ToggleButton 
          onClick={() => editor.chain().focus().setTextAlign('left').run()} 
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </ToggleButton>
        <ToggleButton 
          onClick={() => editor.chain().focus().setTextAlign('center').run()} 
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </ToggleButton>
        <ToggleButton 
          onClick={() => editor.chain().focus().setTextAlign('right').run()} 
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight size={18} />
        </ToggleButton>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 px-4 border-r border-gray-100">
        <select
          className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val) }).run();
          }}
          value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : 'p'}
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
        </select>
      </div>

      {/* Variables */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-[10px] uppercase font-bold text-gray-400">Insert Variable:</span>
        <button
          onClick={() => addVariable('tenant_name', 'Tenant Name')}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
        >
          <User size={14} /> Tenant
        </button>
        <button
          onClick={() => addVariable('landlord_name', 'Landlord Name')}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
        >
          <Home size={14} /> Landlord
        </button>
        <button
          onClick={() => addVariable('rent_amount', 'Rent Amount')}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
        >
          <DollarSign size={14} /> Rent
        </button>
        <button
          onClick={() => addVariable('start_date', 'Start Date')}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
        >
          <Calendar size={14} /> Date
        </button>
      </div>

      <div className="h-6 w-[1px] bg-gray-200 mx-2" />

      {/* Clauses */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-[10px] uppercase font-bold text-gray-400">Clauses:</span>
        <button
          onClick={() => addVariable('maintenance_clause', 'Maintenance')}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors border border-green-100"
        >
          Maintenance
        </button>
        <button
          onClick={() => addVariable('subletting_clause', 'Subletting')}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors border border-green-100"
        >
          Subletting
        </button>
        <button
          onClick={() => addVariable('deposit_clause', 'Security Deposit')}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors border border-green-100"
        >
          Deposit
        </button>
        <button
          onClick={() => addVariable('termination_clause', 'Termination')}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors border border-green-100"
        >
          Termination
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
