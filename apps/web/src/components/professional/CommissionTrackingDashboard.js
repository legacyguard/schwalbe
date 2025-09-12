import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Commission Tracking Dashboard
 * Real-time tracking of referral commissions for professional network
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Award, BarChart3, CheckCircle, Clock, CreditCard, DollarSign, Download, Eye, FileText, MoreVertical, Percent, PieChart, RefreshCw, Search, Users, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@schwalbe/ui/card';
import { Button } from '@schwalbe/ui/button';
import { Input } from '@schwalbe/ui/input';
import { Label } from '@schwalbe/ui/label';
import { Badge } from '@schwalbe/ui/badge';
import { Separator } from '@schwalbe/ui/separator';
import { Progress } from '@schwalbe/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@schwalbe/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@schwalbe/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@schwalbe/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@schwalbe/ui/dialog';
import { cn } from '@schwalbe/lib/utils';
const SAMPLE_COMMISSION_DATA = [
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
export function CommissionTrackingDashboard({ isAdmin = false, reviewerId, onExportData, onProcessPayment, className, }) {
    const [commissions, setCommissions] = useState(SAMPLE_COMMISSION_DATA);
    const [summary] = useState({
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
    const [selectedCommission, setSelectedCommission] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const filteredCommissions = commissions.filter(commission => {
        if (reviewerId && commission.reviewerId !== reviewerId)
            return false;
        if (filters.status !== 'all' && commission.status !== filters.status)
            return false;
        if (filters.serviceType !== 'all' &&
            commission.serviceType !== filters.serviceType)
            return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (commission.reviewerName.toLowerCase().includes(query) ||
                commission.clientName.toLowerCase().includes(query) ||
                commission.referralId.toLowerCase().includes(query));
        }
        return true;
    });
    const getStatusColor = (status) => {
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
    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return _jsx(CheckCircle, { className: 'h-4 w-4' });
            case 'approved':
                return _jsx(Clock, { className: 'h-4 w-4' });
            case 'pending':
                return _jsx(RefreshCw, { className: 'h-4 w-4' });
            case 'disputed':
                return _jsx(AlertCircle, { className: 'h-4 w-4' });
            default:
                return _jsx(Clock, { className: 'h-4 w-4' });
        }
    };
    const handleProcessPayment = async (commissionId) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCommissions(prev => prev.map(c => c.id === commissionId
            ? { ...c, status: 'paid', paidAt: new Date().toISOString() }
            : c));
        setIsLoading(false);
        onProcessPayment?.(commissionId);
    };
    const calculateGrowthRate = () => {
        if (summary.lastMonthCommissions === 0)
            return 0;
        return (((summary.thisMonthCommissions - summary.lastMonthCommissions) /
            summary.lastMonthCommissions) *
            100);
    };
    const growthRate = calculateGrowthRate();
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: cn('space-y-6', className), children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("h2", { className: 'text-2xl font-bold', children: "Commission Tracking" }), _jsx("p", { className: 'text-muted-foreground', children: isAdmin
                                    ? 'Manage and track all referral commissions'
                                    : 'Track your referral earnings' })] }), _jsxs("div", { className: 'flex gap-3', children: [_jsxs(Button, { variant: 'outline', onClick: onExportData, children: [_jsx(Download, { className: 'h-4 w-4 mr-2' }), "Export"] }), isAdmin && (_jsxs(Button, { children: [_jsx(CreditCard, { className: 'h-4 w-4 mr-2' }), "Process Payments"] }))] })] }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', children: [_jsx(Card, { children: _jsx(CardContent, { className: 'p-4', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Total Commissions" }), _jsxs("p", { className: 'text-2xl font-bold', children: ["$", summary.totalCommissions.toLocaleString()] }), _jsxs("div", { className: 'flex items-center gap-1 mt-1', children: [growthRate >= 0 ? (_jsx(ArrowUpRight, { className: 'h-4 w-4 text-green-600' })) : (_jsx(ArrowDownRight, { className: 'h-4 w-4 text-red-600' })), _jsxs("span", { className: cn('text-sm font-medium', growthRate >= 0 ? 'text-green-600' : 'text-red-600'), children: [Math.abs(growthRate).toFixed(1), "% from last month"] })] })] }), _jsx("div", { className: 'w-12 h-12 bg-green-100 rounded-full flex items-center justify-center', children: _jsx(DollarSign, { className: 'h-6 w-6 text-green-600' }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: 'p-4', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Pending Payouts" }), _jsxs("p", { className: 'text-2xl font-bold', children: ["$", summary.pendingCommissions.toLocaleString()] }), _jsxs("p", { className: 'text-sm text-muted-foreground mt-1', children: [commissions.filter(c => c.status === 'pending' || c.status === 'approved').length, ' ', "pending"] })] }), _jsx("div", { className: 'w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center', children: _jsx(Clock, { className: 'h-6 w-6 text-yellow-600' }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: 'p-4', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Avg Commission Rate" }), _jsxs("p", { className: 'text-2xl font-bold', children: [summary.averageCommissionRate, "%"] }), _jsx("p", { className: 'text-sm text-muted-foreground mt-1', children: "Across all services" })] }), _jsx("div", { className: 'w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center', children: _jsx(Percent, { className: 'h-6 w-6 text-blue-600' }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: 'p-4', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Total Referrals" }), _jsx("p", { className: 'text-2xl font-bold', children: summary.totalReferrals }), _jsxs("p", { className: 'text-sm text-muted-foreground mt-1', children: [summary.activeReviewers, " active reviewers"] })] }), _jsx("div", { className: 'w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center', children: _jsx(Users, { className: 'h-6 w-6 text-purple-600' }) })] }) }) })] }), isAdmin && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(Award, { className: 'h-5 w-5' }), "Top Performer This Month"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: 'flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border', children: [_jsxs("div", { className: 'flex items-center gap-4', children: [_jsx("div", { className: 'w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center', children: _jsx(Award, { className: 'h-6 w-6 text-yellow-600' }) }), _jsxs("div", { children: [_jsx("h4", { className: 'font-semibold', children: summary.topPerformer.name }), _jsx("p", { className: 'text-sm text-muted-foreground', children: "Top referral partner" })] })] }), _jsxs("div", { className: 'text-right', children: [_jsxs("p", { className: 'text-2xl font-bold text-yellow-700', children: ["$", summary.topPerformer.commissions.toLocaleString()] }), _jsx("p", { className: 'text-sm text-muted-foreground', children: "in commissions" })] })] }) })] })), _jsxs(Tabs, { defaultValue: 'commissions', className: 'space-y-6', children: [_jsxs(TabsList, { className: 'grid w-full grid-cols-3', children: [_jsx(TabsTrigger, { value: 'commissions', children: "Commission Records" }), _jsx(TabsTrigger, { value: 'analytics', children: "Analytics" }), _jsx(TabsTrigger, { value: 'settings', children: "Settings" })] }), _jsxs(TabsContent, { value: 'commissions', className: 'space-y-6', children: [_jsx(Card, { children: _jsx(CardContent, { className: 'p-4', children: _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-4 gap-4', children: [_jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { children: "Search" }), _jsxs("div", { className: 'relative', children: [_jsx(Search, { className: 'absolute left-3 top-3 h-4 w-4 text-muted-foreground' }), _jsx(Input, { placeholder: 'Search commissions...', value: searchQuery, onChange: e => setSearchQuery(e.target.value), className: 'pl-10' })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { children: "Status" }), _jsxs(Select, { value: filters.status, onValueChange: value => setFilters(f => ({ ...f, status: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'all', children: "All Status" }), _jsx(SelectItem, { value: 'pending', children: "Pending" }), _jsx(SelectItem, { value: 'approved', children: "Approved" }), _jsx(SelectItem, { value: 'paid', children: "Paid" }), _jsx(SelectItem, { value: 'disputed', children: "Disputed" })] })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { children: "Service Type" }), _jsxs(Select, { value: filters.serviceType, onValueChange: value => setFilters(f => ({ ...f, serviceType: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'all', children: "All Types" }), _jsx(SelectItem, { value: 'review', children: "Review" }), _jsx(SelectItem, { value: 'consultation', children: "Consultation" }), _jsx(SelectItem, { value: 'retainer', children: "Retainer" })] })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { children: "Date Range" }), _jsxs(Select, { value: filters.dateRange, onValueChange: value => setFilters(f => ({ ...f, dateRange: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'this_month', children: "This Month" }), _jsx(SelectItem, { value: 'last_month', children: "Last Month" }), _jsx(SelectItem, { value: 'quarter', children: "This Quarter" }), _jsx(SelectItem, { value: 'year', children: "This Year" })] })] })] })] }) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: ["Commission Records (", filteredCommissions.length, ")"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: 'space-y-4', children: [filteredCommissions.map(commission => (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: 'border rounded-lg p-4 hover:border-blue-200 transition-colors', children: [_jsxs("div", { className: 'flex items-start justify-between mb-3', children: [_jsxs("div", { className: 'space-y-1', children: [_jsxs("div", { className: 'flex items-center gap-3', children: [_jsxs("h4", { className: 'font-medium', children: ["Referral #", commission.referralId] }), _jsx(Badge, { className: getStatusColor(commission.status), children: _jsxs("div", { className: 'flex items-center gap-1', children: [getStatusIcon(commission.status), commission.status] }) }), _jsx(Badge, { variant: 'outline', className: 'capitalize', children: commission.serviceType })] }), _jsx("p", { className: 'text-sm text-muted-foreground', children: commission.serviceDescription })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: 'ghost', size: 'sm', children: _jsx(MoreVertical, { className: 'h-4 w-4' }) }) }), _jsxs(DropdownMenuContent, { children: [_jsxs(DropdownMenuItem, { onClick: () => setSelectedCommission(commission), children: [_jsx(Eye, { className: 'h-4 w-4 mr-2' }), "View Details"] }), isAdmin && commission.status === 'approved' && (_jsxs(DropdownMenuItem, { onClick: () => handleProcessPayment(commission.id), children: [_jsx(CreditCard, { className: 'h-4 w-4 mr-2' }), "Process Payment"] })), _jsxs(DropdownMenuItem, { children: [_jsx(Download, { className: 'h-4 w-4 mr-2' }), "Export Record"] })] })] })] }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-4 gap-4 text-sm', children: [_jsxs("div", { children: [_jsx(Label, { className: 'text-xs text-muted-foreground', children: "Reviewer" }), _jsx("p", { className: 'font-medium', children: commission.reviewerName })] }), _jsxs("div", { children: [_jsx(Label, { className: 'text-xs text-muted-foreground', children: "Client" }), _jsx("p", { className: 'font-medium', children: commission.clientName })] }), _jsxs("div", { children: [_jsx(Label, { className: 'text-xs text-muted-foreground', children: "Service Amount" }), _jsxs("p", { className: 'font-medium', children: ["$", commission.serviceAmount.toLocaleString()] })] }), _jsxs("div", { children: [_jsxs(Label, { className: 'text-xs text-muted-foreground', children: ["Commission (", commission.commissionRate, "%)"] }), _jsxs("p", { className: 'font-bold text-green-600', children: ["$", commission.commissionAmount.toLocaleString()] })] })] }), _jsxs("div", { className: 'flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground', children: [_jsxs("span", { children: ["Created:", ' ', new Date(commission.createdAt).toLocaleDateString()] }), commission.paidAt && (_jsxs("span", { children: ["Paid:", ' ', new Date(commission.paidAt).toLocaleDateString()] })), commission.paymentMethod && (_jsx(Badge, { variant: 'outline', className: 'text-xs', children: commission.paymentMethod.replace('_', ' ') }))] })] }, commission.id))), filteredCommissions.length === 0 && (_jsxs("div", { className: 'text-center py-8 text-muted-foreground', children: [_jsx(FileText, { className: 'h-12 w-12 mx-auto mb-4 opacity-50' }), _jsx("p", { children: "No commission records match the current filters" })] }))] }) })] })] }), _jsx(TabsContent, { value: 'analytics', className: 'space-y-6', children: _jsxs("div", { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6', children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(BarChart3, { className: 'h-5 w-5' }), "Commission Trends"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-sm', children: "January 2024" }), _jsxs("span", { className: 'font-semibold', children: ["$", summary.thisMonthCommissions] })] }), _jsx(Progress, { value: 75, className: 'h-2' }), _jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-sm', children: "December 2023" }), _jsxs("span", { className: 'font-semibold', children: ["$", summary.lastMonthCommissions] })] }), _jsx(Progress, { value: 90, className: 'h-2' }), _jsxs("div", { className: 'text-sm text-muted-foreground', children: [growthRate >= 0 ? 'Growth' : 'Decline', " of", ' ', Math.abs(growthRate).toFixed(1), "% month-over-month"] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(PieChart, { className: 'h-5 w-5' }), "Service Type Breakdown"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("div", { className: 'w-3 h-3 bg-blue-500 rounded-full' }), _jsx("span", { className: 'text-sm', children: "Reviews" })] }), _jsx("span", { className: 'font-semibold', children: "45%" })] }), _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("div", { className: 'w-3 h-3 bg-green-500 rounded-full' }), _jsx("span", { className: 'text-sm', children: "Consultations" })] }), _jsx("span", { className: 'font-semibold', children: "35%" })] }), _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("div", { className: 'w-3 h-3 bg-purple-500 rounded-full' }), _jsx("span", { className: 'text-sm', children: "Retainers" })] }), _jsx("span", { className: 'font-semibold', children: "20%" })] })] }) })] })] }) }), _jsx(TabsContent, { value: 'settings', className: 'space-y-6', children: isAdmin && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Commission Settings" }) }), _jsxs(CardContent, { className: 'space-y-6', children: [_jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-3 gap-4', children: [_jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { children: "Default Review Commission (%)" }), _jsx(Input, { type: 'number', placeholder: '25' })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { children: "Default Consultation Commission (%)" }), _jsx(Input, { type: 'number', placeholder: '20' })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { children: "Default Retainer Commission (%)" }), _jsx(Input, { type: 'number', placeholder: '15' })] })] }), _jsx(Separator, {}), _jsxs("div", { className: 'space-y-4', children: [_jsx(Label, { className: 'text-base font-medium', children: "Payment Processing" }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-4', children: [_jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { children: "Minimum Payout Amount" }), _jsx(Input, { type: 'number', placeholder: '50' })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { children: "Payment Schedule" }), _jsxs(Select, { defaultValue: 'monthly', children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'weekly', children: "Weekly" }), _jsx(SelectItem, { value: 'biweekly', children: "Bi-weekly" }), _jsx(SelectItem, { value: 'monthly', children: "Monthly" })] })] })] })] })] }), _jsx(Button, { children: "Save Settings" })] })] })) })] }), _jsx(Dialog, { open: !!selectedCommission, onOpenChange: () => setSelectedCommission(null), children: _jsxs(DialogContent, { className: 'max-w-2xl', children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Commission Details" }) }), selectedCommission && (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsxs("div", { className: 'space-y-3', children: [_jsxs("div", { children: [_jsx(Label, { className: 'text-sm text-muted-foreground', children: "Referral ID" }), _jsx("p", { className: 'font-medium', children: selectedCommission.referralId })] }), _jsxs("div", { children: [_jsx(Label, { className: 'text-sm text-muted-foreground', children: "Status" }), _jsx(Badge, { className: getStatusColor(selectedCommission.status), children: selectedCommission.status })] }), _jsxs("div", { children: [_jsx(Label, { className: 'text-sm text-muted-foreground', children: "Service Type" }), _jsx("p", { className: 'font-medium capitalize', children: selectedCommission.serviceType })] })] }), _jsxs("div", { className: 'space-y-3', children: [_jsxs("div", { children: [_jsx(Label, { className: 'text-sm text-muted-foreground', children: "Service Amount" }), _jsxs("p", { className: 'font-medium', children: ["$", selectedCommission.serviceAmount.toLocaleString()] })] }), _jsxs("div", { children: [_jsx(Label, { className: 'text-sm text-muted-foreground', children: "Commission Rate" }), _jsxs("p", { className: 'font-medium', children: [selectedCommission.commissionRate, "%"] })] }), _jsxs("div", { children: [_jsx(Label, { className: 'text-sm text-muted-foreground', children: "Commission Amount" }), _jsxs("p", { className: 'font-bold text-green-600', children: ["$", selectedCommission.commissionAmount.toLocaleString()] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: 'space-y-3', children: [_jsxs("div", { children: [_jsx(Label, { className: 'text-sm text-muted-foreground', children: "Reviewer" }), _jsx("p", { className: 'font-medium', children: selectedCommission.reviewerName })] }), _jsxs("div", { children: [_jsx(Label, { className: 'text-sm text-muted-foreground', children: "Client" }), _jsx("p", { className: 'font-medium', children: selectedCommission.clientName })] }), _jsxs("div", { children: [_jsx(Label, { className: 'text-sm text-muted-foreground', children: "Service Description" }), _jsx("p", { className: 'font-medium', children: selectedCommission.serviceDescription })] })] }), _jsx(Separator, {}), _jsxs("div", { className: 'grid grid-cols-2 gap-4 text-sm', children: [_jsxs("div", { children: [_jsx(Label, { className: 'text-xs text-muted-foreground', children: "Created" }), _jsx("p", { children: new Date(selectedCommission.createdAt).toLocaleString() })] }), selectedCommission.paidAt && (_jsxs("div", { children: [_jsx(Label, { className: 'text-xs text-muted-foreground', children: "Paid" }), _jsx("p", { children: new Date(selectedCommission.paidAt).toLocaleString() })] }))] }), isAdmin && selectedCommission.status === 'approved' && (_jsx("div", { className: 'flex gap-3 pt-4', children: _jsx(Button, { onClick: () => handleProcessPayment(selectedCommission.id), disabled: isLoading, className: 'flex-1', children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: 'h-4 w-4 mr-2 animate-spin' }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { className: 'h-4 w-4 mr-2' }), "Process Payment"] })) }) }))] }))] }) })] }));
}
