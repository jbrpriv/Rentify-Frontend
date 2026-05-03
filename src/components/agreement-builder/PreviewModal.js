import React, { useMemo } from 'react';
import { X, ExternalLink, ShieldCheck, ScrollText } from 'lucide-react';
import { getThemeById, themeToCssVars } from './VisualThemes';

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
  const { block: table, rest: afterTable } = extractFirstBlock(working, /<table\b[^>]*>[\s\S]*?<\/table>/i);
  working = afterTable;

  const safeHeading = heading || '<h1>Rental Agreement</h1>';

  switch (layoutStyle) {
    case 'classic':
      return `${safeHeading}${intro || ''}${table ? `<div class="layout-classic-table">${table}</div>` : ''}${working}`;
    case 'legal':
      return `<div class="layout-meta-strip"><span>Agreement Preview</span><span>${new Date().toLocaleDateString()}</span></div>${safeHeading}${intro || ''}${table ? `<div class="layout-legal-table">${table}</div>` : ''}${working}`;
    case 'premium':
      return `<div class="layout-premium-hero"><div>${safeHeading}${intro || ''}</div>${table ? `<div class="layout-premium-summary">${table}</div>` : ''}</div>${working}`;
    case 'contemporary':
      return `${safeHeading}<div class="layout-contemporary-top">${table ? `<div class="layout-contemporary-card">${table}</div>` : ''}${intro ? `<div class="layout-contemporary-card">${intro}</div>` : ''}</div>${working}`;
    case 'editorial':
      return `<div class="layout-editorial-header">${safeHeading}${intro || ''}</div>${table ? `<div class="layout-editorial-feature">${table}</div>` : ''}${working}`;
    case 'ledger':
      return `<div class="layout-meta-strip"><span>Ledger View</span><span>${new Date().toLocaleDateString()}</span></div>${safeHeading}${table ? `<div class="layout-ledger-block">${table}</div>` : ''}${intro || ''}${working}`;
    case 'modern':
      return `<div class="layout-modern-hero-grid"><div>${safeHeading}${intro || ''}</div>${table ? `<aside class="layout-modern-summary">${table}</aside>` : ''}</div>${working}`;
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

      // 3. Apply layout transformation so themes can alter structure, not only colors
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
        .agreement-preview-container h1, 
        .agreement-preview-container h2, 
        .agreement-preview-container h3 { 
          font-weight: 900 !important; 
          color: #0f172a !important;
        }
        .agreement-preview-container h1 {
          font-size: calc(2.25rem * var(--theme-heading-scale, 1)) !important;
          margin-bottom: 1.5rem;
        }
        .agreement-preview-container h2 {
          font-size: calc(1.5rem * var(--theme-heading-scale, 1)) !important;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .agreement-preview-container h3 {
          font-size: 1.25rem !important;
        }
        .agreement-preview-container p { margin-bottom: 1em; color: ${themeVars['--theme-body-color']}; line-height: 1.7; }
        .agreement-preview-container p:empty { min-height: 1.5em; }
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
          text-align: inherit;
          background-color: #f8fafc;
          color: #334155;
        }
        .agreement-table p {
          margin: 0;
        }

        .layout-meta-strip { display: flex; justify-content: space-between; gap: 12px; border: 1px solid #d1d5db; border-radius: 10px; padding: 8px 12px; margin-bottom: 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #334155; }
        .layout-modern-hero-grid,
        .layout-premium-hero,
        .layout-contemporary-top { display: grid; gap: 14px; grid-template-columns: minmax(0,1.7fr) minmax(0,1fr); margin-bottom: 14px; }
        .layout-modern-summary,
        .layout-premium-summary,
        .layout-classic-table,
        .layout-legal-table,
        .layout-contemporary-card,
        .layout-editorial-feature,
        .layout-ledger-block { border: 1px solid #d1d5db; border-radius: 12px; padding: 10px; background: rgba(255,255,255,0.85); }
        .layout-modern-summary .agreement-table,
        .layout-premium-summary .agreement-table,
        .layout-classic-table .agreement-table,
        .layout-legal-table .agreement-table,
        .layout-contemporary-card .agreement-table,
        .layout-editorial-feature .agreement-table,
        .layout-ledger-block .agreement-table { margin: 0; }
        .layout-editorial-header { border-left: 4px solid ${themeVars['--theme-primary'] || '#0f172a'}; padding-left: 12px; margin-bottom: 12px; }

        @media (max-width: 900px) {
          .layout-modern-hero-grid,
          .layout-premium-hero,
          .layout-contemporary-top { grid-template-columns: minmax(0,1fr); }
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
                        :root {
                          --theme-font-scale: ${themeVars['--theme-font-scale'] || 1};
                          --theme-heading-scale: ${themeVars['--theme-heading-scale'] || 1};
                          --theme-aside-width: ${themeVars['--theme-aside-width'] || '360px'};
                        }
                        *, *::before, *::after { box-sizing: border-box; }
                        ${theme?.fonts?.googleFontUrl ? `@import url('${theme.fonts.googleFontUrl}');` : ''}
                        body {
                          font-family: ${theme?.fonts?.body || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"};
                          padding: 60px 40px;
                          max-width: 860px;
                          margin: 0 auto;
                          line-height: 1.6;
                          color: ${theme?.colors?.bodyText || '#334155'};
                          background: #f3f4f6;
                        }
                        .a4-page {
                          background: white;
                          padding: 80px;
                          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
                          margin-bottom: 40px;
                        }
                        h1 { font-size: calc(2.25rem * var(--theme-heading-scale, 1)); font-weight: 900; color: ${theme?.colors?.headingColor || '#0f172a'}; margin-bottom: 1.5rem; font-family: ${theme?.fonts?.heading || 'inherit'}; padding-bottom: 0.5rem; border-bottom: ${theme?.borders?.headerRule || 'none'}; }
                        h2 { font-size: calc(1.5rem * var(--theme-heading-scale, 1)); font-weight: 700; color: ${theme?.colors?.headingColor || '#0f172a'}; margin-top: 1.5rem; margin-bottom: 1rem; font-family: ${theme?.fonts?.heading || 'inherit'}; padding-bottom: 0.25rem; border-bottom: ${theme?.borders?.sectionRule || 'none'}; }
                        h3 { font-size: 1.25rem; font-weight: 700; color: ${theme?.colors?.headingColor || '#0f172a'}; font-family: ${theme?.fonts?.heading || 'inherit'}; }
                        p  { margin-bottom: 1rem; }
                        strong { color: #1e40af; font-weight: 800; }
                        .preview-variable { color: #0f172a; font-weight: 800; }

                        /* ── Images ── */
                        .document-image {
                          display: block; margin: 2em auto; max-width: 100%; height: auto;
                          border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                        }

                        /* ── Dual Column ── */
                        .dual-column-node { margin: 1.5rem 0; }
                        .dual-column-wrapper {
                          display: grid;
                          grid-template-columns: minmax(0,1fr) minmax(0,1fr);
                          gap: 0;
                          position: relative;
                          min-height: 100px;
                        }
                        .dual-column-wrapper::after {
                          content: '';
                          position: absolute;
                          top: 0; bottom: 0; left: 50%;
                          border-left: 2px dotted #cbd5e1;
                          transform: translateX(-50%);
                          z-index: 1;
                          pointer-events: none;
                        }
                        .dual-column-side {
                          padding: 0 20px;
                          position: relative;
                          z-index: 2;
                          min-width: 0;
                          word-wrap: break-word;
                          overflow-wrap: break-word;
                        }

                        /* ── Tables ── */
                        table, .agreement-table {
                          width: 100%;
                          margin: 1.5rem 0;
                          border-collapse: collapse;
                          table-layout: fixed;
                        }
                        th, td,
                        .agreement-table th, .agreement-table td {
                          min-width: 1em;
                          border: 1px solid #cbd5e1;
                          padding: 10px 14px;
                          vertical-align: top;
                        }
                        th, .agreement-table th {
                          font-weight: 800;
                          text-align: inherit;
                          background: ${theme?.colors?.tableHeaderBg || '#f8fafc'} !important;
                          color: ${theme?.colors?.tableHeaderText || '#334155'} !important;
                        }
                        th p, .agreement-table th p { color: ${theme?.colors?.tableHeaderText || '#334155'} !important; }
                        td p, th p { margin: 0; }

                        /* Force theme-driven hero & table header if inline styles exist */
                        .a4-page::after, .template-page::after, .agreement-preview-container > div[style] {
                          background: ${theme?.textures?.heroPattern || 'none'} !important;
                        }

                        /* ── Clause Placeholder ── */
                        .preview-clauses-placeholder {
                          border: 2px dashed #bbf7d0;
                          background: #f0fdf4;
                          padding: 40px;
                          text-align: center;
                          color: #059669;
                          border-radius: 12px;
                          margin: 40px 0;
                        }

                        @media print {
                          body { background: white; padding: 0; }
                          .preview-clauses-placeholder { border: none !important; background: transparent !important; }
                          .dual-column-wrapper::after { border-left-color: #000; }
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

        <div className="flex-1 overflow-y-auto p-12 bg-gray-100/50 flex justify-center">
          <div
            className={`agreement-preview-container a4-page theme-${activeTheme} bg-white w-[794px] min-h-[1123px] shadow-2xl border border-gray-200 p-[80px] max-w-none relative overflow-hidden`}
            style={{
              ...themeVars,
              backgroundImage: theme?.textures?.pageBackground !== 'none' ? theme.textures.pageBackground : undefined,
            }}
          >
            {/* Hero background gradient */}
            {theme?.textures?.heroPattern && theme.textures.heroPattern !== 'none' && (
              <div
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 200,
                  background: theme.textures.heroPattern, pointerEvents: 'none', zIndex: 0,
                }}
              />
            )}
            {/* Watermark */}
            {theme?.watermark?.enabled && (
              <div
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-35deg)',
                  fontSize: 100, fontWeight: 900, letterSpacing: '0.15em',
                  color: theme.watermark.color, opacity: theme.watermark.opacity,
                  pointerEvents: 'none', zIndex: 0, whiteSpace: 'nowrap', userSelect: 'none',
                }}
              >
                {theme.watermark.text}
              </div>
            )}
            <div
              style={{ position: 'relative', zIndex: 1 }}
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
