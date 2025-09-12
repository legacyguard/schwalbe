import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * A/B Testing Onboarding Flow Variants
 * Tests different onboarding approaches for conversion optimization
 */
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Clock, Heart, Shield, Users, } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
export function ABTestOnboardingFlow({ onComplete, onSkip, userId, className, }) {
    const { t } = useTranslation('ui/onboarding-variants');
    // Simple A/B test - can be enhanced with proper A/B testing framework
    const [variant] = useState(() => Math.random() > 0.5 ? 'variant_a' : 'variant_b');
    const [currentStep, setCurrentStep] = useState(0);
    const [startTime] = useState(Date.now());
    const [stepStartTime, setStepStartTime] = useState(Date.now());
    const [userData, setUserData] = useState({});
    // Track onboarding start
    useEffect(() => {
        console.log('Onboarding started with variant:', variant);
    }, [variant]);
    const handleStepComplete = (stepData) => {
        const timeSpent = Date.now() - stepStartTime;
        const stepId = getSteps(variant, t)[currentStep]?.id || 'unknown';
        console.log(`Step ${stepId} completed in ${timeSpent}ms`);
        setUserData(prev => ({ ...prev, ...stepData }));
        if (currentStep < getSteps(variant, t).length - 1) {
            setCurrentStep(prev => prev + 1);
            setStepStartTime(Date.now());
        }
        else {
            // Onboarding complete
            const totalTime = Date.now() - startTime;
            console.log(`Onboarding completed in ${totalTime}ms with variant ${variant}`);
            onComplete({ ...userData, ...stepData, variant, totalTime });
        }
    };
    const handleStepSkip = () => {
        const stepId = getSteps(variant, t)[currentStep]?.id || 'unknown';
        console.log(`Step ${stepId} skipped`);
        if (onSkip) {
            onSkip();
        }
        else {
            // Skip to next step
            if (currentStep < getSteps(variant, t).length - 1) {
                setCurrentStep(prev => prev + 1);
                setStepStartTime(Date.now());
            }
        }
    };
    const steps = getSteps(variant, t);
    const currentStepData = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (_jsxs("div", { className: cn('max-w-2xl mx-auto p-6', className), children: [_jsxs("div", { className: 'mb-8', children: [_jsxs("div", { className: 'flex items-center justify-between mb-2', children: [_jsx("h1", { className: 'text-2xl font-bold text-gray-900', children: variant === 'variant_a'
                                    ? 'Create Your Family Shield'
                                    : 'Get Started with LegacyGuard' }), _jsxs(Badge, { variant: 'outline', className: 'text-sm', children: [currentStep + 1, " of ", steps.length] })] }), _jsx(Progress, { value: progress, className: 'h-2 mb-2' }), _jsx("p", { className: 'text-sm text-gray-600', children: variant === 'variant_a'
                            ? 'Help us understand how to best protect your family'
                            : `Step ${currentStep + 1}: ${currentStepData?.description}` })] }), _jsx(AnimatePresence, { mode: 'wait', children: _jsx(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3 }, children: currentStepData && (_jsx(currentStepData.component, { onComplete: handleStepComplete, onSkip: handleStepSkip, userData: userData, variant: variant })) }, currentStep) })] }));
}
/**
 * Get steps based on A/B test variant
 */
function getSteps(variant, t) {
    const controlSteps = [
        {
            id: 'name',
            title: 'What should we call you?',
            description: 'Personal introduction',
            component: NameStep,
        },
        {
            id: 'purpose',
            title: 'What brings you here?',
            description: 'Understanding your goals',
            component: PurposeStep,
        },
        {
            id: 'family',
            title: 'Tell us about your family',
            description: 'Family composition',
            component: FamilyStep,
        },
        {
            id: 'next_steps',
            title: 'Your recommended next steps',
            description: 'Getting started',
            component: NextStepsStep,
        },
    ];
    const emotionFirstSteps = [
        {
            id: 'family_impact',
            title: 'Who do you want to protect?',
            description: 'Understanding family impact',
            component: FamilyImpactStep,
        },
        {
            id: 'protection_goals',
            title: 'What matters most to you?',
            description: 'Defining protection goals',
            component: ProtectionGoalsStep,
        },
        {
            id: 'personal_info',
            title: 'A few details about you',
            description: 'Personal information',
            component: PersonalInfoStep,
        },
        {
            id: 'first_action',
            title: 'Take your first step',
            description: 'Choose your starting point',
            component: FirstActionStep,
        },
    ];
    return variant === 'variant_a' ? emotionFirstSteps : controlSteps;
}
/**
 * Control Flow Step Components
 */
function NameStep({ onComplete, onSkip, }) {
    const [name, setName] = useState('');
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "What should we call you?" }) }), _jsxs(CardContent, { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'name', children: "Your name" }), _jsx(Input, { id: 'name', value: name, onChange: e => setName(e.target.value), placeholder: 'Enter your first name', className: 'mt-1' })] }), _jsxs("div", { className: 'flex gap-3 pt-4', children: [_jsxs(Button, { onClick: () => onComplete({ name }), disabled: !name.trim(), className: 'flex-1', children: ["Continue", _jsx(ArrowRight, { className: 'h-4 w-4 ml-2' })] }), _jsx(Button, { variant: 'ghost', onClick: onSkip, children: "Skip" })] })] })] }));
}
function PurposeStep({ onComplete, onSkip, }) {
    const [purpose, setPurpose] = useState('');
    const purposes = [
        { key: 'organize_documents', value: 'Organize important documents' },
        { key: 'create_will', value: 'Create or update my will' },
        { key: 'family_access', value: 'Give my family access to important info' },
        { key: 'legal_review', value: 'Get professional legal review' },
        { key: 'all_above', value: 'All of the above' },
    ];
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "What brings you here?" }) }), _jsxs(CardContent, { className: 'space-y-4', children: [_jsx("div", { className: 'space-y-2', children: purposes.map((option, index) => (_jsx("button", { onClick: () => setPurpose(option.value), className: cn('w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors', purpose === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200'), children: option.value }, index))) }), _jsxs("div", { className: 'flex gap-3 pt-4', children: [_jsxs(Button, { onClick: () => onComplete({ purpose }), disabled: !purpose, className: 'flex-1', children: ["Continue", _jsx(ArrowRight, { className: 'h-4 w-4 ml-2' })] }), _jsx(Button, { variant: 'ghost', onClick: onSkip, children: "Skip" })] })] })] }));
}
function FamilyStep({ onComplete, onSkip, }) {
    const [familySize, setFamilySize] = useState('');
    const [hasMinors, setHasMinors] = useState(null);
    const familySizes = [
        { key: '1-2', value: '1-2 people' },
        { key: '3-4', value: '3-4 people' },
        { key: '5-6', value: '5-6 people' },
        { key: '7+', value: '7+ people' },
    ];
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Tell us about your family" }) }), _jsxs(CardContent, { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { children: "How many people are in your immediate family?" }), _jsx("div", { className: 'grid grid-cols-2 gap-2 mt-2', children: familySizes.map(size => (_jsx("button", { onClick: () => setFamilySize(size.key), className: cn('p-2 border rounded hover:bg-gray-50', familySize === size.key
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200'), children: size.value }, size.key))) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Do you have children under 18?" }), _jsxs("div", { className: 'flex gap-2 mt-2', children: [_jsx(Button, { variant: hasMinors === true ? 'default' : 'outline', onClick: () => setHasMinors(true), className: 'flex-1', children: "Yes" }), _jsx(Button, { variant: hasMinors === false ? 'default' : 'outline', onClick: () => setHasMinors(false), className: 'flex-1', children: "No" })] })] }), _jsxs("div", { className: 'flex gap-3 pt-4', children: [_jsxs(Button, { onClick: () => onComplete({ familySize, hasMinors }), className: 'flex-1', children: ["Continue", _jsx(ArrowRight, { className: 'h-4 w-4 ml-2' })] }), _jsx(Button, { variant: 'ghost', onClick: onSkip, children: "Skip" })] })] })] }));
}
function NextStepsStep({ onComplete, userData: _userData, }) {
    const recommendations = [
        {
            icon: Shield,
            title: 'Upload important documents',
            description: 'Start by organizing your most critical documents',
            time: '5 min',
        },
        {
            icon: Users,
            title: 'Add emergency contacts',
            description: 'Set up trusted people who can access your information',
            time: '3 min',
        },
        {
            icon: CheckCircle,
            title: 'Complete your will',
            description: 'Create a legally valid will with our guided process',
            time: '15 min',
        },
    ];
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Your recommended next steps" }), _jsx("p", { className: 'text-gray-600', children: "Based on your responses, here's what we recommend you do first:" })] }), _jsxs(CardContent, { className: 'space-y-4', children: [recommendations.map((rec, index) => (_jsxs("div", { className: 'flex items-start gap-3 p-3 border rounded-lg', children: [_jsx(rec.icon, { className: 'h-5 w-5 text-blue-600 mt-1' }), _jsxs("div", { className: 'flex-1', children: [_jsx("h4", { className: 'font-medium', children: rec.title }), _jsx("p", { className: 'text-sm text-gray-600', children: rec.description })] }), _jsxs(Badge, { variant: 'outline', className: 'text-xs', children: [_jsx(Clock, { className: 'h-3 w-3 mr-1' }), rec.time] })] }, index))), _jsxs(Button, { onClick: () => onComplete({ onboardingComplete: true }), className: 'w-full mt-6', size: 'lg', children: ["Start protecting my family", _jsx(ArrowRight, { className: 'h-4 w-4 ml-2' })] })] })] }));
}
/**
 * Emotion-First Flow Step Components
 */
function FamilyImpactStep({ onComplete, onSkip, }) {
    const [selectedPeople, setSelectedPeople] = useState([]);
    const people = [
        { id: 'spouse', label: 'My spouse/partner', icon: Heart },
        { id: 'children', label: 'My children', icon: Users },
        { id: 'parents', label: 'My parents', icon: Shield },
        { id: 'siblings', label: 'My siblings', icon: Users },
        { id: 'extended', label: 'Extended family', icon: Users },
    ];
    const togglePerson = (id) => {
        setSelectedPeople(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(Heart, { className: 'h-5 w-5 text-red-500' }), "Who do you want to protect?"] }), _jsx("p", { className: 'text-gray-600', children: "Select the people who matter most to you. We'll help you create a plan that gives them peace of mind." })] }), _jsxs(CardContent, { className: 'space-y-4', children: [_jsx("div", { className: 'grid grid-cols-1 gap-2', children: people.map(person => (_jsxs("button", { onClick: () => togglePerson(person.id), className: cn('flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-gray-50 transition-all', selectedPeople.includes(person.id)
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200'), children: [_jsx(person.icon, { className: cn('h-5 w-5', selectedPeople.includes(person.id)
                                        ? 'text-blue-600'
                                        : 'text-gray-400') }), _jsx("span", { className: 'font-medium', children: person.label }), selectedPeople.includes(person.id) && (_jsx(CheckCircle, { className: 'h-4 w-4 text-blue-600 ml-auto' }))] }, person.id))) }), selectedPeople.length > 0 && (_jsx("div", { className: 'p-3 bg-blue-50 border border-blue-200 rounded-lg', children: _jsxs("p", { className: 'text-sm text-blue-800', children: [_jsx(Shield, { className: 'h-4 w-4 inline mr-1' }), selectedPeople.length === 1
                                    ? "We'll help you protect the person who matters most to you."
                                    : `We'll help you protect all ${selectedPeople.length} groups of people you've selected.`] }) })), _jsxs("div", { className: 'flex gap-3 pt-4', children: [_jsxs(Button, { onClick: () => onComplete({ protectedPeople: selectedPeople }), disabled: selectedPeople.length === 0, className: 'flex-1', children: ["Continue", _jsx(ArrowRight, { className: 'h-4 w-4 ml-2' })] }), _jsx(Button, { variant: 'ghost', onClick: onSkip, children: "Skip" })] })] })] }));
}
function ProtectionGoalsStep({ onComplete, onSkip, }) {
    const [goals, setGoals] = useState([]);
    const protectionGoals = [
        {
            id: 'emergency_access',
            title: 'Emergency access to accounts',
            description: 'Make sure loved ones can access important accounts if something happens',
            impact: 'High impact',
        },
        {
            id: 'financial_security',
            title: 'Financial security',
            description: 'Ensure your family is financially protected and knows where everything is',
            impact: 'High impact',
        },
        {
            id: 'child_care',
            title: 'Guardian for children',
            description: 'Make sure your children are cared for by people you trust',
            impact: 'Critical',
        },
        {
            id: 'legal_compliance',
            title: 'Legal compliance',
            description: 'Ensure all documents are legally valid and up to date',
            impact: 'Medium impact',
        },
        {
            id: 'peace_of_mind',
            title: 'Peace of mind',
            description: 'Know that everything is organized and your family is prepared',
            impact: 'High impact',
        },
    ];
    const toggleGoal = (id) => {
        setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(Shield, { className: 'h-5 w-5 text-blue-600' }), "What matters most to you?"] }), _jsx("p", { className: 'text-gray-600', children: "Help us understand your priorities so we can create the best plan for your family." })] }), _jsxs(CardContent, { className: 'space-y-4', children: [_jsx("div", { className: 'space-y-3', children: protectionGoals.map(goal => (_jsx("button", { onClick: () => toggleGoal(goal.id), className: cn('w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-all', goals.includes(goal.id)
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200'), children: _jsxs("div", { className: 'flex items-start justify-between', children: [_jsxs("div", { className: 'flex-1', children: [_jsx("h4", { className: 'font-medium mb-1', children: goal.title }), _jsx("p", { className: 'text-sm text-gray-600', children: goal.description })] }), _jsxs("div", { className: 'ml-3 flex flex-col items-end', children: [_jsx(Badge, { variant: goal.impact === 'Critical' ? 'destructive' : 'secondary', className: 'text-xs mb-2', children: goal.impact }), goals.includes(goal.id) && (_jsx(CheckCircle, { className: 'h-4 w-4 text-blue-600' }))] })] }) }, goal.id))) }), _jsxs("div", { className: 'flex gap-3 pt-4', children: [_jsxs(Button, { onClick: () => onComplete({ protectionGoals: goals }), disabled: goals.length === 0, className: 'flex-1', children: ["Continue", _jsx(ArrowRight, { className: 'h-4 w-4 ml-2' })] }), _jsx(Button, { variant: 'ghost', onClick: onSkip, children: "Skip" })] })] })] }));
}
function PersonalInfoStep({ onComplete, onSkip, }) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "A few details about you" }), _jsx("p", { className: 'text-gray-600', children: "This helps us personalize your experience and ensure legal compliance." })] }), _jsxs(CardContent, { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'personal-name', children: "What should we call you?" }), _jsx(Input, { id: 'personal-name', value: name, onChange: e => setName(e.target.value), placeholder: 'Your first name', className: 'mt-1' })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'location', children: "Where are you located?" }), _jsx(Input, { id: 'location', value: location, onChange: e => setLocation(e.target.value), placeholder: 'City, State or Country', className: 'mt-1' }), _jsx("p", { className: 'text-xs text-gray-500 mt-1', children: "This helps us provide region-specific legal guidance" })] }), _jsxs("div", { className: 'flex gap-3 pt-4', children: [_jsxs(Button, { onClick: () => onComplete({ name, location }), disabled: !name.trim(), className: 'flex-1', children: ["Continue", _jsx(ArrowRight, { className: 'h-4 w-4 ml-2' })] }), _jsx(Button, { variant: 'ghost', onClick: onSkip, children: "Skip" })] })] })] }));
}
function FirstActionStep({ onComplete, userData: _userData, }) {
    const quickActions = [
        {
            id: 'upload_document',
            title: 'Upload your first document',
            description: 'Start by uploading an important document like an insurance policy or bank statement',
            time: '2 min',
            impact: 'Quick win',
            icon: Shield,
            primary: true,
        },
        {
            id: 'add_contact',
            title: 'Add a trusted contact',
            description: 'Add someone who can access your information in an emergency',
            time: '3 min',
            impact: 'High impact',
            icon: Users,
            primary: false,
        },
        {
            id: 'start_will',
            title: 'Start creating your will',
            description: 'Begin the guided process to create a legally valid will',
            time: '10 min',
            impact: 'Major milestone',
            icon: CheckCircle,
            primary: false,
        },
    ];
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(CheckCircle, { className: 'h-5 w-5 text-green-600' }), "Take your first step"] }), _jsx("p", { className: 'text-gray-600', children: "Choose what feels right to start with. You can always do the others later." })] }), _jsxs(CardContent, { className: 'space-y-4', children: [quickActions.map((action, _index) => (_jsx("button", { onClick: () => onComplete({ firstAction: action.id, onboardingComplete: true }), className: cn('w-full p-4 text-left border rounded-lg hover:shadow-md transition-all', action.primary
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:bg-gray-50'), children: _jsxs("div", { className: 'flex items-start gap-3', children: [_jsx(action.icon, { className: cn('h-6 w-6 mt-1', action.primary ? 'text-blue-600' : 'text-gray-500') }), _jsxs("div", { className: 'flex-1', children: [_jsx("h4", { className: 'font-medium mb-1', children: action.title }), _jsx("p", { className: 'text-sm text-gray-600 mb-2', children: action.description }), _jsxs("div", { className: 'flex items-center justify-between text-xs', children: [_jsxs("span", { className: 'text-gray-500', children: [_jsx(Clock, { className: 'h-3 w-3 inline mr-1' }), action.time] }), _jsx("span", { className: cn('font-medium', action.primary ? 'text-blue-600' : 'text-gray-600'), children: action.impact })] })] }), _jsx(ArrowRight, { className: cn('h-4 w-4 mt-1', action.primary ? 'text-blue-600' : 'text-gray-400') })] }) }, action.id))), _jsx("div", { className: 'pt-4 border-t', children: _jsx("p", { className: 'text-xs text-gray-500 text-center', children: "Don't worry - you can always change your mind or do multiple things later" }) })] })] }));
}
export default ABTestOnboardingFlow;
