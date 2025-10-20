import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAsyncConfig {
  immediate?: boolean;
}

interface UseAsyncState<T> {
  value: T | null;
  loading: boolean;
  error: unknown;
}

interface UseAsyncActions<T> {
  execute: (...args: any[]) => Promise<T | void>;
  reset: () => void;
}

type UseAsyncReturn<T> = UseAsyncState<T> & UseAsyncActions<T>;

/**
 * useAsync - A reusable hook to manage async operations with loading, error, and value state.
 * @param asyncFunction The async function to execute.
 * @param deps Dependency array to re-run asyncFunction if immediate is true.
 * @param config Optional config: { immediate?: boolean }
 */
export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  deps: any[] = [],
  config: UseAsyncConfig = {}
): UseAsyncReturn<T> {
  const { immediate = true } = config;

  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  // Used to prevent race conditions
  const currentPromiseId = useRef(0);

  const execute = useCallback(
    async (...args: any[]): Promise<T | void> => {
      setLoading(true);
      setError(null);
      const promiseId = ++currentPromiseId.current;
      try {
        const result = await asyncFunction(...args);
        if (promiseId === currentPromiseId.current) {
          setValue(result);
          setLoading(false);
          return result;
        }
      } catch (err) {
        if (promiseId === currentPromiseId.current) {
          setError(err);
          setLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps // Only re-create if deps change
  );

  const reset = useCallback(() => {
    setValue(null);
    setError(null);
    setLoading(false);
    currentPromiseId.current++;
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // Only run when deps change

  return {
    value,
    loading,
    error,
    execute,
    reset,
  };
}
