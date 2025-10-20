import { useRef, useEffect } from 'react';

/**
 * usePrevious - Returns the previous value of a variable.
 * @param value The current value to track.
 * @returns The previous value, or undefined on first render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}