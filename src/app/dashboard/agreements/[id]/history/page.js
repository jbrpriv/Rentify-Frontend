'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Clock, ArrowLeft, ChevronDown, ChevronUp, FileText, User,
  Shield, GitBranch, AlertTriangle, Loader2, Eye, Camera,
} from 'lucide-react';

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  draft:              'bg-gray-100 text-gray-600',
  pending_signature:  'bg-yellow-100 text-yellow-700',
  signed:             'bg-blue-100 text-blue-700',
  active:             'bg-green-100 text-green-700',
  expired:            'bg-red-100 text-red-700',
  cancelled:          'bg-red-100 text-red-600',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Audit Action Labels ──────────────────────────────────────────────────────
const ACTION_ICONS = {
  AGREEMENT_CREATED:       { icon: FileText,  color: 'text-blue-500',  bg: 'bg-blue-50' },
  SIGNING_INVITES_SENT:    { icon: Shield,    color: 'text-purple-500',bg: 'bg-purple-50' },
  PARTIAL_SIGNATURE:       { icon: User,      color: 'text-orange-500',bg: 'bg-orange-50' },
  AGREEMENT_FULLY_SIGNED:  { icon: Shield,    color: 'text-green-500', bg: 'bg-green-50' },
  LEASE_ACTIVATED:         { icon: Eye,       color: 'text-green-600', bg: 'bg-green-50' },
  RENT_PAID:               { icon: Eye,       color: 'text-green-500', bg: 'bg-green-50' },
  AUTO_EXPIRED:            { icon: Clock,     color: 'text-red-500',   bg: 'bg-red-50' },
  CLAUSES_UPDATED:         { icon: FileText,  color: 'text-blue-500',  bg: 'bg-blue-50' },
  DOCUMENTS_ARCHIVED:      { icon: Camera,    color: 'text-gray-500',  bg: 'bg-gray-50' },
  DEFAULT:                 { icon: Clock,     color: 'text-gray-400',  bg: 'bg-gray-50' },
};

// ─── Version Card ─────────────────────────────────────────────────────────────
function VersionCard({ version }) {
  const { formatMoney } = useCurrency();
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            v{version.version}
          </div>
          <div>
            <p className="font-medium text-gray-800">Version {version.version}</p>
            <p className="text-xs text-gray-500">
              {version.reason || 'Snapshot'} &bull;&nbsp;
              {new Date(version.savedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {version.snapshot?.status && <StatusBadge status={version.snapshot.status} />}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 text-sm space-y-3">
          {version.savedBy && (
            <p className="text-gray-600">
              <span className="font-medium">Saved by:</span>&nbsp;
              {version.savedBy?.name || version.savedBy}
            </p>
          )}
          {version.snapshot?.financials && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Monthly Rent</p>
                <p className="font-semibold text-gray-800">
                  {version.snapshot.financials.rentAmount != null ? formatMoney(version.snapshot.financials.rentAmount) : '—'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Deposit</p>
                <p className="font-semibold text-gray-800">
                  {version.snapshot.financials.depositAmount != null ? formatMoney(version.snapshot.financials.depositAmount) : '—'}
                </p>
              </div>
            </div>
          )}
          {version.snapshot?.term && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Term</p>
              <p className="text-gray-700">
                {version.snapshot.term.durationMonths} months&nbsp;&bull;&nbsp;
                {version.snapshot.term.startDate
                  ? new Date(version.snapshot.term.startDate).toLocaleDateString()
                  : '—'}
                &nbsp;→&nbsp;
                {version.snapshot.term.endDate
                  ? new Date(version.snapshot.term.endDate).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          )}
          {version.snapshot?.clauses?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Clauses at this version</p>
              <ul className="space-y-1">
                {version.snapshot.clauses.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Audit Log Item ───────────────────────────────────────────────────────────
function AuditItem({ entry }) {
  const cfg = ACTION_ICONS[entry.action] || ACTION_ICONS.DEFAULT;
  const Icon = cfg.icon;
  return (
    <div className="flex gap-4">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="pb-5 border-b border-gray-100 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="font-medium text-gray-800 text-sm">
            {entry.action?.replace(/_/g, ' ')}
          </p>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {new Date(entry.timestamp).toLocaleString()}
          </span>
        </div>
        {entry.details && (
          <p className="text-sm text-gray-500 leading-relaxed">{entry.details}</p>
        )}
        {entry.actor?.name && (
          <p className="text-xs text-gray-400 mt-1">By: {entry.actor.name}</p>
        )}
        {entry.ipAddress && (
          <p className="text-xs text-gray-400">IP: {entry.ipAddress}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AgreementHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tab, setTab]         = useState('versions');
  const [snapping, setSnapping] = useState(false);
  const [snapMsg, setSnapMsg]   = useState('');

  useEffect(() => {
    api.get(`/agreements/${params.id}/version-history`)
      .then(({ data }) => setData(data))
      .catch(err => setError(err.response?.data?.message || 'Could not load history'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const takeSnapshot = async () => {
    setSnapping(true);
    setSnapMsg('');
    try {
      const { data: snap } = await api.post(`/agreements/${params.id}/snapshot`, {
        reason: 'Manual snapshot by user',
      });
      setSnapMsg(`✅ Snapshot saved as Version ${snap.version}`);
      // Refresh
      const { data: fresh } = await api.get(`/agreements/${params.id}/version-history`);
      setData(fresh);
    } catch (err) {
      setSnapMsg(`❌ ${err.response?.data?.message || 'Snapshot failed'}`);
    } finally {
      setSnapping(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-indigo-600" /> Version History
          </h1>
          <p className="text-sm text-gray-500">
            Agreement &bull; {data?.currentVersion || 0} version(s) saved
          </p>
        </div>
        <button
          onClick={takeSnapshot}
          disabled={snapping}
          className="ml-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {snapping ? <Loader2 className="animate-spin w-4 h-4" /> : <Camera className="w-4 h-4" />}
          Save Snapshot
        </button>
      </div>

      {snapMsg && (
        <div className={`mb-4 text-sm px-4 py-3 rounded-lg border ${
          snapMsg.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {snapMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {[
          { key: 'versions', label: 'Versions', count: data?.versionHistory?.length },
          { key: 'audit',    label: 'Audit Log', count: data?.auditLog?.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              tab === t.key
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Versions Tab */}
      {tab === 'versions' && (
        <div className="space-y-3">
          {!data?.versionHistory?.length && (
            <div className="text-center py-12 text-gray-400">
              <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No version snapshots saved yet.</p>
              <p className="text-sm mt-1">Click "Save Snapshot" to capture the current state.</p>
            </div>
          )}
          {data?.versionHistory?.map(v => <VersionCard key={v.version} version={v} />)}
        </div>
      )}

      {/* Audit Log Tab */}
      {tab === 'audit' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          {!data?.auditLog?.length && (
            <div className="text-center py-10 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No audit events yet.</p>
            </div>
          )}
          <div className="space-y-0">
            {data?.auditLog?.map((entry, i) => <AuditItem key={i} entry={entry} />)}
          </div>
        </div>
      )}
    </div>
  );
}
