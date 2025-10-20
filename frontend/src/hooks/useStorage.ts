import { useState, useEffect, useCallback } from "react";

type StorageType = "local" | "session";

interface UseStorageOptions<T> {
  key: string;
  initialValue: T;
  storageType?: StorageType;
}

/**
 * Safely get storage object based on type.
 */
function getStorage(type: StorageType): Storage {
  return type === "session" ? window.sessionStorage : window.localStorage;
}

/**
 * Custom hook for syncing state with localStorage or sessionStorage.
 * @template T
 */
export function useStorage<T>({
  key,
  initialValue,
  storageType = "local",
}: UseStorageOptions<T>): [T, (value: T) => void, () => void] {
  const storage = getStorage(storageType);

  // Helper to safely parse JSON
  const safeParse = useCallback((value: string | null): T => {
    if (value === null) return initialValue;
    try {
      return JSON.parse(value) as T;
    } catch {
      // Corrupted value: remove and reset
      storage.removeItem(key);
      return initialValue;
    }
  }, [key, initialValue, storage]);

  // Initialize state from storage
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = storage.getItem(key);
    return safeParse(item);
  });

  // Update storage when state changes
  useEffect(() => {
    try {
      storage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Storage quota exceeded or other error
      // Optionally handle/log error here
    }
  }, [key, storedValue, storage]);

  // Set value in state and storage
  const setValue = useCallback((value: T) => {
    setStoredValue(value);
  }, []);

  // Remove value from storage and reset state
  const removeValue = useCallback(() => {
    storage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue, storage]);

  return [storedValue, setValue, removeValue];
}
