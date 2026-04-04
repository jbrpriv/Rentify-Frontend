'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const DEFAULT_BRANDING = {
  brandName: 'RentifyPro',
  supportEmail: 'support@rentifypro.com',
};

const BrandingContext = createContext(null);

const normalizeBranding = (input) => ({
  brandName: input?.brandName || DEFAULT_BRANDING.brandName,
  supportEmail: input?.supportEmail || DEFAULT_BRANDING.supportEmail,
});

export function BrandingProvider({ children, initialBranding = null }) {
  const [branding, setBranding] = useState(() => normalizeBranding(initialBranding));
  const [loading, setLoading] = useState(!initialBranding);

  const refreshBranding = useCallback(async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiBase}/settings/branding`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load branding');
      const data = await res.json();
      setBranding(normalizeBranding(data));
    } catch {
      setBranding(DEFAULT_BRANDING);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialBranding) {
      refreshBranding();
      return;
    }

    // Keep client in sync with latest admin changes after initial server hydration.
    refreshBranding();
  }, [refreshBranding, initialBranding]);

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
