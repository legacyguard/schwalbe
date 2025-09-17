
import { useEffect } from 'react';

/**
 * Custom hook to dynamically set the page title in the browser tab
 * @param title - The page title to display (will be suffixed with "| LegacyGuard")
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | LegacyGuard`;

    // Cleanup function to restore previous title if component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
