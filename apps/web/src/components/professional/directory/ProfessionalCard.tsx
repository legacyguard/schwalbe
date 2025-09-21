/**
 * @description Individual professional profile card component
 * Displays professional information, ratings, and action buttons
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@schwalbe/ui/card';
import { Button } from '@schwalbe/ui/button';
import { Badge } from '@schwalbe/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@schwalbe/ui/avatar';
import { cn } from '@schwalbe/lib/utils';

export interface ProfessionalProfile {
  id: string;
  name: string;
  title: string;
  firm: string;
  location: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  experience: number;
  specializations: string[];
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  verified: boolean;
  responseTime: string;
  completedCases: number;
  bio: string;
  education: string[];
  certifications: string[];
}

interface ProfessionalCardProps {
  professional: ProfessionalProfile;
  layout: 'grid' | 'list';
  onViewProfile: (professional: ProfessionalProfile) => void;
  onSendMessage: (professional: ProfessionalProfile) => void;
  onScheduleConsultation: (professional: ProfessionalProfile) => void;
}

export function ProfessionalCard({
  professional,
  layout,
  onViewProfile,
  onSendMessage,
  onScheduleConsultation,
}: ProfessionalCardProps): JSX.Element {
  const availabilityColors = {
    available: 'bg-green-100 text-green-800',
    busy: 'bg-yellow-100 text-yellow-800',
    unavailable: 'bg-red-100 text-red-800',
  };

  if (layout === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="mb-4 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={professional.avatar} alt={professional.name} />
                  <AvatarFallback>
                    {professional.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">
                      {professional.name}
                    </h3>
                    {professional.verified && (
                      <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-gray-600 mb-1">{professional.title}</p>
                  <p className="text-sm text-gray-500 mb-2">{professional.firm}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {professional.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      {professional.rating} ({professional.reviewCount} reviews)
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {professional.experience} years
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {professional.specializations.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {professional.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{professional.specializations.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Rate */}
              <div className="flex flex-col items-end gap-2">
                <Badge className={cn('text-xs', availabilityColors[professional.availability])}>
                  {professional.availability}
                </Badge>
                <div className="text-right">
                  <div className="font-semibold">${professional.hourlyRate}/hr</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {professional.responseTime}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => onViewProfile(professional)}
                >
                  View Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendMessage(professional)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onScheduleConsultation(professional)}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Grid layout
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={professional.avatar} alt={professional.name} />
                <AvatarFallback>
                  {professional.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{professional.name}</h3>
                  {professional.verified && (
                    <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{professional.title}</p>
              </div>
            </div>
            <Badge className={cn('text-xs', availabilityColors[professional.availability])}>
              {professional.availability}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <div className="text-sm text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="h-3 w-3" />
              {professional.location}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              {professional.rating} ({professional.reviewCount})
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {professional.specializations.slice(0, 2).map((spec) => (
              <Badge key={spec} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {professional.specializations.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{professional.specializations.length - 2}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{professional.experience} years exp.</span>
            <span className="font-semibold">${professional.hourlyRate}/hr</span>
          </div>

          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => onViewProfile(professional)}
            >
              View Profile
            </Button>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onSendMessage(professional)}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Message
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onScheduleConsultation(professional)}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}