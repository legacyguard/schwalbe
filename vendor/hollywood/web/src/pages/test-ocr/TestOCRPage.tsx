
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Upload,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OCRService } from '@/services/ocrService';
import type { DocumentType, ProcessedDocument } from '@/types/ocr';
import { useTranslation } from 'react-i18next';

const TestOCRPage: React.FC = () => {
  const { t } = useTranslation('pages/test-ocr');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<null | ProcessedDocument>(null);
  const [error, setError] = useState<string>('');

  const ocrService = new OCRService();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError(t('errors.selectImageFile'));
        return;
      }

      setFile(selectedFile);
      setError('');
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError(t('errors.selectFileFirst'));
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/...;base64, prefix
          const base64String = result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Process with OCR
      const config = {
        enableEntityExtraction: true,
        enableDocumentClassification: true,
        enableMetadataExtraction: true,
        confidenceThreshold: 0.7,
        languageHints: ['en'],
        processingMode: 'accurate' as const,
      };
      const ocrResult = await ocrService.processDocument(
        base64,
        file.name,
        config
      );
      setResult(ocrResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('errors.processDocumentFailed')
      );
      console.error('OCR Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const getDocumentTypeLabel = (type: DocumentType): string => {
    const labels: Record<string, string> = {
      will: 'Will',
      contract: 'Contract',
      receipt: 'Receipt',
      other: 'Other',
      trust: 'Trust',
      power_of_attorney: 'Power of Attorney',
      living_will: 'Living Will',
      divorce_decree: 'Divorce Decree',
      adoption_papers: 'Adoption Papers',
      investment_account: 'Investment Account',
      retirement_account: 'Retirement Account',
      tax_return: 'Tax Return',
      loan_document: 'Loan Document',
      mortgage: 'Mortgage',
      credit_card_statement: 'Credit Card Statement',
      financial_statement: 'Financial Statement',
      prescription: 'Prescription',
      medical_directive: 'Medical Directive',
      health_insurance_card: 'Health Insurance Card',
      vaccination_record: 'Vaccination Record',
      health_insurance: 'Health Insurance',
      auto_insurance: 'Auto Insurance',
      home_insurance: 'Home Insurance',
      disability_insurance: 'Disability Insurance',
      social_security_card: 'Social Security Card',
      military_records: 'Military Records',
      property_tax: 'Property Tax',
      home_appraisal: 'Home Appraisal',
      utility_bill: 'Utility Bill',
      business_license: 'Business License',
      business_contract: 'Business Contract',
      business_tax: 'Business Tax',
      government_benefit: 'Government Benefit',
      voter_registration: 'Voter Registration',
      warranty: 'Warranty',
      manual: 'Manual',
      correspondence: 'Correspondence',
    };
    return (
      labels[type] ||
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  return (
    <div className='container mx-auto p-6 max-w-6xl'>
      <h1 className='text-3xl font-bold mb-6'>OCR Test Page</h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleFileSelect}
                  className='hidden'
                  id='file-upload'
                />
                <label
                  htmlFor='file-upload'
                  className='cursor-pointer flex flex-col items-center'
                >
                  <Upload className='w-12 h-12 text-gray-400 mb-2' />
                  <span className='text-sm text-gray-600'>
                    Click to upload or drag and drop
                  </span>
                  <span className='text-xs text-gray-500 mt-1'>
                    PNG, JPG, PDF up to 10MB
                  </span>
                </label>
              </div>

              {preview && (
                <div className='mt-4'>
                  <img
                    src={preview}
                    alt='Document preview'
                    className='max-h-64 mx-auto rounded-lg shadow-md'
                  />
                </div>
              )}

              {file && (
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div className='flex items-center'>
                    <FileText className='w-5 h-5 mr-2 text-gray-600' />
                    <span className='text-sm'>{file.name}</span>
                  </div>
                  <span className='text-xs text-gray-500'>
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              )}

              <Button
                onClick={handleProcess}
                disabled={!file || processing}
                className='w-full'
              >
                {processing ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className='w-4 h-4 mr-2' />
                    Process Document
                  </>
                )}
              </Button>

              {error && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>OCR Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className='space-y-4'>
                {/* Document Type */}
                <div>
                  <h3 className='font-semibold text-sm text-gray-600 mb-1'>
                    Document Type
                  </h3>
                  <div className='flex items-center gap-2'>
                    <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'>
                      {getDocumentTypeLabel(result.classification.type)}
                    </span>
                    <span className='text-xs text-gray-500'>
                      {(result.classification?.confidence * 100).toFixed(1)}%
                      confidence
                    </span>
                  </div>
                </div>

                {/* Extracted Text */}
                <div>
                  <h3 className='font-semibold text-sm text-gray-600 mb-1'>
                    Extracted Text
                  </h3>
                  <div className='p-3 bg-gray-50 rounded-lg max-h-64 overflow-y-auto'>
                    <pre className='text-sm whitespace-pre-wrap'>
                      {result.ocrResult.text || 'No text detected'}
                    </pre>
                  </div>
                </div>

                {/* Extracted Entities */}
                {result.ocrResult.metadata.extractedEntities &&
                  result.ocrResult.metadata.extractedEntities.length > 0 && (
                    <div>
                      <h3 className='font-semibold text-sm text-gray-600 mb-1'>
                        Extracted Information
                      </h3>
                      <div className='space-y-2'>
                        {result.ocrResult.metadata.extractedEntities.filter(
                          entity => entity.type === 'name'
                        ).length > 0 && (
                          <div className='flex'>
                            <span className='text-sm font-medium w-24'>
                              Names:
                            </span>
                            <span className='text-sm'>
                              {result.ocrResult.metadata.extractedEntities
                                .filter(entity => entity.type === 'name')
                                .map(entity => entity.value)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                        {result.ocrResult.metadata.extractedEntities.filter(
                          entity => entity.type === 'date'
                        ).length > 0 && (
                          <div className='flex'>
                            <span className='text-sm font-medium w-24'>
                              Dates:
                            </span>
                            <span className='text-sm'>
                              {result.ocrResult.metadata.extractedEntities
                                .filter(entity => entity.type === 'date')
                                .map(entity => entity.value)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                        {result.ocrResult.metadata.extractedEntities.filter(
                          entity => entity.type === 'amount'
                        ).length > 0 && (
                          <div className='flex'>
                            <span className='text-sm font-medium w-24'>
                              Amounts:
                            </span>
                            <span className='text-sm'>
                              {result.ocrResult.metadata.extractedEntities
                                .filter(entity => entity.type === 'amount')
                                .map(entity => entity.value)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                        {result.ocrResult.metadata.extractedEntities.filter(
                          entity => entity.type === 'address'
                        ).length > 0 && (
                          <div className='flex'>
                            <span className='text-sm font-medium w-24'>
                              Addresses:
                            </span>
                            <span className='text-sm'>
                              {result.ocrResult.metadata.extractedEntities
                                .filter(entity => entity.type === 'address')
                                .map(entity => entity.value)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Metadata */}
                <div>
                  <h3 className='font-semibold text-sm text-gray-600 mb-1'>
                    Processing Details
                  </h3>
                  <div className='text-xs space-y-1 text-gray-500'>
                    <div>
                      Processed at:{' '}
                      {new Date(result.createdAt).toLocaleString()}
                    </div>
                    <div>
                      Language: {result.ocrResult.detectedLanguage || 'Unknown'}
                    </div>
                    <div>
                      Words detected:{' '}
                      {result.ocrResult.text?.split(' ').length || 0}
                    </div>
                    <div>
                      Processing time:{' '}
                      {result.ocrResult.metadata.processingTime}ms
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-12 text-gray-500'>
                <FileText className='w-16 h-16 mx-auto mb-4 text-gray-300' />
                <p>Upload and process a document to see OCR results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className='mt-6'>
        <CardContent className='pt-6'>
          <div className='flex items-start'>
            <AlertCircle className='w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5' />
            <div className='text-sm text-gray-600'>
              <p className='font-semibold mb-1'>
                Google Cloud Vision API Status
              </p>
              <ul className='list-disc list-inside space-y-1 ml-2'>
                <li>✅ API Enabled and Billing Active</li>
                <li>Project: splendid-light-216311</li>
                <li>Free tier: 1,000 requests/month</li>
                <li>
                  Monitor usage at{' '}
                  <a
                    href='https://console.cloud.google.com/apis/api/vision.googleapis.com'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline'
                  >
                    Google Cloud Console
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestOCRPage;
