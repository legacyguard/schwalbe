import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonalityAwareAnimation } from '../animations/PersonalityAwareAnimations';
import { personalityPresets } from '../sofia-firefly/PersonalityPresets';

interface VerificationDocument {
  id: string;
  type: 'license' | 'certification' | 'insurance' | 'education' | 'bar_admission';
  name: string;
  issuer: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  verifiedBy?: string;
  verifiedAt?: Date;
  documentUrl: string;
  notes?: string;
}

interface AttorneyProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string[];
  jurisdiction: string[];
  yearsExperience: number;
  firmName?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationScore: number;
  documents: VerificationDocument[];
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  profilePhoto?: string;
  biography: string;
  languages: string[];
}

interface Review {
  id: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
  serviceType: string;
  helpful: number;
}

interface VerificationCriteria {
  id: string;
  name: string;
  description: string;
  required: boolean;
  weight: number;
  status: 'pending' | 'passed' | 'failed';
  details?: string;
}

export const AttorneyVerificationSystem: React.FC = () => {
  const [attorneys, setAttorneys] = useState<AttorneyProfile[]>([]);
  const [selectedAttorney, setSelectedAttorney] = useState<AttorneyProfile | null>(null);
  const [verificationCriteria, setVerificationCriteria] = useState<VerificationCriteria[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttorneys();
    loadVerificationCriteria();
  }, []);

  const loadAttorneys = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real implementation, fetch from backend
      const mockAttorneys: AttorneyProfile[] = [
        {
          id: '1',
          name: 'Dr. Anna Nováková',
          email: 'anna.novakova@lawfirm.sk',
          phone: '+421 xxx xxx xxx',
          specialty: ['estate_planning', 'family_law', 'inheritance'],
          jurisdiction: ['Slovakia', 'Czech Republic'],
          yearsExperience: 15,
          firmName: 'Nováková & Partners',
          verificationStatus: 'pending',
          verificationScore: 85,
          documents: [
            {
              id: 'd1',
              type: 'license',
              name: 'Legal Practice License',
              issuer: 'Slovak Bar Association',
              number: 'SBA-2008-1234',
              issueDate: new Date('2008-06-15'),
              expiryDate: new Date('2025-06-15'),
              status: 'verified',
              documentUrl: '/documents/license-1.pdf',
              verifiedBy: 'System Admin',
              verifiedAt: new Date()
            }
          ],
          reviews: [
            {
              id: 'r1',
              clientId: 'c1',
              clientName: 'Mária K.',
              rating: 5,
              comment: 'Excellent service for estate planning. Very professional and thorough.',
              date: new Date('2024-08-15'),
              verified: true,
              serviceType: 'Estate Planning',
              helpful: 12
            }
          ],
          averageRating: 4.8,
          totalReviews: 24,
          biography: 'Specialized in estate planning and inheritance law with over 15 years of experience.',
          languages: ['Slovak', 'Czech', 'English']
        }
      ];

      setAttorneys(mockAttorneys);
    } catch (error) {
      console.error('Failed to load attorneys:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationCriteria = () => {
    const criteria: VerificationCriteria[] = [
      {
        id: 'license',
        name: 'Legal Practice License',
        description: 'Valid license to practice law in specified jurisdiction',
        required: true,
        weight: 30,
        status: 'pending'
      },
      {
        id: 'insurance',
        name: 'Professional Liability Insurance',
        description: 'Current professional liability insurance coverage',
        required: true,
        weight: 20,
        status: 'pending'
      },
      {
        id: 'education',
        name: 'Legal Education Credentials',
        description: 'Law degree from accredited institution',
        required: true,
        weight: 15,
        status: 'pending'
      },
      {
        id: 'experience',
        name: 'Relevant Experience',
        description: 'Demonstrated experience in estate planning and family law',
        required: false,
        weight: 15,
        status: 'pending'
      },
      {
        id: 'references',
        name: 'Professional References',
        description: 'References from clients or professional colleagues',
        required: false,
        weight: 10,
        status: 'pending'
      },
      {
        id: 'continuing_education',
        name: 'Continuing Education',
        description: 'Recent continuing education in relevant practice areas',
        required: false,
        weight: 10,
        status: 'pending'
      }
    ];

    setVerificationCriteria(criteria);
  };

  const verifyDocument = async (attorneyId: string, documentId: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      setAttorneys(prev => prev.map(attorney => {
        if (attorney.id === attorneyId) {
          const updatedDocuments = attorney.documents.map(doc => {
            if (doc.id === documentId) {
              return {
                ...doc,
                status,
                notes,
                verifiedBy: 'Current Admin',
                verifiedAt: new Date()
              };
            }
            return doc;
          });

          // Recalculate verification score
          const verificationScore = calculateVerificationScore(updatedDocuments);

          return {
            ...attorney,
            documents: updatedDocuments,
            verificationScore,
            verificationStatus: verificationScore >= 80 ? 'verified' : 'pending'
          };
        }
        return attorney;
      }));
    } catch (error) {
      console.error('Failed to verify document:', error);
    }
  };

  const calculateVerificationScore = (documents: VerificationDocument[]): number => {
    const weights = {
      license: 30,
      insurance: 20,
      education: 15,
      certification: 10,
      bar_admission: 15
    };

    let totalScore = 0;
    let maxScore = 0;

    Object.entries(weights).forEach(([type, weight]) => {
      maxScore += weight;
      const doc = documents.find(d => d.type === type as any);
      if (doc && doc.status === 'verified') {
        totalScore += weight;
      }
    });

    return Math.round((totalScore / maxScore) * 100);
  };

  const filteredAttorneys = attorneys.filter(attorney => {
    if (filter === 'all') return true;
    return attorney.verificationStatus === filter;
  });

  const renderVerificationDetails = (attorney: AttorneyProfile) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Verification Details</h3>
        <div className="flex items-center space-x-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${attorney.verificationScore}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {attorney.verificationScore}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {verificationCriteria.map(criteria => {
          const document = attorney.documents.find(d => d.type === criteria.id as any);
          const isPassed = document?.status === 'verified';
          const isFailed = document?.status === 'rejected';

          return (
            <div key={criteria.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    isPassed ? 'bg-green-500' :
                    isFailed ? 'bg-red-500' :
                    'bg-gray-300'
                  }`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{criteria.name}</h4>
                    <p className="text-sm text-gray-600">{criteria.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {criteria.required && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                      Required
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {criteria.weight}%
                  </span>
                </div>
              </div>

              {document && (
                <div className="mt-3 pl-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{document.name}</p>
                      <p className="text-xs text-gray-500">
                        Issued by {document.issuer} • Expires {document.expiryDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => verifyDocument(attorney.id, document.id, 'verified')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => verifyDocument(attorney.id, document.id, 'rejected')}
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  {document.notes && (
                    <p className="text-xs text-gray-600 mt-1">{document.notes}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderReviewSystem = (attorney: AttorneyProfile) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Reviews & Ratings</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <svg
                key={star}
                className={`w-4 h-4 ${
                  star <= attorney.averageRating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {attorney.averageRating} ({attorney.totalReviews} reviews)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {attorney.reviews.map(review => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{review.clientName}</span>
                {review.verified && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    Verified Client
                  </span>
                )}
                <span className="text-sm text-gray-500">{review.serviceType}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className={`w-3 h-3 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {review.date.toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
            <div className="flex items-center justify-between mt-2">
              <button className="text-xs text-blue-600 hover:text-blue-800">
                Helpful ({review.helpful})
              </button>
              <div className="flex space-x-2">
                <button className="text-xs text-green-600 hover:text-green-800">
                  Approve
                </button>
                <button className="text-xs text-red-600 hover:text-red-800">
                  Flag
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PersonalityAwareAnimation personality={personalityPresets.supportive}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Attorney Verification System</h1>
          <div className="flex space-x-2">
            {(['all', 'pending', 'verified', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Attorneys Pending Review</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading attorneys...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAttorneys.map(attorney => (
                  <motion.div
                    key={attorney.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAttorney?.id === attorney.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAttorney(attorney)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{attorney.name}</h3>
                        <p className="text-sm text-gray-600">{attorney.firmName}</p>
                        <p className="text-xs text-gray-500">
                          {attorney.specialty.join(', ')} • {attorney.yearsExperience} years
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 text-xs rounded ${
                          attorney.verificationStatus === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : attorney.verificationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attorney.verificationStatus}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Score: {attorney.verificationScore}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-6">
            {selectedAttorney ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      {selectedAttorney.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedAttorney.name}</h2>
                    <p className="text-gray-600">{selectedAttorney.firmName}</p>
                    <p className="text-sm text-gray-500">
                      {selectedAttorney.jurisdiction.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  {renderVerificationDetails(selectedAttorney)}
                </div>

                <div className="border-t pt-6">
                  {renderReviewSystem(selectedAttorney)}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Attorney</h3>
                <p className="text-gray-600">Choose an attorney from the list to view verification details and reviews.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PersonalityAwareAnimation>
  );
};

export default AttorneyVerificationSystem;