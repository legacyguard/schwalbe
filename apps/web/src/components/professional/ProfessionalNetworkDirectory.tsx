/**
 * Professional Network Directory
 * Comprehensive directory of verified legal professionals
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  List,
  MapPin,
  MessageSquare,
  Search,
  Shield,
  SortAsc,
  SortDesc,
  Star,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@schwalbe/ui/card';
import { Button } from '@schwalbe/ui/button';
import { Input } from '@schwalbe/ui/input';
import { Label } from '@schwalbe/ui/label';
import { Badge } from '@schwalbe/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@schwalbe/ui/avatar';
import { Separator } from '@schwalbe/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@schwalbe/ui/select';
import { Checkbox } from '@schwalbe/ui/checkbox';
import { Slider } from '@schwalbe/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@schwalbe/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/stubs/ui';
import { cn } from '@schwalbe/lib/utils';
import { professionalService, type ProfessionalProfile as ServiceProfessionalProfile } from '@/services/professional.service';
import type { ProfessionalReviewer } from '@schwalbe/types/professional';

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
}

interface DirectoryFilters {
  availability: string;
  experienceRange: [number, number];
  languages: string[];
  priceRange: [number, number];
  ratingMin: number;
  search: string;
  sortBy: 'experience' | 'price' | 'rating' | 'reviews';
  sortOrder: 'asc' | 'desc';
  specializations: string[];
  states: string[];
}

interface ProfessionalNetworkDirectoryProps {
  className?: string;
  onBookConsultation: (professional: ProfessionalProfile) => void;
  onRequestReview: (professional: ProfessionalProfile) => void;
  onSelectProfessional: (professional: ProfessionalProfile) => void;
}


export function ProfessionalNetworkDirectory({
  onSelectProfessional: _onSelectProfessional,
  onBookConsultation,
  onRequestReview,
  className,
}: ProfessionalNetworkDirectoryProps) {
  const { t } = useTranslation('ui/professional-network');
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
    sortBy: 'rating',
    sortOrder: 'desc',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfessional, setSelectedProfessional] =
    useState<null | ProfessionalProfile>(null);

  // Convert API response to component format
  const transformProfessional = useCallback((prof: ServiceProfessionalProfile): ProfessionalProfile => {
    return {
      ...prof,
      reviewCount: prof.reviews_count || 0,
      responseTime: prof.response_time_hours ? `< ${prof.response_time_hours} hours` : '< 24 hours',
      availability: (prof.availability_status as 'available' | 'busy' | 'away') || 'available',
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
      // Mock additional fields that aren't in the API yet
      achievements: prof.experience_years >= 15 ? ['Senior Professional', `${prof.experience_years}+ Years Experience`] : undefined,
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
      console.error('Failed to load professionals:', err);
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
        prof.experience_years < filters.experienceRange[0] ||
        prof.experience_years > filters.experienceRange[1]
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
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  };

  const renderProfessionalCard = (professional: ProfessionalProfile) => (
    <motion.div
      key={professional.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='group'
    >
      <Card
        className='h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer'
        onClick={() => setSelectedProfessional(professional)}
      >
        <CardHeader className='pb-4'>
          <div className='flex items-start gap-4'>
            <div className='relative'>
              <Avatar className='w-16 h-16 border-2 border-white shadow-lg'>
                <AvatarImage src={professional.profile_image_url} />
                <AvatarFallback className='text-lg font-semibold'>
                  {professional.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white',
                  professional.availability === 'available'
                    ? 'bg-green-500'
                    : professional.availability === 'busy'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                )}
              />
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between mb-2'>
                <div className='min-w-0 flex-1'>
                  <h3 className='font-semibold text-lg truncate'>
                    {professional.full_name}
                  </h3>
                  <p className='text-muted-foreground text-sm truncate'>
                    {professional.professional_title}
                  </p>
                  {professional.law_firm_name && (
                    <p className='text-xs text-muted-foreground truncate'>
                      {professional.law_firm_name}
                    </p>
                  )}
                </div>

                <div className='flex flex-col items-end gap-1 ml-2'>
                  <div className='flex items-center gap-1'>
                    <Star className='h-4 w-4 text-yellow-500 fill-current' />
                    <span className='text-sm font-medium'>
                      {professional.rating}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      ({professional.reviewCount})
                    </span>
                  </div>
                  <Badge
                    className={getAvailabilityColor(professional.availability)}
                    variant='outline'
                  >
                    {t(`availability.${professional.availability}`)}
                  </Badge>
                </div>
              </div>

              <div className='flex items-center gap-3 text-xs text-muted-foreground mb-3'>
                <span className='flex items-center gap-1'>
                  <Award className='h-3 w-3' />
                  {professional.experience_years} {t('professionalCard.yearsAbbr')}
                </span>
                <span className='flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  {professional.responseTime}
                </span>
                <span className='flex items-center gap-1'>
                  <MapPin className='h-3 w-3' />
                  {(professional.licensed_states?.length || 0) !== 1
                    ? t('professionalCard.statesCountPlural', { count: professional.licensed_states?.length || 0 })
                    : t('professionalCard.statesCount', { count: professional.licensed_states?.length || 0 })
                  }
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div>
            <Label className='text-sm font-medium mb-2 block'>
              {t('professionalCard.specializations')}
            </Label>
            <div className='flex flex-wrap gap-1'>
              {professional.specializations.slice(0, 3).map(spec => (
                <Badge key={spec.id} variant='secondary' className='text-xs'>
                  {spec.name}
                </Badge>
              ))}
              {professional.specializations.length > 3 && (
                <Badge variant='outline' className='text-xs'>
                  {t('professionalCard.more', { count: professional.specializations.length - 3 })}
                </Badge>
              )}
            </div>
          </div>

          {professional.bio && (
            <div>
              <p className='text-sm text-muted-foreground line-clamp-2'>
                {professional.bio}
              </p>
            </div>
          )}

          {professional.featuredReview && (
            <div className='bg-blue-50 rounded-lg p-3'>
              <div className='flex items-center gap-1 mb-1'>
                {[...Array(professional.featuredReview.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className='h-3 w-3 text-yellow-500 fill-current'
                  />
                ))}
                <span className='text-xs text-muted-foreground ml-1'>
                  - {professional.featuredReview.clientName}
                </span>
              </div>
              <p className='text-xs text-muted-foreground line-clamp-2'>
                "{professional.featuredReview.comment}"
              </p>
            </div>
          )}

          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>{t('professionalCard.startingFrom')}</span>
              <span className='font-semibold'>
                ${professional.hourly_rate}{t('professionalCard.perHour')}
              </span>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <Button
                size='sm'
                onClick={e => {
                  e.stopPropagation();
                  onBookConsultation(professional);
                }}
                className='text-xs'
              >
                <Calendar className='h-3 w-3 mr-1' />
                {t('professionalCard.bookCall')}
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={e => {
                  e.stopPropagation();
                  onRequestReview(professional);
                }}
                className='text-xs'
              >
                <FileText className='h-3 w-3 mr-1' />
                {t('professionalCard.review')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderProfessionalListItem = (professional: ProfessionalProfile) => (
    <motion.div
      key={professional.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='group'
    >
      <Card
        className='hover:shadow-lg transition-all duration-300 border hover:border-blue-200 cursor-pointer'
        onClick={() => setSelectedProfessional(professional)}
      >
        <CardContent className='p-6'>
          <div className='flex items-start gap-6'>
            <div className='relative flex-shrink-0'>
              <Avatar className='w-20 h-20 border-2 border-white shadow-lg'>
                <AvatarImage src={professional.profile_image_url} />
                <AvatarFallback className='text-xl font-semibold'>
                  {professional.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white',
                  professional.availability === 'available'
                    ? 'bg-green-500'
                    : professional.availability === 'busy'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                )}
              />
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between mb-3'>
                <div className='min-w-0 flex-1'>
                  <h3 className='font-semibold text-xl mb-1'>
                    {professional.full_name}
                  </h3>
                  <p className='text-muted-foreground mb-1'>
                    {professional.professional_title}
                  </p>
                  {professional.law_firm_name && (
                    <p className='text-sm text-muted-foreground mb-2'>
                      {professional.law_firm_name}
                    </p>
                  )}

                  <div className='flex items-center gap-4 text-sm text-muted-foreground mb-3'>
                    <span className='flex items-center gap-1'>
                      <Award className='h-4 w-4' />
                      {t('listView.yearsExperience', { count: professional.experience_years })}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      {t('listView.respondsIn', { time: professional.responseTime })}
                    </span>
                    <span className='flex items-center gap-1'>
                      <MapPin className='h-4 w-4' />
                      {professional.licensed_states?.join(', ') ||
                        t('listView.noStatesListed')}
                    </span>
                  </div>

                  {professional.bio && (
                    <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>
                      {professional.bio}
                    </p>
                  )}

                  <div className='flex flex-wrap gap-1 mb-3'>
                    {professional.specializations.map(spec => (
                      <Badge
                        key={spec.id}
                        variant='secondary'
                        className='text-xs'
                      >
                        {spec.name}
                      </Badge>
                    ))}
                  </div>

                  {professional.achievements &&
                    professional.achievements.length > 0 && (
                      <div className='flex flex-wrap gap-1'>
                        {professional.achievements
                          .slice(0, 2)
                          .map(achievement => (
                            <Badge
                              key={achievement}
                              variant='outline'
                              className='text-xs'
                            >
                              <Award className='h-2 w-2 mr-1' />
                              {achievement}
                            </Badge>
                          ))}
                      </div>
                    )}
                </div>

                <div className='flex flex-col items-end gap-3 ml-4'>
                  <div className='text-right'>
                    <div className='flex items-center gap-1 mb-1'>
                      <Star className='h-4 w-4 text-yellow-500 fill-current' />
                      <span className='text-lg font-bold'>
                        {professional.rating}
                      </span>
                      <span className='text-sm text-muted-foreground'>
                        ({professional.reviewCount})
                      </span>
                    </div>
                    <Badge
                      className={getAvailabilityColor(
                        professional.availability
                      )}
                    >
                      {t(`availability.${professional.availability}`)}
                    </Badge>
                  </div>

                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>
                      {t('professionalCard.startingFrom')}
                    </p>
                    <p className='text-xl font-bold'>
                      ${professional.hourly_rate}{t('professionalCard.perHour')}
                    </p>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={e => {
                        e.stopPropagation();
                        onBookConsultation(professional);
                      }}
                    >
                      <Calendar className='h-4 w-4 mr-2' />
                      {t('professionalCard.bookConsultation')}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={e => {
                        e.stopPropagation();
                        onRequestReview(professional);
                      }}
                    >
                      <FileText className='h-4 w-4 mr-2' />
                      {t('professionalCard.requestReview')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Header */}
      <div className='text-center space-y-4'>
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium'>
          <Shield className='h-4 w-4' />
          {t('header.badge')}
        </div>
        <h2 className='text-3xl font-bold'>{t('header.title')}</h2>
        <p className='text-muted-foreground max-w-2xl mx-auto'>
          {t('header.description')}
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='space-y-6'>
            {/* Search Bar */}
            <div className='relative'>
              <Search className='absolute left-4 top-3 h-5 w-5 text-muted-foreground' />
              <Input
                placeholder={t('search.placeholder')}
                value={filters.search}
                onChange={e =>
                  setFilters(prev => ({ ...prev, search: e.target.value }))
                }
                className='pl-12 pr-4 h-12 text-lg'
              />
            </div>

            {/* Filter Controls */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <Button
                  variant='outline'
                  onClick={() => setShowFilters(!showFilters)}
                  className='gap-2'
                >
                  <Filter className='h-4 w-4' />
                  {t('search.advancedFilters')}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      showFilters && 'rotate-180'
                    )}
                  />
                </Button>

                <div className='flex items-center gap-2'>
                  <Label className='text-sm'>{t('sorting.label')}</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: any) =>
                      setFilters(prev => ({ ...prev, sortBy: value }))
                    }
                  >
                    <SelectTrigger className='w-32'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='rating'>{t('sorting.options.rating')}</SelectItem>
                      <SelectItem value='experience'>{t('sorting.options.experience')}</SelectItem>
                      <SelectItem value='price'>{t('sorting.options.price')}</SelectItem>
                      <SelectItem value='reviews'>{t('sorting.options.reviews')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setFilters(prev => ({
                        ...prev,
                        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
                      }))
                    }
                  >
                    {filters.sortOrder === 'asc' ? (
                      <SortAsc className='h-4 w-4' />
                    ) : (
                      <SortDesc className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>
                  {isLoading
                    ? 'Loading...'
                    : `${filteredAndSortedProfessionals.length} of ${totalCount} professionals`
                  }
                </span>

                <Separator orientation='vertical' className='h-6' />

                <div className='flex rounded-md border'>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('grid')}
                    className='rounded-r-none'
                  >
                    <Grid3X3 className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('list')}
                    className='rounded-l-none'
                  >
                    <List className='h-4 w-4' />
                  </Button>
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
                  className='border-t pt-6'
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <div className='space-y-3'>
                      <Label className='font-medium'>{t('filters.specializations')}</Label>
                      <div className='space-y-2 max-h-32 overflow-y-auto'>
                        {SPECIALIZATIONS.map(spec => (
                          <div
                            key={spec}
                            className='flex items-center space-x-2'
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
                            <Label htmlFor={spec} className='text-sm'>
                              {spec}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <Label className='font-medium'>{t('filters.experienceRange')}</Label>
                      <div className='px-2'>
                        <Slider
                          value={filters.experienceRange}
                          onValueChange={(value: number[]) =>
                            setFilters(prev => ({
                              ...prev,
                              experienceRange: value as [number, number],
                            }))
                          }
                          max={30}
                          min={0}
                          step={1}
                          className='w-full'
                        />
                        <div className='flex justify-between text-sm text-muted-foreground mt-1'>
                          <span>{t('filters.experienceYears', { count: filters.experienceRange[0] })}</span>
                          <span>{t('filters.experienceYears', { count: filters.experienceRange[1] })}</span>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <Label className='font-medium'>{t('filters.hourlyRateRange')}</Label>
                      <div className='px-2'>
                        <Slider
                          value={filters.priceRange}
                          onValueChange={(value: number[]) =>
                            setFilters(prev => ({
                              ...prev,
                              priceRange: value as [number, number],
                            }))
                          }
                          max={1000}
                          min={100}
                          step={25}
                          className='w-full'
                        />
                        <div className='flex justify-between text-sm text-muted-foreground mt-1'>
                          <span>${filters.priceRange[0]}</span>
                          <span>${filters.priceRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <Label className='font-medium'>{t('filters.minimumRating')}</Label>
                      <Select
                        value={filters.ratingMin.toString()}
                        onValueChange={value =>
                          setFilters(prev => ({
                            ...prev,
                            ratingMin: Number(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='0'>{t('filters.rating.anyRating')}</SelectItem>
                          <SelectItem value='4'>{t('filters.rating.fourPlus')}</SelectItem>
                          <SelectItem value='4.5'>{t('filters.rating.fourFivePlus')}</SelectItem>
                          <SelectItem value='4.8'>{t('filters.rating.fourEightPlus')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-3'>
                      <Label className='font-medium'>{t('filters.availability')}</Label>
                      <Select
                        value={filters.availability}
                        onValueChange={value =>
                          setFilters(prev => ({ ...prev, availability: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>{t('filters.availability.all')}</SelectItem>
                          <SelectItem value='available'>
                            {t('filters.availability.available')}
                          </SelectItem>
                          <SelectItem value='busy'>
                            {t('filters.availability.busy')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <Label className='font-medium'>{t('filters.activeFilters')}</Label>
                        {(filters.specializations.length > 0 ||
                          filters.states.length > 0 ||
                          filters.languages.length > 0) && (
                          <Button
                            variant="ghost"
                            size='sm'
                            onClick={resetFilters}
                          >
                            {t('filters.clearAll')}
                          </Button>
                        )}
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {filters.specializations.map(spec => (
                          <Badge
                            key={spec}
                            variant='secondary'
                            className='text-xs'
                          >
                            {spec}
                            <Button
                              variant="ghost"
                              size='sm'
                              className='ml-1 h-auto p-0 text-xs'
                              onClick={() =>
                                setFilters(prev => ({
                                  ...prev,
                                  specializations: prev.specializations.filter(
                                    s => s !== spec
                                  ),
                                }))
                              }
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && professionals.length === 0 && (
        <Card>
          <CardContent className='p-12 text-center'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse'>
              <Search className='h-8 w-8 text-blue-400' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>
              Loading Professionals
            </h3>
            <p className='text-muted-foreground'>
              Finding the best legal professionals for you...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className='p-12 text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search className='h-8 w-8 text-red-400' />
            </div>
            <h3 className='text-lg font-semibold mb-2 text-red-600'>
              Error Loading Professionals
            </h3>
            <p className='text-muted-foreground mb-4'>
              {error}
            </p>
            <Button
              variant='outline'
              onClick={() => loadProfessionals(filters.search, {}, 1, false)}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <div className='space-y-4'>
        {viewMode === 'grid' ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredAndSortedProfessionals.map(renderProfessionalCard)}
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredAndSortedProfessionals.map(renderProfessionalListItem)}
          </div>
        )}

        {filteredAndSortedProfessionals.length === 0 && (
          <Card>
            <CardContent className='p-12 text-center'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Search className='h-8 w-8 text-gray-400' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>
                {t('noResults.title')}
              </h3>
              <p className='text-muted-foreground mb-4'>
                {t('noResults.description')}
              </p>
              <Button variant='outline' onClick={resetFilters}>
                {t('noResults.resetButton')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className='text-center pt-6'>
            <Button
              variant='outline'
              onClick={() => loadProfessionals(filters.search, {}, currentPage + 1, true)}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More Professionals'}
            </Button>
          </div>
        )}
      </div>
      )}

      {/* Professional Detail Modal */}
      <Dialog
        open={!!selectedProfessional}
        onOpenChange={() => setSelectedProfessional(null)}
      >
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Eye className='h-5 w-5' />
              {t('modal.title')}
            </DialogTitle>
          </DialogHeader>

          {selectedProfessional && (
            <div className='space-y-6'>
              {/* Professional Header */}
              <div className='flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg'>
                <Avatar className='w-24 h-24 border-4 border-white shadow-lg'>
                  <AvatarImage src={selectedProfessional.profile_image_url} />
                  <AvatarFallback className='text-2xl font-semibold'>
                    {selectedProfessional.full_name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <div className='flex-1'>
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <h2 className='text-2xl font-bold mb-1'>
                        {selectedProfessional.full_name}
                      </h2>
                      <p className='text-lg text-muted-foreground mb-1'>
                        {selectedProfessional.professional_title}
                      </p>
                      {selectedProfessional.law_firm_name && (
                        <p className='text-muted-foreground mb-2'>
                          {selectedProfessional.law_firm_name}
                        </p>
                      )}

                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <Award className='h-4 w-4' />
                          {t('modal.header.yearsExperience', { count: selectedProfessional.experience_years })}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Clock className='h-4 w-4' />
                          {t('modal.header.respondsIn', { time: selectedProfessional.responseTime })}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Shield className='h-4 w-4' />
                          {t('modal.header.verifiedAttorney')}
                        </span>
                      </div>
                    </div>

                    <div className='text-right'>
                      <div className='flex items-center gap-1 mb-2'>
                        <Star className='h-5 w-5 text-yellow-500 fill-current' />
                        <span className='text-xl font-bold'>
                          {selectedProfessional.rating}
                        </span>
                        <span className='text-muted-foreground'>
                          ({t('modal.header.reviews', { count: selectedProfessional.reviewCount })})
                        </span>
                      </div>
                      <Badge
                        className={`${getAvailabilityColor(selectedProfessional.availability)} mb-2`}
                      >
                        {t(`availability.${selectedProfessional.availability}`)}
                      </Badge>
                      <p className='text-lg font-bold'>
                        ${selectedProfessional.hourly_rate}{t('professionalCard.perHour')}
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-3'>
                    <Button
                      onClick={() => onBookConsultation(selectedProfessional)}
                    >
                      <Calendar className='h-4 w-4 mr-2' />
                      {t('modal.buttons.bookConsultation')}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => onRequestReview(selectedProfessional)}
                    >
                      <FileText className='h-4 w-4 mr-2' />
                      {t('modal.buttons.requestReview')}
                    </Button>
                    <Button variant='outline'>
                      <MessageSquare className='h-4 w-4 mr-2' />
                      {t('modal.buttons.sendMessage')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <Tabs defaultValue='overview' className='w-full'>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='overview'>{t('modal.tabs.overview')}</TabsTrigger>
                  <TabsTrigger value='services'>{t('modal.tabs.services')}</TabsTrigger>
                  <TabsTrigger value='reviews'>{t('modal.tabs.reviews')}</TabsTrigger>
                  <TabsTrigger value='credentials'>{t('modal.tabs.credentials')}</TabsTrigger>
                </TabsList>

                <TabsContent value='overview' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t('modal.overview.aboutTitle', { name: selectedProfessional.full_name })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <p className='text-muted-foreground'>
                        {selectedProfessional.bio}
                      </p>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <Label className='font-medium mb-2 block'>
                            {t('modal.overview.specializations')}
                          </Label>
                          <div className='flex flex-wrap gap-2'>
                            {selectedProfessional.specializations.map(spec => (
                              <Badge key={spec.id} variant='secondary'>
                                {spec.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className='font-medium mb-2 block'>
                            {t('modal.overview.licensedStates')}
                          </Label>
                          <div className='flex flex-wrap gap-2'>
                            {selectedProfessional.licensed_states?.map(
                              state => (
                                <Badge key={state} variant='outline'>
                                  {state}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>

                        {selectedProfessional.languages && (
                          <div>
                            <Label className='font-medium mb-2 block'>
                              {t('modal.overview.languages')}
                            </Label>
                            <div className='flex flex-wrap gap-2'>
                              {selectedProfessional.languages.map(lang => (
                                <Badge key={lang} variant='outline'>
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedProfessional.achievements && (
                          <div>
                            <Label className='font-medium mb-2 block'>
                              {t('modal.overview.achievements')}
                            </Label>
                            <div className='space-y-1'>
                              {selectedProfessional.achievements.map(
                                achievement => (
                                  <div
                                    key={achievement}
                                    className='flex items-center gap-2'
                                  >
                                    <Award className='h-4 w-4 text-yellow-600' />
                                    <span className='text-sm'>
                                      {achievement}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='services' className='space-y-4'>
                  {selectedProfessional.services.map((service, index) => (
                    <Card key={index}>
                      <CardContent className='p-6'>
                        <div className='flex items-start justify-between mb-3'>
                          <div>
                            <Badge
                              variant='outline'
                              className='mb-2 capitalize'
                            >
                              {t(`serviceTypes.${service.type}`)}
                            </Badge>
                            <h3 className='font-semibold'>
                              {service.description}
                            </h3>
                          </div>
                          <div className='text-right'>
                            <p className='text-lg font-bold'>
                              ${service.startingPrice}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              {t('modal.services.startingFrom')}
                            </p>
                          </div>
                        </div>
                        <Button size='sm'>{t('modal.services.selectService')}</Button>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value='reviews' className='space-y-4'>
                  {selectedProfessional.featuredReview && (
                    <Card>
                      <CardContent className='p-6'>
                        <div className='flex items-center gap-2 mb-3'>
                          <div className='flex'>
                            {[
                              ...Array(
                                selectedProfessional.featuredReview.rating
                              ),
                            ].map((_, i) => (
                              <Star
                                key={i}
                                className='h-4 w-4 text-yellow-500 fill-current'
                              />
                            ))}
                          </div>
                          <span className='font-medium'>
                            {selectedProfessional.featuredReview.clientName}
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            •{' '}
                            {new Date(
                              selectedProfessional.featuredReview.date
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <p className='text-muted-foreground'>
                          "{selectedProfessional.featuredReview.comment}"
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className='text-center py-8 text-muted-foreground'>
                    <MessageSquare className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p>{t('modal.reviews.moreReviewsNote')}</p>
                  </div>
                </TabsContent>

                <TabsContent value='credentials' className='space-y-4'>
                  <Card>
                    <CardContent className='p-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <Label className='font-medium mb-2 block'>
                            {t('modal.credentials.barInformation')}
                          </Label>
                          <p className='text-muted-foreground'>
                            {t('modal.credentials.barNumber', { number: selectedProfessional.bar_number })}
                          </p>
                          <p className='text-muted-foreground'>
                            {t('modal.credentials.status', { status: selectedProfessional.verification_status })}
                          </p>
                        </div>

                        <div>
                          <Label className='font-medium mb-2 block'>
                            {t('modal.credentials.experience')}
                          </Label>
                          <p className='text-muted-foreground'>
                            {t('modal.credentials.yearsInPractice', { count: selectedProfessional.experience_years })}
                          </p>
                          <p className='text-muted-foreground'>
                            {t('modal.credentials.memberSince', {
                              year: new Date(selectedProfessional.created_at).getFullYear()
                            })}
                          </p>
                        </div>
                      </div>

                      <div className='mt-6 p-4 bg-green-50 rounded-lg'>
                        <div className='flex items-center gap-2 text-green-800'>
                          <CheckCircle className='h-5 w-5' />
                          <span className='font-medium'>
                            {t('modal.credentials.verifiedProfessional')}
                          </span>
                        </div>
                        <p className='text-sm text-green-700 mt-1'>
                          {t('modal.credentials.verificationNote')}
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
      <div className='bg-gray-50 rounded-lg p-8'>
        <div className='text-center mb-6'>
          <h3 className='text-xl font-semibold mb-2'>
            {t('trustFooter.title')}
          </h3>
          <p className='text-muted-foreground'>
            {t('trustFooter.description')}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
          <div className='space-y-2'>
            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
              <Shield className='h-6 w-6 text-blue-600' />
            </div>
            <h4 className='font-semibold'>{t('trustFooter.features.verified.title')}</h4>
            <p className='text-sm text-muted-foreground'>
              {t('trustFooter.features.verified.description')}
            </p>
          </div>

          <div className='space-y-2'>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
              <Star className='h-6 w-6 text-green-600' />
            </div>
            <h4 className='font-semibold'>{t('trustFooter.features.reviewed.title')}</h4>
            <p className='text-sm text-muted-foreground'>
              {t('trustFooter.features.reviewed.description')}
            </p>
          </div>

          <div className='space-y-2'>
            <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto'>
              <Target className='h-6 w-6 text-purple-600' />
            </div>
            <h4 className='font-semibold'>{t('trustFooter.features.matched.title')}</h4>
            <p className='text-sm text-muted-foreground'>
              {t('trustFooter.features.matched.description')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}