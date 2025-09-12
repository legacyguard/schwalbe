import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MetaTags } from '@/components/common/MetaTags';
import { Button } from '@schwalbe/ui';
import { Card, CardContent } from '@schwalbe/ui';
import { Icon } from '@/components/ui/icon-library';
import { LegacyGuardLogo } from '@/components/LegacyGuardLogo';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { SecurityPromiseSection } from '@/components/landing/SecurityPromiseSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { RedirectGuard } from '@/lib/utils/redirect-guard';
export function LandingPage() {
    const { t } = useTranslation('ui/landing-page');
    const navigate = useNavigate();
    const { isSignedIn, isLoaded } = useAuth();
    const [isFireflyOnButton, setIsFireflyOnButton] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const heroRef = useRef(null);
    const ctaButtonRef = useRef(null);
    // Generate random values once and memoize them to prevent re-renders
    const heroStars = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        animationDelay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
    })), []);
    const finalStars = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        animationDelay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
    })), []);
    const chaosIcons = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
        id: i,
        icon: [
            '📄',
            '🔑',
            '%',
            '📋',
            '💾',
            '⚠️',
            '📅',
            '🔒',
            '📊',
            '💳',
            '📧',
            '🏠',
        ][i],
        randomDelay: Math.random() * 2,
        randomDuration: 3 + Math.random() * 2,
        randomX: Math.random() * 300,
        randomY: Math.random() * 300,
        randomRotate: Math.random() * 360,
    })), []);
    // Mouse tracking for firefly
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const fireflyX = useTransform(mouseX, value => value - 12); // Offset to center firefly
    const fireflyY = useTransform(mouseY, value => value - 12);
    // Redirect authenticated users to dashboard with onboarding check
    React.useEffect(() => {
        // Only redirect if Clerk has loaded and user is signed in
        // AND we're actually on the landing page (not already navigating)
        // AND we haven't hit a redirect loop
        if (isLoaded &&
            isSignedIn &&
            window.location.pathname === '/' &&
            RedirectGuard.canRedirect('/dashboard')) {
            // Navigate to dashboard, OnboardingWrapper will handle onboarding check
            navigate('/dashboard', { replace: true });
        }
    }, [isLoaded, isSignedIn, navigate]);
    // Prevent animation triggers when scrolling to bottom
    React.useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;
            // Check if we're near the bottom (within 200px)
            if (scrollHeight - scrollTop - clientHeight < 200) {
                if (!hasScrolledToBottom) {
                    setHasScrolledToBottom(true);
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasScrolledToBottom]);
    const handleMouseMove = useCallback((event) => {
        if (heroRef.current) {
            const rect = heroRef.current.getBoundingClientRect();
            mouseX.set(event.clientX - rect.left);
            mouseY.set(event.clientY - rect.top);
        }
    }, [mouseX, mouseY]);
    const handleGetStarted = () => {
        navigate('/sign-up');
    };
    const handleSignIn = () => {
        navigate('/sign-in');
    };
    const handleCTAHover = () => {
        setIsFireflyOnButton(true);
    };
    const handleCTALeave = () => {
        setIsFireflyOnButton(false);
    };
    return (_jsxs("div", { className: 'min-h-screen bg-slate-900', children: [_jsx(MetaTags, { title: t('meta.title'), description: t('meta.description'), url: t('meta.url') }), _jsx("header", { className: 'absolute top-0 left-0 right-0 z-50 bg-slate-900/30 backdrop-blur-sm border-b border-slate-700/30', children: _jsx("div", { className: 'container mx-auto px-4 py-4', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs(motion.div, { className: 'flex items-center gap-3', whileHover: { scale: 1.02 }, transition: { duration: 0.2 }, children: [_jsx(LegacyGuardLogo, {}), _jsx("span", { className: 'text-2xl font-bold text-white font-heading', children: "LegacyGuard" })] }), _jsxs("div", { className: 'flex items-center gap-4', children: [_jsx(motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsx(Link, { to: '/blog', children: _jsx(Button, { variant: 'ghost', className: 'text-slate-200 hover:text-white hover:bg-slate-800/50 border-0 text-lg font-medium px-4 py-2', children: t('navigation.blog') }) }) }), _jsx(motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsx(Button, { variant: 'ghost', onClick: handleSignIn, className: 'text-slate-200 hover:text-white hover:bg-slate-800/50 border-0 text-lg font-medium px-4 py-2', children: t('navigation.signIn') }) }), _jsx(motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsx(Button, { onClick: handleGetStarted, className: 'bg-slate-700/70 hover:bg-slate-600 text-white border-slate-600 text-lg font-semibold px-6 py-2', children: t('hero.cta.free') }) })] })] }) }) }), _jsxs("section", { ref: heroRef, className: 'relative min-h-screen flex items-center justify-center overflow-hidden cursor-none', onMouseMove: handleMouseMove, style: {
                    background: `
            radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
          `,
                }, children: [_jsx("div", { className: 'absolute inset-0', children: heroStars.map(star => (_jsx(motion.div, { className: 'absolute bg-white rounded-full', style: {
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                opacity: star.opacity,
                            }, animate: {
                                opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                                scale: [1, 1.2, 1],
                            }, transition: {
                                duration: star.duration,
                                repeat: Infinity,
                                delay: star.animationDelay,
                                ease: 'easeInOut',
                            } }, star.id))) }), _jsx("div", { className: 'absolute bottom-0 left-0 right-0', children: _jsxs("svg", { className: 'w-full h-64', viewBox: '0 0 1200 256', preserveAspectRatio: 'none', children: [_jsx("path", { d: 'M0,256 L0,128 L200,180 L400,120 L600,160 L800,100 L1000,140 L1200,80 L1200,256 Z', fill: 'rgba(15, 23, 42, 0.8)' }), _jsx("path", { d: 'M0,256 L0,160 L150,200 L350,140 L550,180 L750,120 L950,160 L1200,100 L1200,256 Z', fill: 'rgba(30, 41, 59, 0.6)' }), _jsx("path", { d: 'M0,256 L0,200 L100,220 L300,180 L500,210 L700,160 L900,190 L1200,140 L1200,256 Z', fill: 'rgba(51, 65, 85, 0.4)' })] }) }), _jsxs(motion.div, { className: 'fixed pointer-events-none z-40', style: { x: fireflyX, y: fireflyY }, children: [_jsx(motion.div, { className: 'absolute inset-0 rounded-full', animate: {
                                    boxShadow: [
                                        '0 0 20px rgba(255, 255, 0, 0.4)',
                                        '0 0 30px rgba(255, 255, 0, 0.6)',
                                        '0 0 20px rgba(255, 255, 0, 0.4)',
                                    ],
                                }, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }), _jsx(motion.div, { className: 'w-6 h-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-lg', animate: { scale: [1, 1.1, 1] }, style: { filter: 'brightness(1.3)' }, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }), _jsx(motion.div, { className: 'absolute -top-1 -left-1 w-3 h-3', animate: { rotate: [0, 15, -15, 0], opacity: [0.3, 0.7, 0.3] }, transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }, children: _jsx("div", { className: 'w-full h-full bg-gradient-to-br from-blue-200/60 to-purple-200/60 rounded-full blur-sm' }) }), _jsx(motion.div, { className: 'absolute -top-1 -right-1 w-3 h-3', animate: { rotate: [0, -15, 15, 0], opacity: [0.3, 0.7, 0.3] }, transition: {
                                    duration: 0.3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 0.15,
                                }, children: _jsx("div", { className: 'w-full h-full bg-gradient-to-br from-blue-200/60 to-purple-200/60 rounded-full blur-sm' }) })] }), _jsxs("div", { className: 'relative z-30 text-center text-white max-w-4xl mx-auto px-4', children: [_jsxs(motion.h1, { className: 'text-6xl lg:text-8xl font-bold mb-8 leading-tight', initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, ease: 'easeOut', delay: 0.5 }, children: [t('hero.title'), _jsx("br", {}), _jsx("span", { className: 'text-yellow-400', children: t('hero.subtitle') })] }), _jsx(motion.p, { className: 'text-xl lg:text-2xl text-slate-300 mb-16 max-w-3xl mx-auto leading-relaxed', initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1, delay: 1 }, children: t('hero.description') }), _jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.8, delay: 1.5 }, children: _jsxs(Button, { ref: ctaButtonRef, size: 'lg', onClick: handleGetStarted, onMouseEnter: handleCTAHover, onMouseLeave: handleCTALeave, className: 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xl px-12 py-6 rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 font-semibold relative overflow-hidden', children: [_jsx(motion.div, { className: 'absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300', initial: { x: '-100%' }, whileHover: { x: '0%' }, transition: { duration: 0.3 } }), _jsx("span", { className: 'relative z-10', children: t('hero.cta.main') }), isFireflyOnButton && (_jsx(motion.div, { className: 'absolute top-2 right-4 w-2 h-2 bg-yellow-300 rounded-full z-20', initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0, opacity: 0 }, transition: { duration: 0.2 } }))] }) })] })] }), _jsx("section", { className: 'py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 overflow-hidden', children: _jsx("div", { className: 'container mx-auto px-4', children: _jsxs("div", { className: 'grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto', children: [_jsxs(motion.div, { initial: { opacity: 0, x: -50 }, whileInView: { opacity: 1, x: 0 }, transition: { duration: 1 }, viewport: { once: true }, className: 'relative h-96 flex flex-col justify-center', children: [_jsx("div", { className: 'absolute inset-0 overflow-hidden', children: chaosIcons.map(item => (_jsx(motion.div, { className: 'absolute text-2xl opacity-60', initial: {
                                                x: item.randomX,
                                                y: item.randomY,
                                                rotate: item.randomRotate,
                                            }, animate: {
                                                x: [
                                                    item.randomX,
                                                    item.randomX + 50,
                                                    item.randomX - 30,
                                                    item.randomX,
                                                ],
                                                y: [
                                                    item.randomY,
                                                    item.randomY - 40,
                                                    item.randomY + 20,
                                                    item.randomY,
                                                ],
                                                rotate: [0, 180, 360],
                                                opacity: [0.6, 0.3, 0.6],
                                            }, transition: {
                                                duration: item.randomDuration,
                                                repeat: Infinity,
                                                delay: item.randomDelay,
                                                ease: 'easeInOut',
                                            }, children: item.icon }, item.id))) }), _jsxs("div", { className: 'relative z-10', children: [_jsx("h3", { className: 'text-4xl font-bold text-red-400 mb-6', children: t('problem.title') }), _jsxs("p", { className: 'text-xl text-slate-300 leading-relaxed', children: [t('problem.description'), _jsxs("span", { className: 'text-red-300 font-medium', children: [' ', t('problem.highlight')] })] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, x: 50 }, whileInView: { opacity: 1, x: 0 }, transition: { duration: 1, delay: 0.3 }, viewport: { once: true }, className: 'relative h-96 flex flex-col justify-center items-center', children: [_jsx(motion.div, { className: 'relative', whileInView: { scale: [1, 1.05, 1] }, transition: { duration: 2, delay: 1.5 }, viewport: { once: true }, children: _jsxs("div", { className: 'w-48 h-32 bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 rounded-lg border-2 border-yellow-400/40 backdrop-blur-sm relative overflow-hidden', children: [_jsx(motion.div, { className: 'absolute inset-0 bg-yellow-400/10 rounded-lg', animate: { opacity: [0.1, 0.3, 0.1] }, transition: {
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: 'easeInOut',
                                                    } }), _jsx(motion.div, { className: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', initial: { opacity: 0, scale: 0 }, whileInView: { opacity: 1, scale: 1 }, transition: { delay: 2, duration: 0.5 }, viewport: { once: true }, children: _jsx(Icon, { name: "gift", className: 'w-8 h-8 text-yellow-400' }) })] }) }), _jsxs("div", { className: 'relative z-10 text-center mt-8', children: [_jsx("h3", { className: 'text-4xl font-bold text-yellow-400 mb-6', children: t('promise.title') }), _jsxs("p", { className: 'text-xl text-slate-300 leading-relaxed max-w-md', children: [t('promise.description'), _jsxs("span", { className: 'text-yellow-300 font-medium', children: [' ', t('promise.highlight')] })] })] })] })] }) }) }), _jsx("section", { className: 'py-32 bg-slate-800', children: _jsxs("div", { className: 'container mx-auto px-4', children: [_jsxs(motion.div, { className: 'text-center mb-16', initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true }, children: [_jsx("h2", { className: 'text-5xl lg:text-6xl font-bold text-white mb-6', children: t('features.title') }), _jsx("p", { className: 'text-xl text-slate-300 max-w-2xl mx-auto', children: t('features.subtitle') })] }), _jsxs("div", { className: 'flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory', children: [_jsxs(motion.div, { className: 'flex-none w-96 bg-slate-900/60 rounded-2xl p-8 border border-slate-700 backdrop-blur-sm snap-start', initial: { opacity: 0, x: -50 }, whileInView: { opacity: 1, x: 0 }, transition: { duration: 0.8 }, viewport: { once: true }, whileHover: { scale: 1.02, y: -5 }, children: [_jsx("div", { className: 'relative h-48 mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/10', children: _jsxs("div", { className: 'absolute inset-0 flex items-center justify-center', children: [_jsxs(motion.div, { className: 'absolute w-32 h-40 bg-white/90 rounded-lg shadow-xl -rotate-6 left-8 top-8', initial: { y: -100, opacity: 0 }, whileInView: { y: 0, opacity: 1 }, transition: { delay: 0.2, duration: 0.6 }, viewport: { once: true }, children: [_jsxs("div", { className: 'p-3', children: [_jsx("div", { className: 'h-2 bg-slate-400 rounded w-3/4 mb-2' }), _jsx("div", { className: 'h-2 bg-slate-300 rounded w-1/2 mb-2' }), _jsx("div", { className: 'h-2 bg-slate-300 rounded w-5/6' })] }), _jsx(Icon, { name: "file-text", className: 'absolute bottom-2 right-2 w-6 h-6 text-blue-400' })] }), _jsxs(motion.div, { className: 'absolute w-32 h-40 bg-white/80 rounded-lg shadow-lg rotate-3 right-8 top-6', initial: { y: -100, opacity: 0 }, whileInView: { y: 0, opacity: 1 }, transition: { delay: 0.4, duration: 0.6 }, viewport: { once: true }, children: [_jsxs("div", { className: 'p-3', children: [_jsx("div", { className: 'h-2 bg-slate-400 rounded w-3/4 mb-2' }), _jsx("div", { className: 'h-2 bg-slate-300 rounded w-2/3 mb-2' }), _jsx("div", { className: 'h-2 bg-slate-300 rounded w-1/2' })] }), _jsx(Icon, { name: "shield", className: 'absolute bottom-2 right-2 w-6 h-6 text-purple-400' })] }), _jsxs(motion.div, { className: 'relative z-10', initial: { scale: 0 }, whileInView: { scale: 1 }, transition: { delay: 0.6, duration: 0.5, type: 'spring' }, viewport: { once: true }, children: [_jsx("div", { className: 'w-24 h-20 bg-yellow-400 rounded-t-lg transform perspective-100' }), _jsx("div", { className: 'w-24 h-16 bg-yellow-500 rounded-b-lg shadow-2xl', children: _jsx(Icon, { name: "folder", className: 'w-8 h-8 text-white mx-auto mt-4' }) }), _jsx(motion.div, { className: 'absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center', initial: { scale: 0 }, whileInView: { scale: 1 }, transition: { delay: 1, duration: 0.3 }, viewport: { once: true }, children: _jsx(Icon, { name: "check", className: 'w-5 h-5 text-white' }) })] })] }) }), _jsx("h3", { className: 'text-2xl font-bold text-white mb-4', children: t('features.act1.title') }), _jsx("p", { className: 'text-slate-300 leading-relaxed', children: t('features.act1.description') })] }), _jsxs(motion.div, { className: 'flex-none w-96 bg-slate-900/60 rounded-2xl p-8 border border-slate-700 backdrop-blur-sm snap-start', initial: { opacity: 0, x: -50 }, whileInView: { opacity: 1, x: 0 }, transition: { duration: 0.8, delay: 0.2 }, viewport: { once: true }, whileHover: { scale: 1.02, y: -5 }, children: [_jsx("div", { className: 'relative h-48 mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/10', children: _jsxs("div", { className: 'absolute inset-0 flex items-center justify-center', children: [_jsx(motion.div, { className: 'absolute w-40 h-44 bg-gradient-to-b from-emerald-500/30 to-emerald-600/20 rounded-t-3xl rounded-b-lg', initial: { scale: 0, opacity: 0 }, whileInView: { scale: 1, opacity: 1 }, transition: { delay: 0.2, duration: 0.6, type: 'spring' }, viewport: { once: true }, style: {
                                                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                                        } }), _jsxs(motion.div, { className: 'relative z-10', initial: { scale: 0 }, whileInView: { scale: 1 }, transition: { delay: 0.5, duration: 0.5 }, viewport: { once: true }, children: [_jsx("div", { className: 'w-20 h-20 bg-white/90 rounded-full shadow-xl flex items-center justify-center', children: _jsx(Icon, { name: "users", className: 'w-10 h-10 text-emerald-600' }) }), _jsx(motion.div, { className: 'absolute inset-0 border-4 border-emerald-400 rounded-full', initial: { scale: 1.5, opacity: 0 }, whileInView: { scale: 1, opacity: 1 }, transition: { delay: 0.8, duration: 0.5 }, viewport: { once: true } })] }), [
                                                        { x: -60, y: -20, delay: 0.9 },
                                                        { x: 60, y: -20, delay: 1.0 },
                                                        { x: -40, y: 40, delay: 1.1 },
                                                        { x: 40, y: 40, delay: 1.2 },
                                                    ].map((pos, i) => (_jsx(motion.div, { className: 'absolute w-10 h-10 bg-emerald-400/80 rounded-full flex items-center justify-center shadow-lg', style: {
                                                            left: `calc(50% + ${pos.x}px - 20px)`,
                                                            top: `calc(50% + ${pos.y}px - 20px)`,
                                                        }, initial: { scale: 0, opacity: 0 }, whileInView: { scale: 1, opacity: 1 }, transition: { delay: pos.delay, duration: 0.3 }, viewport: { once: true }, children: _jsx(Icon, { name: "user", className: 'w-5 h-5 text-white' }) }, i))), _jsx(motion.svg, { className: 'absolute inset-0 w-full h-full', initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { delay: 1.3, duration: 0.5 }, viewport: { once: true }, children: _jsx(motion.path, { d: 'M 50 50 L 20 30 M 50 50 L 80 30 M 50 50 L 30 70 M 50 50 L 70 70', stroke: 'rgba(52, 211, 153, 0.3)', strokeWidth: '2', fill: 'none', initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, transition: { delay: 1.4, duration: 0.8 }, viewport: { once: true } }) })] }) }), _jsx("h3", { className: 'text-2xl font-bold text-white mb-4', children: t('features.act2.title') }), _jsx("p", { className: 'text-slate-300 leading-relaxed', children: t('features.act2.description') })] }), _jsxs(motion.div, { className: 'flex-none w-96 bg-slate-900/60 rounded-2xl p-8 border border-slate-700 backdrop-blur-sm snap-start', initial: { opacity: 0, x: -50 }, whileInView: { opacity: 1, x: 0 }, transition: { duration: 0.8, delay: 0.4 }, viewport: { once: true }, whileHover: { scale: 1.02, y: -5 }, children: [_jsx("div", { className: 'relative h-48 mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10', children: _jsxs("div", { className: 'absolute inset-0 flex items-end justify-center pb-8', children: [_jsx("div", { className: 'absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-green-800/40 to-transparent' }), _jsxs(motion.div, { className: 'relative', initial: { scale: 0 }, whileInView: { scale: 1 }, transition: { delay: 0.5, duration: 1 }, viewport: { once: true }, children: [_jsx(motion.div, { className: 'w-3 h-16 bg-amber-700 rounded-sm mx-auto', initial: { height: 0 }, whileInView: { height: 64 }, transition: { delay: 0.5, duration: 0.8 }, viewport: { once: true } }), _jsx(motion.div, { className: 'w-12 h-12 bg-green-500 rounded-full absolute -top-6 left-1/2 transform -translate-x-1/2', initial: { scale: 0 }, whileInView: { scale: 1 }, transition: { delay: 1.2, duration: 0.5 }, viewport: { once: true } }), ['💌', '📜', '⏰'].map((emoji, i) => {
                                                                const angle = i * 120;
                                                                const radians = (angle * Math.PI) / 180;
                                                                const x = Math.cos(radians) * 40;
                                                                const y = Math.sin(radians) * 40;
                                                                return (_jsx(motion.div, { className: 'absolute text-lg', style: {
                                                                        left: `calc(50% + ${x}px)`,
                                                                        top: `calc(50% + ${y}px)`,
                                                                    }, initial: { scale: 0, opacity: 0 }, whileInView: {
                                                                        scale: 1,
                                                                        opacity: 1,
                                                                        transition: { delay: 1.5 + i * 0.2, duration: 0.3 },
                                                                    }, viewport: { once: true }, animate: { y: [0, -5, 0], rotate: [0, 5, -5, 0] }, transition: {
                                                                        duration: 3,
                                                                        repeat: Infinity,
                                                                        delay: i * 0.5,
                                                                    }, children: emoji }, i));
                                                            })] })] }) }), _jsx("h3", { className: 'text-2xl font-bold text-white mb-4', children: t('features.act3.title') }), _jsx("p", { className: 'text-slate-300 leading-relaxed', children: t('features.act3.description') })] })] })] }) }), _jsx("section", { className: 'py-20 bg-slate-800/90 backdrop-blur-sm', children: _jsxs("div", { className: 'container mx-auto px-4', children: [_jsxs(motion.div, { className: 'text-center mb-16', initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true }, children: [_jsx("h2", { className: 'text-4xl lg:text-5xl font-bold text-white mb-6', children: t('howItWorks.title') }), _jsx("p", { className: 'text-xl text-slate-300 max-w-2xl mx-auto', children: t('howItWorks.subtitle') })] }), _jsxs("div", { className: 'grid md:grid-cols-3 gap-8 max-w-6xl mx-auto', children: [_jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.1 }, viewport: { once: true }, children: _jsx(Card, { className: 'text-center p-8 h-full bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300 backdrop-blur-sm', children: _jsxs(CardContent, { className: 'space-y-4', children: [_jsx(motion.div, { className: 'w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto', whileHover: { scale: 1.1, rotate: 5 }, transition: { duration: 0.3 }, children: _jsx(Icon, { name: "vault", className: 'w-10 h-10 text-yellow-400' }) }), _jsx("h3", { className: 'text-2xl font-bold text-white', children: t('howItWorks.steps.act1.title') }), _jsx("p", { className: 'text-slate-300 leading-relaxed', children: t('howItWorks.steps.act1.description') })] }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2 }, viewport: { once: true }, children: _jsx(Card, { className: 'text-center p-8 h-full bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300 backdrop-blur-sm', children: _jsxs(CardContent, { className: 'space-y-4', children: [_jsx(motion.div, { className: 'w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto', whileHover: { scale: 1.1, rotate: -5 }, transition: { duration: 0.3 }, children: _jsx(Icon, { name: "shield", className: 'w-10 h-10 text-yellow-400' }) }), _jsx("h3", { className: 'text-2xl font-bold text-white', children: t('howItWorks.steps.act2.title') }), _jsx("p", { className: 'text-slate-300 leading-relaxed', children: t('howItWorks.steps.act2.description') })] }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.3 }, viewport: { once: true }, children: _jsx(Card, { className: 'text-center p-8 h-full bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300 backdrop-blur-sm', children: _jsxs(CardContent, { className: 'space-y-4', children: [_jsx(motion.div, { className: 'w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto', whileHover: { scale: 1.1, rotate: 5 }, transition: { duration: 0.3 }, children: _jsx(Icon, { name: "legacy", className: 'w-10 h-10 text-yellow-400' }) }), _jsx("h3", { className: 'text-2xl font-bold text-white', children: t('howItWorks.steps.act3.title') }), _jsx("p", { className: 'text-slate-300 leading-relaxed', children: t('howItWorks.steps.act3.description') })] }) }) })] })] }) }), _jsx(SecurityPromiseSection, {}), _jsx("section", { className: 'py-32 bg-gradient-to-br from-slate-900 to-slate-800', children: _jsxs("div", { className: 'container mx-auto px-4', children: [_jsxs(motion.div, { className: 'text-center mb-16', initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true }, children: [_jsx("h2", { className: 'text-4xl lg:text-5xl font-bold text-white mb-6', children: t('values.title') }), _jsx("p", { className: 'text-xl text-slate-300 max-w-2xl mx-auto', children: t('values.subtitle') })] }), _jsx("div", { className: 'grid md:grid-cols-2 gap-12 max-w-5xl mx-auto', children: [
                                {
                                    title: 'Empathy by Design',
                                    description: 'We believe technology should be caring. Our platform is designed to support you emotionally, not just functionally.',
                                    icon: 'heart',
                                    visual: (_jsxs(motion.div, { className: 'relative w-16 h-16 mx-auto mb-6', whileHover: { scale: 1.1 }, transition: { duration: 0.3 }, children: [_jsx(Icon, { name: "heart", className: 'w-12 h-12 text-yellow-400 absolute top-2 left-2' }), _jsx(motion.div, { className: 'w-4 h-4 bg-yellow-300 rounded-full absolute top-1 right-1', animate: { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }, transition: {
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                } })] })),
                                },
                                {
                                    title: 'Zero-Knowledge Security',
                                    description: 'Your privacy is sacred. We use end-to-end encryption, meaning not even we can access your sensitive data.',
                                    icon: 'shield-check',
                                    visual: (_jsxs(motion.div, { className: 'relative w-16 h-16 mx-auto mb-6', whileHover: { scale: 1.1 }, transition: { duration: 0.3 }, children: [_jsx(motion.div, { className: 'w-12 h-12 border-2 border-yellow-400 rounded-lg absolute top-2 left-2', animate: {
                                                    borderColor: ['#fbbf24', '#f59e0b', '#fbbf24'],
                                                }, transition: {
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                } }), _jsx(Icon, { name: "key", className: 'w-6 h-6 text-yellow-400 absolute top-5 left-5' })] })),
                                },
                                {
                                    title: 'Effortless Automation',
                                    description: 'From AI-powered analysis to automated reminders, we do the heavy lifting so you can focus on what matters.',
                                    icon: 'sparkles',
                                    visual: (_jsxs(motion.div, { className: 'relative w-16 h-16 mx-auto mb-6', whileHover: { scale: 1.1 }, transition: { duration: 0.3 }, children: [_jsx(Icon, { name: "sparkles", className: 'w-12 h-12 text-yellow-400 absolute top-2 left-2' }), [...Array(3)].map((_, i) => (_jsx(motion.div, { className: 'w-1 h-1 bg-yellow-300 rounded-full absolute', style: {
                                                    left: `${20 + i * 8}px`,
                                                    top: `${15 + i * 4}px`,
                                                }, animate: { scale: [0, 1, 0], opacity: [0, 1, 0] }, transition: {
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.3,
                                                    ease: 'easeInOut',
                                                } }, i)))] })),
                                },
                                {
                                    title: 'A Living Legacy',
                                    description: "This isn't a one-time task. It's a living, growing garden that evolves with you and your family's journey.",
                                    icon: 'book',
                                    visual: (_jsxs(motion.div, { className: 'relative w-16 h-16 mx-auto mb-6', whileHover: { scale: 1.1 }, transition: { duration: 0.3 }, children: [_jsx(Icon, { name: "book-open", className: 'w-12 h-12 text-yellow-400 absolute top-2 left-2' }), _jsx(motion.div, { className: 'absolute top-0 right-0 w-3 h-3 bg-yellow-300 rounded-full', animate: { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }, transition: {
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                } })] })),
                                },
                            ].map((commitment, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: index * 0.2 }, viewport: { once: true }, className: 'text-center', children: _jsx(Card, { className: 'p-8 h-full bg-slate-900/60 backdrop-blur border-slate-700 hover:bg-slate-800/60 hover:border-yellow-400/30 transition-all duration-500', children: _jsxs(CardContent, { className: 'space-y-6', children: [commitment.visual, _jsx("h3", { className: 'text-2xl font-bold text-white', children: commitment.title }), _jsx("p", { className: 'text-slate-300 leading-relaxed text-lg', children: commitment.description })] }) }) }, commitment.title))) })] }) }), _jsx(PricingSection, {}), _jsx("section", { className: 'py-20 bg-slate-800 border-t border-slate-700', children: _jsxs("div", { className: 'container mx-auto px-4', children: [_jsxs(motion.div, { className: 'text-center mb-12', initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true }, children: [_jsx("h2", { className: 'text-3xl lg:text-4xl font-bold text-white mb-4', children: t('trust.title') }), _jsx("p", { className: 'text-xl text-slate-300 max-w-3xl mx-auto', children: t('trust.subtitle') })] }), _jsxs(motion.div, { className: 'flex flex-wrap items-center justify-center gap-8 lg:gap-12 opacity-60 hover:opacity-80 transition-opacity duration-300', initial: { opacity: 0, y: 20 }, whileInView: { opacity: 0.6, y: 0 }, whileHover: { opacity: 0.8 }, transition: { duration: 0.8, delay: 0.2 }, viewport: { once: true }, children: [_jsxs("div", { className: 'flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors', children: [_jsx("div", { className: 'w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center', children: _jsx("span", { className: 'text-white font-bold text-sm', children: "C" }) }), _jsx("span", { className: 'text-sm font-medium', children: t('trust.poweredBy.clerk') })] }), _jsxs("div", { className: 'flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors', children: [_jsx("div", { className: 'w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center', children: _jsx("span", { className: 'text-white font-bold text-sm', children: "S" }) }), _jsx("span", { className: 'text-sm font-medium', children: t('trust.poweredBy.supabase') })] }), _jsxs("div", { className: 'flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors', children: [_jsx("div", { className: 'w-8 h-8 bg-gradient-to-br from-black to-slate-800 rounded-lg flex items-center justify-center border border-slate-600', children: _jsx("span", { className: 'text-white font-bold text-sm', children: "\u25B2" }) }), _jsx("span", { className: 'text-sm font-medium', children: t('trust.poweredBy.vercel') })] }), _jsxs("div", { className: 'flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors', children: [_jsx("div", { className: 'w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center', children: _jsx("span", { className: 'text-white font-bold text-sm', children: "\u2696" }) }), _jsx("span", { className: 'text-sm font-medium', children: t('trust.poweredBy.legal') })] }), _jsxs("div", { className: 'flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors', children: [_jsx("div", { className: 'w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center', children: _jsx("span", { className: 'text-white font-bold text-xs', children: "\uD83C\uDDEA\uD83C\uDDFA" }) }), _jsx("span", { className: 'text-sm font-medium', children: t('trust.poweredBy.gdpr') })] })] }), _jsxs(motion.div, { className: 'mt-12 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm', initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.8, delay: 0.4 }, viewport: { once: true }, children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Icon, { name: "shield-check", className: 'w-4 h-4 text-green-400' }), _jsx("span", { children: t('trust.indicators.endToEndEncryption') })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Icon, { name: "check", className: 'w-4 h-4 text-green-400' }), _jsx("span", { children: t('trust.indicators.zeroKnowledge') })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Icon, { name: "key", className: 'w-4 h-4 text-green-400' }), _jsx("span", { children: t('trust.indicators.bankLevelSecurity') })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Icon, { name: "users", className: 'w-4 h-4 text-green-400' }), _jsx("span", { children: t('trust.indicators.legalExpertConsultation') })] })] })] }) }), !hasScrolledToBottom ? (_jsxs("section", { className: 'relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden', children: [_jsx("div", { className: 'absolute inset-0', children: finalStars.map(star => (_jsx(motion.div, { className: 'absolute bg-white rounded-full', style: {
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                opacity: star.opacity,
                            }, animate: {
                                opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                            }, transition: {
                                duration: star.duration,
                                repeat: Infinity,
                                delay: star.animationDelay,
                                ease: 'easeInOut',
                            } }, star.id))) }), _jsx(motion.div, { className: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', initial: { scale: 0, opacity: 0 }, whileInView: { scale: 1, opacity: 1 }, transition: { duration: 1.5, delay: 0.5 }, viewport: { once: true }, children: _jsxs(motion.div, { className: 'relative', animate: { y: [0, -10, 0] }, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, children: [_jsx(motion.div, { className: 'absolute inset-0 rounded-full w-16 h-16 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2', animate: {
                                        boxShadow: [
                                            '0 0 30px rgba(255, 255, 0, 0.4)',
                                            '0 0 50px rgba(255, 255, 0, 0.6)',
                                            '0 0 30px rgba(255, 255, 0, 0.4)',
                                        ],
                                    }, transition: {
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    } }), _jsx(motion.div, { className: 'w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-2xl', animate: { scale: [1, 1.1, 1] }, transition: {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    } }), _jsx(motion.div, { className: 'absolute -top-2 -left-2 w-6 h-6', animate: { rotate: [0, 15, -15, 0], opacity: [0.4, 0.8, 0.4] }, transition: {
                                        duration: 0.4,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }, children: _jsx("div", { className: 'w-full h-full bg-gradient-to-br from-blue-200/60 to-purple-200/60 rounded-full blur-sm' }) }), _jsx(motion.div, { className: 'absolute -top-2 -right-2 w-6 h-6', animate: { rotate: [0, -15, 15, 0], opacity: [0.4, 0.8, 0.4] }, transition: {
                                        duration: 0.4,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: 0.2,
                                    }, children: _jsx("div", { className: 'w-full h-full bg-gradient-to-br from-blue-200/60 to-purple-200/60 rounded-full blur-sm' }) })] }) }), _jsxs("div", { className: 'relative z-10 text-center text-white max-w-2xl mx-auto px-4 mt-32', children: [_jsx(motion.h2, { className: 'text-5xl lg:text-6xl font-bold mb-8 leading-tight', initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 1, delay: 1 }, viewport: { once: true }, children: t('cta.final.title') }), _jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.8, delay: 1.5 }, viewport: { once: true }, children: _jsxs(Button, { size: 'lg', onClick: handleGetStarted, className: 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xl px-16 py-8 rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 font-bold relative overflow-hidden group', children: [_jsx(motion.div, { className: 'absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300', initial: { scale: 0 }, whileHover: { scale: 1 }, transition: { duration: 0.3 } }), _jsx("span", { className: 'relative z-10 group-hover:scale-105 transition-transform duration-200', children: t('cta.final.button') })] }) })] })] })) : (
            /* Static version when scrolled to bottom */
            _jsxs("section", { className: 'relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden', children: [_jsx("div", { className: 'absolute inset-0', children: finalStars.map(star => (_jsx("div", { className: 'absolute bg-white rounded-full', style: {
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                opacity: star.opacity * 0.5,
                            } }, star.id))) }), _jsx("div", { className: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', children: _jsxs("div", { className: 'relative', children: [_jsx("div", { className: 'absolute inset-0 rounded-full w-16 h-16 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2', style: { boxShadow: '0 0 40px rgba(255, 255, 0, 0.5)' } }), _jsx("div", { className: 'w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-2xl' })] }) }), _jsxs("div", { className: 'relative z-10 text-center text-white max-w-2xl mx-auto px-4 mt-32', children: [_jsx("h2", { className: 'text-5xl lg:text-6xl font-bold mb-8 leading-tight', children: t('cta.final.title') }), _jsx(Button, { size: 'lg', onClick: handleGetStarted, className: 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xl px-16 py-8 rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 font-bold relative overflow-hidden group', children: _jsx("span", { className: 'relative z-10 group-hover:scale-105 transition-transform duration-200', children: t('cta.final.button') }) })] })] })), _jsx("footer", { className: 'py-12 bg-slate-950 text-white', children: _jsxs("div", { className: 'container mx-auto px-4', children: [_jsxs("div", { className: 'grid md:grid-cols-4 gap-8', children: [_jsxs("div", { className: 'col-span-1', children: [_jsxs("div", { className: 'flex items-center gap-3 mb-4', children: [_jsx(LegacyGuardLogo, {}), _jsx("span", { className: 'text-xl font-bold font-heading', children: "LegacyGuard" })] }), _jsx("p", { className: 'text-slate-400 text-sm', children: t('footer.tagline') })] }), _jsxs("div", { children: [_jsx("h4", { className: 'font-semibold mb-3', children: t('footer.sections.product') }), _jsxs("ul", { className: 'space-y-2 text-sm', children: [_jsx("li", { children: _jsx(Link, { to: '/features', className: 'text-slate-400 hover:text-yellow-400 transition-colors', children: t('footer.links.features') }) }), _jsx("li", { children: _jsx(Link, { to: '/security', className: 'text-slate-400 hover:text-yellow-400 transition-colors', children: t('footer.links.security') }) }), _jsx("li", { children: _jsx(Link, { to: '/pricing', className: 'text-slate-400 hover:text-yellow-400 transition-colors', children: t('footer.links.pricing') }) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: 'font-semibold mb-3', children: t('footer.sections.support') }), _jsxs("ul", { className: 'space-y-2 text-sm', children: [_jsx("li", { children: _jsx(Link, { to: '/help', className: 'text-slate-400 hover:text-yellow-400 transition-colors', children: t('footer.links.helpCenter') }) }), _jsx("li", { children: _jsx(Link, { to: '/contact', className: 'text-slate-400 hover:text-yellow-400 transition-colors', children: t('footer.links.contactUs') }) }), _jsx("li", { children: _jsx(Link, { to: '/guides', className: 'text-slate-400 hover:text-yellow-400 transition-colors', children: t('footer.links.userGuides') }) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: 'font-semibold mb-3', children: t('footer.sections.legal') }), _jsxs("ul", { className: 'space-y-2 text-sm', children: [_jsx("li", { children: _jsx(Link, { to: '/privacy-policy', className: 'text-slate-400 hover:text-yellow-400 transition-colors', children: t('footer.links.privacyPolicy') }) }), _jsx("li", { children: _jsx(Link, { to: '/terms-of-service', className: 'text-slate-400 hover:text-yellow-400 transition-colors', children: t('footer.links.termsOfService') }) }), _jsx("li", { children: _jsx(Link, { to: '/security-policy', className: 'text-slate-400 hover:text-yellow-400 transition-colors', children: t('footer.links.securityPolicy') }) })] })] })] }), _jsx("div", { className: 'border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400', children: _jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " LegacyGuard. ", t('footer.copyright')] }) })] }) })] }));
}
