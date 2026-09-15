import { useEffect, useState } from 'react';
import { resolvePlatformMode } from './platform';
import type { PlatformMode } from './platform';

/** React-friendly view of `resolvePlatformMode()`. Starts `'loading'` and
    settles once, since the mode never changes during a page's life. */
export function usePlatformMode(): PlatformMode | 'loading' {
  const [mode, setMode] = useState<PlatformMode | 'loading'>('loading');

  useEffect(() => {
    let cancelled = false;
    resolvePlatformMode().then((resolved) => {
      if (!cancelled) setMode(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return mode;
}
