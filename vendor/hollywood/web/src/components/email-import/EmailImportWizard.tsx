
/**
 * Email Import Wizard Component
 * Multi-step wizard for importing documents from Gmail
 */

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Mail,
  Search,
  Settings,
  Shield,
  Upload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { gmailService } from '@/services/gmailService';
import type {
  BulkImportResult,
  DocumentCategorizationResult,
  EmailImportConfig,
  EmailImportSession,
  ExtractedDocument,
} from '@/types/gmail';
import {
  duplicateDetectionService,
  type DuplicateMatch,
  type DuplicateResolutionChoice,
} from '@/services/duplicateDetectionService';
import { DuplicateResolutionStep } from './DuplicateResolutionStep';

interface EmailImportWizardProps {
  className?: string;
  onClose: () => void;
  onComplete: (result: BulkImportResult) => void;
}

type WizardStep =
  | 'auth'
  | 'complete'
  | 'config'
  | 'duplicates'
  | 'importing'
  | 'processing'
  | 'review'
  | 'scanning';

interface WizardState {
  categorizations: DocumentCategorizationResult[];
  config: EmailImportConfig | null;
  documents: ExtractedDocument[];
  duplicates: DuplicateMatch[];
  error: null | string;
  isAuthenticated: boolean;
  resolvedDocuments: ExtractedDocument[];
  selectedDocuments: Set<string>;
  session: EmailImportSession | null;
  step: WizardStep;
}

export function EmailImportWizard({
  onComplete,
  onClose,
  className,
}: EmailImportWizardProps) {
  const { t } = useTranslation('ui/email-import-wizard');
  const [state, setState] = useState<WizardState>({
    step: 'auth',
    isAuthenticated: gmailService.isAuthenticated(),
    config: null,
    session: null,
    documents: [],
    categorizations: [],
    selectedDocuments: new Set(),
    duplicates: [],
    resolvedDocuments: [],
    error: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Authentication step
  const handleAuthentication = useCallback(async () => {
    setIsLoading(true);
    try {
      await gmailService.authenticate();
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        step: 'config',
        error: null,
      }));
    } catch (_error) {
      setState(prev => ({
        ...prev,
        error: t('errors.authFailed'),
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Configuration step
  const handleConfigSubmit = useCallback(async (config: EmailImportConfig) => {
    setState(prev => ({
      ...prev,
      config,
      step: 'scanning',
      error: null,
    }));

    setIsLoading(true);
    try {
      // Start scanning for emails
      const messages = await gmailService.searchEmails(config);

      const session: EmailImportSession = {
        id: `import_${Date.now()}`,
        status: 'scanning',
        totalEmails: messages.length,
        processedEmails: 0,
        foundDocuments: [],
        errors: [],
        startedAt: new Date(),
      };

      setState(prev => ({
        ...prev,
        session,
        step: 'processing',
      }));

      // Extract attachments
      const documents = await gmailService.extractAttachments(messages);

      // Categorize documents
      const categorizations = await gmailService.categorizeDocuments(documents);

      // Detect duplicates
      const duplicateResult =
        await duplicateDetectionService.detectDuplicates(documents);

      const completedSession: EmailImportSession = {
        ...session,
        status: 'completed',
        processedEmails: messages.length,
        foundDocuments: documents,
        completedAt: new Date(),
      };

      if (duplicateResult.duplicates.length > 0) {
        // Has duplicates - go to duplicate resolution step
        setState(prev => ({
          ...prev,
          session: completedSession,
          documents,
          categorizations,
          duplicates: duplicateResult.duplicates,
          resolvedDocuments: duplicateResult.uniqueDocuments,
          step: 'duplicates',
        }));
      } else {
        // No duplicates - select all high and medium relevance documents by default
        const selectedDocuments = new Set<string>();
        documents.forEach((doc, index) => {
          const categorization = categorizations[index];
          if (categorization && categorization.familyRelevance !== 'low') {
            selectedDocuments.add(doc.id);
          }
        });

        setState(prev => ({
          ...prev,
          session: completedSession,
          documents,
          categorizations,
          selectedDocuments,
          step: 'review',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: t('errors.importFailed', { message: error instanceof Error ? error.message : 'Unknown error' }),
        step: 'config',
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Duplicate resolution
  const handleDuplicateResolution = useCallback(
    async (choices: DuplicateResolutionChoice[]) => {
      try {
        // Apply resolution choices
        const resolvedDuplicates =
          await duplicateDetectionService.applyResolution(
            state.duplicates,
            choices
          );

        // Combine resolved duplicates with unique documents
        const allDocuments = [
          ...state.resolvedDocuments,
          ...resolvedDuplicates,
        ];

        // Find categorizations for all documents
        const allCategorizations: DocumentCategorizationResult[] = [];
        allDocuments.forEach(doc => {
          const index = state.documents.findIndex(d => d.id === doc.id);
          if (index >= 0 && state.categorizations[index]) {
            allCategorizations.push(state.categorizations[index]);
          }
        });

        // Select all high and medium relevance documents by default
        const selectedDocuments = new Set<string>();
        allDocuments.forEach((doc, index) => {
          const categorization = allCategorizations[index];
          if (categorization && categorization.familyRelevance !== 'low') {
            selectedDocuments.add(doc.id);
          }
        });

        setState(prev => ({
          ...prev,
          documents: allDocuments,
          categorizations: allCategorizations,
          selectedDocuments,
          step: 'review',
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: t('errors.resolveFailed', { message: error instanceof Error ? error.message : 'Unknown error' }),
        }));
      }
    },
    [
      state.duplicates,
      state.resolvedDocuments,
      state.documents,
      state.categorizations,
    ]
  );

  const handleSkipDuplicates = useCallback(() => {
    // Skip all duplicates and proceed with unique documents only
    const selectedDocuments = new Set<string>();
    state.resolvedDocuments.forEach(doc => {
      // Find categorization for this document
      const originalIndex = state.documents.findIndex(d => d.id === doc.id);
      if (originalIndex >= 0) {
        const categorization = state.categorizations[originalIndex];
        if (categorization && categorization.familyRelevance !== 'low') {
          selectedDocuments.add(doc.id);
        }
      }
    });

    setState(prev => ({
      ...prev,
      documents: state.resolvedDocuments,
      selectedDocuments,
      step: 'review',
    }));
  }, [state.resolvedDocuments, state.documents, state.categorizations]);

  // Document selection
  const toggleDocumentSelection = useCallback((documentId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedDocuments);
      if (newSelected.has(documentId)) {
        newSelected.delete(documentId);
      } else {
        newSelected.add(documentId);
      }
      return { ...prev, selectedDocuments: newSelected };
    });
  }, []);

  // Final import
  const handleFinalImport = useCallback(async () => {
    if (!state.session || !state.config) return;

    setState(prev => ({ ...prev, step: 'importing' }));
    setIsLoading(true);

    try {
      const selectedDocs = state.documents.filter(doc =>
        state.selectedDocuments.has(doc.id)
      );
      const selectedCategorizations = state.categorizations.filter((_, index) =>
        state.documents[index] ? state.selectedDocuments.has(state.documents[index].id) : false
      );

      // Calculate metrics
      const timeSaved = selectedDocs.length * 5; // 5 minutes per document
      const protectionIncrease = Math.min(selectedDocs.length * 2, 20); // 2% per document, max 20%

      const result: BulkImportResult = {
        session: { ...state.session, status: 'completed' },
        documents: selectedDocs,
        categorizations: selectedCategorizations,
        duplicates: state.duplicates.length,
        timeSaved,
        protectionIncrease,
      };

      setState(prev => ({ ...prev, step: 'complete' }));
      onComplete(result);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: t('errors.completeFailed', { message: error instanceof Error ? error.message : 'Unknown error' }),
        step: 'review',
      }));
    } finally {
      setIsLoading(false);
    }
  }, [
    state.session,
    state.config,
    state.documents,
    state.categorizations,
    state.selectedDocuments,
    state.duplicates.length,
    onComplete,
  ]);

  const renderStep = () => {
    switch (state.step) {
      case 'auth':
        return (
          <AuthenticationStep
            onAuthenticate={handleAuthentication}
            isLoading={isLoading}
            error={state.error}
          />
        );
      case 'config':
        return (
          <ConfigurationStep
            onSubmit={handleConfigSubmit}
            isLoading={isLoading}
          />
        );
      case 'scanning':
        return <ScanningStep session={state.session} />;
      case 'processing':
        return <ProcessingStep session={state.session} />;
      case 'duplicates':
        return (
          <DuplicateResolutionStep
            duplicates={state.duplicates}
            onResolve={handleDuplicateResolution}
            onSkip={handleSkipDuplicates}
          />
        );
      case 'review':
        return (
          <ReviewStep
            documents={state.documents}
            categorizations={state.categorizations}
            selectedDocuments={state.selectedDocuments}
            onToggleSelection={toggleDocumentSelection}
            onProceed={handleFinalImport}
          />
        );
      case 'importing':
        return <ImportingStep />;
      case 'complete':
        return <CompleteStep onClose={onClose} />;
      default:
        return null;
    }
  };

  const getStepProgress = () => {
    const steps: WizardStep[] = [
      'auth',
      'config',
      'scanning',
      'processing',
      'duplicates',
      'review',
      'importing',
      'complete',
    ];
    let currentIndex = steps.indexOf(state.step);

    // If no duplicates found, skip the duplicates step in progress calculation
    if (state.duplicates.length === 0 && state.step !== 'duplicates') {
      const stepsWithoutDuplicates: WizardStep[] = [
        'auth',
        'config',
        'scanning',
        'processing',
        'review',
        'importing',
        'complete',
      ];
      currentIndex = stepsWithoutDuplicates.indexOf(state.step);
      return ((currentIndex + 1) / stepsWithoutDuplicates.length) * 100;
    }

    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn('max-w-4xl mx-auto', className)}
    >
      <Card className='min-h-[600px]'>
        <CardHeader className='text-center'>
          <CardTitle className='flex items-center justify-center gap-3 text-2xl'>
            <Mail className='h-7 w-7 text-blue-600' />
            {t('header.title')}
          </CardTitle>
          <p className='text-muted-foreground'>
            {t('header.subtitle')}
          </p>

          <div className='mt-4'>
            <Progress value={getStepProgress()} className='h-2' />
            <div className='flex justify-between text-xs text-muted-foreground mt-2'>
              <span>{t('steps.connect')}</span>
              <span>{t('steps.configure')}</span>
              <span>{t('steps.scan')}</span>
              <span>{t('steps.process')}</span>
              {state.duplicates.length > 0 && <span>{t('steps.duplicates')}</span>}
              <span>{t('steps.review')}</span>
              <span>{t('steps.import')}</span>
              <span>{t('steps.complete')}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode='wait'>
            <motion.div
              key={state.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Authentication Step Component
interface AuthenticationStepProps {
  error: null | string;
  isLoading: boolean;
  onAuthenticate: () => void;
}

function AuthenticationStep({
  onAuthenticate,
  isLoading,
  error,
}: AuthenticationStepProps) {
  const { t } = useTranslation('ui/email-import-wizard');
  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
        <Shield className='h-10 w-10 text-blue-600' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>
          {t('auth.title')}
        </h3>
        <p className='text-muted-foreground max-w-md mx-auto'>
          {t('auth.subtitle')}
        </p>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>{t('auth.errorTitle')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='space-y-3'>
        <Button
          onClick={onAuthenticate}
          disabled={isLoading}
          className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3'
        >
          {isLoading ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              {t('auth.button.connecting')}
            </>
          ) : (
            <>
              <Mail className='h-4 w-4 mr-2' />
              {t('auth.button.connect')}
            </>
          )}
        </Button>

        <div className='flex items-center justify-center space-x-4 text-xs text-muted-foreground'>
          <div className='flex items-center'>
            <Shield className='h-3 w-3 mr-1' />
            {t('auth.secure')}
          </div>
          <div className='flex items-center'>
            <FileText className='h-3 w-3 mr-1' />
            {t('auth.readonly')}
          </div>
        </div>
      </div>
    </div>
  );
}

// Configuration Step Component
interface ConfigurationStepProps {
  isLoading: boolean;
  onSubmit: (config: EmailImportConfig) => void;
}

function ConfigurationStep({ onSubmit, isLoading }: ConfigurationStepProps) {
  const { t } = useTranslation('ui/email-import-wizard');
  const [config, setConfig] = useState<EmailImportConfig>({
    dateRange: {
      from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      to: new Date(),
    },
    includeTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    maxDocuments: 50,
    sizeLimit: 10 * 1024 * 1024, // 10MB
  });

  const handleSubmit = () => {
    onSubmit(config);
  };

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Settings className='h-10 w-10 text-green-600' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>
          {t('config.title')}
        </h3>
        <p className='text-muted-foreground'>
          {t('config.subtitle')}
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              {t('config.dateRange')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div>
                <label className='block text-xs font-medium text-muted-foreground mb-1'>
                  {t('config.from')}
                </label>
                <input
                  type='date'
                  value={config.dateRange.from.toISOString().split('T')[0]}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        from: new Date(e.target.value),
                      },
                    }))
                  }
                  className='w-full px-3 py-2 text-sm border border-input rounded-md'
                />
              </div>
              <div>
                <label className='block text-xs font-medium text-muted-foreground mb-1'>
                  {t('config.to')}
                </label>
                <input
                  type='date'
                  value={config.dateRange.to.toISOString().split('T')[0]}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        to: new Date(e.target.value),
                      },
                    }))
                  }
                  className='w-full px-3 py-2 text-sm border border-input rounded-md'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              {t('config.fileTypes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {['pdf', 'doc', 'docx', 'jpg', 'png', 'tiff'].map(type => (
                <label key={type} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={config.includeTypes.includes(type)}
                    onChange={e => {
                      if (e.target.checked) {
                        setConfig(prev => ({
                          ...prev,
                          includeTypes: [...prev.includeTypes, type],
                        }));
                      } else {
                        setConfig(prev => ({
                          ...prev,
                          includeTypes: prev.includeTypes.filter(
                            t => t !== type
                          ),
                        }));
                      }
                    }}
                    className='rounded'
                  />
                  <span className='text-sm'>.{type.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='flex justify-between items-center'>
        <div className='text-sm text-muted-foreground'>
          {t('config.scanNote', { max: config.maxDocuments })}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || config.includeTypes.length === 0}
          className='px-6'
        >
          {isLoading ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              {t('config.start.scanning')}
            </>
          ) : (
            <>
              <Search className='h-4 w-4 mr-2' />
              {t('config.start.start')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Scanning Step Component
interface ScanningStepProps {
  session: EmailImportSession | null;
}

function ScanningStep({ session }: ScanningStepProps) {
  const { t } = useTranslation('ui/email-import-wizard');
  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto'>
        <Search className='h-10 w-10 text-yellow-600 animate-pulse' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>{t('scanning.title')}</h3>
        <p className='text-muted-foreground'>
          {t('scanning.subtitle')}
        </p>
      </div>

      <div className='max-w-sm mx-auto'>
        <Progress value={undefined} className='h-3' />
        <p className='text-sm text-muted-foreground mt-2'>
          {session
            ? t('scanning.found', { count: session.totalEmails })
            : t('scanning.searching')}
        </p>
      </div>
    </div>
  );
}

// Processing Step Component
interface ProcessingStepProps {
  session: EmailImportSession | null;
}

function ProcessingStep({ session }: ProcessingStepProps) {
  const { t } = useTranslation('ui/email-import-wizard');
  const progress = session
    ? (session.processedEmails / session.totalEmails) * 100
    : 0;

  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
        <Download className='h-10 w-10 text-blue-600 animate-bounce' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>{t('processing.title')}</h3>
        <p className='text-muted-foreground'>
          {t('processing.subtitle')}
        </p>
      </div>

      <div className='max-w-sm mx-auto'>
        <Progress value={progress} className='h-3' />
        <p className='text-sm text-muted-foreground mt-2'>
          {session
            ? t('processing.progress', { processed: session.processedEmails, total: session.totalEmails })
            : t('processing.processing')}
        </p>
      </div>

      {session && session.foundDocuments.length > 0 && (
        <div className='text-center'>
          <Badge variant='secondary' className='text-sm'>
            {t('processing.docsFound', { count: session.foundDocuments.length })}
          </Badge>
        </div>
      )}
    </div>
  );
}

// Review Step Component
interface ReviewStepProps {
  categorizations: DocumentCategorizationResult[];
  documents: ExtractedDocument[];
  onProceed: () => void;
  onToggleSelection: (documentId: string) => void;
  selectedDocuments: Set<string>;
}

function ReviewStep({
  documents,
  categorizations,
  selectedDocuments,
  onToggleSelection,
  onProceed,
}: ReviewStepProps) {
  const { t } = useTranslation('ui/email-import-wizard');
  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <CheckCircle className='h-10 w-10 text-purple-600' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>{t('review.title')}</h3>
        <p className='text-muted-foreground'>
          {t('review.subtitle')}
        </p>
      </div>

      {documents.length === 0 ? (
        <div className='text-center py-8'>
          <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-muted-foreground'>
            {t('review.none')}
          </p>
        </div>
      ) : (
        <>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              {t('review.summary', { total: documents.length, selected: selectedDocuments.size })}
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  documents.forEach(doc => onToggleSelection(doc.id))
                }
              >
                {t('review.selectAll')}
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  selectedDocuments.forEach(id => onToggleSelection(id))
                }
              >
                {t('review.clearAll')}
              </Button>
            </div>
          </div>

          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {documents.map((document, index) => {
              const categorization = categorizations[index];
              const isSelected = selectedDocuments.has(document.id);

              return (
                <Card
                  key={document.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-muted/50'
                  )}
                  onClick={() => onToggleSelection(document.id)}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => onToggleSelection(document.id)}
                        className='mt-1'
                        onClick={e => e.stopPropagation()}
                      />

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h4 className='font-medium truncate'>
                            {document.filename}
                          </h4>
                          <Badge variant='secondary' className='text-xs'>
                            {document.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                          {categorization && (
                            <Badge
                              variant={
                                categorization.familyRelevance === 'high'
                                  ? 'default'
                                  : categorization.familyRelevance === 'medium'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className='text-xs'
                            >
                              {categorization.type.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>

                        <div className='text-xs text-muted-foreground space-y-1'>
                          <div>{t('review.meta.from')} {document.metadata.fromEmail}</div>
                          <div>{t('review.meta.subject')} {document.metadata.subject}</div>
                          <div>
                            {t('review.meta.date')} {' '}
                            {new Date(
                              document.metadata.date
                            ).toLocaleDateString()}
                          </div>
                          <div>
                            {t('review.meta.size', { kb: (document.size / 1024).toFixed(1) })}
                          </div>
                        </div>

                        {categorization &&
                          categorization.insights.length > 0 && (
                            <div className='mt-2'>
                              <p className='text-xs text-blue-600'>
                                {categorization.insights[0]}
                              </p>
                            </div>
                          )}
                      </div>

                      <div className='text-right'>
                        <div className='text-xs text-muted-foreground'>
                          {t('review.confidence', { value: categorization ? Math.round(categorization.confidence * 100) : 0 })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          <div className='flex justify-between items-center'>
            <div className='text-sm text-muted-foreground'>
              {t('review.footer.selected', { count: selectedDocuments.size, minutes: selectedDocuments.size * 5 })}
            </div>

            <Button
              onClick={onProceed}
              disabled={selectedDocuments.size === 0}
              className='px-6'
            >
              <Upload className='h-4 w-4 mr-2' />
              {t('review.footer.import', { count: selectedDocuments.size })}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Importing Step Component
function ImportingStep() {
  const { t } = useTranslation('ui/email-import-wizard');
  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
        <Upload className='h-10 w-10 text-green-600 animate-pulse' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>{t('importing.title')}</h3>
        <p className='text-muted-foreground'>
          {t('importing.subtitle')}
        </p>
      </div>

      <div className='max-w-sm mx-auto'>
        <Progress value={undefined} className='h-3' />
        <p className='text-sm text-muted-foreground mt-2'>
          {t('importing.encrypting')}
        </p>
      </div>
    </div>
  );
}

// Complete Step Component
interface CompleteStepProps {
  onClose: () => void;
}

function CompleteStep({ onClose }: CompleteStepProps) {
  const { t } = useTranslation('ui/email-import-wizard');
  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
        <CheckCircle className='h-10 w-10 text-green-600' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>{t('complete.title')}</h3>
        <p className='text-muted-foreground'>
          {t('complete.subtitle')}
        </p>
      </div>

      <div className='grid grid-cols-3 gap-4 max-w-md mx-auto'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-green-600'>5</div>
          <div className='text-xs text-muted-foreground'>{t('complete.docsAdded')}</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-600'>25min</div>
          <div className='text-xs text-muted-foreground'>{t('complete.timeSaved')}</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-purple-600'>+10%</div>
          <div className='text-xs text-muted-foreground'>
            {t('complete.protection')}
          </div>
        </div>
      </div>

      <Button onClick={onClose} className='px-8'>
        {t('complete.view')}
      </Button>
    </div>
  );
}
