import { useEffect, useState, type RefObject } from 'react';

// Types for the hook parameters
export interface UseOnScreenOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

export interface UseOnScreenReturn {
  state: {
    isVisible: boolean;
  };
  actions: {};
  helpers: {};
}

/**
 * useOnScreen
 * Detects if a DOM element is visible in the viewport using Intersection Observer.
 *
 * @param ref - React ref object pointing to the target DOM element.
 * @param options - Optional Intersection Observer options.
 * @returns { isVisible } - Boolean indicating if the element is visible.
 */
export function useOnScreen<T extends Element>(
  ref: RefObject<T>,
  options: UseOnScreenOptions = {}
): UseOnScreenReturn {
  const {
    rootMargin = '0px',
    threshold = 0.1,
  } = options;

  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let observer: IntersectionObserver | null = null;

    try {
      observer = new window.IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        {
          root: null,
          rootMargin,
          threshold,
        }
      );
      observer.observe(node);
    } catch (error) {
      // Fallback: If IntersectionObserver is not supported
      setIsVisible(true);
    }

    return () => {
      if (observer && node) {
        observer.unobserve(node);
        observer.disconnect();
      }
    };
  }, [ref, rootMargin, threshold]);

  return {
    state: { isVisible },
    actions: {},
    helpers: {},
  };
}
