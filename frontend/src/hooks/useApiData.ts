'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

type FetchResult<T> = Promise<{ data: T; isLive: boolean } | T>;

export function useApiData<T>(fetchFn: (mode: 'live' | 'mock') => FetchResult<T>, deps: unknown[] = []) {
  const { apiMode } = useAppStore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(apiMode);
      if (result && typeof result === 'object' && 'data' in result && 'isLive' in result) {
        const wrapped = result as { data: T; isLive: boolean };
        setData(wrapped.data);
        setIsLive(wrapped.isLive);
      } else {
        setData(result as T);
        setIsLive(apiMode === 'live');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [apiMode, fetchFn, ...deps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, isLive, refetch: fetchData };
}

