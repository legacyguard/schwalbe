import React from 'react';

// Base interface for loading spinner component
export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'muted';
  text?: string;
  centered?: boolean;
  overlay?: boolean;
  children?: React.ReactNode;
}

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: LoadingSpinnerProps['size'];
  variant?: LoadingSpinnerProps['variant'];
}

export interface LoadingOverlayProps extends LoadingSpinnerProps {
  visible?: boolean;
  backdrop?: boolean;
}

// LoadingSpinner - main loading spinner component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  centered = false,
  overlay = false,
  children,
  className,
  ...props
}) => {
  const spinnerElement = React.createElement('div', {
    className: `spinner size-${size} variant-${variant}`,
    'aria-hidden': 'true'
  }, '⟳');

  const content = [
    React.createElement('div', { key: 'spinner' }, spinnerElement),
    text && React.createElement('div', {
      key: 'text',
      className: 'spinner-text'
    }, text),
    children && React.createElement('div', { key: 'children' }, children)
  ].filter(Boolean);

  const containerProps = {
    className: `loading-spinner ${centered ? 'centered' : ''} ${overlay ? 'overlay' : ''} ${className || ''}`,
    role: 'status',
    'aria-label': text || 'Loading...',
    ...props
  };

  return React.createElement('div', containerProps, content);
};

// Spinner - simple spinner without wrapper
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  ...props
}) => {
  return React.createElement('div', {
    className: `spinner size-${size} variant-${variant} ${className || ''}`,
    'aria-hidden': 'true',
    ...props
  }, '⟳');
};

// LoadingOverlay - overlay spinner for covering content
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  backdrop = true,
  text = 'Loading...',
  ...props
}) => {
  if (!visible) return null;

  return React.createElement('div', {
    className: `loading-overlay ${backdrop ? 'with-backdrop' : ''}`,
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backgroundColor: backdrop ? 'rgba(0, 0, 0, 0.5)' : 'transparent'
    }
  }, React.createElement(LoadingSpinner, {
    size: 'lg',
    text,
    centered: true,
    ...props
  }));
};

// InlineSpinner - small spinner for inline loading states
export interface InlineSpinnerProps extends SpinnerProps {
  loading?: boolean;
}

export const InlineSpinner: React.FC<InlineSpinnerProps> = ({
  loading = true,
  size = 'sm',
  ...props
}) => {
  if (!loading) return null;

  return React.createElement(Spinner, {
    size,
    ...props
  });
};

// Default export for the module
export default {
  LoadingSpinner,
  Spinner,
  LoadingOverlay,
  InlineSpinner
};