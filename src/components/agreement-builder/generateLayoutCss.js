/**
 * generateLayoutCss(theme, themeVars)
 * Returns the CSS string injected by PreviewModal and the new-tab window.
 * Mirrors the structure of builder.css for pixel-perfect preview accuracy.
 */
export function generateLayoutCss(theme, themeVars) {
  const tableBorder = themeVars['--theme-table-border'] || '#cbd5e1';
  const tableHeaderBg = themeVars['--theme-table-header-bg'] || '#f8fafc';
  const tableHeaderText = themeVars['--theme-table-header-text'] || '#334155';
  const heroBg = themeVars['--theme-hero-bg'] || 'transparent';
  const heroHeight = themeVars['--theme-hero-height'] || '0px';
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
  const fontScale = themeVars['--theme-font-scale'] || 1;
  const headingScale = themeVars['--theme-heading-scale'] || 1;
  const bodyLineH = themeVars['--theme-body-line-height'] || 1.7;
  const heroEnabled = theme?.hero?.enabled;
  const layoutStyle = theme?.layoutStyle || 'minimalist';
  const accent = themeVars['--theme-primary'] || '#000';

  const logoAlignCss = logoAlign === 'center'
    ? 'margin-left: auto; margin-right: auto;'
    : 'margin-left: 0; margin-right: auto;';

  // Per-layout clause positioning (mirrors builder.css)
  const clausePositioningMap = {
    modern: `border-left: 4px solid ${accent}; padding-left: 4px; margin-left: -4px;`,
    premium: `margin-top: 40px;`,
    legal: `margin-top: 32px; padding-top: 24px; border-top: 2px double ${accent};`,
    classic: `margin: 32px 0;`,
    contemporary: `margin: 32px -4px;`,
    ledger: `margin: 32px 0; border-top: 3px solid #000; padding-top: 24px;`,
    editorial: `margin: 32px 20px;`,
  };
  const clausePositioning = clausePositioningMap[layoutStyle] || 'margin: 24px 0;';

  return `
    *, *::before, *::after { box-sizing: border-box; }

    /* ── A4 Page ── */
    .a4-page {
      background-color: ${pageBg};
      background-image: ${pageTexture !== 'none' ? pageTexture : 'none'};
      min-height: 1123px;
      width: 794px;
      margin: 0 auto;
      position: relative;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 40px -8px rgba(0,0,0,0.15);
      overflow: hidden;
      font-size: calc(16px * ${fontScale});
      font-family: ${bodyFont};
    }

    /* ── Watermark ── */
    .a4-page::before {
      content: var(--theme-watermark-text, "");
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 100px; font-weight: 900; letter-spacing: 0.15em;
      color: var(--theme-watermark-color, transparent);
      opacity: var(--theme-watermark-opacity, 0);
      pointer-events: none; z-index: 100; white-space: nowrap;
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

    .standard-header-box {
      width: 100%;
      padding: 40px 80px 10px;
      display: ${heroEnabled ? 'none' : 'flex'};
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .hero-logo-container {
      margin-bottom: 0.75rem;
    }

    .standard-header-box .hero-title {
      border-bottom: ${headerRule};
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: calc(2.25rem * ${headingScale});
      text-transform: ${['commercial-classic', 'professional-legal', 'elegant-serif'].includes(theme.id) ? 'uppercase' : 'none'};
      letter-spacing: ${theme.id === 'professional-legal' ? '0.1em' : 'normal'};
    }

    .hero-logo-img {
      max-height: 80px;
      width: auto;
      object-fit: contain;
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

    /* ── Page Body (content below hero) ── */
    .a4-page-body, .a4-page .agreement-tiptap-content {
      padding: ${contentPad};
      ${!heroEnabled ? 'padding-top: 20px;' : ''}
      position: relative;
      z-index: 2;
    }

    /* ── Horizontal Rule ── */
    hr {
      border: none;
      border-top: 2px solid ${accent};
      margin: 2rem 0;
      opacity: 0.3;
    }

    /* ── Logo ── */
    .a4-page img:first-of-type {
      max-height: ${logoMaxH};
      width: auto !important;
      display: block;
      margin-bottom: 2rem;
      object-fit: contain;
      ${logoAlignCss}
    }

    /* ── Typography ── */
    .a4-page h1, .a4-page h2, .a4-page h3 {
      font-family: ${headingFont};
      color: ${headingColor};
    }
    .a4-page h1 {
      font-size: calc(2.25rem * ${headingScale});
      font-weight: 900; line-height: 1.15;
      margin-bottom: 0.5em; padding-bottom: 0.5rem;
      border-bottom: ${headerRule};
    }
    .a4-page h2 {
      font-size: calc(1.4rem * ${headingScale});
      font-weight: 700;
      margin-top: 1.5em; margin-bottom: 0.5em;
      padding-bottom: 0.25rem;
      border-bottom: ${sectionRule};
    }
    .a4-page h3 {
      font-size: calc(1.15rem * ${headingScale});
      font-weight: 700;
      margin-top: 1.2em; margin-bottom: 0.4em;
    }
    .a4-page p, .a4-page li {
      font-family: ${bodyFont};
      color: ${bodyColor};
      line-height: ${bodyLineH};
      margin-bottom: 0.75em;
    }
    .a4-page span, .a4-page blockquote {
      font-family: ${bodyFont};
      color: ${bodyColor};
    }

    /* ── Tables ── */
    .a4-page table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    .a4-page .tableWrapper {
      border-radius: ${tableRadius};
      overflow: hidden;
      margin: 1.5rem 0;
    }
    .a4-page th, .a4-page td {
      border: 1px solid ${tableBorder};
      padding: 10px 14px; text-align: left;
    }
    .a4-page th {
      background: ${tableHeaderBg};
      color: ${tableHeaderText};
      font-weight: 700;
      font-family: ${headingFont};
    }
    .a4-page th p { color: ${tableHeaderText}; margin: 0; }

    /* ── Dual Column ── */
    .dual-column-wrapper {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 0; position: relative; margin: 1.5rem 0;
    }
    .dual-column-wrapper::after {
      content: ''; position: absolute;
      top: 0; bottom: 0; left: 50%;
      border-left: 2px dotted ${tableBorder};
      transform: translateX(-50%); z-index: 1;
    }
    .dual-column-side {
      padding: 0 20px; position: relative; z-index: 2;
      min-width: 0; word-wrap: break-word; overflow-wrap: break-word;
    }

    /* ── Clauses Placeholder ── */
    .preview-clauses-placeholder {
      width: 100%;
      ${clausePositioning}
      background: rgba(0,0,0,0.02);
      border: 1px dashed ${tableBorder};
      border-radius: ${tableRadius || '8px'};
      padding: 32px;
    }

    /* ── Preview variable ── */
    .preview-variable { color: #0f172a; font-weight: 800; }

    @media print {
      .preview-clauses-placeholder { border: none !important; background: transparent !important; }
    }
  `;
}