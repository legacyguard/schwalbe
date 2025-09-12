import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/FadeIn';
export default function Scene2Box({ initialItems = '', onBack, onNext, onSkip, }) {
    const [items, setItems] = useState(initialItems);
    const [words, setWords] = useState([]);
    useEffect(() => setItems(initialItems), [initialItems]);
    useEffect(() => {
        // Extract words from items for animation
        const newWords = items
            .split(/[\s,]+/)
            .filter(word => word.length > 2)
            .slice(0, 12); // Limit to 12 words for animation
        setWords(newWords);
    }, [items]);
    return (_jsxs("div", { className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative', children: [onSkip && (_jsx(motion.button, { onClick: onSkip, className: 'absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-border/50 hover:border-border', initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1, duration: 0.5 }, whileHover: { scale: 1.05 }, children: "Skip introduction" })), _jsx(FadeIn, { duration: 0.8, children: _jsxs(Card, { className: 'w-full max-w-3xl border-primary/20 shadow-xl', children: [_jsx(CardHeader, { children: _jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.2, duration: 0.8 }, children: _jsx(CardTitle, { className: 'text-2xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent', children: "The Box of Certainty" }) }) }), _jsxs(CardContent, { children: [_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4, duration: 0.8 }, children: [_jsx("p", { className: 'text-muted-foreground mb-6 text-lg leading-relaxed', children: "Imagine leaving a single box for your loved ones. What would you put inside so they know how much you cared?" }), _jsx("p", { className: 'text-sm text-muted-foreground/80 mb-4 italic', children: "\u2728 This is about love, not logistics. Write from your heart." })] }), _jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.6, duration: 0.8 }, children: _jsx(Textarea, { value: items, onChange: e => setItems(e.target.value), className: 'mb-6 min-h-32 text-base leading-relaxed border-primary/20 focus:border-primary/50 bg-background/50', placeholder: "Write anything: house keys, banking hint, letter for my daughter, grandpa's watch, photo from our wedding, recipe for mom's cookies...", rows: 6 }) }), _jsxs(motion.div, { className: 'relative h-40 mb-6 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background overflow-hidden', initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.8, duration: 0.8 }, children: [_jsx("div", { className: 'absolute inset-0 bg-gradient-to-br from-amber-50/20 to-amber-100/10 dark:from-amber-900/10 dark:to-amber-800/5' }), _jsx("div", { className: 'absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-primary/20 to-transparent' }), _jsx("div", { className: 'absolute inset-4 flex flex-wrap items-center justify-center gap-2', children: words.map((word, index) => (_jsx(motion.div, { className: 'px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20', initial: {
                                                    opacity: 0,
                                                    scale: 0.8,
                                                    y: 20,
                                                }, animate: {
                                                    opacity: 1,
                                                    scale: 1,
                                                    y: [0, -5, 0],
                                                }, transition: {
                                                    delay: 0.1 * index + 1,
                                                    duration: 0.6,
                                                    y: {
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: 'easeInOut',
                                                        delay: Math.random() * 2,
                                                    },
                                                }, children: word }, `${word}-${index}`))) }), _jsx("div", { className: 'absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none' }), words.length === 0 && (_jsx("div", { className: 'absolute inset-0 flex items-center justify-center', children: _jsx(motion.p, { className: 'text-muted-foreground/60 text-sm italic', animate: { opacity: [0.4, 0.8, 0.4] }, transition: { duration: 2, repeat: Infinity }, children: "Your treasures will appear here..." }) }))] }), _jsxs(motion.div, { className: 'flex gap-3 justify-between', initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 1, duration: 0.6 }, children: [_jsx(Button, { variant: 'outline', onClick: onBack, className: 'border-primary/20 hover:border-primary/40', children: "\u2190 Back" }), _jsxs("div", { className: 'flex gap-3', children: [_jsx(Button, { variant: 'outline', onClick: () => setItems(''), className: 'border-muted hover:border-muted-foreground/40', children: "Clear" }), _jsx(Button, { onClick: () => onNext(items), disabled: !items.trim(), className: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300', children: "Continue \u2192" })] })] }), _jsx(motion.div, { className: 'mt-4 text-center', initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 1.2, duration: 0.6 }, children: _jsxs("p", { className: 'text-xs text-muted-foreground/70', children: [items.trim() ? `${items.trim().length} characters • ` : '', "Take your time, there's no rush"] }) })] })] }) })] }));
}
