import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Progressive Unlock Animations
 * Pillar and feature unlock animations for emotional impact
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, Sparkles, Star, Crown, Gift, Heart, Shield, Zap, Award, Gem } from 'lucide-react';
import { cn } from '../../lib/utils';
export function UnlockAnimations({ unlockEvent, onUnlockComplete, onSkip, className }) {
    const [animationPhase, setAnimationPhase] = useState('lock');
    const [showRewards, setShowRewards] = useState(false);
    useEffect(() => {
        if (!unlockEvent)
            return;
        const phases = [
            { phase: 'lock', delay: 0 },
            { phase: 'unlock', delay: 1500 },
            { phase: 'reveal', delay: 3000 },
            { phase: 'celebration', delay: 4500 }
        ];
        const timers = phases.map(({ phase, delay }) => setTimeout(() => {
            setAnimationPhase(phase);
            if (phase === 'celebration') {
                setShowRewards(true);
            }
        }, delay));
        // Auto-complete after celebration
        const completeTimer = setTimeout(() => {
            onUnlockComplete(unlockEvent.id);
        }, 8000);
        return () => {
            timers.forEach(clearTimeout);
            clearTimeout(completeTimer);
        };
    }, [unlockEvent, onUnlockComplete]);
    if (!unlockEvent)
        return null;
    const getRarityEffects = (rarity) => {
        switch (rarity) {
            case 'legendary':
                return {
                    particles: 50,
                    colors: ['#FFD700', '#FFA500', '#FF6B35', '#FF1744'],
                    glowIntensity: 0.8,
                    sparkleSize: 'large'
                };
            case 'epic':
                return {
                    particles: 30,
                    colors: ['#9C27B0', '#673AB7', '#3F51B5'],
                    glowIntensity: 0.6,
                    sparkleSize: 'medium'
                };
            case 'rare':
                return {
                    particles: 20,
                    colors: ['#2196F3', '#03A9F4', '#00BCD4'],
                    glowIntensity: 0.4,
                    sparkleSize: 'medium'
                };
            case 'common':
                return {
                    particles: 10,
                    colors: ['#9E9E9E', '#607D8B'],
                    glowIntensity: 0.2,
                    sparkleSize: 'small'
                };
        }
    };
    const rarityEffects = getRarityEffects(unlockEvent.rarity);
    return (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: cn("fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center", className), children: _jsxs("div", { className: "relative w-full max-w-2xl mx-auto px-6", children: [onSkip && (_jsx(motion.button, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 2 }, onClick: onSkip, className: "absolute top-4 right-4 text-white/60 hover:text-white text-sm underline transition-colors z-10", children: "Presko\u010Di\u0165 anim\u00E1ciu" })), _jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [Array.from({ length: rarityEffects.particles }).map((_, i) => (_jsx(motion.div, { className: "absolute w-2 h-2 rounded-full", style: {
                                backgroundColor: rarityEffects.colors[i % rarityEffects.colors.length],
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`
                            }, animate: {
                                y: [0, -50, -100],
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                rotate: [0, 180, 360]
                            }, transition: {
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 3
                            } }, i))), animationPhase !== 'lock' && (_jsx(motion.div, { initial: { opacity: 0, scale: 0 }, animate: { opacity: rarityEffects.glowIntensity, scale: 1 }, className: "absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent" }))] }), _jsx("div", { className: "relative text-center", children: _jsxs(AnimatePresence, { mode: "wait", children: [animationPhase === 'lock' && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.2 }, className: "space-y-8", children: [_jsxs(motion.div, { animate: {
                                            rotate: [0, 5, -5, 0],
                                            scale: [1, 1.05, 1]
                                        }, transition: { duration: 2, repeat: Infinity }, className: "w-32 h-32 mx-auto bg-gray-600 rounded-full flex items-center justify-center relative", children: [_jsx(Lock, { className: "w-16 h-16 text-white" }), _jsx("div", { className: "absolute inset-0 border-4 border-gray-400 rounded-full opacity-60" }), _jsx("div", { className: "absolute inset-2 border-2 border-gray-500 rounded-full opacity-40" })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-white mb-4", children: "Odomykanie novej mo\u017Enosti..." }), _jsx("p", { className: "text-lg text-gray-300", children: unlockEvent.triggerCondition })] })] }, "lock")), animationPhase === 'unlock' && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.2 }, className: "space-y-8", children: [_jsxs(motion.div, { initial: { scale: 1 }, animate: { scale: [1, 1.2, 1] }, transition: { duration: 1 }, className: "relative w-32 h-32 mx-auto", children: [_jsx(motion.div, { initial: { x: -100, rotate: -45 }, animate: { x: 0, rotate: 0 }, transition: { duration: 1, type: "spring" }, className: "absolute inset-0 flex items-center justify-center", children: _jsx(Key, { className: "w-16 h-16 text-yellow-400" }) }), _jsx(motion.div, { initial: { opacity: 1 }, animate: { opacity: 0, scale: 0 }, transition: { delay: 0.5, duration: 0.5 }, className: "absolute inset-0 bg-gray-600 rounded-full flex items-center justify-center", children: _jsx(Lock, { className: "w-16 h-16 text-white" }) }), Array.from({ length: 8 }).map((_, i) => (_jsx(motion.div, { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 0.7 + i * 0.1 }, className: "absolute text-yellow-400", style: {
                                                    left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 60}%`,
                                                    top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 60}%`,
                                                    transform: 'translate(-50%, -50%)'
                                                }, children: _jsx(Sparkles, { className: "w-4 h-4" }) }, i)))] }), _jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-white mb-4", children: "Odomknut\u00E9! \uD83C\uDF89" }), _jsx("p", { className: "text-lg text-gray-300", children: "Pr\u00EDstup udelen\u00FD..." })] })] }, "unlock")), animationPhase === 'reveal' && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "space-y-8", children: [_jsxs(motion.div, { initial: { scale: 0, rotate: -180 }, animate: { scale: 1, rotate: 0 }, transition: { duration: 1, type: "spring" }, className: cn("w-32 h-32 mx-auto rounded-full flex items-center justify-center relative", unlockEvent.gradient), children: [_jsx("div", { className: "text-white text-4xl", children: unlockEvent.icon }), _jsx(motion.div, { animate: {
                                                    scale: [1, 1.3, 1],
                                                    opacity: [0.5, 0.8, 0.5]
                                                }, transition: { duration: 2, repeat: Infinity }, className: "absolute inset-0 rounded-full bg-white/20" })] }), _jsxs("div", { children: [_jsx(motion.h2, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "text-4xl font-bold text-white mb-4", children: unlockEvent.title }), _jsx(motion.p, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "text-xl text-gray-300 leading-relaxed max-w-lg mx-auto", children: unlockEvent.description }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.4 }, className: cn("inline-block mt-4 px-4 py-2 rounded-full text-sm font-medium", unlockEvent.rarity === 'legendary' ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" :
                                                    unlockEvent.rarity === 'epic' ? "bg-gradient-to-r from-purple-400 to-purple-600 text-white" :
                                                        unlockEvent.rarity === 'rare' ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white" :
                                                            "bg-gradient-to-r from-gray-400 to-gray-600 text-white"), children: [unlockEvent.rarity.toUpperCase(), " UNLOCK"] })] })] }, "reveal")), animationPhase === 'celebration' && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, className: "space-y-8", children: [_jsxs(motion.div, { animate: {
                                            y: [0, -10, 0],
                                            rotate: [0, 5, -5, 0]
                                        }, transition: { duration: 2, repeat: Infinity }, className: cn("w-40 h-40 mx-auto rounded-full flex items-center justify-center relative", unlockEvent.gradient), children: [_jsx("div", { className: "text-white text-5xl", children: unlockEvent.icon }), unlockEvent.rarity === 'legendary' && (_jsx(motion.div, { initial: { y: -20, opacity: 0 }, animate: { y: -40, opacity: 1 }, className: "absolute top-0 left-1/2 transform -translate-x-1/2", children: _jsx(Crown, { className: "w-8 h-8 text-yellow-400" }) })), _jsx(motion.div, { animate: {
                                                    scale: [1, 1.4, 1],
                                                    opacity: [0.3, 0.6, 0.3]
                                                }, transition: { duration: 3, repeat: Infinity }, className: "absolute inset-0 rounded-full bg-white/30" }), _jsx(motion.div, { animate: {
                                                    scale: [1, 1.6, 1],
                                                    opacity: [0.2, 0.4, 0.2]
                                                }, transition: { duration: 3, repeat: Infinity, delay: 0.5 }, className: "absolute inset-0 rounded-full bg-white/20" })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-bold text-white mb-4", children: unlockEvent.celebrationMessage }), _jsx("p", { className: "text-xl text-gray-300 mb-8 max-w-lg mx-auto", children: "Gratulujem! Dosiahli ste d\u00F4le\u017Eit\u00FD m\u00ED\u013Enik na va\u0161ej ceste." }), _jsx(AnimatePresence, { children: showRewards && unlockEvent.rewards && unlockEvent.rewards.length > 0 && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2", children: [_jsx(Gift, { className: "w-5 h-5" }), "Nov\u00E9 mo\u017Enosti"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto", children: unlockEvent.rewards.map((reward, index) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.2 }, className: "bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("div", { className: "text-yellow-400", children: reward.icon }), _jsx("h4", { className: "font-semibold text-white text-sm", children: reward.title })] }), _jsx("p", { className: "text-xs text-gray-300", children: reward.description })] }, reward.id))) })] })) }), _jsx(motion.button, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1 }, onClick: () => onUnlockComplete(unlockEvent.id), className: "mt-8 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105", children: "Pokra\u010Dova\u0165" })] })] }, "celebration"))] }) }), animationPhase === 'celebration' && (_jsx("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: Array.from({ length: 50 }).map((_, i) => (_jsx(motion.div, { className: "absolute w-3 h-3", style: {
                            backgroundColor: rarityEffects.colors[i % rarityEffects.colors.length],
                            left: `${Math.random() * 100}%`,
                            top: '-10%'
                        }, animate: {
                            y: [0, window.innerHeight + 100],
                            x: [(Math.random() - 0.5) * 200],
                            rotate: [0, 360, 720],
                            opacity: [1, 1, 0]
                        }, transition: {
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 3
                        } }, i))) }))] }) }));
}
// Predefined unlock events for common scenarios
export const createPillarUnlockEvent = (pillarId) => {
    if (pillarId === 'zajtra') {
        return {
            id: 'unlock_zajtra',
            type: 'pillar',
            title: 'ZAJTRA Odomknuté',
            description: 'Teraz môžete plánovať ochranu svojej budúcnosti a nastaviť strážcov svojho odkazu.',
            icon: _jsx(Shield, { className: "w-full h-full" }),
            color: 'bg-green-500',
            gradient: 'bg-gradient-to-br from-green-500 via-emerald-600 to-green-600',
            rarity: 'rare',
            triggerCondition: 'Nahráli ste svoje prvé dokumenty',
            celebrationMessage: 'Budúcnosť je teraz vo vašich rukách!',
            rewards: [
                {
                    id: 'guardians_setup',
                    type: 'feature',
                    title: 'Nastavenie strážcov',
                    description: 'Určte dôveryhodné osoby pre prístup k odkazu',
                    icon: _jsx(Shield, { className: "w-4 h-4" })
                },
                {
                    id: 'emergency_plans',
                    type: 'feature',
                    title: 'Núdzové plány',
                    description: 'Vytvorte plány pre neočakávané situácie',
                    icon: _jsx(Zap, { className: "w-4 h-4" })
                }
            ]
        };
    }
    else {
        return {
            id: 'unlock_navzdy',
            type: 'pillar',
            title: 'NAVŽDY Odomknuté',
            description: 'Váš odkaz môže teraz pretrvať večne. Vytvorte závety, časové kapsuly a hodnoty pre budúce generácie.',
            icon: _jsx(Heart, { className: "w-full h-full" }),
            color: 'bg-purple-500',
            gradient: 'bg-gradient-to-br from-purple-500 via-pink-600 to-purple-600',
            rarity: 'legendary',
            triggerCondition: 'Nastavili ste ochranu a strážcov',
            celebrationMessage: 'Váš odkaz bude žiť navždy!',
            rewards: [
                {
                    id: 'will_creation',
                    type: 'feature',
                    title: 'Tvorba závetu',
                    description: 'Vytvorte právne platný závet',
                    icon: _jsx(Award, { className: "w-4 h-4" })
                },
                {
                    id: 'time_capsules',
                    type: 'feature',
                    title: 'Časové kapsuly',
                    description: 'Správy pre budúce významné momenty',
                    icon: _jsx(Gem, { className: "w-4 h-4" })
                },
                {
                    id: 'values_legacy',
                    type: 'content',
                    title: 'Odkaz hodnôt',
                    description: 'Zapíšte svoju múdrosť pre potomkov',
                    icon: _jsx(Star, { className: "w-4 h-4" })
                }
            ]
        };
    }
};
