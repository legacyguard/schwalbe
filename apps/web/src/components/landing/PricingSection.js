import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Shield, Star, Users } from 'lucide-react';
import { Button } from '@schwalbe/ui';
import { cn } from '@/lib/utils';
const PricingCard = ({ tier, index, }) => {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1, duration: 0.6 }, className: cn('relative flex flex-col h-full p-8 rounded-2xl border transition-all duration-300', tier.highlighted
            ? 'bg-gradient-to-b from-yellow-500/5 to-transparent border-yellow-400/20 shadow-xl scale-105'
            : 'bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-yellow-400/20 hover:shadow-lg'), children: [tier.badge && (_jsx("div", { className: 'absolute -top-4 left-1/2 transform -translate-x-1/2', children: _jsxs("span", { className: 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-slate-900', children: [_jsx(Star, { className: 'w-3 h-3' }), tier.badge] }) })), _jsxs("div", { className: 'mb-8', children: [_jsx("h3", { className: 'text-2xl font-bold mb-2 text-white', children: tier.name }), _jsxs("div", { className: 'flex items-baseline mb-4', children: [_jsx("span", { className: 'text-4xl font-bold text-white', children: tier.price }), tier.period && (_jsxs("span", { className: 'text-slate-400 ml-2', children: ["/ ", tier.period] }))] }), _jsx("p", { className: 'text-slate-300', children: tier.description })] }), _jsx("div", { className: 'space-y-4 mb-8 flex-grow', children: tier.features.map((feature, idx) => (_jsxs("div", { className: 'flex gap-3', children: [_jsx("div", { className: 'flex-shrink-0 mt-1', children: _jsx(Check, { className: 'w-5 h-5 text-yellow-400' }) }), _jsxs("div", { children: [_jsx("div", { className: 'font-medium mb-1 text-white', children: feature.title }), _jsx("div", { className: 'text-sm text-slate-300', children: feature.description })] })] }, idx))) }), _jsx(Button, { onClick: tier.ctaAction, variant: tier.highlighted ? 'default' : 'outline', className: cn('w-full', tier.highlighted && 'bg-yellow-500 hover:bg-yellow-400 text-slate-900'), children: tier.cta })] }));
};
export const PricingSection = () => {
    const { t } = useTranslation('landing/pricing');
    const pricingTiers = [
        {
            id: 'free',
            name: t('tiers.free.name'),
            price: t('tiers.free.price'),
            description: t('tiers.free.description'),
            features: t('tiers.free.features', { returnObjects: true }),
            cta: t('tiers.free.cta'),
            ctaAction: () => {
                // Navigate to app download or sign up
                window.location.href = '/sign-up';
            },
        },
        {
            id: 'premium',
            name: t('tiers.premium.name'),
            price: t('tiers.premium.price'),
            period: t('tiers.premium.period'),
            description: t('tiers.premium.description'),
            highlighted: true,
            badge: t('tiers.premium.badge'),
            features: t('tiers.premium.features', { returnObjects: true }),
            cta: t('tiers.premium.cta'),
            ctaAction: () => {
                // Navigate to premium sign up
                window.location.href = '/sign-up?plan=premium';
            },
        },
        {
            id: 'family',
            name: t('tiers.family.name'),
            price: t('tiers.family.price'),
            period: t('tiers.family.period'),
            description: t('tiers.family.description'),
            features: t('tiers.family.features', { returnObjects: true }),
            cta: t('tiers.family.cta'),
            ctaAction: () => {
                // Navigate to family plan sign up
                window.location.href = '/sign-up?plan=family';
            },
        },
    ];
    return (_jsxs("section", { className: 'relative py-24 px-6 lg:px-8 overflow-hidden', children: [_jsxs("div", { className: 'absolute inset-0 -z-10', children: [_jsx("div", { className: 'absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900' }), _jsx("div", { className: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-3xl' })] }), _jsxs("div", { className: 'max-w-7xl mx-auto', children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: 'text-center mb-16', children: [_jsx("h2", { className: 'text-4xl md:text-5xl font-bold mb-4 text-white', children: "A Plan for Every Stage of Your Journey" }), _jsx("p", { className: 'text-xl text-slate-300 max-w-3xl mx-auto', children: "Start for free with our mobile app, and upgrade when you're ready to build your complete legacy." })] }), _jsx("div", { className: 'grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch', children: pricingTiers.map((tier, index) => (_jsx(PricingCard, { tier: tier, index: index }, tier.id))) }), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.6, duration: 0.6 }, className: 'mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-slate-400', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Shield, { className: 'w-4 h-4' }), _jsx("span", { children: "Bank-level encryption" })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Users, { className: 'w-4 h-4' }), _jsx("span", { children: "Trusted by 50,000+ families" })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Check, { className: 'w-4 h-4' }), _jsx("span", { children: "Cancel anytime" })] })] }), _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.8, duration: 0.6 }, className: 'mt-12 text-center', children: _jsxs("p", { className: 'text-slate-400', children: ["Have questions?", ' ', _jsx("a", { href: '#faq', className: 'text-yellow-400 hover:underline', children: "Check our FAQ" }), ' ', "or", ' ', _jsx("a", { href: '#contact', className: 'text-yellow-400 hover:underline', children: "contact us" })] }) })] })] }));
};
