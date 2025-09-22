'use client'

import React, { ReactNode, useRef, useState, useEffect } from 'react'
import { motion, PanInfo, useDragControls } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down'
  velocity: number
  distance: number
}

interface SwipeGestureProps {
  children: ReactNode
  onSwipe?: (direction: SwipeDirection) => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  swipeThreshold?: number
  velocityThreshold?: number
  disabled?: boolean
  className?: string
}

export function SwipeGesture({
  children,
  onSwipe,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  velocityThreshold = 0.3,
  disabled = false,
  className = ''
}: SwipeGestureProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return

    const { offset, velocity } = info
    const { x, y } = offset

    // Determine primary direction
    const absX = Math.abs(x)
    const absY = Math.abs(y)

    // Check if gesture meets threshold requirements
    const distanceThreshold = Math.max(absX, absY) >= swipeThreshold
    const velocityCheck = Math.max(Math.abs(velocity.x), Math.abs(velocity.y)) >= velocityThreshold

    if (!distanceThreshold && !velocityCheck) {
      setIsDragging(false)
      return
    }

    let direction: 'left' | 'right' | 'up' | 'down'
    let distance: number
    let vel: number

    if (absX > absY) {
      // Horizontal swipe
      direction = x > 0 ? 'right' : 'left'
      distance = absX
      vel = Math.abs(velocity.x)
    } else {
      // Vertical swipe
      direction = y > 0 ? 'down' : 'up'
      distance = absY
      vel = Math.abs(velocity.y)
    }

    // Call specific direction handlers
    switch (direction) {
      case 'left':
        onSwipeLeft?.()
        break
      case 'right':
        onSwipeRight?.()
        break
      case 'up':
        onSwipeUp?.()
        break
      case 'down':
        onSwipeDown?.()
        break
    }

    // Call general swipe handler
    onSwipe?.({ direction, velocity: vel, distance })

    setIsDragging(false)
  }

  return (
    <motion.div
      className={className}
      drag={disabled ? false : true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{ touchAction: disabled ? 'auto' : 'pan-x pan-y' }}
    >
      {children}
    </motion.div>
  )
}

// Swipeable tabs component
interface SwipeableTabsProps {
  tabs: Array<{
    id: string
    label: string
    content: ReactNode
    icon?: React.ComponentType<{ className?: string }>
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function SwipeableTabs({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: SwipeableTabsProps) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
  const [dragX, setDragX] = useState(0)

  const handleSwipe = (direction: SwipeDirection) => {
    if (direction.direction === 'left' && activeIndex < tabs.length - 1) {
      onTabChange(tabs[activeIndex + 1].id)
    } else if (direction.direction === 'right' && activeIndex > 0) {
      onTabChange(tabs[activeIndex - 1].id)
    }
  }

  return (
    <div className={`${className}`}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {tabs.map((tab, index) => {
          const IconComponent = tab.icon
          const isActive = tab.id === activeTab

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-2 px-4 py-3 min-w-0 flex-shrink-0
                text-sm font-medium transition-colors relative
                ${isActive
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {IconComponent && <IconComponent className="w-4 h-4" />}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content with Swipe */}
      <div className="relative overflow-hidden">
        <SwipeGesture
          onSwipe={handleSwipe}
          swipeThreshold={80}
          velocityThreshold={0.5}
        >
          <motion.div
            className="flex"
            animate={{ x: `${-activeIndex * 100}%` }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
          >
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className="w-full flex-shrink-0 p-4"
              >
                {tab.content}
              </div>
            ))}
          </motion.div>
        </SwipeGesture>

        {/* Navigation indicators */}
        <div className="flex justify-center space-x-2 mt-4">
          {tabs.map((_, index) => (
            <button
              key={index}
              onClick={() => onTabChange(tabs[index].id)}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${index === activeIndex ? 'bg-blue-600' : 'bg-gray-300'}
              `}
              aria-label={`Prejsť na tab ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Swipeable carousel
interface SwipeableCarouselProps {
  items: ReactNode[]
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  showIndicators?: boolean
  showArrows?: boolean
}

export function SwipeableCarousel({
  items,
  className = '',
  autoPlay = false,
  autoPlayInterval = 5000,
  showIndicators = true,
  showArrows = false
}: SwipeableCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const autoPlayRef = useRef<NodeJS.Timeout>()

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % items.length)
      }, autoPlayInterval)

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current)
        }
      }
    }
  }, [autoPlay, autoPlayInterval, items.length])

  const handleSwipe = (direction: SwipeDirection) => {
    // Pause auto-play when user interacts
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }

    if (direction.direction === 'left') {
      setCurrentIndex(prev => (prev + 1) % items.length)
    } else if (direction.direction === 'right') {
      setCurrentIndex(prev => (prev - 1 + items.length) % items.length)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    // Pause auto-play when user manually navigates
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
  }

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % items.length)
  }

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Content */}
      <div className="relative overflow-hidden rounded-lg">
        <SwipeGesture
          onSwipe={handleSwipe}
          swipeThreshold={60}
          velocityThreshold={0.4}
        >
          <motion.div
            className="flex"
            animate={{ x: `${-currentIndex * 100}%` }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0"
              >
                {item}
              </div>
            ))}
          </motion.div>
        </SwipeGesture>
      </div>

      {/* Navigation Arrows */}
      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Predchádzajúci"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Nasledujúci"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && items.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${index === currentIndex
                  ? 'bg-blue-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
                }
              `}
              aria-label={`Prejsť na snímku ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Swipe-to-dismiss component
interface SwipeToDismissProps {
  children: ReactNode
  onDismiss: () => void
  threshold?: number
  className?: string
}

export function SwipeToDismiss({
  children,
  onDismiss,
  threshold = 150,
  className = ''
}: SwipeToDismissProps) {
  const [isDismissing, setIsDismissing] = useState(false)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    const { x } = offset

    const shouldDismiss = Math.abs(x) > threshold || Math.abs(velocity.x) > 0.5

    if (shouldDismiss) {
      setIsDismissing(true)
      // Wait for animation to complete before calling onDismiss
      setTimeout(onDismiss, 200)
    }
  }

  return (
    <motion.div
      className={className}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      animate={isDismissing ? { x: '100%', opacity: 0 } : { x: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{ touchAction: 'pan-x' }}
    >
      {children}
    </motion.div>
  )
}

// Pull-to-refresh component
interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  refreshThreshold?: number
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  refreshThreshold = 80,
  className = ''
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isAtTop || isRefreshing) return

    const { offset } = info
    const distance = Math.max(0, offset.y)
    setPullDistance(Math.min(distance, refreshThreshold * 1.5))
  }

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isAtTop || isRefreshing) return

    const { offset } = info
    const shouldRefresh = offset.y >= refreshThreshold

    if (shouldRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  // Check if scrolled to top
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setIsAtTop(container.scrollTop === 0)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const refreshProgress = Math.min(pullDistance / refreshThreshold, 1)

  return (
    <div className={className}>
      {/* Pull indicator */}
      <motion.div
        className="flex justify-center py-2"
        animate={{
          height: pullDistance > 0 || isRefreshing ? 'auto' : 0,
          opacity: pullDistance > 0 || isRefreshing ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="flex items-center space-x-2 text-gray-600"
          animate={{ rotate: isRefreshing ? 360 : refreshProgress * 180 }}
          transition={{ duration: isRefreshing ? 1 : 0.2, repeat: isRefreshing ? Infinity : 0 }}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-sm">
            {isRefreshing ? 'Obnovujem...' : refreshProgress >= 1 ? 'Uvoľniť pre obnovenie' : 'Potiahnuť pre obnovenie'}
          </span>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        className="overflow-auto"
        drag={isAtTop ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default {
  SwipeGesture,
  SwipeableTabs,
  SwipeableCarousel,
  SwipeToDismiss,
  PullToRefresh
}