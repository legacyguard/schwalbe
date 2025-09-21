/**
 * @description Main professional directory component
 * Manages state and orchestrates search, filtering, and display of professionals
 */

import React, { useState, useMemo } from 'react';
import { Grid3X3, List } from 'lucide-react';
import { Button } from '@schwalbe/ui/button';
import { SearchFilters, type FilterState } from './SearchFilters';
import { ProfessionalCard, type ProfessionalProfile } from './ProfessionalCard';
import { ProfessionalModal } from './ProfessionalModal';

// Mock data - in real app this would come from API
const mockProfessionals: ProfessionalProfile[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Estate Planning Attorney',
    firm: 'Johnson & Associates',
    location: 'New York, NY',
    rating: 4.9,
    reviewCount: 127,
    experience: 15,
    specializations: ['Estate Planning', 'Tax Law', 'Probate'],
    hourlyRate: 450,
    availability: 'available',
    verified: true,
    responseTime: 'within 2 hours',
    completedCases: 342,
    bio: 'Experienced estate planning attorney with over 15 years of practice...',
    education: ['Harvard Law School', 'Yale University'],
    certifications: ['Certified Financial Planner', 'Elder Law Attorney'],
  },
  // Add more mock data as needed
];

interface ProfessionalDirectoryProps {
  className?: string;
}

export function ProfessionalDirectory({ className }: ProfessionalDirectoryProps): JSX.Element {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalProfile | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    location: '',
    specializations: [],
    experience: [0, 50],
    rating: 0,
    availability: false,
    verified: false,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  // Filter and sort professionals based on current filters
  const filteredProfessionals = useMemo(() => {
    const filtered = mockProfessionals.filter((prof) => {
      // Search filter
      if (filters.search && !prof.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !prof.firm.toLowerCase().includes(filters.search.toLowerCase()) &&
          !prof.specializations.some(spec => spec.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }

      // Location filter
      if (filters.location && prof.location !== filters.location) {
        return false;
      }

      // Specializations filter
      if (filters.specializations.length > 0 &&
          !filters.specializations.some(spec => prof.specializations.includes(spec))) {
        return false;
      }

      // Experience filter
      if (prof.experience < filters.experience[0] || prof.experience > filters.experience[1]) {
        return false;
      }

      // Rating filter
      if (prof.rating < filters.rating) {
        return false;
      }

      // Availability filter
      if (filters.availability && prof.availability !== 'available') {
        return false;
      }

      // Verified filter
      if (filters.verified && !prof.verified) {
        return false;
      }

      return true;
    });

    // Sort professionals
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'experience':
          aValue = a.experience;
          bValue = b.experience;
          break;
        case 'location':
          aValue = a.location;
          bValue = b.location;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return filters.sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return filters.sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
    });

    return filtered;
  }, [filters]);

  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleViewProfile = (professional: ProfessionalProfile) => {
    setSelectedProfessional(professional);
  };

  const handleSendMessage = (professional: ProfessionalProfile) => {
    // Implement messaging functionality
    console.log('Send message to:', professional.name);
  };

  const handleScheduleConsultation = (professional: ProfessionalProfile) => {
    // Implement scheduling functionality
    console.log('Schedule consultation with:', professional.name);
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Professional Directory</h1>
          <p className="text-gray-600">
            Find verified legal professionals for your estate planning needs
          </p>
        </div>

        {/* Layout Toggle */}
        <div className="flex gap-2">
          <Button
            variant={layout === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayout('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayout('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <SearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isExpanded={filtersExpanded}
          onToggleExpanded={() => setFiltersExpanded(!filtersExpanded)}
        />
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredProfessionals.length} of {mockProfessionals.length} professionals
        </p>
      </div>

      {/* Professional Grid/List */}
      <div className={
        layout === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {filteredProfessionals.map((professional) => (
          <ProfessionalCard
            key={professional.id}
            professional={professional}
            layout={layout}
            onViewProfile={handleViewProfile}
            onSendMessage={handleSendMessage}
            onScheduleConsultation={handleScheduleConsultation}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProfessionals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No professionals match your criteria</p>
          <Button
            variant="outline"
            onClick={() => setFilters({
              search: '',
              location: '',
              specializations: [],
              experience: [0, 50],
              rating: 0,
              availability: false,
              verified: false,
              sortBy: 'rating',
              sortOrder: 'desc',
            })}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Professional Profile Modal */}
      {selectedProfessional && (
        <ProfessionalModal
          professional={selectedProfessional}
          isOpen={!!selectedProfessional}
          onClose={() => setSelectedProfessional(null)}
          onSendMessage={handleSendMessage}
          onScheduleConsultation={handleScheduleConsultation}
        />
      )}
    </div>
  );
}