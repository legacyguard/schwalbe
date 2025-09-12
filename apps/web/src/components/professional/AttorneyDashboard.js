import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Attorney Dashboard for Document Review
 * Professional interface for attorneys to manage document reviews
 */
import { useEffect, useState } from 'react';
import { Award, BarChart3, Calendar, CheckCircle, Clock, DollarSign, Download, Eye, FileText, MessageSquare, Search, Star, TrendingUp, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@schwalbe/ui/card';
import { Button } from '@schwalbe/ui/button';
import { Input } from '@schwalbe/ui/input';
import { Badge } from '@schwalbe/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@schwalbe/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@schwalbe/ui/tabs';
import { Progress } from '@schwalbe/ui/progress';
import { motion } from 'framer-motion';
import { cn } from '@schwalbe/lib/utils';
export function AttorneyDashboard({ reviewer, pendingReviews = [], completedReviews = [], onReviewDocument, onAcceptReview, onDeclineReview, className, }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({
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
        const completedThisMonth = completedReviews.filter(review => new Date(review.completed_at || '') >= startOfMonth).length;
        const totalEarnings = completedReviews.reduce((sum, review) => sum + (review.review_fee || 0), 0);
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
        const matchesSearch = searchQuery === '' ||
            review.document_id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === 'all' || review.priority === priorityFilter;
        const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
        return matchesSearch && matchesPriority && matchesStatus;
    });
    const getStatusColor = (status) => {
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
    const getPriorityColor = (priority) => {
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
    const getReviewTypeLabel = (type) => {
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
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        if (diffInHours < 1)
            return 'Just now';
        if (diffInHours < 24)
            return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1)
            return 'Yesterday';
        return `${diffInDays} days ago`;
    };
    return (_jsxs("div", { className: cn('space-y-6', className), children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsxs("h1", { className: 'text-3xl font-bold text-gray-900', children: ["Welcome back, ", reviewer.fullName.split(' ')[0]] }), _jsxs("p", { className: 'text-gray-600 mt-1', children: [reviewer.type, " - ", reviewer.jurisdiction] })] }), _jsxs("div", { className: 'flex items-center gap-3', children: [_jsx(Badge, { className: 'bg-emerald-100 text-emerald-800 border-emerald-200', children: reviewer.verified ? 'Verified' : 'Pending Verification' }), _jsxs(Badge, { variant: 'outline', className: 'flex items-center gap-1', children: [_jsx(Star, { className: 'h-3 w-3 fill-yellow-400 text-yellow-400' }), stats.averageRating] })] })] }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', children: [_jsx(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.1 }, children: _jsx(Card, { children: _jsx(CardContent, { className: 'p-6', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium text-gray-600', children: "Pending Reviews" }), _jsx("p", { className: 'text-3xl font-bold text-gray-900', children: stats.pendingReviews })] }), _jsx("div", { className: 'h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center', children: _jsx(Clock, { className: 'h-6 w-6 text-blue-600' }) })] }) }) }) }), _jsx(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.2 }, children: _jsx(Card, { children: _jsx(CardContent, { className: 'p-6', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium text-gray-600', children: "Completed This Month" }), _jsx("p", { className: 'text-3xl font-bold text-gray-900', children: stats.completedThisMonth })] }), _jsx("div", { className: 'h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center', children: _jsx(CheckCircle, { className: 'h-6 w-6 text-green-600' }) })] }) }) }) }), _jsx(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.3 }, children: _jsx(Card, { children: _jsx(CardContent, { className: 'p-6', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium text-gray-600', children: "Total Earnings" }), _jsxs("p", { className: 'text-3xl font-bold text-gray-900', children: ["$", stats.totalEarnings.toLocaleString()] })] }), _jsx("div", { className: 'h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center', children: _jsx(DollarSign, { className: 'h-6 w-6 text-green-600' }) })] }) }) }) }), _jsx(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.4 }, children: _jsx(Card, { children: _jsx(CardContent, { className: 'p-6', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium text-gray-600', children: "Avg Response Time" }), _jsxs("p", { className: 'text-3xl font-bold text-gray-900', children: [stats.responseTime, "h"] })] }), _jsx("div", { className: 'h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center', children: _jsx(TrendingUp, { className: 'h-6 w-6 text-purple-600' }) })] }) }) }) })] }), _jsxs(Tabs, { defaultValue: 'pending', className: 'space-y-6', children: [_jsxs(TabsList, { className: 'grid w-full grid-cols-3', children: [_jsxs(TabsTrigger, { value: 'pending', children: ["Pending Reviews (", stats.pendingReviews, ")"] }), _jsxs(TabsTrigger, { value: 'completed', children: ["Completed (", stats.totalReviews, ")"] }), _jsx(TabsTrigger, { value: 'analytics', children: "Analytics" })] }), _jsxs(TabsContent, { value: 'pending', className: 'space-y-6', children: [_jsx(Card, { children: _jsx(CardContent, { className: 'p-4', children: _jsxs("div", { className: 'flex flex-wrap gap-4', children: [_jsx("div", { className: 'flex-1 min-w-60', children: _jsxs("div", { className: 'relative', children: [_jsx(Search, { className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' }), _jsx(Input, { placeholder: 'Search reviews...', value: searchQuery, onChange: e => setSearchQuery(e.target.value), className: 'pl-10' })] }) }), _jsxs(Select, { value: priorityFilter, onValueChange: setPriorityFilter, children: [_jsx(SelectTrigger, { className: 'w-40', children: _jsx(SelectValue, { placeholder: 'Priority' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'all', children: "All Priority" }), _jsx(SelectItem, { value: 'urgent', children: "Urgent" }), _jsx(SelectItem, { value: 'high', children: "High" }), _jsx(SelectItem, { value: 'medium', children: "Medium" }), _jsx(SelectItem, { value: 'low', children: "Low" })] })] }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: 'w-40', children: _jsx(SelectValue, { placeholder: 'Status' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'all', children: "All Status" }), _jsx(SelectItem, { value: 'requested', children: "Requested" }), _jsx(SelectItem, { value: 'assigned', children: "Assigned" }), _jsx(SelectItem, { value: 'in_progress', children: "In Progress" })] })] })] }) }) }), _jsx("div", { className: 'space-y-4', children: filteredReviews.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: 'p-12 text-center', children: [_jsx(FileText, { className: 'h-12 w-12 text-gray-400 mx-auto mb-4' }), _jsx("h3", { className: 'text-lg font-semibold text-gray-900 mb-2', children: "No reviews found" }), _jsx("p", { className: 'text-gray-600', children: searchQuery ||
                                                    priorityFilter !== 'all' ||
                                                    statusFilter !== 'all'
                                                    ? 'Try adjusting your search or filters'
                                                    : 'All caught up! New reviews will appear here.' })] }) })) : (filteredReviews.map((review, index) => (_jsx(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: index * 0.1 }, children: _jsx(Card, { className: 'hover:shadow-lg transition-shadow', children: _jsx(CardContent, { className: 'p-6', children: _jsxs("div", { className: 'flex items-start justify-between', children: [_jsxs("div", { className: 'flex-1 space-y-3', children: [_jsxs("div", { className: 'flex items-center gap-3', children: [_jsx("h3", { className: 'font-semibold text-lg text-gray-900', children: getReviewTypeLabel(review.review_type) }), _jsxs(Badge, { className: cn('text-xs', getPriorityColor(review.priority)), children: [review.priority, " priority"] }), _jsx(Badge, { className: cn('text-xs', getStatusColor(review.status)), children: review.status.replace('_', ' ') })] }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Calendar, { className: 'h-4 w-4' }), _jsxs("span", { children: ["Requested ", formatTimeAgo(review.requested_at)] })] }), review.due_date && (_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Clock, { className: 'h-4 w-4' }), _jsxs("span", { children: ["Due", ' ', new Date(review.due_date).toLocaleDateString()] })] })), review.review_fee && (_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(DollarSign, { className: 'h-4 w-4' }), _jsxs("span", { children: ["$", review.review_fee] })] }))] }), review.notes && (_jsx("p", { className: 'text-sm text-gray-700 bg-gray-50 p-3 rounded-lg', children: review.notes }))] }), _jsxs("div", { className: 'flex gap-2 ml-4', children: [review.status === 'requested' && (_jsxs(_Fragment, { children: [_jsx(Button, { size: 'sm', variant: 'outline', onClick: () => onDeclineReview(review.id), className: 'text-gray-600 hover:text-red-600', children: "Decline" }), _jsx(Button, { size: 'sm', onClick: () => onAcceptReview(review.id), className: 'bg-green-600 hover:bg-green-700', children: "Accept Review" })] })), (review.status === 'assigned' ||
                                                                review.status === 'in_progress') && (_jsxs(_Fragment, { children: [_jsxs(Button, { size: 'sm', variant: 'outline', onClick: () => onReviewDocument(review.id), className: 'flex items-center gap-1', children: [_jsx(Eye, { className: 'h-4 w-4' }), "View Document"] }), _jsxs(Button, { size: 'sm', onClick: () => onReviewDocument(review.id), className: 'flex items-center gap-1', children: [_jsx(MessageSquare, { className: 'h-4 w-4' }), "Continue Review"] })] }))] })] }) }) }) }, review.id)))) })] }), _jsx(TabsContent, { value: 'completed', className: 'space-y-6', children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Completed Reviews" }) }), _jsx(CardContent, { children: _jsx("div", { className: 'space-y-4', children: completedReviews.length === 0 ? (_jsxs("div", { className: 'text-center py-12', children: [_jsx(Award, { className: 'h-12 w-12 text-gray-400 mx-auto mb-4' }), _jsx("h3", { className: 'text-lg font-semibold text-gray-900 mb-2', children: "No completed reviews yet" }), _jsx("p", { className: 'text-gray-600', children: "Your completed reviews will appear here" })] })) : (completedReviews.map(review => (_jsxs("div", { className: 'flex items-center justify-between p-4 border rounded-lg', children: [_jsxs("div", { children: [_jsx("h4", { className: 'font-medium', children: getReviewTypeLabel(review.review_type) }), _jsxs("p", { className: 'text-sm text-gray-600', children: ["Completed", ' ', review.completed_at
                                                                    ? formatTimeAgo(review.completed_at)
                                                                    : 'Recently'] })] }), _jsxs("div", { className: 'flex items-center gap-4', children: [review.review_fee && (_jsxs("span", { className: 'font-medium text-green-600', children: ["+$", review.review_fee] })), _jsxs(Button, { size: 'sm', variant: 'outline', children: [_jsx(Eye, { className: 'h-4 w-4 mr-1' }), "View Report"] })] })] }, review.id)))) }) })] }) }), _jsx(TabsContent, { value: 'analytics', className: 'space-y-6', children: _jsxs("div", { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6', children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(BarChart3, { className: 'h-5 w-5' }), "Review Performance"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsxs("div", { className: 'flex items-center justify-between mb-2', children: [_jsx("span", { className: 'text-sm text-gray-600', children: "Response Time" }), _jsxs("span", { className: 'text-sm font-medium', children: [stats.responseTime, "h avg"] })] }), _jsx(Progress, { value: 85, className: 'h-2' })] }), _jsxs("div", { children: [_jsxs("div", { className: 'flex items-center justify-between mb-2', children: [_jsx("span", { className: 'text-sm text-gray-600', children: "Client Satisfaction" }), _jsxs("span", { className: 'text-sm font-medium', children: [stats.averageRating, "/5.0"] })] }), _jsx(Progress, { value: 96, className: 'h-2' })] }), _jsxs("div", { children: [_jsxs("div", { className: 'flex items-center justify-between mb-2', children: [_jsx("span", { className: 'text-sm text-gray-600', children: "Review Quality" }), _jsx("span", { className: 'text-sm font-medium', children: "Excellent" })] }), _jsx(Progress, { value: 92, className: 'h-2' })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(TrendingUp, { className: 'h-5 w-5' }), "Monthly Overview"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-gray-600', children: "Reviews Completed" }), _jsx("span", { className: 'font-semibold', children: stats.completedThisMonth })] }), _jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-gray-600', children: "Earnings This Month" }), _jsxs("span", { className: 'font-semibold text-green-600', children: ["$", stats.totalEarnings.toLocaleString()] })] }), _jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-gray-600', children: "Average Per Review" }), _jsxs("span", { className: 'font-semibold', children: ["$", stats.completedThisMonth > 0
                                                                        ? Math.round(stats.totalEarnings / stats.completedThisMonth).toLocaleString()
                                                                        : '0'] })] }), _jsx("div", { className: 'pt-4 border-t', children: _jsxs(Button, { className: 'w-full', variant: 'outline', children: [_jsx(Download, { className: 'h-4 w-4 mr-2' }), "Download Monthly Report"] }) })] }) })] })] }) })] })] }));
}
