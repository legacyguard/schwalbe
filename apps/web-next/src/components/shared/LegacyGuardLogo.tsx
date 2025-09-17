'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LegacyGuardLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LegacyGuardLogo: React.FC<LegacyGuardLogoProps> = ({
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <motion.div 
      className={`${sizeClasses[size]} ${className}`}
      whileHover={{ rotate: 5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Shield shape with gradient */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Shield outline */}
        <path
          d="M50 10 L20 25 L20 55 C20 75 35 85 50 90 C65 85 80 75 80 55 L80 25 Z"
          fill="url(#shieldGradient)"
          stroke="#f59e0b"
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Inner design - tree/legacy symbol */}
        <path
          d="M50 25 L50 70 M40 40 L60 40 M35 55 L65 55"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Decorative dots */}
        <circle cx="30" cy="35" r="2" fill="#0f172a" />
        <circle cx="70" cy="35" r="2" fill="#0f172a" />
        <circle cx="30" cy="65" r="2" fill="#0f172a" />
        <circle cx="70" cy="65" r="2" fill="#0f172a" />
      </svg>
    </motion.div>
  );
};