
import { Icon, type IconMap } from '@/components/ui/icon-library';
import { LegacyGuardLogo } from './LegacyGuardLogo';
import { NavLink } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar-hooks';

// Navigation items with translation keys
const navigationItems = [
  { key: 'dashboard', url: '/dashboard', icon: 'dashboard' },
  { key: 'vault', url: '/vault', icon: 'vault' },
  { key: 'documents', url: '/documents', icon: 'documents' },
  { key: 'intelligentOrganizer', url: '/intelligent-organizer', icon: 'brain' },
  { key: 'analytics', url: '/analytics', icon: 'chart' },
  { key: 'collaboration', url: '/collaboration', icon: 'users' },
  { key: 'family', url: '/family', icon: 'users' },
  { key: 'legacy', url: '/legacy', icon: 'legacy' },
  { key: 'timeCapsule', url: '/time-capsule', icon: 'heart' },
  { key: 'timeline', url: '/timeline', icon: 'timeline' },
  { key: 'wishes', url: '/wishes', icon: 'wishes' },
  { key: 'familyProtection', url: '/family-protection', icon: 'protection' },
  { key: 'settings', url: '/settings', icon: 'settings' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user } = useUser();
  const { t } = useTranslation('ui/sidebar');

  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-sidebar-accent text-sidebar-text font-medium'
        : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-text'
    }`;

  return (
    <Sidebar className='border-r-0 bg-sidebar-primary'>
      <div className='flex flex-col h-full'>
        {/* Logo Section */}
        <motion.div
          className='p-6 border-b border-sidebar-accent/20'
          whileHover={{ backgroundColor: 'rgba(var(--sidebar-accent), 0.05)' }}
          transition={{ duration: 0.2 }}
        >
          <div className='flex items-center gap-3'>
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <LegacyGuardLogo />
            </motion.div>
            <AnimatePresence mode='wait'>
              {!collapsed && (
                <motion.div
                  className='flex flex-col'
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className='text-sidebar-text font-semibold text-lg font-heading'>
                    {t('brand')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Navigation */}
        <SidebarContent className='px-4 py-6'>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item, index) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild className='p-0'>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <NavLink
                          to={item.url}
                          end
                          className={getNavClasses}
                          title={t(`tooltips.${item.key}`)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon
                              name={item.icon as keyof typeof IconMap}
                              className='w-5 h-5 flex-shrink-0'
                            />
                          </motion.div>
                          <AnimatePresence mode='wait'>
                            {!collapsed && (
                              <motion.span
                                className='text-sm font-medium'
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {t(`items.${item.key}`)}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </NavLink>
                      </motion.div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User Profile Section */}
        <motion.div
          className='p-4 mt-auto border-t border-sidebar-accent/20'
          whileHover={{ backgroundColor: 'rgba(var(--sidebar-accent), 0.05)' }}
          transition={{ duration: 0.2 }}
        >
          <div className='flex items-center gap-3'>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <UserButton
                afterSignOutUrl='/sign-in'
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                    userButtonTrigger: 'focus:shadow-none',
                  },
                }}
              />
            </motion.div>
            <AnimatePresence mode='wait'>
              {!collapsed && user && (
                <motion.div
                  className='flex-1'
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className='text-sm font-medium text-sidebar-text'>
                    {user.firstName || user.username || t('user.fallback')}
                  </p>
                  <p className='text-xs text-sidebar-muted'>
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Language Switcher */}
          <AnimatePresence mode='wait'>
            {!collapsed && (
              <motion.div
                className='mt-3'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LanguageSwitcher variant='sidebar' />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Sidebar>
  );
}
