import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllQueries, updateQueryStatus as updateStatusInDb } from '../services/queryService';
import { isFirebaseConfigured } from '../config/firebase';
import { QUERIES_PAGE_SIZE, normalizeQueryStatus } from '../constants/queryStatus';

export function useQueries(isAuthenticated, statusFilter = 'all') {
  const [allQueries, setAllQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [updatingIds, setUpdatingIds] = useState({});

  const filteredQueries = useMemo(() => {
    if (statusFilter === 'all') return allQueries;
    return allQueries.filter((q) => normalizeQueryStatus(q.status) === statusFilter);
  }, [allQueries, statusFilter]);

  const queries = useMemo(
    () => filteredQueries.slice(0, page * QUERIES_PAGE_SIZE),
    [filteredQueries, page]
  );

  const hasMore = filteredQueries.length > page * QUERIES_PAGE_SIZE;

  const loadQueries = useCallback(async () => {
    if (!isFirebaseConfigured || !isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const fetched = await fetchAllQueries();
      setAllQueries(fetched);
    } catch (err) {
      console.error('Error fetching queries:', err);
      setAllQueries([]);
      setError('Failed to load queries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refresh = useCallback(() => {
    setPage(1);
    return loadQueries();
  }, [loadQueries]);

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setPage((p) => p + 1);
  }, [hasMore]);

  const updateStatus = useCallback(async (id, status) => {
    setUpdatingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await updateStatusInDb(id, status);
      setAllQueries((prev) => prev.map((q) => (
        q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q
      )));
      return true;
    } catch (err) {
      console.error('Error updating query status:', err);
      return false;
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [id]: false }));
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadQueries();
  }, [isAuthenticated, loadQueries]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  return {
    queries,
    filteredCount: filteredQueries.length,
    loading,
    error,
    hasMore,
    updatingIds,
    refresh,
    loadMore,
    updateStatus,
  };
}
