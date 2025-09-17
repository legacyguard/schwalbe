
/**
 * Review Assignment Queue System
 * Smart assignment of legal reviews to professional reviewers
 */

import _React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Star,
  Timer,
  Users,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type {
  DocumentReview,
  ProfessionalReviewer,
  ReviewRequest,
} from '@/types/professional';

interface ReviewAssignmentQueueProps {
  activeReviews: DocumentReview[];
  className?: string;
  onAssignReview: (requestId: string, reviewerId: string) => void;
  onReassignReview: (reviewId: string, newReviewerId: string) => void;
  onUpdatePriority: (
    requestId: string,
    priority: ReviewRequest['priority']
  ) => void;
  requests: ReviewRequest[];
  reviewers: ProfessionalReviewer[];
}

interface ReviewerMatch {
  availability: 'available' | 'busy' | 'unavailable';
  estimatedStartTime: string;
  matchScore: number;
  reasons: string[];
  reviewer: ProfessionalReviewer;
}

type SortField = 'budget_max' | 'created_at' | 'deadline' | 'priority';
type SortOrder = 'asc' | 'desc';

export function ReviewAssignmentQueue({
  requests,
  reviewers,
  activeReviews,
  onAssignReview,
  onReassignReview: _onReassignReview,
  onUpdatePriority: _onUpdatePriority,
  className,
}: ReviewAssignmentQueueProps) {
  const [selectedRequest, setSelectedRequest] = useState<null | ReviewRequest>(
    null
  );
  const [reviewerMatches, setReviewerMatches] = useState<ReviewerMatch[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    reviewType: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, _setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [queueStats, setQueueStats] = useState({
    pending: 0,
    assigned: 0,
    avgWaitTime: 0,
    highPriority: 0,
  });

  useEffect(() => {
    // Calculate queue statistics
    const pending = requests.filter(r => r.status === 'pending').length;
    const assigned = requests.filter(r => r.status === 'assigned').length;
    const highPriority = requests.filter(
      r => r.priority === 'high' || r.priority === 'urgent'
    ).length;

    // Mock average wait time calculation
    const avgWaitTime = 2.5; // hours

    setQueueStats({ pending, assigned, avgWaitTime, highPriority });
  }, [requests]);

  const findBestMatches = (request: ReviewRequest): ReviewerMatch[] => {
    return reviewers
      .map(reviewer => {
        const match = calculateReviewerMatch(reviewer, request);
        return match;
      })
      .filter(match => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Top 5 matches
  };

  const calculateReviewerMatch = (
    reviewer: ProfessionalReviewer,
    request: ReviewRequest
  ): ReviewerMatch => {
    let matchScore = 0;
    const reasons: string[] = [];

    // Specialization match
    const reviewerSpecs =
      reviewer.specializations?.map(s => s.name.toLowerCase()) || [];
    const requestSpecs = request.required_specializations.map(s =>
      s.toLowerCase()
    );
    const specMatches = requestSpecs.filter(spec =>
      reviewerSpecs.some(rSpec => rSpec.includes(spec) || spec.includes(rSpec))
    );

    if (specMatches.length > 0) {
      matchScore += 30 * (specMatches.length / requestSpecs.length);
      reasons.push(`Specialization match: ${specMatches.join(', ')}`);
    }

    // Experience level
    const experienceScore = Math.min(reviewer.experience_years / 10, 1) * 20;
    matchScore += experienceScore;
    if (reviewer.experience_years >= 5) {
      reasons.push(`${reviewer.experience_years} years experience`);
    }

    // Availability
    const currentWorkload = activeReviews.filter(
      r => r.reviewer_id === reviewer.id && r.status !== 'completed'
    ).length;
    const maxWorkload = 5; // This could come from reviewer preferences
    const availabilityScore =
      Math.max(0, (maxWorkload - currentWorkload) / maxWorkload) * 25;
    matchScore += availabilityScore;

    let availability: ReviewerMatch['availability'] = 'available';
    let estimatedStartTime = 'Immediately';

    if (currentWorkload >= maxWorkload) {
      availability = 'unavailable';
      estimatedStartTime = 'Next week';
      matchScore *= 0.5; // Reduce match score for unavailable reviewers
    } else if (currentWorkload >= maxWorkload * 0.8) {
      availability = 'busy';
      estimatedStartTime = '2-3 days';
      reasons.push('Currently busy but available soon');
    } else {
      reasons.push('Available immediately');
    }

    // Review type preference
    if (request.review_type === 'basic' && reviewer.experience_years <= 5) {
      matchScore += 10;
      reasons.push('Good fit for basic reviews');
    } else if (
      request.review_type === 'certified' &&
      reviewer.experience_years >= 10
    ) {
      matchScore += 15;
      reasons.push('Qualified for certified reviews');
    }

    // Budget alignment
    if (reviewer.hourly_rate && request.budget_max) {
      const estimatedHours =
        request.review_type === 'basic'
          ? 2
          : request.review_type === 'comprehensive'
            ? 4
            : 6;
      const estimatedCost = reviewer.hourly_rate * estimatedHours;

      if (estimatedCost <= request.budget_max) {
        matchScore += 10;
        reasons.push('Within budget range');
      } else {
        matchScore -= 20;
        reasons.push('Above budget range');
      }
    }

    return {
      reviewer,
      matchScore: Math.max(0, Math.round(matchScore)),
      availability,
      estimatedStartTime,
      reasons,
    };
  };

  const filteredRequests = requests.filter(request => {
    if (filters.status !== 'all' && request.status !== filters.status)
      return false;
    if (filters.priority !== 'all' && request.priority !== filters.priority)
      return false;
    if (
      filters.reviewType !== 'all' &&
      request.review_type !== filters.reviewType
    )
      return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        request.id.toLowerCase().includes(query) ||
        request.required_specializations.some(spec =>
          spec.toLowerCase().includes(query)
        )
      );
    }

    return true;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'created_at' || sortField === 'deadline') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getPriorityColor = (priority: ReviewRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRequestSelect = (request: ReviewRequest) => {
    setSelectedRequest(request);
    const matches = findBestMatches(request);
    setReviewerMatches(matches);
  };

  const handleAssign = (reviewerId: string) => {
    if (selectedRequest) {
      onAssignReview(selectedRequest.id, reviewerId);
      setSelectedRequest(null);
      setReviewerMatches([]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Queue Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Pending</p>
                <p className='text-2xl font-bold'>{queueStats.pending}</p>
              </div>
              <Clock className='h-8 w-8 text-yellow-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Assigned</p>
                <p className='text-2xl font-bold'>{queueStats.assigned}</p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Avg. Wait Time</p>
                <p className='text-2xl font-bold'>{queueStats.avgWaitTime}h</p>
              </div>
              <Timer className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>High Priority</p>
                <p className='text-2xl font-bold'>{queueStats.highPriority}</p>
              </div>
              <AlertTriangle className='h-8 w-8 text-red-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Review Queue Management
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <Label>Search</Label>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search requests...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={value =>
                  setFilters(f => ({ ...f, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='assigned'>Assigned</SelectItem>
                  <SelectItem value='cancelled'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Priority</Label>
              <Select
                value={filters.priority}
                onValueChange={value =>
                  setFilters(f => ({ ...f, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Priorities</SelectItem>
                  <SelectItem value='urgent'>Urgent</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='low'>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Review Type</Label>
              <Select
                value={filters.reviewType}
                onValueChange={value =>
                  setFilters(f => ({ ...f, reviewType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='basic'>Basic</SelectItem>
                  <SelectItem value='comprehensive'>Comprehensive</SelectItem>
                  <SelectItem value='certified'>Certified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Requests List */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Review Requests ({sortedRequests.length})</CardTitle>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className='h-4 w-4' />
                ) : (
                  <SortDesc className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {sortedRequests.map(request => (
              <motion.div
                key={request.id}
                layout
                className='border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer'
                onClick={() => handleRequestSelect(request)}
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-3'>
                      <h4 className='font-medium'>
                        Review Request #{request.id.slice(0, 8)}
                      </h4>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                      <Badge variant='outline'>{request.review_type}</Badge>
                    </div>
                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      {request.deadline && (
                        <span className='flex items-center gap-1'>
                          <Clock className='h-4 w-4' />
                          Due: {new Date(request.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {request.budget_max && (
                        <span className='flex items-center gap-1'>
                          <DollarSign className='h-4 w-4' />
                          Max: ${request.budget_max}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={e => {
                        e.stopPropagation();
                        handleRequestSelect(request);
                      }}
                    >
                      <Users className='h-4 w-4 mr-2' />
                      Find Reviewer
                    </Button>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div>
                    <Label className='text-sm font-medium'>
                      Required Specializations:
                    </Label>
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {request.required_specializations.map(spec => (
                        <Badge
                          key={spec}
                          variant='secondary'
                          className='text-xs'
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {request.special_instructions && (
                    <div>
                      <Label className='text-sm font-medium'>
                        Special Instructions:
                      </Label>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {request.special_instructions}
                      </p>
                    </div>
                  )}

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <Label className='text-xs'>Family Context:</Label>
                      <div className='text-muted-foreground'>
                        {request.family_context.family_members_count} members
                        {request.family_context.minor_children &&
                          ', minor children'}
                        {request.family_context.complex_assets &&
                          ', complex assets'}
                        {request.family_context.business_interests &&
                          ', business interests'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {sortedRequests.length === 0 && (
              <div className='text-center py-8 text-muted-foreground'>
                <FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>No review requests match the current filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviewer Assignment Dialog */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Zap className='h-5 w-5' />
              Smart Reviewer Assignment
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className='space-y-6'>
              {/* Request Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Request Summary</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='font-medium'>Type:</Label>
                      <p>{selectedRequest.review_type}</p>
                    </div>
                    <div>
                      <Label className='font-medium'>Priority:</Label>
                      <Badge
                        className={getPriorityColor(selectedRequest.priority)}
                      >
                        {selectedRequest.priority}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className='font-medium'>Specializations:</Label>
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {selectedRequest.required_specializations.map(spec => (
                        <Badge key={spec} variant='secondary'>
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Reviewers */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Recommended Reviewers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {reviewerMatches.map((match, index) => (
                      <motion.div
                        key={match.reviewer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className='border rounded-lg p-4 hover:border-blue-300 transition-colors'
                      >
                        <div className='flex items-start justify-between mb-3'>
                          <div className='flex items-start gap-3'>
                            <Avatar className='w-12 h-12'>
                              <AvatarImage
                                src={match.reviewer.profile_image_url}
                              />
                              <AvatarFallback>
                                {match.reviewer.full_name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>

                            <div className='space-y-1'>
                              <div className='flex items-center gap-2'>
                                <h4 className='font-medium'>
                                  {match.reviewer.full_name}
                                </h4>
                                <Badge variant='outline' className='text-xs'>
                                  {match.matchScore}% match
                                </Badge>
                                <div className='flex items-center gap-1'>
                                  <Star className='h-4 w-4 text-yellow-500 fill-current' />
                                  <span className='text-sm'>4.8</span>
                                </div>
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                {match.reviewer.professional_title}
                                {match.reviewer.law_firm_name &&
                                  ` at ${match.reviewer.law_firm_name}`}
                              </p>
                              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                <span>
                                  {match.reviewer.experience_years} years exp.
                                </span>
                                {match.reviewer.hourly_rate && (
                                  <span>
                                    ${match.reviewer.hourly_rate}/hour
                                  </span>
                                )}
                                <Badge
                                  className={cn(
                                    'text-xs',
                                    match.availability === 'available'
                                      ? 'bg-green-100 text-green-800'
                                      : match.availability === 'busy'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  )}
                                >
                                  {match.availability}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleAssign(match.reviewer.id)}
                            disabled={match.availability === 'unavailable'}
                            className='flex-shrink-0'
                          >
                            <ArrowRight className='h-4 w-4 mr-2' />
                            Assign
                          </Button>
                        </div>

                        <div className='space-y-2'>
                          <div>
                            <Label className='text-sm font-medium'>
                              Match Reasons:
                            </Label>
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {match.reasons.map((reason, idx) => (
                                <Badge
                                  key={idx}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className='flex items-center gap-4 text-sm'>
                            <span>
                              <strong>Estimated Start:</strong>{' '}
                              {match.estimatedStartTime}
                            </span>
                            <Progress
                              value={match.matchScore}
                              className='flex-1 h-2'
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {reviewerMatches.length === 0 && (
                      <div className='text-center py-8 text-muted-foreground'>
                        <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
                        <p>No suitable reviewers found for this request</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
