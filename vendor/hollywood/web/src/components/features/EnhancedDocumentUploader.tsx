
import _React, { useCallback, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { toast } from 'sonner';
import DocumentScanner from './DocumentScanner';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import type {
  DocumentCategory,
  DocumentType,
  ProcessedDocument,
} from '@/types/ocr';
import { adaptDbDocumentToProcessedDocument } from '@/lib/type-adapters';

interface EnhancedDocumentUploaderProps {
  className?: string;
  onUploadComplete?: (document: ProcessedDocument) => void;
}

export default function EnhancedDocumentUploader({
  onUploadComplete,
  className,
}: EnhancedDocumentUploaderProps) {
  const { userId } = useAuth();
  const createSupabaseClient = useSupabaseWithClerk();

  const [mode, setMode] = useState<'manual' | 'scan'>('scan');
  const [isUploading, setIsUploading] = useState(false);
  const [processedDocument, setProcessedDocument] =
    useState<null | ProcessedDocument>(null);

  // Manual form data
  const [manualFormData, setManualFormData] = useState({
    title: '',
    description: '',
    category: '' as '' | DocumentCategory,
    documentType: '' as '' | DocumentType,
    tags: '',
    expiresAt: '',
    isImportant: false,
  });

  const handleDocumentProcessed = useCallback((doc: ProcessedDocument) => {
    setProcessedDocument(doc);

    // Auto-populate form with OCR results
    setManualFormData(prev => ({
      ...prev,
      title: doc.extractedMetadata.title || doc.originalFileName,
      description:
        doc.ocrResult.text.substring(0, 200) +
        (doc.ocrResult.text.length > 200 ? '...' : ''),
      category: doc.classification.category,
      documentType: doc.classification.type,
      tags: doc.classification.suggestedTags.join(', '),
      expiresAt: doc.extractedMetadata.expirationDate || '',
      isImportant: doc.classification.suggestedTags.includes('important'),
    }));
  }, []);

  const handleSaveDocument = useCallback(async () => {
    if (!userId || (!processedDocument && mode === 'scan')) {
      toast.error('Please process a document first');
      return;
    }

    setIsUploading(true);

    try {
      const supabase = await createSupabaseClient();

      // Prepare document data
      const documentData = {
        user_id: userId,
        file_name: processedDocument?.originalFileName || 'Manual Entry',
        file_path: '', // Will be updated after file upload
        document_type: manualFormData.documentType || 'other',
        category: manualFormData.category || 'other',
        title: manualFormData.title,
        description: manualFormData.description,
        tags: manualFormData.tags
          ? manualFormData.tags.split(',').map(t => t.trim())
          : [],
        expires_at: manualFormData.expiresAt || null,
        is_important: manualFormData.isImportant,

        // OCR-specific fields
        ocr_text: processedDocument?.ocrResult.text || null,
        ocr_confidence: processedDocument?.ocrResult?.confidence || null,
        extracted_entities: processedDocument?.ocrResult.metadata
          .extractedEntities
          ? JSON.stringify(
              processedDocument.ocrResult.metadata.extractedEntities
            )
          : null,
        classification_confidence:
          processedDocument?.classification?.confidence || null,
        extracted_metadata: processedDocument?.extractedMetadata
          ? JSON.stringify(processedDocument.extractedMetadata)
          : null,
        processing_status:
          (processedDocument?.processingStatus as
            | 'completed'
            | 'failed'
            | 'manual'
            | 'pending'
            | 'processing') || 'manual',
      };

      // Save to database
      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Document saved successfully!');
      onUploadComplete?.(adaptDbDocumentToProcessedDocument(data));

      // Reset form
      setProcessedDocument(null);
      setManualFormData({
        title: '',
        description: '',
        category: '',
        documentType: '',
        tags: '',
        expiresAt: '',
        isImportant: false,
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsUploading(false);
    }
  }, [
    userId,
    processedDocument,
    manualFormData,
    createSupabaseClient,
    onUploadComplete,
    mode,
  ]);

  const handleFormChange = (
    field: keyof typeof manualFormData,
    value: string
  ) => {
    setManualFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mode Toggle */}
      <Card className='p-4'>
        <div className='flex items-center justify-center gap-4'>
          <Button
            variant={mode === 'scan' ? 'default' : 'outline'}
            onClick={() => setMode('scan')}
            className='flex items-center gap-2'
          >
            <Icon name='sparkles' className='w-4 h-4' />
            AI Scan Mode
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => setMode('manual')}
            className='flex items-center gap-2'
          >
            <Icon name='edit' className='w-4 h-4' />
            Manual Entry
          </Button>
        </div>
        <p className='text-center text-sm text-muted-foreground mt-2'>
          {mode === 'scan'
            ? 'Upload and automatically analyze documents with AI'
            : 'Manually enter document information'}
        </p>
      </Card>

      {/* Document Scanner (AI Mode) */}
      {mode === 'scan' && (
        <DocumentScanner
          onDocumentProcessed={handleDocumentProcessed}
          className='w-full'
        />
      )}

      {/* Manual/Enhanced Form */}
      {(mode === 'manual' || processedDocument) && (
        <FadeIn duration={0.5}>
          <Card className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold'>Document Information</h3>
              {processedDocument && (
                <Badge variant='secondary' className='flex items-center gap-2'>
                  <Icon name='sparkles' className='w-3 h-3' />
                  AI Enhanced
                </Badge>
              )}
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='title' className='flex items-center gap-2'>
                    Document Title *
                    {processedDocument && manualFormData.title && (
                      <div className='flex items-center gap-1 text-xs text-green-600'>
                        <span className='text-yellow-500'>✨</span>
                        AI filled
                      </div>
                    )}
                  </Label>
                  <Input
                    id='title'
                    value={manualFormData.title}
                    onChange={e => handleFormChange('title', e.target.value)}
                    placeholder='Enter document title'
                    required
                    className={
                      processedDocument && manualFormData.title
                        ? 'bg-green-50/50 border-green-200 focus:border-green-400'
                        : ''
                    }
                  />
                </div>

                <div>
                  <Label htmlFor='category' className='flex items-center gap-2'>
                    Category
                    {processedDocument && manualFormData.category && (
                      <div className='flex items-center gap-1 text-xs text-green-600'>
                        <span className='text-yellow-500'>✨</span>
                        AI filled
                      </div>
                    )}
                  </Label>
                  <Select
                    value={manualFormData.category}
                    onValueChange={value => handleFormChange('category', value)}
                  >
                    <SelectTrigger
                      className={
                        processedDocument && manualFormData.category
                          ? 'bg-green-50/50 border-green-200 focus:border-green-400'
                          : ''
                      }
                    >
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='legal'>Legal</SelectItem>
                      <SelectItem value='financial'>Financial</SelectItem>
                      <SelectItem value='medical'>Medical</SelectItem>
                      <SelectItem value='insurance'>Insurance</SelectItem>
                      <SelectItem value='personal'>Personal</SelectItem>
                      <SelectItem value='property'>Property</SelectItem>
                      <SelectItem value='business'>Business</SelectItem>
                      <SelectItem value='government'>Government</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor='document-type'
                    className='flex items-center gap-2'
                  >
                    Document Type
                    {processedDocument && manualFormData.documentType && (
                      <div className='flex items-center gap-1 text-xs text-green-600'>
                        <span className='text-yellow-500'>✨</span>
                        AI filled
                      </div>
                    )}
                  </Label>
                  <Select
                    value={manualFormData.documentType}
                    onValueChange={value =>
                      handleFormChange('documentType', value)
                    }
                  >
                    <SelectTrigger
                      className={
                        processedDocument && manualFormData.documentType
                          ? 'bg-green-50/50 border-green-200 focus:border-green-400'
                          : ''
                      }
                    >
                      <SelectValue placeholder='Select document type' />
                    </SelectTrigger>
                    <SelectContent className='max-h-64'>
                      {/* Legal */}
                      <SelectItem value='will'>Will</SelectItem>
                      <SelectItem value='trust'>Trust</SelectItem>
                      <SelectItem value='power_of_attorney'>
                        Power of Attorney
                      </SelectItem>
                      <SelectItem value='living_will'>Living Will</SelectItem>

                      {/* Financial */}
                      <SelectItem value='bank_statement'>
                        Bank Statement
                      </SelectItem>
                      <SelectItem value='tax_return'>Tax Return</SelectItem>
                      <SelectItem value='investment_account'>
                        Investment Account
                      </SelectItem>

                      {/* Insurance */}
                      <SelectItem value='life_insurance'>
                        Life Insurance
                      </SelectItem>
                      <SelectItem value='health_insurance'>
                        Health Insurance
                      </SelectItem>
                      <SelectItem value='auto_insurance'>
                        Auto Insurance
                      </SelectItem>

                      {/* Personal */}
                      <SelectItem value='birth_certificate'>
                        Birth Certificate
                      </SelectItem>
                      <SelectItem value='passport'>Passport</SelectItem>
                      <SelectItem value='drivers_license'>
                        Driver's License
                      </SelectItem>

                      {/* Other */}
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor='expires-at'
                    className='flex items-center gap-2'
                  >
                    Expiration Date (Optional)
                    {processedDocument && manualFormData.expiresAt && (
                      <div className='flex items-center gap-1 text-xs text-green-600'>
                        <span className='text-yellow-500'>✨</span>
                        AI filled
                      </div>
                    )}
                  </Label>
                  <Input
                    id='expires-at'
                    type='date'
                    value={manualFormData.expiresAt}
                    onChange={e =>
                      handleFormChange('expiresAt', e.target.value)
                    }
                    className={
                      processedDocument && manualFormData.expiresAt
                        ? 'bg-green-50/50 border-green-200 focus:border-green-400'
                        : ''
                    }
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className='space-y-4'>
                <div>
                  <Label
                    htmlFor='description'
                    className='flex items-center gap-2'
                  >
                    Description
                    {processedDocument && manualFormData.description && (
                      <div className='flex items-center gap-1 text-xs text-green-600'>
                        <span className='text-yellow-500'>✨</span>
                        AI filled
                      </div>
                    )}
                  </Label>
                  <Textarea
                    id='description'
                    value={manualFormData.description}
                    onChange={e =>
                      handleFormChange('description', e.target.value)
                    }
                    placeholder='Describe the document...'
                    rows={4}
                    className={
                      processedDocument && manualFormData.description
                        ? 'bg-green-50/50 border-green-200 focus:border-green-400'
                        : ''
                    }
                  />
                </div>

                <div>
                  <Label htmlFor='tags' className='flex items-center gap-2'>
                    Tags (comma-separated)
                    {processedDocument && manualFormData.tags && (
                      <div className='flex items-center gap-1 text-xs text-green-600'>
                        <span className='text-yellow-500'>✨</span>
                        AI filled
                      </div>
                    )}
                  </Label>
                  <Input
                    id='tags'
                    value={manualFormData.tags}
                    onChange={e => handleFormChange('tags', e.target.value)}
                    placeholder='important, legal, expires soon'
                    className={
                      processedDocument && manualFormData.tags
                        ? 'bg-green-50/50 border-green-200 focus:border-green-400'
                        : ''
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label>Mark as Important</Label>
                    <p className='text-sm text-muted-foreground'>
                      Important documents get priority notifications
                    </p>
                  </div>
                  <Switch
                    checked={manualFormData.isImportant}
                    onCheckedChange={checked =>
                      setManualFormData(prev => ({
                        ...prev,
                        isImportant: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* OCR Results Summary */}
            {processedDocument && (
              <div className='mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg'>
                <h4 className='font-semibold mb-2 flex items-center gap-2'>
                  <Icon name='sparkles' className='w-4 h-4 text-primary' />
                  AI Analysis Results
                </h4>
                <div className='grid md:grid-cols-3 gap-4 text-sm'>
                  <div>
                    <span className='font-medium'>Detected Type:</span>
                    <p className='text-muted-foreground'>
                      {processedDocument.classification.type.replace('_', ' ')}(
                      {Math.round(
                        processedDocument.classification?.confidence * 100
                      )}
                      % confidence)
                    </p>
                  </div>
                  <div>
                    <span className='font-medium'>Text Quality:</span>
                    <p className='text-muted-foreground'>
                      {Math.round(
                        processedDocument.ocrResult?.confidence * 100
                      )}
                      % accuracy
                    </p>
                  </div>
                  <div>
                    <span className='font-medium'>Entities Found:</span>
                    <p className='text-muted-foreground'>
                      {
                        processedDocument.ocrResult.metadata.extractedEntities
                          .length
                      }{' '}
                      items
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className='flex justify-end mt-6'>
              <Button
                onClick={handleSaveDocument}
                disabled={isUploading || !manualFormData.title}
                size='lg'
                className='bg-primary hover:bg-primary-hover text-primary-foreground'
              >
                {isUploading ? (
                  <>
                    <Icon name='loader' className='w-4 h-4 mr-2 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon name='check' className='w-4 h-4 mr-2' />
                    Save Document
                  </>
                )}
              </Button>
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
