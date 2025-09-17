
/**
 * Will Management Page
 * Main interface for managing user's wills
 */

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Plus,
  RefreshCw,
  Scale,
  Trash2,
} from 'lucide-react';
import { WillWizard } from '../components/will/WillWizard';
import type { Will } from '../types/will';
import { willApiService } from '../services/willApiService';
import { pdfGenerationService } from '../services/pdfGenerationService';
import { useTranslation } from 'react-i18next';

type ViewMode = 'list' | 'preview' | 'wizard';

interface WillManagementState {
  error: null | string;
  isLoading: boolean;
  selectedWill: null | Will;
  viewMode: ViewMode;
  wills: Will[];
}

export const WillManagement: React.FC = () => {
  const { t } = useTranslation('ui/will-management');
  const [state, setState] = useState<WillManagementState>({
    wills: [],
    selectedWill: null,
    viewMode: 'list',
    isLoading: true,
    error: null,
  });

  /**
   * Load user's wills
   */
  const loadWills = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const wills = await willApiService.getUserWills();
      setState(prev => ({
        ...prev,
        wills,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading wills:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : t('errors.loadFailed'),
      }));
    }
  };

  /**
   * Handle will creation completion
   */
  const handleWillCreated = () => {
    setState(prev => ({ ...prev, viewMode: 'list' }));
    loadWills(); // Refresh the list
  };

  /**
   * Handle will deletion
   */
  const handleDeleteWill = async (willId: string) => {
    if (
      !window.confirm(
        t('confirmations.deleteMessage')
      )
    ) {
      return;
    }

    try {
      await willApiService.deleteWill(willId);
      await loadWills();
    } catch (error) {
      console.error('Error deleting will:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : t('errors.deleteFailed'),
      }));
    }
  };

  /**
   * Handle will regeneration
   */
  const handleRegenerateWill = async (willId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await willApiService.regenerateWill(willId);
      await loadWills();
    } catch (error) {
      console.error('Error regenerating will:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : t('errors.regenerateFailed'),
      }));
    }
  };

  /**
   * Download will as PDF
   */
  const handleDownloadPDF = async (will: Will) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const content = await willApiService.getWillContent(will.id);
      const generatedWill = {
        id: will.id,
        templateId: `${will.jurisdiction}-${will.will_type}`,
        userId: will.user_id,
        jurisdiction: will.jurisdiction as any,
        language: will.language as any,
        type:
          will.will_type === 'simple'
            ? ('holographic' as const)
            : ('witnessed' as const),
        content,
        metadata: {
          generationDate: will.updated_at,
          version: '1.0',
          wordCount: content.text.split(' ').length,
          pageCount: 1,
          checksum: 'checksum',
        },
        validationResult: {
          isValid: will.validation_errors?.length === 0,
          completenessScore: will.completeness_score || 0,
          errors: (will.validation_errors || []).map(error => ({
            ...error,
            code: error.field || 'unknown',
            legalReference: error.legal_reference,
          })),
          warnings: [],
          legalRequirementsMet: true,
          missingRequiredFields: [],
          suggestedImprovements: [],
        },
        aiSuggestions: (will.ai_suggestions || []).map(suggestion => ({
          ...suggestion,
          affectedSections: [], // Default value
          isJurisdictionSpecific: suggestion.jurisdiction_specific,
          suggestedAction: suggestion.suggested_action || suggestion.description,
        })) as import('@/types/will-templates').AISuggestion[],
        executionInstructions: {
          holographic: {
            steps: t('holographicWill.requirements.do', { returnObjects: true }),
            requirements: t('holographicWill.requirements.mustBe', { returnObjects: true }),
            warnings: t('holographicWill.requirements.doNot', { returnObjects: true }),
          },
        },
        legalDisclaimer:
          'This will was generated using AI assistance. Please consult with a qualified attorney for legal advice.',
      };

      const pdfBuffer =
        await pdfGenerationService.generateWillPDF(generatedWill);
      const filename = `Will-${will.jurisdiction}-${new Date().toISOString().split('T')[0]}.pdf`;

      pdfGenerationService.downloadPDF(pdfBuffer, filename);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate PDF',
      }));
    }
  };

  /**
   * Get status badge for will
   */
  const getStatusBadge = (will: Will) => {
    const statusConfig = {
      draft: { color: 'secondary', icon: Clock, text: t('statusLabels.draft') },
      in_progress: { color: 'default', icon: RefreshCw, text: t('statusLabels.inProgress') },
      review: { color: 'default', icon: FileText, text: t('statusLabels.underReview') },
      completed: { color: 'default', icon: CheckCircle, text: t('statusLabels.completed') },
      notarized: { color: 'default', icon: CheckCircle, text: t('statusLabels.notarized') },
      witnessed: { color: 'default', icon: FileText, text: t('statusLabels.witnessed') },
      archived: { color: 'secondary', icon: FileText, text: t('statusLabels.archived') },
    };

    const config = statusConfig[will.status] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.color as any} className='flex items-center gap-1'>
        <IconComponent className='h-3 w-3' />
        {config.text}
      </Badge>
    );
  };

  /**
   * Get completeness indicator
   */
  const getCompletenessIndicator = (score: number) => {
    if (score >= 90) return { color: 'text-green-600', text: t('completeness.complete') };
    if (score >= 70) return { color: 'text-yellow-600', text: t('completeness.good') };
    if (score >= 50) return { color: 'text-orange-600', text: t('completeness.needsWork') };
    return { color: 'text-red-600', text: t('completeness.incomplete') };
  };

  // Load wills on component mount
  useEffect(() => {
    loadWills();
  }, []);

  /**
   * Render will list view
   */
  const renderWillList = () => (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>{t('ui.pageTitle')}</h1>
          <p className='text-muted-foreground'>
            {t('ui.pageSubtitle')}
          </p>
        </div>
        <Button
          onClick={() => setState(prev => ({ ...prev, viewMode: 'wizard' }))}
          className='flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          {t('ui.createNewWill')}
        </Button>
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {state.isLoading && (
        <div className='text-center py-8'>
          <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p className='text-muted-foreground'>{t('ui.loadingMessage')}</p>
        </div>
      )}

      {/* Empty State */}
      {!state.isLoading && state.wills.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <FileText className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
            <h3 className='text-lg font-semibold mb-2'>{t('ui.emptyStateTitle')}</h3>
            <p className='text-muted-foreground mb-4'>
              {t('ui.emptyStateDescription')}
            </p>
            <Button
              onClick={() =>
                setState(prev => ({ ...prev, viewMode: 'wizard' }))
              }
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              {t('ui.createFirstWill')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wills List */}
      {!state.isLoading && state.wills.length > 0 && (
        <div className='grid gap-4'>
          {state.wills.map(will => {
            const completeness = getCompletenessIndicator(
              will.completeness_score || 0
            );

            return (
              <Card key={will.id} className='hover:shadow-md transition-shadow'>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <CardTitle className='text-lg'>
                          {(will as any).testatorInfo?.fullName || (will as any).testator_data?.fullName || 'Unnamed Will'}
                        </CardTitle>
                        {getStatusBadge(will)}
                      </div>

                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <Scale className='h-3 w-3' />
                          {will.jurisdiction} • {will.will_type}
                        </span>

                        <span className={completeness.color}>
                          {completeness.text} ({will.completeness_score || 0}%)
                        </span>

                        <span>
                          {t('ui.updatedLabel', { date: new Date(will.updated_at).toLocaleDateString() })}
                        </span>
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDownloadPDF(will)}
                        disabled={state.isLoading}
                      >
                        <Download className='h-4 w-4' />
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleRegenerateWill(will.id)}
                        disabled={state.isLoading}
                      >
                        <RefreshCw className='h-4 w-4' />
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDeleteWill(will.id)}
                        disabled={state.isLoading}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className='space-y-3'>
                    {/* Beneficiaries */}
                    {will.beneficiaries && will.beneficiaries.length > 0 && (
                      <div>
                        <p className='text-sm font-medium mb-1'>
                          {t('ui.beneficiariesLabel')}
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {will.beneficiaries
                            .slice(0, 3)
                            .map((beneficiary, index) => (
                              <Badge key={index} variant='outline'>
                                {beneficiary.full_name} (
                                {beneficiary.relationship})
                              </Badge>
                            ))}
                          {will.beneficiaries.length > 3 && (
                            <Badge variant='outline'>
                              {t('ui.moreLabel', { count: will.beneficiaries.length - 3 })}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Validation Issues */}
                    {will.validation_errors &&
                      will.validation_errors.length > 0 && (
                        <Alert>
                          <AlertCircle className='h-4 w-4' />
                          <AlertDescription>
                            {t('ui.validationIssues', {
                              count: will.validation_errors.length,
                              plural: will.validation_errors.length !== 1 ? 's' : ''
                            })}
                          </AlertDescription>
                        </Alert>
                      )}

                    {/* AI Suggestions */}
                    {will.ai_suggestions && will.ai_suggestions.length > 0 && (
                      <div className='text-sm text-muted-foreground'>
                        {t('ui.aiSuggestions', {
                          count: will.ai_suggestions.length,
                          plural: will.ai_suggestions.length !== 1 ? 's' : ''
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>{t('help.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <h4 className='font-medium mb-1'>{t('help.creating.title')}</h4>
              <p className='text-muted-foreground'>
                {t('help.creating.description')}
              </p>
            </div>
            <div>
              <h4 className='font-medium mb-1'>{t('help.compliance.title')}</h4>
              <p className='text-muted-foreground'>
                {t('help.compliance.description')}
              </p>
            </div>
            <div>
              <h4 className='font-medium mb-1'>{t('help.review.title')}</h4>
              <p className='text-muted-foreground'>
                {t('help.review.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /**
   * Render main content based on view mode
   */
  const renderContent = () => {
    switch (state.viewMode) {
      case 'wizard':
        return (
          <WillWizard
            onComplete={handleWillCreated}
            onCancel={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
          />
        );
      case 'preview':
        // Will preview implementation would go here
        return renderWillList();
      case 'list':
      default:
        return renderWillList();
    }
  };

  return <div className='container mx-auto p-6'>{renderContent()}</div>;
};
