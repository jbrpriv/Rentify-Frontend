'use client';

/**
 * src/app/dashboard/admin/billing/page.js
 *
 * [FIX #6]  Admin billing list view.
 *
 * Shows a full paginated table of every user with their subscription tier,
 * status, Stripe customer ID, and last plan-change date.
 * Also renders a summary bar (free / pro / enterprise counts + MRR).
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';

const TIER_BADGE = {
  free:       'bg-gray-100 text-gray-700',
  pro:        'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

const STATUS_BADGE = {
  active:   'bg-green-100 text-green-700',
  trialing: 'bg-yellow-100 text-yellow-700',
  past_due: 'bg-red-100 text-red-700',
  canceled: 'bg-gray-100 text-gray-500',
};

export default function AdminBillingPage() {
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // Filters + pagination
  const [page,     setPage]     = useState(1);
  const [tier,     setTier]     = useState('');
  const [search,   setSearch]   = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 25 });
      if (tier)   params.set('tier',   tier);
      if (search) params.set('search', search);

      const res = await api.get(`/api/admin/billing/users?${params}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, [page, tier, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleTierChange = (t) => {
    setPage(1);
    setTier(t === tier ? '' : t);
  };

  const fmt = (n) => `Rs. ${(n ?? 0).toLocaleString('en-PK')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Billing</h1>

      {/* ─── Summary bar ─────────────────────────────────────────────── */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Free',       value: data.summary.free,       color: 'bg-gray-50  border-gray-200',   badge: 'text-gray-700'  },
            { label: 'Pro',        value: data.summary.pro,        color: 'bg-blue-50  border-blue-200',   badge: 'text-blue-700'  },
            { label: 'Enterprise', value: data.summary.enterprise, color: 'bg-purple-50 border-purple-200', badge: 'text-purple-700' },
            { label: 'Monthly MRR',value: fmt(data.summary.totalMRR), color: 'bg-green-50 border-green-200', badge: 'text-green-700' },
          ].map(({ label, value, color, badge }) => (
            <div key={label} className={`rounded-xl border p-4 ${color}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-2xl font-bold ${badge}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── Filters ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Tier filter pills */}
        <div className="flex gap-2">
          {['free', 'pro', 'enterprise'].map((t) => (
            <button
              key={t}
              onClick={() => handleTierChange(t)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${tier === t
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 ml-auto">
          <input
            type="text"
            placeholder="Search name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              className="text-gray-500 text-sm underline"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* ─── Table ───────────────────────────────────────────────────── */}
      {error ? (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Stripe Customer</th>
                  <th className="px-4 py-3 text-left">Plan Changed</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.users?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  data?.users?.map((user) => {
                    const effectiveTier = user.subscriptionTier || 'free';
                    const status        = user.subscriptionStatus || (effectiveTier === 'free' ? 'free' : 'active');
                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        {/* User */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                          {user.isBanned && (
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Banned</span>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3 capitalize text-gray-600">{user.role}</td>

                        {/* Plan */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${TIER_BADGE[effectiveTier] || TIER_BADGE.free}`}>
                            {effectiveTier}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[status] || STATUS_BADGE.canceled}`}>
                            {status}
                          </span>
                        </td>

                        {/* Stripe Customer */}
                        <td className="px-4 py-3">
                          {user.stripeCustomerId ? (
                            <a
                              href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline text-xs font-mono"
                            >
                              {user.stripeCustomerId}
                            </a>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Plan Changed */}
                        <td className="px-4 py-3 text-gray-500">{fmtDate(user.subscriptionUpdatedAt)}</td>

                        {/* Joined */}
                        <td className="px-4 py-3 text-gray-500">{fmtDate(user.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, data.pagination.total)} of {data.pagination.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-600">
                  {page} / {data.pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                  disabled={page === data.pagination.pages}
                  className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
