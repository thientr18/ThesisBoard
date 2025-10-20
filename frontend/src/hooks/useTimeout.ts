import { useEffect, useRef, useCallback, useState } from "react";

export interface UseTimeoutParams {
  callback: () => void;
  delay: number | null;
}

export interface UseTimeoutReturn {
  state: {
    isPending: boolean;
    error: Error | null;
  };
  actions: {
    clear: () => void;
    restart: () => void;
  };
  helpers?: {};
}

/**
  * useTimeout - A hook that manages a timeout with clear and restart capabilities.
  * @param callback The function to be executed after the delay.
  * @param delay The delay in milliseconds. If null, the timeout is not set.
  * @returns An object containing the state of the timeout and actions to control it.
*/
export function useTimeout({
  callback,
  delay,
}: UseTimeoutParams): UseTimeoutReturn {
  const timeoutId = useRef<number | null>(null);
  const savedCallback = useRef(callback);

  const [isPending, setIsPending] = useState<boolean>(!!delay);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutId.current !== null) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, []);

  const restart = useCallback(() => {
    clear();
    if (delay !== null) {
      setIsPending(true);
      try {
        timeoutId.current = window.setTimeout(() => {
          try {
            savedCallback.current();
            setIsPending(false);
          } catch (err) {
            setError(err as Error);
            setIsPending(false);
          }
        }, delay);
      } catch (err) {
        setError(err as Error);
        setIsPending(false);
      }
    }
  }, [delay, clear]);

  useEffect(() => {
    restart();
    return clear;
  }, [delay, callback, restart, clear]);

  return {
    state: { isPending, error },
    actions: { clear, restart },
  };
}
