'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const fadeInAnimation = {
    initial: {
        opacity: 0,
        y: 10,
    },
    animate: (custom) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: custom.duration,
            delay: custom.delay,
            ease: 'easeInOut',
        },
    }),
};
export const FadeIn = ({ children, duration = 0.5, delay = 0, className, }) => {
    return (_jsx(motion.div, { className: className, variants: fadeInAnimation, initial: 'initial', animate: 'animate', custom: { duration, delay }, children: children }));
};
