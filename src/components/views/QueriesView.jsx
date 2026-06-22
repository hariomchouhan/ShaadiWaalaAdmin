import { useState } from 'react';
import { Loader2, RefreshCw, ChevronDown, MessageSquare } from 'lucide-react';
import PageHeader from '../layout/PageHeader';
import { useQueries } from '../../hooks/useQueries';
import { QUERY_STATUSES, QUERY_STATUS_LABELS, QUERIES_PAGE_SIZE, normalizeQueryStatus, formatLookingFor, getQueryLookingFor } from '../../constants/queryStatus';
import { formatDateTime } from '../../utils/dateUtils';

export default function QueriesView({ isAuthenticated, showNotification }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const {
    queries,
    filteredCount,
    loading,
    error,
    hasMore,
    updatingIds,
    refresh,
    loadMore,
    updateStatus,
  } = useQueries(isAuthenticated, statusFilter);

  const handleStatusChange = async (query, nextStatus) => {
    if (normalizeQueryStatus(query.status) === nextStatus || updatingIds[query.id]) return;
    const ok = await updateStatus(query.id, nextStatus);
    if (ok) {
      showNotification?.(`Status updated to ${QUERY_STATUS_LABELS[nextStatus] || nextStatus}`);
    } else {
      showNotification?.('Failed to update status', 'error');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    ...QUERY_STATUSES,
  ];

  return (
    <div>
      <PageHeader
        title="Queries"
        subtitle="Website enquiries from the queries collection — update status as you follow up"
        badge={`${filteredCount} total${statusFilter !== 'all' ? ` · ${QUERY_STATUS_LABELS[statusFilter]}` : ''}`}
      >
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="sw-btn-secondary px-4 py-2.5 text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </PageHeader>

      <div className="flex flex-wrap gap-2 mb-5">
        {filterOptions.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              statusFilter === value
                ? 'bg-brand-gold text-white border-brand-gold'
                : 'bg-brand-bg text-brand-muted border-brand-gold/20 hover:border-brand-gold/40 hover:text-brand-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
          <p className="text-sm text-brand-muted">Loading queries...</p>
        </div>
      ) : error ? (
        <div className="sw-card p-12 text-center">
          <p className="font-display text-lg text-brand-text mb-2">{error}</p>
          <button type="button" onClick={refresh} className="sw-btn-secondary px-5 py-2.5 text-sm">
            Retry
          </button>
        </div>
      ) : queries.length === 0 ? (
        <div className="sw-card p-12 text-center">
          <MessageSquare className="w-10 h-10 text-brand-gold/40 mx-auto mb-3" />
          <p className="font-display text-lg text-brand-text mb-1">No queries found</p>
          <p className="text-sm text-brand-muted">
            {statusFilter === 'all'
              ? 'New website enquiries will appear here.'
              : `No queries with status "${QUERY_STATUS_LABELS[statusFilter] || statusFilter}".`}
          </p>
        </div>
      ) : (
        <>
          <div className="sw-card overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm text-left min-w-[880px]">
                <thead className="bg-brand-surface text-brand-muted font-semibold uppercase text-[10px] tracking-wider border-b border-brand-gold/15">
                  <tr>
                    <th className="px-4 py-3 min-w-[160px]">Name</th>
                    <th className="px-4 py-3 min-w-[130px]">Phone</th>
                    <th className="px-4 py-3 min-w-[120px]">City</th>
                    <th className="px-4 py-3 min-w-[120px]">Looking For</th>
                    <th className="px-4 py-3 min-w-[140px]">Status</th>
                    <th className="px-4 py-3 min-w-[150px]">Submitted</th>
                    <th className="px-4 py-3 min-w-[150px]">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gold/10">
                  {queries.map((q) => {
                    const normalized = normalizeQueryStatus(q.status);
                    const isUpdating = updatingIds[q.id];

                    return (
                      <tr key={q.id} className="hover:bg-brand-surface/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-brand-text">{q.name || '—'}</td>
                        <td className="px-4 py-3 text-brand-brown">
                          {q.phone ? (
                            <a href={`tel:${q.phone}`} className="hover:text-brand-gold transition-colors">
                              {q.phone}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-brand-muted">{q.city || '—'}</td>
                        <td className="px-4 py-3 text-brand-muted">{formatLookingFor(getQueryLookingFor(q))}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <select
                                value={normalized}
                                disabled={isUpdating}
                                onChange={(e) => handleStatusChange(q, e.target.value)}
                                className="sw-select py-1.5 pl-2.5 pr-8 text-xs font-semibold min-w-[130px] disabled:opacity-60"
                              >
                                {QUERY_STATUSES.map(({ value, label }) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                            </div>
                            {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-brand-gold shrink-0" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-brand-muted whitespace-nowrap">
                          {formatDateTime(q.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-xs text-brand-muted whitespace-nowrap">
                          {formatDateTime(q.updatedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {hasMore && (
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={loadMore}
                className="sw-btn-secondary px-6 py-2.5 text-sm"
              >
                Load more ({Math.min(QUERIES_PAGE_SIZE, filteredCount - queries.length)} more)
              </button>
            </div>
          )}

          {!hasMore && queries.length > 0 && (
            <p className="text-center py-6 text-xs text-brand-muted">All matching queries loaded</p>
          )}
        </>
      )}
    </div>
  );
}
