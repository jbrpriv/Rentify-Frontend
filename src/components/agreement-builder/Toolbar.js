import React, { useState, useRef } from 'react';
import Script from 'next/script';
import { toast } from 'react-hot-toast';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  ChevronDown, Image as ImageIcon,
  Undo2, Redo2
} from 'lucide-react';

const Toolbar = ({ editor }) => {
  const [showFontSizes, setShowFontSizes] = useState(false);
  const widgetRef = useRef(null);

  if (!editor) return null;

  const insertImage = () => {
    if (!window.cloudinary) {
      const url = window.prompt('Image upload widget is still loading. Enter URL manually:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
      return;
    }

    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dj4a5robb',
        uploadPreset: 'rentify_unsigned',
        sources: ['local', 'url', 'camera'],
        resourceType: 'image',
        showAdvancedOptions: false,
        cropping: false,
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
        if (error) {
          console.error('Cloudinary Widget Error:', error);
          toast.error('Upload failed. Check your preset settings.');
          return;
        }

        if (result && result.event === 'success') {
          const imageUrl = result.info.secure_url || result.info.url;
          if (imageUrl && editor) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            toast.success('Image added');
          }
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
      <Script 
        src="https://upload-widget.cloudinary.com/global/all.js" 
      />
      <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 sticky top-0 z-50">
        
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-100">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={`p-1.5 rounded transition-colors ${
              !editor.can().undo()
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={`p-1.5 rounded transition-colors ${
              !editor.can().redo()
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-100">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
            title="Underline (Ctrl+U)"
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

        {/* Media */}
        <div className="flex items-center gap-1 px-2">
          <button
            onClick={insertImage}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
            title="Upload Image (Cloudinary)"
          >
            <ImageIcon size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Toolbar;
