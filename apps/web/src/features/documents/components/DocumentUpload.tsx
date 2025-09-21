import React from 'react'
import { logger } from '@schwalbe/shared/lib/logger';
import { uploadDocumentAndAnalyze } from '../api/documentApi'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  getUploadConfiguration,
  isFileTypeAllowed,
  isFileSizeAllowed,
  getFileSizeLimitMessage,
  getAllowedFileTypesMessage,
  getFeatureLimitationMessage
} from '@/config/documentFeatures'

export function DocumentUpload() {
  const [files, setFiles] = React.useState<FileList | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const navigate = useNavigate()
  const uploadConfig = getUploadConfiguration()

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setFiles(e.dataTransfer.files)
  }

  const onUpload = async () => {
    if (!files || files.length === 0) return

    const file = files.item(0)
    if (!file) {
      setError('No file selected.')
      return
    }

    // Validate file type
    if (!isFileTypeAllowed(file.type)) {
      setError(`File type not supported. ${getAllowedFileTypesMessage()}`)
      return
    }

    // Validate file size
    if (!isFileSizeAllowed(file.size)) {
      setError(`File too large. ${getFileSizeLimitMessage()}`)
      return
    }

    // Check if analysis features are enabled
    if (!uploadConfig.enableAnalysis) {
      setError(getFeatureLimitationMessage('documentAnalysis'))
      return
    }

    setUploading(true)
    setError(null)
    try {
      // Gate OCR for paid plans only if OCR is enabled
      if (uploadConfig.enableOCR) {
        const { subscriptionService } = await import('@schwalbe/shared')
        const canOCR = await subscriptionService.hasEntitlement('ocr')
        if (!canOCR) {
          setError('OCR is available on paid plans. Please upgrade to continue.')
          return
        }
      }

      const { document } = await uploadDocumentAndAnalyze(file)
      navigate(`/documents/${document.id}?affirm=uploaded`)
    } catch (e: any) {
      logger.error('Document upload failed', {
        action: 'document_upload_failed',
        metadata: {
          error: e instanceof Error ? e.message : String(e),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
      })
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">Upload Document</h1>
      <div
        className="border-2 border-dashed border-slate-600 rounded p-8 text-center bg-slate-900 hover:bg-slate-800"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <p className="mb-2">Drag and drop a document here</p>
        <p className="text-sm text-slate-300 mb-4">{getAllowedFileTypesMessage()}</p>
        <p className="text-xs text-slate-400 mb-4">{getFileSizeLimitMessage()}</p>
        <input
          type="file"
          accept={uploadConfig.allowedTypes.join(',')}
          onChange={onFileChange}
        />
      </div>
      {files && files.length > 0 ? (
        (() => { const f = files?.item(0); return f ? (
          <div className="mt-4 text-sm text-slate-300">Selected: {f.name} ({Math.round(f.size / 1024)} KB)</div>
        ) : null })()
      ) : null}
      {error ? <div className="mt-3 text-red-400 text-sm" role="alert">{error}</div> : null}
      <div className="mt-6 flex gap-3">
        <Button onClick={onUpload} disabled={uploading || !files || !uploadConfig.enableAnalysis}>
          {uploading ? 'Uploading…' : uploadConfig.enableAnalysis
            ? (uploadConfig.enableOCR ? 'Upload & Analyze (AI+OCR)' : 'Upload & Analyze (AI)')
            : 'Upload Only'
          }
        </Button>
        <Button onClick={() => navigate('/documents')}>Cancel</Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/#pricing')}
        >
          Upgrade
        </Button>
      </div>
      <div className="mt-6 text-xs text-slate-400">
        Note: OCR is a paid feature in the MVP. Documents are stored in your private storage folder. OCR and analysis run via an Edge Function; secrets are managed via environment variables.
      </div>
    </div>
  )
}