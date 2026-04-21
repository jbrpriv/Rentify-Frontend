import React, { useMemo } from 'react';
import { X, ExternalLink, ShieldCheck, ScrollText } from 'lucide-react';

const PreviewModal = ({ isOpen, onClose, html }) => {
  const samples = useMemo(() => ({
    // Parties
    tenant_name: 'Abdul Jabbar',
    landlord_name: 'Sara Landlord',
    // Property
    property_title: 'Sara Seed Property 11 - Studio',
    property_address: '464 Business District Road, Rawalpindi',
    // Financials
    rent_amount: '34,000 PKR',
    monthly_rent: '34,000 PKR',
    security_deposit: '3,400 PKR',
    deposit_amount: '3,400 PKR',
    total_move_in: '37,400 PKR',
    maintenance_fee: '1,500 PKR',
    late_fee: '500 PKR',
    late_fee_amount: '500 PKR',
    late_fee_grace_days: '5 days',
    // Term
    start_date: 'April 16, 2026',
    end_date: 'April 16, 2027',
    duration_months: '12',
    // Policies
    utilities_included: 'Included',
    utilities_details: 'Electricity, Water, Gas',
    pet_allowed: 'Allowed',
    pet_deposit: '5,000 PKR',
    rent_escalation_enabled: 'Enabled',
    rent_escalation_percentage: '5%',
    termination_policy: '30-day written notice required.',
    // System
    current_date: new Date().toLocaleDateString(),
    agreement_id: 'AGR-77421-B',
    // Legacy Clauses (Builder support)
    maintenance_clause: 'The Tenant shall keep the property in clean and habitable condition throughout the tenancy.',
    subletting_clause: 'The Tenant shall not sublet or assign the property without prior written consent from the Landlord.',
    deposit_clause: 'A security deposit is required and will be held for the duration of the lease.',
    termination_clause: 'Either party may terminate this agreement with 30 days prior written notice.'
  }), []);

  // Use DOMParser for robust variable replacement and custom node handling
  const previewHtml = useMemo(() => {
    if (!html) return '';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 1. Replace Variables
      const variables = doc.querySelectorAll('span[data-type="variable"]');
      variables.forEach(v => {
        const name = v.getAttribute('data-name');
        const replacement = samples[name] || `[${name}]`;
        const span = doc.createElement('strong');
        span.className = 'preview-variable';
        span.style.color = '#0f172a'; // Standard black/slate text for the actual value
        span.style.fontWeight = '800';
        span.innerText = replacement;
        v.parentNode.replaceChild(span, v);
      });

      // 2. Handle Clauses Placeholder
      const placeholders = doc.querySelectorAll('div[data-type="clauses-placeholder"]');
      placeholders.forEach(p => {
        const div = doc.createElement('div');
        div.className = 'preview-clauses-placeholder my-6 p-6 border-2 border-dashed border-green-200 bg-green-50 rounded-xl text-center';
        div.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; color: #059669;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
            <span style="font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Selected Clauses Injection Point</span>
            <span style="font-size: 12px; opacity: 0.8; font-weight: 500;">Dynamic content from the clause library will populate here.</span>
          </div>
        `;
        p.parentNode.replaceChild(div, p);
      });

      // 3. Keep inline font-size styles as-is so the preview matches the editor

      return doc.body.innerHTML;
    } catch (error) {
      console.error('Preview replacement error:', error);
      return html;
    }
  }, [html, samples]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <style>{`
        .agreement-preview-container h1, 
        .agreement-preview-container h2, 
        .agreement-preview-container h3 { 
          font-weight: 900 !important; 
          color: #0f172a !important;
        }
        .agreement-preview-container .document-image { 
          max-width: 100%; 
          height: auto; 
          border-radius: 8px; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
          margin-top: 1.5em;
          margin-bottom: 1.5em;
        }
        .dual-column-wrapper {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 0;
          position: relative;
          min-height: 100px;
          margin: 1.5rem 0;
        }
        .dual-column-wrapper::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          border-left: 2px dotted #cbd5e1;
          transform: translateX(-50%);
          z-index: 1;
        }
        .dual-column-side {
          padding: 0 20px;
          position: relative;
          z-index: 2;
          min-width: 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
        
        .agreement-table {
          width: 100%;
          margin: 1.5rem 0;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .agreement-table th,
        .agreement-table td {
          min-width: 1em;
          border: 1px solid #cbd5e1;
          padding: 10px 14px;
          vertical-align: top;
        }
        .agreement-table th {
          font-weight: 800;
          text-align: left;
          background-color: #f8fafc;
          color: #334155;
        }
        .agreement-table p {
          margin: 0;
        }
        
        /* Inline font-size styles should apply directly; no override here. */
        @media print {
          .preview-clauses-placeholder { border: none !important; background: transparent !important; }
          .dual-column-wrapper::after { border-left-color: #000; }
        }
      `}</style>
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
                        body { font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #334155; }
                        h1, h2, h3 { font-weight: 900; color: #0f172a; }
                        h1 { font-size: 2.5em; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        strong { color: #1e40af; font-weight: 800; }
                        .document-image { display: block; margin: 2em auto; max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                        .preview-clauses-placeholder { border: 2px dashed #e2e8f0; padding: 40px; text-align: center; color: #94a3b8; border-radius: 12px; margin: 40px 0; }
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
              className="agreement-preview-container bg-white w-[794px] min-h-[1123px] shadow-2xl border border-gray-200 p-[80px] prose prose-blue prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-blue-700"
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
