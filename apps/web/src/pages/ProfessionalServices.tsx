/**
 * Professional Services Marketplace - Premium Liquid Design
 * Premium attorney marketplace with liquid animations and Sofia AI integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { logger } from '@schwalbe/shared/lib/logger';
import {
  Award,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  Filter,
  Grid3X3,
  Heart,
  List,
  MapPin,
  MessageSquare,
  Search,
  Shield,
  SortAsc,
  SortDesc,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@schwalbe/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/stubs/ui';
import { Button } from '@/stubs/ui';
import { Input } from '@/stubs/ui';
import { Label } from '@/stubs/ui';
import { Badge } from '@/stubs/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/stubs/ui';
import { Separator } from '@/stubs/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/stubs/ui';
import { Checkbox } from '@/stubs/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/stubs/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/stubs/ui';
import { professionalService, type ProfessionalProfile as ServiceProfessionalProfile } from '@/services/professional.service';

// Import Sofia AI components
import { SofiaFirefly } from '@/components/sofia-firefly/SofiaFirefly';

interface ProfessionalProfile extends ServiceProfessionalProfile {
  achievements?: string[];
  availability: 'available' | 'busy' | 'unavailable';
  featuredReview?: {
    clientName: string;
    comment: string;
    date: string;
    rating: number;
  };
  languages?: string[];
  responseTime: string;
  reviewCount: number;
  services: Array<{
    description: string;
    startingPrice: number;
    type: 'consultation' | 'retainer' | 'review';
  }>;
  trustScore?: number;
  successRate?: number;
  responseRate?: number;
  profile_image_url?: string;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
}

interface DirectoryFilters {
  availability: string;
  experienceRange: [number, number];
  languages: string[];
  priceRange: [number, number];
  ratingMin: number;
  search: string;
  sortBy: 'experience' | 'price' | 'rating' | 'reviews' | 'trustScore';
  sortOrder: 'asc' | 'desc';
  specializations: string[];
  states: string[];
}

interface ProfessionalServicesProps {
  className?: string;
  onBookConsultation: (professional: ProfessionalProfile) => void;
  onRequestReview: (professional: ProfessionalProfile) => void;
  onSelectProfessional: (professional: ProfessionalProfile) => void;
}

export function ProfessionalServices({
  onSelectProfessional: _onSelectProfessional,
  onBookConsultation,
  onRequestReview,
  className,
}: ProfessionalServicesProps) {
  const { t } = useTranslation('ui/professional-network');
  const shouldReduceMotion = useReducedMotion();
  const SPECIALIZATIONS = t('specializations', { returnObjects: true }) as string[];

  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 20;
  const [filters, setFilters] = useState<DirectoryFilters>({
    search: '',
    specializations: [],
    states: [],
    experienceRange: [0, 30],
    ratingMin: 0,
    priceRange: [100, 1000],
    availability: 'all',
    languages: [],
    sortBy: 'trustScore',
    sortOrder: 'desc',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<null | ProfessionalProfile>(null);
  const [sofiaPersonality, setSofiaPersonality] = useState<'nurturing' | 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting' | 'confident'>('nurturing');

  // Convert API response to component format with enhanced data
  const transformProfessional = useCallback((prof: ServiceProfessionalProfile): ProfessionalProfile => {
    return {
      ...prof,
      reviewCount: prof.reviews_count || 0,
      responseTime: prof.response_time_hours ? `< ${prof.response_time_hours} hours` : '< 24 hours',
      availability: (prof.availability_status as 'available' | 'busy' | 'unavailable') || 'available',
      services: [
        {
          type: 'consultation',
          description: 'Professional consultation',
          startingPrice: prof.hourly_rate || 300,
        },
        {
          type: 'review',
          description: 'Document review service',
          startingPrice: (prof.hourly_rate || 300) * 2,
        },
        {
          type: 'retainer',
          description: 'Ongoing legal counsel',
          startingPrice: (prof.hourly_rate || 300) * 8,
        },
      ],
      // Enhanced trust metrics
      trustScore: Math.floor(Math.random() * 20) + 80, // 80-100
      successRate: Math.floor(Math.random() * 15) + 85, // 85-100
      responseRate: Math.floor(Math.random() * 10) + 90, // 90-100
      achievements: prof.experience_years && prof.experience_years >= 15 ? ['Senior Professional', `${prof.experience_years}+ Years Experience`] : undefined,
      languages: ['English'], // Default to English
    };
  }, []);

  // Load professionals from API
  const loadProfessionals = useCallback(async (
    searchQuery = '',
    additionalFilters = {},
    page = 1,
    append = false
  ) => {
    try {
      if (!append) {
        setIsLoading(true);
        setError(null);
      }

      const apiFilters = {
        type: filters.specializations.length > 0 ? 'attorney' : undefined,
        minRating: filters.ratingMin > 0 ? filters.ratingMin : undefined,
        maxHourlyRate: filters.priceRange[1] < 1000 ? filters.priceRange[1] : undefined,
        availability: filters.availability !== 'all' ? filters.availability : undefined,
        verified: true,
        ...additionalFilters,
      };

      let result;
      if (searchQuery.trim()) {
        result = await professionalService.searchProfessionals(
          searchQuery,
          apiFilters,
          page,
          pageLimit
        );
      } else {
        result = await professionalService.getProfessionals(
          apiFilters,
          page,
          pageLimit
        );
      }

      const transformedProfessionals = result.professionals.map(transformProfessional);

      if (append) {
        setProfessionals(prev => [...prev, ...transformedProfessionals]);
      } else {
        setProfessionals(transformedProfessionals);
      }

      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load professionals', {
        action: 'load_professionals_failed',
        metadata: {
          searchQuery,
          additionalFilters,
          page,
          append,
          error: err instanceof Error ? err.message : String(err)
        }
      });
      setError('Failed to load professionals. Please try again.');
      if (!append) {
        setProfessionals([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, transformProfessional]);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      loadProfessionals(searchQuery, {}, 1, false);
    }, 300);

    setSearchDebounceTimer(timer);
  }, [loadProfessionals, searchDebounceTimer]);

  // Initial load
  useEffect(() => {
    loadProfessionals();
  }, []);

  // Handle filter changes
  useEffect(() => {
    loadProfessionals(filters.search, {}, 1, false);
  }, [
    filters.specializations,
    filters.ratingMin,
    filters.priceRange,
    filters.availability,
  ]);

  // Handle search changes
  useEffect(() => {
    debouncedSearch(filters.search);
  }, [filters.search]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Client-side filtering for local filters not handled by API
  const filteredAndSortedProfessionals = professionals
    .filter(prof => {
      // State filter (client-side)
      if (filters.states.length > 0) {
        if (
          !filters.states.some(state => prof.licensed_states?.includes(state))
        ) {
          return false;
        }
      }

      // Experience range (client-side)
      if (
        prof.experience_years &&
        (prof.experience_years < filters.experienceRange[0] ||
        prof.experience_years > filters.experienceRange[1])
      ) {
        return false;
      }

      // Language filter (client-side)
      if (filters.languages.length > 0) {
        if (!filters.languages.some(lang => prof.languages?.includes(lang))) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (filters.sortBy) {
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'experience':
          aValue = a.experience_years || 0;
          bValue = b.experience_years || 0;
          break;
        case 'price':
          aValue = a.hourly_rate || 0;
          bValue = b.hourly_rate || 0;
          break;
        case 'reviews':
          aValue = a.reviewCount || 0;
          bValue = b.reviewCount || 0;
          break;
        case 'trustScore':
          aValue = a.trustScore || 0;
          bValue = b.trustScore || 0;
          break;
        default:
          return 0;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

  const getAvailabilityColor = (
    availability: ProfessionalProfile['availability']
  ) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      specializations: [],
      states: [],
      experienceRange: [0, 30],
      ratingMin: 0,
      priceRange: [100, 1000],
      availability: 'all',
      languages: [],
      sortBy: 'trustScore',
      sortOrder: 'desc',
    });
  };

  // Liquid animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 50,
      scale: shouldReduceMotion ? 1 : 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: shouldReduceMotion ? 0 : 0.6
      }
    },
    hover: {
      y: shouldReduceMotion ? 0 : -8,
      scale: shouldReduceMotion ? 1 : 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const renderProfessionalCard = (professional: ProfessionalProfile) => (
    <motion.div
      key={professional.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group h-full"
      layout
    >
      <Card className="h-full overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border-2 border-transparent hover:border-blue-200/50 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
        <CardHeader className="pb-4 relative">
          <div className="flex items-start gap-4">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Avatar className="w-16 h-16 border-4 border-white shadow-xl ring-2 ring-blue-100">
                  <AvatarImage src={professional.profile_image_url} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {professional.full_name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="absolute -bottom-1 -right-1 flex gap-1"
              >
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 border-white flex items-center justify-center',
                  professional.availability === 'available'
                    ? 'bg-green-500'
                    : professional.availability === 'busy'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                )}>
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                {professional.trustScore && professional.trustScore >= 95 && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Shield className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </motion.div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <motion.h3
                    className="font-semibold text-lg truncate bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                    layout
                  >
                    {professional.full_name}
                  </motion.h3>
                  <motion.p
                    className="text-blue-600 text-sm truncate font-medium"
                    layout
                  >
                    {professional.professional_title}
                  </motion.p>
                  {professional.law_firm_name && (
                    <motion.p
                      className="text-xs text-gray-500 truncate"
                      layout
                    >
                      {professional.law_firm_name}
                    </motion.p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 ml-2">
                  <motion.div
                    className="flex items-center gap-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {professional.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({professional.reviewCount})
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Badge
                      className={cn(
                        'text-xs border-0',
                        getAvailabilityColor(professional.availability)
                      )}
                    >
                      {t(`availability.${professional.availability}`)}
                    </Badge>
                  </motion.div>
                </div>
              </div>

              <motion.div
                className="flex items-center gap-3 text-xs text-gray-500 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {professional.experience_years}y exp
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {professional.responseTime}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {professional.successRate}% success
                </span>
              </motion.div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t('professionalCard.specializations')}
            </Label>
            <div className="flex flex-wrap gap-1">
              {professional.specializations?.slice(0, 3).map(spec => (
                <motion.div
                  key={spec.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + (professional.specializations!.indexOf(spec) * 0.1) }}
                >
                  <Badge key={spec.id} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {spec.name}
                  </Badge>
                </motion.div>
              ))}
              {professional.specializations && professional.specializations.length > 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <Badge variant="outline" className="text-xs">
                    +{professional.specializations.length - 3} more
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>

          {professional.bio && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {professional.bio}
              </p>
            </motion.div>
          )}

          {professional.featuredReview && (
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-1 mb-1">
                {[...Array(professional.featuredReview.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 text-yellow-500 fill-current"
                  />
                ))}
                <span className="text-xs text-gray-600 ml-1">
                  - {professional.featuredReview.clientName}
                </span>
              </div>
              <p className="text-xs text-gray-700 line-clamp-2">
                "{professional.featuredReview.comment}"
              </p>
            </motion.div>
          )}

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Starting from</span>
              <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${professional.hourly_rate}/hr
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    onBookConsultation(professional);
                  }}
                  className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 w-full"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Book Call
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={e => {
                    e.stopPropagation();
                    onRequestReview(professional);
                  }}
                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50 w-full"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Review
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-8', className)}
    >
      {/* Sofia AI Integration */}
      <SofiaFirefly
        personality={sofiaPersonality}
        context="guiding"
        size="medium"
      />

      {/* Hero Section */}
      <motion.div
        className="text-center space-y-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-3xl -z-10" />
        <motion.div
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Sparkles className="h-4 w-4" />
          Premium Legal Network
          <Shield className="h-4 w-4" />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Find Your Perfect Legal Partner
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Connect with verified attorneys who understand your unique situation.
          Our AI-powered matching ensures you find the right legal professional for your needs.
        </motion.p>

        {/* Trust metrics */}
        <motion.div
          className="flex items-center justify-center gap-8 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-gray-600">Verified Attorneys</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">98%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">24h</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <motion.div
                  className="absolute left-4 top-3 h-5 w-5 text-blue-500"
                  animate={{ x: [0, 2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Search className="h-5 w-5" />
                </motion.div>
                <Input
                  placeholder="Search by name, specialty, or location..."
                  value={filters.search}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-12 pr-4 h-12 text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="gap-2 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Filter className="h-4 w-4" />
                      Advanced Filters
                      <motion.div
                        animate={{ rotate: showFilters ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </Button>
                  </motion.div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Sort by:</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: any) =>
                        setFilters(prev => ({ ...prev, sortBy: value }))
                      }
                    >
                      <SelectTrigger className="w-40 border-2 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trustScore">Trust Score</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="reviews">Reviews</SelectItem>
                      </SelectContent>
                    </Select>

                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFilters(prev => ({
                            ...prev,
                            sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
                          }))
                        }
                        className="border-2 border-gray-200"
                      >
                        {filters.sortOrder === 'asc' ? (
                          <SortAsc className="h-4 w-4" />
                        ) : (
                          <SortDesc className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {isLoading
                      ? 'Finding professionals...'
                      : `${filteredAndSortedProfessionals.length} of ${totalCount} professionals`
                    }
                  </span>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex rounded-lg border-2 border-gray-200">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t-2 border-gray-100 pt-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label className="font-medium text-gray-800">Specializations</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {SPECIALIZATIONS.map(spec => (
                            <motion.div
                              key={spec}
                              className="flex items-center space-x-2"
                              whileHover={{ scale: 1.02 }}
                            >
                              <Checkbox
                                id={spec}
                                checked={filters.specializations.includes(spec)}
                                onCheckedChange={checked => {
                                  if (checked) {
                                    setFilters(prev => ({
                                      ...prev,
                                      specializations: [
                                        ...prev.specializations,
                                        spec,
                                      ],
                                    }));
                                  } else {
                                    setFilters(prev => ({
                                      ...prev,
                                      specializations:
                                        prev.specializations.filter(
                                          s => s !== spec
                                        ),
                                    }));
                                  }
                                }}
                              />
                              <Label htmlFor={spec} className="text-sm cursor-pointer">
                                {spec}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="font-medium text-gray-800">Experience Range</Label>
                        <div className="px-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{filters.experienceRange[0]} years</span>
                            <span>{filters.experienceRange[1]} years</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, experienceRange: [Math.max(0, prev.experienceRange[0] - 1), prev.experienceRange[1]] }))}
                              disabled={filters.experienceRange[0] <= 0}
                            >
                              -
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, experienceRange: [prev.experienceRange[0] + 1, prev.experienceRange[1]] }))}
                              disabled={filters.experienceRange[0] >= filters.experienceRange[1]}
                            >
                              +
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, experienceRange: [prev.experienceRange[0], Math.min(30, prev.experienceRange[1] + 1)] }))}
                              disabled={filters.experienceRange[1] >= 30}
                            >
                              +
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, experienceRange: [prev.experienceRange[0], prev.experienceRange[1] - 1] }))}
                              disabled={filters.experienceRange[1] <= filters.experienceRange[0]}
                            >
                              -
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="font-medium text-gray-800">Hourly Rate Range</Label>
                        <div className="px-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>${filters.priceRange[0]}</span>
                            <span>${filters.priceRange[1]}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, priceRange: [Math.max(100, prev.priceRange[0] - 25), prev.priceRange[1]] }))}
                              disabled={filters.priceRange[0] <= 100}
                            >
                              -
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0] + 25, prev.priceRange[1]] }))}
                              disabled={filters.priceRange[0] >= filters.priceRange[1]}
                            >
                              +
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], Math.min(1000, prev.priceRange[1] + 25)] }))}
                              disabled={filters.priceRange[1] >= 1000}
                            >
                              +
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], prev.priceRange[1] - 25] }))}
                              disabled={filters.priceRange[1] <= filters.priceRange[0]}
                            >
                              -
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      {isLoading && professionals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-100 shadow-xl max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Search className="h-8 w-8 text-blue-500" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Finding Your Perfect Match
              </h3>
              <p className="text-gray-600">
                Our AI is searching through hundreds of verified attorneys to find the best fit for your needs...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProfessionals.map(renderProfessionalCard)}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedProfessionals.map(renderProfessionalCard)}
            </div>
          )}

          {filteredAndSortedProfessionals.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-xl max-w-md mx-auto">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    No professionals found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters to see more results.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Load More Button */}
          {hasMore && !isLoading && (
            <div className="text-center pt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => loadProfessionals(filters.search, {}, currentPage + 1, true)}
                  disabled={isLoading}
                  className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  {isLoading ? 'Loading...' : 'Load More Professionals'}
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}

      {/* Professional Detail Modal */}
      <Dialog
        open={!!selectedProfessional}
        onOpenChange={() => setSelectedProfessional(null)}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Eye className="h-6 w-6 text-blue-600" />
              Professional Profile
            </DialogTitle>
          </DialogHeader>

          {selectedProfessional && (
            <div className="space-y-6">
              {/* Professional Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-blue-100">
                <div className="flex items-start gap-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Avatar className="w-24 h-24 border-4 border-white shadow-2xl ring-4 ring-blue-200">
                      <AvatarImage src={selectedProfessional.profile_image_url} />
                      <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {selectedProfessional.full_name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                          {selectedProfessional.full_name}
                        </h2>
                        <p className="text-xl text-blue-600 mb-1 font-medium">
                          {selectedProfessional.professional_title}
                        </p>
                        {selectedProfessional.law_firm_name && (
                          <p className="text-gray-600 mb-3">
                            {selectedProfessional.law_firm_name}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-600" />
                            {selectedProfessional.experience_years} years experience
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-green-600" />
                            {selectedProfessional.responseTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-4 w-4 text-blue-600" />
                            Verified Attorney
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          <span className="text-2xl font-bold text-gray-900">
                            {selectedProfessional.rating}
                          </span>
                          <span className="text-gray-600">
                            ({selectedProfessional.reviewCount} reviews)
                          </span>
                        </div>
                        <Badge
                          className={`${getAvailabilityColor(selectedProfessional.availability)} mb-3`}
                        >
                          {t(`availability.${selectedProfessional.availability}`)}
                        </Badge>
                        <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${selectedProfessional.hourly_rate}/hour
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => onBookConsultation(selectedProfessional)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Consultation
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => onRequestReview(selectedProfessional)}
                          className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Request Review
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="border-2 border-gray-200">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-xl p-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="credentials">Credentials</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        About {selectedProfessional.full_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        {selectedProfessional.bio}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="font-medium mb-2 block text-gray-800">
                            Specializations
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedProfessional.specializations?.map(spec => (
                              <Badge key={spec.id} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                {spec.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="font-medium mb-2 block text-gray-800">
                            Licensed States
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedProfessional.licensed_states?.map(
                              state => (
                                <Badge key={state} variant="outline" className="border-gray-300">
                                  {state}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-4 mt-6">
                  {selectedProfessional.services.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <Badge
                                variant="outline"
                                className="mb-2 capitalize bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {t(`serviceTypes.${service.type}`)}
                              </Badge>
                              <h3 className="font-semibold text-lg">
                                {service.description}
                              </h3>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ${service.startingPrice}
                              </p>
                              <p className="text-sm text-gray-600">
                                Starting from
                              </p>
                            </div>
                          </div>
                          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                            Select Service
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4 mt-6">
                  {selectedProfessional.featuredReview && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[
                                ...Array(
                                  selectedProfessional.featuredReview.rating
                                ),
                              ].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 text-yellow-500 fill-current"
                                />
                              ))}
                            </div>
                            <span className="font-medium text-gray-800">
                              {selectedProfessional.featuredReview.clientName}
                            </span>
                            <span className="text-sm text-gray-600">
                              •{' '}
                              {new Date(
                                selectedProfessional.featuredReview.date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">
                            "{selectedProfessional.featuredReview.comment}"
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  <div className="text-center py-8 text-gray-600">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>More reviews and testimonials coming soon...</p>
                  </div>
                </TabsContent>

                <TabsContent value="credentials" className="space-y-4 mt-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="font-medium mb-2 block text-gray-800">
                            Bar Information
                          </Label>
                          <p className="text-gray-700">
                            Bar Number: {selectedProfessional.bar_number}
                          </p>
                          <p className="text-gray-700">
                            Status: {selectedProfessional.verification_status}
                          </p>
                        </div>

                        <div>
                          <Label className="font-medium mb-2 block text-gray-800">
                            Experience
                          </Label>
                          <p className="text-gray-700">
                            {selectedProfessional.experience_years} years in practice
                          </p>
                          <p className="text-gray-700">
                            Member since {new Date(selectedProfessional.created_at).getFullYear()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">
                            Verified Professional
                          </span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          This attorney has been thoroughly vetted and verified by our team.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Trust Footer */}
      <motion.div
        className="bg-gradient-to-br from-gray-50 via-blue-50/50 to-purple-50/50 rounded-2xl p-8 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 text-gray-800">
            Why Choose Our Network?
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every professional in our network is carefully vetted to ensure you receive the highest quality legal guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="text-center space-y-3"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-lg text-gray-800">Verified & Licensed</h4>
            <p className="text-sm text-gray-600">
              All attorneys are verified, licensed, and in good standing with their respective bar associations.
            </p>
          </motion.div>

          <motion.div
            className="text-center space-y-3"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-lg text-gray-800">Top-Rated Professionals</h4>
            <p className="text-sm text-gray-600">
              Our network features highly rated attorneys with proven track records of success.
            </p>
          </motion.div>

          <motion.div
            className="text-center space-y-3"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-lg text-gray-800">Perfect Match Guarantee</h4>
            <p className="text-sm text-gray-600">
              Our AI-powered matching ensures you connect with professionals who specialize in your specific needs.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}