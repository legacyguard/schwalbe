
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Calendar,
  CheckCircle,
  FileText,
  MapPin,
  Shield,
  Star,
  Verified,
} from 'lucide-react';

export type TrustSealLevel = 'basic' | 'premium' | 'professional' | 'verified';

export interface ProfessionalReview {
  certificateUrl?: string;
  complianceScore: number;
  firmName: string;
  id: string;
  jurisdiction: string;
  licenseNumber?: string;
  professionalName: string;
  professionalTitle: string;
  reviewDate: Date;
  reviewType:
    | 'attorney_review'
    | 'comprehensive_audit'
    | 'notary_certification';
  verified: boolean;
}

interface EnhancedTrustSealProps {
  className?: string;
  jurisdiction: string;
  lastUpdated: Date;
  level: TrustSealLevel;
  professionalReviews?: ProfessionalReview[];
  validationScore?: number;
}

export const EnhancedTrustSeal: React.FC<EnhancedTrustSealProps> = ({
  level,
  jurisdiction,
  lastUpdated,
  professionalReviews = [],
  validationScore = 0,
  className = '',
}) => {
  const getSealColor = () => {
    switch (level) {
      case 'premium':
        return 'from-purple-600 to-indigo-600';
      case 'professional':
        return 'from-blue-600 to-cyan-600';
      case 'verified':
        return 'from-green-600 to-emerald-600';
      case 'basic':
        return 'from-gray-600 to-slate-600';
      default:
        return 'from-gray-600 to-slate-600';
    }
  };

  const getSealTitle = () => {
    switch (level) {
      case 'premium':
        return 'Premium Professional Certification';
      case 'professional':
        return 'Professional Legal Review';
      case 'verified':
        return 'Verified Legal Document';
      case 'basic':
        return 'Legal Template Compliance';
      default:
        return 'Legal Template Compliance';
    }
  };

  const getSealDescription = () => {
    switch (level) {
      case 'premium':
        return `This will has been comprehensively reviewed by multiple legal professionals and certified for ${jurisdiction} jurisdiction with enhanced verification protocols.`;
      case 'professional':
        return `This will has been professionally reviewed and verified by a qualified legal professional for compliance with ${jurisdiction} law.`;
      case 'verified':
        return `This will has been validated against ${jurisdiction} legal requirements with automated and manual verification processes.`;
      case 'basic':
        return `This will template complies with standard ${jurisdiction} legal requirements and formatting guidelines.`;
      default:
        return `This will template complies with standard ${jurisdiction} legal requirements and formatting guidelines.`;
    }
  };

  const getLatestReview = () => {
    if (professionalReviews.length === 0) return null;
    return professionalReviews.sort(
      (a, b) => b.reviewDate.getTime() - a.reviewDate.getTime()
    )[0];
  };

  const latestReview = getLatestReview();

  const renderProfessionalVerification = () => {
    if (!latestReview) return null;

    return (
      <div className='mt-4 p-4 bg-white bg-opacity-10 rounded-lg'>
        <div className='flex items-start space-x-3'>
          <div className='p-2 bg-white bg-opacity-20 rounded-full'>
            <Verified className='h-5 w-5 text-white' />
          </div>
          <div className='flex-1 text-white'>
            <div className='font-semibold'>Professional Verification</div>
            <div className='text-sm opacity-90 mt-1'>
              Reviewed by{' '}
              <span className='font-medium'>
                {latestReview.professionalName}
              </span>
              <br />
              {latestReview.professionalTitle} at {latestReview.firmName}
            </div>
            <div className='flex items-center space-x-4 mt-2 text-xs opacity-80'>
              <div className='flex items-center'>
                <Calendar className='h-3 w-3 mr-1' />
                {latestReview.reviewDate.toLocaleDateString()}
              </div>
              <div className='flex items-center'>
                <Award className='h-3 w-3 mr-1' />
                {latestReview.complianceScore}% Compliance
              </div>
              {latestReview.licenseNumber && (
                <div className='flex items-center'>
                  <FileText className='h-3 w-3 mr-1' />
                  Lic. #{latestReview.licenseNumber}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMultipleProfessionalReviews = () => {
    if (professionalReviews.length <= 1) return null;

    const attorneyReviews = professionalReviews.filter(
      r => r.reviewType === 'attorney_review'
    );
    const notaryReviews = professionalReviews.filter(
      r => r.reviewType === 'notary_certification'
    );
    const comprehensiveReviews = professionalReviews.filter(
      r => r.reviewType === 'comprehensive_audit'
    );

    return (
      <div className='mt-4 space-y-3'>
        <div className='text-white text-sm font-medium'>
          Multi-Professional Verification:
        </div>

        <div className='grid grid-cols-1 gap-2 text-white text-xs'>
          {attorneyReviews.length > 0 && (
            <div className='flex justify-between items-center bg-white bg-opacity-10 px-3 py-2 rounded'>
              <span className='flex items-center'>
                <Shield className='h-3 w-3 mr-2' />
                Attorney Reviews
              </span>
              <Badge variant='secondary' className='text-xs'>
                {attorneyReviews.length} Review
                {attorneyReviews.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}

          {notaryReviews.length > 0 && (
            <div className='flex justify-between items-center bg-white bg-opacity-10 px-3 py-2 rounded'>
              <span className='flex items-center'>
                <FileText className='h-3 w-3 mr-2' />
                Notary Certifications
              </span>
              <Badge variant='secondary' className='text-xs'>
                {notaryReviews.length} Certification
                {notaryReviews.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}

          {comprehensiveReviews.length > 0 && (
            <div className='flex justify-between items-center bg-white bg-opacity-10 px-3 py-2 rounded'>
              <span className='flex items-center'>
                <Award className='h-3 w-3 mr-2' />
                Comprehensive Audits
              </span>
              <Badge variant='secondary' className='text-xs'>
                {comprehensiveReviews.length} Audit
                {comprehensiveReviews.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>

        <div className='text-center mt-3 pt-3 border-t border-white border-opacity-20'>
          <div className='text-white text-xs opacity-80'>
            Average Professional Score:{' '}
            {Math.round(
              professionalReviews.reduce(
                (sum, r) => sum + r.complianceScore,
                0
              ) / professionalReviews.length
            )}
            %
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className={`bg-gradient-to-br ${getSealColor()} p-6 text-white`}>
        {/* Trust Seal Icon */}
        <div className='flex items-center justify-center mb-4'>
          <div className='relative'>
            <div className='p-4 bg-white bg-opacity-20 rounded-full'>
              {level === 'premium' && <Award className='h-12 w-12' />}
              {level === 'professional' && <Star className='h-12 w-12' />}
              {level === 'verified' && <CheckCircle className='h-12 w-12' />}
              {level === 'basic' && <Shield className='h-12 w-12' />}
            </div>

            {/* Verification badges */}
            {professionalReviews.length > 0 && (
              <div className='absolute -top-1 -right-1'>
                <div className='p-1 bg-green-500 rounded-full'>
                  <Verified className='h-4 w-4 text-white' />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seal Title */}
        <div className='text-center mb-4'>
          <h3 className='text-xl font-bold mb-2'>{getSealTitle()}</h3>
          <div className='flex items-center justify-center space-x-4 text-sm opacity-90'>
            <div className='flex items-center'>
              <MapPin className='h-4 w-4 mr-1' />
              {jurisdiction}
            </div>
            <div className='flex items-center'>
              <Calendar className='h-4 w-4 mr-1' />
              {lastUpdated.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Seal Description */}
        <p className='text-center text-sm opacity-90 leading-relaxed mb-4'>
          {getSealDescription()}
        </p>

        {/* Professional Verification */}
        {renderProfessionalVerification()}

        {/* Multiple Professional Reviews */}
        {renderMultipleProfessionalReviews()}

        {/* Validation Score */}
        {validationScore > 0 && (
          <div className='mt-4 pt-4 border-t border-white border-opacity-20'>
            <div className='flex justify-between items-center text-sm'>
              <span>Legal Validation Score</span>
              <span className='font-bold'>{validationScore}%</span>
            </div>
            <div className='mt-2 bg-white bg-opacity-20 rounded-full h-2'>
              <div
                className='bg-white rounded-full h-2 transition-all duration-500'
                style={{ width: `${validationScore}}%` }}
              />
            </div>
          </div>
        )}

        {/* Certificate Link */}
        {latestReview?.certificateUrl && (
          <div className='mt-4 text-center'>
            <a
              href={latestReview.certificateUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-full transition-colors'
            >
              <FileText className='h-4 w-4 mr-2' />
              View Professional Certificate
            </a>
          </div>
        )}
      </div>

      {/* Seal Number/ID */}
      <div className='bg-white p-3 text-center'>
        <div className='text-xs text-gray-600'>
          Seal ID: LSG-{jurisdiction.toUpperCase()}-
          {lastUpdated.getTime().toString().slice(-6)}
          {latestReview && (
            <span className='ml-2 text-green-600 font-medium'>
              • PROFESSIONALLY VERIFIED
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
