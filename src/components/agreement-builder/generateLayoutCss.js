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
    }

    /* ── Hero band ── */
    .theme-hero-band {
      position: absolute; top: 0; left: 0; right: 0;
      height: ${heroHeight};
      background: ${heroBg};
      pointer-events: none; z-index: 0;
    }

    /* ── Grid Layouts ── */
    .layout-modern-hero-grid, .layout-premium-hero {
      display: grid;
      gap: 32px;
      grid-template-columns: minmax(0, 1.7fr) minmax(220px, 1fr);
      margin-bottom: 24px;
      align-items: start;
      position: relative;
      z-index: 1;
    }

    .layout-modern-summary, .layout-premium-summary {
      border: 1px solid ${tableBorder};
      border-radius: ${tableRadius};
      padding: 16px;
      background: rgba(255, 255, 255, 0.85);
      min-width: 220px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    /* Premium specific override */
    .layout-premium-summary {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(12px);
      color: #FFFFFF;
    }
    .layout-premium-summary .agreement-table th {
      background: rgba(255, 255, 255, 0.2) !important;
      color: #FFFFFF !important;
    }

    /* ── Editorial Layout ── */
    .layout-editorial-header {
      border-left: 6px solid ${primary};
      padding-left: 20px;
      margin-bottom: 24px;
    }

    /* ── Tables ── */
    .agreement-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.95em;
    }
    .agreement-table th {
      background: ${tableHeaderBg};
      color: ${tableHeaderText};
      font-weight: 700;
      text-align: left;
      padding: 12px 14px;
      border: 1px solid ${tableBorder};
    }
    .agreement-table td {
      padding: 10px 14px;
      border: 1px solid ${tableBorder};
      color: inherit;
    }

    /* ── Typography ── */
    h1 { font-family: var(--theme-heading-font); color: var(--theme-heading-color); font-size: 2.25em; margin-bottom: 0.75em; }
    h2 { font-family: var(--theme-heading-font); color: var(--theme-heading-color); font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.75em; }
    p { font-family: var(--theme-body-font); color: var(--theme-body-color); line-height: 1.7; margin-bottom: 1em; }
    
    /* Image centering */
    .document-image { max-width: 100%; height: auto; border-radius: 8px; }
  `;
}
