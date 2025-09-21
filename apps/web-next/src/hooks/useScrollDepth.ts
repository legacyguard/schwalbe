import { useEffect, useRef } from "react";

export function useScrollDepth(threshold: number, onReach: () => void) {
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const maxScrollable = Math.max(1, scrollHeight - clientHeight);
      const ratio = maxScrollable > 0 ? scrollTop / maxScrollable : 0;
      if (!triggeredRef.current && ratio >= threshold) {
        triggeredRef.current = true;
        try { onReach(); } catch {}
        window.removeEventListener("scroll", handler, true);
      }
    };

    window.addEventListener("scroll", handler, { passive: true, capture: true } as any);
    // Initial check in case page loads scrolled
    handler();
    return () => window.removeEventListener("scroll", handler, true);
  }, [threshold, onReach]);
}
