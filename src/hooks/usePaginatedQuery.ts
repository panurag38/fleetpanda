import { useCallback, useEffect, useState } from 'react';
import type { ApiResponse } from '../lib/api';
import type { PaginatedResult } from '../lib/pagination';

interface UsePaginatedQueryOptions {
  enabled?: boolean;
  onError?: (message: string) => void;
}

export const usePaginatedQuery = <T,>(
  fetchPage: (page: number, signal?: AbortSignal) => Promise<ApiResponse<PaginatedResult<T>>>,
  deps: readonly unknown[],
  options: UsePaginatedQueryOptions = {}
) => {
  const { enabled = true, onError } = options;
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [...deps]);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchPage(page, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setLoading(false);

        if (response.error || !response.data) {
          setItems([]);
          setTotal(0);
          setTotalPages(1);
          const message = response.error ?? 'Unable to load records.';
          setError(message);
          onError?.(message);
          return;
        }

        setItems(response.data.items);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } catch (caught) {
        if (controller.signal.aborted || (caught instanceof DOMException && caught.name === 'AbortError')) {
          return;
        }

        setLoading(false);
        setItems([]);
        setTotal(0);
        setTotalPages(1);
        const message = 'Unable to load records.';
        setError(message);
        onError?.(message);
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [enabled, fetchPage, onError, page, reloadToken, ...deps]);

  return {
    page,
    setPage,
    items,
    total,
    totalPages,
    loading,
    error,
    reload
  };
};
