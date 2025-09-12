import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/FadeIn';
import { BoxTransformation } from '@/components/animations/BoxTransformation';
export default function Scene4Prepare({ onBack, onComplete, }) {
    const [progress, setProgress] = useState(0);
    const [showFirefly, setShowFirefly] = useState(true);
    const [showBoxTransformation, setShowBoxTransformation] = useState(true);
    const [transformationComplete, setTransformationComplete] = useState(false);
    useEffect(() => {
        // Show box transformation first, then proceed with firefly animation
        const transformationTimer = setTimeout(() => {
            setShowBoxTransformation(false);
            setTransformationComplete(true);
            // Start progress animation after transformation
            const progressTimer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressTimer);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 32); // ~60fps
            // Complete onboarding after animation
            const completeTimer = setTimeout(() => {
                setShowFirefly(false);
                setTimeout(() => {
                    if (onComplete) {
                        onComplete();
                    }
                }, 500);
            }, 3000);
            return () => {
                clearInterval(progressTimer);
                clearTimeout(completeTimer);
            };
        }, 4000); // Box transformation duration
        return () => {
            clearTimeout(transformationTimer);
        };
    }, [onComplete]);
    const handleTransformationComplete = () => {
        setTransformationComplete(true);
    };
    return (_jsxs("div", { className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900', children: [_jsx(BoxTransformation, { isVisible: showBoxTransformation, onComplete: handleTransformationComplete, seedDestination: { x: 0, y: -200 }, duration: 4000 }), _jsx(AnimatePresence, { children: transformationComplete && (_jsx(FadeIn, { duration: 0.8, children: _jsxs(Card, { className: 'w-full max-w-2xl text-center border-primary/20 shadow-xl bg-background/95 backdrop-blur', children: [_jsx(CardHeader, { children: _jsx(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2, duration: 0.8 }, children: _jsx(CardTitle, { className: 'text-2xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent', children: "Preparing Your Path" }) }) }), _jsxs(CardContent, { children: [_jsx(motion.p, { className: 'text-muted-foreground mb-8 text-lg leading-relaxed', initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.4, duration: 0.8 }, children: "Thank you. I understand what matters to you. I am preparing your Path of Peace where your first milestone awaits - the Foundation Stone of Security." }), _jsxs(motion.div, { className: 'relative h-40 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-primary/30 mb-8 overflow-hidden', initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.6, duration: 0.8 }, children: [[...Array(30)].map((_, i) => (_jsx(motion.div, { className: 'absolute w-0.5 h-0.5 bg-white/60 rounded-full', style: {
                                                    left: `${Math.random() * 100}%`,
                                                    top: `${Math.random() * 100}%`,
                                                }, animate: { opacity: [0.3, 1, 0.3] }, transition: {
                                                    duration: 2 + Math.random() * 3,
                                                    repeat: Infinity,
                                                    delay: Math.random() * 2,
                                                } }, i))), _jsx(AnimatePresence, { children: showFirefly && (_jsxs(_Fragment, { children: [_jsx(motion.div, { className: 'absolute w-3 h-3 bg-yellow-300 rounded-full shadow-lg', style: {
                                                                boxShadow: '0 0 15px #fde047, 0 0 30px #facc15, 0 0 45px #eab308',
                                                            }, initial: { x: 50, y: 120 }, animate: {
                                                                x: [50, 150, 280, 320, 280, 150, 100, 50],
                                                                y: [120, 60, 40, 80, 140, 100, 80, 120],
                                                            }, transition: {
                                                                duration: 8,
                                                                ease: 'easeInOut',
                                                                times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
                                                            } }), _jsxs("svg", { className: 'absolute inset-0 w-full h-full', children: [_jsx(motion.path, { d: 'M 50 120 Q 150 60, 280 40 Q 320 80, 280 140 Q 150 100, 100 80 Q 50 120, 50 120', stroke: 'url(#firefly-gradient)', strokeWidth: '2', fill: 'none', strokeLinecap: 'round', initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 0.8 }, transition: {
                                                                        pathLength: { duration: 8, ease: 'easeInOut' },
                                                                        opacity: { duration: 1, delay: 0.5 },
                                                                    } }), _jsx("defs", { children: _jsxs("linearGradient", { id: 'firefly-gradient', x1: '0%', y1: '0%', x2: '100%', y2: '0%', children: [_jsx("stop", { offset: '0%', stopColor: '#fde047', stopOpacity: '0.2' }), _jsx("stop", { offset: '50%', stopColor: '#facc15', stopOpacity: '0.6' }), _jsx("stop", { offset: '100%', stopColor: '#eab308', stopOpacity: '0.3' })] }) })] }), [...Array(12)].map((_, i) => (_jsx(motion.div, { className: 'absolute w-1 h-1 bg-yellow-200 rounded-full', initial: {
                                                                x: 50 + i * 30,
                                                                y: 120 - i * 8 + Math.sin(i) * 20,
                                                                opacity: 0,
                                                                scale: 0,
                                                            }, animate: {
                                                                opacity: [0, 1, 0],
                                                                scale: [0, 1, 0],
                                                            }, transition: {
                                                                duration: 1,
                                                                delay: i * 0.3 + 1,
                                                                repeat: Infinity,
                                                                repeatDelay: 3,
                                                            } }, i))), _jsxs(motion.div, { className: 'absolute', style: { left: '15%', top: '75%' }, initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 4, duration: 1 }, children: [_jsx("div", { className: 'w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full border-2 border-blue-300 flex items-center justify-center shadow-lg', children: _jsx("div", { className: 'text-white text-xs', children: "\uD83D\uDDFF" }) }), _jsx("div", { className: 'absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-xs text-blue-300 whitespace-nowrap font-medium', children: "Foundation Stone" })] }), _jsxs(motion.div, { className: 'absolute', style: { left: '35%', top: '50%' }, initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 5, duration: 1 }, children: [_jsx("div", { className: 'w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-green-300 flex items-center justify-center shadow-lg', children: _jsx("div", { className: 'text-white text-xs', children: "\uD83E\uDD1D" }) }), _jsx("div", { className: 'absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-xs text-green-300 whitespace-nowrap font-medium', children: "Circle of Trust" })] }), _jsx(motion.div, { className: 'absolute inset-0 flex items-center justify-center', initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 6, duration: 2 }, children: _jsxs("div", { className: 'text-center', children: [_jsx(motion.div, { className: 'text-yellow-300 text-2xl mb-2', animate: { scale: [1, 1.1, 1] }, transition: {
                                                                            duration: 2,
                                                                            repeat: Infinity,
                                                                        }, children: "\u2728" }), _jsx("p", { className: 'text-white/90 text-sm font-medium', children: "Your Path of Peace is ready" })] }) })] })) })] }), _jsxs(motion.div, { className: 'mb-6', initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 1, duration: 0.8 }, children: [_jsxs("div", { className: 'flex items-center justify-center gap-3 mb-3', children: [_jsx("div", { className: 'text-sm text-muted-foreground', children: "Setting up your vault" }), _jsxs("div", { className: 'text-sm text-primary font-medium', children: [Math.round(progress), "%"] })] }), _jsx("div", { className: 'w-full bg-muted rounded-full h-2', children: _jsx(motion.div, { className: 'bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full', style: { width: `${progress}%` }, transition: { duration: 0.1 } }) })] }), _jsxs(motion.div, { className: 'flex gap-3 justify-between', initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1.2, duration: 0.6 }, children: [_jsx(Button, { variant: 'outline', onClick: onBack, className: 'border-primary/20 hover:border-primary/40', disabled: progress > 50, children: "\u2190 Back" }), _jsxs(Button, { disabled: true, className: 'bg-primary/50 text-primary-foreground', children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: {
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: 'linear',
                                                        }, className: 'w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2' }), "Preparing your sanctuary..."] })] }), _jsx(motion.p, { className: 'text-xs text-muted-foreground/70 mt-4', initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 1.5, duration: 0.8 }, children: "Welcome to LegacyGuard \u2022 Your story is precious" })] })] }) })) })] }));
}
