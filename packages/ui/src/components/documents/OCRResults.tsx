'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Edit3,
  Check,
  AlertTriangle,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react'

export interface OCRResult {
  id: string
  text: string
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  suggestions?: string[]
}

export interface ProcessedDocument {
  id: string
  filename: string
  extractedText: string
  ocrResults: OCRResult[]
  overallConfidence: number
  suggestedCategory?: string
  metadata?: {
    documentType?: string
    dateDetected?: string
    amountDetected?: string
    entityDetected?: string
  }
}

interface OCRResultsProps {
  document: ProcessedDocument
  isProcessing?: boolean
  onTextEdit: (resultId: string, newText: string) => void
  onConfirmResults: () => void
  onReprocess: () => void
  className?: string
}

const confidenceColors = {
  high: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-red-600 bg-red-50 border-red-200'
}

const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

const getConfidenceMessage = (confidence: number): string => {
  if (confidence >= 0.9) return 'Výborná presnosť rozpoznania'
  if (confidence >= 0.8) return 'Dobrá presnosť rozpoznania'
  if (confidence >= 0.6) return 'Stredná presnosť - odporúčame kontrolu'
  return 'Nízka presnosť - potrebná kontrola'
}

export function OCRResults({
  document,
  isProcessing = false,
  onTextEdit,
  onConfirmResults,
  onReprocess,
  className = ''
}: OCRResultsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleStartEdit = (result: OCRResult) => {
    setEditingId(result.id)
    setEditText(result.text)
  }

  const handleSaveEdit = () => {
    if (editingId) {
      onTextEdit(editingId, editText)
      setEditingId(null)
      setEditText('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const overallLevel = getConfidenceLevel(document.overallConfidence)

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Výsledky spracovania
              </h3>
              <p className="text-sm text-gray-600">{document.filename}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{showPreview ? 'Skryť náhľad' : 'Zobraziť náhľad'}</span>
            </button>

            <button
              onClick={onReprocess}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Spracovať znovu</span>
            </button>
          </div>
        </div>

        {/* Overall Confidence */}
        <div className={`flex items-center justify-between p-4 rounded-lg border ${confidenceColors[overallLevel]}`}>
          <div className="flex items-center space-x-3">
            {overallLevel === 'high' && <Check className="w-5 h-5" />}
            {overallLevel === 'medium' && <AlertTriangle className="w-5 h-5" />}
            {overallLevel === 'low' && <AlertTriangle className="w-5 h-5" />}

            <div>
              <p className="font-medium">
                {getConfidenceMessage(document.overallConfidence)}
              </p>
              <p className="text-sm opacity-75">
                Celková presnosť: {Math.round(document.overallConfidence * 100)}%
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">
              {Math.round(document.overallConfidence * 100)}%
            </div>
          </div>
        </div>

        {/* Metadata */}
        {document.metadata && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {document.metadata.documentType && (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">Typ: </span>
                <span className="text-sm font-medium">{document.metadata.documentType}</span>
              </div>
            )}

            {document.suggestedCategory && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Kategória: </span>
                <span className="text-sm font-medium">{document.suggestedCategory}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-100"
          >
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Extrahovaný text:
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {document.extractedText}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OCR Results */}
      <div className="p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Rozpoznané časti dokumentu:
        </h4>

        <div className="space-y-3">
          {document.ocrResults.map((result, index) => {
            const level = getConfidenceLevel(result.confidence)
            const isEditing = editingId === result.id

            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all ${
                  isEditing ? 'border-blue-300 bg-blue-50' : confidenceColors[level]
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                      {Math.round(result.confidence * 100)}%
                    </span>
                    {result.suggestions && result.suggestions.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {result.suggestions.length} návrhov
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(result)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                      rows={3}
                      autoFocus
                    />

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Uložiť
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Zrušiť
                      </button>
                    </div>

                    {result.suggestions && result.suggestions.length > 0 && (
                      <div className="border-t pt-2">
                        <p className="text-xs text-gray-600 mb-1">Návrhy:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => setEditText(suggestion)}
                              className="px-2 py-1 bg-white text-xs text-gray-700 rounded border hover:bg-gray-50 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-mono leading-relaxed">
                    {result.text}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            {document.ocrResults.length} rozpoznaných častí
          </div>

          <button
            onClick={onConfirmResults}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Potvrdiť a pokračovať</span>
          </button>
        </div>
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl"
          >
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Spracúvam dokument...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}