
/**
 * Bulk Import Summary Component
 * Shows results and insights after bulk document import
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { BulkImportResult, DocumentType } from '@/types/gmail';

interface BulkImportSummaryProps {
  className?: string;
  onClose: () => void;
  onViewDocuments: () => void;
  result: BulkImportResult;
}

/**
 * BulkImportSummary Component
 * Shows results and insights after bulk document import
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const BulkImportSummary = React.memo(function BulkImportSummary({
  result,
  onViewDocuments,
  onClose,
  className,
}: BulkImportSummaryProps) {
  const { documents, categorizations, timeSaved, protectionIncrease } = result;

  // Calculate category distribution
  const categoryStats = categorizations.reduce(
    (acc, cat) => {
      acc[cat.type] = (acc[cat.type] || 0) + 1;
      return acc;
    },
    {} as Record<DocumentType, number>
  );

  // Calculate family relevance distribution
  const relevanceStats = categorizations.reduce(
    (acc, cat) => {
      acc[cat.familyRelevance] = (acc[cat.familyRelevance] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const getDocumentTypeColor = (type: DocumentType): string => {
    const colors: Record<DocumentType, string> = {
      will: 'bg-purple-100 text-purple-800',
      trust: 'bg-blue-100 text-blue-800',
      insurance: 'bg-green-100 text-green-800',
      bank_statement: 'bg-yellow-100 text-yellow-800',
      investment: 'bg-indigo-100 text-indigo-800',
      property_deed: 'bg-red-100 text-red-800',
      tax_document: 'bg-orange-100 text-orange-800',
      medical: 'bg-pink-100 text-pink-800',
      identification: 'bg-gray-100 text-gray-800',
      other: 'bg-slate-100 text-slate-800',
    };
    return colors[type];
  };

  const getDocumentTypeName = (type: DocumentType): string => {
    const names: Record<DocumentType, string> = {
      will: 'Wills & Testaments',
      trust: 'Trust Documents',
      insurance: 'Insurance Policies',
      bank_statement: 'Bank Statements',
      investment: 'Investment Records',
      property_deed: 'Property Deeds',
      tax_document: 'Tax Documents',
      medical: 'Medical Records',
      identification: 'ID Documents',
      other: 'Other Documents',
    };
    return names[type];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('max-w-4xl mx-auto space-y-6', className)}
    >
      {/* Success Header */}
      <Card className='border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'>
        <CardContent className='p-8'>
          <div className='flex items-center gap-4'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <div className='flex-1'>
              <h2 className='text-2xl font-bold text-green-900 mb-2'>
                Import Successful!
              </h2>
              <p className='text-green-700'>
                {documents.length} documents have been securely imported and
                organized for your family's protection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='text-center'>
          <CardContent className='p-6'>
            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <FileText className='h-6 w-6 text-blue-600' />
            </div>
            <div className='text-3xl font-bold text-blue-900 mb-1'>
              {documents.length}
            </div>
            <div className='text-sm text-muted-foreground'>
              Documents Imported
            </div>
          </CardContent>
        </Card>

        <Card className='text-center'>
          <CardContent className='p-6'>
            <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <Clock className='h-6 w-6 text-purple-600' />
            </div>
            <div className='text-3xl font-bold text-purple-900 mb-1'>
              {timeSaved}min
            </div>
            <div className='text-sm text-muted-foreground'>Time Saved</div>
          </CardContent>
        </Card>

        <Card className='text-center'>
          <CardContent className='p-6'>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <Shield className='h-6 w-6 text-green-600' />
            </div>
            <div className='text-3xl font-bold text-green-900 mb-1'>
              +{protectionIncrease}%
            </div>
            <div className='text-sm text-muted-foreground'>
              Protection Increase
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Categories */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Award className='h-5 w-5' />
            Document Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Object.entries(categoryStats).map(([type, count]) => (
              <div key={type} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Badge
                    className={cn(
                      'text-xs font-medium',
                      getDocumentTypeColor(type as DocumentType)
                    )}
                  >
                    {getDocumentTypeName(type as DocumentType)}
                  </Badge>
                  <span className='text-sm text-muted-foreground'>
                    {count} document{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className='w-20'>
                  <Progress
                    value={(count / documents.length) * 100}
                    className='h-2'
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Family Relevance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Family Protection Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-4'>
            <div className='text-center p-4 bg-red-50 rounded-lg'>
              <div className='text-2xl font-bold text-red-600 mb-1'>
                {relevanceStats['high'] || 0}
              </div>
              <div className='text-sm text-red-700 font-medium'>
                High Priority
              </div>
              <div className='text-xs text-muted-foreground mt-1'>
                Critical for family protection
              </div>
            </div>
            <div className='text-center p-4 bg-yellow-50 rounded-lg'>
              <div className='text-2xl font-bold text-yellow-600 mb-1'>
                {relevanceStats['medium'] || 0}
              </div>
              <div className='text-sm text-yellow-700 font-medium'>
                Medium Priority
              </div>
              <div className='text-xs text-muted-foreground mt-1'>
                Important for organization
              </div>
            </div>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold text-gray-600 mb-1'>
                {relevanceStats['low'] || 0}
              </div>
              <div className='text-sm text-gray-700 font-medium'>
                Low Priority
              </div>
              <div className='text-xs text-muted-foreground mt-1'>
                Supporting documents
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {(relevanceStats['high'] || 0) > 0 && (
              <div className='flex items-start gap-3 p-3 bg-red-50 rounded-lg'>
                <Shield className='h-5 w-5 text-red-600 mt-0.5' />
                <div className='flex-1'>
                  <h4 className='font-medium text-red-900'>
                    Review High-Priority Documents
                  </h4>
                  <p className='text-sm text-red-700 mt-1'>
                    {relevanceStats['high'] || 0} critical documents need your
                    attention. Consider professional legal review for estate
                    planning documents.
                  </p>
                </div>
              </div>
            )}

            {categoryStats.will || categoryStats.trust ? (
              <div className='flex items-start gap-3 p-3 bg-purple-50 rounded-lg'>
                <Award className='h-5 w-5 text-purple-600 mt-0.5' />
                <div className='flex-1'>
                  <h4 className='font-medium text-purple-900'>
                    Consider Professional Review
                  </h4>
                  <p className='text-sm text-purple-700 mt-1'>
                    Estate planning documents benefit from attorney review to
                    ensure legal compliance.
                  </p>
                </div>
              </div>
            ) : null}

            <div className='flex items-start gap-3 p-3 bg-blue-50 rounded-lg'>
              <Users className='h-5 w-5 text-blue-600 mt-0.5' />
              <div className='flex-1'>
                <h4 className='font-medium text-blue-900'>Share with Family</h4>
                <p className='text-sm text-blue-700 mt-1'>
                  Invite trusted family members to access relevant documents for
                  better family protection.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3 p-3 bg-green-50 rounded-lg'>
              <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
              <div className='flex-1'>
                <h4 className='font-medium text-green-900'>
                  Set up Document Monitoring
                </h4>
                <p className='text-sm text-green-700 mt-1'>
                  We'll help you track expiry dates and remind you when
                  documents need updating.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-3 justify-between'>
        <div className='flex-1'>
          <h3 className='font-medium mb-2'>
            Your family's protection level just increased!
          </h3>
          <p className='text-sm text-muted-foreground'>
            These {documents.length} documents are now securely organized and
            accessible to your designated family members when needed.
          </p>
        </div>

        <div className='flex gap-3'>
          <Button variant='outline' onClick={onClose}>
            Continue Later
          </Button>
          <Button
            onClick={onViewDocuments}
            className='bg-blue-600 hover:bg-blue-700'
          >
            View My Documents
            <ArrowRight className='h-4 w-4 ml-2' />
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

// Display name for debugging
BulkImportSummary.displayName = 'BulkImportSummary';
