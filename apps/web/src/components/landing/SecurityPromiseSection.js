import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/landing/SecurityPromiseSection.tsx
import { useTranslation } from 'react-i18next';
import { BadgeCheck, KeyRound, ShieldCheck, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
const getFeatures = (t) => [
    {
        icon: _jsx(ShieldCheck, { className: 'h-10 w-10 text-yellow-400' }),
        title: t('features.0.title'),
        description: t('features.0.description'),
    },
    {
        icon: _jsx(KeyRound, { className: 'h-10 w-10 text-yellow-400' }),
        title: t('features.1.title'),
        description: t('features.1.description'),
    },
    {
        icon: _jsx(BadgeCheck, { className: 'h-10 w-10 text-yellow-400' }),
        title: t('features.2.title'),
        description: t('features.2.description'),
    },
    {
        icon: _jsx(Timer, { className: 'h-10 w-10 text-yellow-400' }),
        title: t('features.3.title'),
        description: t('features.3.description'),
    },
];
export const SecurityPromiseSection = () => {
    const { t } = useTranslation('landing/security-promise');
    const features = getFeatures(t);
    return (_jsx("section", { className: 'py-20 bg-slate-900/50', children: _jsxs("div", { className: 'container mx-auto px-6 text-center', children: [_jsx("h2", { className: 'text-4xl font-bold text-white mb-4', children: t('title') }), _jsx("p", { className: 'text-lg text-slate-300 mb-12 max-w-3xl mx-auto', children: t('subtitle') }), _jsx("div", { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8', children: features.map((feature, index) => (_jsxs("div", { className: 'bg-slate-800/60 p-8 rounded-lg shadow-md border border-slate-700 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl', children: [_jsx("div", { className: 'mb-6 inline-block p-4 bg-yellow-400/10 rounded-full', children: feature.icon }), _jsx("h3", { className: 'text-xl font-bold text-white mb-3', children: feature.title }), _jsx("p", { className: 'text-slate-300', children: feature.description })] }, index))) }), _jsx("div", { className: 'mt-16', children: _jsxs(Link, { to: '/security-deep-dive', className: 'text-slate-300 hover:text-yellow-400 transition-colors', children: [t('learnMore.text'), " ", t('learnMore.arrow')] }) })] }) }));
};
