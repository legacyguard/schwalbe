
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { Badge } from '@/components/ui/badge';
import type { WillData } from './WillWizard';
import type { WillType } from './WillTypeSelector';
import { useLocalization } from '@/contexts/LocalizationContext';

interface CheckItem {
  actionText?: string;
  description: string;
  id: string;
  onAction?: () => void;
  status: 'error' | 'success' | 'warning';
  title: string;
}

interface SofiaCorrectnessCheckProps {
  onContinue: () => void;
  onGoToStep: (stepId: string) => void;
  willData: WillData;
  willType: WillType;
}

export const SofiaCorrectnessCheck: React.FC<SofiaCorrectnessCheckProps> = ({
  willData,
  willType,
  onContinue,
  onGoToStep,
}) => {
  const { jurisdiction } = useLocalization();

  const performChecks = (): CheckItem[] => {
    const checks: CheckItem[] = [];

    // Check 1: Beneficiaries total percentage
    const totalPercentage = willData.beneficiaries.reduce(
      (sum, b) => sum + b.percentage,
      0
    );
    if (totalPercentage === 100) {
      checks.push({
        id: 'beneficiaries_percentage',
        status: 'success',
        title: 'All your beneficiaries have a total of 100% share',
        description:
          'Perfect! Your inheritance distribution is complete and balanced.',
      });
    } else if (totalPercentage > 100) {
      checks.push({
        id: 'beneficiaries_percentage',
        status: 'error',
        title: `Your beneficiaries exceed 100% (currently ${totalPercentage}%)`,
        description:
          'Please adjust the percentages so they total exactly 100%.',
        actionText: 'Fix Now',
        onAction: () => onGoToStep('beneficiaries'),
      });
    } else if (totalPercentage > 0) {
      checks.push({
        id: 'beneficiaries_percentage',
        status: 'warning',
        title: `Your beneficiaries total only ${totalPercentage}%`,
        description:
          'Consider what happens to the remaining percentage of your estate.',
        actionText: 'Review',
        onAction: () => onGoToStep('beneficiaries'),
      });
    } else {
      checks.push({
        id: 'beneficiaries_percentage',
        status: 'error',
        title: 'No inheritance percentages specified',
        description: 'You need to specify how your assets will be distributed.',
        actionText: 'Add Now',
        onAction: () => onGoToStep('beneficiaries'),
      });
    }

    // Check 2: Forced heirs warning for Slovak/Czech law
    if (jurisdiction === 'Slovakia' || jurisdiction === 'Czech Republic') {
      const hasChildren = willData.beneficiaries.some(
        b => b.relationship === 'child'
      );
      const hasSpouse = willData.beneficiaries.some(
        b => b.relationship === 'spouse'
      );

      if (hasChildren || hasSpouse) {
        checks.push({
          id: 'forced_heirs',
          status: 'warning',
          title: `Important: Forced heirs under ${jurisdiction} law`,
          description: `Your plan respects the mandatory inheritance shares, but remember that children are entitled to at least half of their normal legal share, and spouses to at least one-quarter. This cannot be completely excluded.`,
        });
      }
    }

    // Check 3: Executor appointment
    if (willData.executor_data.primaryExecutor?.name) {
      checks.push({
        id: 'executor',
        status: 'success',
        title: 'You have appointed an executor',
        description: `${willData.executor_data.primaryExecutor.name} will manage your estate.`,
      });
    } else {
      checks.push({
        id: 'executor',
        status: 'warning',
        title: 'No executor appointed',
        description:
          'Consider appointing someone to manage your estate administration.',
        actionText: 'Add Executor',
        onAction: () => onGoToStep('executor'),
      });
    }

    // Check 4: Missing beneficiary addresses
    const beneficiariesMissingInfo = willData.beneficiaries.filter(
      b => !b.name || b.name.trim() === ''
    );
    if (beneficiariesMissingInfo.length > 0) {
      checks.push({
        id: 'beneficiary_info',
        status: 'error',
        title: `Missing information for ${beneficiariesMissingInfo.length} beneficiaries`,
        description: 'All beneficiaries need complete names for legal clarity.',
        actionText: 'Complete Now',
        onAction: () => onGoToStep('beneficiaries'),
      });
    } else {
      checks.push({
        id: 'beneficiary_info',
        status: 'success',
        title: 'All beneficiaries have complete information',
        description: 'Your beneficiaries are properly identified.',
      });
    }

    // Check 5: Personal information completeness
    const { fullName, dateOfBirth, address } = willData.testator_data;
    if (fullName && dateOfBirth && address) {
      checks.push({
        id: 'personal_info',
        status: 'success',
        title: 'Your personal information is complete',
        description: 'All required identification details are provided.',
      });
    } else {
      const missing = [];
      if (!fullName) missing.push('full name');
      if (!dateOfBirth) missing.push('date of birth');
      if (!address) missing.push('address');

      checks.push({
        id: 'personal_info',
        status: 'error',
        title: `Missing personal information: ${missing.join(', ')}`,
        description:
          'Complete personal details are required for legal validity.',
        actionText: 'Complete Now',
        onAction: () => onGoToStep('personal'),
      });
    }

    // Check 6: Will type requirements
    if (willType === 'holographic') {
      checks.push({
        id: 'will_type_requirements',
        status: 'warning',
        title: 'Holographic will requirements',
        description:
          'Remember: You must copy this entire document by hand and sign it yourself. No witnesses needed.',
      });
    } else {
      checks.push({
        id: 'will_type_requirements',
        status: 'warning',
        title: 'Witnessed will requirements',
        description:
          'Remember: You must sign this in the presence of two qualified witnesses who are not beneficiaries.',
      });
    }

    // Check 7: Assets inventory
    const hasAssets =
      willData.assets.realEstate?.length ||
      willData.assets.vehicles?.length ||
      willData.assets.bankAccounts?.length ||
      willData.assets.personalProperty?.length;

    if (hasAssets) {
      checks.push({
        id: 'assets',
        status: 'success',
        title: 'You have documented your assets',
        description:
          'Your asset inventory will help with estate administration.',
      });
    } else {
      checks.push({
        id: 'assets',
        status: 'warning',
        title: 'No specific assets documented',
        description:
          'Consider adding details about your property, accounts, and belongings.',
        actionText: 'Add Assets',
        onAction: () => onGoToStep('assets'),
      });
    }

    return checks;
  };

  const checks = performChecks();
  const hasErrors = checks.some(c => c.status === 'error');
  const errorCount = checks.filter(c => c.status === 'error').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const successCount = checks.filter(c => c.status === 'success').length;

  const getStatusIcon = (status: CheckItem['status']) => {
    switch (status) {
      case 'success':
        return (
          <Icon
            name="check-circle"
            className='w-5 h-5 text-green-600'
          />
        );
      case 'warning':
        return (
          <Icon
            name="alert-circle"
            className='w-5 h-5 text-yellow-600'
          />
        );
      case 'error':
        return (
          <Icon name="x-circle" className='w-5 h-5 text-red-600' />
        );
    }
  };

  const getStatusBadge = (status: CheckItem['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge className='bg-green-100 text-green-800 border-green-200'>
            ✓
          </Badge>
        );
      case 'warning':
        return (
          <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            ⚠
          </Badge>
        );
      case 'error':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200'>✗</Badge>
        );
    }
  };

  return (
    <div className='space-y-6'>
      {/* Sofia Introduction */}
      <Card className='p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'>
        <div className='flex items-start gap-4'>
          <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
            <Icon name="sparkles" className='w-6 h-6 text-primary' />
          </div>
          <div>
            <h3 className='text-xl font-semibold text-blue-900 dark:text-blue-200 mb-2'>
              Sofia's Correctness Check
            </h3>
            <p className='text-blue-800 dark:text-blue-300'>
              I've reviewed your will and created a comprehensive checklist to
              ensure everything is complete and legally sound. Let's make sure
              you haven't missed anything important.
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Statistics */}
      <div className='grid grid-cols-3 gap-4'>
        <Card className='p-4 text-center'>
          <div className='text-2xl font-bold text-green-600'>
            {successCount}
          </div>
          <div className='text-sm text-muted-foreground'>Completed</div>
        </Card>
        <Card className='p-4 text-center'>
          <div className='text-2xl font-bold text-yellow-600'>
            {warningCount}
          </div>
          <div className='text-sm text-muted-foreground'>Warnings</div>
        </Card>
        <Card className='p-4 text-center'>
          <div className='text-2xl font-bold text-red-600'>{errorCount}</div>
          <div className='text-sm text-muted-foreground'>Errors</div>
        </Card>
      </div>

      {/* Detailed Checklist */}
      <div className='space-y-4'>
        {checks.map(check => (
          <Card
            key={check.id}
            className={`p-4 ${
              check.status === 'error'
                ? 'border-red-200 bg-red-50 dark:bg-red-900/20'
                : check.status === 'warning'
                  ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-green-200 bg-green-50 dark:bg-green-900/20'
            }`}
          >
            <div className='flex items-start justify-between'>
              <div className='flex items-start gap-3 flex-1'>
                {getStatusIcon(check.status)}
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    {getStatusBadge(check.status)}
                    <h4 className='font-medium'>{check.title}</h4>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {check.description}
                  </p>
                </div>
              </div>
              {check.onAction && (
                <Button
                  onClick={check.onAction}
                  variant="outline"
                  size='sm'
                  className='ml-4 shrink-0'
                >
                  {check.actionText}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      <Card className='p-6 text-center'>
        {hasErrors ? (
          <div className='mb-4'>
            <Icon
              name="alert-circle"
              className='w-12 h-12 text-red-500 mx-auto mb-4'
            />
            <h3 className='text-lg font-semibold text-red-600 mb-2'>
              Please Fix Errors First
            </h3>
            <p className='text-muted-foreground'>
              Your will has {errorCount} error{errorCount !== 1 ? 's' : ''} that
              need to be resolved before we can generate the final document.
            </p>
          </div>
        ) : (
          <div className='mb-4'>
            <Icon
              name="check-circle"
              className='w-12 h-12 text-green-500 mx-auto mb-4'
            />
            <h3 className='text-lg font-semibold text-green-600 mb-2'>
              Ready to Generate Your Will
            </h3>
            <p className='text-muted-foreground'>
              All critical requirements are met.{' '}
              {warningCount > 0 &&
                `There ${warningCount === 1 ? 'is' : 'are'} ${warningCount} warning${warningCount !== 1 ? 's' : ''} above, but they won't prevent will generation.`}
            </p>
          </div>
        )}

        <Button
          onClick={onContinue}
          disabled={hasErrors}
          size='lg'
          className='bg-primary hover:bg-primary-hover text-primary-foreground px-8'
        >
          <Icon name="arrow-right" className='w-5 h-5 mr-2' />
          Continue to Final Review
        </Button>
      </Card>
    </div>
  );
};
