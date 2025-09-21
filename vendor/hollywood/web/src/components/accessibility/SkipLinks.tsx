
/**
 * Skip Links component for improved keyboard navigation
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';

interface SkipLink {
  href: string;
  id: string;
  label: string;
}

const getDefaultLinks = (t: (key: string) => string): SkipLink[] => [
  { id: 'main-content', label: t('accessibility.skipLinks.mainContent'), href: '#main-content' },
  { id: 'navigation', label: t('accessibility.skipLinks.navigation'), href: '#navigation' },
  { id: 'search', label: t('accessibility.skipLinks.search'), href: '#search' },
];

interface SkipLinksProps {
  className?: string;
  links?: SkipLink[];
}

export const SkipLinks: React.FC<SkipLinksProps> = ({
  links,
  className,
}) => {
  const { t } = useTranslation();
  const defaultLinks = getDefaultLinks(t);
  const skipLinks = links || defaultLinks;
  return (
    <nav
      aria-label={t('accessibility.skipLinks.skipLinksNavLabel')}
      className={cn(
        'skip-links',
        'fixed top-0 left-0 z-[100] bg-background',
        className
      )}
    >
      <ul className='list-none p-0 m-0'>
        {skipLinks.map(link => (
          <li key={link.id}>
            <a
              href={link.href}
              className={cn(
                'skip-link',
                'absolute left-[-9999px] top-auto',
                'px-4 py-2 bg-primary text-primary-foreground',
                'rounded-md no-underline',
                'focus:left-4 focus:top-4 focus:z-[101]',
                'transition-all duration-200'
              )}
              onClick={e => {
                e.preventDefault();
                const target = document.querySelector(link.href);
                if (target) {
                  (target as HTMLElement).focus();
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// Add CSS for screen readers only class
const srOnlyStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .sr-only-focusable:focus {
    position: absolute;
    width: auto;
    height: auto;
    padding: 0.5rem 1rem;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = srOnlyStyles;
  document.head.appendChild(styleSheet);
}
