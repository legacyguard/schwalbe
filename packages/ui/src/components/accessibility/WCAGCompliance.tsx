'use client'

import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// WCAG 2.1 AA Color contrast utilities
export const WCAG_COLORS = {
  // High contrast text combinations (4.5:1 ratio)
  text: {
    onWhite: '#000000',
    onLight: '#2d3748',
    onDark: '#ffffff',
    onPrimary: '#ffffff'
  },
  // Large text combinations (3:1 ratio)
  largeText: {
    onWhite: '#4a5568',
    onLight: '#4a5568',
    onDark: '#e2e8f0',
    onPrimary: '#ffffff'
  },
  // Interactive element colors
  interactive: {
    primary: '#2b6cb0',
    primaryHover: '#2c5282',
    focus: '#3182ce',
    error: '#e53e3e',
    success: '#38a169',
    warning: '#d69e2e'
  },
  // Background colors
  backgrounds: {
    primary: '#ffffff',
    secondary: '#f7fafc',
    tertiary: '#edf2f7',
    dark: '#1a202c'
  }
} as const

// Skip link for keyboard navigation
interface SkipLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm
        focus:z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </a>
  )
}

// Accessible heading component with proper hierarchy
interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
  className?: string
  id?: string
}

export function AccessibleHeading({
  level,
  children,
  className = '',
  id
}: AccessibleHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  const defaultStyles = {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-semibold text-gray-900',
    h3: 'text-xl font-semibold text-gray-900',
    h4: 'text-lg font-medium text-gray-900',
    h5: 'text-base font-medium text-gray-900',
    h6: 'text-sm font-medium text-gray-900'
  }

  return (
    <Tag
      id={id}
      className={`${defaultStyles[Tag]} ${className}`}
    >
      {children}
    </Tag>
  )
}

// Screen reader only content
interface ScreenReaderOnlyProps {
  children: ReactNode
  as?: keyof JSX.IntrinsicElements
}

export function ScreenReaderOnly({
  children,
  as: Component = 'span'
}: ScreenReaderOnlyProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  )
}

// Focus trap for modals and overlays
interface FocusTrapProps {
  children: ReactNode
  active?: boolean
  className?: string
}

export function FocusTrap({
  children,
  active = true,
  className = ''
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Accessible button with proper ARIA attributes
interface AccessibleButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaExpanded?: boolean
  ariaPressed?: boolean
  className?: string
}

export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaPressed,
  className = ''
}: AccessibleButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const sizeStyles = {
    small: 'px-3 py-2 text-sm min-h-[36px]',
    medium: 'px-4 py-2 text-base min-h-[44px]',
    large: 'px-6 py-3 text-lg min-h-[48px]'
  }

  const variantStyles = {
    primary: `
      bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500
      border border-transparent
    `,
    secondary: `
      bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-500
      border border-gray-300
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700 focus:ring-red-500
      border border-transparent
    `,
    ghost: `
      bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500
      border border-transparent
    `
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
      )}
      {children}
      <ScreenReaderOnly>
        {loading && ', loading'}
        {disabled && ', disabled'}
      </ScreenReaderOnly>
    </button>
  )
}

// Accessible form field with proper labeling
interface AccessibleFieldProps {
  label: string
  children: ReactNode
  error?: string
  hint?: string
  required?: boolean
  className?: string
}

export function AccessibleField({
  label,
  children,
  error,
  hint,
  required = false,
  className = ''
}: AccessibleFieldProps) {
  const fieldId = useRef(`field-${Math.random().toString(36).substr(2, 9)}`)
  const errorId = error ? `${fieldId.current}-error` : undefined
  const hintId = hint ? `${fieldId.current}-hint` : undefined

  const describedBy = [errorId, hintId].filter(Boolean).join(' ')

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={fieldId.current}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-gray-600">
          {hint}
        </p>
      )}

      <div>
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId.current,
          'aria-describedby': describedBy || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required
        })}
      </div>

      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible input component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function AccessibleInput({
  error = false,
  className = '',
  ...props
}: AccessibleInputProps) {
  return (
    <input
      className={`
        block w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-50 disabled:text-gray-500
        ${error
          ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 text-gray-900 placeholder-gray-400'
        }
        ${className}
      `}
      {...props}
    />
  )
}

// Live region for dynamic content announcements
interface LiveRegionProps {
  children: ReactNode
  level?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  className?: string
}

export function LiveRegion({
  children,
  level = 'polite',
  atomic = false,
  className = ''
}: LiveRegionProps) {
  return (
    <div
      aria-live={level}
      aria-atomic={atomic}
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  )
}

// Accessible modal dialog
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}: AccessibleModalProps) {
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={titleId.current}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <FocusTrap>
          <div className={`relative bg-white rounded-lg shadow-xl max-w-md w-full ${className}`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2
                id={titleId.current}
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </FocusTrap>
      </div>
    </div>
  )
}

// High contrast mode detection and toggle
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for system high contrast preference
      const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches
      setIsHighContrast(hasHighContrast)
    }

    checkHighContrast()

    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    mediaQuery.addEventListener('change', checkHighContrast)

    return () => mediaQuery.removeEventListener('change', checkHighContrast)
  }, [])

  return isHighContrast
}

// Reduced motion detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const checkReducedMotion = () => {
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setPrefersReducedMotion(hasReducedMotion)
    }

    checkReducedMotion()

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', checkReducedMotion)

    return () => mediaQuery.removeEventListener('change', checkReducedMotion)
  }, [])

  return prefersReducedMotion
}

export default {
  SkipLink,
  AccessibleHeading,
  ScreenReaderOnly,
  FocusTrap,
  AccessibleButton,
  AccessibleField,
  AccessibleInput,
  LiveRegion,
  AccessibleModal,
  useHighContrastMode,
  useReducedMotion,
  WCAG_COLORS
}