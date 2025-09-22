/**
 * Email Import Wizard Component - Adapted for Main App
 * Multi-step wizard for importing documents from Gmail
 */

import { useCallback, useState } from 'react';
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
        error: 'Nepodarilo sa pripojiť k Gmail účtu',
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

      const documents = await gmailService.extractAttachments(messages);
      const categorizations = await gmailService.categorizeDocuments(documents);
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
        error: `Import sa nepodaril: ${error instanceof Error ? error.message : 'Neznáma chyba'}`,
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
        const resolvedDuplicates =
          await duplicateDetectionService.applyResolution(
            state.duplicates,
            choices
          );

        const allDocuments = [
          ...state.resolvedDocuments,
          ...resolvedDuplicates,
        ];

        const allCategorizations: DocumentCategorizationResult[] = [];
        allDocuments.forEach(doc => {
          const index = state.documents.findIndex(d => d.id === doc.id);
          if (index >= 0 && state.categorizations[index]) {
            allCategorizations.push(state.categorizations[index]);
          }
        });

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
          error: `Vyriešenie duplikátov sa nepodarilo: ${error instanceof Error ? error.message : 'Neznáma chyba'}`,
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
    const selectedDocuments = new Set<string>();
    state.resolvedDocuments.forEach(doc => {
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

      const timeSaved = selectedDocs.length * 5;
      const protectionIncrease = Math.min(selectedDocs.length * 2, 20);

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
        error: `Dokončenie importu sa nepodarilo: ${error instanceof Error ? error.message : 'Neznáma chyba'}`,
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
            Import dokumentov z Gmailu
          </CardTitle>
          <p className='text-muted-foreground'>
            Bezpečne importujte dokumenty z vašich emailov
          </p>

          <div className='mt-4'>
            <Progress value={getStepProgress()} className='h-2' />
            <div className='flex justify-between text-xs text-muted-foreground mt-2'>
              <span>Pripojenie</span>
              <span>Konfigurácia</span>
              <span>Vyhľadávanie</span>
              <span>Spracovanie</span>
              {state.duplicates.length > 0 && <span>Duplikáty</span>}
              <span>Kontrola</span>
              <span>Import</span>
              <span>Hotovo</span>
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
  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
        <Shield className='h-10 w-10 text-blue-600' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>
          Pripojenie k Gmail účtu
        </h3>
        <p className='text-muted-foreground max-w-md mx-auto'>
          Bezpečne sa pripojte k vašemu Gmail účtu pre import dokumentov
        </p>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Chyba pripojenia</AlertTitle>
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
              Pripájanie...
            </>
          ) : (
            <>
              <Mail className='h-4 w-4 mr-2' />
              Pripojiť Gmail
            </>
          )}
        </Button>

        <div className='flex items-center justify-center space-x-4 text-xs text-muted-foreground'>
          <div className='flex items-center'>
            <Shield className='h-3 w-3 mr-1' />
            Bezpečné
          </div>
          <div className='flex items-center'>
            <FileText className='h-3 w-3 mr-1' />
            Iba čítanie
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
  const [config, setConfig] = useState<EmailImportConfig>({
    dateRange: {
      from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
    includeTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    maxDocuments: 50,
    sizeLimit: 10 * 1024 * 1024,
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
          Konfigurácia importu
        </h3>
        <p className='text-muted-foreground'>
          Nastavte kritéria pre vyhľadávanie dokumentov
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              Časové obdobie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div>
                <label className='block text-xs font-medium text-muted-foreground mb-1'>
                  Od dátumu
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
                  Do dátumu
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
              Typy súborov
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
          Maximálne {config.maxDocuments} dokumentov
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || config.includeTypes.length === 0}
          className='px-6'
        >
          {isLoading ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Vyhľadávanie...
            </>
          ) : (
            <>
              <Search className='h-4 w-4 mr-2' />
              Spustiť vyhľadávanie
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
  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto'>
        <Search className='h-10 w-10 text-yellow-600 animate-pulse' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>Vyhľadávanie emailov</h3>
        <p className='text-muted-foreground'>
          Prehľadávame vaše emaily pre dokumenty...
        </p>
      </div>

      <div className='max-w-sm mx-auto'>
        <Progress value={undefined} className='h-3' />
        <p className='text-sm text-muted-foreground mt-2'>
          {session
            ? `Nájdených ${session.totalEmails} emailov s prílohami`
            : 'Vyhľadávanie...'}
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
  const progress = session
    ? (session.processedEmails / session.totalEmails) * 100
    : 0;

  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
        <Download className='h-10 w-10 text-blue-600 animate-bounce' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>Spracovanie dokumentov</h3>
        <p className='text-muted-foreground'>
          Sťahujeme a analyzujeme prílohy...
        </p>
      </div>

      <div className='max-w-sm mx-auto'>
        <Progress value={progress} className='h-3' />
        <p className='text-sm text-muted-foreground mt-2'>
          {session
            ? `Spracovaných ${session.processedEmails} z ${session.totalEmails} emailov`
            : 'Spracovanie...'}
        </p>
      </div>

      {session && session.foundDocuments.length > 0 && (
        <div className='text-center'>
          <Badge variant='secondary' className='text-sm'>
            Nájdených {session.foundDocuments.length} dokumentov
          </Badge>
        </div>
      )}
    </div>
  );
}

// Simple Duplicate Resolution Step - for now just show duplicates
interface DuplicateResolutionStepProps {
  duplicates: DuplicateMatch[];
  onResolve: (choices: DuplicateResolutionChoice[]) => void;
  onSkip: () => void;
}

function DuplicateResolutionStep({
  duplicates,
  onResolve,
  onSkip,
}: DuplicateResolutionStepProps) {
  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto'>
        <AlertCircle className='h-10 w-10 text-orange-600' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>Zistené duplikáty</h3>
        <p className='text-muted-foreground'>
          Našli sme {duplicates.length} možných duplikátov
        </p>
      </div>

      <div className='space-y-4'>
        {duplicates.slice(0, 3).map(duplicate => (
          <Card key={duplicate.document.id} className='text-left'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='font-medium'>{duplicate.document.filename}</h4>
                  <p className='text-sm text-muted-foreground'>
                    Podobnosť: {Math.round(duplicate.similarity * 100)}%
                  </p>
                </div>
                <Badge variant='secondary'>
                  {duplicate.confidence}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='flex gap-3 justify-center'>
        <Button variant='outline' onClick={onSkip}>
          Preskočiť duplikáty
        </Button>
        <Button onClick={() => onResolve([])}>
          Pokračovať so všetkými
        </Button>
      </div>
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
  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <CheckCircle className='h-10 w-10 text-purple-600' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>Kontrola dokumentov</h3>
        <p className='text-muted-foreground'>
          Vyberte dokumenty na import
        </p>
      </div>

      {documents.length === 0 ? (
        <div className='text-center py-8'>
          <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-muted-foreground'>
            Neboli nájdené žiadne dokumenty
          </p>
        </div>
      ) : (
        <>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              {documents.length} dokumentov nájdených, {selectedDocuments.size} vybraných
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  documents.forEach(doc => onToggleSelection(doc.id))
                }
              >
                Vybrať všetko
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  selectedDocuments.forEach(id => onToggleSelection(id))
                }
              >
                Zrušiť výber
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
                          <div>Od: {document.metadata.fromEmail}</div>
                          <div>Predmet: {document.metadata.subject}</div>
                          <div>
                            Dátum:{' '}
                            {new Date(
                              document.metadata.date
                            ).toLocaleDateString('sk-SK')}
                          </div>
                          <div>
                            Veľkosť: {(document.size / 1024).toFixed(1)} KB
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
                          Spoľahlivosť: {categorization ? Math.round(categorization.confidence * 100) : 0}%
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
              {selectedDocuments.size} dokumentov vybraných ({selectedDocuments.size * 5} min ušetrených)
            </div>

            <Button
              onClick={onProceed}
              disabled={selectedDocuments.size === 0}
              className='px-6'
            >
              <Upload className='h-4 w-4 mr-2' />
              Importovať {selectedDocuments.size} dokumentov
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Importing Step Component
function ImportingStep() {
  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
        <Upload className='h-10 w-10 text-green-600 animate-pulse' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>Importovanie dokumentov</h3>
        <p className='text-muted-foreground'>
          Šifrujeme a ukladáme vaše dokumenty...
        </p>
      </div>

      <div className='max-w-sm mx-auto'>
        <Progress value={undefined} className='h-3' />
        <p className='text-sm text-muted-foreground mt-2'>
          Šifrovanie a ukladanie...
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
  return (
    <div className='text-center space-y-6'>
      <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
        <CheckCircle className='h-10 w-10 text-green-600' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>Import dokončený!</h3>
        <p className='text-muted-foreground'>
          Vaše dokumenty boli úspešne importované
        </p>
      </div>

      <div className='grid grid-cols-3 gap-4 max-w-md mx-auto'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-green-600'>5</div>
          <div className='text-xs text-muted-foreground'>Dokumentov pridaných</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-600'>25min</div>
          <div className='text-xs text-muted-foreground'>Čas ušetrený</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-purple-600'>+10%</div>
          <div className='text-xs text-muted-foreground'>
            Ochrana zvýšená
          </div>
        </div>
      </div>

      <Button onClick={onClose} className='px-8'>
        Zobraziť dokumenty
      </Button>
    </div>
  );
}