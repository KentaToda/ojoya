/* ═══════════════════════════════════════════════════════════════════════════
   APPRAISAL HISTORY HOOK
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getAppraisalHistory } from '@/lib/api';
import type { AppraisalDocument } from '@/types/api';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface UseAppraisalHistoryReturn {
  appraisals: AppraisalDocument[];
  total: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────

export function useAppraisalHistory(
  limit = 20
): UseAppraisalHistoryReturn {
  const { user, loading: authLoading } = useAuth();
  const [appraisals, setAppraisals] = useState<AppraisalDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);

  // Fetch history
  const fetchHistory = useCallback(
    async (reset = false) => {
      if (!user) {
        setAppraisals([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;

      try {
        const data = await getAppraisalHistory(limit, currentOffset);
        const appraisalList = data.appraisals ?? [];

        if (reset) {
          setAppraisals(appraisalList);
          setOffset(limit);
        } else {
          setAppraisals((prev) => [...prev, ...appraisalList]);
          setOffset((prev) => prev + limit);
        }

        setTotal(data.total ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    },
    [user, limit, offset]
  );

  // Initial fetch when user changes
  useEffect(() => {
    if (!authLoading) {
      setOffset(0);
      fetchHistory(true);
    }
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh function
  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchHistory(true);
  }, [fetchHistory]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (loading || appraisals.length >= total) return;
    await fetchHistory(false);
  }, [loading, appraisals.length, total, fetchHistory]);

  return {
    appraisals,
    total,
    loading,
    error,
    refresh,
    loadMore,
    hasMore: appraisals.length < total,
  };
}
