import { useRef, useEffect } from 'react';
import { useAsync } from './useAsync';

interface UseFetchConfig {
  immediate?: boolean;
}

interface UseFetchReturn<T> {
  value: T | null;
  error: unknown;
  loading: boolean;
  execute: () => Promise<T | void>;
}

export function useFetch<T = unknown>(
  url: string,
  options?: RequestInit,
  config: UseFetchConfig = {}
): UseFetchReturn<T> {
  const { immediate = true } = config;
  const abortControllerRef = useRef<AbortController | null>(null);

  // The async fetch function, wrapped for useAsync
  const fetchData = async (): Promise<T> => {
    // Abort any previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
      }

      // Try to parse JSON, handle empty response
      const text = await response.text();
      if (!text) return null as T;

      try {
        return JSON.parse(text) as T;
      } catch (parseErr) {
        throw new Error('Failed to parse JSON response');
      }
    } finally {
      // Clean up controller after fetch
      abortControllerRef.current = null;
    }
  };

  const { value, error, loading, execute, reset } = useAsync<T>(fetchData, [url, JSON.stringify(options)], { immediate });

  // Abort fetch on unmount or url/options change
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
    // Only run on unmount or url/options change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(options)]);

  return {
    value,
    error,
    loading,
    execute,
  };
}
