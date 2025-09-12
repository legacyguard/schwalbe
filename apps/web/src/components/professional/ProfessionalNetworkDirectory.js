import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Professional Network Directory
 * Comprehensive directory of verified legal professionals
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Award, Calendar, CheckCircle, ChevronDown, Clock, Eye, FileText, Filter, Grid3X3, List, MapPin, MessageSquare, Search, Shield, SortAsc, SortDesc, Star, Target, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@schwalbe/ui/card';
import { Button } from '@schwalbe/ui/button';
import { Input } from '@schwalbe/ui/input';
import { Label } from '@schwalbe/ui/label';
import { Badge } from '@schwalbe/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@schwalbe/ui/avatar';
import { Separator } from '@schwalbe/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@schwalbe/ui/select';
import { Checkbox } from '@schwalbe/ui/checkbox';
import { Slider } from '@schwalbe/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@schwalbe/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@schwalbe/ui/dialog';
import { cn } from '@schwalbe/lib/utils';
const SAMPLE_PROFESSIONALS = [
    {
        id: '1',
        userId: 'user1',
        email: 'sarah.johnson@law.com',
        full_name: 'Sarah Johnson',
        fullName: 'Sarah Johnson',
        professional_title: 'Senior Attorney',
        law_firm_name: 'Johnson & Associates',
        bar_number: '123456',
        licensed_states: ['California', 'Nevada'],
        type: 'attorney',
        licenseNumber: '123456',
        jurisdiction: 'California',
        specializations: [
            { id: '1', name: 'Estate Planning', category: 'estate_planning' },
            { id: '2', name: 'Tax Law', category: 'tax_law' },
            { id: '3', name: 'Asset Protection', category: 'estate_planning' },
        ],
        experience: 15,
        experience_years: 15,
        verified: true,
        onboardingStatus: 'approved',
        createdAt: '2024-01-01',
        created_at: '2024-01-01',
        updatedAt: '2024-01-01',
        rating: 4.9,
        reviewCount: 127,
        responseTime: '< 2 hours',
        availability: 'available',
        featuredReview: {
            rating: 5,
            comment: 'Sarah provided exceptional guidance through our complex estate planning process. Her attention to detail and proactive communication made the entire experience smooth and reassuring.',
            clientName: 'Michael R.',
            date: '2024-01-10',
        },
        services: [
            {
                type: 'consultation',
                description: 'Initial estate planning consultation',
                startingPrice: 300,
            },
            {
                type: 'review',
                description: 'Comprehensive document review',
                startingPrice: 750,
            },
            {
                type: 'retainer',
                description: 'Ongoing legal counsel',
                startingPrice: 2500,
            },
        ],
        achievements: [
            'Top 10 Estate Attorneys 2023',
            'Client Choice Award',
            '15+ Years Experience',
        ],
        languages: ['English', 'Spanish'],
    },
    {
        id: '2',
        userId: 'user2',
        email: 'michael.chen@legaleagle.com',
        full_name: 'Michael Chen',
        fullName: 'Michael Chen',
        professional_title: 'Senior Partner',
        law_firm_name: 'LegalEagle Partners',
        bar_number: '789012',
        licensed_states: ['New York', 'New Jersey', 'Connecticut'],
        type: 'attorney',
        licenseNumber: '789012',
        jurisdiction: 'New York',
        specializations: [
            { id: '4', name: 'Business Law', category: 'business_law' },
            { id: '5', name: 'Real Estate Law', category: 'real_estate' },
            { id: '6', name: 'Family Law', category: 'family_law' },
        ],
        experience: 22,
        experience_years: 22,
        verified: true,
        onboardingStatus: 'approved',
        createdAt: '2024-01-01',
        created_at: '2024-01-01',
        updatedAt: '2024-01-01',
        rating: 4.8,
        reviewCount: 89,
        responseTime: '< 4 hours',
        availability: 'busy',
        featuredReview: {
            rating: 5,
            comment: 'Michael helped us restructure our business for optimal tax efficiency and succession planning. His expertise saved us thousands and provided peace of mind.',
            clientName: 'Jennifer L.',
            date: '2024-01-08',
        },
        services: [
            {
                type: 'consultation',
                description: 'Business succession consultation',
                startingPrice: 400,
            },
            {
                type: 'review',
                description: 'Business agreement review',
                startingPrice: 1200,
            },
            {
                type: 'retainer',
                description: 'Corporate counsel retainer',
                startingPrice: 5000,
            },
        ],
        achievements: [
            'Super Lawyers 2020-2024',
            'Business Journal Top Attorney',
            'Harvard Law Review',
        ],
        languages: ['English', 'Mandarin'],
    },
    {
        id: '3',
        userId: 'user3',
        email: 'emily.rodriguez@elderlaw.com',
        full_name: 'Emily Rodriguez',
        fullName: 'Emily Rodriguez',
        professional_title: 'Elder Law Attorney',
        law_firm_name: 'Rodriguez Elder Law',
        bar_number: '345678',
        licensed_states: ['Florida', 'Georgia'],
        type: 'attorney',
        licenseNumber: '345678',
        jurisdiction: 'Florida',
        specializations: [
            { id: '7', name: 'Elder Law', category: 'estate_planning' },
            { id: '8', name: 'Probate Law', category: 'estate_planning' },
            { id: '9', name: 'Healthcare Directives', category: 'estate_planning' },
        ],
        experience: 12,
        experience_years: 12,
        verified: true,
        onboardingStatus: 'approved',
        createdAt: '2024-01-01',
        created_at: '2024-01-01',
        updatedAt: '2024-01-01',
        rating: 4.9,
        reviewCount: 156,
        responseTime: '< 1 hour',
        availability: 'available',
        featuredReview: {
            rating: 5,
            comment: 'Emily guided our family through a difficult time with incredible compassion and expertise. She made complex legal matters understandable and manageable.',
            clientName: 'Robert K.',
            date: '2024-01-12',
        },
        services: [
            {
                type: 'consultation',
                description: 'Elder care planning session',
                startingPrice: 250,
            },
            {
                type: 'review',
                description: 'Healthcare directive review',
                startingPrice: 400,
            },
            {
                type: 'retainer',
                description: 'Family legal support',
                startingPrice: 1500,
            },
        ],
        achievements: [
            'Elder Law Specialist Certification',
            'Community Service Award',
            'Client Advocate 2023',
        ],
        languages: ['English', 'Spanish', 'Portuguese'],
    },
];
export function ProfessionalNetworkDirectory({ onSelectProfessional, onBookConsultation, onRequestReview, className, }) {
    const { t } = useTranslation('ui/professional-network');
    const SPECIALIZATIONS = t('specializations', { returnObjects: true });
    const [professionals] = useState(SAMPLE_PROFESSIONALS);
    const [filters, setFilters] = useState({
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
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const filteredAndSortedProfessionals = professionals
        .filter(prof => {
        // Search filter
        if (filters.search) {
            const search = filters.search.toLowerCase();
            if (!prof.full_name.toLowerCase().includes(search) &&
                !prof.professional_title?.toLowerCase().includes(search) &&
                !prof.law_firm_name?.toLowerCase().includes(search) &&
                !prof.specializations.some(s => s.name.toLowerCase().includes(search))) {
                return false;
            }
        }
        // Specialization filter
        if (filters.specializations.length > 0) {
            const profSpecs = prof.specializations.map(s => s.name);
            if (!filters.specializations.some(spec => profSpecs.includes(spec))) {
                return false;
            }
        }
        // State filter
        if (filters.states.length > 0) {
            if (!filters.states.some(state => prof.licensed_states?.includes(state))) {
                return false;
            }
        }
        // Experience range
        if (prof.experience_years < filters.experienceRange[0] ||
            prof.experience_years > filters.experienceRange[1]) {
            return false;
        }
        // Rating filter
        if (prof.rating < filters.ratingMin) {
            return false;
        }
        // Price range
        if (prof.hourly_rate &&
            (prof.hourly_rate < filters.priceRange[0] ||
                prof.hourly_rate > filters.priceRange[1])) {
            return false;
        }
        // Availability filter
        if (filters.availability !== 'all' &&
            prof.availability !== filters.availability) {
            return false;
        }
        // Language filter
        if (filters.languages.length > 0) {
            if (!filters.languages.some(lang => prof.languages?.includes(lang))) {
                return false;
            }
        }
        return true;
    })
        .sort((a, b) => {
        let aValue;
        let bValue;
        switch (filters.sortBy) {
            case 'rating':
                aValue = a.rating;
                bValue = b.rating;
                break;
            case 'experience':
                aValue = a.experience_years;
                bValue = b.experience_years;
                break;
            case 'price':
                aValue = a.hourly_rate || 0;
                bValue = b.hourly_rate || 0;
                break;
            case 'reviews':
                aValue = a.reviewCount;
                bValue = b.reviewCount;
                break;
            default:
                return 0;
        }
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
    const getAvailabilityColor = (availability) => {
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
    const renderProfessionalCard = (professional) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: 'group', children: _jsxs(Card, { className: 'h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer', onClick: () => setSelectedProfessional(professional), children: [_jsx(CardHeader, { className: 'pb-4', children: _jsxs("div", { className: 'flex items-start gap-4', children: [_jsxs("div", { className: 'relative', children: [_jsxs(Avatar, { className: 'w-16 h-16 border-2 border-white shadow-lg', children: [_jsx(AvatarImage, { src: professional.profile_image_url }), _jsx(AvatarFallback, { className: 'text-lg font-semibold', children: professional.full_name
                                                    .split(' ')
                                                    .map(n => n[0])
                                                    .join('') })] }), _jsx("div", { className: cn('absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white', professional.availability === 'available'
                                            ? 'bg-green-500'
                                            : professional.availability === 'busy'
                                                ? 'bg-yellow-500'
                                                : 'bg-gray-400') })] }), _jsxs("div", { className: 'flex-1 min-w-0', children: [_jsxs("div", { className: 'flex items-start justify-between mb-2', children: [_jsxs("div", { className: 'min-w-0 flex-1', children: [_jsx("h3", { className: 'font-semibold text-lg truncate', children: professional.full_name }), _jsx("p", { className: 'text-muted-foreground text-sm truncate', children: professional.professional_title }), professional.law_firm_name && (_jsx("p", { className: 'text-xs text-muted-foreground truncate', children: professional.law_firm_name }))] }), _jsxs("div", { className: 'flex flex-col items-end gap-1 ml-2', children: [_jsxs("div", { className: 'flex items-center gap-1', children: [_jsx(Star, { className: 'h-4 w-4 text-yellow-500 fill-current' }), _jsx("span", { className: 'text-sm font-medium', children: professional.rating }), _jsxs("span", { className: 'text-xs text-muted-foreground', children: ["(", professional.reviewCount, ")"] })] }), _jsx(Badge, { className: getAvailabilityColor(professional.availability), variant: 'outline', children: t(`availability.${professional.availability}`) })] })] }), _jsxs("div", { className: 'flex items-center gap-3 text-xs text-muted-foreground mb-3', children: [_jsxs("span", { className: 'flex items-center gap-1', children: [_jsx(Award, { className: 'h-3 w-3' }), professional.experience_years, " ", t('professionalCard.yearsAbbr')] }), _jsxs("span", { className: 'flex items-center gap-1', children: [_jsx(Clock, { className: 'h-3 w-3' }), professional.responseTime] }), _jsxs("span", { className: 'flex items-center gap-1', children: [_jsx(MapPin, { className: 'h-3 w-3' }), (professional.licensed_states?.length || 0) !== 1
                                                        ? t('professionalCard.statesCountPlural', { count: professional.licensed_states?.length || 0 })
                                                        : t('professionalCard.statesCount', { count: professional.licensed_states?.length || 0 })] })] })] })] }) }), _jsxs(CardContent, { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { className: 'text-sm font-medium mb-2 block', children: t('professionalCard.specializations') }), _jsxs("div", { className: 'flex flex-wrap gap-1', children: [professional.specializations.slice(0, 3).map(spec => (_jsx(Badge, { variant: 'secondary', className: 'text-xs', children: spec.name }, spec.id))), professional.specializations.length > 3 && (_jsx(Badge, { variant: 'outline', className: 'text-xs', children: t('professionalCard.more', { count: professional.specializations.length - 3 }) }))] })] }), professional.bio && (_jsx("div", { children: _jsx("p", { className: 'text-sm text-muted-foreground line-clamp-2', children: professional.bio }) })), professional.featuredReview && (_jsxs("div", { className: 'bg-blue-50 rounded-lg p-3', children: [_jsxs("div", { className: 'flex items-center gap-1 mb-1', children: [[...Array(professional.featuredReview.rating)].map((_, i) => (_jsx(Star, { className: 'h-3 w-3 text-yellow-500 fill-current' }, i))), _jsxs("span", { className: 'text-xs text-muted-foreground ml-1', children: ["- ", professional.featuredReview.clientName] })] }), _jsxs("p", { className: 'text-xs text-muted-foreground line-clamp-2', children: ["\"", professional.featuredReview.comment, "\""] })] })), _jsxs("div", { className: 'space-y-2', children: [_jsxs("div", { className: 'flex items-center justify-between text-sm', children: [_jsx("span", { className: 'text-muted-foreground', children: t('professionalCard.startingFrom') }), _jsxs("span", { className: 'font-semibold', children: ["$", professional.hourly_rate, t('professionalCard.perHour')] })] }), _jsxs("div", { className: 'grid grid-cols-2 gap-2', children: [_jsxs(Button, { size: 'sm', onClick: e => {
                                                e.stopPropagation();
                                                onBookConsultation(professional);
                                            }, className: 'text-xs', children: [_jsx(Calendar, { className: 'h-3 w-3 mr-1' }), t('professionalCard.bookCall')] }), _jsxs(Button, { size: 'sm', variant: 'outline', onClick: e => {
                                                e.stopPropagation();
                                                onRequestReview(professional);
                                            }, className: 'text-xs', children: [_jsx(FileText, { className: 'h-3 w-3 mr-1' }), t('professionalCard.review')] })] })] })] })] }) }, professional.id));
    const renderProfessionalListItem = (professional) => (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: 'group', children: _jsx(Card, { className: 'hover:shadow-lg transition-all duration-300 border hover:border-blue-200 cursor-pointer', onClick: () => setSelectedProfessional(professional), children: _jsx(CardContent, { className: 'p-6', children: _jsxs("div", { className: 'flex items-start gap-6', children: [_jsxs("div", { className: 'relative flex-shrink-0', children: [_jsxs(Avatar, { className: 'w-20 h-20 border-2 border-white shadow-lg', children: [_jsx(AvatarImage, { src: professional.profile_image_url }), _jsx(AvatarFallback, { className: 'text-xl font-semibold', children: professional.full_name
                                                .split(' ')
                                                .map(n => n[0])
                                                .join('') })] }), _jsx("div", { className: cn('absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white', professional.availability === 'available'
                                        ? 'bg-green-500'
                                        : professional.availability === 'busy'
                                            ? 'bg-yellow-500'
                                            : 'bg-gray-400') })] }), _jsx("div", { className: 'flex-1 min-w-0', children: _jsxs("div", { className: 'flex items-start justify-between mb-3', children: [_jsxs("div", { className: 'min-w-0 flex-1', children: [_jsx("h3", { className: 'font-semibold text-xl mb-1', children: professional.full_name }), _jsx("p", { className: 'text-muted-foreground mb-1', children: professional.professional_title }), professional.law_firm_name && (_jsx("p", { className: 'text-sm text-muted-foreground mb-2', children: professional.law_firm_name })), _jsxs("div", { className: 'flex items-center gap-4 text-sm text-muted-foreground mb-3', children: [_jsxs("span", { className: 'flex items-center gap-1', children: [_jsx(Award, { className: 'h-4 w-4' }), t('listView.yearsExperience', { count: professional.experience_years })] }), _jsxs("span", { className: 'flex items-center gap-1', children: [_jsx(Clock, { className: 'h-4 w-4' }), t('listView.respondsIn', { time: professional.responseTime })] }), _jsxs("span", { className: 'flex items-center gap-1', children: [_jsx(MapPin, { className: 'h-4 w-4' }), professional.licensed_states?.join(', ') ||
                                                                t('listView.noStatesListed')] })] }), professional.bio && (_jsx("p", { className: 'text-sm text-muted-foreground line-clamp-2 mb-3', children: professional.bio })), _jsx("div", { className: 'flex flex-wrap gap-1 mb-3', children: professional.specializations.map(spec => (_jsx(Badge, { variant: 'secondary', className: 'text-xs', children: spec.name }, spec.id))) }), professional.achievements &&
                                                professional.achievements.length > 0 && (_jsx("div", { className: 'flex flex-wrap gap-1', children: professional.achievements
                                                    .slice(0, 2)
                                                    .map(achievement => (_jsxs(Badge, { variant: 'outline', className: 'text-xs', children: [_jsx(Award, { className: 'h-2 w-2 mr-1' }), achievement] }, achievement))) }))] }), _jsxs("div", { className: 'flex flex-col items-end gap-3 ml-4', children: [_jsxs("div", { className: 'text-right', children: [_jsxs("div", { className: 'flex items-center gap-1 mb-1', children: [_jsx(Star, { className: 'h-4 w-4 text-yellow-500 fill-current' }), _jsx("span", { className: 'text-lg font-bold', children: professional.rating }), _jsxs("span", { className: 'text-sm text-muted-foreground', children: ["(", professional.reviewCount, ")"] })] }), _jsx(Badge, { className: getAvailabilityColor(professional.availability), children: t(`availability.${professional.availability}`) })] }), _jsxs("div", { className: 'text-right', children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: t('professionalCard.startingFrom') }), _jsxs("p", { className: 'text-xl font-bold', children: ["$", professional.hourly_rate, t('professionalCard.perHour')] })] }), _jsxs("div", { className: 'flex gap-2', children: [_jsxs(Button, { size: 'sm', onClick: e => {
                                                            e.stopPropagation();
                                                            onBookConsultation(professional);
                                                        }, children: [_jsx(Calendar, { className: 'h-4 w-4 mr-2' }), t('professionalCard.bookConsultation')] }), _jsxs(Button, { size: 'sm', variant: 'outline', onClick: e => {
                                                            e.stopPropagation();
                                                            onRequestReview(professional);
                                                        }, children: [_jsx(FileText, { className: 'h-4 w-4 mr-2' }), t('professionalCard.requestReview')] })] })] })] }) })] }) }) }) }, professional.id));
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: cn('space-y-6', className), children: [_jsxs("div", { className: 'text-center space-y-4', children: [_jsxs("div", { className: 'inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium', children: [_jsx(Shield, { className: 'h-4 w-4' }), t('header.badge')] }), _jsx("h2", { className: 'text-3xl font-bold', children: t('header.title') }), _jsx("p", { className: 'text-muted-foreground max-w-2xl mx-auto', children: t('header.description') })] }), _jsx(Card, { children: _jsx(CardContent, { className: 'p-6', children: _jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'relative', children: [_jsx(Search, { className: 'absolute left-4 top-3 h-5 w-5 text-muted-foreground' }), _jsx(Input, { placeholder: t('search.placeholder'), value: filters.search, onChange: e => setFilters(prev => ({ ...prev, search: e.target.value })), className: 'pl-12 pr-4 h-12 text-lg' })] }), _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { className: 'flex items-center gap-4', children: [_jsxs(Button, { variant: 'outline', onClick: () => setShowFilters(!showFilters), className: 'gap-2', children: [_jsx(Filter, { className: 'h-4 w-4' }), t('search.advancedFilters'), _jsx(ChevronDown, { className: cn('h-4 w-4 transition-transform', showFilters && 'rotate-180') })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Label, { className: 'text-sm', children: t('sorting.label') }), _jsxs(Select, { value: filters.sortBy, onValueChange: (value) => setFilters(prev => ({ ...prev, sortBy: value })), children: [_jsx(SelectTrigger, { className: 'w-32', children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'rating', children: t('sorting.options.rating') }), _jsx(SelectItem, { value: 'experience', children: t('sorting.options.experience') }), _jsx(SelectItem, { value: 'price', children: t('sorting.options.price') }), _jsx(SelectItem, { value: 'reviews', children: t('sorting.options.reviews') })] })] }), _jsx(Button, { variant: 'outline', size: 'sm', onClick: () => setFilters(prev => ({
                                                            ...prev,
                                                            sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
                                                        })), children: filters.sortOrder === 'asc' ? (_jsx(SortAsc, { className: 'h-4 w-4' })) : (_jsx(SortDesc, { className: 'h-4 w-4' })) })] })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("span", { className: 'text-sm text-muted-foreground', children: t('search.results', { count: filteredAndSortedProfessionals.length }) }), _jsx(Separator, { orientation: 'vertical', className: 'h-6' }), _jsxs("div", { className: 'flex rounded-md border', children: [_jsx(Button, { variant: viewMode === 'grid' ? 'default' : 'ghost', size: 'sm', onClick: () => setViewMode('grid'), className: 'rounded-r-none', children: _jsx(Grid3X3, { className: 'h-4 w-4' }) }), _jsx(Button, { variant: viewMode === 'list' ? 'default' : 'ghost', size: 'sm', onClick: () => setViewMode('list'), className: 'rounded-l-none', children: _jsx(List, { className: 'h-4 w-4' }) })] })] })] }), _jsx(AnimatePresence, { children: showFilters && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: 'border-t pt-6', children: _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', children: [_jsxs("div", { className: 'space-y-3', children: [_jsx(Label, { className: 'font-medium', children: t('filters.specializations') }), _jsx("div", { className: 'space-y-2 max-h-32 overflow-y-auto', children: SPECIALIZATIONS.map(spec => (_jsxs("div", { className: 'flex items-center space-x-2', children: [_jsx(Checkbox, { id: spec, checked: filters.specializations.includes(spec), onCheckedChange: checked => {
                                                                        if (checked) {
                                                                            setFilters(prev => ({
                                                                                ...prev,
                                                                                specializations: [
                                                                                    ...prev.specializations,
                                                                                    spec,
                                                                                ],
                                                                            }));
                                                                        }
                                                                        else {
                                                                            setFilters(prev => ({
                                                                                ...prev,
                                                                                specializations: prev.specializations.filter(s => s !== spec),
                                                                            }));
                                                                        }
                                                                    } }), _jsx(Label, { htmlFor: spec, className: 'text-sm', children: spec })] }, spec))) })] }), _jsxs("div", { className: 'space-y-3', children: [_jsx(Label, { className: 'font-medium', children: t('filters.experienceRange') }), _jsxs("div", { className: 'px-2', children: [_jsx(Slider, { value: filters.experienceRange, onValueChange: (value) => setFilters(prev => ({
                                                                    ...prev,
                                                                    experienceRange: value,
                                                                })), max: 30, min: 0, step: 1, className: 'w-full' }), _jsxs("div", { className: 'flex justify-between text-sm text-muted-foreground mt-1', children: [_jsx("span", { children: t('filters.experienceYears', { count: filters.experienceRange[0] }) }), _jsx("span", { children: t('filters.experienceYears', { count: filters.experienceRange[1] }) })] })] })] }), _jsxs("div", { className: 'space-y-3', children: [_jsx(Label, { className: 'font-medium', children: t('filters.hourlyRateRange') }), _jsxs("div", { className: 'px-2', children: [_jsx(Slider, { value: filters.priceRange, onValueChange: (value) => setFilters(prev => ({
                                                                    ...prev,
                                                                    priceRange: value,
                                                                })), max: 1000, min: 100, step: 25, className: 'w-full' }), _jsxs("div", { className: 'flex justify-between text-sm text-muted-foreground mt-1', children: [_jsxs("span", { children: ["$", filters.priceRange[0]] }), _jsxs("span", { children: ["$", filters.priceRange[1]] })] })] })] }), _jsxs("div", { className: 'space-y-3', children: [_jsx(Label, { className: 'font-medium', children: t('filters.minimumRating') }), _jsxs(Select, { value: filters.ratingMin.toString(), onValueChange: value => setFilters(prev => ({
                                                            ...prev,
                                                            ratingMin: Number(value),
                                                        })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: '0', children: t('filters.rating.anyRating') }), _jsx(SelectItem, { value: '4', children: t('filters.rating.fourPlus') }), _jsx(SelectItem, { value: '4.5', children: t('filters.rating.fourFivePlus') }), _jsx(SelectItem, { value: '4.8', children: t('filters.rating.fourEightPlus') })] })] })] }), _jsxs("div", { className: 'space-y-3', children: [_jsx(Label, { className: 'font-medium', children: t('filters.availability') }), _jsxs(Select, { value: filters.availability, onValueChange: value => setFilters(prev => ({ ...prev, availability: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'all', children: t('filters.availability.all') }), _jsx(SelectItem, { value: 'available', children: t('filters.availability.available') }), _jsx(SelectItem, { value: 'busy', children: t('filters.availability.busy') })] })] })] }), _jsxs("div", { className: 'space-y-3', children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsx(Label, { className: 'font-medium', children: t('filters.activeFilters') }), (filters.specializations.length > 0 ||
                                                                filters.states.length > 0 ||
                                                                filters.languages.length > 0) && (_jsx(Button, { variant: "ghost", size: 'sm', onClick: resetFilters, children: t('filters.clearAll') }))] }), _jsx("div", { className: 'flex flex-wrap gap-1', children: filters.specializations.map(spec => (_jsxs(Badge, { variant: 'secondary', className: 'text-xs', children: [spec, _jsx(Button, { variant: "ghost", size: 'sm', className: 'ml-1 h-auto p-0 text-xs', onClick: () => setFilters(prev => ({
                                                                        ...prev,
                                                                        specializations: prev.specializations.filter(s => s !== spec),
                                                                    })), children: "\u00D7" })] }, spec))) })] })] }) })) })] }) }) }), _jsxs("div", { className: 'space-y-4', children: [viewMode === 'grid' ? (_jsx("div", { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', children: filteredAndSortedProfessionals.map(renderProfessionalCard) })) : (_jsx("div", { className: 'space-y-4', children: filteredAndSortedProfessionals.map(renderProfessionalListItem) })), filteredAndSortedProfessionals.length === 0 && (_jsx(Card, { children: _jsxs(CardContent, { className: 'p-12 text-center', children: [_jsx("div", { className: 'w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4', children: _jsx(Search, { className: 'h-8 w-8 text-gray-400' }) }), _jsx("h3", { className: 'text-lg font-semibold mb-2', children: t('noResults.title') }), _jsx("p", { className: 'text-muted-foreground mb-4', children: t('noResults.description') }), _jsx(Button, { variant: 'outline', onClick: resetFilters, children: t('noResults.resetButton') })] }) }))] }), _jsx(Dialog, { open: !!selectedProfessional, onOpenChange: () => setSelectedProfessional(null), children: _jsxs(DialogContent, { className: 'max-w-4xl max-h-[90vh] overflow-y-auto', children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: 'flex items-center gap-2', children: [_jsx(Eye, { className: 'h-5 w-5' }), t('modal.title')] }) }), selectedProfessional && (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg', children: [_jsxs(Avatar, { className: 'w-24 h-24 border-4 border-white shadow-lg', children: [_jsx(AvatarImage, { src: selectedProfessional.profile_image_url }), _jsx(AvatarFallback, { className: 'text-2xl font-semibold', children: selectedProfessional.full_name
                                                        .split(' ')
                                                        .map(n => n[0])
                                                        .join('') })] }), _jsxs("div", { className: 'flex-1', children: [_jsxs("div", { className: 'flex items-start justify-between mb-4', children: [_jsxs("div", { children: [_jsx("h2", { className: 'text-2xl font-bold mb-1', children: selectedProfessional.full_name }), _jsx("p", { className: 'text-lg text-muted-foreground mb-1', children: selectedProfessional.professional_title }), selectedProfessional.law_firm_name && (_jsx("p", { className: 'text-muted-foreground mb-2', children: selectedProfessional.law_firm_name })), _jsxs("div", { className: 'flex items-center gap-4 text-sm text-muted-foreground', children: [_jsxs("span", { className: 'flex items-center gap-1', children: [_jsx(Award, { className: 'h-4 w-4' }), t('modal.header.yearsExperience', { count: selectedProfessional.experience_years })] }), _jsxs("span", { className: 'flex items-center gap-1', children: [_jsx(Clock, { className: 'h-4 w-4' }), t('modal.header.respondsIn', { time: selectedProfessional.responseTime })] }), _jsxs("span", { className: 'flex items-center gap-1', children: [_jsx(Shield, { className: 'h-4 w-4' }), t('modal.header.verifiedAttorney')] })] })] }), _jsxs("div", { className: 'text-right', children: [_jsxs("div", { className: 'flex items-center gap-1 mb-2', children: [_jsx(Star, { className: 'h-5 w-5 text-yellow-500 fill-current' }), _jsx("span", { className: 'text-xl font-bold', children: selectedProfessional.rating }), _jsxs("span", { className: 'text-muted-foreground', children: ["(", t('modal.header.reviews', { count: selectedProfessional.reviewCount }), ")"] })] }), _jsx(Badge, { className: `${getAvailabilityColor(selectedProfessional.availability)} mb-2`, children: t(`availability.${selectedProfessional.availability}`) }), _jsxs("p", { className: 'text-lg font-bold', children: ["$", selectedProfessional.hourly_rate, t('professionalCard.perHour')] })] })] }), _jsxs("div", { className: 'flex gap-3', children: [_jsxs(Button, { onClick: () => onBookConsultation(selectedProfessional), children: [_jsx(Calendar, { className: 'h-4 w-4 mr-2' }), t('modal.buttons.bookConsultation')] }), _jsxs(Button, { variant: 'outline', onClick: () => onRequestReview(selectedProfessional), children: [_jsx(FileText, { className: 'h-4 w-4 mr-2' }), t('modal.buttons.requestReview')] }), _jsxs(Button, { variant: 'outline', children: [_jsx(MessageSquare, { className: 'h-4 w-4 mr-2' }), t('modal.buttons.sendMessage')] })] })] })] }), _jsxs(Tabs, { defaultValue: 'overview', className: 'w-full', children: [_jsxs(TabsList, { className: 'grid w-full grid-cols-4', children: [_jsx(TabsTrigger, { value: 'overview', children: t('modal.tabs.overview') }), _jsx(TabsTrigger, { value: 'services', children: t('modal.tabs.services') }), _jsx(TabsTrigger, { value: 'reviews', children: t('modal.tabs.reviews') }), _jsx(TabsTrigger, { value: 'credentials', children: t('modal.tabs.credentials') })] }), _jsx(TabsContent, { value: 'overview', className: 'space-y-6', children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('modal.overview.aboutTitle', { name: selectedProfessional.full_name }) }) }), _jsxs(CardContent, { className: 'space-y-4', children: [_jsx("p", { className: 'text-muted-foreground', children: selectedProfessional.bio }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-6', children: [_jsxs("div", { children: [_jsx(Label, { className: 'font-medium mb-2 block', children: t('modal.overview.specializations') }), _jsx("div", { className: 'flex flex-wrap gap-2', children: selectedProfessional.specializations.map(spec => (_jsx(Badge, { variant: 'secondary', children: spec.name }, spec.id))) })] }), _jsxs("div", { children: [_jsx(Label, { className: 'font-medium mb-2 block', children: t('modal.overview.licensedStates') }), _jsx("div", { className: 'flex flex-wrap gap-2', children: selectedProfessional.licensed_states?.map(state => (_jsx(Badge, { variant: 'outline', children: state }, state))) })] }), selectedProfessional.languages && (_jsxs("div", { children: [_jsx(Label, { className: 'font-medium mb-2 block', children: t('modal.overview.languages') }), _jsx("div", { className: 'flex flex-wrap gap-2', children: selectedProfessional.languages.map(lang => (_jsx(Badge, { variant: 'outline', children: lang }, lang))) })] })), selectedProfessional.achievements && (_jsxs("div", { children: [_jsx(Label, { className: 'font-medium mb-2 block', children: t('modal.overview.achievements') }), _jsx("div", { className: 'space-y-1', children: selectedProfessional.achievements.map(achievement => (_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Award, { className: 'h-4 w-4 text-yellow-600' }), _jsx("span", { className: 'text-sm', children: achievement })] }, achievement))) })] }))] })] })] }) }), _jsx(TabsContent, { value: 'services', className: 'space-y-4', children: selectedProfessional.services.map((service, index) => (_jsx(Card, { children: _jsxs(CardContent, { className: 'p-6', children: [_jsxs("div", { className: 'flex items-start justify-between mb-3', children: [_jsxs("div", { children: [_jsx(Badge, { variant: 'outline', className: 'mb-2 capitalize', children: t(`serviceTypes.${service.type}`) }), _jsx("h3", { className: 'font-semibold', children: service.description })] }), _jsxs("div", { className: 'text-right', children: [_jsxs("p", { className: 'text-lg font-bold', children: ["$", service.startingPrice] }), _jsx("p", { className: 'text-sm text-muted-foreground', children: t('modal.services.startingFrom') })] })] }), _jsx(Button, { size: 'sm', children: t('modal.services.selectService') })] }) }, index))) }), _jsxs(TabsContent, { value: 'reviews', className: 'space-y-4', children: [selectedProfessional.featuredReview && (_jsx(Card, { children: _jsxs(CardContent, { className: 'p-6', children: [_jsxs("div", { className: 'flex items-center gap-2 mb-3', children: [_jsx("div", { className: 'flex', children: [
                                                                            ...Array(selectedProfessional.featuredReview.rating),
                                                                        ].map((_, i) => (_jsx(Star, { className: 'h-4 w-4 text-yellow-500 fill-current' }, i))) }), _jsx("span", { className: 'font-medium', children: selectedProfessional.featuredReview.clientName }), _jsxs("span", { className: 'text-sm text-muted-foreground', children: ["\u2022", ' ', new Date(selectedProfessional.featuredReview.date).toLocaleDateString()] })] }), _jsxs("p", { className: 'text-muted-foreground', children: ["\"", selectedProfessional.featuredReview.comment, "\""] })] }) })), _jsxs("div", { className: 'text-center py-8 text-muted-foreground', children: [_jsx(MessageSquare, { className: 'h-12 w-12 mx-auto mb-4 opacity-50' }), _jsx("p", { children: t('modal.reviews.moreReviewsNote') })] })] }), _jsx(TabsContent, { value: 'credentials', className: 'space-y-4', children: _jsx(Card, { children: _jsxs(CardContent, { className: 'p-6', children: [_jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-6', children: [_jsxs("div", { children: [_jsx(Label, { className: 'font-medium mb-2 block', children: t('modal.credentials.barInformation') }), _jsx("p", { className: 'text-muted-foreground', children: t('modal.credentials.barNumber', { number: selectedProfessional.bar_number }) }), _jsx("p", { className: 'text-muted-foreground', children: t('modal.credentials.status', { status: selectedProfessional.verification_status }) })] }), _jsxs("div", { children: [_jsx(Label, { className: 'font-medium mb-2 block', children: t('modal.credentials.experience') }), _jsx("p", { className: 'text-muted-foreground', children: t('modal.credentials.yearsInPractice', { count: selectedProfessional.experience_years }) }), _jsx("p", { className: 'text-muted-foreground', children: t('modal.credentials.memberSince', {
                                                                                year: new Date(selectedProfessional.created_at).getFullYear()
                                                                            }) })] })] }), _jsxs("div", { className: 'mt-6 p-4 bg-green-50 rounded-lg', children: [_jsxs("div", { className: 'flex items-center gap-2 text-green-800', children: [_jsx(CheckCircle, { className: 'h-5 w-5' }), _jsx("span", { className: 'font-medium', children: t('modal.credentials.verifiedProfessional') })] }), _jsx("p", { className: 'text-sm text-green-700 mt-1', children: t('modal.credentials.verificationNote') })] })] }) }) })] })] }))] }) }), _jsxs("div", { className: 'bg-gray-50 rounded-lg p-8', children: [_jsxs("div", { className: 'text-center mb-6', children: [_jsx("h3", { className: 'text-xl font-semibold mb-2', children: t('trustFooter.title') }), _jsx("p", { className: 'text-muted-foreground', children: t('trustFooter.description') })] }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 text-center', children: [_jsxs("div", { className: 'space-y-2', children: [_jsx("div", { className: 'w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto', children: _jsx(Shield, { className: 'h-6 w-6 text-blue-600' }) }), _jsx("h4", { className: 'font-semibold', children: t('trustFooter.features.verified.title') }), _jsx("p", { className: 'text-sm text-muted-foreground', children: t('trustFooter.features.verified.description') })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx("div", { className: 'w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto', children: _jsx(Star, { className: 'h-6 w-6 text-green-600' }) }), _jsx("h4", { className: 'font-semibold', children: t('trustFooter.features.reviewed.title') }), _jsx("p", { className: 'text-sm text-muted-foreground', children: t('trustFooter.features.reviewed.description') })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx("div", { className: 'w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto', children: _jsx(Target, { className: 'h-6 w-6 text-purple-600' }) }), _jsx("h4", { className: 'font-semibold', children: t('trustFooter.features.matched.title') }), _jsx("p", { className: 'text-sm text-muted-foreground', children: t('trustFooter.features.matched.description') })] })] })] })] }));
}
