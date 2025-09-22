'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Download,
  Edit,
  Trash2,
  FileText,
  Image,
  File,
  Calendar,
  Tag,
  Star,
  Share2,
  MoreVertical,
  Folder,
  Plus
} from 'lucide-react'

export interface DocumentCategory {
  id: string
  name: string
  color: string
  icon: React.ComponentType<{ className?: string }>
  count: number
}

export interface VaultDocument {
  id: string
  filename: string
  originalName: string
  category: string
  type: 'pdf' | 'image' | 'document'
  size: number
  uploadDate: Date
  lastModified: Date
  thumbnail?: string
  extractedText?: string
  metadata?: {
    documentType?: string
    dateDetected?: string
    amountDetected?: string
    entityDetected?: string
  }
  tags: string[]
  isStarred: boolean
  confidence?: number
}

interface DocumentVaultProps {
  documents: VaultDocument[]
  categories: DocumentCategory[]
  onDocumentView: (document: VaultDocument) => void
  onDocumentEdit: (document: VaultDocument) => void
  onDocumentDelete: (documentId: string) => void
  onDocumentShare: (document: VaultDocument) => void
  onCategoryCreate: (name: string, color: string) => void
  className?: string
}

type ViewMode = 'grid' | 'list'
type SortBy = 'date' | 'name' | 'size' | 'category'

export function DocumentVault({
  documents,
  categories,
  onDocumentView,
  onDocumentEdit,
  onDocumentDelete,
  onDocumentShare,
  onCategoryCreate,
  className = ''
}: DocumentVaultProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return FileText
      case 'image':
        return Image
      default:
        return File
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.extractedText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    // Sort documents
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.filename.localeCompare(b.filename)
        case 'size':
          return b.size - a.size
        case 'category':
          return a.category.localeCompare(b.category)
        case 'date':
        default:
          return b.uploadDate.getTime() - a.uploadDate.getTime()
      }
    })
  }, [documents, searchQuery, selectedCategory, sortBy])

  const handleDocumentSelect = (documentId: string) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId)
    } else {
      newSelected.add(documentId)
    }
    setSelectedDocuments(newSelected)
  }

  const getCategoryByName = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName)
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Digitálny trezor</h2>
            <p className="text-sm text-gray-600">
              {documents.length} dokumentov v {categories.length} kategóriách
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Hľadať v dokumentoch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategória
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Všetky kategórie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoradiť podľa
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Dátum nahratia</option>
                  <option value="name">Názov</option>
                  <option value="size">Veľkosť</option>
                  <option value="category">Kategória</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Kategórie</h3>
          <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <Plus className="w-3 h-3" />
            <span>Pridať kategóriu</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Všetky ({documents.length})
          </button>

          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category.name
                    ? `bg-${category.color}-100 text-${category.color}-800`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-3 h-3" />
                <span>{category.name} ({category.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Documents */}
      <div className="p-6">
        {filteredAndSortedDocuments.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Žiadne dokumenty
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory
                ? 'Skúste zmeniť filtre vyhľadávania'
                : 'Nahrajte svoj prvý dokument'}
            </p>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
            }
          `}>
            {filteredAndSortedDocuments.map((document, index) => {
              const DocumentIcon = getDocumentIcon(document.type)
              const category = getCategoryByName(document.category)
              const isSelected = selectedDocuments.has(document.id)

              return (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative group border rounded-lg transition-all cursor-pointer
                    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
                    ${viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center space-x-4'}
                  `}
                  onClick={() => handleDocumentSelect(document.id)}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg bg-${category?.color || 'gray'}-100`}>
                          <DocumentIcon className={`w-5 h-5 text-${category?.color || 'gray'}-600`} />
                        </div>

                        <div className="flex items-center space-x-1">
                          {document.isStarred && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                          {document.filename}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatDate(document.uploadDate)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatFileSize(document.size)}</span>
                        {document.confidence && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {Math.round(document.confidence * 100)}%
                          </span>
                        )}
                      </div>

                      {document.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {document.tags.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {document.tags.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{document.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDocumentView(document)
                            }}
                            className="p-2 bg-white shadow-sm rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDocumentEdit(document)
                            }}
                            className="p-2 bg-white shadow-sm rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className={`p-2 rounded-lg bg-${category?.color || 'gray'}-100`}>
                        <DocumentIcon className={`w-5 h-5 text-${category?.color || 'gray'}-600`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {document.filename}
                          </h4>
                          {document.isStarred && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{category?.name}</span>
                          <span>{formatFileSize(document.size)}</span>
                          <span>{formatDate(document.uploadDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {document.confidence && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {Math.round(document.confidence * 100)}%
                          </span>
                        )}

                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDocumentView(document)
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDocumentShare(document)
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDocumentEdit(document)
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Selection Actions */}
      <AnimatePresence>
        {selectedDocuments.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-4"
          >
            <span className="text-sm">
              {selectedDocuments.size} označených dokumentov
            </span>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Tag className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-red-600 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setSelectedDocuments(new Set())}
              className="p-1 hover:bg-gray-700 rounded"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}