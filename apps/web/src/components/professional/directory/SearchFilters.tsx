/**
 * @description Search and filter controls for professional directory
 * Handles search input, location filters, specialization filters, and sorting
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@schwalbe/ui/button';
import { Input } from '@schwalbe/ui/input';
import { Label } from '@schwalbe/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@schwalbe/ui/select';
import { Checkbox } from '@schwalbe/ui/checkbox';
import { Slider } from '@schwalbe/ui/slider';

export interface FilterState {
  search: string;
  location: string;
  specializations: string[];
  experience: [number, number];
  rating: number;
  availability: boolean;
  verified: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  isExpanded,
  onToggleExpanded,
}: SearchFiltersProps): JSX.Element {
  const specializations = [
    'Estate Planning',
    'Tax Law',
    'Family Law',
    'Real Estate',
    'Business Law',
    'Probate',
    'Elder Law',
    'Trust Administration',
  ];

  const locations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
  ];

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search professionals..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFiltersChange({ sortBy: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="experience">Experience</SelectItem>
            <SelectItem value="location">Location</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onFiltersChange({
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
            })
          }
        >
          {filters.sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleExpanded}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Expanded Filters */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="space-y-6 pt-4 border-t">
          {/* Location Filter */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Select
              value={filters.location}
              onValueChange={(value) => onFiltersChange({ location: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any location</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specializations Filter */}
          <div>
            <Label>Specializations</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {specializations.map((spec) => (
                <div key={spec} className="flex items-center space-x-2">
                  <Checkbox
                    id={spec}
                    checked={filters.specializations.includes(spec)}
                    onCheckedChange={(checked) => {
                      const newSpecs = checked
                        ? [...filters.specializations, spec]
                        : filters.specializations.filter((s) => s !== spec);
                      onFiltersChange({ specializations: newSpecs });
                    }}
                  />
                  <Label htmlFor={spec} className="text-sm">
                    {spec}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Range */}
          <div>
            <Label>Years of Experience</Label>
            <div className="mt-2">
              <Slider
                value={filters.experience}
                onValueChange={(value) =>
                  onFiltersChange({ experience: value as [number, number] })
                }
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{filters.experience[0]} years</span>
                <span>{filters.experience[1]} years</span>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <Label>Minimum Rating</Label>
            <div className="mt-2">
              <Slider
                value={[filters.rating]}
                onValueChange={(value) => onFiltersChange({ rating: value[0] })}
              />
              <div className="text-sm text-gray-500 mt-1">
                {filters.rating} stars and above
              </div>
            </div>
          </div>

          {/* Availability and Verification */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="availability"
                checked={filters.availability}
                onCheckedChange={(checked) =>
                  onFiltersChange({ availability: !!checked })
                }
              />
              <Label htmlFor="availability">Available now</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified}
                onCheckedChange={(checked) =>
                  onFiltersChange({ verified: !!checked })
                }
              />
              <Label htmlFor="verified">Verified professionals only</Label>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}