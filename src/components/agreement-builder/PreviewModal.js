import React, { useMemo } from 'react';
import { X, ExternalLink, ShieldCheck, ScrollText } from 'lucide-react';
import { getThemeById, themeToCssVars } from './VisualThemes';
import { generateLayoutCss } from './generateLayoutCss';

const extractFirstBlock = (html, regex) => {
  const match = html.match(regex);
  if (!match) return { block: '', rest: html };
  const block = match[0];
  return { block, rest: html.replace(block, '') };
};

const applyThemeLayout = (html, layoutStyle = 'minimalist') => {
  if (!html) return html;

  let working = html;
  const { block: heading, rest: afterHeading } = extractFirstBlock(working, /<h1\b[^>]*>[\s\S]*?<\/h1>/i);
  working = afterHeading;
  const { block: intro, rest: afterIntro } = extractFirstBlock(working, /<p\b[^>]*>[\s\S]*?<\/p>/i);
  working = afterIntro;
  const { block: clauses, rest: afterClauses } = extractFirstBlock(working, /<div\b[^>]*sidebar-clauses-target[\s\S]*?<\/div>/i);
  working = afterClauses;

  const safeHeading = heading || '<h1>Rental Agreement</h1>';

  switch (layoutStyle) {
    case 'premium':
      return `<div class="layout-premium-hero"><div>${safeHeading}${intro || ''}</div>${clauses ? `<div class="layout-premium-summary" data-layout-role="primary-sidebar-item">${clauses}</div>` : ''}</div>${working}`;
    case 'contemporary':
      return `${safeHeading}<div class="layout-contemporary-top">${clauses ? `<div class="layout-contemporary-card" data-layout-role="primary-sidebar-item">${clauses}</div>` : ''}${intro ? `<div class="layout-contemporary-card">${intro}</div>` : ''}</div>${working}`;
    case 'modern':
      return `<div class="layout-modern-hero-grid"><div>${safeHeading}${intro || ''}</div>${clauses ? `<aside class="layout-modern-summary" data-layout-role="primary-sidebar-item">${clauses}</aside>` : ''}</div>${working}`;
    case 'ledger':
      return `<div class="layout-meta-strip"><span>Ledger View</span><span>${new Date().toLocaleDateString()}</span></div>${safeHeading}${working}`;
    case 'classic':
      return `${safeHeading}${intro || ''}${working}`;
    case 'legal':
      return `<div class="layout-meta-strip"><span>Agreement Preview</span><span>${new Date().toLocaleDateString()}</span></div>${safeHeading}${intro || ''}${working}`;
    case 'editorial':
      return `<div class="layout-editorial-header">${safeHeading}${intro || ''}</div>${working}`;
    case 'minimalist':
    default:
      return html;
  }
};

const PreviewModal = ({ isOpen, onClose, html, activeTheme = 'blank', customWatermark }) => {
  const theme = useMemo(() => getThemeById(activeTheme), [activeTheme]);
  const themeVars = useMemo(() => {
    const vars = themeToCssVars(theme);
    if (customWatermark !== undefined && customWatermark !== null) {
      vars['--theme-watermark-text'] = customWatermark ? `"${customWatermark}"` : '""';
      if (customWatermark) {
        vars['--theme-watermark-color'] = '#E11D48';
        vars['--theme-watermark-opacity'] = 0.08;
      }
    }
    return vars;
  }, [theme, customWatermark]);
  const samples = useMemo(() => ({
    // Parties
    tenant_name: 'John Carter',
    landlord_name: 'Emily Johnson',
    // Property
    property_title: 'Downtown Loft - Unit 5B',
    property_address: '742 Evergreen Terrace, Springfield, IL 62704',
    // Financials
    rent_amount: '$2,450 USD',
    monthly_rent: '$2,450 USD',
    security_deposit: '$2,450 USD',
    deposit_amount: '$2,450 USD',
    total_move_in: '$4,900 USD',
    maintenance_fee: '$125 USD',
    late_fee: '$75 USD',
    late_fee_amount: '$75 USD',
    late_fee_grace_days: '5 days',
    // Term
    start_date: 'May 1, 2026',
    end_date: 'April 30, 2027',
    duration_months: '12',
    // Policies
    utilities_included: 'Included',
    utilities_details: 'Electricity, Water, Trash Collection',
    pet_allowed: 'Allowed',
    pet_deposit: '$300 USD',
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

      // 3. Handle Clauses Placeholder
      const placeholders = doc.querySelectorAll('div[data-type="clauses-placeholder"]');
      placeholders.forEach(p => {
        const div = doc.createElement('div');
        div.className = 'preview-clauses-placeholder sidebar-clauses-target my-6 p-6 border-2 border-dashed border-green-200 bg-green-50 rounded-xl text-center';
        div.setAttribute('data-layout-role', 'primary-sidebar-item');
        div.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; color: #059669;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
            <span style="font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Clauses Sidebar</span>
            <span style="font-size: 11px; opacity: 0.8; font-weight: 500;">Dynamic legal clauses will be injected here in the final document.</span>
          </div>
        `;
        p.parentNode.replaceChild(div, p);
      });

      // 4. Apply layout transformation
      // Note: applyThemeLayout now handles the structural shift for sidebars
      return applyThemeLayout(doc.body.innerHTML, theme?.layoutStyle || 'minimalist');
    } catch (error) {
      console.error('Preview replacement error:', error);
      return html;
    }
  }, [html, samples, theme]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {theme?.fonts?.googleFontUrl && (
        <link rel="stylesheet" href={theme.fonts.googleFontUrl} />
      )}
      <style>{`
        ${generateLayoutCss(theme, themeVars)}
        
        .agreement-preview-container { 
          margin: 0 auto;
          display: block;
          position: relative;
        }

        .preview-variable { color: #0f172a; font-weight: 800; }
        
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

        @media print {
          .preview-clauses-placeholder { border: none !important; background: transparent !important; }
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
                        :root {
                          --theme-font-scale: ${themeVars['--theme-font-scale'] || 1};
                          --theme-heading-scale: ${themeVars['--theme-heading-scale'] || 1};
                          --theme-aside-width: ${themeVars['--theme-aside-width'] || '360px'};
                          --theme-heading-font: ${theme?.fonts?.heading || 'inherit'};
                          --theme-body-font: ${theme?.fonts?.body || 'inherit'};
                          --theme-heading-color: ${theme?.colors?.headingColor || '#0f172a'};
                          --theme-body-color: ${theme?.colors?.bodyText || '#334155'};
                        }
                        *, *::before, *::after { box-sizing: border-box; }
                        ${theme?.fonts?.googleFontUrl ? `@import url('${theme.fonts.googleFontUrl}');` : ''}
                        body {
                          font-family: var(--theme-body-font);
                          padding: 60px 40px;
                          margin: 0;
                          background: #f3f4f6;
                        }
                        ${generateLayoutCss(theme, themeVars)}
                        
                        /* Watermark override */
                        .a4-page::before {
                          content: ${themeVars['--theme-watermark-text'] || '""'};
                          position: absolute;
                          top: 50%; left: 50%;
                          transform: translate(-50%, -50%) rotate(-35deg);
                          font-size: 100px; font-weight: 900;
                          color: ${themeVars['--theme-watermark-color'] || 'transparent'};
                          opacity: ${themeVars['--theme-watermark-opacity'] || 0};
                          pointer-events: none; z-index: 10;
                          white-space: nowrap;
                        }

                        @media print {
                          body { background: white; padding: 0; }
                          .preview-clauses-placeholder { border: none !important; background: transparent !important; }
                        }
                      </style>
                    </head>
                    <body>${previewHtml}</body>
                  </html>
                `);
                win.document.close();

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

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50 flex justify-center">
          <div
            className="agreement-preview-container theme-hero-band-host"
            style={{
              ...themeVars,
            }}
          >
            {/* Hero band */}
            <div className="theme-hero-band" />

            <div
              className="a4-page"
              style={{
                backgroundImage: theme?.textures?.pageBackground !== 'none' ? theme.textures.pageBackground : undefined,
                position: 'relative',
                zIndex: 1
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
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
