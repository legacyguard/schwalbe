'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronLeft, MoreVertical } from 'lucide-react'
import { useAdaptiveAnimation } from '../animations/InteractiveAnimations'

interface MobileFirstLayoutProps {
  children: ReactNode
  header?: ReactNode
  navigation?: ReactNode
  footer?: ReactNode
  showBackButton?: boolean
  onBackClick?: () => void
  title?: string
  actions?: Array<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    onClick: () => void
  }>
  className?: string
}

interface BreakpointConfig {
  mobile: string
  tablet: string
  desktop: string
  wide: string
}

// Responsive breakpoint system
const breakpoints: BreakpointConfig = {
  mobile: '0px',
  tablet: '640px',
  desktop: '1024px',
  wide: '1280px'
}

export function MobileFirstLayout({
  children,
  header,
  navigation,
  footer,
  showBackButton = false,
  onBackClick,
  title,
  actions = [],
  className = ''
}: MobileFirstLayoutProps) {
  const { shouldReduceMotion } = useAdaptiveAnimation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [screenSize, setScreenSize] = useState<keyof BreakpointConfig>('mobile')

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth

      if (width >= 1280) {
        setScreenSize('wide')
      } else if (width >= 1024) {
        setScreenSize('desktop')
      } else if (width >= 640) {
        setScreenSize('tablet')
      } else {
        setScreenSize('mobile')
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Mobile menu variants
  const mobileMenuVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    }
  }

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  }

  const isMobile = screenSize === 'mobile'
  const isTablet = screenSize === 'tablet'

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile Header */}
      {isMobile && (
        <motion.header
          className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            {/* Left side - Back button or Menu */}
            <div className="flex items-center space-x-3">
              {showBackButton ? (
                <motion.button
                  onClick={onBackClick}
                  className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
              ) : navigation ? (
                <motion.button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  aria-label="Otvoriť menu"
                >
                  <Menu className="w-6 h-6" />
                </motion.button>
              ) : null}

              {title && (
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h1>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              {actions.slice(0, 2).map((action, index) => (
                <motion.button
                  key={index}
                  onClick={action.onClick}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  aria-label={action.label}
                >
                  <action.icon className="w-5 h-5" />
                </motion.button>
              ))}

              {actions.length > 2 && (
                <motion.button
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  aria-label="Viac možností"
                >
                  <MoreVertical className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.header>
      )}

      {/* Desktop/Tablet Header */}
      {!isMobile && header && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {header}
        </motion.div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* Desktop/Tablet Sidebar Navigation */}
        {!isMobile && navigation && (
          <motion.aside
            className={`${
              isTablet ? 'w-64' : 'w-72'
            } bg-white border-r border-gray-200 overflow-y-auto`}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {navigation}
          </motion.aside>
        )}

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMobile && isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Sliding Menu */}
              <motion.div
                className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 overflow-y-auto"
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    aria-label="Zavrieť menu"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Menu Content */}
                <div className="p-4">
                  {navigation}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            className={`${
              isMobile
                ? 'p-4'
                : isTablet
                  ? 'p-6'
                  : 'p-8'
            } max-w-none`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: isMobile ? 0.1 : 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <motion.footer
          className={`bg-white border-t border-gray-200 ${
            isMobile ? 'px-4 py-3' : 'px-6 py-4'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {footer}
        </motion.footer>
      )}
    </div>
  )
}

// Touch-friendly components
interface TouchFriendlyButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
}

export function TouchFriendlyButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}: TouchFriendlyButtonProps) {
  const { shouldReduceMotion } = useAdaptiveAnimation()

  // Touch-friendly minimum sizes (44px iOS, 48px Android)
  const sizeClasses = {
    small: 'min-h-[44px] px-4 py-2 text-sm',
    medium: 'min-h-[48px] px-6 py-3 text-base',
    large: 'min-h-[52px] px-8 py-4 text-lg'
  }

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
  }

  return (
    <motion.button
      className={`
        ${sizeClasses[size]} ${variantClasses[variant]}
        rounded-lg font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileTap={shouldReduceMotion || disabled ? {} : { scale: 0.98 }}
      // Touch-friendly tap target
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </motion.button>
  )
}

// Touch-friendly card component
interface TouchFriendlyCardProps {
  children: ReactNode
  onTap?: () => void
  className?: string
  padding?: 'small' | 'medium' | 'large'
}

export function TouchFriendlyCard({
  children,
  onTap,
  className = '',
  padding = 'medium'
}: TouchFriendlyCardProps) {
  const { shouldReduceMotion } = useAdaptiveAnimation()

  const paddingClasses = {
    small: 'p-3',
    medium: 'p-4 sm:p-6',
    large: 'p-6 sm:p-8'
  }

  return (
    <motion.div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        ${paddingClasses[padding]}
        ${onTap ? 'cursor-pointer hover:shadow-md active:shadow-lg' : ''}
        ${className}
      `}
      onClick={onTap}
      whileTap={shouldReduceMotion || !onTap ? {} : { scale: 0.98 }}
      // Touch-friendly tap target
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </motion.div>
  )
}

// Responsive grid system
interface ResponsiveGridProps {
  children: ReactNode
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
    wide?: number
  }
  gap?: 'small' | 'medium' | 'large'
  className?: string
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  gap = 'medium',
  className = ''
}: ResponsiveGridProps) {
  const gapClasses = {
    small: 'gap-3',
    medium: 'gap-4 sm:gap-6',
    large: 'gap-6 sm:gap-8'
  }

  const gridClasses = `
    grid
    grid-cols-${columns.mobile || 1}
    sm:grid-cols-${columns.tablet || 2}
    lg:grid-cols-${columns.desktop || 3}
    xl:grid-cols-${columns.wide || 4}
    ${gapClasses[gap]}
    ${className}
  `

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

export default {
  MobileFirstLayout,
  TouchFriendlyButton,
  TouchFriendlyCard,
  ResponsiveGrid
}