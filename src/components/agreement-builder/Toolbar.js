import React, { useState } from 'react';
import Script from 'next/script';
import { toast } from 'react-hot-toast';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  ChevronDown, Image as ImageIcon, Undo2, Redo2, Sparkles,
  ScrollText, Columns, Table as TableIcon, Check, LayoutTemplate, Palette, Stamp
} from 'lucide-react';
import { VISUAL_THEMES } from './VisualThemes';

const TableGridPicker = ({ onSelect }) => {
  const [hovered, setHovered] = useState({ r: 0, c: 0 });
  const rows = 10;
  const cols = 10;

  return (
    <div className="flex flex-col items-center">
      <div
        className="grid gap-[2px] bg-slate-200 border border-slate-200 p-[2px] rounded-md"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        onMouseLeave={() => setHovered({ r: 0, c: 0 })}
      >
        {Array.from({ length: rows }).map((_, rIndex) => (
          Array.from({ length: cols }).map((_, cIndex) => {
            const r = rIndex + 1;
            const c = cIndex + 1;
            const isHovered = r <= hovered.r && c <= hovered.c;

            return (
              <div
                key={`${r}-${c}`}
                className={`w-3.5 h-3.5 rounded-sm transition-colors cursor-pointer ${isHovered ? 'bg-indigo-500' : 'bg-white'
                  }`}
                onMouseEnter={() => setHovered({ r, c })}
                onClick={() => onSelect(hovered.r, hovered.c)}
              />
            );
          })
        ))}
      </div>
      <div className="mt-2 text-xs font-bold text-indigo-600 h-4">
        {hovered.r > 0 && hovered.c > 0 ? `${hovered.c} x ${hovered.r} Table` : ' '}
      </div>
    </div>
  );
};

const Toolbar = ({
  editor,
  isToolboxOpen,
  onToggleToolbox,
  templateType,
  isTemplateLibraryOpen,
  onToggleTemplateLibrary,
  activeTheme,
  onThemeChange,
  customWatermark,
  onWatermarkChange,
}) => {
  const [showFontSizes, setShowFontSizes] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showWatermarkMenu, setShowWatermarkMenu] = useState(false);

  if (!editor) return null;

  const insertImage = () => {
    if (!window.cloudinary) {
      const url = window.prompt('Image upload widget is still loading. Enter URL:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
      return;
    }
    window.cloudinary.openUploadWidget(
      { cloudName: 'dj4a5robb', uploadPreset: 'rentify_unsigned', sources: ['local', 'url'], resourceType: 'image', multiple: false },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          editor.chain().focus().setImage({ src: result.info.secure_url }).run();
        }
      }
    );
  };

  const setFontSize = (size) => {
    editor.chain().focus().setFontSize(size).run();
    setShowFontSizes(false);
  };

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];

  return (
    <>
      <Script src="https://upload-widget.cloudinary.com/global/all.js" />
      <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 sticky top-[57px] z-40">

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-100">
          <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`p-1.5 rounded transition-colors ${!editor.can().undo() ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`} title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
          <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`p-1.5 rounded transition-colors ${!editor.can().redo() ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`} title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-100">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`} title="Bold"><Bold size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`} title="Italic"><Italic size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`} title="Underline"><Underline size={16} /></button>
        </div>

        {/* Font Size */}
        <div className="relative border-r border-gray-100 px-2" title="Font Size">
          <button onClick={() => setShowFontSizes(!showFontSizes)} className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded">
            Size <ChevronDown size={14} />
          </button>
          {showFontSizes && (
            <>
              <div className="fixed inset-0 z-[90]" onClick={() => setShowFontSizes(false)} />
              <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[100]">
                {fontSizes.map(size => (
                  <button key={size} onClick={() => setFontSize(size)} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-blue-50 hover:text-blue-600">{size}</button>
                ))}
                <button onClick={() => editor.chain().focus().unsetFontSize().run()} className="w-full text-left px-4 py-2 text-xs font-bold border-t border-gray-100 text-red-500 hover:bg-red-50">Reset</button>
              </div>
            </>
          )}
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-100">
          <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`} title="Align Left"><AlignLeft size={16} /></button>
          <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`} title="Align Center"><AlignCenter size={16} /></button>
          <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`} title="Align Right"><AlignRight size={16} /></button>
        </div>

        {/* Insert Elements with explicit labels */}
        <div className="flex items-center gap-2 px-2 border-r border-gray-100">
          <button
            onClick={onToggleToolbox}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${isToolboxOpen ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
          >
            <Sparkles size={14} />
            <span className="text-xs font-bold leading-none">Variables</span>
          </button>

          {templateType !== 'receipt' && (
            <button
              onClick={onToggleTemplateLibrary}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                isTemplateLibraryOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-indigo-600 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'
              }`}
            >
              <LayoutTemplate size={14} />
              <span className="text-xs font-bold leading-none">Use Template</span>
            </button>
          )}

          {templateType !== 'receipt' && (
            <button
              onClick={() => editor.chain().focus().insertContent({ type: 'clausesPlaceholder' }).run()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-600 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <ScrollText size={14} />
              <span className="text-xs font-bold leading-none">Clauses</span>
            </button>
          )}

          <button
            onClick={() => editor.chain().focus().insertContent({
              type: 'dualColumn',
              content: [
                { type: 'dualColumnSide', content: [{ type: 'paragraph' }] },
                { type: 'dualColumnSide', content: [{ type: 'paragraph' }] },
              ],
            }).run()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Columns size={14} />
            <span className="text-xs font-bold leading-none">Split Column</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowTableMenu(!showTableMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${editor.isActive('table') || showTableMenu ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
                }`}
            >
              <TableIcon size={14} />
              <span className="text-xs font-bold leading-none">Table <ChevronDown size={12} className="inline ml-0.5 opacity-50" /></span>
            </button>

            {showTableMenu && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setShowTableMenu(false)} />
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[100] min-w-[180px]">

                  {!editor.isActive('table') ? (
                    <div className="p-3 bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                        Hover to Size
                      </p>
                      <TableGridPicker
                        onSelect={(rows, cols) => {
                          editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
                          setShowTableMenu(false);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="py-1">
                      <button onClick={() => { editor.chain().focus().addColumnBefore().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700">Add Column Before</button>
                      <button onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700">Add Column After</button>
                      <button onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700 border-b border-gray-100">Delete Column</button>

                      <button onClick={() => { editor.chain().focus().addRowBefore().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700">Add Row Before</button>
                      <button onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700">Add Row After</button>
                      <button onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700 border-b border-gray-100">Delete Row</button>

                      <button onClick={() => { editor.chain().focus().goToNextCell().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700 border-b border-gray-100 flex items-center justify-between">
                        Next Cell <span className="text-[10px] text-slate-400 bg-slate-200 px-1 rounded">Tab</span>
                      </button>

                      <button onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-red-50 text-red-600">Delete Table</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Theme Picker */}
        {templateType !== 'receipt' && (
          <div className="relative px-2 border-r border-gray-100">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                showThemePicker
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white text-violet-600 border-violet-200 hover:border-violet-400 hover:bg-violet-50'
              }`}
            >
              <Palette size={14} />
              <span className="text-xs font-bold leading-none">Theme</span>
              <ChevronDown size={12} className="opacity-50" />
            </button>

            {showThemePicker && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setShowThemePicker(false)} />
                <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[100]">
                  <div className="px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600">
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">Visual Theme</p>
                  </div>
                  <div className="p-2 max-h-[340px] overflow-y-auto">
                    {VISUAL_THEMES.map((theme) => {
                      const isActive = activeTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => {
                            onThemeChange?.(theme.id);
                            setShowThemePicker(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all flex items-center gap-3 ${
                            isActive
                              ? 'bg-violet-50 border border-violet-200 shadow-sm'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          {/* Color swatches */}
                          <div className="flex gap-0.5 flex-shrink-0">
                            <div
                              className="w-4 h-4 rounded-l-md border border-gray-200"
                              style={{ backgroundColor: theme.preview.primarySwatch }}
                            />
                            <div
                              className="w-4 h-4 border-t border-b border-gray-200"
                              style={{ backgroundColor: theme.preview.accentSwatch }}
                            />
                            <div
                              className="w-4 h-4 rounded-r-md border border-gray-200"
                              style={{ backgroundColor: theme.preview.bgSwatch }}
                            />
                          </div>
                          {/* Theme info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${
                              isActive ? 'text-violet-700' : 'text-slate-800'
                            }`}>
                              {theme.name}
                              {isActive && <Check size={12} className="inline ml-1 text-violet-600" />}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{theme.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Watermark Picker */}
        {templateType !== 'receipt' && (
          <div className="relative px-2 border-r border-gray-100">
            <button
              onClick={() => setShowWatermarkMenu(!showWatermarkMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                showWatermarkMenu || customWatermark
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white text-rose-600 border-rose-200 hover:border-rose-400 hover:bg-rose-50'
              }`}
            >
              <Stamp size={14} />
              <span className="text-xs font-bold leading-none">Watermark</span>
              <ChevronDown size={12} className="opacity-50" />
            </button>

            {showWatermarkMenu && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setShowWatermarkMenu(false)} />
                <div className="absolute top-full left-0 mt-1 w-[260px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[100]">
                  <div className="px-3 py-2 bg-gradient-to-r from-rose-600 to-pink-600">
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">Document Watermark</p>
                  </div>
                  <div className="p-3 bg-slate-50 flex flex-col gap-2">
                    <input
                      type="text"
                      value={customWatermark || ''}
                      onChange={(e) => onWatermarkChange(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL or DRAFT"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                    <div className="flex gap-2 mt-1">
                      <button 
                        onClick={() => { onWatermarkChange('DRAFT'); setShowWatermarkMenu(false); }}
                        className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                      >
                        DRAFT
                      </button>
                      <button 
                        onClick={() => { onWatermarkChange('CONFIDENTIAL'); setShowWatermarkMenu(false); }}
                        className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                      >
                        CONFIDENTIAL
                      </button>
                    </div>
                    <button 
                      onClick={() => { onWatermarkChange(''); setShowWatermarkMenu(false); }}
                      className="w-full py-1.5 mt-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors"
                    >
                      Clear Watermark
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Media */}
        <div className="flex items-center gap-1 px-2">
          <button onClick={insertImage} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Upload Image"><ImageIcon size={16} /></button>
        </div>

      </div>
    </>
  );
};

export default Toolbar;
