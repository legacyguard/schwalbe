import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Three Pillars Design - Dashboard "Centrum Pokoja"
 * DNES (Today) | ZAJTRA (Tomorrow) | NAVŽDY (Forever) pillars
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Shield, Heart, Calendar, FileText, Users, Key, Crown, Lock, Unlock, Star, Sparkles, ArrowRight, Plus, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
export function ThreePillars({ pillars, onPillarClick, onActionClick, className, userName = "Milý používateľ" }) {
    const [selectedPillar, setSelectedPillar] = useState(null);
    const [showUnlockAnimation, setShowUnlockAnimation] = useState(null);
    // Auto-select first unlocked pillar
    useEffect(() => {
        if (!selectedPillar) {
            const firstUnlocked = pillars.find(p => p.unlocked);
            if (firstUnlocked) {
                setSelectedPillar(firstUnlocked.id);
            }
        }
    }, [pillars, selectedPillar]);
    // Watch for newly unlocked pillars
    useEffect(() => {
        pillars.forEach(pillar => {
            if (pillar.unlocked && !selectedPillar) {
                setShowUnlockAnimation(pillar.id);
                setTimeout(() => setShowUnlockAnimation(null), 3000);
            }
        });
    }, [pillars]);
    const handlePillarClick = (pillarId) => {
        const pillar = pillars.find(p => p.id === pillarId);
        if (pillar?.unlocked) {
            setSelectedPillar(pillarId);
            onPillarClick(pillarId);
        }
    };
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12)
            return "Dobré ráno";
        if (hour < 18)
            return "Dobrý deň";
        return "Dobrý večer";
    };
    const getMotivationalMessage = () => {
        const unlockedCount = pillars.filter(p => p.unlocked).length;
        if (unlockedCount === 1) {
            return "Začali ste svoju cestu. Každý dokument, ktorý pridáte, posilňuje váš odkaz.";
        }
        else if (unlockedCount === 2) {
            return "Skvelé! Váš pokrok otvára nové možnosti pre budúcnosť.";
        }
        else if (unlockedCount === 3) {
            return "Úžasné! Máte prístup ku všetkým pilierom vášho odkazu.";
        }
        return "Vitajte v centre pokoja. Tu budujete svoj digitálny odkaz.";
    };
    return (_jsxs("div", { className: cn("w-full max-w-7xl mx-auto", className), children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "mb-6", children: [_jsxs("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: [getGreeting(), ", ", userName] }), _jsx("p", { className: "text-xl text-gray-600 leading-relaxed", children: getMotivationalMessage() })] }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.3 }, className: "inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full border border-blue-200", children: [_jsx(Sparkles, { className: "w-5 h-5 text-blue-500" }), _jsx("span", { className: "text-blue-700 font-medium", children: "Centrum Pokoja" }), _jsx(Heart, { className: "w-5 h-5 text-pink-500" })] })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12", children: pillars.map((pillar, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.2 }, className: "relative", children: [_jsx(AnimatePresence, { children: showUnlockAnimation === pillar.id && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-3xl z-10 flex items-center justify-center", children: _jsx(motion.div, { initial: { scale: 0, rotate: -180 }, animate: { scale: 1, rotate: 0 }, exit: { scale: 0, rotate: 180 }, className: "text-6xl", children: "\uD83C\uDF89" }) })) }), _jsxs(motion.div, { onClick: () => handlePillarClick(pillar.id), className: cn("relative h-96 rounded-3xl p-8 cursor-pointer transition-all duration-300 border-2", pillar.unlocked
                                ? `${pillar.gradient} border-white/20 shadow-xl hover:shadow-2xl hover:scale-105`
                                : "bg-gray-100 border-gray-200 cursor-not-allowed", selectedPillar === pillar.id && pillar.unlocked && "ring-4 ring-white/50 scale-105"), whileHover: pillar.unlocked ? { y: -5 } : {}, whileTap: pillar.unlocked ? { scale: 0.98 } : {}, children: [_jsx("div", { className: "absolute top-4 right-4", children: pillar.unlocked ? (_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: "w-8 h-8 bg-white/20 rounded-full flex items-center justify-center", children: _jsx(Unlock, { className: "w-4 h-4 text-white" }) })) : (_jsx("div", { className: "w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center", children: _jsx(Lock, { className: "w-4 h-4 text-gray-500" }) })) }), _jsx(motion.div, { className: cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6", pillar.unlocked ? "bg-white/20" : "bg-gray-200"), animate: pillar.unlocked ? {
                                        rotate: [0, 2, -2, 0],
                                        scale: [1, 1.05, 1]
                                    } : {}, transition: { duration: 4, repeat: Infinity }, children: _jsx("div", { className: cn("text-2xl", pillar.unlocked ? "text-white" : "text-gray-400"), children: pillar.icon }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: cn("text-2xl font-bold mb-2", pillar.unlocked ? "text-white" : "text-gray-400"), children: pillar.title }), _jsx("p", { className: cn("text-lg font-medium", pillar.unlocked ? "text-white/90" : "text-gray-400"), children: pillar.subtitle })] }), _jsx("p", { className: cn("text-sm leading-relaxed", pillar.unlocked ? "text-white/80" : "text-gray-500"), children: pillar.description }), pillar.unlocked && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-white/90 text-sm", children: "Pokrok" }), _jsxs("span", { className: "text-white font-medium text-sm", children: [Math.round(pillar.progress), "%"] })] }), _jsx("div", { className: "w-full h-2 bg-white/20 rounded-full overflow-hidden", children: _jsx(motion.div, { className: "h-full bg-white/80 rounded-full", initial: { width: 0 }, animate: { width: `${pillar.progress}%` }, transition: { duration: 1, delay: index * 0.3 } }) })] })), pillar.unlocked && (_jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-white/20", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4 text-white/80" }), _jsxs("span", { className: "text-white/90 text-sm", children: [pillar.actions.filter(a => a.completed).length, "/", pillar.actions.length, " \u00FAloh"] })] }), pillar.actions.some(a => !a.completed) && (_jsxs("div", { className: "flex items-center gap-1 text-white/90 text-sm", children: [_jsx("span", { children: "Pokra\u010Dova\u0165" }), _jsx(ArrowRight, { className: "w-4 h-4" })] }))] })), !pillar.unlocked && (_jsx("div", { className: "pt-4 border-t border-gray-300", children: _jsxs("p", { className: "text-gray-500 text-sm text-center", children: [pillar.id === 'zajtra' && "Odomkne sa po prvých dokumentoch", pillar.id === 'navzdy' && "Odomkne sa po nastavení ochrany"] }) }))] }), pillar.unlocked && (_jsx("div", { className: "absolute inset-0 pointer-events-none overflow-hidden rounded-3xl", children: Array.from({ length: 8 }).map((_, i) => (_jsx(motion.div, { className: "absolute w-1 h-1 bg-white/40 rounded-full", style: {
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`
                                        }, animate: {
                                            y: [0, -20, 0],
                                            opacity: [0.2, 0.8, 0.2],
                                            scale: [0.5, 1, 0.5]
                                        }, transition: {
                                            duration: 4 + Math.random() * 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 4
                                        } }, i))) }))] })] }, pillar.id))) }), _jsx(AnimatePresence, { mode: "wait", children: selectedPillar && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "bg-white rounded-3xl shadow-xl p-8 border border-gray-200", children: (() => {
                        const pillar = pillars.find(p => p.id === selectedPillar);
                        if (!pillar)
                            return null;
                        return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: cn("w-12 h-12 rounded-xl flex items-center justify-center", pillar.color), children: pillar.icon }), _jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: pillar.title }), _jsx("p", { className: "text-gray-600", children: pillar.subtitle })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-3xl font-bold text-gray-900", children: [Math.round(pillar.progress), "%"] }), _jsx("div", { className: "text-sm text-gray-500", children: "dokon\u010Den\u00E9" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-8", children: pillar.actions.map((action) => (_jsx(motion.div, { onClick: () => onActionClick(pillar.id, action.id), className: cn("p-4 rounded-xl border-2 cursor-pointer transition-all duration-200", action.completed
                                            ? "bg-green-50 border-green-200 hover:bg-green-100"
                                            : action.urgent
                                                ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
                                                : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"), whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: cn("flex-shrink-0 mt-1", action.completed ? "text-green-600" :
                                                        action.urgent ? "text-orange-600" : "text-gray-600"), children: action.completed ? _jsx(CheckCircle, { className: "w-5 h-5" }) : action.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: cn("font-semibold mb-1", action.completed ? "text-green-900" :
                                                                action.urgent ? "text-orange-900" : "text-gray-900"), children: action.title }), _jsx("p", { className: cn("text-sm", action.completed ? "text-green-700" :
                                                                action.urgent ? "text-orange-700" : "text-gray-600"), children: action.description }), action.estimatedTime && !action.completed && (_jsxs("div", { className: "mt-2 text-xs text-gray-500", children: ["~", action.estimatedTime, " min\u00FAt"] }))] }), !action.completed && (_jsx(ArrowRight, { className: cn("w-4 h-4 mt-1", action.urgent ? "text-orange-500" : "text-gray-400") }))] }) }, action.id))) }), pillar.achievements.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(Crown, { className: "w-5 h-5 text-yellow-500" }), "\u00DAspechy"] }), _jsx("div", { className: "flex flex-wrap gap-3", children: pillar.achievements.map((achievement) => (_jsxs(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: "flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2", children: [_jsx("div", { className: "text-yellow-600", children: achievement.icon }), _jsx("span", { className: "text-yellow-800 text-sm font-medium", children: achievement.title })] }, achievement.id))) })] }))] }));
                    })() }, selectedPillar)) })] }));
}
// Default pillar configurations
export const createDefaultPillars = (userProgress) => {
    const hasDocuments = userProgress.documentsCount > 0;
    const hasGuardians = userProgress.guardiansSet;
    return [
        {
            id: 'dnes',
            title: 'DNES',
            subtitle: 'Okamžitá hodnota',
            description: 'Zabezpečte svoje najdôležitejšie dokumenty a informácie už dnes. Každý dokument má hodnotu.',
            icon: _jsx(Sun, { className: "w-full h-full" }),
            color: 'bg-blue-500',
            gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600',
            unlocked: true,
            progress: (userProgress.documentsCount / 10) * 100,
            actions: [
                {
                    id: 'upload_documents',
                    title: 'Nahrať dokumenty',
                    description: 'Začnite s občianskym preukazom alebo iným dôležitým dokumentom',
                    icon: _jsx(Plus, { className: "w-5 h-5" }),
                    completed: userProgress.documentsCount > 0,
                    urgent: userProgress.documentsCount === 0,
                    estimatedTime: 5
                },
                {
                    id: 'organize_categories',
                    title: 'Organizovať kategórie',
                    description: 'Rozdeľte dokumenty do kategórií pre lepší prehľad',
                    icon: _jsx(FileText, { className: "w-5 h-5" }),
                    completed: userProgress.categoriesCompleted.length > 0,
                    estimatedTime: 10
                },
                {
                    id: 'verify_important',
                    title: 'Overiť dôležité údaje',
                    description: 'Skontrolujte, či sú všetky údaje správne rozpoznané',
                    icon: _jsx(CheckCircle, { className: "w-5 h-5" }),
                    completed: false,
                    estimatedTime: 15
                }
            ],
            achievements: [
                ...(userProgress.documentsCount >= 1 ? [{
                        id: 'first_document',
                        title: 'Prvý dokument',
                        description: 'Nahráli ste svoj prvý dokument',
                        icon: _jsx(Star, { className: "w-4 h-4" }),
                        unlockedAt: new Date()
                    }] : []),
                ...(userProgress.documentsCount >= 5 ? [{
                        id: 'five_documents',
                        title: 'Päť dokumentov',
                        description: 'Máte už 5 zabezpečených dokumentov',
                        icon: _jsx(Crown, { className: "w-4 h-4" }),
                        unlockedAt: new Date()
                    }] : [])
            ]
        },
        {
            id: 'zajtra',
            title: 'ZAJTRA',
            subtitle: 'Plánovaná ochrana',
            description: 'Pripravte sa na budúcnosť. Nastavte strážcov a vytvorte plány pre neočakávané situácie.',
            icon: _jsx(Shield, { className: "w-full h-full" }),
            color: 'bg-green-500',
            gradient: 'bg-gradient-to-br from-green-500 via-emerald-600 to-green-600',
            unlocked: hasDocuments,
            progress: hasGuardians ? 100 : 0,
            actions: [
                {
                    id: 'set_guardians',
                    title: 'Nastaviť strážcov',
                    description: 'Určte dôveryhodné osoby, ktoré budú mať prístup k vášmu odkazu',
                    icon: _jsx(Users, { className: "w-5 h-5" }),
                    completed: userProgress.guardiansSet,
                    urgent: !userProgress.guardiansSet,
                    estimatedTime: 20
                },
                {
                    id: 'emergency_plan',
                    title: 'Núdzový plán',
                    description: 'Vytvorte plán pre prípad núdze alebo neschopnosti',
                    icon: _jsx(Key, { className: "w-5 h-5" }),
                    completed: false,
                    estimatedTime: 25
                },
                {
                    id: 'access_instructions',
                    title: 'Inštrukcie prístupu',
                    description: 'Napíšte pokyny pre vaših blízkych ako pristúpiť k dokumentom',
                    icon: _jsx(FileText, { className: "w-5 h-5" }),
                    completed: false,
                    estimatedTime: 30
                }
            ],
            achievements: []
        },
        {
            id: 'navzdy',
            title: 'NAVŽDY',
            subtitle: 'Trvalý odkaz',
            description: 'Vytvorte kompletný odkaz pre budúce generácie. Vaše hodnoty a spomienky zostanú naveky.',
            icon: _jsx(Heart, { className: "w-full h-full" }),
            color: 'bg-purple-500',
            gradient: 'bg-gradient-to-br from-purple-500 via-pink-600 to-purple-600',
            unlocked: hasDocuments && hasGuardians,
            progress: userProgress.willCreated ? 100 : 0,
            actions: [
                {
                    id: 'create_will',
                    title: 'Vytvoriť závet',
                    description: 'Založte právny závet na základe vašich dokumentov',
                    icon: _jsx(FileText, { className: "w-5 h-5" }),
                    completed: userProgress.willCreated,
                    urgent: !userProgress.willCreated,
                    estimatedTime: 45
                },
                {
                    id: 'values_letter',
                    title: 'List hodnôt',
                    description: 'Napíšte odkaz o vašich hodnotách a múdrosti',
                    icon: _jsx(Heart, { className: "w-5 h-5" }),
                    completed: false,
                    estimatedTime: 60
                },
                {
                    id: 'time_capsules',
                    title: 'Časové kapsuly',
                    description: 'Vytvorte správy pre budúce významné momenty',
                    icon: _jsx(Calendar, { className: "w-5 h-5" }),
                    completed: false,
                    estimatedTime: 30
                }
            ],
            achievements: []
        }
    ];
};
