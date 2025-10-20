import { useState, useRef, useCallback } from 'react';

export interface UseStateWithHistoryResult<T> {
  value: T;
  setValue: (val: T | ((prev: T) => T)) => void;
  history: T[];
  pointer: number;
  back: () => void;
  forward: () => void;
  go: (index: number) => void;
}

export function useStateWithHistory<T>(
  initialValue: T,
  capacity: number = 10
): UseStateWithHistoryResult<T> {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [pointer, setPointer] = useState(0);
  const capacityRef = useRef(capacity);

  const setValue = useCallback(
    (val: T | ((prev: T) => T)) => {
      setHistory((currentHistory) => {
        const resolvedValue =
          typeof val === 'function'
            ? (val as (prev: T) => T)(currentHistory[pointer])
            : val;

        // Discard future states if not at the end
        const updatedHistory = currentHistory.slice(0, pointer + 1);

        updatedHistory.push(resolvedValue);

        // Enforce capacity
        const excess = updatedHistory.length - capacityRef.current;
        if (excess > 0) {
          updatedHistory.splice(0, excess);
        }

        setPointer(updatedHistory.length - 1);
        return updatedHistory;
      });
    },
    [pointer]
  );

  const back = useCallback(() => {
    setPointer((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const forward = useCallback(() => {
    setPointer((prev) => (prev < history.length - 1 ? prev + 1 : prev));
  }, [history.length]);

  const go = useCallback((index: number) => {
    setPointer((prev) =>
      index < 0 || index >= history.length ? prev : index
    );
  }, [history.length]);

  return {
    value: history[pointer],
    setValue,
    history,
    pointer,
    back,
    forward,
    go,
  };
}
