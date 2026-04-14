import React, { useMemo } from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

const PreviewModal = ({ isOpen, onClose, html }) => {
  const samples = useMemo(() => ({
    tenant_name: 'Ali',
    landlord_name: 'Sara',
    rent_amount: '50,000 PKR',
    start_date: 'April 14, 2026',
    maintenance_clause: 'The Tenant shall keep the property in clean and habitable condition throughout the tenancy.',
    subletting_clause: 'The Tenant shall not sublet or assign the property without prior written consent from the Landlord.',
    deposit_clause: 'A security deposit of 50,000 PKR is required and will be held for the duration of the lease.',
    termination_clause: 'Either party may terminate this agreement with 30 days prior written notice.'
  }), []);

  // Use DOMParser for robust variable replacement
  const previewHtml = useMemo(() => {
    if (!html) return '';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const variables = doc.querySelectorAll('span[data-type="variable"]');
      
      variables.forEach(v => {
        const name = v.getAttribute('data-name');
        const replacement = samples[name] || `{${v.innerText}}`;
        const span = doc.createElement('strong');
        span.style.color = name?.includes('clause') ? '#15803d' : '#1e40af';
        span.innerText = replacement;
        v.parentNode.replaceChild(span, v);
      });

      return doc.body.innerHTML;
    } catch (error) {
      console.error('Preview replacement error:', error);
      return html;
    }
  }, [html, samples]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">Document Preview</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Dynamic content rendering system</p>
            </div>
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
                        p { margin-bottom: 15px; }
                      </style>
                    </head>
                    <body>${previewHtml}</body>
                  </html>
                `);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <ExternalLink size={16} /> Open in New Tab
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-xl"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-gray-100/50 flex justify-center">
            <div 
              className="bg-white w-[794px] min-h-[1123px] shadow-2xl border border-gray-200 p-[80px] prose prose-blue prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-blue-700"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
        </div>

        <div className="p-4 px-6 border-t border-gray-100 flex justify-end bg-white">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all hover:shadow-lg active:scale-95"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
