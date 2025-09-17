import { logger } from '@schwalbe/shared/lib/logger';

// Minimal toast stub for web app (replace with real UI toast when available)
export function toast({ title, description, duration }: { title: string; description?: string; duration?: number }) {
  const message = `[toast] ${title}${description ? `: ${description}` : ''} (duration: ${duration || 3000}ms)`;
  // In production, integrate with a real toast system (e.g., @schwalbe/ui toast)
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    logger.info(message);
  } else {
    // eslint-disable-next-line no-console
    logger.info(message);
  }
}

