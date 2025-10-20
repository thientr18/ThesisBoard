import { useEffect, useRef, type EffectCallback, type DependencyList } from 'react';

/**
 * A custom hook that behaves like useEffect, but skips running on the initial render.
 * @param effect The effect callback function.
 * @param deps Optional dependency list.
 */
export function useUpdateEffect(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    return effect();
  }, deps);
}
