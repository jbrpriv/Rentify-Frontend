'use client';

/**
 * ToastContext — lightweight toast notification system for RentifyPro
 *
 * Replaces all the `alert()` and manual msg-state patterns across pages.
 *
 * USAGE
 * -----
 *   import { useToast } from '@/context/ToastContext';
 *   const { toast } = useToast();
 *
 *   toast('Profile saved!');                     // success (default)
 *   toast('Something went wrong', 'error');      // error
 *   toast('OTP sent to your phone', 'info');     // info
 *   toast('Check your inputs', 'warning');       // warning
 */

import {
  createContext, useContext, useState, useCallback, useEffect,
} from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const CONFIGS = {
  success: {
    bg: '#E6EAF2', border: '#CBD5E1', text: '#0B2D72',
    iconBg: '#DBE4F0', Icon: CheckCircle, iconColor: '#0B2D72',
  },
  error: {
    bg: '#E6EAF2', border: '#CBD5E1', text: '#1F2933',
    iconBg: '#D9E2EF', Icon: XCircle, iconColor: '#0B2D72',
  },
  info: {
    bg: '#E6EAF2', border: '#CBD5E1', text: '#0B2D72',
    iconBg: '#DBE4F0', Icon: Info, iconColor: '#0B2D72',
  },
  warning: {
    bg: '#E6EAF2', border: '#CBD5E1', text: '#0B2D72',
    iconBg: '#DBE4F0', Icon: AlertTriangle, iconColor: '#0B2D72',
  },
};

function ToastItem({ toast: t, onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const in_ = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(in_);
  }, []);

  const cfg = CONFIGS[t.type] || CONFIGS.info;
  const { Icon } = cfg;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 16,
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        maxWidth: 360,
        width: '100%',
        transition: 'all 320ms cubic-bezier(0.22,1.25,0.36,1)',
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.92)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        style={{
          width: 32, height: 32, borderRadius: 10,
          background: cfg.iconBg, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <Icon style={{ width: 16, height: 16, color: cfg.iconColor }} />
      </div>
      <p style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: cfg.text, margin: 0, paddingTop: 6 }}>
        {t.message}
      </p>
      <button
        onClick={() => onRemove(t.id)}
        style={{ flexShrink: 0, opacity: 0.5, cursor: 'pointer', background: 'none', border: 'none', padding: 4 }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
      >
        <X style={{ width: 14, height: 14, color: cfg.text }} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: 'fixed', bottom: 24, right: 16,
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        gap: 8, alignItems: 'flex-end',
        pointerEvents: toasts.length ? 'auto' : 'none',
      }}
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 4500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}