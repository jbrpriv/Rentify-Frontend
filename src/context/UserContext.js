'use client';

/**
 * UserContext — global auth state for RentifyPro
 *
 * WHY THIS EXISTS
 * ---------------
 * Previously every page did `JSON.parse(localStorage.getItem('userInfo'))` in
 * its own useEffect.  This caused:
 *   • Stale role/name data between tabs (one tab logs out, others still show
 *     the old user until a full reload).
 *   • Race conditions: pages that needed the user would briefly render with
 *     `null` and then flash into the correct state.
 *   • No single place to call `GET /api/users/me` to hydrate fresh data.
 *
 * HOW TO USE
 * ----------
 *   import { useUser } from '@/context/UserContext';
 *   const { user, setUser, logout, refreshUser } = useUser();
 *
 *   • `user`          — the current user object (or null if not logged in)
 *   • `setUser(u)`    — persist a new user to state + localStorage (call after login)
 *   • `logout()`      — clears state, localStorage, redirects to /login
 *   • `refreshUser()` — re-fetches GET /api/users/me and updates state (call
 *                       after profile edits, 2FA toggle, etc.)
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAccessToken } from '@/utils/api';
import { requestFCMToken } from '@/utils/firebase';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const router = useRouter();

  // Initialise synchronously from localStorage so there's no flash on first
  // render — same as the old pattern, but now done exactly once.
  const [user, setUserState] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('userInfo');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Persist to localStorage whenever state changes so the token interceptor
  // in api.js (and any legacy code still reading localStorage directly) stays
  // in sync.
  const setUser = useCallback((u) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('userInfo', JSON.stringify(u));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, []);

  // Re-fetch the full profile from the server.  Called once on mount (to pick
  // up any server-side changes since the JWT was issued) and whenever a
  // component needs guaranteed-fresh data (e.g. after a profile update).
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me');
      setUser(data);
      return data;
    } catch (err) {
      // 401 → token expired; the api.js interceptor will try to refresh.
      // Any other error we treat as non-fatal and leave existing state alone.
      if (err.response?.status === 401) {
        setUser(null);
      }
      return null;
    }
  }, [setUser]);

  // On mount, silently hit /auth/refresh to re-hydrate the in-memory access
  // token from the HttpOnly refresh cookie. This replaces the old pattern of
  // checking localStorage for a token (SEC-01: tokens no longer in storage).
  useEffect(() => {
    api.post('/auth/refresh')
      .then(({ data }) => {
        if (data?.token) setAccessToken(data.token);
        return refreshUser();
      })
      .then(() => {
        // Silently re-register FCM token without prompting
        requestFCMToken(false).catch(() => { });
      })
      .catch(() => {
        // No valid refresh cookie — user is logged out, clear stale UI state
        setUserState(null);
        localStorage.removeItem('userInfo');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for storage events from OTHER tabs so role/logout changes propagate
  // immediately without a page reload.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'userInfo') {
        if (!e.newValue) {
          setUserState(null);
        } else {
          try { setUserState(JSON.parse(e.newValue)); } catch { /* ignore */ }
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (e) { /* ignore */ }
    setAccessToken(null);
    localStorage.removeItem('userInfo');
    setUserState(null);
    router.push('/login');
  }, [router]);

  return (
    <UserContext.Provider value={{ user, setUser, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}
