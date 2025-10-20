import { useState, useCallback } from 'react';

export interface UseArrayActions<T> {
  setArray: React.Dispatch<React.SetStateAction<T[]>>;
  push: (item: T) => void;
  filter: (callback: (item: T) => boolean) => void;
  update: (index: number, newItem: T) => void;
  remove: (index: number) => void;
  clear: () => void;
}

export interface UseArrayReturn<T> {
  array: T[];
  actions: UseArrayActions<T>;
}

/**
 * useArray - A reusable hook for managing array state with utility functions.
 * @param initialArray Initial array value (defaults to empty array)
 */
export function useArray<T>(initialArray: T[] = []): UseArrayReturn<T> {
  const [array, setArray] = useState<T[]>(initialArray);

  const push = useCallback((item: T) => {
    setArray(prev => [...prev, item]);
  }, []);

  const filter = useCallback((callback: (item: T) => boolean) => {
    setArray(prev => prev.filter(callback));
  }, []);

  const update = useCallback((index: number, newItem: T) => {
    setArray(prev =>
      prev.map((item, i) => (i === index ? newItem : item))
    );
  }, []);

  const remove = useCallback((index: number) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => {
    setArray([]);
  }, []);

  return {
    array,
    actions: {
      setArray,
      push,
      filter,
      update,
      remove,
      clear,
    },
  };
}
