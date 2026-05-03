/**
 * generateLayoutCss(theme, themeVars)
 * Returns the CSS string for all layout classes used by PreviewModal and new-tab window.
 */
export function generateLayoutCss(theme, themeVars) {
  const tableBorder = themeVars['--theme-table-border'] || '#cbd5e1';
  const tableHeaderBg = themeVars['--theme-table-header-bg'] || '#f8fafc';
  const tableHeaderText = themeVars['--theme-table-header-text'] || '#334155';
  const heroHeight = themeVars['--theme-hero-height'] || '0px';
  const heroBg = themeVars['--theme-hero-bg'] || 'transparent';
  const pageBg = themeVars['--theme-page-bg'] || '#FFFFFF';
  const tableRadius = themeVars['--theme-table-radius'] || '0px';
  const logoAlign = themeVars['--theme-logo-align'] || 'left';
  const logoMaxH = themeVars['--theme-logo-max-height'] || '100px';
  const headingFont = themeVars['--theme-heading-font'] || 'inherit';
  const bodyFont = themeVars['--theme-body-font'] || 'inherit';
  const headingColor = themeVars['--theme-heading-color'] || '#0f172a';
  const bodyColor = themeVars['--theme-body-color'] || '#334155';
  const headerRule = themeVars['--theme-header-rule'] || 'none';
  const sectionRule = themeVars['--theme-section-rule'] || 'none';
  const heroTitleColor = themeVars['--theme-hero-title-color'] || '#FFFFFF';
  const heroTitleSize = themeVars['--theme-hero-title-size'] || '2.5rem';
  const contentPad = themeVars['--theme-content-padding'] || '80px';
  const pageTexture = themeVars['--theme-page-texture'] || 'none';
  const heroEnabled = theme?.hero?.enabled;

  const logoAlignCss = logoAlign === 'center'
    ? 'margin-left: auto; margin-right: auto;'
    : 'margin-left: 0; margin-right: auto;';

  return `
    /* ── Reset & Base ── */
    *, *::before, *::after { box-sizing: border-box; }

    /* ── Page ── */
    .a4-page, .agreement-preview-container {
      background-color: ${pageBg} !important;
      background-image: ${pageTexture !== 'none' ? pageTexture : 'none'};
      min-height: 1123px;
      width: 794px;
      margin: 0 auto;
      position: relative;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
      box-sizing: border-box;
      overflow: hidden;
    }

    /* ── Hero Band ── */
    .theme-hero-band {
      width: 100%;
      background: ${heroBg};
      display: ${heroEnabled ? 'flex' : 'none'};
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: ${heroEnabled ? heroHeight : '0px'};
      min-height: ${heroEnabled ? heroHeight : '0px'};
      overflow: hidden;
      position: relative;
      z-index: 1;
    }

    .theme-hero-band .hero-title {
      font-family: ${headingFont};
      color: ${heroTitleColor} !important;
      font-size: ${heroTitleSize};
      font-weight: 900;
      text-align: center;
      padding: 0 60px;
      margin: 0;
      line-height: 1.15;
    }

    .theme-hero-band .hero-logo {
      max-height: ${logoMaxH};
      width: auto;
      object-fit: contain;
      margin-bottom: 16px;
      display: block;
    }

    /* ── Page Body (content below hero) ── */
    .a4-page-body {
      padding: ${contentPad};
      position: relative;
      z-index: 2;
    }

    /* ── Logo in body ── */
    .a4-page-body img:first-of-type {
      max-height: ${logoMaxH};
      width: auto !important;
      display: block;
      margin-bottom: 2rem;
      object-fit: contain;
      ${logoAlignCss}
    }

    /* ── Typography ── */
    .a4-page-body h1, .a4-page-body h2, .a4-page-body h3 {
      font-family: ${headingFont};
      color: ${headingColor};
    }
    .a4-page-body h1 {
      font-size: 2.5rem;
      line-height: 1.15;
      font-weight: 900;
      margin-bottom: 0.5em;
      padding-bottom: 0.5rem;
      border-bottom: ${headerRule};
    }
    .a4-page-body h2 {
      font-size: 1.4rem;
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      padding-bottom: 0.25rem;
      border-bottom: ${sectionRule};
    }
    .a4-page-body p, .a4-page-body li, .a4-page-body span {
      font-family: ${bodyFont};
      color: ${bodyColor};
      line-height: 1.7;
      margin-bottom: 0.75em;
    }

    /* ── Tables ── */
    .agreement-table, .a4-page-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      border-radius: ${tableRadius};
      overflow: hidden;
    }
    .agreement-table th, .a4-page-body table th,
    .agreement-table td, .a4-page-body table td {
      border: 1px solid ${tableBorder};
      padding: 10px 14px;
      text-align: left;
    }
    .agreement-table th, .a4-page-body table th {
      background: ${tableHeaderBg};
      color: ${tableHeaderText};
      font-weight: 700;
    }
    .agreement-table th p, .a4-page-body table th p {
      color: ${tableHeaderText};
      margin: 0;
    }

    /* ── Dual Column ── */
    .dual-column-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      position: relative;
      margin: 1.5rem 0;
    }
    .dual-column-wrapper::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0; left: 50%;
      border-left: 2px dotted ${tableBorder};
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
    }

    /* ── Clauses Placeholder ── */
    .preview-clauses-placeholder {
      width: 100%;
      background: rgba(0,0,0,0.02);
      border: 1px dashed ${tableBorder};
      border-radius: 12px;
      padding: 32px;
      margin: 1.5rem 0;
    }

    /* ── Preview variable highlight ── */
    .preview-variable { color: #0f172a; font-weight: 800; }

    /* ── Watermark ── */
    .a4-page::before {
      content: var(--theme-watermark-text, "");
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 100px; font-weight: 900;
      color: var(--theme-watermark-color, transparent);
      opacity: var(--theme-watermark-opacity, 0);
      pointer-events: none; z-index: 100;
      white-space: nowrap;
    }

    @media print {
      .preview-clauses-placeholder { border: none !important; background: transparent !important; }
    }
  `;
}