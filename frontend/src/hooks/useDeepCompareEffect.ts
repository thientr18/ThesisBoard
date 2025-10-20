import { useEffect, useRef, type EffectCallback, type DependencyList } from 'react';

// Deep equality check utility (shallow for primitives, recursive for objects/arrays)
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

/**
 * useDeepCompareEffect
 * Behaves like React's useEffect, but uses deep comparison on dependencies.
 *
 * @param effect - Effect callback (may return cleanup)
 * @param deps - Dependency array (primitives, arrays, or objects)
 */
export function useDeepCompareEffect(
  effect: EffectCallback,
  deps: DependencyList
): void {
  const prevDepsRef = useRef<DependencyList | undefined>(undefined);

  const depsChanged =
    !prevDepsRef.current || !deepEqual(prevDepsRef.current, deps);

  useEffect(() => {
    if (depsChanged) {
      prevDepsRef.current = deps;
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsChanged, effect, deps]);
}
