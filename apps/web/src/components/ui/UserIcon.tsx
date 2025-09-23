import React, { useState } from 'react';
import { User, ChevronDown, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface UserIconProps {
  isAuthenticated?: boolean;
  userName?: string;
}

export function UserIcon({ isAuthenticated = false, userName }: UserIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleSignOut = () => {
    // Implement sign out logic here
    window.location.href = '/auth/signout';
  };

  if (!isAuthenticated) {
    // Not authenticated - simple click goes to sign in
    return (
      <button
        onClick={() => navigate('/auth/signin')}
        className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors"
      >
        <User className="h-4 w-4" />
      </button>
    );
  }

  // Authenticated - dropdown with options
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors"
      >
        <User className="h-4 w-4" />
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
            >
              <div className="py-2">
                {userName && (
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-sm text-slate-400">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                  </div>
                )}

                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>

                <div className="border-t border-slate-700 mt-2 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}