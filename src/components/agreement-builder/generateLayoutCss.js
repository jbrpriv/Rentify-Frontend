/**
 * generateLayoutCss(theme, themeVars)
 * Returns the CSS string for all layout classes, properly themed.
 * Used by both PreviewModal (inline <style>) and the new-tab window.
 */
export function generateLayoutCss(theme, themeVars) {
  const primary = themeVars['--theme-primary'] || '#0f172a';
  const tableBorder = themeVars['--theme-table-border'] || '#cbd5e1';
  const tableHeaderBg = themeVars['--theme-table-header-bg'] || '#f8fafc';
  const tableHeaderText = themeVars['--theme-table-header-text'] || '#334155';
  const heroHeight = themeVars['--theme-hero-height'] || '200px';
  const heroBg = themeVars['--theme-hero-bg'] || 'transparent';
  const pageBg = themeVars['--theme-page-bg'] || '#FFFFFF';
  const tableRadius = themeVars['--theme-table-radius'] || '0px';

  return `
    /* ── Page ── */
    .a4-page, .agreement-preview-container { 
      background-color: ${pageBg} !important; 
      min-height: 1123px;
      width: 794px;
      margin: 0 auto;
      padding: 80px;
      position: relative;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
      text-align: left; /* Ensure centering is only for the page block, not content */
    }

    /* ── Hero band ── */
    .theme-hero-band {
      position: absolute; top: 0; left: 0; right: 0;
      height: ${heroHeight};
      background: ${heroBg};
      pointer-events: none; z-index: 0;
    }
    
    /* Hero bleed fix for specific layouts */
    .layout-premium .a4-page,
    .layout-premium-hero-host .a4-page,
    .layout-contemporary .a4-page {
      padding-top: 0 !important;
    }
    
    .layout-premium .ProseMirror,
    .layout-premium-hero,
    .layout-contemporary .ProseMirror,
    .layout-contemporary-top {
       padding-top: 60px;
    }

    /* ── Logo Treatment (First Image) ── */
    .a4-page img:first-of-type,
    .a4-page [data-layout-role="primary-logo"] img {
      max-height: var(--theme-logo-max-height, 100px);
      width: auto !important;
      display: block;
      margin-bottom: 2rem;
      object-fit: contain;
      ${themeVars['--theme-logo-align'] === 'center' ? 'margin-left: auto !important; margin-right: auto !important;' : 'margin-left: 0; margin-right: auto;'}
    }

    /* ── Modular Block Layout (Shared by Editor & Preview) ── */
    .a4-page .ProseMirror, .a4-page-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 60px 40px !important;
    }

    /* Standard Section Style */
    .document-section, [data-layout-role] {
      background: white;
      padding: 32px;
      border-radius: 12px;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      position: relative;
      transition: transform 0.2s;
    }
    
    /* Hero Section (always at top) */
    [data-layout-role="primary-heading"], [data-layout-role="hero"] {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin-bottom: 24px;
      text-align: left !important;
    }

    /* Ledger Theme specific block style */
    .layout-ledger .document-section, 
    .layout-ledger [data-layout-role]:not([data-layout-role="primary-heading"]) {
      border-radius: 0;
      border: 2px solid #000000;
      box-shadow: 8px 8px 0 rgba(0,0,0,0.1);
      margin-bottom: 12px;
    }
    
    /* Premium Theme specific block style (Glass Cards) */
    .layout-premium .document-section,
    .layout-premium [data-layout-role]:not([data-layout-role="primary-heading"]) {
      background: rgba(255, 255, 255, 0.7) !important;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 20px 40px rgba(0,0,0,0.05);
      border-radius: 24px;
    }

    /* Table Section Fixes (Middle flow) */
    [data-layout-role="primary-table"], .agreement-table {
      width: 100% !important;
      margin: 0 !important;
      grid-column: span 2;
    }

    /* Clauses Section (Full width now, no more sidebar squeeze) */
    [data-layout-role="primary-sidebar-item"], .preview-clauses-placeholder {
      width: 100% !important;
      background: rgba(0,0,0,0.02);
      border: 1px dashed ${tableBorder};
      border-radius: 12px;
      padding: 40px !important;
    }

    /* Premium Clauses Styling */
    .layout-premium [data-layout-role="primary-sidebar-item"] {
      background: rgba(255, 255, 255, 0.4) !important;
      border: 1px solid rgba(255, 255, 255, 0.6) !important;
    }

    /* Typography scale fix for blocks */
    h1 { 
      font-size: 3rem !important;
      line-height: 1 !important;
      margin-bottom: 0.5em !important;
    }
    
    /* Dark Hero Adjustments (Enforce contrast for H1/H2 in hero sections) */
    .layout-premium-hero h1,
    .layout-modern-hero-grid h1,
    .layout-ledger-wrap h1,
    .layout-premium h1,
    .layout-modern h1,
    .layout-ledger h1,
    .layout-premium-hero h2,
    .layout-modern-hero-grid h2,
    .layout-ledger-wrap h2,
    [data-layout-role="primary-heading"] {
      color: var(--theme-hero-title-color, #FFFFFF) !important;
    }

    /* ── Meta Strip (Ledger/Legal) ── */
    .layout-meta-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      margin-bottom: 40px;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 8px;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #64748b;
      border: 1px solid rgba(0,0,0,0.05);
      position: relative;
      z-index: 10;
    }
    
    /* Clauses Sidebar Header */
    [data-layout-role="primary-sidebar-item"]::before {
      content: 'Legal Provisions';
      display: block;
      font-size: 0.75rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 16px;
      opacity: 0.6;
      border-bottom: 1px solid currentColor;
      padding-bottom: 8px;
    }

    h2 { font-family: var(--theme-heading-font); color: var(--theme-heading-color); font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.75em; }
    p { font-family: var(--theme-body-font); color: var(--theme-body-color); line-height: 1.7; margin-bottom: 1em; position: relative; z-index: 2; }
    
    /* Image centering (general) */
    .document-image { max-width: 100%; height: auto; border-radius: 8px; }
  `;
}
