import { useEffect, useRef } from "react";

export function useOnceInView<T extends HTMLElement>(
  options: IntersectionObserverInit,
  onEnter: () => void
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let triggered = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!triggered && entry.isIntersecting) {
          triggered = true;
          try {
            onEnter();
          } finally {
            observer.disconnect();
          }
        }
      });
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
  }, [onEnter, options.root, options.rootMargin, options.threshold]);

  return ref;
}
