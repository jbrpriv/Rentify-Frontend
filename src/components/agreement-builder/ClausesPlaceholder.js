import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useContext } from 'react';
import { Sparkles, ScrollText, Star, Scale, Zap, BookOpen } from 'lucide-react';

/**
 * ClausesPlaceholder — theme-aware via data-layout-style attribute
 * injected by AgreementBuilder onto the .a4-page wrapper.
 *
 * Each layoutStyle gets a distinct visual treatment for the clause zone.
 */

const THEME_CONFIGS = {
  minimalist: {
    wrapper: { background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '32px 40px' },
    badge: { background: '#e2e8f0', color: '#475569' },
    icon: { background: '#e2e8f0', color: '#64748b' },
    title: { color: '#1e293b' },
    sub: { color: '#64748b' },
    Icon: ScrollText,
  },
  classic: {
    wrapper: {
      background: 'linear-gradient(180deg, #FAF6EE 0%, #F5EFE0 100%)',
      border: '1px solid #C5A55A',
      borderRadius: '0px',
      padding: '32px 40px',
      boxShadow: '0 2px 8px rgba(197,165,90,0.12)',
      borderLeft: '4px double #C5A55A',
    },
    badge: { background: '#1B2A4A', color: '#F5DFA0' },
    icon: { background: '#F5EFE0', color: '#C5A55A', border: '1px solid #C5A55A' },
    title: { color: '#1B2A4A', fontFamily: "'Playfair Display', Georgia, serif" },
    sub: { color: '#5C4A2A' },
    Icon: BookOpen,
  },
  modern: {
    wrapper: {
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)',
      border: '1px solid #BFDBFE',
      borderRadius: '16px',
      padding: '28px 36px',
      boxShadow: '0 4px 24px rgba(59,130,246,0.08)',
    },
    badge: { background: '#DBEAFE', color: '#1D4ED8' },
    icon: { background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE' },
    title: { color: '#1E293B' },
    sub: { color: '#475569' },
    Icon: Sparkles,
  },
  legal: {
    wrapper: {
      background: '#FDFCFA',
      border: '1px solid #D1CBC3',
      borderRadius: '0px',
      padding: '28px 36px',
      borderTop: '3px double #7B2D3B',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)',
    },
    badge: { background: '#1A1A2E', color: '#E8D5C4', letterSpacing: '0.15em' },
    icon: { background: '#F5F0EB', color: '#7B2D3B', border: '1px solid #D1CBC3' },
    title: { color: '#1A1A2E', fontFamily: "'Merriweather', Georgia, serif" },
    sub: { color: '#4A3F35' },
    Icon: Scale,
  },
  premium: {
    wrapper: {
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '24px',
      padding: '32px 40px',
      boxShadow: '0 8px 32px rgba(45,27,78,0.18), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    badge: { background: 'rgba(212,165,116,0.2)', color: '#D4A574', border: '1px solid rgba(212,165,116,0.3)' },
    icon: { background: 'rgba(212,165,116,0.15)', color: '#D4A574', border: '1px solid rgba(212,165,116,0.25)' },
    title: { color: '#2D1B4E' },
    sub: { color: '#6B5A7E' },
    Icon: Star,
  },
  contemporary: {
    wrapper: {
      background: 'linear-gradient(160deg, #F0FDFA 0%, #CCFBF1 100%)',
      border: '2px solid #2DD4BF',
      borderRadius: '16px',
      padding: '28px 36px',
      boxShadow: '0 4px 20px rgba(15,118,110,0.1)',
    },
    badge: { background: '#0F766E', color: '#FFFFFF', borderRadius: '99px' },
    icon: { background: '#CCFBF1', color: '#0F766E', border: '1px solid #2DD4BF' },
    title: { color: '#134E4A' },
    sub: { color: '#0F766E' },
    Icon: Sparkles,
  },
  editorial: {
    wrapper: {
      background: '#FAF9F6',
      border: '1px solid #C5B5A5',
      borderRadius: '0px',
      padding: '32px 40px',
      boxShadow: '4px 4px 0 #E8E2DA',
    },
    badge: { background: '#F5F2ED', color: '#6B5D4E', letterSpacing: '0.12em', border: '1px solid #C5B5A5' },
    icon: { background: '#F0EDE8', color: '#9B8467', border: '1px solid #C5B5A5' },
    title: { color: '#111111', fontFamily: "'Cinzel', serif" },
    sub: { color: '#6B5D4E' },
    Icon: BookOpen,
  },
  ledger: {
    wrapper: {
      background: '#FFFFFF',
      border: '2px solid #000000',
      borderRadius: '0px',
      padding: '28px 36px',
      boxShadow: '6px 6px 0 rgba(0,0,0,0.85)',
    },
    badge: { background: '#0A0A0A', color: '#FFFFFF', letterSpacing: '0.15em', borderRadius: '0px' },
    icon: { background: '#F9FAFB', color: '#2563EB', border: '2px solid #000000', borderRadius: '0px' },
    title: { color: '#000000', fontFamily: "'Space Grotesk', monospace" },
    sub: { color: '#374151' },
    Icon: Zap,
  },
};

const ClausesPlaceholderComponent = ({ node }) => {
  // Read the layout style from the closest .a4-page[data-layout-style] attribute
  const [layoutStyle, setLayoutStyle] = React.useState('minimalist');

  React.useEffect(() => {
    // Walk up the DOM to find the a4-page and read its layout style
    const findLayout = (el) => {
      let cur = el;
      while (cur) {
        const ls = cur.getAttribute?.('data-layout-style');
        if (ls) return ls;
        cur = cur.parentElement;
      }
      return 'minimalist';
    };

    // Use a MutationObserver on the .a4-page to detect layout-style changes
    const pageEl = document.querySelector('.a4-page[data-layout-style]');
    if (pageEl) {
      setLayoutStyle(pageEl.getAttribute('data-layout-style') || 'minimalist');
      const obs = new MutationObserver(() => {
        setLayoutStyle(pageEl.getAttribute('data-layout-style') || 'minimalist');
      });
      obs.observe(pageEl, { attributes: true, attributeFilter: ['data-layout-style'] });
      return () => obs.disconnect();
    }
  }, []);

  const cfg = THEME_CONFIGS[layoutStyle] || THEME_CONFIGS.minimalist;
  const { Icon } = cfg;

  return (
    <NodeViewWrapper className="clauses-placeholder-wrapper my-8 not-prose" contentEditable={false}>
      <div style={cfg.wrapper}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          {/* Icon */}
          <div style={{
            padding: '12px',
            borderRadius: cfg.wrapper.borderRadius === '0px' ? '4px' : '12px',
            flexShrink: 0,
            ...cfg.icon,
          }}>
            <Icon size={28} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: cfg.wrapper.borderRadius === '0px' ? '2px' : '99px',
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '10px',
              ...cfg.badge,
            }}>
              <Sparkles size={10} />
              Dynamic Section
            </div>

            {/* Title */}
            <div style={{
              fontSize: '18px',
              fontWeight: 800,
              lineHeight: 1.3,
              marginBottom: '6px',
              ...cfg.title,
            }}>
              Clause Library Integration Zone
            </div>

            {/* Subtitle */}
            <div style={{
              fontSize: '13px',
              fontWeight: 500,
              lineHeight: 1.5,
              ...cfg.sub,
            }}>
              Drag-and-dropped clauses will appear exactly in this location during agreement drafting.
            </div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const ClausesPlaceholder = Node.create({
  name: 'clausesPlaceholder',
  group: 'block',
  atom: true,
  draggable: true,

  parseHTML() {
    return [{ tag: 'div[data-type="clauses-placeholder"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'clauses-placeholder' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ClausesPlaceholderComponent);
  },
});