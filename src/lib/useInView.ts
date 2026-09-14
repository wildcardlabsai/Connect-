import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Fraction of the element that must be visible before it counts. */
  threshold?: number;
  rootMargin?: string;
};

/**
 * True when we should not animate at all: no observer to work with, or the
 * user has asked for reduced motion. Evaluated once, when the hook first runs.
 */
function skipAnimation(): boolean {
  if (typeof window === 'undefined') return true;
  if (typeof IntersectionObserver === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reports the first time an element enters the viewport, then stops observing.
 * Returns `true` immediately when the user prefers reduced motion or when
 * IntersectionObserver is unavailable, so content is never withheld.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.08,
  rootMargin = '0px 0px -8% 0px',
}: Options = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(skipAnimation);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, inView]);

  return { ref, inView };
}
