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
      bgSwatch: '#F7F5F0',
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
      tableHeaderText: '#FFFFFF',
      background: '#FFFFFF',
      heroBackground: '#F7F5F0',
    },
    textures: {
      pageBackground: 'none',
      heroPattern: 'linear-gradient(180deg, #F7F5F0 0%, #FFFFFF 100%)',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0.04,
      color: '#1B2A4A',
    },
    borders: {
      headerRule: '3px double #C5A55A',
      sectionRule: '1px solid #E2D9C8',
    },
    spacing: {
      fontSizeScale: 1.0,
      headingScale: 1.05,
      asideWidth: '340px',
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
      headerRule: '2px solid #3B82F6',
      sectionRule: '1px solid #F1F5F9',
    },
    spacing: {
      fontSizeScale: 0.98,
      headingScale: 0.95,
      asideWidth: '360px',
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
      accentSwatch: '#7B2D3B',
      bgSwatch: '#FAFAF8',
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
      heroBackground: '#FAFAF8',
    },
    textures: {
      pageBackground:
        'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.015) 27px, rgba(0,0,0,0.015) 28px)',
      heroPattern: 'linear-gradient(180deg, #FAFAF8 0%, #FFFFFF 100%)',
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
      accentSwatch: '#C4917B',
      bgSwatch: '#FAF7FF',
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
      headingColor: '#1A0E2E',
      bodyText: '#4A3F5C',
      tableBorder: '#E8D5C4',
      tableHeaderBg: 'linear-gradient(135deg, #2D1B4E 0%, #5A3D7E 100%)',
      tableHeaderText: '#FFFFFF',
      background: '#FFFFFF',
      heroBackground: '#FAF7FF',
    },
    textures: {
      pageBackground: 'none',
      heroPattern:
        'linear-gradient(180deg, rgba(250,247,255,0.95) 0%, rgba(243,234,255,0.55) 45%, rgba(255,255,255,0) 100%)',
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
      headingScale: 1.30,
      asideWidth: '400px',
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
      tableBorder: '#99F6E4',
      tableHeaderBg: '#0F766E',
      tableHeaderText: '#FFFFFF',
      background: '#FFFFFF',
      heroBackground: '#F0FDFA',
    },
    textures: {
      pageBackground: 'none',
      heroPattern: 'linear-gradient(180deg, #F0FDFA 0%, #FFFFFF 100%)',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0,
      color: '#0F766E',
    },
    borders: {
      headerRule: '3px solid #F97066',
      sectionRule: '1px solid #CCFBF1',
    },
    spacing: {
      fontSizeScale: 1.0,
      headingScale: 1.0,
      asideWidth: '360px',
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
      accentSwatch: '#B29B72',
      bgSwatch: '#FAF9F6',
    },
    fonts: {
      heading: "'Cinzel', 'Playfair Display', serif",
      body: "'Lora', 'Georgia', serif",
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Lora:wght@400;600;700&display=swap',
    },
    colors: {
      primary: '#0A0A0A',
      accent: '#9B8467',
      headingColor: '#1A1A1A',
      bodyText: '#3D3D3D',
      tableBorder: '#C5B5A5',
      tableHeaderBg: '#F5F2ED',
      tableHeaderText: '#1A1A1A',
      background: '#FFFFFF',
      heroBackground: '#FAF9F6',
    },
    textures: {
      pageBackground: 'radial-gradient(#E8E5DF 2px, transparent 2px)',
      heroPattern: 'linear-gradient(180deg, #FAF9F6 0%, #FFFFFF 100%)',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0,
      color: '#111111',
    },
    borders: {
      headerRule: '3px solid #9B8467',
      sectionRule: '2px dotted #C5B5A5',
    },
    spacing: {
      fontSizeScale: 1.12,
      headingScale: 1.35,
      asideWidth: '340px',
    },
  },

  // ─── 8. Tech Innovator ──────────────────────────────────────────────────
  {
    id: 'tech-innovator',
    name: 'Tech Innovator',
    description: 'A tech-forward minimalist theme using monospace headers and stark contrast.',
    layoutStyle: 'ledger',
    preview: {
      primarySwatch: '#000000',
      accentSwatch: '#3B82F6',
      bgSwatch: '#F8FAFC',
    },
    fonts: {
      heading: "'Space Grotesk', 'Courier New', monospace",
      body: "'Roboto', 'Helvetica Neue', sans-serif",
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800;900&family=Roboto:wght@400;500;700&display=swap',
    },
    colors: {
      primary: '#000000',
      accent: '#2563EB',
      headingColor: '#000000',
      bodyText: '#1F2937',
      tableBorder: '#E5E7EB',
      tableHeaderBg: '#000000',
      tableHeaderText: '#FFFFFF',
      background: '#FFFFFF',
      heroBackground: '#F8FAFC',
    },
    textures: {
      pageBackground: 'linear-gradient(90deg, transparent 98%, rgba(37,99,235,0.08) 100%)',
      heroPattern: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 0,
      color: '#0A0A0A',
    },
    borders: {
      headerRule: '6px solid #2563EB',
      sectionRule: '3px solid #E5E7EB',
    },
    spacing: {
      fontSizeScale: 1.05,
      headingScale: 1.15,
      asideWidth: '380px',
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
    '--theme-hero-bg': theme.colors.heroBackground,
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
  };
}