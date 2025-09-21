
import React, { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon-library';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FadeIn } from '@/components/motion/FadeIn';
import { toast } from 'sonner';
import type {
  OCRProcessingConfig,
  OCRProcessingResponse,
  ProcessedDocument,
} from '@/types/ocr';
import { useAuth } from '@clerk/clerk-react';

interface DocumentScannerProps {
  className?: string;
  onDocumentProcessed?: (processedDoc: ProcessedDocument) => void;
  onScanComplete?: () => void;
  onScanStart?: () => void;
}

export default function DocumentScanner({
  onDocumentProcessed,
  onScanStart,
  onScanComplete,
  className,
}: DocumentScannerProps) {
  const { getToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<null | string>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedDocument, setProcessedDocument] =
    useState<null | ProcessedDocument>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [_processingStage, setProcessingStage] = useState<
    'analyzing' | 'completed' | 'upload'
  >('upload');
  const [showResults, setShowResults] = useState(false);

  // Processing configuration
  const [config, setConfig] = useState<OCRProcessingConfig>({
    enableEntityExtraction: true,
    enableDocumentClassification: true,
    enableMetadataExtraction: true,
    confidenceThreshold: 0.7,
    languageHints: ['en'],
    processingMode: 'accurate',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDrop: handleFileSelect,
  });

  function handleFileSelect(acceptedFiles: File[]) {
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedFile(file);
    setProcessingStage('upload');

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    // Reset previous results
    setProcessedDocument(null);
    setShowResults(false);

    // Show upload confirmation immediately
    toast.success('Document uploaded successfully! Ready for analysis.');
  }

  const handleManualFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect([file]);
    }
  };

  const processDocument = useCallback(async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStage('analyzing');
    onScanStart?.();

    // Show immediate analysis message
    toast.success(
      'Thank you. Your document is safely uploaded. Now analyzing it to save you time with data entry. This may take a few seconds.'
    );

    try {
      // Convert file to base64
      const base64Data = await fileToBase64(selectedFile);
      setProcessingProgress(20);

      // Prepare request
      const requestData = {
        fileData: base64Data.split(',')[1], // Remove data URL prefix
        fileName: selectedFile.name,
        config,
      };

      setProcessingProgress(40);

      // Send to API
      const authToken = await getToken().catch(() => null);
      const response = await fetch('/api/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(requestData),
      });

      setProcessingProgress(70);

      const result: OCRProcessingResponse = await response.json();

      if (!result.success || !result.processedDocument) {
        throw new Error(result.error || 'Processing failed');
      }

      setProcessingProgress(100);
      setProcessedDocument(result.processedDocument);
      setProcessingStage('completed');
      setShowResults(true);
      onDocumentProcessed?.(result.processedDocument);

      // Show results modal instead of toast
      setTimeout(() => {
        setShowResults(true);
      }, 500);
    } catch (error) {
      console.error('Document processing failed:', error);
      setProcessingStage('upload');
      toast.error(
        `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      onScanComplete?.();
    }
  }, [selectedFile, config, onScanStart, onScanComplete, onDocumentProcessed]);

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedDocument(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Selection Area */}
      <Card className='p-8'>
        <div className='text-center space-y-4'>
          <FadeIn duration={0.5}>
            <div className='w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center'>
              <Icon
                name="documents"
                className='w-8 h-8 text-primary'
              />
            </div>
            <h3 className='text-xl font-semibold'>Scan & Analyze Document</h3>
            <p className='text-muted-foreground'>
              Upload a document image or PDF to extract text and automatically
              categorize it
            </p>
          </FadeIn>

          {!selectedFile ? (
            <FadeIn duration={0.5} delay={0.2}>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Icon
                  name="upload"
                  className='w-12 h-12 text-muted-foreground mx-auto mb-4'
                />
                <p className='text-lg font-medium mb-2'>
                  {isDragActive
                    ? 'Drop the file here'
                    : 'Drag & drop a document'}
                </p>
                <p className='text-muted-foreground text-sm mb-4'>
                  Supports images (PNG, JPG, GIF, WebP) and PDFs up to 10MB
                </p>
                <Button onClick={handleManualFileSelect} type='button'>
                  <Icon name="documents" className='w-4 h-4 mr-2' />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*,.pdf'
                  onChange={handleFileInputChange}
                  className='hidden'
                />
              </div>
            </FadeIn>
          ) : (
            <FadeIn duration={0.5}>
              <div className='space-y-4'>
                {/* File Preview */}
                <div className='border rounded-lg p-4 bg-muted/5'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <Icon
                        name="documents"
                        className='w-5 h-5 text-primary'
                      />
                      <div className='text-left'>
                        <p className='font-medium'>{selectedFile.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {formatFileSize(selectedFile.size)} •{' '}
                          {selectedFile.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={clearSelection}
                    >
                      <Icon name="x" className='w-4 h-4' />
                    </Button>
                  </div>

                  {previewUrl && (
                    <div className='max-w-md mx-auto'>
                      <img
                        src={previewUrl}
                        alt='Document preview'
                        className='w-full h-auto max-h-64 object-contain rounded border'
                      />
                    </div>
                  )}
                </div>

                {/* Processing Controls */}
                <div className='flex gap-3 justify-center'>
                  <Button
                    onClick={processDocument}
                    disabled={isProcessing}
                    size='lg'
                    className='bg-primary hover:bg-primary-hover text-primary-foreground'
                  >
                    {isProcessing ? (
                      <>
                        <Icon
                          name="loader"
                          className='w-4 h-4 mr-2 animate-spin'
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Icon
                          name="sparkles"
                          className='w-4 h-4 mr-2'
                        />
                        Scan Document
                      </>
                    )}
                  </Button>

                  <Button
                    variant='outline'
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    <Icon name="settings" className='w-4 h-4 mr-2' />
                    Options
                  </Button>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </Card>

      {/* Processing Progress */}
      {isProcessing && (
        <FadeIn duration={0.3}>
          <Card className='p-6'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>
                  Processing Document...
                </span>
                <span className='text-sm text-muted-foreground'>
                  {processingProgress}%
                </span>
              </div>
              <Progress value={processingProgress} className='w-full' />
              <p className='text-sm text-muted-foreground'>
                {processingProgress < 30 && 'Preparing document...'}
                {processingProgress >= 30 &&
                  processingProgress < 60 &&
                  'Extracting text with AI...'}
                {processingProgress >= 60 &&
                  processingProgress < 90 &&
                  'Analyzing and categorizing...'}
                {processingProgress >= 90 && 'Finalizing results...'}
              </p>
            </div>
          </Card>
        </FadeIn>
      )}

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <FadeIn duration={0.3}>
          <Card className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Processing Options</h4>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label>Entity Extraction</Label>
                    <p className='text-sm text-muted-foreground'>
                      Extract names, dates, addresses, etc.
                    </p>
                  </div>
                  <Switch
                    checked={config.enableEntityExtraction}
                    onCheckedChange={checked =>
                      setConfig(prev => ({
                        ...prev,
                        enableEntityExtraction: checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label>Document Classification</Label>
                    <p className='text-sm text-muted-foreground'>
                      Automatically categorize document type
                    </p>
                  </div>
                  <Switch
                    checked={config.enableDocumentClassification}
                    onCheckedChange={checked =>
                      setConfig(prev => ({
                        ...prev,
                        enableDocumentClassification: checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label>Metadata Extraction</Label>
                    <p className='text-sm text-muted-foreground'>
                      Extract structured information
                    </p>
                  </div>
                  <Switch
                    checked={config.enableMetadataExtraction}
                    onCheckedChange={checked =>
                      setConfig(prev => ({
                        ...prev,
                        enableMetadataExtraction: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <Label htmlFor='processing-mode'>Processing Mode</Label>
                  <Select
                    value={config.processingMode}
                    onValueChange={(value: 'accurate' | 'fast') =>
                      setConfig(prev => ({ ...prev, processingMode: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='fast'>
                        Fast (Quick processing)
                      </SelectItem>
                      <SelectItem value='accurate'>
                        Accurate (Better results)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='confidence-threshold'>
                    Confidence Threshold:{' '}
                    {Math.round(config?.confidenceThreshold * 100)}%
                  </Label>
                  <input
                    type='range'
                    min='0.3'
                    max='1'
                    step='0.1'
                    value={config?.confidenceThreshold}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        confidenceThreshold: parseFloat(e.target.value),
                      }))
                    }
                    className='w-full mt-2'
                  />
                  <p className='text-sm text-muted-foreground'>
                    Minimum confidence for extracted information
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>
      )}

      {/* Results Display */}
      {processedDocument && (
        <FadeIn duration={0.5}>
          <DocumentResults document={processedDocument} />
        </FadeIn>
      )}

      {/* AI Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-xl'>
              <div className='w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center'>
                <span className='text-yellow-600 text-sm'>✨</span>
              </div>
              I found this information. Is it correct?
            </DialogTitle>
          </DialogHeader>

          {processedDocument && (
            <div className='space-y-6'>
              {/* Document Classification */}
              <div className='p-4 bg-green-50/50 border border-green-200 rounded-lg'>
                <h3 className='font-semibold mb-2 text-green-800 flex items-center gap-2'>
                  <span className='text-yellow-500'>✨</span>
                  AI Detected Document Type
                </h3>
                <div className='flex items-center gap-3'>
                  <Badge
                    variant='secondary'
                    className='bg-green-100 text-green-800'
                  >
                    {processedDocument.classification.type.replace('_', ' ')}
                  </Badge>
                  <span className='text-sm text-green-600'>
                    {Math.round(
                      processedDocument.classification?.confidence * 100
                    )}
                    % confidence
                  </span>
                </div>
              </div>

              {/* Extracted Entities */}
              {processedDocument.ocrResult.metadata.extractedEntities.length >
                0 && (
                <div className='p-4 bg-green-50/50 border border-green-200 rounded-lg'>
                  <h3 className='font-semibold mb-3 text-green-800 flex items-center gap-2'>
                    <span className='text-yellow-500'>✨</span>
                    AI Found Key Information
                  </h3>
                  <div className='grid gap-3'>
                    {processedDocument.ocrResult.metadata.extractedEntities.map(
                      (entity, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-3 bg-white border border-green-100 rounded'
                        >
                          <div>
                            <Badge
                              variant='outline'
                              className='mb-1 text-green-700 border-green-300'
                            >
                              {entity.type.replace('_', ' ')}
                            </Badge>
                            <p className='text-sm font-medium'>
                              {entity.value}
                            </p>
                          </div>
                          <div className='text-right text-sm text-green-600'>
                            {Math.round(entity?.confidence * 100)}% sure
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Extracted Text Preview */}
              <div className='p-4 bg-green-50/50 border border-green-200 rounded-lg'>
                <h3 className='font-semibold mb-2 text-green-800 flex items-center gap-2'>
                  <span className='text-yellow-500'>✨</span>
                  AI Extracted Text (Preview)
                </h3>
                <div className='bg-white p-3 rounded border border-green-100 max-h-32 overflow-y-auto'>
                  <p className='text-sm text-gray-700 leading-relaxed'>
                    {processedDocument.ocrResult.text.substring(0, 300)}
                    {processedDocument.ocrResult.text.length > 300 && '...'}
                  </p>
                </div>
              </div>

              <div className='flex gap-3 justify-end pt-4 border-t'>
                <Button variant='outline' onClick={() => setShowResults(false)}>
                  Review Later
                </Button>
                <Button
                  onClick={() => {
                    setShowResults(false);
                    toast.success(
                      'Great! The information looks good. You can now save the document.'
                    );
                  }}
                  className='bg-green-600 hover:bg-green-700 text-white'
                >
                  Looks Good! Continue
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Document Results Component
function DocumentResults({ document }: { document: ProcessedDocument }) {
  const [activeTab, setActiveTab] = useState<
    'entities' | 'metadata' | 'overview' | 'text'
  >('overview');

  return (
    <Card className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-xl font-semibold'>Processing Results</h3>
        <Badge
          variant={
            document.processingStatus === 'completed' ? 'default' : 'secondary'
          }
        >
          {document.processingStatus}
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className='flex gap-1 mb-6 bg-muted/30 p-1 rounded-lg'>
        {[
          {
            key: 'overview',
            label: 'Overview',
            icon: 'info',
          },
          {
            key: 'text',
            label: 'Extracted Text',
            icon: 'documents',
          },
          {
            key: 'entities',
            label: 'Entities',
            icon: 'sparkles',
          },
          {
            key: 'metadata',
            label: 'Metadata',
            icon: 'settings',
          },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() =>
              setActiveTab(
                tab.key as 'entities' | 'metadata' | 'overview' | 'text'
              )
            }
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab.icon as any} className='w-4 h-4' />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='space-y-4'>
        {activeTab === 'overview' && (
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-semibold mb-3'>Document Classification</h4>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Type:</span>
                  <Badge variant='outline'>
                    {document.classification.type.replace('_', ' ')}
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Category:</span>
                  <Badge variant='secondary'>
                    {document.classification.category}
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Confidence:</span>
                  <span className='text-sm font-medium'>
                    {Math.round(document.classification?.confidence * 100)}%
                  </span>
                </div>
              </div>

              {document.classification.suggestedTags.length > 0 && (
                <div className='mt-4'>
                  <h5 className='font-medium mb-2'>Suggested Tags</h5>
                  <div className='flex flex-wrap gap-2'>
                    {document.classification.suggestedTags.map(tag => (
                      <Badge key={tag} variant='outline' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className='font-semibold mb-3'>Processing Info</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Processing Time:</span>
                  <span>{document.ocrResult.metadata.processingTime}ms</span>
                </div>
                <div className='flex justify-between'>
                  <span>Text Confidence:</span>
                  <span>
                    {Math.round(document.ocrResult?.confidence * 100)}%
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Language:</span>
                  <span>
                    {document.ocrResult.detectedLanguage.toUpperCase()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Entities Found:</span>
                  <span>
                    {document.ocrResult.metadata.extractedEntities.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div>
            <h4 className='font-semibold mb-3'>Extracted Text</h4>
            <div className='bg-muted/20 p-4 rounded-lg max-h-96 overflow-y-auto'>
              <pre className='text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed'>
                {document.ocrResult.text || 'No text extracted'}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'entities' && (
          <div>
            <h4 className='font-semibold mb-3'>Extracted Entities</h4>
            {document.ocrResult.metadata.extractedEntities.length > 0 ? (
              <div className='grid gap-3'>
                {document.ocrResult.metadata.extractedEntities.map(
                  (entity, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-muted/20 rounded-lg'
                    >
                      <div>
                        <Badge variant='outline' className='mb-1'>
                          {entity.type.replace('_', ' ')}
                        </Badge>
                        <p className='text-sm'>{entity.value}</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm text-muted-foreground'>
                          {Math.round(entity?.confidence * 100)}% confidence
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className='text-muted-foreground'>No entities extracted</p>
            )}
          </div>
        )}

        {activeTab === 'metadata' && (
          <div>
            <h4 className='font-semibold mb-3'>Document Metadata</h4>
            {Object.keys(document.extractedMetadata).length > 0 ? (
              <div className='grid gap-3'>
                {Object.entries(document.extractedMetadata).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className='flex items-center justify-between p-3 bg-muted/20 rounded-lg'
                    >
                      <span className='font-medium'>
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className='text-muted-foreground'>{value}</span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className='text-muted-foreground'>No metadata extracted</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Helper functions
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
