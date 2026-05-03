import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { ResizableImage } from './ResizableImage';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Eye, CheckCircle2, Loader2, Save, Keyboard, ZoomIn, ZoomOut } from 'lucide-react';
import { CharacterCount } from '@tiptap/extension-character-count';
import { toast } from 'react-hot-toast';
import { STATIC_AGREEMENT_TEMPLATES } from './StaticTemplates';
import { VISUAL_THEMES, getThemeById, themeToCssVars } from './VisualThemes';
import { applyLayoutRoles } from './LayoutEngine';

import { Variable } from './VariableExtension';
import { FontSize } from './FontSizeExtension';
import { ClausesPlaceholder } from './ClausesPlaceholder';
import { DualColumn, DualColumnSide } from './DualColumnExtension';
import Toolbar from './Toolbar';
import { generateLayoutCss } from './generateLayoutCss';
import FloatingToolbox from './FloatingToolbox';
import FloatingTemplateLibrary from './FloatingTemplateLibrary';
import PreviewModal from './PreviewModal';
import ShortcutsModal from './ShortcutsModal';
import './builder.css';

const ZOOM_LEVELS = [75, 100, 125, 150];
const FONT_SIZE_STEPS = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];

const AgreementBuilder = ({ initialContent = '', onSave, isSaving = false, templateType = 'agreement' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [activeTheme, setActiveTheme] = useState('modern-minimalist');
  const [customWatermark, setCustomWatermark] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle | saving | saved
  const autoSaveTimerRef = useRef(null);
  const lastSavedRef = useRef(null);
  const editorWrapperRef = useRef(null);

  const extensions = React.useMemo(() => [
    StarterKit.configure({
      history: {
        depth: 100,
      },
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph', 'image'],
    }),
    ResizableImage.configure({
      HTMLAttributes: {
        class: 'document-image max-w-full rounded-lg shadow-sm',
      },
    }),
    TextStyle,
    Color,
    Variable,
    FontSize,
    ClausesPlaceholder,
    DualColumn,
    DualColumnSide,
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'agreement-table',
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
    CharacterCount.configure({
      mode: 'textSize',
    }),
  ], []);

  const editor = useEditor({
    extensions,
    content: initialContent || '<h1>Rental Agreement</h1><p>Type your agreement here. Insert variables or clauses using the toolbox on the right.</p>',
    editorProps: {
      attributes: () => {
        const theme = getThemeById(activeTheme);
        const logoAlign = theme?.logo?.alignment || 'left';
        return { class: `outline-none logo-${logoAlign}` };
      },
    },
  });

  // ── Auto-save to localStorage ──
  useEffect(() => {
    if (!editor) return;

    const storageKey = `agreement-builder-draft-${templateType}`;

    const handleUpdate = () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

      setAutoSaveStatus('idle');
      autoSaveTimerRef.current = setTimeout(() => {
        try {
          const content = {
            html: editor.getHTML(),
            json: editor.getJSON(),
            timestamp: Date.now(),
          };
          localStorage.setItem(storageKey, JSON.stringify(content));
          setAutoSaveStatus('saved');
          lastSavedRef.current = new Date();

          // Reset to idle after 3s
          setTimeout(() => setAutoSaveStatus('idle'), 3000);
        } catch (err) {
          console.warn('Auto-save failed:', err);
        }
      }, 5000); // 5s debounce
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [editor, templateType]);

  const activeLayoutStyle = React.useMemo(() => {
    const theme = getThemeById(activeTheme);
    return theme?.layoutStyle || 'minimalist';
  }, [activeTheme]);

  // ── Layout Engine Hook ──
  useEffect(() => {
    if (!editor) return;

    const handleLayoutUpdate = () => {
      if (editorWrapperRef.current) {
        applyLayoutRoles(editorWrapperRef.current, activeLayoutStyle);
      }
    };

    editor.on('update', handleLayoutUpdate);
    // Initial apply
    handleLayoutUpdate();

    return () => editor.off('update', handleLayoutUpdate);
  }, [editor, activeLayoutStyle]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      const stepFontSize = (direction) => {
        if (!editor) return;

        const activeSize = editor.getAttributes('fontSize')?.size;
        const normalized = FONT_SIZE_STEPS.includes(activeSize) ? activeSize : '16px';
        const currentIndex = FONT_SIZE_STEPS.indexOf(normalized);
        const nextIndex = direction === 'up'
          ? Math.min(currentIndex + 1, FONT_SIZE_STEPS.length - 1)
          : Math.max(currentIndex - 1, 0);

        editor.chain().focus().setFontSize(FONT_SIZE_STEPS[nextIndex]).run();
      };

      // Ctrl+S → Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Ctrl+Shift+Period/Comma → Font size up/down (use physical key code to avoid locale differences)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'Period') {
        e.preventDefault();
        stepFontSize('up');
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'Comma') {
        e.preventDefault();
        stepFontSize('down');
      }

      // Ctrl+Shift+E/R/L → Align center/right/left
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        editor.chain().focus().setTextAlign('center').run();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        editor.chain().focus().setTextAlign('right').run();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        editor.chain().focus().setTextAlign('left').run();
      }

      // ? → Show shortcuts (only when not typing in an input)
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.closest('.ProseMirror')) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Google Font injection ──
  useEffect(() => {
    const theme = getThemeById(activeTheme);
    const fontUrl = theme?.fonts?.googleFontUrl;
    const linkId = 'agreement-theme-font';

    // Remove old link
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
  }, [activeTheme]);

  // ── Sync logo alignment class on ProseMirror when theme changes ──
  useEffect(() => {
    if (!editor) return;
    const theme = getThemeById(activeTheme);
    const logoAlign = theme?.logo?.alignment || 'left';
    const pm = editor.view.dom;
    pm.classList.remove('logo-left', 'logo-center', 'logo-right');
    pm.classList.add(`logo-${logoAlign}`);
  }, [editor, activeTheme]);

  const themeVars = React.useMemo(() => {
    const theme = getThemeById(activeTheme);
    const vars = themeToCssVars(theme);

    if (customWatermark) {
      vars['--theme-watermark-text'] = JSON.stringify(customWatermark);
      vars['--theme-watermark-color'] = '#E11D48';
      vars['--theme-watermark-opacity'] = 0.08;
    }

    return vars;
  }, [activeTheme, customWatermark]);


  const handleSave = useCallback(() => {
    if (!editor) return;
    const content = {
      html: editor.getHTML(),
      json: editor.getJSON(),
      themeId: activeTheme,
      customWatermark,
    };
    if (onSave) onSave(content);
  }, [editor, onSave, activeTheme, customWatermark]);

  const handleApplyTemplate = useCallback((selectedTemplate) => {
    if (!editor || !selectedTemplate) return;
    setPendingTemplate(selectedTemplate);
  }, [editor]);

  const confirmApplyTemplate = useCallback(() => {
    if (!editor || !pendingTemplate) return;

    if (pendingTemplate.bodyJson) {
      editor.commands.setContent(pendingTemplate.bodyJson);
    } else if (pendingTemplate.bodyHtml) {
      editor.commands.setContent(pendingTemplate.bodyHtml);
    }

    toast.success(`Applied template: ${pendingTemplate.name || 'Untitled Template'}`);
    setPendingTemplate(null);
    setIsTemplateLibraryOpen(false);
  }, [editor, pendingTemplate]);

  // ── Zoom controls ──
  const cycleZoom = (direction) => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (direction === 'in' && idx < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[idx + 1]);
    } else if (direction === 'out' && idx > 0) {
      setZoom(ZOOM_LEVELS[idx - 1]);
    }
  };

  // ── Word count helpers ──
  const getWordCount = () => {
    if (!editor) return 0;
    const text = editor.state.doc.textContent;
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const getCharCount = () => {
    if (!editor) return 0;
    return editor.state.doc.textContent.length;
  };

  const layoutCss = React.useMemo(() => {
    const theme = getThemeById(activeTheme);
    return generateLayoutCss(theme, themeVars);
  }, [activeTheme, themeVars]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50 border border-gray-200 rounded-2xl">
      <style>{layoutCss}</style>
      {/* Top Header / Actions */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <CheckCircle2 className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Agreement Builder</h2>
            <p className="text-[11px] text-gray-500 font-medium">Draft documents with dynamic variables</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <Eye size={16} /> Preview
          </button>

          <div className="h-6 w-[1px] bg-gray-200 mx-1" />

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save & Submit'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        editor={editor}
        templateType={templateType}
        isToolboxOpen={isToolboxOpen}
        onToggleToolbox={() => {
          setIsToolboxOpen((prev) => !prev);
          setIsTemplateLibraryOpen(false);
        }}
        isTemplateLibraryOpen={isTemplateLibraryOpen}
        onToggleTemplateLibrary={() => {
          setIsTemplateLibraryOpen((prev) => !prev);
          setIsToolboxOpen(false);
        }}
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
        customWatermark={customWatermark}
        onWatermarkChange={setCustomWatermark}
      />

      {/* Editor Main Area */}
      <div
        className={`flex-1 document-container zoom-${zoom} theme-${activeTheme} layout-${activeLayoutStyle}`}
        style={{
          ...themeVars,
        }}
      >
        <div className="document-zoom-wrapper" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
          {/* A4 page wrapper — hero band sits above ProseMirror */}
          <div
            ref={editorWrapperRef}
            className={`relative a4-page ${getThemeById(activeTheme)?.hero?.enabled ? 'has-hero' : ''}`}
            data-layout-style={activeLayoutStyle}
            style={{
              backgroundColor: getThemeById(activeTheme)?.pageBackground || '#FFFFFF',
              backgroundImage: getThemeById(activeTheme)?.textures?.pageBackground !== 'none'
                ? getThemeById(activeTheme)?.textures?.pageBackground
                : undefined,
            }}
          >
            {/* Hero Band — real DOM block, NOT a CSS pseudo-element */}
            {(() => {
              const t = getThemeById(activeTheme);
              if (!t?.hero?.enabled) return null;
              return (
                <div
                  className="theme-hero-band"
                  style={{
                    height: t.hero.height,
                    minHeight: t.hero.height,
                    background: t.hero.background || t.colors.heroBackground || 'transparent',
                  }}
                >
                  <div
                    className="hero-title"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newTitle = e.target.innerText;
                      editor.commands.command(({ tr, state }) => {
                        const firstNode = state.doc.firstChild;
                        if (firstNode && firstNode.type.name === 'heading') {
                          tr.insertText(newTitle, 1, firstNode.nodeSize - 1);
                        } else {
                          // If no heading exists, prepend one
                          editor.commands.insertContentAt(0, {
                            type: 'heading',
                            attrs: { level: 1 },
                            content: [{ type: 'text', text: newTitle }]
                          });
                        }
                        return true;
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.target.blur();
                      }
                    }}
                    style={{
                      fontFamily: t.fonts.heading,
                      color: t.hero.titleColor || '#FFFFFF',
                      fontSize: t.hero.titleFontSize || '2.5rem',
                      outline: 'none',
                      cursor: 'text',
                    }}
                  >
                    {editor?.state?.doc?.firstChild?.type?.name === 'heading'
                      ? editor.state.doc.firstChild.textContent
                      : 'Document Title'}
                  </div>
                </div>
              );
            })()}
            <EditorContent
              editor={editor}
              className="a4-page-body"
              style={{
                '--theme-content-padding': getThemeById(activeTheme)?.hero?.enabled ? '40px 80px 80px' : '80px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Toolbox */}
      <FloatingToolbox
        editor={editor}
        templateType={templateType}
        isOpen={isToolboxOpen}
        onClose={() => setIsToolboxOpen(false)}
      />

      <FloatingTemplateLibrary
        templates={templateType === 'receipt' ? [] : STATIC_AGREEMENT_TEMPLATES}
        isOpen={isTemplateLibraryOpen}
        onClose={() => setIsTemplateLibraryOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        html={editor.getHTML()}
        activeTheme={activeTheme}
        customWatermark={customWatermark}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Template Replace Confirmation Modal */}
      {pendingTemplate && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-slate-900">Replace Current Document?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Apply template <span className="font-semibold text-slate-700">"{pendingTemplate.name || 'Untitled Template'}"</span> and replace current editor content.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingTemplate(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmApplyTemplate}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 border border-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Replace Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <span>Words: {getWordCount()}</span>
          <span>Characters: {getCharCount()}</span>

          {/* Auto-save indicator */}
          <span className={`autosave-indicator ${autoSaveStatus === 'saved' ? 'saved' : autoSaveStatus === 'saving' ? 'saving saving-pulse' : 'unsaved'}`}>
            {autoSaveStatus === 'saved' && (
              <>
                <CheckCircle2 size={11} />
                Draft saved
              </>
            )}
            {autoSaveStatus === 'saving' && (
              <>
                <Loader2 size={11} className="animate-spin" />
                Saving...
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => cycleZoom('out')}
              disabled={zoom === ZOOM_LEVELS[0]}
              className={`p-1 rounded transition-colors ${zoom === ZOOM_LEVELS[0] ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-gray-500 font-bold normal-case">{zoom}%</span>
            <button
              onClick={() => cycleZoom('in')}
              disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              className={`p-1 rounded transition-colors ${zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1] ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          <div className="h-3 w-[1px] bg-gray-200" />

          {/* Shortcuts button */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard size={13} />
          </button>

          <div className="h-3 w-[1px] bg-gray-200" />

          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 size={12} />
            <span>Editor Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AgreementBuilder);