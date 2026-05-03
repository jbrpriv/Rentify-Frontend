import React from 'react';
import { Check, X } from 'lucide-react';
import { VISUAL_THEMES } from './VisualThemes';

/**
 * ThemeGallery.js
 * 
 * Full-screen panel showing theme mini-previews.
 * Each card shows: page background color, hero color, font name, table header color.
 * No iframes needed — pure CSS div simulation of each theme.
 */

const ThemeCard = ({ theme, isActive, onSelect }) => {
  const heroStyle = theme.hero?.enabled ? {
    background: theme.hero.background,
    height: 48,
    borderRadius: '6px 6px 0 0',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '6px 10px',
  } : {
    background: theme.colors.heroBackground || '#FFFFFF',
    height: 48,
    borderRadius: '6px 6px 0 0',
    borderBottom: theme.borders.headerRule !== 'none' ? theme.borders.headerRule : '1px solid #eee',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '6px 10px',
  };

  const headingColor = theme.hero?.enabled ? theme.hero.titleColor : theme.colors.headingColor;

  return (
    <button
      onClick={() => onSelect(theme.id)}
      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left w-full group
        ${isActive ? 'border-violet-500 shadow-lg shadow-violet-100 scale-[1.02]' : 'border-gray-200 hover:border-violet-300 hover:shadow-md'}`}
      style={{ background: theme.pageBackground || '#FFFFFF' }}
    >
      {/* Simulated Hero */}
      <div style={heroStyle}>
        <span style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 900,
          fontSize: 10,
          color: headingColor,
          letterSpacing: theme.id === 'professional-legal' ? '0.1em' : '0',
          textTransform: ['commercial-classic', 'professional-legal', 'elegant-serif'].includes(theme.id) ? 'uppercase' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          maxWidth: '100%',
        }}>
          Rental Agreement
        </span>
      </div>

      {/* Simulated body */}
      <div style={{ padding: '8px 10px', background: theme.pageBackground || '#FFFFFF' }}>
        {/* Fake paragraph lines */}
        <div style={{ height: 4, background: theme.colors.bodyText, opacity: 0.15, borderRadius: 2, marginBottom: 4, width: '90%' }} />
        <div style={{ height: 4, background: theme.colors.bodyText, opacity: 0.12, borderRadius: 2, marginBottom: 8, width: '70%' }} />
        
        {/* Simulated table */}
        <div style={{
          border: `1px solid ${theme.colors.tableBorder}`,
          borderRadius: theme.table?.containerRadius || 3,
          overflow: 'hidden',
          fontSize: 0,
        }}>
          <div style={{ background: theme.colors.tableHeaderBg, padding: '4px 6px' }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: theme.colors.tableHeaderText, fontFamily: theme.fonts.body }}>
              Rent  •  Deposit  •  Term
            </span>
          </div>
          <div style={{ padding: '3px 6px', background: theme.pageBackground || '#FFFFFF' }}>
            <span style={{ fontSize: 7, color: theme.colors.bodyText, fontFamily: theme.fonts.body }}>
              $2,450 / mo  •  $2,450  •  12 mo
            </span>
          </div>
        </div>
      </div>

      {/* Active badge */}
      {isActive && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center z-10">
          <Check size={11} className="text-white" />
        </div>
      )}

      {/* Theme name */}
      <div className="p-2 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <p className="text-[11px] font-bold text-gray-900 truncate">
          {theme.name}
        </p>
        <p className="text-[9px] text-gray-400 truncate mt-0.5 uppercase tracking-wider">
          {theme.fonts.heading.split(',')[0].replace(/'/g, '')} · {theme.layoutStyle}
        </p>
      </div>
    </button>
  );
};

const ThemeGallery = ({ activeTheme, onThemeChange, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-700">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Document Theme Gallery</h3>
            <p className="text-sm text-violet-100 mt-1 opacity-90">Select a visual identity to transform your document's layout, typography, and structure</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 text-white/80 hover:text-white rounded-2xl hover:bg-white/10 transition-all active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {VISUAL_THEMES.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={activeTheme === theme.id}
                onSelect={(id) => { 
                  onThemeChange(id); 
                  onClose(); 
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 bg-white flex items-center justify-center">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Theme changes affect fonts, colors, hero sections, and layout structure
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeGallery;
