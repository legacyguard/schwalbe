'use client';

import { useEffect } from 'react';

/**
 * Hook to update the document title
 * @param title - The title to set
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | Schwalbe` : 'Schwalbe';

    // Cleanup function to restore previous title
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}