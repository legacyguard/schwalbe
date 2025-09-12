import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Review Request Workflow Component
 * Email-based workflow for requesting professional document reviews
 */
import { useState } from 'react';
import { ArrowRight, CheckCircle, Clock, Mail, Scale, Send, Star, Users, } from 'lucide-react';
import { Card, CardContent } from '@schwalbe/ui/card';
import { Button } from '@schwalbe/ui/button';
import { Input } from '@schwalbe/ui/input';
import { Label } from '@schwalbe/ui/label';
import { Textarea } from '@schwalbe/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@schwalbe/ui/select';
import { Checkbox } from '@schwalbe/ui/checkbox';
import { Badge } from '@schwalbe/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@schwalbe/lib/utils';
const REVIEW_TYPES = {
    basic: {
        name: 'Basic Review',
        description: 'Essential legal compliance check and basic recommendations',
        estimatedCost: '$150-250',
        turnaroundTime: '3-5 business days',
        features: [
            'Legal compliance verification',
            'Basic recommendations',
            'Format and structure review',
            'Email summary report',
        ],
    },
    comprehensive: {
        name: 'Comprehensive Review',
        description: 'Thorough analysis with detailed recommendations and optimizations',
        estimatedCost: '$350-500',
        turnaroundTime: '5-7 business days',
        features: [
            'Complete legal analysis',
            'Detailed improvement recommendations',
            'Family protection optimization',
            'Tax implication review',
            'Comprehensive written report',
            'Follow-up consultation call',
        ],
    },
    certified: {
        name: 'Certified Review',
        description: 'Attorney-certified review with legal opinion and documentation',
        estimatedCost: '$500-750',
        turnaroundTime: '7-10 business days',
        features: [
            'Full legal certification',
            'Attorney opinion letter',
            'Jurisdiction compliance verification',
            'Multi-attorney review (if needed)',
            'Legal documentation package',
            'Priority support and consultation',
        ],
    },
};
const SPECIALIZATIONS = [
    'estate_planning',
    'wills_trusts',
    'probate',
    'family_law',
    'elder_law',
    'tax_law',
    'business_law',
    'asset_protection',
];
export function ReviewRequestWorkflow({ documentId, documentType, documentName, familyContext, availableReviewers, onRequestSubmitted, onCancel, className, }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState({
        review_type: 'comprehensive',
        priority: 'medium',
        required_specializations: ['estate_planning'],
        deadline: undefined,
        budget_max: undefined,
        special_instructions: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const updateForm = (updates) => {
        setForm(prev => ({ ...prev, ...updates }));
    };
    const getRecommendedReviewers = () => {
        return availableReviewers
            .filter(reviewer => reviewer.status === 'active' &&
            form.required_specializations.some(spec => reviewer.specializations.some(s => s.name.toLowerCase().includes(spec))))
            .slice(0, 3);
    };
    const calculateEstimatedCost = () => {
        const basePrice = {
            basic: 200,
            comprehensive: 425,
            certified: 625,
        };
        let cost = basePrice[form.review_type];
        // Priority adjustments
        if (form.priority === 'urgent')
            cost *= 1.5;
        else if (form.priority === 'high')
            cost *= 1.25;
        // Family complexity adjustments
        if (familyContext.complex_assets)
            cost += 50;
        if (familyContext.business_interests)
            cost += 75;
        if (familyContext.minor_children)
            cost += 25;
        return Math.round(cost);
    };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const request = {
                document_id: documentId,
                review_type: form.review_type,
                priority: form.priority,
                preferred_reviewer_id: form.preferred_reviewer_id,
                required_specializations: form.required_specializations,
                deadline: form.deadline,
                budget_max: form.budget_max,
                special_instructions: form.special_instructions,
                family_context: familyContext,
                status: 'pending',
            };
            await onRequestSubmitted(request);
        }
        catch (error) {
            console.error('Error submitting review request:', error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: 'space-y-6', children: [_jsxs("div", { children: [_jsx("h3", { className: 'text-xl font-semibold mb-4', children: "Choose Review Type" }), _jsx("div", { className: 'space-y-4', children: Object.entries(REVIEW_TYPES).map(([key, type]) => (_jsx(Card, { className: cn('cursor-pointer transition-all border-2', form.review_type === key
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'), onClick: () => updateForm({ review_type: key }), children: _jsxs(CardContent, { className: 'p-4', children: [_jsxs("div", { className: 'flex items-start justify-between mb-3', children: [_jsxs("div", { children: [_jsx("h4", { className: 'font-semibold text-lg', children: type.name }), _jsx("p", { className: 'text-gray-600 text-sm', children: type.description })] }), _jsxs("div", { className: 'text-right', children: [_jsx("div", { className: 'font-semibold text-green-600', children: type.estimatedCost }), _jsx("div", { className: 'text-sm text-gray-500', children: type.turnaroundTime })] })] }), _jsx("div", { className: 'grid grid-cols-2 gap-4 text-sm', children: type.features.map((feature, index) => (_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(CheckCircle, { className: 'h-4 w-4 text-green-500 flex-shrink-0' }), _jsx("span", { className: 'text-gray-700', children: feature })] }, index))) })] }) }, key))) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'priority', children: "Review Priority" }), _jsxs(Select, { value: form.priority, onValueChange: (value) => updateForm({ priority: value }), children: [_jsx(SelectTrigger, { className: 'mt-1', children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'low', children: "Low Priority - Standard timeline" }), _jsx(SelectItem, { value: 'medium', children: "Medium Priority - Slightly expedited" }), _jsx(SelectItem, { value: 'high', children: "High Priority - Expedited (+25% fee)" }), _jsx(SelectItem, { value: 'urgent', children: "Urgent - Rush service (+50% fee)" })] })] })] })] }, 'step1'));
            case 2:
                return (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: 'space-y-6', children: [_jsxs("div", { children: [_jsx("h3", { className: 'text-xl font-semibold mb-4', children: "Reviewer Preferences" }), _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { children: "Required Specializations" }), _jsx("div", { className: 'mt-2 space-y-2', children: SPECIALIZATIONS.map(spec => (_jsxs("div", { className: 'flex items-center space-x-2', children: [_jsx(Checkbox, { id: spec, checked: form.required_specializations.includes(spec), onCheckedChange: checked => {
                                                                    if (checked) {
                                                                        updateForm({
                                                                            required_specializations: [
                                                                                ...form.required_specializations,
                                                                                spec,
                                                                            ],
                                                                        });
                                                                    }
                                                                    else {
                                                                        updateForm({
                                                                            required_specializations: form.required_specializations.filter(s => s !== spec),
                                                                        });
                                                                    }
                                                                } }), _jsx(Label, { htmlFor: spec, className: 'font-normal capitalize', children: spec.replace('_', ' ') })] }, spec))) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'deadline', children: "Preferred Deadline (Optional)" }), _jsx(Input, { id: 'deadline', type: 'date', value: form.deadline || '', onChange: e => updateForm({ deadline: e.target.value || undefined }), min: new Date().toISOString().split('T')[0], className: 'mt-1' })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'budget_max', children: "Maximum Budget (Optional)" }), _jsx(Input, { id: 'budget_max', type: 'number', value: form.budget_max || '', onChange: e => updateForm({
                                                        budget_max: e.target.value
                                                            ? parseInt(e.target.value)
                                                            : undefined,
                                                    }), placeholder: 'e.g., 500', className: 'mt-1' }), _jsxs("p", { className: 'text-sm text-gray-600 mt-1', children: ["Estimated cost: $", calculateEstimatedCost()] })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: 'font-semibold mb-3', children: "Recommended Attorneys" }), _jsxs("div", { className: 'space-y-3', children: [getRecommendedReviewers().map(reviewer => (_jsx(Card, { className: cn('cursor-pointer transition-all border-2', form.preferred_reviewer_id === reviewer.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'), onClick: () => updateForm({ preferred_reviewer_id: reviewer.id }), children: _jsxs(CardContent, { className: 'p-4', children: [_jsxs("div", { className: 'flex items-start justify-between', children: [_jsxs("div", { children: [_jsx("h5", { className: 'font-semibold', children: reviewer.full_name }), _jsx("p", { className: 'text-sm text-gray-600', children: reviewer.professional_title }), reviewer.law_firm_name && (_jsx("p", { className: 'text-sm text-gray-500', children: reviewer.law_firm_name }))] }), _jsxs("div", { className: 'text-right', children: [_jsxs("div", { className: 'flex items-center gap-1 mb-1', children: [_jsx(Star, { className: 'h-4 w-4 fill-yellow-400 text-yellow-400' }), _jsx("span", { className: 'text-sm font-medium', children: "4.9" })] }), reviewer.hourly_rate && (_jsxs("p", { className: 'text-sm text-green-600', children: ["$", reviewer.hourly_rate, "/hr"] }))] })] }), _jsx("div", { className: 'mt-2 flex flex-wrap gap-1', children: reviewer.specializations.slice(0, 3).map(spec => (_jsx(Badge, { variant: 'secondary', className: 'text-xs', children: spec.name }, spec.id))) })] }) }, reviewer.id))), _jsx(Card, { className: cn('cursor-pointer transition-all border-2 border-dashed', !form.preferred_reviewer_id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'), onClick: () => updateForm({ preferred_reviewer_id: undefined }), children: _jsxs(CardContent, { className: 'p-4 text-center', children: [_jsx(Users, { className: 'h-8 w-8 text-gray-400 mx-auto mb-2' }), _jsx("p", { className: 'text-sm font-medium', children: "Auto-assign best match" }), _jsx("p", { className: 'text-xs text-gray-600', children: "Let us find the perfect attorney for your needs" })] }) })] })] })] }, 'step2'));
            case 3:
                return (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: 'space-y-6', children: [_jsxs("div", { children: [_jsx("h3", { className: 'text-xl font-semibold mb-4', children: "Additional Details" }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'special_instructions', children: "Special Instructions or Questions" }), _jsx(Textarea, { id: 'special_instructions', value: form.special_instructions || '', onChange: e => updateForm({ special_instructions: e.target.value }), placeholder: "Any specific concerns, questions, or areas you'd like the attorney to focus on...", rows: 4, className: 'mt-1' })] })] }), _jsxs("div", { className: 'bg-gray-50 rounded-lg p-6', children: [_jsx("h4", { className: 'font-semibold mb-4', children: "Review Summary" }), _jsxs("div", { className: 'space-y-3 text-sm', children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-gray-600', children: "Document:" }), _jsx("span", { className: 'font-medium', children: documentName })] }), _jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-gray-600', children: "Review Type:" }), _jsx("span", { className: 'font-medium', children: REVIEW_TYPES[form.review_type].name })] }), _jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-gray-600', children: "Priority:" }), _jsx(Badge, { className: cn(form.priority === 'urgent'
                                                        ? 'bg-red-100 text-red-800'
                                                        : form.priority === 'high'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : form.priority === 'medium'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-green-100 text-green-800'), children: form.priority })] }), _jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-gray-600', children: "Estimated Cost:" }), _jsxs("span", { className: 'font-medium text-green-600', children: ["$", calculateEstimatedCost()] })] }), form.deadline && (_jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-gray-600', children: "Deadline:" }), _jsx("span", { className: 'font-medium', children: new Date(form.deadline).toLocaleDateString() })] })), _jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("span", { className: 'text-gray-600', children: "Turnaround Time:" }), _jsx("span", { className: 'font-medium', children: REVIEW_TYPES[form.review_type].turnaroundTime })] })] })] }), _jsx("div", { className: 'bg-blue-50 rounded-lg p-4', children: _jsxs("div", { className: 'flex items-start gap-3', children: [_jsx(Mail, { className: 'h-5 w-5 text-blue-600 mt-0.5' }), _jsxs("div", { children: [_jsx("h5", { className: 'font-semibold text-blue-900 mb-1', children: "What happens next?" }), _jsxs("ol", { className: 'text-sm text-blue-700 space-y-1 list-decimal list-inside', children: [_jsx("li", { children: "We'll match you with a qualified attorney within 2 hours" }), _jsx("li", { children: "You'll receive an email with attorney details and confirmation" }), _jsx("li", { children: "The attorney will begin their review within 24 hours" }), _jsx("li", { children: "You'll get progress updates throughout the review process" })] })] })] }) })] }, 'step3'));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: cn('max-w-2xl mx-auto', className), children: [_jsxs("div", { className: 'text-center mb-8', children: [_jsxs("div", { className: 'flex items-center justify-center gap-3 mb-4', children: [_jsx(Scale, { className: 'h-8 w-8 text-blue-600' }), _jsx("h1", { className: 'text-3xl font-bold text-gray-900', children: "Request Professional Review" })] }), _jsxs("p", { className: 'text-gray-600', children: ["Get your ", documentType.toLowerCase(), " professionally reviewed by licensed attorneys"] })] }), _jsx("div", { className: 'flex justify-center mb-8', children: _jsx("div", { className: 'flex items-center space-x-4', children: [1, 2, 3].map(step => (_jsxs("div", { className: 'flex items-center', children: [_jsx("div", { className: cn('flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all', step < currentStep
                                    ? 'bg-green-100 border-green-500 text-green-700'
                                    : step === currentStep
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'bg-gray-100 border-gray-300 text-gray-500'), children: step < currentStep ? (_jsx(CheckCircle, { className: 'h-5 w-5' })) : (_jsx("span", { className: 'font-medium', children: step })) }), step < 3 && (_jsx("div", { className: cn('w-12 h-0.5 mx-2 transition-all', step < currentStep ? 'bg-green-500' : 'bg-gray-300') }))] }, step))) }) }), _jsx(Card, { className: 'shadow-lg', children: _jsxs(CardContent, { className: 'p-8', children: [_jsx(AnimatePresence, { mode: 'wait', children: renderStepContent() }), _jsxs("div", { className: 'flex justify-between mt-8 pt-6 border-t', children: [_jsxs("div", { children: [currentStep > 1 && (_jsx(Button, { variant: 'outline', onClick: () => setCurrentStep(prev => prev - 1), className: 'flex items-center gap-2', children: "Back" })), onCancel && currentStep === 1 && (_jsx(Button, { variant: 'outline', onClick: onCancel, className: 'text-gray-600', children: "Cancel" }))] }), _jsx("div", { children: currentStep < 3 ? (_jsxs(Button, { onClick: () => setCurrentStep(prev => prev + 1), className: 'flex items-center gap-2', children: ["Continue", _jsx(ArrowRight, { className: 'h-4 w-4' })] })) : (_jsx(Button, { onClick: handleSubmit, disabled: isSubmitting, className: 'flex items-center gap-2 bg-green-600 hover:bg-green-700', children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: 'h-4 w-4 animate-spin' }), "Submitting..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: 'h-4 w-4' }), "Submit Request"] })) })) })] })] }) })] }));
}
