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

    /* ── Grid Layouts (Shared by Editor & Preview) ── */
    .layout-modern-hero-grid, 
    .layout-premium-hero,
    .layout-modern .ProseMirror,
    .layout-premium .ProseMirror {
      display: grid !important;
      gap: 32px;
      grid-template-columns: minmax(0, 1.7fr) minmax(220px, 1fr);
      grid-template-rows: auto auto 1fr;
      margin-bottom: 24px;
      align-items: start;
      position: relative;
      z-index: 1;
    }

    /* Column spans for grid layouts */
    .layout-modern .ProseMirror > *:not([data-layout-role]),
    .layout-premium .ProseMirror > *:not([data-layout-role]) {
      grid-column: 1 / -1;
    }

    .layout-modern-summary, 
    .layout-premium-summary,
    [data-layout-role="primary-table"] {
      border: 1px solid ${tableBorder};
      border-radius: ${tableRadius};
      padding: 16px;
      background: rgba(255, 255, 255, 0.85);
      min-width: 220px;
      max-width: 100%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      overflow: hidden;
      grid-column: 2;
      grid-row: 1 / span 2;
    }
    
    [data-layout-role="primary-heading"] { grid-column: 1; grid-row: 1; }
    [data-layout-role="intro-paragraph"] { grid-column: 1; grid-row: 2; }
    
    .layout-modern-summary .agreement-table,
    .layout-premium-summary .agreement-table {
      margin: 0;
      font-size: 0.8em;
    }

    /* Premium specific override */
    .layout-premium-summary {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(12px);
      color: #FFFFFF !important;
    }
    .layout-premium-summary .agreement-table th {
      background: rgba(255, 255, 255, 0.2) !important;
      color: #FFFFFF !important;
      border-color: rgba(255, 255, 255, 0.3);
    }
    .layout-premium-summary .agreement-table td {
      border-color: rgba(255, 255, 255, 0.3);
      color: #FFFFFF !important;
    }

    /* ── Editorial Layout ── */
    .layout-editorial-header {
      border-left: 6px solid ${primary};
      padding-left: 24px;
      margin-bottom: 32px;
    }

    /* ── Typography ── */
    h1 { 
      font-family: var(--theme-heading-font); 
      color: var(--theme-heading-color); 
      font-size: 2.25em; 
      margin-bottom: 0.75em; 
      position: relative;
      z-index: 2;
    }
    
    /* Dark Hero Adjustments (Enforce contrast for H1/H2 in hero sections) */
    .layout-premium-hero h1,
    .layout-modern-hero-grid h1,
    .layout-ledger-wrap h1,
    .layout-premium-hero h2,
    .layout-modern-hero-grid h2,
    .layout-ledger-wrap h2,
    [data-layout-role="primary-heading"] {
      color: var(--theme-hero-title-color, #FFFFFF) !important;
    }

    h2 { font-family: var(--theme-heading-font); color: var(--theme-heading-color); font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.75em; }
    p { font-family: var(--theme-body-font); color: var(--theme-body-color); line-height: 1.7; margin-bottom: 1em; position: relative; z-index: 2; }
    
    /* Image centering (general) */
    .document-image { max-width: 100%; height: auto; border-radius: 8px; }
  `;
}
