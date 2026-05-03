import React, { useState, useEffect } from 'react';
import { Check, X, Palette, Sparkles } from 'lucide-react';
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
      className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left w-full group
        ${isActive 
          ? 'border-[#0B2D72] shadow-xl shadow-blue-900/10 scale-[1.02] z-10' 
          : 'border-gray-100 hover:border-blue-300 hover:shadow-2xl hover:-translate-y-2'}`}
      style={{ background: theme.pageBackground || '#FFFFFF' }}
    >
      {/* Simulated Hero */}
      <div style={heroStyle} className="group-hover:brightness-105 transition-all">
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
            <div className="flex gap-1">
              <div style={{ width: 8, height: 3, background: theme.colors.tableHeaderText, opacity: 0.5, borderRadius: 1 }} />
              <div style={{ width: 12, height: 3, background: theme.colors.tableHeaderText, opacity: 0.5, borderRadius: 1 }} />
              <div style={{ width: 6, height: 3, background: theme.colors.tableHeaderText, opacity: 0.5, borderRadius: 1 }} />
            </div>
          </div>
          <div style={{ padding: '3px 6px', background: theme.pageBackground || '#FFFFFF' }}>
             <div className="flex gap-1">
              <div style={{ width: 12, height: 3, background: theme.colors.bodyText, opacity: 0.2, borderRadius: 1 }} />
              <div style={{ width: 8, height: 3, background: theme.colors.bodyText, opacity: 0.2, borderRadius: 1 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Active badge */}
      {isActive && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-[#0B2D72] rounded-full flex items-center justify-center z-10 shadow-lg animate-in zoom-in">
          <Check size={12} className="text-white" />
        </div>
      )}

      {/* Theme name */}
      <div className="p-3 border-t border-gray-50 bg-white/80 backdrop-blur-sm group-hover:bg-white transition-colors">
        <p className="text-[11px] font-black text-gray-900 truncate tracking-tight uppercase">
          {theme.name}
        </p>
        <p className="text-[9px] text-gray-400 truncate mt-0.5 font-bold uppercase tracking-[0.05em]">
          {theme.fonts.heading.split(',')[0].replace(/'/g, '')} · {theme.layoutStyle}
        </p>
      </div>
    </button>
  );
};

const ThemeGallery = ({ activeTheme, onThemeChange, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleSelect = (id) => {
    onThemeChange(id);
    handleClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md transition-all duration-300
        ${isMounted && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-[32px] shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300
          ${isMounted && !isClosing ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Using the grey/dark blue color scheme */}
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-slate-800 to-[#0B2D72] relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-full -ml-20 -mb-20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
               <Palette size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Visual Identity</h3>
                <span className="px-2 py-0.5 bg-blue-400/20 text-blue-100 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-400/30">Beta</span>
              </div>
              <p className="text-blue-100/70 text-sm font-medium mt-1">Transform your document with curated professional design systems</p>
            </div>
          </div>
          
          <button 
            onClick={handleClose} 
            className="p-3 text-white/40 hover:text-white rounded-2xl hover:bg-white/10 transition-all active:scale-90"
          >
            <X size={28} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {VISUAL_THEMES.map((theme, index) => (
              <div 
                key={theme.id}
                className="transition-all duration-500"
                style={{ 
                  transitionDelay: `${index * 50}ms`,
                  opacity: isMounted && !isClosing ? 1 : 0,
                  transform: isMounted && !isClosing ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <ThemeCard
                  theme={theme}
                  isActive={activeTheme === theme.id}
                  onSelect={handleSelect}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-5 border-t border-gray-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <Sparkles size={14} className="text-blue-500 animate-pulse" />
            Theme changes affect fonts, colors, and layout rules
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase italic">Rentify Theme Engine v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default ThemeGallery;

