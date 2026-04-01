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
import { useCurrency } from '@/context/CurrencyContext';

const TIER_BADGE = {
  free: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
  pro: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
  enterprise: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
};

const STATUS_BADGE = {
  active: 'bg-[#0B2D72] text-[#E6EAF2]',
  trialing: 'bg-[#E6EAF2] text-[#0B2D72] border border-[#CBD5E1]',
  past_due: 'bg-[#CBD5E1] text-[#1F2933]',
  canceled: 'bg-[#CBD5E1] text-[#1F2933]',
};

export default function AdminBillingPage() {
  const { formatMoney } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters + pagination
  const [page, setPage] = useState(1);
  const [tier, setTier] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 25 });
      if (tier) params.set('tier', tier);
      if (search) params.set('search', search);

      const res = await api.get(`/admin/billing/users?${params}`);
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

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Billing</h1>

      {/* ─── Summary bar ─────────────────────────────────────────────── */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Free', value: data.summary.free, color: 'bg-[#E6EAF2] border-[#CBD5E1]', badge: 'text-[#0B2D72]' },
            { label: 'Pro', value: data.summary.pro, color: 'bg-[#E6EAF2] border-[#CBD5E1]', badge: 'text-[#0B2D72]' },
            { label: 'Enterprise', value: data.summary.enterprise, color: 'bg-[#E6EAF2] border-[#CBD5E1]', badge: 'text-[#0B2D72]' },
            { label: 'Monthly MRR', value: formatMoney(data.summary.totalMRR), color: 'bg-[#E6EAF2] border-[#CBD5E1]', badge: 'text-[#0B2D72]' },
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
                  ? 'bg-[#0B2D72] text-[#E6EAF2] border-[#0B2D72]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-[#0B2D72]'}`}
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
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-[#0B2D72]"
          />
          <button
            type="submit"
            className="bg-[#0B2D72] text-[#E6EAF2] px-4 py-1.5 rounded-lg text-sm hover:opacity-90 transition-colors"
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
        <div className="text-[#1F2933] bg-[#E6EAF2] border border-[#CBD5E1] rounded-lg p-4">{error}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Landlord</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 3 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.users?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-gray-400">
                      No landlords found.
                    </td>
                  </tr>
                ) : (
                  data?.users?.map((user) => {
                    const effectiveTier = user.subscriptionTier || 'free';
                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        {/* Landlord */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                          {!user.isActive && (
                            <span className="text-xs bg-[#CBD5E1] text-[#1F2933] px-1.5 py-0.5 rounded">Banned</span>
                          )}
                        </td>

                        {/* Plan */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${TIER_BADGE[effectiveTier] || TIER_BADGE.free}`}>
                            {effectiveTier}
                          </span>
                        </td>

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