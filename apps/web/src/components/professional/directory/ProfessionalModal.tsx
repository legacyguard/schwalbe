/**
 * @description Modal component for detailed professional profile view
 * Displays comprehensive professional information and interaction options
 */

import React from 'react';
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  MessageSquare,
  Star,
  Target,
  X,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/stubs/ui';
import { Button } from '@schwalbe/ui/button';
import { Badge } from '@schwalbe/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@schwalbe/ui/avatar';
import { Separator } from '@schwalbe/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@schwalbe/ui/tabs';
import type { ProfessionalProfile } from './ProfessionalCard';

interface ProfessionalModalProps {
  professional: ProfessionalProfile;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (professional: ProfessionalProfile) => void;
  onScheduleConsultation: (professional: ProfessionalProfile) => void;
}

export function ProfessionalModal({
  professional,
  isOpen,
  onClose,
  onSendMessage,
  onScheduleConsultation,
}: ProfessionalModalProps): JSX.Element {
  const availabilityColors = {
    available: 'bg-green-100 text-green-800',
    busy: 'bg-yellow-100 text-yellow-800',
    unavailable: 'bg-red-100 text-red-800',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={professional.avatar} alt={professional.name} />
                <AvatarFallback className="text-xl">
                  {professional.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DialogTitle className="text-2xl">{professional.name}</DialogTitle>
                  {professional.verified && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-1">{professional.title}</p>
                <p className="text-gray-500">{professional.firm}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    {professional.location}
                  </div>
                  <Badge className={availabilityColors[professional.availability]}>
                    {professional.availability}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 fill-current text-yellow-400" />
              </div>
              <div className="font-semibold text-lg">{professional.rating}</div>
              <div className="text-sm text-gray-600">{professional.reviewCount} reviews</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <div className="font-semibold text-lg">{professional.experience}</div>
              <div className="text-sm text-gray-600">Years experience</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div className="font-semibold text-lg">{professional.completedCases}</div>
              <div className="text-sm text-gray-600">Cases completed</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div className="font-semibold text-lg">{professional.responseTime}</div>
              <div className="text-sm text-gray-600">Response time</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              className="flex-1"
              onClick={() => onScheduleConsultation(professional)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Consultation
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onSendMessage(professional)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-gray-700">{professional.bio}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {professional.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Education</h3>
                <ul className="space-y-1">
                  {professional.education.map((edu, index) => (
                    <li key={index} className="text-gray-700 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Certifications</h3>
                <ul className="space-y-1">
                  {professional.certifications.map((cert, index) => (
                    <li key={index} className="text-gray-700 flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-400" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-4">Professional Experience</h3>
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-200 pl-4">
                    <h4 className="font-medium">Senior Partner</h4>
                    <p className="text-sm text-gray-600">{professional.firm} • 2018 - Present</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Leading estate planning practice with focus on high-net-worth clients...
                    </p>
                  </div>
                  <div className="border-l-2 border-gray-200 pl-4">
                    <h4 className="font-medium">Associate Attorney</h4>
                    <p className="text-sm text-gray-600">Previous Firm • 2012 - 2018</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Developed expertise in complex estate planning structures...
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-4">Client Reviews</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">John D. • 2 weeks ago</span>
                    </div>
                    <p className="text-gray-700">
                      "Excellent service and very knowledgeable. Made the complex estate planning process simple to understand."
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">Sarah M. • 1 month ago</span>
                    </div>
                    <p className="text-gray-700">
                      "Professional, responsive, and thorough. Highly recommend for anyone needing estate planning services."
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-4">Pricing Information</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Hourly Consultation</h4>
                      <span className="font-semibold text-lg">${professional.hourlyRate}/hour</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      General consultation and advice on estate planning matters
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Will Preparation</h4>
                      <span className="font-semibold text-lg">$1,500 - $3,000</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Complete will preparation including consultation and documentation
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Trust Setup</h4>
                      <span className="font-semibold text-lg">$3,000 - $8,000</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Establishment of various trust structures based on complexity
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}