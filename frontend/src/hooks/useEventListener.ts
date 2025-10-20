import { useEffect, useRef } from 'react';

type EventHandler<T extends Event = Event> = (event: T) => void;

interface UseEventListenerReturn {
  // For future extensibility (e.g., expose helpers or state)
}

/**
 * useEventListener
 * A reusable React hook for attaching event listeners to DOM elements, window, or document.
 *
 * @param eventName - The name of the event to listen for (e.g., 'click', 'keydown').
 * @param handler - The callback function to handle the event.
 * @param element - The target element to attach the event listener to. Defaults to window.
 */
function useEventListener<
  K extends keyof WindowEventMap | keyof DocumentEventMap | string,
  T extends Event = Event
>(
  eventName: K,
  handler: EventHandler<T>,
  element?: Window | Document | HTMLElement | null
): UseEventListenerReturn {
  // Store the latest handler in a ref
  const savedHandler = useRef<EventHandler<T>>(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Default to window if no element is provided
    const target: Window | Document | HTMLElement =
      element ?? window;

    if (!target?.addEventListener) {
      return;
    }

    // Create event listener that calls handler from ref
    const eventListener = (event: Event) => {
      // Type assertion for custom events
      savedHandler.current(event as T);
    };

    target.addEventListener(eventName, eventListener);

    // Cleanup
    return () => {
      target.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);

  return {};
}

export default useEventListener;
