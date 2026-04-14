import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const PreviewModal = ({ isOpen, onClose, html }) => {
  if (!isOpen) return null;

  // Function to replace variables with sample values for preview
  const getPreviewHtml = (initialHtml) => {
    let preview = initialHtml;
    const samples = {
      tenant_name: 'Ali',
      landlord_name: 'Sara',
      rent_amount: '50,000 PKR',
      start_date: 'April 14, 2026',
      maintenance_clause: 'The Tenant shall keep the property in clean and habitable condition throughout the tenancy.',
      subletting_clause: 'The Tenant shall not sublet or assign the property without prior written consent from the Landlord.',
      deposit_clause: 'A security deposit of 50,000 PKR is required and will be held for the duration of the lease.',
      termination_clause: 'Either party may terminate this agreement with 30 days prior written notice.'
    };

    // Replace <span data-type="variable" data-name="tenant_name">...</span> with sample value
    // We use innerText/textContent approach effectively by doing a regex or string manipulation
    // Since Tiptap exports clean HTML, we can look for the specific data-name
    Object.entries(samples).forEach(([key, value]) => {
      const regex = new RegExp(`<span[^>]*data-name="${key}"[^>]*>(.*?)</span>`, 'g');
      preview = preview.replace(regex, `<strong style="color: #1e40af;">${value}</strong>`);
    });

    return preview;
  };

  const previewHtml = getPreviewHtml(html);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Document Preview</h3>
            <p className="text-xs text-gray-500">Variables have been replaced with sample values for verification.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const win = window.open('', '_blank');
                win.document.write(`
                  <html>
                    <head>
                      <title>Agreement Preview</title>
                      <style>
                        body { font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                        strong { color: #1e40af; }
                        h1 { font-size: 2.5em; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        h2 { margin-top: 30px; }
                      </style>
                    </head>
                    <body>\${previewHtml}</body>
                  </html>
                `);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-gray-50 flex justify-center">
            <div 
              className="bg-white w-[794px] min-h-[1123px] shadow-sm border border-gray-200 p-[80px] prose prose-blue max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
        </div>

        <div className="p-4 px-6 border-t border-gray-100 flex justify-end bg-white">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
