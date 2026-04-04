'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const DEFAULT_BRANDING = {
  brandName: 'RentifyPro',
  supportEmail: 'support@rentifypro.com',
};

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  const refreshBranding = useCallback(async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiBase}/settings/branding`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load branding');
      const data = await res.json();
      setBranding({
        brandName: data.brandName || DEFAULT_BRANDING.brandName,
        supportEmail: data.supportEmail || DEFAULT_BRANDING.supportEmail,
      });
    } catch {
      setBranding(DEFAULT_BRANDING);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBranding();
  }, [refreshBranding]);

  const value = useMemo(
    () => ({ ...branding, loading, refreshBranding }),
    [branding, loading, refreshBranding]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used inside <BrandingProvider>');
  return ctx;
}
