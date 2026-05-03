/**
 * VisualThemes.js
 *
 * Centralized registry of visual themes for the Agreement Builder.
 * Each theme defines a complete design system: typography, colors, textures,
 * watermarks, borders, and hero section treatments.
 *
 * These themes are INDEPENDENT of content templates — any template's text
 * can be rendered with any visual theme.
 */

export const VISUAL_THEMES = [
  // ─── 1. Blank ──────────────────────────────────────────────────────────
  {
    id: 'blank',
    name: 'Blank',
    description: 'No styling — raw document with system fonts.',
    layoutStyle: 'minimalist',
    preview: {
      primarySwatch: '#000000',
      accentSwatch: '#666666',
      bgSwatch: '#FFFFFF',
    },
    fonts: {
      heading: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      googleFontUrl: '',
    },
    colors: {
      primary: '#000000',
      accent: '#666666',
      headingColor: '#000000',
      bodyText: '#333333',
      tableBorder: '#cccccc',
      tableHeaderBg: '#f5f5f5',
      tableHeaderText: '#000000',
      background: '#FFFFFF',
      heroBackground: 'transparent',
    },
    textures: {
      pageBackground: 'none',
      heroPattern: 'none',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0,
      color: '#000000',
    },
    borders: {
      headerRule: 'none',
      sectionRule: 'none',
    },
    spacing: {
      fontSizeScale: 1.0,
      headingScale: 1.0,
      asideWidth: '360px',
      contentPadding: '80px',
    },
    pageBackground: '#FFFFFF',
    hero: {
      enabled: false,
      height: 0,
      background: 'transparent',
      titleColor: '#000000',
      titleFontSize: '2.25rem',
    },
    logo: {
      maxHeight: '120px',
      alignment: 'left',
    },
    table: {
      containerRadius: '0px',
      alternateRowBg: 'none',
    },
    body: {
      lineHeight: 1.7,
    },
  },

  // ─── 2. Commercial Classic ─────────────────────────────────────────────
  {
    id: 'commercial-classic',
    name: 'Commercial Classic',
    description: 'Traditional serif typography with navy & gold accents.',
    layoutStyle: 'classic',
    preview: {
      primarySwatch: '#1B2A4A',
      accentSwatch: '#C5A55A',
      bgSwatch: '#FAF8F4',
    },
    fonts: {
      heading: "'Playfair Display', Georgia, serif",
      body: "'Lora', 'Times New Roman', serif",
      googleFontUrl:
        'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lora:wght@400;600;700&display=swap',
    },
    colors: {
      primary: '#1B2A4A',
      accent: '#C5A55A',
      headingColor: '#1B2A4A',
      bodyText: '#2D3748',
      tableBorder: '#C5A55A',
      tableHeaderBg: '#1B2A4A',
      tableHeaderText: '#F5DFA0',
      background: '#FFFFFF',
      heroBackground: '#F2EDE3',
    },
    textures: {
      pageBackground: 'none',
      heroPattern: 'linear-gradient(180deg, #F2EDE3 0%, #FAF8F4 100%)',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0,
      color: '#1B2A4A',
    },
    borders: {
      headerRule: '4px double #C5A55A',
      sectionRule: '1px solid #D4BC8A',
    },
    spacing: {
      fontSizeScale: 1.0,
      headingScale: 1.1,
      asideWidth: '340px',
      contentPadding: '80px',
    },
    pageBackground: '#FAF8F4',
    hero: {
      enabled: true,
      height: 320,
      background: 'linear-gradient(180deg, #F2EDE3 0%, #FAF8F4 100%)',
      titleColor: '#1B2A4A',
      titleFontSize: '3.2rem',
    },
    logo: {
      maxHeight: '100px',
      alignment: 'center',
    },
    table: {
      containerRadius: '0px',
      alternateRowBg: '#F9F6EF',
    },
    body: {
      lineHeight: 1.8,
    },
  },

  // ─── 3. Modern Minimalist ──────────────────────────────────────────────
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Clean sans-serif with generous whitespace and soft blue accents.',
    layoutStyle: 'modern',
    preview: {
      primarySwatch: '#1E293B',
      accentSwatch: '#3B82F6',
      bgSwatch: '#FFFFFF',
    },
    fonts: {
      heading: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      googleFontUrl:
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
    },
    colors: {
      primary: '#1E293B',
      accent: '#3B82F6',
      headingColor: '#0F172A',
      bodyText: '#475569',
      tableBorder: '#E2E8F0',
      tableHeaderBg: '#F8FAFC',
      tableHeaderText: '#1E293B',
      background: '#FFFFFF',
      heroBackground: 'transparent',
    },
    textures: {
      pageBackground: 'none',
      heroPattern: 'none',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0,
      color: '#1E293B',
    },
    borders: {
      headerRule: '4px solid #3B82F6',
      sectionRule: '1px solid #E2E8F0',
    },
    spacing: {
      fontSizeScale: 0.98,
      headingScale: 1.0,
      asideWidth: '360px',
      contentPadding: '80px',
    },
    pageBackground: '#FFFFFF',
    hero: {
      enabled: false,
      height: 0,
      background: 'transparent',
      titleColor: '#0F172A',
      titleFontSize: '2.5rem',
    },
    logo: {
      maxHeight: '80px',
      alignment: 'left',
    },
    table: {
      containerRadius: '10px',
      alternateRowBg: 'transparent',
    },
    body: {
      lineHeight: 1.6,
    },
  },

  // ─── 4. Professional Legal ─────────────────────────────────────────────
  {
    id: 'professional-legal',
    name: 'Professional Legal',
    description: 'Formal serif with dark slate & burgundy — built for legal documents.',
    layoutStyle: 'legal',
    preview: {
      primarySwatch: '#1A1A2E',
      accentSwatch: '#8B2635',
      bgSwatch: '#FDFCFA',
    },
    fonts: {
      heading: "'Merriweather', Georgia, serif",
      body: "'Source Sans 3', 'Segoe UI', Roboto, sans-serif",
      googleFontUrl:
        'https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Source+Sans+3:wght@400;600;700&display=swap',
    },
    colors: {
      primary: '#1A1A2E',
      accent: '#8B2635',
      headingColor: '#0F1419',
      bodyText: '#2D3748',
      tableBorder: '#C8B8A8',
      tableHeaderBg: '#1A1A2E',
      tableHeaderText: '#E8D5C4',
      background: '#FFFFFF',
      heroBackground: '#FDFCFA',
    },
    textures: {
      pageBackground:
        'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.04) 27px, rgba(0,0,0,0.04) 28px)',
      heroPattern: 'none',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0.03,
      color: '#1A1A2E',
    },
    borders: {
      headerRule: '4px double #8B2635',
      sectionRule: '2px solid #D6CFD3',
    },
    spacing: {
      fontSizeScale: 1.08,
      headingScale: 1.25,
      asideWidth: '300px',
      contentPadding: '80px',
    },
    pageBackground: '#FDFCFA',
    hero: {
      enabled: false,
      height: 0,
      background: 'transparent',
      titleColor: '#0F1419',
      titleFontSize: '1.9rem',
    },
    logo: {
      maxHeight: '90px',
      alignment: 'left',
    },
    table: {
      containerRadius: '0px',
      alternateRowBg: 'transparent',
    },
    body: {
      lineHeight: 1.7,
    },
  },

  // ─── 5. Executive Premium ──────────────────────────────────────────────
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Luxury feel with deep purple, rose gold, and gradient hero.',
    layoutStyle: 'premium',
    preview: {
      primarySwatch: '#2D1B4E',
      accentSwatch: '#D4A574',
      bgSwatch: '#FEFCFF',
    },
    fonts: {
      heading: "'Outfit', 'Helvetica Neue', sans-serif",
      body: "'DM Sans', 'Segoe UI', sans-serif",
      googleFontUrl:
        'https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap',
    },
    colors: {
      primary: '#2D1B4E',
      accent: '#D4A574',
      headingColor: '#2D1B4E',
      bodyText: '#4A3F5C',
      tableBorder: '#E8D5C4',
      tableHeaderBg: 'linear-gradient(135deg, #2D1B4E 0%, #5A3D7E 100%)',
      tableHeaderText: '#FFFFFF',
      background: '#FFFFFF',
      heroBackground: '#FEFCFF',
    },
    textures: {
      pageBackground: 'none',
      heroPattern: 'linear-gradient(135deg, #2D1B4E 0%, #5A3D7E 55%, #8B5CF6 100%)',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0,
      color: '#2D1B4E',
    },
    borders: {
      headerRule: '5px solid #D4A574',
      sectionRule: '2px dashed #E8D5C4',
    },
    spacing: {
      fontSizeScale: 1.15,
      headingScale: 1.3,
      asideWidth: '400px',
      contentPadding: '80px',
    },
    pageBackground: '#FEFCFF',
    hero: {
      enabled: true,
      height: 400,
      background: 'linear-gradient(135deg, #2D1B4E 0%, #5A3D7E 55%, #8B5CF6 100%)',
      titleColor: '#FFFFFF',
      titleFontSize: '3rem',
    },
    logo: {
      maxHeight: '80px',
      alignment: 'left',
    },
    table: {
      containerRadius: '12px',
      alternateRowBg: 'transparent',
    },
    body: {
      lineHeight: 1.7,
    },
  },

  // ─── 6. Fresh Contemporary ─────────────────────────────────────────────
  {
    id: 'fresh-contemporary',
    name: 'Fresh Contemporary',
    description: 'Vibrant teal & coral with rounded elements and modern energy.',
    layoutStyle: 'contemporary',
    preview: {
      primarySwatch: '#0F766E',
      accentSwatch: '#F97066',
      bgSwatch: '#F0FDFA',
    },
    fonts: {
      heading: "'Poppins', 'Helvetica Neue', sans-serif",
      body: "'Nunito', 'Segoe UI', sans-serif",
      googleFontUrl:
        'https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&family=Nunito:wght@400;600;700&display=swap',
    },
    colors: {
      primary: '#0F766E',
      accent: '#F97066',
      headingColor: '#134E4A',
      bodyText: '#334155',
      tableBorder: '#2DD4BF',
      tableHeaderBg: '#0F766E',
      tableHeaderText: '#FFFFFF',
      background: '#FFFFFF',
      heroBackground: '#F0FDFA',
    },
    textures: {
      pageBackground: 'none',
      heroPattern: 'linear-gradient(160deg, #0F766E 0%, #0D9488 100%)',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0,
      color: '#0F766E',
    },
    borders: {
      headerRule: '3px solid #F97066',
      sectionRule: '1px solid #F97066',
    },
    spacing: {
      fontSizeScale: 1.0,
      headingScale: 1.0,
      asideWidth: '360px',
      contentPadding: '80px',
    },
    pageBackground: '#F0FDFA',
    hero: {
      enabled: true,
      height: 200,
      background: 'linear-gradient(160deg, #0F766E 0%, #0D9488 100%)',
      titleColor: '#FFFFFF',
      titleFontSize: '2.8rem',
    },
    logo: {
      maxHeight: '100px',
      alignment: 'left',
    },
    table: {
      containerRadius: '12px',
      alternateRowBg: '#F0FDFA',
    },
    body: {
      lineHeight: 1.7,
    },
  },

  // ─── 7. Elegant Serif ──────────────────────────────────────────────────
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    description: 'A sophisticated theme using Cinzel with a subtle textured paper background.',
    layoutStyle: 'editorial',
    preview: {
      primarySwatch: '#111111',
      accentSwatch: '#9B8467',
      bgSwatch: '#FAF9F6',
    },
    fonts: {
      heading: "'Cinzel', 'Playfair Display', serif",
      body: "'Lora', 'Georgia', serif",
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Lora:wght@400;600;700&display=swap',
    },
    colors: {
      primary: '#111111',
      accent: '#9B8467',
      headingColor: '#111111',
      bodyText: '#3D3D3D',
      tableBorder: '#C5B5A5',
      tableHeaderBg: '#F5F2ED',
      tableHeaderText: '#111111',
      background: '#FFFFFF',
      heroBackground: '#FAF9F6',
    },
    textures: {
      pageBackground: 'radial-gradient(circle, #E0DBD0 1px, transparent 1px)',
      heroPattern: 'none',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0,
      color: '#111111',
    },
    borders: {
      headerRule: 'none',
      sectionRule: '2px dotted #C5B5A5',
    },
    spacing: {
      fontSizeScale: 1.12,
      headingScale: 1.35,
      asideWidth: '340px',
      contentPadding: '80px',
    },
    pageBackground: '#FAF9F6',
    hero: {
      enabled: false,
      height: 0,
      background: 'transparent',
      titleColor: '#111111',
      titleFontSize: '3.5rem',
    },
    logo: {
      maxHeight: '110px',
      alignment: 'center',
    },
    table: {
      containerRadius: '0px',
      alternateRowBg: 'transparent',
    },
    body: {
      lineHeight: 1.7,
    },
  },

  // ─── 8. Tech Innovator ──────────────────────────────────────────────────
  {
    id: 'tech-innovator',
    name: 'Tech Innovator',
    description: 'A tech-forward minimalist theme using monospace headers and stark contrast.',
    layoutStyle: 'ledger',
    preview: {
      primarySwatch: '#0A0A0A',
      accentSwatch: '#2563EB',
      bgSwatch: '#FFFFFF',
    },
    fonts: {
      heading: "'Space Grotesk', 'Courier New', monospace",
      body: "'Roboto', 'Helvetica Neue', sans-serif",
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800;900&family=Roboto:wght@400;500;700&display=swap',
    },
    colors: {
      primary: '#0A0A0A',
      accent: '#2563EB',
      headingColor: '#000000',
      bodyText: '#1F2937',
      tableBorder: '#000000',
      tableHeaderBg: '#0A0A0A',
      tableHeaderText: '#FFFFFF',
      background: '#FFFFFF',
      heroBackground: '#0A0A0A',
    },
    textures: {
      pageBackground: 'repeating-linear-gradient(90deg, transparent, transparent 119px, rgba(37,99,235,0.04) 119px, rgba(37,99,235,0.04) 120px)',
      heroPattern: 'none',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0,
      color: '#0A0A0A',
    },
    borders: {
      headerRule: 'none',
      sectionRule: '3px solid #E5E7EB',
    },
    spacing: {
      fontSizeScale: 1.0,
      headingScale: 1.15,
      asideWidth: '380px',
      contentPadding: '80px',
    },
    pageBackground: '#FFFFFF',
    hero: {
      enabled: true,
      height: 160,
      background: '#0A0A0A',
      titleColor: '#FFFFFF',
      titleFontSize: '2rem',
    },
    logo: {
      maxHeight: '70px',
      alignment: 'left',
    },
    table: {
      containerRadius: '0px',
      alternateRowBg: '#F9FAFB',
    },
    body: {
      lineHeight: 1.6,
    },
  },
];

/**
 * Utility: find a theme by its ID slug. Returns the blank theme as fallback.
 */
export function getThemeById(id) {
  return VISUAL_THEMES.find((t) => t.id === id) || VISUAL_THEMES[0];
}

/**
 * Utility: generate CSS custom properties string for a given theme config.
 * Used for injecting into the editor container style attribute.
 */
export function themeToCssVars(theme) {
  if (!theme) return {};
  return {
    '--theme-heading-font': theme.fonts.heading,
    '--theme-body-font': theme.fonts.body,
    '--theme-heading-color': theme.colors.headingColor,
    '--theme-body-color': theme.colors.bodyText,
    '--theme-primary': theme.colors.primary,
    '--theme-accent': theme.colors.accent,
    '--theme-table-border': theme.colors.tableBorder,
    '--theme-table-header-bg': theme.colors.tableHeaderBg,
    '--theme-table-header-text': theme.colors.tableHeaderText,
    '--theme-hero-bg': theme.hero?.background || theme.colors.heroBackground || 'transparent',
    '--theme-hero-pattern': theme.textures.heroPattern || 'none',
    '--theme-page-texture': theme.textures.pageBackground || 'none',
    '--theme-header-rule': theme.borders.headerRule || 'none',
    '--theme-section-rule': theme.borders.sectionRule || 'none',
    '--theme-watermark-opacity': theme.watermark.enabled ? theme.watermark.opacity : 0,
    '--theme-watermark-color': theme.watermark.color || 'transparent',
    '--theme-watermark-text': theme.watermark.enabled ? `"${theme.watermark.text}"` : '""',
    '--theme-font-scale': theme.spacing?.fontSizeScale || 1,
    '--theme-heading-scale': theme.spacing?.headingScale || 1,
    '--theme-aside-width': theme.spacing?.asideWidth || '360px',
    
    // NEW vars from Step 2.2
    '--theme-page-bg': theme.pageBackground || '#FFFFFF',
    '--theme-hero-enabled': theme.hero?.enabled ? '1' : '0',
    '--theme-hero-height': `${theme.hero?.height || 200}px`,
    '--theme-hero-title-color': theme.hero?.titleColor || theme.colors.headingColor,
    '--theme-hero-title-size': theme.hero?.titleFontSize || '2.25rem',
    '--theme-logo-max-height': theme.logo?.maxHeight || '120px',
    '--theme-logo-align': theme.logo?.alignment || 'left',
    '--theme-table-radius': theme.table?.containerRadius || '0px',
    '--theme-table-alt-row': theme.table?.alternateRowBg || 'transparent',
    '--theme-body-line-height': theme.body?.lineHeight || 1.7,
    '--theme-content-padding': theme.spacing?.contentPadding || '80px',
  };
}