'use client'

import React, { ReactNode, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Screen reader announcements
interface AnnouncementProps {
  message: string
  priority?: 'polite' | 'assertive'
  delay?: number
}

export function ScreenReaderAnnouncement({
  message,
  priority = 'polite',
  delay = 0
}: AnnouncementProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Clear announcement after a short delay to avoid cluttering
      const clearTimer = setTimeout(() => setIsVisible(false), 100)
      return () => clearTimeout(clearTimer)
    }, delay)

    return () => clearTimeout(timer)
  }, [message, delay])

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {isVisible && message}
    </div>
  )
}

// Enhanced Sofia component with screen reader support
interface AccessibleSofiaProps {
  isVisible: boolean
  emotion?: 'happy' | 'encouraging' | 'celebrating'
  message?: string
  onInteraction?: () => void
  className?: string
}

export function AccessibleSofia({
  isVisible,
  emotion = 'happy',
  message,
  onInteraction,
  className = ''
}: AccessibleSofiaProps) {
  const [currentAnnouncement, setCurrentAnnouncement] = useState('')

  const emotionDescriptions = {
    happy: 'Sofia is happy and ready to help',
    encouraging: 'Sofia is providing encouragement',
    celebrating: 'Sofia is celebrating your achievement'
  }

  useEffect(() => {
    if (isVisible && message) {
      setCurrentAnnouncement(`Sofia says: ${message}`)
    } else if (isVisible) {
      setCurrentAnnouncement(emotionDescriptions[emotion])
    }
  }, [isVisible, message, emotion])

  return (
    <>
      <ScreenReaderAnnouncement message={currentAnnouncement} priority="polite" />

      <motion.div
        className={`relative ${className}`}
        role="img"
        aria-label={emotionDescriptions[emotion]}
        tabIndex={onInteraction ? 0 : -1}
        onClick={onInteraction}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onInteraction) {
            e.preventDefault()
            onInteraction()
          }
        }}
        style={{ cursor: onInteraction ? 'pointer' : 'default' }}
      >
        {/* Sofia visual representation would go here */}
        <div
          className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          ✨
        </div>

        {/* Screen reader only description */}
        <span className="sr-only">
          Sofia, your personal guide. Currently {emotion}.
          {message && ` Message: ${message}`}
          {onInteraction && ' Press Enter or Space to interact.'}
        </span>
      </motion.div>
    </>
  )
}

// Progress announcements for screen readers
interface ProgressAnnouncementProps {
  current: number
  total: number
  description: string
  milestone?: string
}

export function ProgressAnnouncement({
  current,
  total,
  description,
  milestone
}: ProgressAnnouncementProps) {
  const percentage = Math.round((current / total) * 100)
  const [lastAnnounced, setLastAnnounced] = useState(0)

  useEffect(() => {
    // Only announce progress at 25% intervals to avoid spam
    const shouldAnnounce = percentage >= lastAnnounced + 25 || percentage === 100

    if (shouldAnnounce) {
      setLastAnnounced(percentage)
    }
  }, [percentage, lastAnnounced])

  const announcement = milestone
    ? `Milestone achieved: ${milestone}. ${description} - ${percentage}% complete`
    : `${description} - ${percentage}% complete, ${current} of ${total} items`

  return (
    <ScreenReaderAnnouncement
      message={lastAnnounced === percentage ? announcement : ''}
      priority="polite"
    />
  )
}

// Document upload progress with screen reader support
interface AccessibleUploadProgressProps {
  files: Array<{
    name: string
    progress: number
    status: 'uploading' | 'completed' | 'error'
    error?: string
  }>
  className?: string
}

export function AccessibleUploadProgress({
  files,
  className = ''
}: AccessibleUploadProgressProps) {
  const [announcements, setAnnouncements] = useState<string[]>([])

  useEffect(() => {
    const newAnnouncements: string[] = []

    files.forEach(file => {
      if (file.status === 'completed') {
        newAnnouncements.push(`File ${file.name} uploaded successfully`)
      } else if (file.status === 'error') {
        newAnnouncements.push(`Error uploading ${file.name}: ${file.error || 'Upload failed'}`)
      }
    })

    if (newAnnouncements.length > 0) {
      setAnnouncements(newAnnouncements)
      // Clear after announcement
      setTimeout(() => setAnnouncements([]), 100)
    }
  }, [files])

  return (
    <div className={className}>
      {/* Visual progress indicators */}
      <div role="group" aria-label="File upload progress">
        {files.map((file, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {file.name}
              </span>
              <span className="text-sm text-gray-500">
                {file.progress}%
              </span>
            </div>

            <div
              className="w-full bg-gray-200 rounded-full h-2"
              role="progressbar"
              aria-valuenow={file.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Upload progress for ${file.name}`}
            >
              <motion.div
                className={`h-2 rounded-full ${
                  file.status === 'error' ? 'bg-red-500' :
                  file.status === 'completed' ? 'bg-green-500' :
                  'bg-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${file.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {file.status === 'error' && file.error && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {file.error}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Screen reader announcements */}
      {announcements.map((announcement, index) => (
        <ScreenReaderAnnouncement
          key={index}
          message={announcement}
          priority="assertive"
        />
      ))}
    </div>
  )
}

// Navigation with breadcrumbs and screen reader support
interface AccessibleBreadcrumbsProps {
  items: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  className?: string
}

export function AccessibleBreadcrumbs({
  items,
  className = ''
}: AccessibleBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={className}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}

            {item.current ? (
              <span
                className="text-gray-500 font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.href ? (
              <a
                href={item.href}
                className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-1"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-gray-700 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Data table with screen reader support
interface AccessibleTableProps {
  caption: string
  headers: string[]
  rows: Array<Array<ReactNode>>
  className?: string
}

export function AccessibleTable({
  caption,
  headers,
  rows,
  className = ''
}: AccessibleTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <caption className="sr-only">
          {caption}
        </caption>

        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Status indicator with screen reader support
interface AccessibleStatusProps {
  status: 'success' | 'warning' | 'error' | 'info'
  message: string
  icon?: ReactNode
  className?: string
}

export function AccessibleStatus({
  status,
  message,
  icon,
  className = ''
}: AccessibleStatusProps) {
  const statusConfig = {
    success: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      srLabel: 'Success'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      srLabel: 'Warning'
    },
    error: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      srLabel: 'Error'
    },
    info: {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      srLabel: 'Information'
    }
  }

  const config = statusConfig[status]

  return (
    <div
      className={`
        p-4 rounded-md border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${className}
      `}
      role={status === 'error' ? 'alert' : 'status'}
      aria-live={status === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start">
        {icon && (
          <div className="flex-shrink-0 mr-3" aria-hidden="true">
            {icon}
          </div>
        )}
        <div>
          <span className="sr-only">{config.srLabel}: </span>
          {message}
        </div>
      </div>
    </div>
  )
}

// Form validation messages with screen reader support
interface AccessibleFormErrorsProps {
  errors: Record<string, string>
  className?: string
}

export function AccessibleFormErrors({
  errors,
  className = ''
}: AccessibleFormErrorsProps) {
  const errorCount = Object.keys(errors).length

  if (errorCount === 0) return null

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <h3 className="text-sm font-medium text-red-800 mb-2">
        {errorCount === 1 ? 'There is 1 error:' : `There are ${errorCount} errors:`}
      </h3>
      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field}>
            <span className="sr-only">{field}: </span>
            {error}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default {
  ScreenReaderAnnouncement,
  AccessibleSofia,
  ProgressAnnouncement,
  AccessibleUploadProgress,
  AccessibleBreadcrumbs,
  AccessibleTable,
  AccessibleStatus,
  AccessibleFormErrors
}