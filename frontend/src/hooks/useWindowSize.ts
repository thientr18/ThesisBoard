import { useState, useEffect, useRef } from "react";

export interface WindowSize {
  width: number;
  height: number;
}

interface UseWindowSizeReturn {
  state: WindowSize;
  actions: {
    refresh: () => void;
  };
}

const getWindowSize = (): WindowSize => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * useWindowSize - React hook to get and track the current window size.
 * Handles SSR, avoids unnecessary re-renders, and provides a manual refresh action.
 */
export function useWindowSize(): UseWindowSizeReturn {
  const [windowSize, setWindowSize] = useState<WindowSize>(getWindowSize());
  const prevSize = useRef<WindowSize>(windowSize);

  const handleResize = () => {
    const newSize = getWindowSize();
    // Only update state if size actually changed
    if (
      newSize.width !== prevSize.current.width ||
      newSize.height !== prevSize.current.height
    ) {
      prevSize.current = newSize;
      setWindowSize(newSize);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("resize", handleResize);

    // Initial check in case of late mount
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state: windowSize,
    actions: {
      refresh: handleResize,
    },
  };
}
