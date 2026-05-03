import React, { useMemo } from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';
import { getThemeById, themeToCssVars } from './VisualThemes';
import { generateLayoutCss } from './generateLayoutCss';

/**
 * Build the preview HTML:
 *  1. Replace <span data-type="variable"> nodes with sample values.
 *  2. Replace <div data-type="clauses-placeholder"> with a styled block.
 *  3. Wrap the content in .theme-hero-band + .a4-page-body so the hero
 *     is a real block above the content — not a pseudo-element overlay.
 */
const buildPreviewHtml = (html, samples, theme, logoUrl) => {
  if (!html) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Replace variable nodes
    doc.querySelectorAll('span[data-type="variable"]').forEach(v => {
      const name = v.getAttribute('data-name') || '';
      const value = samples[name] || `[${name}]`;
      const span = doc.createElement('strong');
      span.className = 'preview-variable';
      span.textContent = value;
      v.parentNode.replaceChild(span, v);
    });

    // 2. Replace clauses placeholder
    doc.querySelectorAll('div[data-type="clauses-placeholder"]').forEach(p => {
      const div = doc.createElement('div');
      div.className = 'preview-clauses-placeholder';
      div.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:#059669;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
          <span style="font-weight:800;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Clauses Sidebar</span>
          <span style="font-size:11px;opacity:0.8;font-weight:500;">Dynamic legal clauses will be injected here in the final document.</span>
        </div>
      `;
      p.parentNode.replaceChild(div, p);
    });

    // 3. Extract the first H1 for the hero title (only when hero is enabled)
    let heroTitleHtml = '';
    if (theme?.hero?.enabled) {
      const firstH1 = doc.body.querySelector('h1');
      if (firstH1) {
        heroTitleHtml = `<div class="hero-title">${firstH1.innerHTML}</div>`;
        firstH1.remove(); // Remove from body so it doesn't duplicate
      }
    }

    // 4. Wrap in hero + body structure
    const bodyContent = doc.body.innerHTML;
    const isHero = theme?.hero?.enabled;
    const logoHtml = logoUrl ? `<div class="hero-logo-container"><img src="${logoUrl}" class="hero-logo-img" /></div>` : '';
    
    return `
      <div class="${isHero ? 'theme-hero-band' : 'standard-header-box'}">
        ${logoHtml}
        <div class="hero-title">${heroTitleHtml}</div>
      </div>
      <div class="a4-page-body">${bodyContent}</div>
    `;
  } catch (err) {
    console.error('Preview build error:', err);
    return html;
  }
};

const SAMPLES = {
  tenant_name: 'John Carter',
  landlord_name: 'Emily Johnson',
  property_title: 'Downtown Loft – Unit 5B',
  property_address: '742 Evergreen Terrace, Springfield, IL 62704',
  full_address: '742 Evergreen Terrace, Springfield, IL 62704',
  rent_amount: '$2,450 USD',
  monthly_rent: '$2,450 USD',
  security_deposit: '$2,450 USD',
  deposit_amount: '$2,450 USD',
  total_move_in: '$4,900 USD',
  total_move_in_cost: '$4,900 USD',
  maintenance_fee: '$125 USD',
  late_fee: '$75 USD',
  late_fee_amount: '$75 USD',
  late_fee_grace_days: '5 days',
  start_date: 'May 1, 2026',
  lease_start_date: 'May 1, 2026',
  end_date: 'April 30, 2027',
  duration_months: '12',
  utilities_included: 'Included',
  utilities_details: 'Electricity, Water, Trash Collection',
  pet_allowed: 'Allowed',
  pet_deposit: '$300 USD',
  rent_escalation_enabled: 'Enabled',
  rent_escalation_percentage: '5%',
  termination_policy: '30-day written notice required.',
  current_date: new Date().toLocaleDateString(),
  agreement_id: 'AGR-77421-B',
  maintenance_clause: 'The Tenant shall keep the property in clean and habitable condition throughout the tenancy.',
  subletting_clause: 'The Tenant shall not sublet or assign the property without prior written consent from the Landlord.',
  deposit_clause: 'A security deposit is required and will be held for the duration of the lease.',
  termination_clause: 'Either party may terminate this agreement with 30 days prior written notice.',
};

const PreviewModal = ({ isOpen, onClose, html, activeTheme = 'blank', customWatermark, logoUrl }) => {
  const theme = useMemo(() => getThemeById(activeTheme), [activeTheme]);
  const themeVars = useMemo(() => {
    const vars = themeToCssVars(theme);
    if (customWatermark) {
      vars['--theme-watermark-text'] = `"${customWatermark}"`;
      vars['--theme-watermark-color'] = '#E11D48';
      vars['--theme-watermark-opacity'] = 0.08;
    }
    return vars;
  }, [theme, customWatermark]);

  const previewHtml = useMemo(
    () => buildPreviewHtml(html, SAMPLES, theme, logoUrl),
    [html, theme, logoUrl]
  );

  const layoutCss = useMemo(
    () => generateLayoutCss(theme, themeVars),
    [theme, themeVars]
  );

  if (!isOpen) return null;

  const openInNewTab = () => {
    const win = window.open('', '_blank');
    const vars = Object.entries(themeVars)
      .map(([k, v]) => `${k}: ${v};`)
      .join('\n  ');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Agreement Preview</title>
          ${theme?.fonts?.googleFontUrl ? `<link rel="stylesheet" href="${theme.fonts.googleFontUrl}">` : ''}
          <style>
            :root { ${vars} }
            *, *::before, *::after { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 40px 20px;
              background: #f3f4f6;
              font-family: var(--theme-body-font, sans-serif);
              display: flex;
              justify-content: center;
            }
            .a4-page {
              width: 794px;
              min-height: 1123px;
              position: relative;
              overflow: hidden;
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            }
            ${layoutCss}
          </style>
        </head>
        <body>
          <div class="a4-page" style="background-color:${theme?.pageBackground || '#FFFFFF'};">
            ${previewHtml}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {theme?.fonts?.googleFontUrl && (
        <link rel="stylesheet" href={theme.fonts.googleFontUrl} />
      )}
      <style>{layoutCss}</style>

      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
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
              onClick={openInNewTab}
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

        {/* Preview area — centered */}
        <div className="flex-1 overflow-y-auto bg-slate-100 flex justify-center items-start p-10">
          <div
            className="a4-page"
            style={{
              backgroundColor: theme?.pageBackground || '#FFFFFF',
              backgroundImage: theme?.textures?.pageBackground !== 'none'
                ? theme.textures.pageBackground
                : undefined,
              ...themeVars,
            }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>

        {/* Footer */}
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