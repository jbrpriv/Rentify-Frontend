'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/utils/api';

const FALLBACK_THEME = {
  _id: 'fallback',
  name: 'Default Blue',
  primaryColor: '#0B2D72',
  accentColor: '#0992C2',
  backgroundColor: '#F5FAFF',
  fontFamily: 'Helvetica',
};

const UI_THEME = {
  primaryColor: '#0B2D72',
  accentColor: '#0992C2',
  backgroundColor: '#F5FAFF',
};

function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') return `rgba(11,45,114,${alpha})`;
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;

  if (value.length !== 6) return `rgba(11,45,114,${alpha})`;

  const int = Number.parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function useGlobalPdfTheme() {
  const [themes, setThemes] = useState([]);
  const [activeTheme, setActiveTheme] = useState(FALLBACK_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const pickUiTheme = (list) => (
      list.find((t) => t.isUiDefault)
      || list.find((t) => t.layoutStyle === 'modern')
      || list.find((t) => t.isDefault)
      || list[0]
      || FALLBACK_THEME
    );

    api.get('/pdf-themes')
      .then(({ data }) => {
        if (ignore) return;
        const list = Array.isArray(data) ? data : [];
        setThemes(list);

        const picked = pickUiTheme(list);
        setActiveTheme(picked);
      })
      .catch(() => {
        if (ignore) return;
        setThemes([]);
        setActiveTheme(FALLBACK_THEME);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const cssVars = useMemo(() => {
    const primary = UI_THEME.primaryColor;
    const accent = UI_THEME.accentColor;
    const bg = UI_THEME.backgroundColor;

    return {
      '--brand-primary': primary,
      '--brand-accent': accent,
      '--brand-bg': bg,
      '--brand-primary-soft': hexToRgba(primary, 0.1),
      '--brand-accent-soft': hexToRgba(accent, 0.12),
      '--brand-border': hexToRgba(primary, 0.22),
    };
  }, []);

  return {
    themes,
    activeTheme,
    loading,
    cssVars,
  };
}
