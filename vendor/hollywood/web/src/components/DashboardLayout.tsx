
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { QuickSearch } from '@/components/QuickSearch';
import { executeSofiaAction } from '@/lib/sofia-action-router';
import type { SofiaAction } from '@/lib/sofia-search-dictionary';
import { useDocumentFilter } from '@/contexts/DocumentFilterContext';
import SofiaChatV2 from '@/components/sofia/SofiaChatV2';
import SofiaFloatingButton from '@/components/sofia/SofiaFloatingButton';
import { useTranslation } from 'react-i18next';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSofiaOpen, setIsSofiaOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sofiaPendingAction, setSofiaPendingAction] = useState<null | {
    sofiaResponse: string;
    userMessage: string;
  }>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { setFilter: setDocumentFilter } = useDocumentFilter();
  const { t } = useTranslation('ui/dashboard-layout');

  // Enable keyboard shortcuts with search callback
  useKeyboardShortcuts(() => setIsSearchOpen(true));

  const getCurrentPage = () => {
    const pathname = location.pathname;
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/vault')) return 'vault';
    if (pathname.startsWith('/guardians')) return 'guardians';
    if (pathname.startsWith('/legacy')) return 'legacy';
    if (pathname.startsWith('/onboarding')) return 'onboarding';
    return 'dashboard';
  };

  const toggleSofia = () => {
    setIsSofiaOpen(!isSofiaOpen);
  };

  const handleSofiaAction = async (
    action: SofiaAction,
    _searchQuery?: string
  ) => {
    try {
      // Generate contextual messages
      const userMessage = action.text;
      let sofiaResponse = '';

      // Execute the action and get the response
      await executeSofiaAction(action, {
        navigate,
        ...(userId ? { userId } : {}),
        setDocumentFilter,
        onSofiaMessage: (_user, sofia) => {
          sofiaResponse = sofia;
        },
      });

      // Set pending action for Sofia to display
      if (sofiaResponse) {
        setSofiaPendingAction({
          userMessage,
          sofiaResponse,
        });
      }
    } catch (error) {
      console.error('Error executing Sofia action:', error);
      setSofiaPendingAction({
        userMessage: action.text,
        sofiaResponse: t('sofia.errorFallback'),
      });
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className='min-h-screen flex w-full bg-background'>
        <AppSidebar />
        <div className='flex-1 flex flex-col min-w-0'>
          {/* Mobile Header with Sidebar Trigger */}
          <header className='lg:hidden h-16 flex items-center px-4 border-b border-card-border bg-card'>
            <SidebarTrigger className='mr-4' />
            <h1 className='font-semibold text-card-foreground'>
              {t('header.brand')}
            </h1>
          </header>

          {/* Main Content */}
          <main className='flex-1 bg-background'>{children}</main>
        </div>

        {/* Sofia AI Assistant */}
        <SofiaFloatingButton
          onToggleChat={toggleSofia}
          isChatOpen={isSofiaOpen}
        />
        <SofiaChatV2
          isOpen={isSofiaOpen}
          onClose={() => {
            setIsSofiaOpen(false);
            // Clear pending action when Sofia is closed
            setSofiaPendingAction(null);
          }}
          variant='floating'
          currentPage={getCurrentPage()}
          pendingAction={sofiaPendingAction}
        />

        {/* Quick Search Modal */}
        <QuickSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSofiaAction={async action => {
            // Sofia action triggered from search
            setIsSearchOpen(false);
            await handleSofiaAction(action);
            setIsSofiaOpen(true);
          }}
        />
      </div>
    </SidebarProvider>
  );
}
