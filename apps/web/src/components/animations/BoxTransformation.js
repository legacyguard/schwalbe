import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GardenSeed } from './GardenSeed';
export const BoxTransformation = ({ isVisible, onComplete, seedDestination = { x: 0, y: 0 }, duration = 3000, }) => {
    const [stage, setStage] = useState('box');
    const [showSeed, setShowSeed] = useState(false);
    useEffect(() => {
        if (!isVisible)
            return;
        const stageTransitions = [
            { stage: 'opening', delay: 500 },
            { stage: 'revealing', delay: 1000 },
            { stage: 'transforming', delay: 1500 },
            { stage: 'complete', delay: 2500 },
        ];
        const timeouts = stageTransitions.map(({ stage, delay }) => setTimeout(() => setStage(stage), delay));
        // Show seed during revealing stage
        setTimeout(() => setShowSeed(true), 1000);
        // Call onComplete callback
        setTimeout(() => {
            onComplete?.();
        }, duration);
        return () => {
            timeouts.forEach(timeout => clearTimeout(timeout));
        };
    }, [isVisible, onComplete, duration]);
    if (!isVisible)
        return null;
    return (_jsx("div", { className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm', children: _jsxs("div", { className: 'relative w-64 h-64', children: [_jsx(AnimatePresence, { children: stage !== 'complete' && (_jsx(motion.div, { className: 'absolute inset-0 flex items-center justify-center', initial: { scale: 0.5, opacity: 0 }, animate: {
                            scale: 1,
                            opacity: 1,
                            rotateY: stage === 'opening' ? 15 : 0,
                        }, exit: { scale: 0.3, opacity: 0, y: 20 }, transition: { duration: 0.8, ease: 'easeOut' }, children: _jsxs("div", { className: 'relative w-32 h-32 perspective-1000', children: [_jsx(motion.div, { className: 'absolute inset-0 bg-gradient-to-br from-amber-200 to-amber-400 rounded-lg shadow-2xl border border-amber-300', animate: {
                                        boxShadow: [
                                            '0 10px 30px rgba(245, 158, 11, 0.3)',
                                            '0 10px 40px rgba(245, 158, 11, 0.5)',
                                            '0 10px 30px rgba(245, 158, 11, 0.3)',
                                        ],
                                    }, transition: {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    } }), _jsxs(motion.div, { className: 'absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg border border-amber-400 origin-bottom', animate: {
                                        rotateX: stage === 'opening' || stage === 'revealing' ? -120 : 0,
                                        transformOrigin: 'bottom center',
                                    }, transition: { duration: 1, ease: 'easeInOut' }, style: { transformStyle: 'preserve-3d' }, children: [_jsx("div", { className: 'absolute inset-2 border-2 border-amber-200 rounded opacity-60' }), _jsx("div", { className: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-2 bg-amber-600 rounded-full' })] }), _jsx(AnimatePresence, { children: (stage === 'opening' || stage === 'revealing') && (_jsx(motion.div, { className: 'absolute inset-0 bg-gradient-radial from-yellow-200/80 via-yellow-300/40 to-transparent rounded-lg', initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.8 } })) }), _jsx(AnimatePresence, { children: stage === 'revealing' && (_jsx(_Fragment, { children: [...Array(6)].map((_, i) => (_jsx(motion.div, { className: 'absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-yellow-400 to-transparent origin-bottom', style: {
                                                height: '200px',
                                                transform: `translate(-50%, -50%) rotate(${i * 60}deg)`,
                                            }, initial: { scaleY: 0, opacity: 0 }, animate: { scaleY: 1, opacity: 0.8 }, exit: { scaleY: 0, opacity: 0 }, transition: {
                                                duration: 1,
                                                delay: i * 0.1,
                                                ease: 'easeOut',
                                            } }, i))) })) }), _jsx(AnimatePresence, { children: showSeed && stage === 'revealing' && (_jsx(motion.div, { className: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', initial: { scale: 0, y: 10, opacity: 0 }, animate: { scale: 1, y: [-5, 5, -5], opacity: 1 }, exit: { scale: 0, opacity: 0 }, transition: {
                                            scale: { duration: 0.8, ease: 'easeOut' },
                                            y: {
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            },
                                            opacity: { duration: 0.5 },
                                        }, children: _jsx(GardenSeed, { size: 'small', progress: 10, showPulse: true }) })) })] }) })) }), _jsx(AnimatePresence, { children: stage === 'transforming' && (_jsx(motion.div, { className: 'absolute top-1/2 left-1/2', initial: {
                            x: -12, // Half width of small seed
                            y: -12, // Half height of small seed
                            scale: 0.8,
                        }, animate: {
                            x: seedDestination.x - 12,
                            y: seedDestination.y - 12,
                            scale: 1,
                        }, transition: { duration: 2, ease: 'easeInOut' }, children: _jsx(GardenSeed, { size: 'small', progress: 15, showPulse: true }) })) }), _jsx(AnimatePresence, { children: stage === 'transforming' && (_jsx(_Fragment, { children: [...Array(12)].map((_, i) => (_jsx(motion.div, { className: 'absolute w-2 h-2 bg-yellow-300 rounded-full', style: { top: '50%', left: '50%' }, initial: { x: 0, y: 0, opacity: 1, scale: 0 }, animate: {
                                x: Math.cos((i * Math.PI * 2) / 12) * 150,
                                y: Math.sin((i * Math.PI * 2) / 12) * 150,
                                opacity: 0,
                                scale: [0, 1, 0],
                            }, transition: { duration: 2, ease: 'easeOut', delay: i * 0.05 } }, i))) })) }), _jsx(AnimatePresence, { children: stage === 'transforming' && (_jsxs(motion.div, { className: 'absolute -bottom-16 left-1/2 -translate-x-1/2 text-center', initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.8 }, children: [_jsx("p", { className: 'text-white font-medium text-lg', children: "Your garden is taking root..." }), _jsx("p", { className: 'text-white/80 text-sm mt-1', children: "Watch it grow with every step you take" })] })) })] }) }));
};
export default BoxTransformation;
