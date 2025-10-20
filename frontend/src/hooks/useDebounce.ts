import { useEffect, useState } from "react";

/**
 * useDebounce hook
 * Returns a debounced value after the specified delay.
 *
 * @template T - Type of the value to debounce
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
