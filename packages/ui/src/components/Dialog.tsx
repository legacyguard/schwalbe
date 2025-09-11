import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Typography } from './Typography';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export interface DialogContentProps {
  className?: string;
  children: ReactNode;
}

export interface DialogHeaderProps {
  children: ReactNode;
}

export interface DialogTitleProps {
  className?: string;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => onOpenChange(false)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DialogContent({ className = '', children }: DialogContentProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <div className="p-6 pb-4 border-b border-gray-200">
      {children}
    </div>
  );
}

export function DialogTitle({ className = '', children }: DialogTitleProps) {
  return (
    <Typography variant="h3" className={`font-semibold ${className}`}>
      {children}
    </Typography>
  );
}