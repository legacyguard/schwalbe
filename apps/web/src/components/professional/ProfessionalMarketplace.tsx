/**
 * Professional Marketplace
 * Complete marketplace for legal professionals with search, verification, and booking
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import { PersonalityAwareAnimation } from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality
} from '@/components/sofia-firefly/SofiaFireflyPersonality';
import { personalityPresets } from '@/components/sofia-firefly/PersonalityPresets';

interface Professional {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  experience: number;
  location: {
    city: string;
    state: string;
    country: string;
    timezone: string;
  };
  verification: {
    status: 'verified' | 'pending' | 'unverified';
    barNumber?: string;
    jurisdiction: string[];
    verifiedDate?: Date;
    badges: string[];
  };
  rating: {
    average: number;
    count: number;
    breakdown: { [key: number]: number };
  };
  pricing: {
    consultationFee: number;
    hourlyRate: number;
    currency: string;
    acceptsInsurance: boolean;
    paymentMethods: string[];
  };
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    nextAvailable: Date;
    timeSlots: TimeSlot[];
    responseTime: string; // "within 24 hours"
  };
  profile: {
    bio: string;
    education: Education[];
    certifications: string[];
    languages: string[];
    profileImage?: string;
    firmName?: string;
    website?: string;
  };
  reviews: Review[];
  consultationCount: number;
  joinDate: Date;
  lastActive: Date;
}

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  consultationType: 'video' | 'phone' | 'in_person';
  price: number;
}

interface Education {
  institution: string;
  degree: string;
  year: number;
  honors?: string;
}

interface Review {
  id: string;
  clientId: string;
  rating: number;
  comment: string;
  date: Date;
  consultationType: string;
  verified: boolean;
  helpful: number;
  categories: {
    communication: number;
    expertise: number;
    responsiveness: number;
    value: number;
  };
}

interface SearchFilters {
  specialization: string;
  location: string;
  priceRange: { min: number; max: number };
  rating: number;
  availability: 'today' | 'this_week' | 'this_month' | 'any';
  consultationType: 'video' | 'phone' | 'in_person' | 'any';
  language: string;
  verification: boolean;
}

interface Consultation {
  id: string;
  professionalId: string;
  clientId: string;
  type: 'video' | 'phone' | 'in_person';
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  agenda: string;
  documents: string[];
  notes?: string;
  recording?: string;
  followUp: {
    required: boolean;
    scheduledDate?: Date;
    summary?: string;
  };
  payment: {
    amount: number;
    status: 'pending' | 'paid' | 'refunded';
    method: string;
    transactionId?: string;
  };
}

const mockProfessionals: Professional[] = [
  {
    id: 'prof_1',
    name: 'Sarah Chen',
    title: 'Estate Planning Attorney',
    specializations: ['Estate Planning', 'Wills & Trusts', 'Probate Law', 'Elder Law'],
    experience: 12,
    location: { city: 'San Francisco', state: 'CA', country: 'USA', timezone: 'PST' },
    verification: {
      status: 'verified',
      barNumber: 'CA123456',
      jurisdiction: ['California', 'Federal'],
      verifiedDate: new Date('2024-01-15'),
      badges: ['Top Rated', 'Verified Expert', 'Quick Response']
    },
    rating: { average: 4.9, count: 127, breakdown: { 5: 115, 4: 10, 3: 2, 2: 0, 1: 0 } },
    pricing: {
      consultationFee: 350,
      hourlyRate: 450,
      currency: 'USD',
      acceptsInsurance: false,
      paymentMethods: ['Credit Card', 'Bank Transfer', 'Check']
    },
    availability: {
      status: 'available',
      nextAvailable: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      timeSlots: [],
      responseTime: 'within 4 hours'
    },
    profile: {
      bio: 'Specializing in comprehensive estate planning for families and individuals. 12+ years helping clients protect their legacies.',
      education: [
        { institution: 'Stanford Law School', degree: 'JD', year: 2012, honors: 'Magna Cum Laude' },
        { institution: 'UC Berkeley', degree: 'BA Political Science', year: 2009 }
      ],
      certifications: ['Certified Estate Planning Specialist', 'Trust and Estate Law Board Certification'],
      languages: ['English', 'Mandarin', 'Spanish'],
      firmName: 'Chen & Associates Estate Law',
      website: 'https://chenestatelaw.com'
    },
    reviews: [],
    consultationCount: 89,
    joinDate: new Date('2023-06-01'),
    lastActive: new Date()
  },
  {
    id: 'prof_2',
    name: 'Michael Rodriguez',
    title: 'Family Law Attorney',
    specializations: ['Family Law', 'Divorce', 'Child Custody', 'Adoption'],
    experience: 8,
    location: { city: 'Austin', state: 'TX', country: 'USA', timezone: 'CST' },
    verification: {
      status: 'verified',
      barNumber: 'TX789012',
      jurisdiction: ['Texas'],
      verifiedDate: new Date('2024-02-01'),
      badges: ['Family Law Expert', 'Compassionate Advocate']
    },
    rating: { average: 4.7, count: 64, breakdown: { 5: 48, 4: 12, 3: 3, 2: 1, 1: 0 } },
    pricing: {
      consultationFee: 275,
      hourlyRate: 325,
      currency: 'USD',
      acceptsInsurance: true,
      paymentMethods: ['Credit Card', 'Insurance', 'Payment Plan']
    },
    availability: {
      status: 'available',
      nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000),
      timeSlots: [],
      responseTime: 'within 24 hours'
    },
    profile: {
      bio: 'Dedicated to helping families navigate complex legal situations with compassion and expertise.',
      education: [
        { institution: 'UT Law School', degree: 'JD', year: 2016 },
        { institution: 'Texas A&M', degree: 'BS Psychology', year: 2013 }
      ],
      certifications: ['Board Certified Family Law', 'Collaborative Divorce Specialist'],
      languages: ['English', 'Spanish'],
      firmName: 'Rodriguez Family Law'
    },
    reviews: [],
    consultationCount: 45,
    joinDate: new Date('2023-08-15'),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
  }
];

export default function ProfessionalMarketplace() {
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'bookings' | 'reviews' | 'verification'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    specialization: '',
    location: '',
    rating: 0,
    verification: true
  });
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Initialize Sofia personality for professional guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(personalityPresets.professional);

  useEffect(() => {
    adaptToContext('consulting');
  }, [adaptToContext]);

  const filteredProfessionals = professionals.filter(prof => {
    if (searchQuery && !prof.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !prof.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    if (filters.specialization && !prof.specializations.includes(filters.specialization)) {
      return false;
    }
    if (filters.location && !prof.location.city.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.rating && prof.rating.average < filters.rating) {
      return false;
    }
    if (filters.verification && prof.verification.status !== 'verified') {
      return false;
    }
    return true;
  });

  const handleBookConsultation = async (professional: Professional, timeSlot: TimeSlot) => {
    const newConsultation: Consultation = {
      id: `consult_${Date.now()}`,
      professionalId: professional.id,
      clientId: 'current_user',
      type: timeSlot.consultationType,
      scheduledAt: new Date(timeSlot.date.getTime() + parseInt(timeSlot.startTime.split(':')[0]) * 60 * 60 * 1000),
      duration: 60,
      status: 'scheduled',
      agenda: '',
      documents: [],
      followUp: { required: false },
      payment: {
        amount: timeSlot.price,
        status: 'pending',
        method: 'Credit Card'
      }
    };

    setConsultations(prev => [...prev, newConsultation]);
    setShowBookingForm(false);

    learnFromInteraction({
      type: 'consultation_booked',
      duration: 2000,
      context: 'consulting'
    });
  };

  const getAvailabilityColor = (status: Professional['availability']['status']) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'busy': return 'text-yellow-600';
      case 'unavailable': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <PersonalityAwareAnimation personality={personality} context="consulting">
      <div className="w-full space-y-6">
        {/* Header */}
        <LiquidMotion.ScaleIn delay={0.1}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                ⚖️ Professional Marketplace
                <motion.div
                  className="text-sm px-3 py-1 rounded-full bg-blue-500 text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Expert Network
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Connect with verified legal professionals for expert guidance on your family protection needs.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-blue-600">⚖️</div>
                  <div className="font-medium">{professionals.length}</div>
                  <div className="text-sm text-muted-foreground">Verified Attorneys</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-green-600">📅</div>
                  <div className="font-medium">{consultations.length}</div>
                  <div className="text-sm text-muted-foreground">Consultations</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-yellow-600">⭐</div>
                  <div className="font-medium">4.8</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-purple-600">🎯</div>
                  <div className="font-medium">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Tab Navigation */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {[
              { key: 'search', label: 'Find Professionals', icon: '🔍' },
              { key: 'bookings', label: 'My Consultations', icon: '📅' },
              { key: 'reviews', label: 'Reviews & Ratings', icon: '⭐' },
              { key: 'verification', label: 'Verification', icon: '✅' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>
        </LiquidMotion.ScaleIn>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search Filters */}
                <LiquidMotion.ScaleIn delay={0.3}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🔍 Search & Filters
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Search</label>
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or specialization..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Specialization</label>
                          <select
                            value={filters.specialization || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                          >
                            <option value="">All Specializations</option>
                            <option value="Estate Planning">Estate Planning</option>
                            <option value="Family Law">Family Law</option>
                            <option value="Wills & Trusts">Wills & Trusts</option>
                            <option value="Elder Law">Elder Law</option>
                            <option value="Probate Law">Probate Law</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Location</label>
                          <Input
                            value={filters.location || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="City or state..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                          <select
                            value={filters.rating || 0}
                            onChange={(e) => setFilters(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                          >
                            <option value={0}>Any Rating</option>
                            <option value={4}>4+ Stars</option>
                            <option value={4.5}>4.5+ Stars</option>
                            <option value={4.8}>4.8+ Stars</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.verification || false}
                            onChange={(e) => setFilters(prev => ({ ...prev, verification: e.target.checked }))}
                            className="rounded"
                          />
                          <label className="text-sm">Verified only</label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </LiquidMotion.ScaleIn>

                {/* Professional Listings */}
                <div className="lg:col-span-2">
                  <LiquidMotion.ScaleIn delay={0.4}>
                    <div className="space-y-4">
                      {filteredProfessionals.map((professional, index) => (
                        <motion.div
                          key={professional.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => setSelectedProfessional(professional)}>
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                  <span className="text-blue-700 font-bold text-xl">
                                    {professional.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h3 className="font-semibold text-lg flex items-center gap-2">
                                        {professional.name}
                                        {professional.verification.status === 'verified' && (
                                          <span className="text-green-600 text-sm">✅</span>
                                        )}
                                      </h3>
                                      <p className="text-muted-foreground">{professional.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {professional.location.city}, {professional.location.state} • {professional.experience} years
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <div className="flex items-center gap-1 mb-1">
                                        {renderStars(professional.rating.average)}
                                        <span className="text-sm text-muted-foreground ml-1">
                                          ({professional.rating.count})
                                        </span>
                                      </div>
                                      <div className="text-lg font-semibold">
                                        {formatPrice(professional.pricing.consultationFee, professional.pricing.currency)}
                                      </div>
                                      <div className="text-sm text-muted-foreground">consultation</div>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {professional.specializations.slice(0, 3).map(spec => (
                                      <span key={spec} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                        {spec}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm">
                                      <span className={`flex items-center gap-1 ${getAvailabilityColor(professional.availability.status)}`}>
                                        <div className="w-2 h-2 rounded-full bg-current" />
                                        {professional.availability.status}
                                      </span>
                                      <span className="text-muted-foreground">
                                        Next: {professional.availability.nextAvailable.toLocaleDateString()}
                                      </span>
                                      <span className="text-muted-foreground">
                                        Responds {professional.availability.responseTime}
                                      </span>
                                    </div>

                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProfessional(professional);
                                        setShowBookingForm(true);
                                      }}
                                      className="bg-blue-500 hover:bg-blue-600"
                                    >
                                      Book Consultation
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}

                      {filteredProfessionals.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-4xl mb-4">🔍</div>
                          <p>No professionals match your search criteria</p>
                          <p className="text-sm">Try adjusting your filters</p>
                        </div>
                      )}
                    </div>
                  </LiquidMotion.ScaleIn>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📅 My Consultations ({consultations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {consultations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-4">📅</div>
                        <p>No consultations booked yet</p>
                        <p className="text-sm">Book your first consultation to get expert legal guidance</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {consultations.map((consultation, index) => {
                          const professional = professionals.find(p => p.id === consultation.professionalId);
                          return (
                            <motion.div
                              key={consultation.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h3 className="font-medium">{professional?.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {consultation.type} consultation • {consultation.duration} minutes
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-medium ${
                                    consultation.status === 'scheduled' ? 'text-blue-600' :
                                    consultation.status === 'completed' ? 'text-green-600' :
                                    consultation.status === 'cancelled' ? 'text-red-600' :
                                    'text-yellow-600'
                                  }`}>
                                    {consultation.status.toUpperCase()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {consultation.scheduledAt.toLocaleDateString()} at {consultation.scheduledAt.toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  Amount: {formatPrice(consultation.payment.amount, 'USD')}
                                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                    consultation.payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    consultation.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {consultation.payment.status}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  {consultation.status === 'scheduled' && (
                                    <>
                                      <Button size="sm" variant="outline">
                                        Reschedule
                                      </Button>
                                      <Button size="sm" variant="destructive">
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                  {consultation.status === 'completed' && (
                                    <Button size="sm" variant="outline">
                                      Leave Review
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      ⭐ Professional Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-4">⭐</div>
                      <p>Review system coming soon!</p>
                      <p className="text-sm">Rate and review professionals after consultations</p>
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      ✅ Professional Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-medium text-green-800 mb-2">✅ Our Verification Process</h3>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Bar admission verification in all practice jurisdictions</li>
                          <li>• Professional license status confirmation</li>
                          <li>• Educational background verification</li>
                          <li>• Professional liability insurance confirmation</li>
                          <li>• Background check and disciplinary record review</li>
                          <li>• Client testimonial and rating verification</li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {professionals.map(professional => (
                          <div key={professional.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium">{professional.name}</h3>
                              <span className={`px-2 py-1 rounded text-xs ${
                                professional.verification.status === 'verified' ? 'bg-green-100 text-green-800' :
                                professional.verification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {professional.verification.status}
                              </span>
                            </div>

                            {professional.verification.status === 'verified' && (
                              <div className="text-sm space-y-1">
                                <div>Bar #: {professional.verification.barNumber}</div>
                                <div>Jurisdiction: {professional.verification.jurisdiction.join(', ')}</div>
                                <div>Verified: {professional.verification.verifiedDate?.toLocaleDateString()}</div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {professional.verification.badges.map(badge => (
                                    <span key={badge} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Professional Detail Modal */}
        <AnimatePresence>
          {selectedProfessional && !showBookingForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedProfessional(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-2xl">
                          {selectedProfessional.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedProfessional.name}</h2>
                        <p className="text-muted-foreground">{selectedProfessional.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedProfessional.location.city}, {selectedProfessional.location.state}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => setSelectedProfessional(null)}>
                      ✕
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Rating and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderStars(selectedProfessional.rating.average)}
                        <span className="font-medium">{selectedProfessional.rating.average}</span>
                        <span className="text-muted-foreground">({selectedProfessional.rating.count} reviews)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {formatPrice(selectedProfessional.pricing.consultationFee, selectedProfessional.pricing.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">consultation fee</div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <h3 className="font-medium mb-2">About</h3>
                      <p className="text-muted-foreground">{selectedProfessional.profile.bio}</p>
                    </div>

                    {/* Specializations */}
                    <div>
                      <h3 className="font-medium mb-2">Specializations</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfessional.specializations.map(spec => (
                          <span key={spec} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <h3 className="font-medium mb-2">Education</h3>
                      <div className="space-y-2">
                        {selectedProfessional.profile.education.map((edu, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{edu.degree}</div>
                              <div className="text-sm text-muted-foreground">{edu.institution}</div>
                            </div>
                            <div className="text-sm">
                              {edu.year} {edu.honors && `• ${edu.honors}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <h3 className="font-medium mb-2">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfessional.profile.languages.map(lang => (
                          <span key={lang} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowBookingForm(true)}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      size="lg"
                    >
                      Book Consultation
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sofia Guidance */}
        <LiquidMotion.ScaleIn delay={0.5}>
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3"
            animate={{
              boxShadow: [
                '0 0 15px rgba(59, 130, 246, 0.1)',
                '0 0 25px rgba(59, 130, 246, 0.15)',
                '0 0 15px rgba(59, 130, 246, 0.1)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-blue-700 text-sm font-medium">
                ✨ Sofia: "{activeTab === 'search'
                  ? 'Our verified professionals are here to guide your family protection journey. Look for attorneys who specialize in your specific needs and have excellent ratings.'
                  : activeTab === 'bookings'
                    ? 'Your scheduled consultations are important steps in securing your family\'s future. Come prepared with questions and documents for the best outcomes.'
                    : activeTab === 'verification'
                      ? 'We rigorously verify every professional to ensure you receive expert, trustworthy guidance. All attorneys are bar-certified and background-checked.'
                      : 'Professional reviews help our community make informed decisions. Your feedback helps other families find the right legal guidance for their protection needs.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}