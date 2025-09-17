
import React from 'react';
import { Icon } from '@/components/ui/icon-library';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { getValidationColor, type ValidationResult } from '@/lib/will-legal-validator';

interface ValidationIndicatorProps {
  className?: string;
  showDetails?: boolean;
  validation: ValidationResult;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  validation,
  showDetails = false,
  className = '',
}) => {
  const getIconName = (level: ValidationResult['level']): string => {
    switch (level) {
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      case 'success':
        return 'check-circle';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const getColorClass = (level: ValidationResult['level']): string => {
    switch (level) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBadgeVariant = (level: ValidationResult['level']) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!showDetails) {
    // Simple icon indicator for inline display
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className={`p-1 h-6 w-6 ${className}`}
          >
            <Icon
              name={getIconName(validation.level) as any}
              className={`w-4 h-4 ${getColorClass(validation.level)}`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80' side='top'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Icon
                name={getIconName(validation.level) as any}
                className={`w-4 h-4 ${getColorClass(validation.level)}`}
              />
              <Badge variant={getBadgeVariant(validation.level)}>
                {validation.level.toUpperCase()}
              </Badge>
            </div>
            <p className='text-sm text-foreground'>{validation.message}</p>
            {validation.autoSuggestion && (
              <div className='mt-3 p-2 bg-muted rounded text-xs'>
                <p className='font-medium mb-1'>Suggestion:</p>
                <p>{validation.autoSuggestion}</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Detailed card display
  return (
    <div
      className={`p-3 rounded-md border ${getValidationColor(validation.level)} ${className}`}
    >
      <div className='flex items-start gap-3'>
        <Icon
          name={getIconName(validation.level) as any}
          className={`w-5 h-5 ${getColorClass(validation.level)} flex-shrink-0 mt-0.5`}
        />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <Badge
              variant={getBadgeVariant(validation.level)}
              className='text-xs'
            >
              {validation.level.toUpperCase()}
            </Badge>
            {validation.field && (
              <span className='text-xs text-muted-foreground'>
                Field: {validation.field}
              </span>
            )}
          </div>
          <p className='text-sm text-foreground'>{validation.message}</p>
          {validation.autoSuggestion && (
            <div className='mt-2 p-2 bg-background/50 rounded text-xs'>
              <p className='font-medium mb-1'>💡 Suggestion:</p>
              <p className='text-muted-foreground'>
                {validation.autoSuggestion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Field-level validation indicator component
interface FieldValidationProps {
  children: React.ReactNode;
  fieldName: string;
  validation?: ValidationResult;
}

export const FieldValidation: React.FC<FieldValidationProps> = ({
  fieldName: _fieldName,
  validation,
  children,
}) => {
  if (!validation) {
    return <>{children}</>;
  }

  return (
    <div className='relative'>
      {children}
      <div className='absolute -right-2 -top-2'>
        <ValidationIndicator validation={validation} />
      </div>
    </div>
  );
};

// Compliance status bar component
interface ComplianceStatusProps {
  className?: string;
  validationResults: ValidationResult[];
}

export const ComplianceStatus: React.FC<ComplianceStatusProps> = ({
  validationResults,
  className = '',
}) => {
  const errors = validationResults.filter(v => v.level === 'error').length;
  const warnings = validationResults.filter(v => v.level === 'warning').length;
  const successes = validationResults.filter(v => v.level === 'success').length;

  const getOverallStatus = () => {
    if (errors > 0)
      return { level: 'error', label: 'Non-Compliant', color: 'bg-red-500' };
    if (warnings > 0)
      return {
        level: 'warning',
        label: 'Partially Compliant',
        color: 'bg-yellow-500',
      };
    if (successes > 0)
      return {
        level: 'success',
        label: 'Fully Compliant',
        color: 'bg-green-500',
      };
    return { level: 'info', label: 'Not Validated', color: 'bg-gray-500' };
  };

  const status = getOverallStatus();

  return (
    <div
      className={`flex items-center gap-4 p-3 border rounded-md bg-card ${className}`}
    >
      <div className='flex items-center gap-2'>
        <div className={`w-3 h-3 rounded-full ${status.color}`} />
        <span className='font-medium text-sm'>{status.label}</span>
      </div>

      <div className='flex items-center gap-4 text-xs text-muted-foreground'>
        {errors > 0 && (
          <div className='flex items-center gap-1'>
            <Icon
              name="alert-circle"
              className='w-3 h-3 text-red-600'
            />
            <span>
              {errors} error{errors !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {warnings > 0 && (
          <div className='flex items-center gap-1'>
            <Icon
              name="alert-triangle"
              className='w-3 h-3 text-yellow-600'
            />
            <span>
              {warnings} warning{warnings !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {successes > 0 && (
          <div className='flex items-center gap-1'>
            <Icon
              name="check-circle"
              className='w-3 h-3 text-green-600'
            />
            <span>{successes} valid</span>
          </div>
        )}
      </div>
    </div>
  );
};
