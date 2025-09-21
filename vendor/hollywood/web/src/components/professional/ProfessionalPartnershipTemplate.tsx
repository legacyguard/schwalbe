
/**
 * Professional Partnership Agreement Template
 * Template for attorney partnership agreements with LegacyGuard
 */

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Download,
  Scale,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PartnershipTerms {
  commission_rate: number;
  confidentiality_period: number; // years
  liability_limit: number;
  minimum_fee: number;
  payment_terms: number; // days
  response_time_sla: number; // hours
  review_quality_sla: number; // percentage
  termination_notice: number; // days
}

interface ProfessionalPartnershipTemplateProps {
  className?: string;
  lawFirm?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onDownload?: () => void;
  reviewerName: string;
  terms: PartnershipTerms;
}

const DEFAULT_TERMS: PartnershipTerms = {
  commission_rate: 25, // 25% commission
  minimum_fee: 150,
  response_time_sla: 48, // 48 hours to respond
  review_quality_sla: 95, // 95% client satisfaction
  payment_terms: 14, // 14 days
  termination_notice: 30, // 30 days notice
  liability_limit: 50000, // $50,000 liability limit
  confidentiality_period: 5, // 5 years
};

export function ProfessionalPartnershipTemplate({
  reviewerName,
  lawFirm,
  terms = DEFAULT_TERMS,
  onAccept,
  onDecline,
  onDownload,
  className,
}: ProfessionalPartnershipTemplateProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const keyTerms = [
    {
      icon: DollarSign,
      label: 'Commission Rate',
      value: `${terms.commission_rate}%`,
      description: 'Of each successful review fee',
    },
    {
      icon: CheckCircle,
      label: 'Response Time',
      value: `${terms.response_time_sla}h`,
      description: 'Maximum time to accept/decline reviews',
    },
    {
      icon: Scale,
      label: 'Quality Standard',
      value: `${terms.review_quality_sla}%`,
      description: 'Minimum client satisfaction rating',
    },
    {
      icon: Shield,
      label: 'Payment Terms',
      value: `${terms.payment_terms} days`,
      description: 'Payment processing time',
    },
  ];

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className='text-center mb-8'>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className='flex items-center justify-center gap-3 mb-4'
        >
          <Scale className='h-8 w-8 text-blue-600' />
          <h1 className='text-3xl font-bold text-gray-900'>
            Professional Partnership Agreement
          </h1>
        </motion.div>
        <p className='text-lg text-gray-600'>
          LegacyGuard Professional Network Partnership Terms
        </p>
        <div className='flex items-center justify-center gap-4 mt-4'>
          <Badge
            variant="outline"
            className='bg-blue-50 text-blue-700 border-blue-200'
          >
            Attorney: {reviewerName}
          </Badge>
          {lawFirm && (
            <Badge
              variant="outline"
              className='bg-green-50 text-green-700 border-green-200'
            >
              Firm: {lawFirm}
            </Badge>
          )}
        </div>
      </div>

      {/* Key Terms Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {keyTerms.map((term, index) => (
          <motion.div
            key={term.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3'>
                  <term.icon className='h-6 w-6 text-blue-600' />
                </div>
                <div className='text-2xl font-bold text-gray-900 mb-1'>
                  {term.value}
                </div>
                <div className='font-medium text-gray-700 mb-1'>
                  {term.label}
                </div>
                <div className='text-sm text-gray-500'>{term.description}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Agreement Sections */}
      <Card className='shadow-lg'>
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='compensation'>Compensation</TabsTrigger>
            <TabsTrigger value='responsibilities'>Responsibilities</TabsTrigger>
            <TabsTrigger value='terms'>Terms</TabsTrigger>
            <TabsTrigger value='signature'>Signature</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='p-6'>
            <div className='space-y-6'>
              <div>
                <h3 className='text-xl font-semibold mb-4'>
                  Partnership Overview
                </h3>
                <div className='prose max-w-none text-gray-700'>
                  <p>
                    This Professional Partnership Agreement ("Agreement") is
                    entered into between LegacyGuard Technologies, Inc.
                    ("LegacyGuard") and {reviewerName}
                    {lawFirm && ` of ${lawFirm}`} ("Professional") for the
                    provision of legal document review services to LegacyGuard
                    clients.
                  </p>

                  <h4 className='text-lg font-semibold mt-6 mb-3'>Purpose</h4>
                  <p>
                    LegacyGuard operates a platform that helps families protect
                    their legacy through secure document management and
                    professional legal guidance. Professional agrees to provide
                    high-quality legal document review services to LegacyGuard
                    clients in accordance with the terms set forth in this
                    Agreement.
                  </p>

                  <h4 className='text-lg font-semibold mt-6 mb-3'>
                    Service Categories
                  </h4>
                  <ul className='list-disc ml-6 space-y-2'>
                    <li>
                      <strong>Basic Review:</strong> Essential legal compliance
                      and formatting review
                    </li>
                    <li>
                      <strong>Comprehensive Review:</strong> Detailed analysis
                      with recommendations
                    </li>
                    <li>
                      <strong>Certified Review:</strong> Attorney-certified
                      review with legal opinions
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='compensation' className='p-6'>
            <div className='space-y-6'>
              <h3 className='text-xl font-semibold'>Compensation Structure</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card className='bg-green-50 border-green-200'>
                  <CardHeader>
                    <CardTitle className='text-green-800 flex items-center gap-2'>
                      <DollarSign className='h-5 w-5' />
                      Commission Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex justify-between'>
                        <span>Commission Rate:</span>
                        <span className='font-semibold'>
                          {terms.commission_rate}%
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Minimum Fee:</span>
                        <span className='font-semibold'>
                          {formatCurrency(terms.minimum_fee)}
                        </span>
                      </div>
                      <Separator />
                      <div className='text-sm text-green-700'>
                        <p>
                          <strong>Example:</strong> For a $500 review, you earn
                          ${500 * (terms.commission_rate / 100)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className='bg-blue-50 border-blue-200'>
                  <CardHeader>
                    <CardTitle className='text-blue-800 flex items-center gap-2'>
                      <CheckCircle className='h-5 w-5' />
                      Payment Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='flex justify-between'>
                        <span>Payment Schedule:</span>
                        <span className='font-semibold'>
                          Every {terms.payment_terms} days
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Payment Method:</span>
                        <span className='font-semibold'>ACH/Wire Transfer</span>
                      </div>
                      <Separator />
                      <div className='text-sm text-blue-700'>
                        <p>
                          Payments processed automatically after review
                          completion
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h4 className='font-semibold mb-2'>
                  Additional Compensation Opportunities
                </h4>
                <ul className='text-sm text-gray-700 space-y-1'>
                  <li>
                    • Bonus payments for exceptional client satisfaction scores
                  </li>
                  <li>
                    • Higher commission rates after 50+ successful reviews
                  </li>
                  <li>• Priority assignment for preferred review types</li>
                  <li>
                    • Referral bonuses for bringing new professional reviewers
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='responsibilities' className='p-6'>
            <div className='space-y-6'>
              <h3 className='text-xl font-semibold'>
                Professional Responsibilities
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-semibold text-green-800 mb-3 flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5' />
                    Quality Standards
                  </h4>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-start gap-2'>
                      <span className='font-medium'>•</span>
                      Maintain {terms.review_quality_sla}% minimum client
                      satisfaction rating
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='font-medium'>•</span>
                      Provide thorough, accurate legal analysis within scope
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='font-medium'>•</span>
                      Deliver reviews within agreed timeframes
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='font-medium'>•</span>
                      Communicate clearly with clients when needed
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className='font-semibold text-blue-800 mb-3 flex items-center gap-2'>
                    <Scale className='h-5 w-5' />
                    Professional Standards
                  </h4>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-start gap-2'>
                      <span className='font-medium'>•</span>
                      Maintain active bar license in good standing
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='font-medium'>•</span>
                      Carry professional liability insurance
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='font-medium'>•</span>
                      Adhere to attorney-client privilege requirements
                    </li>
                    <li className='flex items-start gap-2'>
                      <span className='font-medium'>•</span>
                      Follow all applicable legal ethics rules
                    </li>
                  </ul>
                </div>
              </div>

              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <AlertTriangle className='h-5 w-5 text-yellow-600 mt-0.5' />
                  <div>
                    <h5 className='font-semibold text-yellow-800 mb-1'>
                      Response Time Requirements
                    </h5>
                    <p className='text-sm text-yellow-700'>
                      Professional must respond to new review requests within{' '}
                      {terms.response_time_sla} hours. Failure to maintain
                      response times may result in reduced review assignments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='terms' className='p-6'>
            <div className='space-y-6'>
              <h3 className='text-xl font-semibold'>Terms and Conditions</h3>

              <div className='space-y-6'>
                <div>
                  <h4 className='font-semibold mb-3'>
                    Agreement Duration and Termination
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg text-sm'>
                    <ul className='space-y-2'>
                      <li>
                        • This agreement remains in effect until terminated by
                        either party
                      </li>
                      <li>
                        • Either party may terminate with{' '}
                        {terms.termination_notice} days written notice
                      </li>
                      <li>
                        • LegacyGuard may terminate immediately for breach of
                        quality standards
                      </li>
                      <li>
                        • All pending reviews must be completed before
                        termination takes effect
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold mb-3'>
                    Confidentiality and Data Protection
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg text-sm'>
                    <ul className='space-y-2'>
                      <li>
                        • All client documents and information are strictly
                        confidential
                      </li>
                      <li>
                        • Professional must use secure, encrypted systems for
                        document access
                      </li>
                      <li>
                        • Confidentiality obligations survive for{' '}
                        {terms.confidentiality_period} years after termination
                      </li>
                      <li>
                        • Professional may not retain copies of client documents
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold mb-3'>
                    Liability and Insurance
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg text-sm'>
                    <ul className='space-y-2'>
                      <li>
                        • Professional maintains full responsibility for legal
                        opinions provided
                      </li>
                      <li>
                        • LegacyGuard's liability is limited to{' '}
                        {formatCurrency(terms.liability_limit)} per incident
                      </li>
                      <li>
                        • Professional must maintain professional liability
                        insurance
                      </li>
                      <li>
                        • Each party indemnifies the other for their respective
                        actions
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold mb-3'>Intellectual Property</h4>
                  <div className='bg-gray-50 p-4 rounded-lg text-sm'>
                    <ul className='space-y-2'>
                      <li>
                        • Professional retains rights to their legal analysis
                        and opinions
                      </li>
                      <li>
                        • LegacyGuard retains rights to platform technology and
                        processes
                      </li>
                      <li>
                        • Review templates may be shared with client permission
                      </li>
                      <li>
                        • Neither party may use the other's trademarks without
                        permission
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='signature' className='p-6'>
            <div className='space-y-6'>
              <h3 className='text-xl font-semibold'>Agreement Acceptance</h3>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
                <div className='flex items-start gap-4'>
                  <Scale className='h-8 w-8 text-blue-600 mt-1' />
                  <div>
                    <h4 className='font-semibold text-blue-900 mb-2'>
                      Ready to Join Our Professional Network?
                    </h4>
                    <p className='text-blue-800 mb-4'>
                      By accepting this agreement, you confirm that you have
                      read, understood, and agree to all terms and conditions
                      outlined above. You also confirm that you are authorized
                      to enter into this agreement.
                    </p>

                    <div className='text-sm text-blue-700 mb-4'>
                      <strong>Professional Confirmations:</strong>
                      <ul className='list-disc ml-6 mt-2 space-y-1'>
                        <li>Active bar license in good standing</li>
                        <li>Professional liability insurance coverage</li>
                        <li>Commitment to quality service standards</li>
                        <li>Understanding of confidentiality requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between pt-6 border-t'>
                <div className='flex gap-3'>
                  {onDownload && (
                    <Button
                      variant="outline"
                      onClick={onDownload}
                      className='flex items-center gap-2'
                    >
                      <Download className='h-4 w-4' />
                      Download PDF
                    </Button>
                  )}
                </div>

                <div className='flex gap-3'>
                  {onDecline && (
                    <Button
                      variant="outline"
                      onClick={onDecline}
                      className='text-gray-600 hover:text-red-600'
                    >
                      Decline
                    </Button>
                  )}
                  {onAccept && (
                    <Button
                      onClick={onAccept}
                      className='bg-green-600 hover:bg-green-700 flex items-center gap-2'
                    >
                      <CheckCircle className='h-4 w-4' />
                      Accept Agreement
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
