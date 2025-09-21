
import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { Badge } from '@/components/ui/badge';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import type { WillData } from './WillWizard';
import type { WillType } from './WillTypeSelector';
import { AnimatePresence, motion } from 'framer-motion';

interface GuardianData {
  contact_info?: {
    email?: string;
    phone?: string;
  };
  id: string;
  name: string;
  relationship: string;
}

interface DocumentBundle {
  bundle_category: string;
  bundle_name: string;
  documents: Array<{
    category: string;
    document_type: string;
    id: string;
    title: string;
  }>;
  entity_type?: string;
  id: string;
  primary_entity?: string;
}

interface DraftAnalysis {
  confidence: 'high' | 'low' | 'medium';
  foundBundles: DocumentBundle[];
  foundGuardians: GuardianData[];
  missingInfo: string[];
  suggestedAssetDistribution: Array<{
    bundleId: string;
    bundleName: string;
    reasoning: string;
    suggestedRecipient: string;
  }>;
  suggestedBeneficiaries: Array<{
    name: string;
    percentage: number;
    reasoning: string;
    relationship: 'child' | 'parent' | 'sibling' | 'spouse';
  }>;
  suggestedExecutor?: {
    name: string;
    reasoning: string;
    relationship: string;
  };
  suggestedGuardians?: Array<{
    name: string;
    reasoning: string;
    relationship: string;
  }>;
}

interface IntelligentWillDraftGeneratorProps {
  onDraftAccepted: (draftData: WillData) => void;
  onStartFromScratch: () => void;
  willType: WillType;
}

export const IntelligentWillDraftGenerator: React.FC<
  IntelligentWillDraftGeneratorProps
> = ({ onDraftAccepted, onStartFromScratch }) => {
  const { userId } = useAuth();
  const currentUser = { id: userId, name: 'Current User' };
  useUser();
  const createSupabaseClient = useSupabaseWithClerk();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DraftAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const generateIntelligentDraft = async () => {
    if (!userId) return;

    setIsAnalyzing(true);
    try {
      const supabase = await createSupabaseClient();

      // 1. Fetch Guardians
      const { data: guardians } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId);

      // 2. Fetch Documents
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);

      // 3. Analyze and Generate Suggestions
      const analysis = analyzeUserDataForWill(
        (guardians || []).filter(g => g.relationship !== null) as any,
        (documents || []) as any,
        { fullName: currentUser.name }
      );

      setAnalysis(analysis);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Error analyzing currentUser data:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeUserDataForWill = (
    guardians: GuardianData[],
    bundles: DocumentBundle[],
    _user: null | { fullName?: string }
  ): DraftAnalysis => {
    const analysis: DraftAnalysis = {
      foundGuardians: guardians,
      foundBundles: bundles,
      suggestedBeneficiaries: [],
      suggestedAssetDistribution: [],
      missingInfo: [],
      confidence: 'medium',
    };

    // 1. Suggest Beneficiaries Based on Guardians
    const spouses = guardians.filter(g =>
      [
        'spouse',
        'husband',
        'wife',
        'partner',
        'manžel',
        'manželka',
        'partner',
        'partnerka',
      ].some(term => g.relationship.toLowerCase().includes(term))
    );

    const children = guardians.filter(g =>
      ['child', 'son', 'daughter', 'dieťa', 'syn', 'dcéra'].some(term =>
        g.relationship.toLowerCase().includes(term)
      )
    );

    const parents = guardians.filter(g =>
      ['parent', 'mother', 'father', 'rodič', 'mama', 'otec', 'matka'].some(
        term => g.relationship.toLowerCase().includes(term)
      )
    );

    let _totalPercentage = 0;

    // Primary spouse gets 50% if there are children, 75% if no children
    if (spouses.length > 0) {
      const percentage = children.length > 0 ? 50 : 75;
      analysis.suggestedBeneficiaries.push({
        name: spouses[0].name,
        relationship: 'spouse',
        percentage,
        reasoning: `Your spouse is typically the primary beneficiary ${children.length > 0 ? 'sharing inheritance with your children' : 'inheriting the majority of your estate'}.`,
      });
      _totalPercentage += percentage;
    }

    // Children share remaining percentage
    if (children.length > 0) {
      const remainingForChildren = spouses.length > 0 ? 50 : 85;
      const percentagePerChild = Math.floor(
        remainingForChildren / children.length
      );

      children.forEach(child => {
        analysis.suggestedBeneficiaries.push({
          name: child.name,
          relationship: 'child',
          percentage: percentagePerChild,
          reasoning: `Your children are protected heirs under law and should receive equal shares.`,
        });
        _totalPercentage += percentagePerChild;
      });
    }

    // Parents get remaining if no spouse or children
    if (parents.length > 0 && spouses.length === 0 && children.length === 0) {
      const percentagePerParent = Math.floor(80 / parents.length);
      parents.forEach(parent => {
        analysis.suggestedBeneficiaries.push({
          name: parent.name,
          relationship: 'parent',
          percentage: percentagePerParent,
          reasoning: `In absence of spouse and children, parents are natural beneficiaries.`,
        });
        _totalPercentage += percentagePerParent;
      });
    }

    // 2. Suggest Asset Distribution
    analysis.suggestedAssetDistribution = bundles.map(bundle => {
      let suggestedRecipient = 'To be divided among all beneficiaries';
      let reasoning =
        'This asset will be distributed according to percentage shares.';

      // Smart asset matching
      const bundleName = bundle.bundle_name.toLowerCase();
      const bundleCategory = bundle.bundle_category.toLowerCase();

      if (
        bundleName.includes('home') ||
        bundleName.includes('house') ||
        bundleName.includes('byt') ||
        bundleCategory.includes('real estate')
      ) {
        if (spouses.length > 0) {
          suggestedRecipient = spouses[0].name;
          reasoning =
            'Family home typically goes to surviving spouse for continued residence.';
        }
      } else if (
        bundleName.includes('car') ||
        bundleName.includes('vehicle') ||
        bundleName.includes('auto') ||
        bundleCategory.includes('vehicle')
      ) {
        if (children.length > 0) {
          suggestedRecipient = children[0].name;
          reasoning =
            'Vehicle often goes to adult children who can use it immediately.';
        } else if (spouses.length > 0) {
          suggestedRecipient = spouses[0].name;
          reasoning = "Vehicle will be useful for your spouse's daily needs.";
        }
      } else if (
        bundleCategory.includes('financial') ||
        bundleCategory.includes('investment')
      ) {
        if (spouses.length > 0) {
          suggestedRecipient = spouses[0].name;
          reasoning =
            'Financial assets typically go to spouse for financial security.';
        }
      }

      return {
        bundleId: bundle.id,
        bundleName: bundle.bundle_name,
        suggestedRecipient,
        reasoning,
      };
    });

    // 3. Suggest Executor
    const nonBeneficiaryGuardians = guardians.filter(
      g => !analysis.suggestedBeneficiaries.some(b => b.name === g.name)
    );

    if (nonBeneficiaryGuardians.length > 0) {
      const executor =
        nonBeneficiaryGuardians.find(g =>
          ['sibling', 'brother', 'sister', 'súrodenec', 'brat', 'sestra'].some(
            term => g.relationship.toLowerCase().includes(term)
          )
        ) || nonBeneficiaryGuardians[0];

      analysis.suggestedExecutor = {
        name: executor.name,
        relationship: executor.relationship,
        reasoning:
          'Someone outside direct beneficiaries can handle estate administration objectively.',
      };
    } else if (children.length > 0) {
      analysis.suggestedExecutor = {
        name: children[0].name,
        relationship: children[0].relationship,
        reasoning:
          'Your eldest child can serve as executor if they are responsible adults.',
      };
    }

    // 4. Suggest Guardians for Minor Children
    if (children.length > 0) {
      const potentialChildGuardians = guardians.filter(g =>
        [
          'sibling',
          'brother',
          'sister',
          'súrodenec',
          'brat',
          'sestra',
          'parent',
          'mother',
          'father',
        ].some(term => g.relationship.toLowerCase().includes(term))
      );

      if (potentialChildGuardians.length > 0) {
        analysis.suggestedGuardians = potentialChildGuardians
          .slice(0, 2)
          .map((g, index) => ({
            name: g.name,
            relationship: g.relationship,
            reasoning:
              index === 0
                ? 'Close family member who shares your values and can provide stable home.'
                : 'Backup guardian in case primary guardian cannot serve.',
          }));
      }
    }

    // 5. Identify Missing Information
    if (guardians.length === 0) {
      analysis.missingInfo.push(
        'No guardians/family members found in your account'
      );
    }
    if (bundles.length === 0) {
      analysis.missingInfo.push(
        'No document bundles found - consider organizing your assets'
      );
    }
    if (analysis.suggestedBeneficiaries.length === 0) {
      analysis.missingInfo.push(
        'Unable to identify potential beneficiaries from existing data'
      );
    }

    // 6. Calculate Confidence
    if (
      guardians.length >= 3 &&
      bundles.length >= 2 &&
      analysis.suggestedBeneficiaries.length >= 2
    ) {
      analysis.confidence = 'high';
    } else if (
      guardians.length >= 1 &&
      (bundles.length >= 1 || analysis.suggestedBeneficiaries.length >= 1)
    ) {
      analysis.confidence = 'medium';
    } else {
      analysis.confidence = 'low';
    }

    return analysis;
  };

  const convertAnalysisToWillData = (analysis: DraftAnalysis): WillData => {
    const willData: WillData = {
      testator_data: {
        fullName: currentUser?.name || '',
        citizenship: 'Slovak',
      },
      beneficiaries: analysis.suggestedBeneficiaries.map(b => ({
        id: crypto.randomUUID(),
        name: b.name,
        relationship: b.relationship,
        percentage: b.percentage,
        conditions: '',
      })),
      assets: {
        // We'll let users fill this manually or via vault integration
        realEstate: [],
        vehicles: [],
        bankAccounts: [],
        personalProperty: [],
      },
      executor_data: {
        primaryExecutor: analysis.suggestedExecutor
          ? {
              name: analysis.suggestedExecutor.name,
              relationship: analysis.suggestedExecutor.relationship,
            }
          : undefined,
      },
      guardianship_data: {
        primaryGuardian: analysis.suggestedGuardians?.[0]
          ? {
              name: analysis.suggestedGuardians[0].name,
              relationship: analysis.suggestedGuardians[0].relationship,
            }
          : undefined,
        backupGuardian: analysis.suggestedGuardians?.[1]
          ? {
              name: analysis.suggestedGuardians[1].name,
              relationship: analysis.suggestedGuardians[1].relationship,
            }
          : undefined,
      },
      special_instructions: {},
      legal_data: {},
      review_eligibility: true,
      family_protection_level: 'standard',
      completeness_score: 0,
    };

    return willData;
  };

  const handleAcceptDraft = () => {
    if (analysis) {
      const draftData = convertAnalysisToWillData(analysis);
      onDraftAccepted(draftData);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Initial Choice */}
      {!showAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center space-y-8'
        >
          <div className='space-y-4'>
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto'>
              <Icon name="sparkles" className='w-8 h-8 text-primary' />
            </div>
            <h2 className='text-2xl font-semibold'>
              Sofia's Intelligent Will Assistant
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Would you like me to prepare an intelligent first draft of your
              will based on the information you've already entrusted to me? This
              will save you considerable time, and you can review and modify
              everything afterwards.
            </p>
          </div>

          <Card className='p-6 bg-gradient-to-r from-primary/5 to-blue/5 border-primary/20'>
            <div className='flex items-start gap-4'>
              <Icon
                name="magic-wand"
                className='w-6 h-6 text-primary mt-1'
              />
              <div className='text-left'>
                <h3 className='font-semibold mb-2'>What Sofia Will Analyze:</h3>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>• Your guardians and family relationships</li>
                  <li>• Your document bundles and assets</li>
                  <li>• Intelligent beneficiary suggestions</li>
                  <li>• Logical asset distribution proposals</li>
                  <li>• Executor and guardian recommendations</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              onClick={generateIntelligentDraft}
              disabled={isAnalyzing}
              size='lg'
              className='bg-primary hover:bg-primary-hover text-primary-foreground px-8'
            >
              {isAnalyzing ? (
                <>
                  <Icon
                    name="loader"
                    className='w-5 h-5 mr-2 animate-spin'
                  />
                  Analyzing Your Data...
                </>
              ) : (
                <>
                  <Icon name="sparkles" className='w-5 h-5 mr-2' />
                  Yes, Create Intelligent Draft
                </>
              )}
            </Button>

            <Button
              onClick={onStartFromScratch}
              variant='outline'
              size='lg'
              className='px-8'
            >
              <Icon name="edit" className='w-5 h-5 mr-2' />
              No Thanks, Start from Scratch
            </Button>
          </div>
        </motion.div>
      )}

      {/* Analysis Results */}
      <AnimatePresence>
        {showAnalysis && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-6'
          >
            {/* Header */}
            <div className='text-center space-y-4'>
              <div className='flex items-center justify-center gap-2'>
                <Icon
                  name="check-circle"
                  className='w-6 h-6 text-green-600'
                />
                <h2 className='text-xl font-semibold'>
                  Draft Analysis Complete
                </h2>
                <Badge
                  className={`${
                    analysis?.confidence === 'high'
                      ? 'bg-green-100 text-green-800'
                      : analysis?.confidence === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {analysis?.confidence === 'high'
                    ? 'High Confidence'
                    : analysis?.confidence === 'medium'
                      ? 'Medium Confidence'
                      : 'Low Confidence'}
                </Badge>
              </div>
              <p className='text-muted-foreground'>
                I've prepared your first draft. Here's what I found and suggest:
              </p>
            </div>

            {/* Suggested Beneficiaries */}
            {analysis.suggestedBeneficiaries.length > 0 && (
              <Card className='p-6'>
                <h3 className='font-semibold mb-4 flex items-center gap-2'>
                  <Icon name="users" className='w-5 h-5' />
                  Suggested Beneficiaries
                </h3>
                <div className='space-y-3'>
                  {analysis.suggestedBeneficiaries.map((beneficiary, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-3 p-3 bg-muted/50 rounded'
                    >
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='font-medium'>
                            {beneficiary.name}
                          </span>
                          <Badge variant='secondary'>
                            {beneficiary.relationship}
                          </Badge>
                          <Badge variant='outline'>
                            {beneficiary.percentage}%
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {beneficiary.reasoning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Asset Distribution */}
            {analysis.suggestedAssetDistribution.length > 0 && (
              <Card className='p-6'>
                <h3 className='font-semibold mb-4 flex items-center gap-2'>
                  <Icon name="building-office" className='w-5 h-5' />
                  Asset Distribution Suggestions
                </h3>
                <div className='space-y-3'>
                  {analysis.suggestedAssetDistribution.map((asset, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-3 p-3 bg-muted/50 rounded'
                    >
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='font-medium'>
                            {asset.bundleName}
                          </span>
                          <Icon
                            name="arrow-right"
                            className='w-3 h-3 text-muted-foreground'
                          />
                          <span className='text-primary'>
                            {asset.suggestedRecipient}
                          </span>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {asset.reasoning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Executor & Guardians */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {analysis.suggestedExecutor && (
                <Card className='p-4'>
                  <h4 className='font-semibold mb-2 flex items-center gap-2'>
                    <Icon name="shield-check" className='w-4 h-4' />
                    Suggested Executor
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {analysis.suggestedExecutor.name}
                      </span>
                      <Badge variant='secondary'>
                        {analysis.suggestedExecutor.relationship}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {analysis.suggestedExecutor.reasoning}
                    </p>
                  </div>
                </Card>
              )}

              {analysis.suggestedGuardians &&
                analysis.suggestedGuardians.length > 0 && (
                  <Card className='p-4'>
                    <h4 className='font-semibold mb-2 flex items-center gap-2'>
                      <Icon name="heart" className='w-4 h-4' />
                      Suggested Guardians
                    </h4>
                    <div className='space-y-2'>
                      {analysis.suggestedGuardians.map((guardian, index) => (
                        <div key={index}>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>{guardian.name}</span>
                            <Badge variant='secondary'>
                              {guardian.relationship}
                            </Badge>
                            <Badge variant='outline'>
                              {index === 0 ? 'Primary' : 'Backup'}
                            </Badge>
                          </div>
                          <p className='text-xs text-muted-foreground mt-1'>
                            {guardian.reasoning}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
            </div>

            {/* Missing Information */}
            {analysis.missingInfo.length > 0 && (
              <Card className='p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200'>
                <h3 className='font-semibold mb-4 flex items-center gap-2 text-amber-800 dark:text-amber-200'>
                  <Icon name="alert-triangle" className='w-5 h-5' />
                  Areas to Consider
                </h3>
                <ul className='space-y-2 text-sm text-amber-700 dark:text-amber-300'>
                  {analysis.missingInfo.map((info, index) => (
                    <li key={index} className='flex items-start gap-2'>
                      <span className='text-amber-600'>•</span>
                      {info}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center pt-6'>
              <Button
                onClick={handleAcceptDraft}
                size='lg'
                className='bg-primary hover:bg-primary-hover text-primary-foreground px-8'
              >
                <Icon name="check" className='w-5 h-5 mr-2' />
                Use This Draft as Starting Point
              </Button>

              <Button
                onClick={onStartFromScratch}
                variant='outline'
                size='lg'
                className='px-8'
              >
                <Icon name="edit" className='w-5 h-5 mr-2' />
                Start from Scratch Instead
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
