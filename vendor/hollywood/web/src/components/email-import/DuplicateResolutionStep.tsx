
/**
 * Duplicate Resolution Step Component
 * UI for resolving duplicate documents during email import
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Copy,
  Edit3,
  FileText,
  HardDrive,
  Info,
  Replace,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type {
  DuplicateMatch,
  DuplicateResolutionChoice,
} from '@/services/duplicateDetectionService';

interface DuplicateResolutionStepProps {
  className?: string;
  duplicates: DuplicateMatch[];
  onResolve: (choices: DuplicateResolutionChoice[]) => void;
  onSkip: () => void;
}

export function DuplicateResolutionStep({
  duplicates,
  onResolve,
  onSkip,
  className,
}: DuplicateResolutionStepProps) {
  const [choices, setChoices] = useState<
    Record<string, DuplicateResolutionChoice>
  >({});
  const [customFilenames, setCustomFilenames] = useState<
    Record<string, string>
  >({});

  // Initialize default choices
  React.useEffect(() => {
    const defaultChoices: Record<string, DuplicateResolutionChoice> = {};
    duplicates.forEach(duplicate => {
      defaultChoices[duplicate.document.id] = {
        documentId: duplicate.document.id,
        action: duplicate.recommendation,
      };
    });
    setChoices(defaultChoices);
  }, [duplicates]);

  const handleChoiceChange = (
    documentId: string,
    action: DuplicateResolutionChoice['action']
  ) => {
    setChoices(prev => ({
      ...prev,
      [documentId]: {
        documentId,
        action,
        ...(action === 'rename' && customFilenames[documentId]
          ? { newFilename: customFilenames[documentId] }
          : {}),
      },
    }));
  };

  const handleFilenameChange = (documentId: string, newFilename: string) => {
    setCustomFilenames(prev => ({
      ...prev,
      [documentId]: newFilename,
    }));

    if (choices[documentId]?.action === 'rename') {
      setChoices(prev => ({
        ...prev,
        [documentId]: {
          documentId,
          action: 'rename',
          newFilename,
        },
      }));
    }
  };

  const handleResolve = () => {
    const resolutionChoices = Object.values(choices);
    onResolve(resolutionChoices);
  };

  const getActionIcon = (action: DuplicateResolutionChoice['action']) => {
    switch (action) {
      case 'skip':
        return <XCircle className='h-4 w-4' />;
      case 'replace':
        return <Replace className='h-4 w-4' />;
      case 'keep_both':
        return <Copy className='h-4 w-4' />;
      case 'rename':
        return <Edit3 className='h-4 w-4' />;
      default:
        return <CheckCircle className='h-4 w-4' />;
    }
  };

  const getActionLabel = (action: DuplicateResolutionChoice['action']) => {
    switch (action) {
      case 'skip':
        return 'Skip Import';
      case 'replace':
        return 'Replace Existing';
      case 'keep_both':
        return 'Keep Both';
      case 'rename':
        return 'Rename & Import';
      default:
        return 'Manual Review';
    }
  };

  const getActionDescription = (
    action: DuplicateResolutionChoice['action']
  ) => {
    switch (action) {
      case 'skip':
        return "Don't import this document";
      case 'replace':
        return 'Replace the existing document with this version';
      case 'keep_both':
        return 'Import both documents';
      case 'rename':
        return 'Import with a different filename';
      default:
        return 'Decide manually';
    }
  };

  const getConfidenceColor = (confidence: 'high' | 'low' | 'medium') => {
    switch (confidence) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const calculateSpaceSavings = () => {
    const skippedDuplicates = duplicates.filter(
      d => choices[d.document.id]?.action === 'skip'
    );
    const totalSize = skippedDuplicates.reduce(
      (sum, d) => sum + d.document.size,
      0
    );
    return {
      count: skippedDuplicates.length,
      size: totalSize,
      sizeFormatted: (totalSize / 1024 / 1024).toFixed(1) + ' MB',
    };
  };

  const spaceSavings = calculateSpaceSavings();

  if (duplicates.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Header */}
      <div className='text-center'>
        <div className='w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <AlertCircle className='h-10 w-10 text-orange-600' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>
          Duplicate Documents Detected
        </h3>
        <p className='text-muted-foreground'>
          We found {duplicates.length} document
          {duplicates.length !== 1 ? 's' : ''} that might already exist in your
          vault. Please choose how to handle each one.
        </p>
      </div>

      {/* Space Savings Summary */}
      {spaceSavings.count > 0 && (
        <Alert className='border-green-200 bg-green-50'>
          <TrendingDown className='h-4 w-4 text-green-600' />
          <AlertTitle className='text-green-800'>Space Savings</AlertTitle>
          <AlertDescription className='text-green-700'>
            By skipping {spaceSavings.count} duplicate
            {spaceSavings.count !== 1 ? 's' : ''}, you'll save{' '}
            {spaceSavings.sizeFormatted} of storage space.
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Documents List */}
      <div className='space-y-4 max-h-96 overflow-y-auto'>
        {duplicates.map(duplicate => {
          const choice = choices[duplicate.document.id];
          const customFilename = customFilenames[duplicate.document.id] || '';

          return (
            <Card key={duplicate.document.id} className='border-orange-200'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-sm font-medium flex items-center gap-2'>
                      <FileText className='h-4 w-4' />
                      {duplicate.document.filename}
                      <Badge
                        className={cn(
                          'text-xs',
                          getConfidenceColor(duplicate?.confidence)
                        )}
                      >
                        {Math.round(duplicate.similarity * 100)}% match
                      </Badge>
                    </CardTitle>
                    <div className='text-xs text-muted-foreground mt-1'>
                      New document from {duplicate.document.metadata.fromEmail}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Document Comparison */}
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  {/* New Document */}
                  <div className='space-y-2'>
                    <h4 className='font-medium text-blue-900'>New Document</h4>
                    <div className='space-y-1 text-xs'>
                      <div className='flex items-center gap-2'>
                        <HardDrive className='h-3 w-3' />
                        {(duplicate.document.size / 1024).toFixed(1)} KB
                      </div>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-3 w-3' />
                        {new Date(
                          duplicate.document.metadata.date
                        ).toLocaleDateString()}
                      </div>
                      <div className='text-muted-foreground'>
                        Subject: {duplicate.document.metadata.subject}
                      </div>
                    </div>
                  </div>

                  {/* Existing Document */}
                  <div className='space-y-2'>
                    <h4 className='font-medium text-gray-900'>
                      Existing Document
                    </h4>
                    <div className='space-y-1 text-xs'>
                      <div className='flex items-center gap-2'>
                        <HardDrive className='h-3 w-3' />
                        {(duplicate.existingDocument.size / 1024).toFixed(1)} KB
                      </div>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-3 w-3' />
                        {duplicate.existingDocument.uploadDate.toLocaleDateString()}
                      </div>
                      <div className='text-muted-foreground'>
                        {duplicate.existingDocument.filename}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Match Reasons */}
                <div className='space-y-2'>
                  <h4 className='font-medium text-sm'>
                    Why this might be a duplicate:
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {duplicate.matchReasons.map((reason, idx) => (
                      <Badge key={idx} variant='outline' className='text-xs'>
                        {reason.description}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Selection */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Choose action:</Label>
                  <div className='grid grid-cols-2 gap-2'>
                    {(['skip', 'replace', 'keep_both', 'rename'] as const).map(
                      action => (
                        <Button
                          key={action}
                          variant={
                            choice?.action === action ? 'default' : 'outline'
                          }
                          size='sm'
                          onClick={() =>
                            handleChoiceChange(duplicate.document.id, action)
                          }
                          className='justify-start h-auto p-3'
                        >
                          <div className='flex items-center gap-2'>
                            {getActionIcon(action)}
                            <div className='text-left'>
                              <div className='font-medium'>
                                {getActionLabel(action)}
                              </div>
                              <div className='text-xs opacity-70'>
                                {getActionDescription(action)}
                              </div>
                            </div>
                          </div>
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Custom Filename Input */}
                {choice?.action === 'rename' && (
                  <div className='space-y-2'>
                    <Label
                      htmlFor={`filename-${duplicate.document.id}`}
                      className='text-sm'
                    >
                      New filename:
                    </Label>
                    <Input
                      id={`filename-${duplicate.document.id}`}
                      value={customFilename}
                      onChange={e =>
                        handleFilenameChange(
                          duplicate.document.id,
                          e.target.value
                        )
                      }
                      placeholder={duplicate.document.filename}
                      className='text-sm'
                    />
                  </div>
                )}

                {/* Recommendation */}
                <Alert className='border-blue-200 bg-blue-50'>
                  <Info className='h-4 w-4 text-blue-600' />
                  <AlertDescription className='text-blue-800 text-sm'>
                    <strong>Recommendation:</strong>{' '}
                    {getActionLabel(duplicate.recommendation)} -{' '}
                    {getActionDescription(duplicate.recommendation)}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''} to
          resolve
        </div>

        <div className='flex gap-3'>
          <Button variant='outline' onClick={onSkip}>
            Skip All Duplicates
          </Button>
          <Button onClick={handleResolve}>Apply Resolution</Button>
        </div>
      </div>
    </motion.div>
  );
}
