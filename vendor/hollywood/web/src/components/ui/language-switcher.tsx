
/**
 * Language Switcher Component
 * Allows users to switch between supported languages
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Supported languages with their display names and flags
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰', nativeName: 'Slovenčina' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿', nativeName: 'Čeština' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', nativeName: 'Polski' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺', nativeName: 'Magyar' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷', nativeName: 'Hrvatski' },
] as const;

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'sidebar';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'default',
  className = '',
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage =
    SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) ||
    SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setIsOpen(false);

      // Store preference in localStorage
      localStorage.setItem('legacyguard-language', languageCode);

      // Optional: Show success toast
      console.log(t('languageSwitcher.languageChanged', { language: languageCode }));
    } catch (error) {
      console.error(t('languageSwitcher.failedToChange'), error);
    }
  };

  // Minimal variant for sidebar
  if (variant === 'minimal') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className={`h-8 w-8 p-0 hover:bg-sidebar-accent ${className}`}
          >
            <Globe className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          {SUPPORTED_LANGUAGES.map(language => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className='flex items-center gap-2 cursor-pointer'
            >
              <span className='text-base'>{language.flag}</span>
              <span className='flex-1'>{language.nativeName}</span>
              {currentLanguage.code === language.code && (
                <Check className='h-4 w-4 text-primary' />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <div className={`w-full ${className}`}>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='w-full justify-start gap-2 h-10 px-2 text-sidebar-foreground hover:bg-sidebar-accent'
            >
              <Globe className='h-4 w-4' />
              <span className='flex-1 text-left'>
                {currentLanguage.nativeName}
              </span>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='right' align='start' className='w-48'>
            {SUPPORTED_LANGUAGES.map(language => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className='flex items-center gap-2 cursor-pointer'
              >
                <span className='text-base'>{language.flag}</span>
                <span className='flex-1'>{language.nativeName}</span>
                {currentLanguage.code === language.code && (
                  <Check className='h-4 w-4 text-primary' />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Default variant with full button
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className={`flex items-center gap-2 min-w-[120px] ${className}`}
        >
          <motion.span
            key={currentLanguage.code}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className='text-base'
          >
            {currentLanguage.flag}
          </motion.span>
          <span className='hidden sm:inline'>{currentLanguage.nativeName}</span>
          <ChevronDown className='h-4 w-4 opacity-50' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-56'>
        <div className='p-2'>
          <div className='text-xs font-medium text-muted-foreground mb-2'>
            {t('languageSwitcher.selectLanguage')}
          </div>
          {SUPPORTED_LANGUAGES.map(language => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className='flex items-center gap-3 cursor-pointer rounded-md p-2 hover:bg-accent'
            >
              <motion.span
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.1 }}
                className='text-lg'
              >
                {language.flag}
              </motion.span>
              <div className='flex-1'>
                <div className='text-sm font-medium'>{language.nativeName}</div>
                <div className='text-xs text-muted-foreground'>
                  {language.name}
                </div>
              </div>
              <AnimatePresence>
                {currentLanguage.code === language.code && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className='h-4 w-4 text-primary' />
                  </motion.div>
                )}
              </AnimatePresence>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Hook to get current language info
 */
export const useCurrentLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage =
    SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) ||
    SUPPORTED_LANGUAGES[0];

  return {
    current: currentLanguage,
    all: SUPPORTED_LANGUAGES,
    isRTL: false, // None of our supported languages are RTL currently
  };
};
