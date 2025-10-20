import { useEffect, useRef } from 'react';
import { useAsync } from './useAsync';

export interface UseScriptConfig {
  immediate?: boolean;
}

export interface UseScriptReturn {
  value: HTMLScriptElement | null;
  loading: boolean;
  error: unknown;
  execute: () => Promise<HTMLScriptElement | void>;
}

const loadedScripts = new Map<string, HTMLScriptElement>();

/**
 * useScript - Dynamically load an external JS script and track its state.
 * @param url Script source URL (required)
 * @param config Optional config: { immediate?: boolean }
 */
export function useScript(
  url: string,
  config: UseScriptConfig = {}
): UseScriptReturn {
  const { immediate = true } = config;
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const loadScript = async (): Promise<HTMLScriptElement> => {
    if (!url) throw new Error('Script URL is required');

    // Reuse existing script if already loaded
    if (loadedScripts.has(url)) {
      return loadedScripts.get(url)!;
    }

    // Check if script already exists in DOM
    let script = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`);
    if (script && script.dataset.loaded === 'true') {
      loadedScripts.set(url, script);
      return script;
    }

    // Create new script element
    script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.dataset.loaded = 'false';

    const promise = new Promise<HTMLScriptElement>((resolve, reject) => {
      script!.onload = () => {
        script!.dataset.loaded = 'true';
        loadedScripts.set(url, script!);
        resolve(script!);
      };
      script!.onerror = () => {
        reject(new Error(`Failed to load script: ${url}`));
      };
    });

    document.head.appendChild(script);
    scriptRef.current = script;

    return promise;
  };

  const { value, loading, error, execute } = useAsync<HTMLScriptElement>(
    loadScript,
    [url],
    { immediate }
  );

  // Cleanup: remove script if unmounted before load finishes
  useEffect(() => {
    return () => {
      const script = scriptRef.current;
      if (script && script.dataset.loaded !== 'true') {
        script.parentElement?.removeChild(script);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { value, loading, error, execute };
}