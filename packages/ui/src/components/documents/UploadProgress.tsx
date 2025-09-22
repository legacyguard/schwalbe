'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  FileText,
  Image,
  File
} from 'lucide-react'

export interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  result?: {
    confidence: number
    category: string
    extractedText: string
  }
}

interface UploadProgressProps {
  files: UploadFile[]
  isVisible: boolean
  onClose: () => void
  onRetry: (fileId: string) => void
  onCancel: (fileId: string) => void
  className?: string
}

const sofiaMessages = {
  uploading: [
    "Nahrávam váš dokument do bezpečného trezoru... ✨",
    "Sofia tu! Staráme sa o váš dokument s láskou 💙",
    "Každý dokument je krok bližšie k pokoju duše 🌟",
    "Vaše spomienky budú v bezpečí, sľubujem! 🔒"
  ],
  processing: [
    "Čítam váš dokument... Mám veľmi dobré oči! 👁️",
    "Používam svoju magickú OCR technológiu ✨",
    "Rozpoznávam text s láskou a presnosťou 💫",
    "Sofia analyzuje každý detail dokumentu 🔍"
  ],
  completed: [
    "Úžasne! Váš dokument je teraz v bezpečí 🎉",
    "Perfektne spracované! Som na vás hrdá ⭐",
    "Ďalší kúsok vašej mozaiky života je na mieste 🧩",
    "Sofia je spokojná s kvalitou spracovania! 😊"
  ],
  error: [
    "Ojoj! Niečo sa pokazilo, ale nevzdávame sa 💪",
    "Sofia je trochu zmätená, skúsime to znovu? 🤔",
    "Každá chyba je príležitosť na zlepšenie! ✨",
    "Nebojte sa, spolu to zvládneme 🤝"
  ]
}

const getFileIcon = (file: File) => {
  if (file.type.includes('pdf')) return FileText
  if (file.type.includes('image')) return Image
  return File
}

const getRandomMessage = (status: keyof typeof sofiaMessages): string => {
  const messages = sofiaMessages[status]
  return messages[Math.floor(Math.random() * messages.length)]
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function UploadProgress({
  files,
  isVisible,
  onClose,
  onRetry,
  onCancel,
  className = ''
}: UploadProgressProps) {
  const [messages, setMessages] = useState<{ [key: string]: string }>({})

  // Generuj správy pre každý súbor pri zmene statusu
  useEffect(() => {
    const newMessages: { [key: string]: string } = {}

    files.forEach(uploadFile => {
      if (!messages[uploadFile.id] || uploadFile.status !== getStatusFromMessage(messages[uploadFile.id])) {
        newMessages[uploadFile.id] = getRandomMessage(uploadFile.status)
      } else {
        newMessages[uploadFile.id] = messages[uploadFile.id]
      }
    })

    setMessages(newMessages)
  }, [files])

  const getStatusFromMessage = (message: string): keyof typeof sofiaMessages => {
    for (const [status, msgs] of Object.entries(sofiaMessages)) {
      if (msgs.includes(message)) {
        return status as keyof typeof sofiaMessages
      }
    }
    return 'uploading'
  }

  const allCompleted = files.every(f => f.status === 'completed' || f.status === 'error')
  const hasErrors = files.some(f => f.status === 'error')
  const completedCount = files.filter(f => f.status === 'completed').length
  const totalCount = files.length

  if (!isVisible || files.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className={`fixed top-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 ${className}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sofia spracováva</h3>
                <p className="text-xs text-gray-600">
                  {allCompleted
                    ? `Dokončené ${completedCount}/${totalCount} dokumentov`
                    : 'Nahrávam a spracúvam dokumenty'
                  }
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Overall Progress */}
          {!allCompleted && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Celkový postup</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Files List */}
        <div className="max-h-96 overflow-y-auto">
          {files.map((uploadFile, index) => {
            const FileIcon = getFileIcon(uploadFile.file)
            const message = messages[uploadFile.id] || getRandomMessage(uploadFile.status)

            return (
              <motion.div
                key={uploadFile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border-b border-gray-50 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  {/* File Icon & Status */}
                  <div className="relative">
                    <div className={`p-2 rounded-lg ${
                      uploadFile.status === 'completed' ? 'bg-green-100' :
                      uploadFile.status === 'error' ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      <FileIcon className={`w-5 h-5 ${
                        uploadFile.status === 'completed' ? 'text-green-600' :
                        uploadFile.status === 'error' ? 'text-red-600' :
                        'text-blue-600'
                      }`} />
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute -top-1 -right-1">
                      {uploadFile.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-500 bg-white rounded-full" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-500 bg-white rounded-full" />
                      )}
                      {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin bg-white" />
                      )}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {uploadFile.file.name}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(uploadFile.file.size)}
                      </span>
                    </div>

                    {/* Sofia Message */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-2 mb-2">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {message}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    {uploadFile.status !== 'completed' && uploadFile.status !== 'error' && (
                      <div className="mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <motion.div
                            className={`h-1.5 rounded-full ${
                              uploadFile.status === 'processing'
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                                : 'bg-blue-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadFile.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>
                            {uploadFile.status === 'uploading' ? 'Nahrávam...' :
                             uploadFile.status === 'processing' ? 'Spracúvam...' : ''}
                          </span>
                          <span>{uploadFile.progress}%</span>
                        </div>
                      </div>
                    )}

                    {/* Results */}
                    {uploadFile.status === 'completed' && uploadFile.result && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Presnosť:</span>
                          <span className="font-medium text-green-600">
                            {Math.round(uploadFile.result.confidence * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Kategória:</span>
                          <span className="font-medium text-blue-600">
                            {uploadFile.result.category}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {uploadFile.status === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                        <p className="text-xs text-red-700">
                          {uploadFile.error || 'Neočakávaná chyba pri spracovaní'}
                        </p>
                        <button
                          onClick={() => onRetry(uploadFile.id)}
                          className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
                        >
                          Skúsiť znovu
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    {uploadFile.status !== 'completed' && (
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => onCancel(uploadFile.id)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Zrušiť
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        {allCompleted && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-t border-gray-100">
            <div className="text-center">
              {hasErrors ? (
                <div className="space-y-2">
                  <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                  <p className="text-sm font-medium text-gray-900">
                    Spracovanie dokončené s chybami
                  </p>
                  <p className="text-xs text-gray-600">
                    {completedCount} úspešných, {totalCount - completedCount} chýb
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                  <p className="text-sm font-medium text-gray-900">
                    Všetky dokumenty úspešne spracované! 🎉
                  </p>
                  <p className="text-xs text-gray-600">
                    Sofia je hrdá na perfektný výsledok
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}