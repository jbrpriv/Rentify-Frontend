import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Eye, FileJson, FileCode, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Variable } from './VariableExtension';
import Toolbar from './Toolbar';
import PreviewModal from './PreviewModal';
import './builder.css';

const AgreementBuilder = ({ initialContent = '', onSave }) => {
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Variable,
    ],
    content: initialContent || '<h1>Rental Agreement</h1><p>Type your agreement here. Insert variables using the buttons above.</p>',
    editorProps: {
      attributes: {
        class: 'a4-page outline-none',
      },
    },
  });

  const exportAsJSON = () => {
    if (!editor) return;
    const json = editor.getJSON();
    console.log('Exported JSON:', json);
    toast.success('Document exported to console as JSON');
    // In a real app, this would be saved to state or backend
    return json;
  };

  const exportAsHTML = () => {
    if (!editor) return;
    const html = editor.getHTML();
    console.log('Exported HTML:', html);
    toast.success('Document exported to console as HTML');
    return html;
  };

  const handleSave = () => {
    if (!editor) return;
    const content = {
      html: editor.getHTML(),
      json: editor.getJSON(),
    };
    if (onSave) onSave(content);
    toast.success('Agreement state captured locally');
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      {/* Top Header / Actions */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <CheckCircle2 className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Agreement Builder</h2>
            <p className="text-xs text-gray-500 font-medium">Draft legally binding documents with dynamic variables</p>
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
            onClick={exportAsJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <FileJson size={16} /> JSON
          </button>
          <button
            onClick={exportAsHTML}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <FileCode size={16} /> HTML
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm ml-2"
          >
            Capture State
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar editor={editor} />

      {/* Editor Main Area */}
      <div className="flex-1 overflow-y-auto document-container">
        <div className="relative">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        html={editor.getHTML()} 
      />

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <span>Words: {editor.storage.characterCount?.words?.() || 0}</span>
          <span>Characters: {editor.storage.characterCount?.characters?.() || 0}</span>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 size={12} />
          <span>Editor Ready</span>
        </div>
      </div>
    </div>
  );
};

export default AgreementBuilder;
