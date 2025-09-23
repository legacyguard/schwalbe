/**
 * Emotional Onboarding Flow - Guardian's Journey
 * Box of Certainty and Key of Trust with premium liquid glass design
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Key, Package, Sparkles, ArrowRight } from 'lucide-react';
import { SofiaFirefly } from '../sofia/SofiaFirefly';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface OnboardingData {
  importantThings: string[];
  trustedPerson: string;
  gardenSeed: string;
}

interface EmotionalOnboardingProps {
  onComplete?: (data: OnboardingData) => void;
  onCancel?: () => void;
}

type Step = 'welcome' | 'promise' | 'box' | 'key' | 'garden' | 'complete';

export function EmotionalOnboarding({ onComplete, onCancel }: EmotionalOnboardingProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    importantThings: [],
    trustedPerson: '',
    gardenSeed: ''
  });
  const [currentInput, setCurrentInput] = useState('');
  const [boxItems, setBoxItems] = useState<string[]>([]);
  const [sofiaMessage, setSofiaMessage] = useState('');

  // Sofia messages for each step
  const sofiaMessages = {
    welcome: "Welcome! I'm Sofia, and I'll be your guide on this journey. May I help you discover what matters most?",
    promise: "Together, we'll create something beautiful - a place where your love and care can live forever.",
    box: "Imagine leaving one special box for your loved ones. What would you put inside to show how much they mean to you?",
    key: "Every precious box needs a guardian. Who is the one person you trust completely with this responsibility?",
    garden: "From your love, we'll grow something beautiful. Your Garden of Legacy begins with this first seed.",
    complete: "Perfect! Your journey has begun. Watch how each step you take makes your garden bloom."
  };

  useEffect(() => {
    setSofiaMessage(sofiaMessages[step]);
  }, [step]);

  const handleBoxItemAdd = () => {
    if (currentInput.trim() && boxItems.length < 5) {
      const newItems = [...boxItems, currentInput.trim()];
      setBoxItems(newItems);
      setOnboardingData(prev => ({
        ...prev,
        importantThings: newItems
      }));
      setCurrentInput('');
    }
  };

  const handleKeyPersonSet = () => {
    if (currentInput.trim()) {
      setOnboardingData(prev => ({
        ...prev,
        trustedPerson: currentInput.trim()
      }));
      setCurrentInput('');
      setStep('garden');
    }
  };

  const handleGardenSeed = () => {
    if (currentInput.trim()) {
      const finalData = {
        ...onboardingData,
        gardenSeed: currentInput.trim()
      };
      setOnboardingData(finalData);
      setStep('complete');

      setTimeout(() => {
        onComplete?.(finalData);
      }, 3000);
    }
  };

  const liquidGlassStyle = {
    background: `
      linear-gradient(135deg,
        rgba(15, 23, 42, 0.9) 0%,
        rgba(30, 41, 59, 0.8) 100%
      )
    `,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: `
      0 20px 40px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">
                Welcome to Your Journey
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                This isn't just another app. This is the beginning of something deeper—
                a way to transform your love into lasting protection.
              </p>
            </div>

            <Button
              onClick={() => setStep('promise')}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold"
            >
              Yes, let's begin
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        );

      case 'promise':
        return (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">
                A Promise of Peace
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                In the next few minutes, you'll discover how small actions can create
                profound peace of mind. Each step we take together will build something
                beautiful—your personal Garden of Legacy.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => setStep('box')}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold"
              >
                I'm ready
                <Heart className="ml-2" size={20} />
              </Button>
            </div>
          </motion.div>
        );

      case 'box':
        return (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Your Box of Certainty
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Imagine you could leave one special box for your loved ones.
                What would you put inside to show them how much they mean to you?
              </p>
            </div>

            {/* Animated Box */}
            <div className="flex justify-center">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="w-48 h-32 rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={liquidGlassStyle}
                >
                  <Package size={48} className="text-purple-400" />

                  {/* Floating items inside box */}
                  <AnimatePresence>
                    {boxItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 0.8,
                          x: Math.sin(index * 1.5) * 20,
                          y: Math.cos(index * 1.5) * 15
                        }}
                        className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                        style={{
                          filter: 'blur(1px)',
                          boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Input area */}
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Type something precious (e.g., 'letter for my daughter')"
                  className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleBoxItemAdd()}
                />
                <Button
                  onClick={handleBoxItemAdd}
                  disabled={!currentInput.trim() || boxItems.length >= 5}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Add
                </Button>
              </div>

              {/* Box items */}
              <div className="space-y-2">
                {boxItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-slate-300 bg-slate-800/30 rounded-lg px-3 py-2"
                  >
                    ✨ {item}
                  </motion.div>
                ))}
              </div>

              {boxItems.length > 0 && (
                <Button
                  onClick={() => setStep('key')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  My box is ready
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              )}
            </div>
          </motion.div>
        );

      case 'key':
        return (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                The Key of Trust
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Every precious box needs a guardian. Who is the one person
                you trust completely with this responsibility?
              </p>
            </div>

            {/* Animated Key */}
            <div className="flex justify-center">
              <motion.div
                animate={{
                  rotateY: [0, 180, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div
                  className="w-24 h-40 rounded-2xl flex items-center justify-center"
                  style={{
                    ...liquidGlassStyle,
                    background: `
                      linear-gradient(135deg,
                        rgba(251, 191, 36, 0.8) 0%,
                        rgba(245, 158, 11, 0.6) 100%
                      )
                    `
                  }}
                >
                  <Key size={32} className="text-yellow-200" />
                </div>

                {/* Engraved name */}
                {onboardingData.trustedPerson && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-yellow-300"
                  >
                    {onboardingData.trustedPerson}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Input area */}
            <div className="max-w-md mx-auto space-y-4">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Name of your most trusted person"
                className="text-center bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleKeyPersonSet()}
              />

              {currentInput.trim() && (
                <Button
                  onClick={handleKeyPersonSet}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  Engrave their name
                  <Key className="ml-2" size={20} />
                </Button>
              )}
            </div>
          </motion.div>
        );

      case 'garden':
        return (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Plant Your First Seed
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Your Garden of Legacy begins with a single seed of intention.
                What do you hope this journey will grow into?
              </p>
            </div>

            {/* Animated seed/sprout */}
            <div className="flex justify-center">
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{
                    ...liquidGlassStyle,
                    background: `
                      radial-gradient(circle,
                        rgba(34, 197, 94, 0.8) 0%,
                        rgba(21, 128, 61, 0.6) 100%
                      )
                    `
                  }}
                >
                  <Sparkles size={40} className="text-green-200" />
                </div>

                {/* Particle effects */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-green-400 rounded-full"
                    animate={{
                      x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
                      y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
                      opacity: [1, 0],
                      scale: [1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Input area */}
            <div className="max-w-md mx-auto space-y-4">
              <Textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="I hope this journey brings..."
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 min-h-[100px]"
              />

              {currentInput.trim() && (
                <Button
                  onClick={handleGardenSeed}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  Plant this seed
                  <Sparkles className="ml-2" size={20} />
                </Button>
              )}
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div
                className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
                style={{
                  background: `
                    radial-gradient(circle,
                      rgba(147, 51, 234, 0.8) 0%,
                      rgba(79, 70, 229, 0.6) 100%
                    )
                  `,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 0 50px rgba(147, 51, 234, 0.5)'
                }}
              >
                <Heart size={48} className="text-purple-200" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">
                Your Journey Begins
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Perfect! You've planted the first seed in your Garden of Legacy.
                Watch as each step you take makes it bloom with protection and love.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">

      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-4xl">
        <Card
          className="p-8 md:p-12"
          style={liquidGlassStyle}
        >
          {renderStep()}

          {/* Cancel button */}
          {step !== 'complete' && (
            <div className="mt-8 text-center">
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-300 text-sm"
              >
                Skip for now
              </button>
            </div>
          )}
        </Card>

        {/* Sofia guide */}
        <SofiaFirefly
          size="lg"
          message={sofiaMessage}
          showDialog={true}
          position={{ x: window.innerWidth > 768 ? 85 : 50, y: 20 }}
          className="absolute"
        />
      </div>
    </div>
  );
}