'use client'

import React, { ReactNode, useEffect, useRef, useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Keyboard navigation context
interface KeyboardNavContextType {
  focusedElement: string | null
  setFocusedElement: (id: string | null) => void
  isKeyboardUser: boolean
  setIsKeyboardUser: (value: boolean) => void
}

const KeyboardNavContext = createContext<KeyboardNavContextType | null>(null)

export function useKeyboardNav() {
  const context = useContext(KeyboardNavContext)
  if (!context) {
    throw new Error('useKeyboardNav must be used within a KeyboardNavProvider')
  }
  return context
}

// Keyboard navigation provider
interface KeyboardNavProviderProps {
  children: ReactNode
}

export function KeyboardNavProvider({ children }: KeyboardNavProviderProps) {
  const [focusedElement, setFocusedElement] = useState<string | null>(null)
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  // Detect keyboard usage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ESC key to close modals/overlays
      if (e.key === 'Escape') {
        // Dispatch custom escape event
        document.dispatchEvent(new CustomEvent('keyboardEscape'))
      }

      // Alt + H for help
      if (e.altKey && e.key === 'h') {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('keyboardHelp'))
      }

      // Alt + S for Sofia
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('keyboardSofia'))
      }

      // Alt + M for main content
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        const mainContent = document.getElementById('main-content')
        mainContent?.focus()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  return (
    <KeyboardNavContext.Provider
      value={{
        focusedElement,
        setFocusedElement,
        isKeyboardUser,
        setIsKeyboardUser
      }}
    >
      {children}
    </KeyboardNavContext.Provider>
  )
}

// Keyboard shortcut display
interface KeyboardShortcutProps {
  keys: string[]
  description: string
  className?: string
}

export function KeyboardShortcut({
  keys,
  description,
  className = ''
}: KeyboardShortcutProps) {
  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      <span className="text-sm text-gray-700">{description}</span>
      <div className="flex items-center space-x-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-xs text-gray-400 mx-1">+</span>
            )}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// Keyboard shortcuts help modal
interface KeyboardHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardHelpModal({
  isOpen,
  onClose
}: KeyboardHelpModalProps) {
  const shortcuts = [
    { keys: ['Tab'], description: 'Navigate between elements' },
    { keys: ['Shift', 'Tab'], description: 'Navigate backwards' },
    { keys: ['Enter'], description: 'Activate buttons and links' },
    { keys: ['Space'], description: 'Activate buttons and checkboxes' },
    { keys: ['Escape'], description: 'Close modals and dialogs' },
    { keys: ['Arrow Keys'], description: 'Navigate within components' },
    { keys: ['Alt', 'H'], description: 'Show this help' },
    { keys: ['Alt', 'S'], description: 'Open Sofia assistant' },
    { keys: ['Alt', 'M'], description: 'Jump to main content' },
    { keys: ['?'], description: 'Show contextual shortcuts' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              role="dialog"
              aria-labelledby="keyboard-help-title"
              aria-modal="true"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2
                  id="keyboard-help-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                  aria-label="Close help"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 max-h-96 overflow-y-auto">
                <div className="space-y-1">
                  {shortcuts.map((shortcut, index) => (
                    <KeyboardShortcut
                      key={index}
                      keys={shortcut.keys}
                      description={shortcut.description}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Roving tabindex for arrow key navigation
interface RovingTabIndexProps {
  children: ReactNode
  orientation?: 'horizontal' | 'vertical' | 'both'
  wrap?: boolean
  className?: string
}

export function RovingTabIndex({
  children,
  orientation = 'horizontal',
  wrap = true,
  className = ''
}: RovingTabIndexProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusableElements = Array.from(
      container.querySelectorAll('[data-roving-item]')
    ) as HTMLElement[]

    // Set initial tabindex
    focusableElements.forEach((element, index) => {
      element.tabIndex = index === focusedIndex ? 0 : -1
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusableElements.length) return

      let newIndex = focusedIndex

      if (orientation === 'horizontal' || orientation === 'both') {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          newIndex = focusedIndex + 1
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          newIndex = focusedIndex - 1
        }
      }

      if (orientation === 'vertical' || orientation === 'both') {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          newIndex = focusedIndex + 1
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          newIndex = focusedIndex - 1
        }
      }

      // Handle wrapping
      if (wrap) {
        if (newIndex >= focusableElements.length) {
          newIndex = 0
        } else if (newIndex < 0) {
          newIndex = focusableElements.length - 1
        }
      } else {
        newIndex = Math.max(0, Math.min(newIndex, focusableElements.length - 1))
      }

      if (newIndex !== focusedIndex) {
        setFocusedIndex(newIndex)

        // Update tabindex
        focusableElements.forEach((element, index) => {
          element.tabIndex = index === newIndex ? 0 : -1
        })

        // Focus the new element
        focusableElements[newIndex]?.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex, orientation, wrap])

  return (
    <div ref={containerRef} className={className} role="group">
      {children}
    </div>
  )
}

// Focus visible indicator
interface FocusVisibleProps {
  children: ReactNode
  className?: string
  offset?: number
}

export function FocusVisible({
  children,
  className = '',
  offset = 2
}: FocusVisibleProps) {
  const { isKeyboardUser } = useKeyboardNav()
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div
      className={`relative ${className}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}

      {/* Focus indicator */}
      <AnimatePresence>
        {isFocused && isKeyboardUser && (
          <motion.div
            className="absolute inset-0 rounded-md border-2 border-blue-500 pointer-events-none"
            style={{
              margin: `-${offset}px`,
              borderRadius: '8px'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Custom dropdown with keyboard navigation
interface KeyboardDropdownProps {
  trigger: ReactNode
  items: Array<{
    id: string
    label: string
    onClick: () => void
    disabled?: boolean
  }>
  className?: string
}

export function KeyboardDropdown({
  trigger,
  items,
  className = ''
}: KeyboardDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const items = dropdownRef.current?.querySelectorAll('[role="menuitem"]')
      ;(items?.[focusedIndex] as HTMLElement)?.focus()
    }
  }, [isOpen, focusedIndex])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        triggerRef.current?.focus()
        break

      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev =>
          prev < items.length - 1 ? prev + 1 : 0
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : items.length - 1
        )
        break

      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break

      case 'End':
        e.preventDefault()
        setFocusedIndex(items.length - 1)
        break
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, items.length])

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setIsOpen(true)
            setFocusedIndex(0)
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
      >
        {trigger}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
            role="menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {items.map((item, index) => (
              <button
                key={item.id}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick()
                  setIsOpen(false)
                  triggerRef.current?.focus()
                }}
                className={`
                  w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${index === 0 ? 'rounded-t-md' : ''}
                  ${index === items.length - 1 ? 'rounded-b-md' : ''}
                `}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default {
  KeyboardNavProvider,
  useKeyboardNav,
  KeyboardShortcut,
  KeyboardHelpModal,
  RovingTabIndex,
  FocusVisible,
  KeyboardDropdown
}