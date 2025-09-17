/**
 * Commission Tracking Dashboard
 * Real-time tracking of referral commissions for professional network
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  MoreVertical,
  Percent,
  PieChart,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@schwalbe/ui/card';
import { Button } from '@schwalbe/ui/button';
import { Input } from '@schwalbe/ui/input';
import { Label } from '@schwalbe/ui/label';
import { Badge } from '@schwalbe/ui/badge';
import { Separator } from '@schwalbe/ui/separator';
import { Progress } from '@schwalbe/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@schwalbe/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@schwalbe/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@schwalbe/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/stubs/ui';
import { cn } from '@schwalbe/lib/utils';

interface CommissionRecord {
  clientId: string;
  clientName: string;
  commissionAmount: number;
  commissionRate: number;
  createdAt: string;
  id: string;
  paidAt?: string;
  paymentMethod?: 'bank_transfer' | 'check' | 'paypal';
  referralId: string;
  reviewerId: string;
  reviewerName: string;
  serviceAmount: number;
  serviceDescription: string;
  serviceType: 'consultation' | 'retainer' | 'review';
  status: 'approved' | 'disputed' | 'paid' | 'pending';
}

interface CommissionSummary {
  activeReviewers: number;
  averageCommissionRate: number;
  lastMonthCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  thisMonthCommissions: number;
  topPerformer: {
    commissions: number;
    name: string;
  };
  totalCommissions: number;
  totalReferrals: number;
}

interface CommissionTrackingDashboardProps {
  className?: string;
  isAdmin?: boolean;
  onExportData?: () => void;
  onProcessPayment?: (commissionId: string) => void;
  reviewerId?: string;
}

const SAMPLE_COMMISSION_DATA: CommissionRecord[] = [
  {
    id: '1',
    referralId: 'REF-001',
    reviewerId: 'rev-1',
    clientId: 'client-1',
    serviceType: 'review',
    serviceAmount: 750,
    commissionRate: 30,
    commissionAmount: 225,
    status: 'paid',
    createdAt: '2024-01-15T10:00:00Z',
    paidAt: '2024-01-20T15:30:00Z',
    reviewerName: 'Sarah Johnson',
    clientName: 'Michael Chen',
    serviceDescription: 'Comprehensive estate plan review',
    paymentMethod: 'bank_transfer',
  },
  {
    id: '2',
    referralId: 'REF-002',
    reviewerId: 'rev-2',
    clientId: 'client-2',
    serviceType: 'consultation',
    serviceAmount: 450,
    commissionRate: 25,
    commissionAmount: 112.5,
    status: 'approved',
    createdAt: '2024-01-18T14:20:00Z',
    reviewerName: 'David Wilson',
    clientName: 'Lisa Rodriguez',
    serviceDescription: '90-minute legal consultation',
  },
  {
    id: '3',
    referralId: 'REF-003',
    reviewerId: 'rev-1',
    clientId: 'client-3',
    serviceType: 'retainer',
    serviceAmount: 2500,
    commissionRate: 20,
    commissionAmount: 500,
    status: 'pending',
    createdAt: '2024-01-22T09:15:00Z',
    reviewerName: 'Sarah Johnson',
    clientName: 'Robert Kim',
    serviceDescription: 'Monthly legal retainer services',
  },
];

export function CommissionTrackingDashboard({
  isAdmin = false,
  reviewerId,
  onExportData,
  onProcessPayment,
  className,
}: CommissionTrackingDashboardProps) {
  const [commissions, setCommissions] = useState<CommissionRecord[]>(
    SAMPLE_COMMISSION_DATA
  );
  const [summary] = useState<CommissionSummary>({
    totalCommissions: 837.5,
    pendingCommissions: 500,
    paidCommissions: 337.5,
    thisMonthCommissions: 837.5,
    lastMonthCommissions: 1250,
    averageCommissionRate: 25,
    totalReferrals: 3,
    activeReviewers: 2,
    topPerformer: {
      name: 'Sarah Johnson',
      commissions: 725,
    },
  });

  const [filters, setFilters] = useState({
    status: 'all',
    serviceType: 'all',
    dateRange: 'this_month',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommission, setSelectedCommission] =
    useState<CommissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredCommissions = commissions.filter(commission => {
    if (reviewerId && commission.reviewerId !== reviewerId) return false;
    if (filters.status !== 'all' && commission.status !== filters.status)
      return false;
    if (
      filters.serviceType !== 'all' &&
      commission.serviceType !== filters.serviceType
    )
      return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        commission.reviewerName.toLowerCase().includes(query) ||
        commission.clientName.toLowerCase().includes(query) ||
        commission.referralId.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getStatusColor = (status: CommissionRecord['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disputed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: CommissionRecord['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className='h-4 w-4' />;
      case 'approved':
        return <Clock className='h-4 w-4' />;
      case 'pending':
        return <RefreshCw className='h-4 w-4' />;
      case 'disputed':
        return <AlertCircle className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  const handleProcessPayment = async (commissionId: string) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setCommissions(prev =>
      prev.map(c =>
        c.id === commissionId
          ? { ...c, status: 'paid', paidAt: new Date().toISOString() }
          : c
      )
    );

    setIsLoading(false);
    onProcessPayment?.(commissionId);
  };

  const calculateGrowthRate = () => {
    if (summary.lastMonthCommissions === 0) return 0;
    return (
      ((summary.thisMonthCommissions - summary.lastMonthCommissions) /
        summary.lastMonthCommissions) *
      100
    );
  };

  const growthRate = calculateGrowthRate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Commission Tracking</h2>
          <p className='text-muted-foreground'>
            {isAdmin
              ? 'Manage and track all referral commissions'
              : 'Track your referral earnings'}
          </p>
        </div>

        <div className='flex gap-3'>
          <Button variant='outline' onClick={onExportData}>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          {isAdmin && (
            <Button>
              <CreditCard className='h-4 w-4 mr-2' />
              Process Payments
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Total Commissions
                </p>
                <p className='text-2xl font-bold'>
                  ${summary.totalCommissions.toLocaleString()}
                </p>
                <div className='flex items-center gap-1 mt-1'>
                  {growthRate >= 0 ? (
                    <ArrowUpRight className='h-4 w-4 text-green-600' />
                  ) : (
                    <ArrowDownRight className='h-4 w-4 text-red-600' />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {Math.abs(growthRate).toFixed(1)}% from last month
                  </span>
                </div>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                <DollarSign className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Pending Payouts</p>
                <p className='text-2xl font-bold'>
                  ${summary.pendingCommissions.toLocaleString()}
                </p>
                <p className='text-sm text-muted-foreground mt-1'>
                  {
                    commissions.filter(
                      c => c.status === 'pending' || c.status === 'approved'
                    ).length
                  }{' '}
                  pending
                </p>
              </div>
              <div className='w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center'>
                <Clock className='h-6 w-6 text-yellow-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Avg Commission Rate
                </p>
                <p className='text-2xl font-bold'>
                  {summary.averageCommissionRate}%
                </p>
                <p className='text-sm text-muted-foreground mt-1'>
                  Across all services
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                <Percent className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Total Referrals</p>
                <p className='text-2xl font-bold'>{summary.totalReferrals}</p>
                <p className='text-sm text-muted-foreground mt-1'>
                  {summary.activeReviewers} active reviewers
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center'>
                <Users className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performer */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Award className='h-5 w-5' />
              Top Performer This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center'>
                  <Award className='h-6 w-6 text-yellow-600' />
                </div>
                <div>
                  <h4 className='font-semibold'>{summary.topPerformer.name}</h4>
                  <p className='text-sm text-muted-foreground'>
                    Top referral partner
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-2xl font-bold text-yellow-700'>
                  ${summary.topPerformer.commissions.toLocaleString()}
                </p>
                <p className='text-sm text-muted-foreground'>in commissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue='commissions' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='commissions'>Commission Records</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        {/* Commission Records Tab */}
        <TabsContent value='commissions' className='space-y-6'>
          {/* Filters */}
          <Card>
            <CardContent className='p-4'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='space-y-2'>
                  <Label>Search</Label>
                  <div className='relative'>
                    <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Search commissions...'
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
                      <SelectItem value='approved'>Approved</SelectItem>
                      <SelectItem value='paid'>Paid</SelectItem>
                      <SelectItem value='disputed'>Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Service Type</Label>
                  <Select
                    value={filters.serviceType}
                    onValueChange={value =>
                      setFilters(f => ({ ...f, serviceType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Types</SelectItem>
                      <SelectItem value='review'>Review</SelectItem>
                      <SelectItem value='consultation'>Consultation</SelectItem>
                      <SelectItem value='retainer'>Retainer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Date Range</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={value =>
                      setFilters(f => ({ ...f, dateRange: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='this_month'>This Month</SelectItem>
                      <SelectItem value='last_month'>Last Month</SelectItem>
                      <SelectItem value='quarter'>This Quarter</SelectItem>
                      <SelectItem value='year'>This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Records */}
          <Card>
            <CardHeader>
              <CardTitle>
                Commission Records ({filteredCommissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {filteredCommissions.map(commission => (
                  <motion.div
                    key={commission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='border rounded-lg p-4 hover:border-blue-200 transition-colors'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-3'>
                          <h4 className='font-medium'>
                            Referral #{commission.referralId}
                          </h4>
                          <Badge className={getStatusColor(commission.status)}>
                            <div className='flex items-center gap-1'>
                              {getStatusIcon(commission.status)}
                              {commission.status}
                            </div>
                          </Badge>
                          <Badge variant='outline' className='capitalize'>
                            {commission.serviceType}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {commission.serviceDescription}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => setSelectedCommission(commission)}
                          >
                            <Eye className='h-4 w-4 mr-2' />
                            View Details
                          </DropdownMenuItem>
                          {isAdmin && commission.status === 'approved' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleProcessPayment(commission.id)
                              }
                            >
                              <CreditCard className='h-4 w-4 mr-2' />
                              Process Payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Download className='h-4 w-4 mr-2' />
                            Export Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-sm'>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Reviewer
                        </Label>
                        <p className='font-medium'>{commission.reviewerName}</p>
                      </div>

                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Client
                        </Label>
                        <p className='font-medium'>{commission.clientName}</p>
                      </div>

                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Service Amount
                        </Label>
                        <p className='font-medium'>
                          ${commission.serviceAmount.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Commission ({commission.commissionRate}%)
                        </Label>
                        <p className='font-bold text-green-600'>
                          ${commission.commissionAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground'>
                      <span>
                        Created:{' '}
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </span>
                      {commission.paidAt && (
                        <span>
                          Paid:{' '}
                          {new Date(commission.paidAt).toLocaleDateString()}
                        </span>
                      )}
                      {commission.paymentMethod && (
                        <Badge variant='outline' className='text-xs'>
                          {commission.paymentMethod.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}

                {filteredCommissions.length === 0 && (
                  <div className='text-center py-8 text-muted-foreground'>
                    <FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p>No commission records match the current filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value='analytics' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  Commission Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>January 2024</span>
                    <span className='font-semibold'>
                      ${summary.thisMonthCommissions}
                    </span>
                  </div>
                  <Progress value={75} className='h-2' />

                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>December 2023</span>
                    <span className='font-semibold'>
                      ${summary.lastMonthCommissions}
                    </span>
                  </div>
                  <Progress value={90} className='h-2' />

                  <div className='text-sm text-muted-foreground'>
                    {growthRate >= 0 ? 'Growth' : 'Decline'} of{' '}
                    {Math.abs(growthRate).toFixed(1)}% month-over-month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <PieChart className='h-5 w-5' />
                  Service Type Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                      <span className='text-sm'>Reviews</span>
                    </div>
                    <span className='font-semibold'>45%</span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                      <span className='text-sm'>Consultations</span>
                    </div>
                    <span className='font-semibold'>35%</span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                      <span className='text-sm'>Retainers</span>
                    </div>
                    <span className='font-semibold'>20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value='settings' className='space-y-6'>
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Commission Settings</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Label>Default Review Commission (%)</Label>
                    <Input type='number' placeholder='25' />
                  </div>

                  <div className='space-y-2'>
                    <Label>Default Consultation Commission (%)</Label>
                    <Input type='number' placeholder='20' />
                  </div>

                  <div className='space-y-2'>
                    <Label>Default Retainer Commission (%)</Label>
                    <Input type='number' placeholder='15' />
                  </div>
                </div>

                <Separator />

                <div className='space-y-4'>
                  <Label className='text-base font-medium'>
                    Payment Processing
                  </Label>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>Minimum Payout Amount</Label>
                      <Input type='number' placeholder='50' />
                    </div>

                    <div className='space-y-2'>
                      <Label>Payment Schedule</Label>
                      <Select defaultValue='monthly'>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='weekly'>Weekly</SelectItem>
                          <SelectItem value='biweekly'>Bi-weekly</SelectItem>
                          <SelectItem value='monthly'>Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Commission Detail Dialog */}
      <Dialog
        open={!!selectedCommission}
        onOpenChange={() => setSelectedCommission(null)}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Commission Details</DialogTitle>
          </DialogHeader>

          {selectedCommission && (
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-3'>
                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Referral ID
                    </Label>
                    <p className='font-medium'>
                      {selectedCommission.referralId}
                    </p>
                  </div>

                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Status
                    </Label>
                    <Badge
                      className={getStatusColor(selectedCommission.status)}
                    >
                      {selectedCommission.status}
                    </Badge>
                  </div>

                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Service Type
                    </Label>
                    <p className='font-medium capitalize'>
                      {selectedCommission.serviceType}
                    </p>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Service Amount
                    </Label>
                    <p className='font-medium'>
                      ${selectedCommission.serviceAmount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Commission Rate
                    </Label>
                    <p className='font-medium'>
                      {selectedCommission.commissionRate}%
                    </p>
                  </div>

                  <div>
                    <Label className='text-sm text-muted-foreground'>
                      Commission Amount
                    </Label>
                    <p className='font-bold text-green-600'>
                      ${selectedCommission.commissionAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className='space-y-3'>
                <div>
                  <Label className='text-sm text-muted-foreground'>
                    Reviewer
                  </Label>
                  <p className='font-medium'>
                    {selectedCommission.reviewerName}
                  </p>
                </div>

                <div>
                  <Label className='text-sm text-muted-foreground'>
                    Client
                  </Label>
                  <p className='font-medium'>{selectedCommission.clientName}</p>
                </div>

                <div>
                  <Label className='text-sm text-muted-foreground'>
                    Service Description
                  </Label>
                  <p className='font-medium'>
                    {selectedCommission.serviceDescription}
                  </p>
                </div>
              </div>

              <Separator />

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Created
                  </Label>
                  <p>
                    {new Date(selectedCommission.createdAt).toLocaleString()}
                  </p>
                </div>

                {selectedCommission.paidAt && (
                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Paid
                    </Label>
                    <p>
                      {new Date(selectedCommission.paidAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {isAdmin && selectedCommission.status === 'approved' && (
                <div className='flex gap-3 pt-4'>
                  <Button
                    onClick={() => handleProcessPayment(selectedCommission.id)}
                    disabled={isLoading}
                    className='flex-1'
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className='h-4 w-4 mr-2' />
                        Process Payment
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}