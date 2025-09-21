
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useKeyboardShortcuts = (onOpenSearch?: () => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const isTyping =
        ['input', 'textarea', 'select'].includes(
          (event.target as HTMLElement).tagName.toLowerCase()
        ) || (event.target as HTMLElement).isContentEditable;

      if (isTyping) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      // Global shortcuts with Cmd/Ctrl
      if (modKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            navigate('/');
            toast.success('Navigated to Dashboard');
            break;
          case '2':
            event.preventDefault();
            navigate('/vault');
            toast.success('Navigated to Vault');
            break;
          case '3':
            event.preventDefault();
            navigate('/guardians');
            toast.success('Navigated to Guardians');
            break;
          case '4':
            event.preventDefault();
            navigate('/legacy');
            toast.success('Navigated to Legacy');
            break;
          case 'k':
          case 'K':
            event.preventDefault();
            if (onOpenSearch) {
              onOpenSearch();
            } else {
              showShortcutsHelp();
            }
            break;
        }
      }

      // Single key shortcuts (when not typing)
      if (!modKey && !event.shiftKey && !event.altKey) {
        switch (event.key) {
          case '?':
            event.preventDefault();
            showShortcutsHelp();
            break;
        }
      }
    };

    const showShortcutsHelp = () => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKeyName = isMac ? 'Cmd' : 'Ctrl';

      toast.info(
        `Keyboard Shortcuts:\n${modKeyName}+1: Dashboard\n${modKeyName}+2: Vault\n${modKeyName}+3: Guardians\n${modKeyName}+4: Legacy\n${modKeyName}+K or ?: Help`,
        { duration: 5000 }
      );
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, onOpenSearch]);
};
