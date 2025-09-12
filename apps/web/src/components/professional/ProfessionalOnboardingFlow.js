import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Professional Reviewer Onboarding Flow
 * Multi-step onboarding process for attorneys and legal professionals
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Award, CheckCircle, Scale, Shield, Users, } from 'lucide-react';
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
const US_STATES = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
    'District of Columbia',
];
const getSpecializations = (t) => [
    {
        id: 'estate_planning',
        name: t('specializations.estate_planning'),
        category: 'estate_planning',
    },
    { id: 'wills_trusts', name: t('specializations.wills_trusts'), category: 'estate_planning' },
    { id: 'probate', name: t('specializations.probate'), category: 'estate_planning' },
    { id: 'family_law', name: t('specializations.family_law'), category: 'family_law' },
    { id: 'elder_law', name: t('specializations.elder_law'), category: 'estate_planning' },
    { id: 'tax_law', name: t('specializations.tax_law'), category: 'tax_law' },
    { id: 'business_law', name: t('specializations.business_law'), category: 'business_law' },
    { id: 'real_estate', name: t('specializations.real_estate'), category: 'real_estate' },
    {
        id: 'guardianship',
        name: t('specializations.guardianship'),
        category: 'family_law',
    },
    {
        id: 'asset_protection',
        name: t('specializations.asset_protection'),
        category: 'estate_planning',
    },
];
export function ProfessionalOnboardingFlow({ onComplete, onCancel, className, }) {
    const { t } = useTranslation('ui/professional-onboarding');
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        professional_title: '',
        law_firm_name: '',
        bar_number: '',
        licensed_states: [],
        specializations: [],
        experience_years: 0,
        hourly_rate: undefined,
        bio: '',
        motivation: '',
        referral_source: '',
    });
    const steps = [
        {
            id: 1,
            title: t('steps.personal_information.title'),
            description: t('steps.personal_information.description'),
            icon: Users,
            isCompleted: currentStep > 1,
            isActive: currentStep === 1,
        },
        {
            id: 2,
            title: t('steps.professional_credentials.title'),
            description: t('steps.professional_credentials.description'),
            icon: Award,
            isCompleted: currentStep > 2,
            isActive: currentStep === 2,
        },
        {
            id: 3,
            title: t('steps.specializations.title'),
            description: t('steps.specializations.description'),
            icon: Scale,
            isCompleted: currentStep > 3,
            isActive: currentStep === 3,
        },
        {
            id: 4,
            title: t('steps.professional_profile.title'),
            description: t('steps.professional_profile.description'),
            icon: Shield,
            isCompleted: currentStep > 4,
            isActive: currentStep === 4,
        },
    ];
    const updateFormData = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };
    const isStepValid = (step) => {
        switch (step) {
            case 1:
                return !!(formData.email &&
                    formData.full_name &&
                    formData.professional_title);
            case 2:
                return !!(formData.bar_number && formData.licensed_states.length > 0);
            case 3:
                return (formData.specializations.length > 0 && formData.experience_years > 0);
            case 4:
                return !!(formData.bio && formData.motivation);
            default:
                return false;
        }
    };
    const handleNext = () => {
        if (currentStep < steps.length && isStepValid(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };
    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };
    const handleSubmit = () => {
        if (isStepValid(4)) {
            onComplete(formData);
        }
    };
    const toggleState = (state) => {
        const newStates = formData.licensed_states.includes(state)
            ? formData.licensed_states.filter(s => s !== state)
            : [...formData.licensed_states, state];
        updateFormData({ licensed_states: newStates });
    };
    const toggleSpecialization = (spec) => {
        const newSpecs = formData.specializations.includes(spec)
            ? formData.specializations.filter(s => s !== spec)
            : [...formData.specializations, spec];
        updateFormData({ specializations: newSpecs });
    };
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: 'space-y-6', children: _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'email', children: t('step1.email.label') }), _jsx(Input, { id: 'email', type: 'email', value: formData.email, onChange: e => updateFormData({ email: e.target.value }), placeholder: t('step1.email.placeholder'), className: 'mt-1' })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'full_name', children: t('step1.full_name.label') }), _jsx(Input, { id: 'full_name', value: formData.full_name, onChange: e => updateFormData({ full_name: e.target.value }), placeholder: t('step1.full_name.placeholder'), className: 'mt-1' })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'professional_title', children: t('step1.professional_title.label') }), _jsx(Input, { id: 'professional_title', value: formData.professional_title, onChange: e => updateFormData({ professional_title: e.target.value }), placeholder: t('step1.professional_title.placeholder'), className: 'mt-1' })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'law_firm_name', children: t('step1.law_firm_name.label') }), _jsx(Input, { id: 'law_firm_name', value: formData.law_firm_name, onChange: e => updateFormData({ law_firm_name: e.target.value }), placeholder: t('step1.law_firm_name.placeholder'), className: 'mt-1' })] })] }) }, 'step1'));
            case 2:
                return (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: 'space-y-6', children: _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'bar_number', children: t('step2.bar_number.label') }), _jsx(Input, { id: 'bar_number', value: formData.bar_number, onChange: e => updateFormData({ bar_number: e.target.value }), placeholder: t('step2.bar_number.placeholder'), className: 'mt-1' }), _jsx("p", { className: 'text-sm text-gray-600 mt-1', children: t('step2.bar_number.help') })] }), _jsxs("div", { children: [_jsx(Label, { children: t('step2.licensed_states.label') }), _jsx("p", { className: 'text-sm text-gray-600 mb-3', children: t('step2.licensed_states.help') }), _jsx("div", { className: 'max-h-48 overflow-y-auto border rounded-lg p-3', children: _jsx("div", { className: 'grid grid-cols-2 gap-2', children: US_STATES.map(state => (_jsxs("div", { className: 'flex items-center space-x-2', children: [_jsx(Checkbox, { id: state, checked: formData.licensed_states.includes(state), onCheckedChange: () => toggleState(state) }), _jsx(Label, { htmlFor: state, className: 'text-sm font-normal', children: t(`states.${state}`) })] }, state))) }) }), formData.licensed_states.length > 0 && (_jsx("div", { className: 'mt-2 flex flex-wrap gap-2', children: formData.licensed_states.map(state => (_jsx(Badge, { variant: 'secondary', className: 'text-xs', children: state }, state))) }))] })] }) }, 'step2'));
            case 3:
                return (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: 'space-y-6', children: _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'experience_years', children: t('step3.experience_years.label') }), _jsxs(Select, { value: formData.experience_years.toString(), onValueChange: value => updateFormData({ experience_years: parseInt(value) }), children: [_jsx(SelectTrigger, { className: 'mt-1', children: _jsx(SelectValue, { placeholder: t('step3.experience_years.placeholder') }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: '1', children: t('step3.experience_years.options.1') }), _jsx(SelectItem, { value: '3', children: t('step3.experience_years.options.3') }), _jsx(SelectItem, { value: '6', children: t('step3.experience_years.options.6') }), _jsx(SelectItem, { value: '11', children: t('step3.experience_years.options.11') }), _jsx(SelectItem, { value: '16', children: t('step3.experience_years.options.16') }), _jsx(SelectItem, { value: '21', children: t('step3.experience_years.options.21') })] })] })] }), _jsxs("div", { children: [_jsx(Label, { children: t('step3.specializations.label') }), _jsx("p", { className: 'text-sm text-gray-600 mb-3', children: t('step3.specializations.help') }), _jsx("div", { className: 'grid grid-cols-2 gap-3', children: getSpecializations(t).map(spec => (_jsxs("div", { className: 'flex items-center space-x-2', children: [_jsx(Checkbox, { id: spec.id, checked: formData.specializations.includes(spec.id), onCheckedChange: () => toggleSpecialization(spec.id) }), _jsx(Label, { htmlFor: spec.id, className: 'text-sm font-normal', children: spec.name })] }, spec.id))) }), formData.specializations.length > 0 && (_jsx("div", { className: 'mt-3 flex flex-wrap gap-2', children: formData.specializations.map(specId => {
                                            const spec = getSpecializations(t).find(s => s.id === specId);
                                            return spec ? (_jsx(Badge, { variant: 'secondary', className: 'text-xs', children: spec.name }, spec.id)) : null;
                                        }) }))] })] }) }, 'step3'));
            case 4:
                return (_jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, className: 'space-y-6', children: _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'hourly_rate', children: t('step4.hourly_rate.label') }), _jsx(Input, { id: 'hourly_rate', type: 'number', value: formData.hourly_rate || '', onChange: e => updateFormData({
                                            hourly_rate: e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                        }), placeholder: t('step4.hourly_rate.placeholder'), className: 'mt-1' }), _jsx("p", { className: 'text-sm text-gray-600 mt-1', children: t('step4.hourly_rate.help') })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'bio', children: t('step4.bio.label') }), _jsx(Textarea, { id: 'bio', value: formData.bio, onChange: e => updateFormData({ bio: e.target.value }), placeholder: t('step4.bio.placeholder'), rows: 4, className: 'mt-1' }), _jsx("p", { className: 'text-sm text-gray-600 mt-1', children: t('step4.bio.help') })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'motivation', children: t('step4.motivation.label') }), _jsx(Textarea, { id: 'motivation', value: formData.motivation, onChange: e => updateFormData({ motivation: e.target.value }), placeholder: t('step4.motivation.placeholder'), rows: 3, className: 'mt-1' })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'referral_source', children: t('step4.referral_source.label') }), _jsxs(Select, { value: formData.referral_source, onValueChange: value => updateFormData({ referral_source: value }), children: [_jsx(SelectTrigger, { className: 'mt-1', children: _jsx(SelectValue, { placeholder: t('step4.referral_source.placeholder') }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'colleague', children: t('step4.referral_source.options.colleague') }), _jsx(SelectItem, { value: 'online_search', children: t('step4.referral_source.options.online_search') }), _jsx(SelectItem, { value: 'legal_publication', children: t('step4.referral_source.options.legal_publication') }), _jsx(SelectItem, { value: 'conference', children: t('step4.referral_source.options.conference') }), _jsx(SelectItem, { value: 'linkedin', children: t('step4.referral_source.options.linkedin') }), _jsx(SelectItem, { value: 'other', children: t('step4.referral_source.options.other') })] })] })] })] }) }, 'step4'));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: cn('max-w-4xl mx-auto', className), children: [_jsxs("div", { className: 'text-center mb-8', children: [_jsxs(motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: 'flex items-center justify-center gap-3 mb-4', children: [_jsx(Scale, { className: 'h-8 w-8 text-blue-600' }), _jsx("h1", { className: 'text-3xl font-bold text-gray-900', children: t('header.title') })] }), _jsx("p", { className: 'text-lg text-gray-600 max-w-2xl mx-auto', children: t('header.subtitle') })] }), _jsx("div", { className: 'flex justify-center mb-8', children: _jsx("div", { className: 'flex items-center space-x-4', children: steps.map((step, index) => (_jsxs("div", { className: 'flex items-center', children: [_jsx("div", { className: cn('flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300', step.isCompleted
                                    ? 'bg-green-100 border-green-500 text-green-700'
                                    : step.isActive
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'bg-gray-100 border-gray-300 text-gray-500'), children: step.isCompleted ? (_jsx(CheckCircle, { className: 'h-6 w-6' })) : (_jsx(step.icon, { className: 'h-6 w-6' })) }), index < steps.length - 1 && (_jsx("div", { className: cn('w-16 h-0.5 mx-2 transition-all duration-300', step.isCompleted ? 'bg-green-500' : 'bg-gray-300') }))] }, step.id))) }) }), _jsxs("div", { className: 'text-center mb-8', children: [_jsx("h2", { className: 'text-xl font-semibold text-gray-900 mb-2', children: steps[currentStep - 1]?.title }), _jsx("p", { className: 'text-gray-600', children: steps[currentStep - 1]?.description })] }), _jsx(Card, { className: 'shadow-lg', children: _jsxs(CardContent, { className: 'p-8', children: [_jsx(AnimatePresence, { mode: 'wait', children: renderStepContent() }), _jsxs("div", { className: 'flex justify-between mt-8 pt-6 border-t border-gray-200', children: [_jsxs("div", { children: [currentStep > 1 && (_jsxs(Button, { variant: 'outline', onClick: handlePrevious, className: 'flex items-center gap-2', children: [_jsx(ArrowLeft, { className: 'h-4 w-4' }), t('buttons.previous')] })), onCancel && currentStep === 1 && (_jsx(Button, { variant: 'outline', onClick: onCancel, className: 'text-gray-600', children: t('buttons.cancel') }))] }), _jsx("div", { children: currentStep < steps.length ? (_jsxs(Button, { onClick: handleNext, disabled: !isStepValid(currentStep), className: 'flex items-center gap-2', children: [t('buttons.continue'), _jsx(ArrowRight, { className: 'h-4 w-4' })] })) : (_jsxs(Button, { onClick: handleSubmit, disabled: !isStepValid(4), className: 'flex items-center gap-2 bg-green-600 hover:bg-green-700', children: [t('buttons.submit'), _jsx(CheckCircle, { className: 'h-4 w-4' })] })) })] })] }) }), _jsxs("div", { className: 'mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8', children: [_jsx("h3", { className: 'text-2xl font-bold text-center mb-8 text-gray-900', children: t('benefits.title') }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-3 gap-6', children: [_jsxs("div", { className: 'text-center', children: [_jsx(Users, { className: 'h-12 w-12 text-blue-600 mx-auto mb-4' }), _jsx("h4", { className: 'font-semibold mb-2', children: t('benefits.build_practice.title') }), _jsx("p", { className: 'text-sm text-gray-600', children: t('benefits.build_practice.description') })] }), _jsxs("div", { className: 'text-center', children: [_jsx(Shield, { className: 'h-12 w-12 text-blue-600 mx-auto mb-4' }), _jsx("h4", { className: 'font-semibold mb-2', children: t('benefits.trusted_platform.title') }), _jsx("p", { className: 'text-sm text-gray-600', children: t('benefits.trusted_platform.description') })] }), _jsxs("div", { className: 'text-center', children: [_jsx(Scale, { className: 'h-12 w-12 text-blue-600 mx-auto mb-4' }), _jsx("h4", { className: 'font-semibold mb-2', children: t('benefits.flexible_schedule.title') }), _jsx("p", { className: 'text-sm text-gray-600', children: t('benefits.flexible_schedule.description') })] })] })] })] }));
}
