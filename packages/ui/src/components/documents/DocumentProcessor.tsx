'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DocumentUpload } from './DocumentUpload'
import { CameraCapture } from './CameraCapture'
import { OCRResults, ProcessedDocument, OCRResult } from './OCRResults'
import {
  Camera,
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface DocumentProcessorProps {
  onDocumentProcessed: (document: ProcessedDocument) => void
  className?: string
}

type ProcessingStep = 'upload' | 'processing' | 'review' | 'complete'

export function DocumentProcessor({
  onDocumentProcessed,
  className = ''
}: DocumentProcessorProps) {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [processedDocument, setProcessedDocument] = useState<ProcessedDocument | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  // Mock OCR processing function
  const processDocument = useCallback(async (file: File): Promise<ProcessedDocument> => {
    // Simulácia OCR spracovania
    await new Promise(resolve => setTimeout(resolve, 3000))

    const mockResults: OCRResult[] = [
      {
        id: '1',
        text: 'FAKTÚRA Č. 2024/001',
        confidence: 0.95,
        suggestions: ['FAKTÚRA Č. 2024/001', 'FAKTÚRA č. 2024/001']
      },
      {
        id: '2',
        text: 'Dátum splatnosti: 15.03.2024',
        confidence: 0.88,
        suggestions: ['Dátum splatnosti: 15.03.2024']
      },
      {
        id: '3',
        text: 'Celková suma: 1,250.00 EUR',
        confidence: 0.92,
        suggestions: ['Celková suma: 1,250.00 EUR', 'Celková suma: 1 250,00 EUR']
      },
      {
        id: '4',
        text: 'Dodávateľ: ACME spol. s r.o.',
        confidence: 0.78,
        suggestions: ['Dodávateľ: ACME spol. s r.o.', 'Dodávateľ: ACME s.r.o.']
      }
    ]

    const extractedText = mockResults.map(r => r.text).join('\n')
    const overallConfidence = mockResults.reduce((sum, r) => sum + r.confidence, 0) / mockResults.length

    return {
      id: Date.now().toString(),
      filename: file.name,
      extractedText,
      ocrResults: mockResults,
      overallConfidence,
      suggestedCategory: 'Financie',
      metadata: {
        documentType: 'Faktúra',
        dateDetected: '15.03.2024',
        amountDetected: '1,250.00 EUR',
        entityDetected: 'ACME spol. s r.o.'
      }
    }
  }, [])

  const handleFilesUpload = useCallback(async (files: File[]) => {
    setSelectedFiles(files)
    setCurrentStep('processing')
    setIsProcessing(true)

    try {
      // Spracuj prvý súbor (môžeme rozšíriť na batch processing)
      const processed = await processDocument(files[0])
      setProcessedDocument(processed)
      setCurrentStep('review')
    } catch (error) {
      console.error('Chyba pri spracovaní dokumentu:', error)
      // Handle error - môžeme pridať error state
    } finally {
      setIsProcessing(false)
    }
  }, [processDocument])

  const handleCameraCapture = useCallback(async (imageBlob: Blob) => {
    const file = new File([imageBlob], `camera-capture-${Date.now()}.jpg`, {
      type: 'image/jpeg'
    })

    setIsCameraOpen(false)
    await handleFilesUpload([file])
  }, [handleFilesUpload])

  const handleTextEdit = useCallback((resultId: string, newText: string) => {
    if (!processedDocument) return

    const updatedResults = processedDocument.ocrResults.map(result =>
      result.id === resultId ? { ...result, text: newText } : result
    )

    const updatedExtractedText = updatedResults.map(r => r.text).join('\n')

    setProcessedDocument({
      ...processedDocument,
      ocrResults: updatedResults,
      extractedText: updatedExtractedText
    })
  }, [processedDocument])

  const handleConfirmResults = useCallback(() => {
    if (processedDocument) {
      setCurrentStep('complete')
      onDocumentProcessed(processedDocument)

      // Reset po krátkom zobrazení
      setTimeout(() => {
        setCurrentStep('upload')
        setSelectedFiles([])
        setProcessedDocument(null)
      }, 2000)
    }
  }, [processedDocument, onDocumentProcessed])

  const handleReprocess = useCallback(async () => {
    if (selectedFiles.length > 0) {
      setCurrentStep('processing')
      setIsProcessing(true)

      try {
        const processed = await processDocument(selectedFiles[0])
        setProcessedDocument(processed)
        setCurrentStep('review')
      } catch (error) {
        console.error('Chyba pri opätovnom spracovaní:', error)
      } finally {
        setIsProcessing(false)
      }
    }
  }, [selectedFiles, processDocument])

  const steps = [
    { id: 'upload', title: 'Nahrať dokument', icon: Upload },
    { id: 'processing', title: 'Spracovanie', icon: Sparkles },
    { id: 'review', title: 'Kontrola', icon: FileText },
    { id: 'complete', title: 'Dokončené', icon: CheckCircle }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStepIndex
            const isCompleted = index < currentStepIndex
            const isUpcoming = index > currentStepIndex

            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${isActive ? 'border-blue-600 bg-blue-600 text-white' : ''}
                  ${isCompleted ? 'border-green-600 bg-green-600 text-white' : ''}
                  ${isUpcoming ? 'border-gray-300 bg-white text-gray-400' : ''}
                `}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' :
                    isCompleted ? 'text-green-600' :
                    'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-300 mx-4" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Nahrajte dokument
              </h2>
              <p className="text-gray-600">
                Vyberte súbor alebo použite kameru na zachytenie dokumentu
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <DocumentUpload
                onFilesUpload={handleFilesUpload}
                acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                showSofiaEncouragement={true}
              />

              <div className="space-y-4">
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full flex items-center justify-center space-x-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                  <div className="text-center">
                    <p className="font-medium text-gray-700 group-hover:text-blue-700">
                      Použiť kameru
                    </p>
                    <p className="text-sm text-gray-500">
                      Odfotiť dokument
                    </p>
                  </div>
                </button>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>Podporované formáty:</p>
                  <p>• PDF dokumenty</p>
                  <p>• Obrázky (JPG, PNG)</p>
                  <p>• Maximálna veľkosť: 10MB</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Spracúvam dokument
            </h2>
            <p className="text-gray-600 mb-6">
              Sofia analyzuje váš dokument pomocou OCR technológie
            </p>
            <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}

        {currentStep === 'review' && processedDocument && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <OCRResults
              document={processedDocument}
              isProcessing={isProcessing}
              onTextEdit={handleTextEdit}
              onConfirmResults={handleConfirmResults}
              onReprocess={handleReprocess}
            />
          </motion.div>
        )}

        {currentStep === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Dokument úspešne spracovaný!
            </h2>
            <p className="text-gray-600">
              Váš dokument bol pridaný do digitálneho trezoru
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onCapture={handleCameraCapture}
        onClose={() => setIsCameraOpen(false)}
      />
    </div>
  )
}