'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CurrencyContext = createContext(null);
const STORAGE_KEY = 'rentify:currency';

const SUPPORTED = ['USD', 'PKR', 'EUR', 'GBP', 'AED', 'INR', 'SAR', 'CAD'];

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState({ USD: 1 });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.includes(saved)) setCurrency(saved);
    } catch (_) {
      // ignore local storage failures
    }
  }, []);

  const fetchRates = useCallback(async () => {
    try {
      const resp = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
      const data = await resp.json();
      if (data?.rates && typeof data.rates === 'object') {
        setRates({ USD: 1, ...data.rates });
        setLastUpdated(new Date());
      }
    } catch (_) {
      // keep existing rates on network failure
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const id = setInterval(fetchRates, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchRates]);

  const selectCurrency = useCallback((next) => {
    const code = String(next || '').toUpperCase();
    if (!SUPPORTED.includes(code)) return;
    setCurrency(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch (_) {
      // ignore local storage failures
    }
  }, []);

  const rate = rates[currency] || 1;

  const convertFromUSD = useCallback((amount) => safeNumber(amount) * rate, [rate]);

  const convertToUSD = useCallback((amount) => {
    const num = safeNumber(amount);
    return rate > 0 ? num / rate : 0;
  }, [rate]);

  const formatMoney = useCallback((amount, opts = {}) => {
    const value = convertFromUSD(amount);
    const maximumFractionDigits = opts.maximumFractionDigits ?? 0;
    const minimumFractionDigits = opts.minimumFractionDigits ?? 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits,
      minimumFractionDigits,
    }).format(value);
  }, [convertFromUSD, currency]);

  const value = useMemo(() => ({
    currency,
    supportedCurrencies: SUPPORTED,
    selectCurrency,
    convertFromUSD,
    convertToUSD,
    formatMoney,
    rates,
    lastUpdated,
  }), [currency, selectCurrency, convertFromUSD, convertToUSD, formatMoney, rates, lastUpdated]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}
