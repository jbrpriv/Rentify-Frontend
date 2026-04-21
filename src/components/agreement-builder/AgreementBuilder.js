import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { ResizableImage } from './ResizableImage';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Eye, CheckCircle2, Loader2, Save, Keyboard, ZoomIn, ZoomOut } from 'lucide-react';
import { CharacterCount } from '@tiptap/extension-character-count';
import { toast } from 'react-hot-toast';

import { Variable } from './VariableExtension';
import { FontSize } from './FontSizeExtension';
import { ClausesPlaceholder } from './ClausesPlaceholder';
import { DualColumn } from './DualColumnExtension';
import Toolbar from './Toolbar';
import FloatingToolbox from './FloatingToolbox';
import PreviewModal from './PreviewModal';
import ShortcutsModal from './ShortcutsModal';
import './builder.css';

const ZOOM_LEVELS = [75, 100, 125, 150];

const AgreementBuilder = ({ initialContent = '', onSave, isSaving = false, templateType = 'agreement' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle | saving | saved
  const autoSaveTimerRef = useRef(null);
  const lastSavedRef = useRef(null);

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
    CharacterCount.configure({
      mode: 'textSize',
    }),
  ], []);

  const editor = useEditor({
    extensions,
    content: initialContent || '<h1>Rental Agreement</h1><p>Type your agreement here. Insert variables or clauses using the toolbox on the right.</p>',
    editorProps: {
      attributes: {
        class: 'a4-page outline-none',
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

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S → Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
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

  const handleSave = useCallback(() => {
    if (!editor) return;
    const content = {
      html: editor.getHTML(),
      json: editor.getJSON(),
    };
    if (onSave) onSave(content);
  }, [editor, onSave]);

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

  if (!editor) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
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
        onToggleToolbox={() => setIsToolboxOpen(!isToolboxOpen)} 
      />

      {/* Editor Main Area */}
      <div className={`flex-1 overflow-y-auto document-container zoom-${zoom}`}>
        <div className="relative">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Floating Toolbox */}
      <FloatingToolbox 
        editor={editor} 
        templateType={templateType} 
        isOpen={isToolboxOpen}
        onClose={() => setIsToolboxOpen(false)}
      />

      {/* Preview Modal */}
      <PreviewModal 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        html={editor.getHTML()} 
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

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
