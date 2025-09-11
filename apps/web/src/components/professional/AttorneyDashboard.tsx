/**
 * Attorney Dashboard for Document Review
 * Professional interface for attorneys to manage document reviews
 */

import { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  MessageSquare,
  Search,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@schwalbe/ui/card';
import { Button } from '@schwalbe/ui/button';
import { Input } from '@schwalbe/ui/input';
import { Badge } from '@schwalbe/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@schwalbe/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@schwalbe/ui/tabs';
import { Progress } from '@schwalbe/ui/progress';
import { motion } from 'framer-motion';
import { cn } from '@schwalbe/lib/utils';
import type {
  DocumentReview,
  ProfessionalReviewer,
} from '@schwalbe/types/professional';

interface AttorneyDashboardProps {
  className?: string;
  completedReviews: DocumentReview[];
  onAcceptReview: (reviewId: string) => void;
  onDeclineReview: (reviewId: string) => void;
  onReviewDocument: (reviewId: string) => void;
  pendingReviews: DocumentReview[];
  reviewer: ProfessionalReviewer;
}

interface DashboardStats {
  averageRating: number;
  completedThisMonth: number;
  pendingReviews: number;
  responseTime: number; // hours
  totalEarnings: number;
  totalReviews: number;
}

export function AttorneyDashboard({
  reviewer,
  pendingReviews = [],
  completedReviews = [],
  onReviewDocument,
  onAcceptReview,
  onDeclineReview,
  className,
}: AttorneyDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    pendingReviews: 0,
    completedThisMonth: 0,
    averageRating: 0,
    totalEarnings: 0,
    responseTime: 0,
  });

  // Calculate stats
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedThisMonth = completedReviews.filter(
      review => new Date(review.completed_at || '') >= startOfMonth
    ).length;

    const totalEarnings = completedReviews.reduce(
      (sum, review) => sum + (review.review_fee || 0),
      0
    );

    setStats({
      totalReviews: completedReviews.length,
      pendingReviews: pendingReviews.length,
      completedThisMonth,
      averageRating: 4.8, // Mock rating for now
      totalEarnings,
      responseTime: 4.2, // Mock response time for now
    });
  }, [pendingReviews, completedReviews]);

  const filteredReviews = pendingReviews.filter(review => {
    const matchesSearch =
      searchQuery === '' ||
      review.document_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || review.priority === priorityFilter;

    const matchesStatus =
      statusFilter === 'all' || review.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getStatusColor = (status: DocumentReview['status']) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: DocumentReview['priority']) => {
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

  const getReviewTypeLabel = (type: DocumentReview['review_type']) => {
    switch (type) {
      case 'basic':
        return 'Basic Review';
      case 'comprehensive':
        return 'Comprehensive Review';
      case 'certified':
        return 'Certified Review';
      default:
        return 'Review';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Welcome back, {reviewer.fullName.split(' ')[0]}
          </h1>
          <p className='text-gray-600 mt-1'>
            {reviewer.type} - {reviewer.jurisdiction}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Badge className='bg-emerald-100 text-emerald-800 border-emerald-200'>
            {reviewer.verified ? 'Verified' : 'Pending Verification'}
          </Badge>
          <Badge variant='outline' className='flex items-center gap-1'>
            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
            {stats.averageRating}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Pending Reviews
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {stats.pendingReviews}
                  </p>
                </div>
                <div className='h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <Clock className='h-6 w-6 text-blue-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Completed This Month
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {stats.completedThisMonth}
                  </p>
                </div>
                <div className='h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center'>
                  <CheckCircle className='h-6 w-6 text-green-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Earnings
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    ${stats.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div className='h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center'>
                  <DollarSign className='h-6 w-6 text-green-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Avg Response Time
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {stats.responseTime}h
                  </p>
                </div>
                <div className='h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <TrendingUp className='h-6 w-6 text-purple-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='pending' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='pending'>
            Pending Reviews ({stats.pendingReviews})
          </TabsTrigger>
          <TabsTrigger value='completed'>
            Completed ({stats.totalReviews})
          </TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='pending' className='space-y-6'>
          {/* Filters */}
          <Card>
            <CardContent className='p-4'>
              <div className='flex flex-wrap gap-4'>
                <div className='flex-1 min-w-60'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                    <Input
                      placeholder='Search reviews...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className='w-40'>
                    <SelectValue placeholder='Priority' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Priority</SelectItem>
                    <SelectItem value='urgent'>Urgent</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='low'>Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-40'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='requested'>Requested</SelectItem>
                    <SelectItem value='assigned'>Assigned</SelectItem>
                    <SelectItem value='in_progress'>In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className='space-y-4'>
            {filteredReviews.length === 0 ? (
              <Card>
                <CardContent className='p-12 text-center'>
                  <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    No reviews found
                  </h3>
                  <p className='text-gray-600'>
                    {searchQuery ||
                    priorityFilter !== 'all' ||
                    statusFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'All caught up! New reviews will appear here.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className='hover:shadow-lg transition-shadow'>
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 space-y-3'>
                          <div className='flex items-center gap-3'>
                            <h3 className='font-semibold text-lg text-gray-900'>
                              {getReviewTypeLabel(review.review_type)}
                            </h3>
                            <Badge
                              className={cn(
                                'text-xs',
                                getPriorityColor(review.priority)
                              )}
                            >
                              {review.priority} priority
                            </Badge>
                            <Badge
                              className={cn(
                                'text-xs',
                                getStatusColor(review.status)
                              )}
                            >
                              {review.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                            <div className='flex items-center gap-2'>
                              <Calendar className='h-4 w-4' />
                              <span>
                                Requested {formatTimeAgo(review.requested_at)}
                              </span>
                            </div>
                            {review.due_date && (
                              <div className='flex items-center gap-2'>
                                <Clock className='h-4 w-4' />
                                <span>
                                  Due{' '}
                                  {new Date(
                                    review.due_date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {review.review_fee && (
                              <div className='flex items-center gap-2'>
                                <DollarSign className='h-4 w-4' />
                                <span>${review.review_fee}</span>
                              </div>
                            )}
                          </div>

                          {review.notes && (
                            <p className='text-sm text-gray-700 bg-gray-50 p-3 rounded-lg'>
                              {review.notes}
                            </p>
                          )}
                        </div>

                        <div className='flex gap-2 ml-4'>
                          {review.status === 'requested' && (
                            <>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => onDeclineReview(review.id)}
                                className='text-gray-600 hover:text-red-600'
                              >
                                Decline
                              </Button>
                              <Button
                                size='sm'
                                onClick={() => onAcceptReview(review.id)}
                                className='bg-green-600 hover:bg-green-700'
                              >
                                Accept Review
                              </Button>
                            </>
                          )}

                          {(review.status === 'assigned' ||
                            review.status === 'in_progress') && (
                            <>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => onReviewDocument(review.id)}
                                className='flex items-center gap-1'
                              >
                                <Eye className='h-4 w-4' />
                                View Document
                              </Button>
                              <Button
                                size='sm'
                                onClick={() => onReviewDocument(review.id)}
                                className='flex items-center gap-1'
                              >
                                <MessageSquare className='h-4 w-4' />
                                Continue Review
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='completed' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Completed Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {completedReviews.length === 0 ? (
                  <div className='text-center py-12'>
                    <Award className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      No completed reviews yet
                    </h3>
                    <p className='text-gray-600'>
                      Your completed reviews will appear here
                    </p>
                  </div>
                ) : (
                  completedReviews.map(review => (
                    <div
                      key={review.id}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div>
                        <h4 className='font-medium'>
                          {getReviewTypeLabel(review.review_type)}
                        </h4>
                        <p className='text-sm text-gray-600'>
                          Completed{' '}
                          {review.completed_at
                            ? formatTimeAgo(review.completed_at)
                            : 'Recently'}
                        </p>
                      </div>
                      <div className='flex items-center gap-4'>
                        {review.review_fee && (
                          <span className='font-medium text-green-600'>
                            +${review.review_fee}
                          </span>
                        )}
                        <Button size='sm' variant='outline'>
                          <Eye className='h-4 w-4 mr-1' />
                          View Report
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  Review Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm text-gray-600'>
                        Response Time
                      </span>
                      <span className='text-sm font-medium'>
                        {stats.responseTime}h avg
                      </span>
                    </div>
                    <Progress value={85} className='h-2' />
                  </div>

                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm text-gray-600'>
                        Client Satisfaction
                      </span>
                      <span className='text-sm font-medium'>
                        {stats.averageRating}/5.0
                      </span>
                    </div>
                    <Progress value={96} className='h-2' />
                  </div>

                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm text-gray-600'>
                        Review Quality
                      </span>
                      <span className='text-sm font-medium'>Excellent</span>
                    </div>
                    <Progress value={92} className='h-2' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Monthly Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>Reviews Completed</span>
                    <span className='font-semibold'>
                      {stats.completedThisMonth}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>Earnings This Month</span>
                    <span className='font-semibold text-green-600'>
                      ${stats.totalEarnings.toLocaleString()}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>Average Per Review</span>
                    <span className='font-semibold'>
                      $
                      {stats.completedThisMonth > 0
                        ? Math.round(
                            stats.totalEarnings / stats.completedThisMonth
                          ).toLocaleString()
                        : '0'}
                    </span>
                  </div>

                  <div className='pt-4 border-t'>
                    <Button className='w-full' variant='outline'>
                      <Download className='h-4 w-4 mr-2' />
                      Download Monthly Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}