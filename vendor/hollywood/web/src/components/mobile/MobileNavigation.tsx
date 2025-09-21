/**
 * Mobile Navigation Component
 * Phase 7: Mobile & PWA Capabilities
 *
 * Bottom navigation bar optimized for mobile devices with
 * touch-friendly interface and haptic feedback support.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  BarChart3,
  Bell,
  Brain,
  FolderOpen,
  Heart,
  Home,
  Menu,
  Plus,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  badge?: number;
  icon: React.ComponentType<{ className?: string }>;
  isPrimary?: boolean;
  title: string;
  url: string;
}

interface MobileNavigationProps {
  className?: string;
  hapticFeedback?: boolean;
  notificationCount?: number;
  showLabels?: boolean;
}

// Navigation items with translation keys
const primaryNavConfig = [
  { titleKey: 'navigation.dashboard', url: '/dashboard', icon: Home },
  { titleKey: 'navigation.vault', url: '/vault', icon: FolderOpen },
  { titleKey: 'navigation.ai', url: '/intelligent-organizer', icon: Brain },
  { titleKey: 'navigation.analytics', url: '/analytics', icon: BarChart3 },
  { titleKey: 'navigation.family', url: '/family', icon: Users },
];

const secondaryNavConfig = [
  { titleKey: 'navigation.legacy', url: '/legacy', icon: Heart },
  { titleKey: 'navigation.timeCapsule', url: '/time-capsule', icon: Heart },
  { titleKey: 'navigation.familyProtection', url: '/family-protection', icon: Shield },
  { titleKey: 'navigation.settings', url: '/settings', icon: Settings },
];

export default function MobileNavigation({
  className,
  notificationCount = 0,
  showLabels = true,
  hapticFeedback = true,
}: MobileNavigationProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string>('');

  // Build translated navigation items
  const primaryNavItems: NavigationItem[] = primaryNavConfig.map(item => ({
    ...item,
    title: t(item.titleKey)
  }));

  const secondaryNavItems: NavigationItem[] = secondaryNavConfig.map(item => ({
    ...item,
    title: t(item.titleKey)
  }));

  useEffect(() => {
    const currentPath = location.pathname;
    const activeNav = [...primaryNavItems, ...secondaryNavItems].find(
      item =>
        item.url === currentPath ||
        (currentPath.startsWith(item.url) && item.url !== '/')
    );
    setActiveItem(activeNav?.url || '');
  }, [location.pathname, primaryNavItems, secondaryNavItems]);

  const triggerHaptic = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleNavClick = (url: string) => {
    triggerHaptic();
    setActiveItem(url);

    // Close menu if navigating from sheet
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const NavButton = ({
    item,
    isActive,
    showLabel = true,
  }: {
    isActive: boolean;
    item: NavigationItem;
    showLabel?: boolean;
  }) => (
    <NavLink
      to={item.url}
      onClick={() => handleNavClick(item.url)}
      className={cn(
        'relative flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 min-h-[48px] touch-manipulation',
        isActive
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
      )}
    >
      <div className='relative'>
        <item.icon
          className={cn(
            'w-5 h-5 transition-transform duration-200',
            isActive && 'scale-110'
          )}
        />

        {item.badge && item.badge > 0 && (
          <Badge
            variant='destructive'
            className='absolute -top-2 -right-2 w-4 h-4 p-0 flex items-center justify-center text-xs min-w-[16px]'
          >
            {item.badge > 99 ? '99+' : item.badge}
          </Badge>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className='absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full' />
        )}
      </div>

      {showLabel && showLabels && (
        <span
          className={cn(
            'text-xs mt-1 font-medium transition-colors duration-200',
            isActive ? 'text-blue-600' : 'text-gray-500'
          )}
        >
          {item.title}
        </span>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb md:hidden',
          'backdrop-blur-md bg-white/95 supports-[backdrop-filter]:bg-white/80',
          className
        )}
      >
        <div className='flex items-center justify-around px-2 py-1'>
          {/* Primary Navigation Items */}
          {primaryNavItems.slice(0, 4).map(item => (
            <NavButton
              key={item.url}
              item={item}
              isActive={activeItem === item.url}
            />
          ))}

          {/* More Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='flex flex-col items-center justify-center px-2 py-2 rounded-lg min-h-[48px] relative'
                onClick={triggerHaptic}
              >
                <Menu className='w-5 h-5' />
                {showLabels && (
                  <span className='text-xs mt-1 font-medium text-gray-500'>
                    {t('navigation.more')}
                  </span>
                )}

                {notificationCount > 0 && (
                  <Badge
                    variant='destructive'
                    className='absolute top-1 right-1 w-4 h-4 p-0 flex items-center justify-center text-xs'
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side='bottom' className='rounded-t-xl'>
              <SheetHeader className='text-left'>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Access all LegacyGuard features
                </SheetDescription>
              </SheetHeader>

              <div className='mt-6 space-y-4'>
                {/* Quick Actions */}
                <div>
                  <h3 className='text-sm font-medium text-gray-900 mb-3'>
                    Quick Actions
                  </h3>
                  <div className='grid grid-cols-2 gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='justify-start gap-2 h-12'
                      onClick={() => {
                        triggerHaptic();
                        handleNavClick('/vault?action=upload');
                      }}
                      asChild
                    >
                      <NavLink to='/vault?action=upload'>
                        <Plus className='w-4 h-4' />
                        Upload Document
                      </NavLink>
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      className='justify-start gap-2 h-12 relative'
                    >
                      <Bell className='w-4 h-4' />
                      Notifications
                      {notificationCount > 0 && (
                        <Badge variant='destructive' className='ml-auto'>
                          {notificationCount}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>

                {/* All Navigation Items */}
                <div>
                  <h3 className='text-sm font-medium text-gray-900 mb-3'>
                    All Features
                  </h3>
                  <div className='grid grid-cols-2 gap-2'>
                    {[...primaryNavItems, ...secondaryNavItems].map(item => (
                      <NavButton
                        key={item.url}
                        item={item}
                        isActive={activeItem === item.url}
                        showLabel={true}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Safe area padding for devices with home indicator */}
        <div className='h-safe-area-inset-bottom' />
      </div>

      {/* Floating Action Button (Optional) */}
      <Button
        size='lg'
        className={cn(
          'fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg md:hidden',
          'bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform duration-200'
        )}
        onClick={() => {
          triggerHaptic();
          handleNavClick('/vault?action=upload');
        }}
        asChild
      >
        <NavLink to='/vault?action=upload'>
          <Plus className='w-6 h-6' />
        </NavLink>
      </Button>

      {/* Bottom safe area spacer for content */}
      <div className='h-16 md:hidden' aria-hidden='true' />
    </>
  );
}

/**
 * Hook to check if mobile navigation should be displayed
 */
export function useMobileNavigation() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile };
}

/**
 * Mobile Navigation Provider for global state management
 */
interface MobileNavContextType {
  hapticFeedback: boolean;
  notificationCount: number;
  setHapticFeedback: (enabled: boolean) => void;
  setNotificationCount: (count: number) => void;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(
  undefined
);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const value = {
    notificationCount,
    setNotificationCount,
    hapticFeedback,
    setHapticFeedback,
  };

  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNavContext() {
  const context = useContext(MobileNavContext);
  if (context === undefined) {
    throw new Error(
      'useMobileNavContext must be used within a MobileNavProvider'
    );
  }
  return context;
}
