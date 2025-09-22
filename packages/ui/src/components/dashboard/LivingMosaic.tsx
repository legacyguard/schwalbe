/**
 * Living Mosaic Visualization
 * Document tiles as organic growing mosaic stones
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Image,
  FileCheck,
  Heart,
  Home,
  Briefcase,
  CreditCard,
  Stethoscope,
  GraduationCap,
  Car,
  MapPin,
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  Sparkles,
  Plus
} from 'lucide-react'
import { cn } from '../../lib/utils'

export interface Document {
  id: string
  title: string
  category: DocumentCategory
  type: 'pdf' | 'image' | 'text' | 'scan'
  uploadedAt: Date
  lastModified: Date
  size: number
  tags: string[]
  isProcessed: boolean
  confidence: number
  previewUrl?: string
  extractedText?: string
  metadata: DocumentMetadata
}

export interface DocumentCategory {
  id: string
  name: string
  color: string
  icon: React.ReactNode
  description: string
}

export interface DocumentMetadata {
  extractedData: Record<string, any>
  ocrConfidence: number
  pageCount?: number
  language?: string
}

interface LivingMosaicProps {
  documents: Document[]
  categories: DocumentCategory[]
  onDocumentClick: (document: Document) => void
  onDocumentEdit: (documentId: string) => void
  onAddDocument: () => void
  searchQuery?: string
  selectedCategory?: string
  className?: string
  variant?: 'grid' | 'masonry' | 'organic'
}

export function LivingMosaic({
  documents,
  categories,
  onDocumentClick,
  onDocumentEdit,
  onAddDocument,
  searchQuery = '',
  selectedCategory,
  className,
  variant = 'organic'
}: LivingMosaicProps) {
  const [hoveredDocument, setHoveredDocument] = useState<string | null>(null)
  const [showAddButton, setShowAddButton] = useState(false)

  // Filter documents based on search and category
  const filteredDocuments = useMemo(() => {
    let filtered = documents

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.extractedText && doc.extractedText.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category.id === selectedCategory)
    }

    return filtered
  }, [documents, searchQuery, selectedCategory])

  // Generate organic positions for documents
  const organicPositions = useMemo(() => {
    const positions: Array<{ x: number; y: number; width: number; height: number; rotation: number }> = []
    const gridSize = 120
    const jitterAmount = 20

    filteredDocuments.forEach((_, index) => {
      const col = index % 6
      const row = Math.floor(index / 6)

      const baseX = col * gridSize + 60
      const baseY = row * gridSize + 60

      // Add organic jitter
      const jitterX = (Math.random() - 0.5) * jitterAmount
      const jitterY = (Math.random() - 0.5) * jitterAmount

      // Vary sizes for organic feel
      const sizeVariation = 0.8 + Math.random() * 0.4
      const width = 100 * sizeVariation
      const height = 100 * sizeVariation

      // Small rotation for organic feel
      const rotation = (Math.random() - 0.5) * 10

      positions.push({
        x: baseX + jitterX,
        y: baseY + jitterY,
        width,
        height,
        rotation
      })
    })

    return positions
  }, [filteredDocuments])

  const getDocumentIcon = (document: Document) => {
    if (document.type === 'image') return <Image className="w-full h-full" />
    if (document.category.icon) return document.category.icon
    return <FileText className="w-full h-full" />
  }

  const getProcessingStatus = (document: Document) => {
    if (!document.isProcessed) {
      return {
        status: 'processing',
        color: 'border-blue-300 bg-blue-50',
        indicator: 'animate-pulse'
      }
    } else if (document.confidence < 0.7) {
      return {
        status: 'needs_review',
        color: 'border-orange-300 bg-orange-50',
        indicator: ''
      }
    } else {
      return {
        status: 'complete',
        color: 'border-green-300 bg-green-50',
        indicator: ''
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowAddButton(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (variant === 'grid') {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4", className)}>
        {filteredDocuments.map((document, index) => (
          <DocumentTile
            key={document.id}
            document={document}
            index={index}
            onDocumentClick={onDocumentClick}
            onDocumentEdit={onDocumentEdit}
            hoveredDocument={hoveredDocument}
            setHoveredDocument={setHoveredDocument}
            getDocumentIcon={getDocumentIcon}
            getProcessingStatus={getProcessingStatus}
            formatFileSize={formatFileSize}
          />
        ))}

        <AddDocumentTile onAddDocument={onAddDocument} showAddButton={showAddButton} />
      </div>
    )
  }

  // Organic/Masonry layout
  return (
    <div className={cn("relative min-h-96", className)}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-gray-300" />
          ))}
        </div>
      </div>

      {/* Documents positioned organically */}
      <div className="relative">
        <AnimatePresence>
          {filteredDocuments.map((document, index) => {
            const position = organicPositions[index]
            if (!position) return null

            return (
              <motion.div
                key={document.id}
                initial={{ scale: 0, opacity: 0, rotate: -90 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotate: position.rotation,
                  x: position.x,
                  y: position.y
                }}
                exit={{ scale: 0, opacity: 0, rotate: 90 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className="absolute origin-center"
                style={{
                  width: position.width,
                  height: position.height
                }}
                onHoverStart={() => setHoveredDocument(document.id)}
                onHoverEnd={() => setHoveredDocument(null)}
              >
                <DocumentTile
                  document={document}
                  index={index}
                  onDocumentClick={onDocumentClick}
                  onDocumentEdit={onDocumentEdit}
                  hoveredDocument={hoveredDocument}
                  setHoveredDocument={setHoveredDocument}
                  getDocumentIcon={getDocumentIcon}
                  getProcessingStatus={getProcessingStatus}
                  formatFileSize={formatFileSize}
                  isOrganic={true}
                />

                {/* Connecting lines to nearby documents */}
                {index > 0 && Math.random() > 0.7 && (
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: index * 0.1 + 0.5 }}
                    className="absolute top-1/2 left-full w-16 h-px bg-gradient-to-r from-gray-300 to-transparent origin-left opacity-30"
                    style={{
                      transform: `translateY(-50%) rotate(${Math.random() * 60 - 30}deg)`
                    }}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Add document button in organic layout */}
        <AnimatePresence>
          {showAddButton && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: filteredDocuments.length * 0.1 + 0.5 }}
              className="absolute"
              style={{
                x: (filteredDocuments.length % 6) * 120 + 60,
                y: Math.floor(filteredDocuments.length / 6) * 120 + 60
              }}
            >
              <AddDocumentTile onAddDocument={onAddDocument} showAddButton={true} isOrganic={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Growth animations */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Document tile component
function DocumentTile({
  document,
  index,
  onDocumentClick,
  onDocumentEdit,
  hoveredDocument,
  setHoveredDocument,
  getDocumentIcon,
  getProcessingStatus,
  formatFileSize,
  isOrganic = false
}: {
  document: Document
  index: number
  onDocumentClick: (document: Document) => void
  onDocumentEdit: (documentId: string) => void
  hoveredDocument: string | null
  setHoveredDocument: (id: string | null) => void
  getDocumentIcon: (document: Document) => React.ReactNode
  getProcessingStatus: (document: Document) => any
  formatFileSize: (bytes: number) => string
  isOrganic?: boolean
}) {
  const status = getProcessingStatus(document)
  const isHovered = hoveredDocument === document.id

  return (
    <motion.div
      className={cn(
        "relative bg-white rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group",
        status.color,
        status.indicator,
        isHovered && "shadow-lg scale-105 z-10",
        isOrganic ? "w-full h-full" : "aspect-square"
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onDocumentClick(document)}
      onMouseEnter={() => setHoveredDocument(document.id)}
      onMouseLeave={() => setHoveredDocument(null)}
    >
      {/* Document preview/icon */}
      <div className="h-2/3 p-4 flex items-center justify-center">
        {document.previewUrl ? (
          <img
            src={document.previewUrl}
            alt={document.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className={cn(
            "w-12 h-12 flex items-center justify-center rounded-xl",
            document.category.color,
            "text-white"
          )}>
            {getDocumentIcon(document)}
          </div>
        )}
      </div>

      {/* Document info */}
      <div className="h-1/3 p-3 bg-white">
        <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
          {document.title}
        </h4>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{document.category.name}</span>
          <span>{formatFileSize(document.size)}</span>
        </div>

        {/* Processing indicator */}
        <div className="mt-2 flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            document.isProcessed ? "bg-green-400" : "bg-blue-400 animate-pulse"
          )} />
          <span className="text-xs text-gray-400">
            {document.isProcessed
              ? `${Math.round(document.confidence * 100)}% presnosť`
              : "Spracováva sa..."
            }
          </span>
        </div>
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/10 flex items-center justify-center"
          >
            <div className="flex gap-2">
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onDocumentClick(document)
                }}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </motion.button>

              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onDocumentEdit(document.id)
                }}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Growth sparkles */}
      {isOrganic && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Add document tile component
function AddDocumentTile({
  onAddDocument,
  showAddButton,
  isOrganic = false
}: {
  onAddDocument: () => void
  showAddButton: boolean
  isOrganic?: boolean
}) {
  if (!showAddButton) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={cn(
        "relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-300 flex items-center justify-center group hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50",
        isOrganic ? "w-full h-full" : "aspect-square"
      )}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onAddDocument}
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center mx-auto mb-3 group-hover:border-blue-300 group-hover:bg-blue-50"
        >
          <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
        </motion.div>

        <p className="text-sm font-medium text-gray-600 group-hover:text-blue-700">
          Pridať dokument
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Kliknite alebo pretiahnite
        </p>
      </div>

      {/* Floating plus icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-blue-300 opacity-0 group-hover:opacity-30"
            style={{
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5
            }}
          >
            <Plus className="w-3 h-3" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Default categories
export const DEFAULT_DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: 'personal',
    name: 'Osobné',
    color: 'bg-blue-500',
    icon: <Heart className="w-4 h-4" />,
    description: 'Osobné dokumenty a identifikácia'
  },
  {
    id: 'housing',
    name: 'Bývanie',
    color: 'bg-green-500',
    icon: <Home className="w-4 h-4" />,
    description: 'Nehnuteľnosti a bývanie'
  },
  {
    id: 'finance',
    name: 'Financie',
    color: 'bg-yellow-500',
    icon: <CreditCard className="w-4 h-4" />,
    description: 'Bankové účty a financie'
  },
  {
    id: 'health',
    name: 'Zdravie',
    color: 'bg-red-500',
    icon: <Stethoscope className="w-4 h-4" />,
    description: 'Zdravotné záznamy'
  },
  {
    id: 'education',
    name: 'Vzdelanie',
    color: 'bg-purple-500',
    icon: <GraduationCap className="w-4 h-4" />,
    description: 'Diplómy a certifikáty'
  },
  {
    id: 'work',
    name: 'Práca',
    color: 'bg-indigo-500',
    icon: <Briefcase className="w-4 h-4" />,
    description: 'Pracovné dokumenty'
  },
  {
    id: 'transport',
    name: 'Doprava',
    color: 'bg-orange-500',
    icon: <Car className="w-4 h-4" />,
    description: 'Vodičské a vozidlá'
  },
  {
    id: 'other',
    name: 'Ostatné',
    color: 'bg-gray-500',
    icon: <FileText className="w-4 h-4" />,
    description: 'Ostatné dokumenty'
  }
]