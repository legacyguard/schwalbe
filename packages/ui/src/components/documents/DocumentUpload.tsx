/**
 * Document Upload Component
 * Drag & drop interface with visual feedback and Sofia encouragement
 */

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  Image,
  File,
  Camera,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Heart,
  Plus,
  Loader2,
  Zap,
  Star
} from 'lucide-react'
import { cn } from '../../lib/utils'

export interface UploadFile {
  id: string
  file: File
  status: 'uploading' | 'processing' | 'success' | 'error'
  progress: number
  preview?: string
  error?: string
  sofiaMessage?: string
}

interface DocumentUploadProps {
  onFilesUpload: (files: File[]) => void
  onFileRemove: (fileId: string) => void
  acceptedTypes?: string[]
  maxFileSize?: number // in MB
  maxFiles?: number
  uploadingFiles?: UploadFile[]
  className?: string
  variant?: 'default' | 'compact' | 'inline'
  showSofiaEncouragement?: boolean
}

export function DocumentUpload({
  onFilesUpload,
  onFileRemove,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxFileSize = 10,
  maxFiles = 10,
  uploadingFiles = [],
  className,
  variant = 'default',
  showSofiaEncouragement = true
}: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [showMobileCamera, setShowMobileCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      processFiles(files)
    }
    // Reset input
    if (e.target) e.target.value = ''
  }, [])

  const processFiles = (files: File[]) => {
    // Validate files
    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        console.warn(`File ${file.name} is too large (${file.size} bytes)`)
        return false
      }

      // Check file type
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!acceptedTypes.includes(extension)) {
        console.warn(`File ${file.name} has unsupported type (${extension})`)
        return false
      }

      return true
    })

    // Check total files limit
    const totalFiles = uploadingFiles.length + validFiles.length
    if (totalFiles > maxFiles) {
      console.warn(`Cannot upload more than ${maxFiles} files`)
      return
    }

    if (validFiles.length > 0) {
      onFilesUpload(validFiles)
    }
  }

  const handleBrowseFiles = () => {
    fileInputRef.current?.click()
  }

  const handleCameraCapture = () => {
    if (isMobileDevice()) {
      cameraInputRef.current?.click()
    } else {
      setShowMobileCamera(true)
    }
  }

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase()
    if (type.includes('image')) return <Image className="w-6 h-6" />
    if (type.includes('pdf')) return <FileText className="w-6 h-6" />
    return <File className="w-6 h-6" />
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'processing':
        return <Zap className="w-4 h-4 text-blue-500" />
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'border-blue-300 bg-blue-50'
      case 'processing':
        return 'border-purple-300 bg-purple-50'
      case 'success':
        return 'border-green-300 bg-green-50'
      case 'error':
        return 'border-red-300 bg-red-50'
    }
  }

  const getSofiaEncouragementMessage = () => {
    const messages = [
      "Skvelé! Každý dokument má svoju hodnotu. 📚",
      "Výborne! Váš digitálny odkaz rastie. 🌱",
      "Krásne! Ďalší kus vašej mozaiky. ✨",
      "Super! Sme na správnej ceste. 🛤️",
      "Úžasné! Každý krok má význam. 💎"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (variant === 'compact') {
    return (
      <div className={cn("relative", className)}>
        <motion.button
          onClick={handleBrowseFiles}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span>Pridať dokument</span>
        </motion.button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 cursor-pointer group",
          isDragOver
            ? "border-blue-400 bg-blue-50 scale-105"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        )}
        whileHover={{ scale: isDragOver ? 1.05 : 1.02 }}
        onClick={handleBrowseFiles}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-gray-300" />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative text-center">
          <motion.div
            animate={isDragOver ? {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {
              y: [0, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300",
              isDragOver ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
            )}
          >
            <Upload className="w-10 h-10" />
          </motion.div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isDragOver ? "Pustite súbory sem" : "Nahrajte svoje dokumenty"}
          </h3>

          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Pretiahnite súbory sem alebo kliknite pre výber.
            Podporujeme PDF, obrázky a dokumenty do {maxFileSize}MB.
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4">
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                handleBrowseFiles()
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText className="w-4 h-4" />
              <span>Vybrať súbory</span>
            </motion.button>

            {(isMobileDevice() || showMobileCamera) && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCameraCapture()
                }}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="w-4 h-4" />
                <span>Odfotiť</span>
              </motion.button>
            )}
          </div>

          {/* File type info */}
          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">Podporované formáty:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {acceptedTypes.map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-gray-100 rounded text-xs"
                >
                  {type.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Floating particles during drag */}
        <AnimatePresence>
          {isDragOver && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute w-2 h-2 bg-blue-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  animate={{
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Uploading Files */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Spracovávanie súborov
            </h4>

            {uploadingFiles.map((uploadFile) => (
              <motion.div
                key={uploadFile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200",
                  getStatusColor(uploadFile.status)
                )}
              >
                {/* File icon */}
                <div className="flex-shrink-0">
                  {uploadFile.preview ? (
                    <img
                      src={uploadFile.preview}
                      alt={uploadFile.file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(uploadFile.file)}
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate">
                    {uploadFile.file.name}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {(uploadFile.file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>

                  {/* Progress bar */}
                  {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                    <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          uploadFile.status === 'uploading' ? "bg-blue-500" : "bg-purple-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadFile.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}

                  {/* Sofia message */}
                  {uploadFile.sofiaMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-purple-600 italic mt-1 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      {uploadFile.sofiaMessage}
                    </motion.p>
                  )}

                  {/* Error message */}
                  {uploadFile.error && (
                    <p className="text-sm text-red-600 mt-1">
                      {uploadFile.error}
                    </p>
                  )}
                </div>

                {/* Status and actions */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(uploadFile.status)}

                  {uploadFile.status === 'error' && (
                    <motion.button
                      onClick={() => onFileRemove(uploadFile.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sofia Encouragement */}
      <AnimatePresence>
        {showSofiaEncouragement && uploadingFiles.some(f => f.status === 'success') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white"
              >
                <Heart className="w-6 h-6" />
              </motion.div>

              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Sofia vám gratuluje! 🎉
                </h4>
                <p className="text-gray-700">
                  {getSofiaEncouragementMessage()}
                </p>
              </div>

              <div className="text-4xl">
                ✨
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

// Upload progress component
export function UploadProgress({
  files,
  onFileRemove,
  className
}: {
  files: UploadFile[]
  onFileRemove: (fileId: string) => void
  className?: string
}) {
  const totalFiles = files.length
  const completedFiles = files.filter(f => f.status === 'success' || f.status === 'error').length
  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0

  if (totalFiles === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white rounded-2xl border border-gray-200 p-6", className)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          Nahrávanie dokumentov
        </h3>
        <span className="text-sm text-gray-600">
          {completedFiles}/{totalFiles}
        </span>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Celkový pokrok</span>
          <span className="text-sm font-medium text-gray-900">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Individual files */}
      <div className="space-y-3">
        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 flex items-center justify-center">
              {getStatusIcon(file.status)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.file.name}
              </p>
              {file.status === 'processing' && (
                <p className="text-xs text-purple-600">
                  Rozpoznávanie textu...
                </p>
              )}
            </div>

            {file.status === 'error' && (
              <button
                onClick={() => onFileRemove(file.id)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )

  function getStatusIcon(status: UploadFile['status']) {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'processing':
        return <Zap className="w-4 h-4 text-purple-500" />
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }
}