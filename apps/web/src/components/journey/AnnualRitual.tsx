/**
 * Annual Ritual & Reflection System
 * Premium ceremonial interface with Apple-style liquid glass design
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Heart,
  Star,
  Crown,
  Sparkles,
  Users,
  Shield,
  Gift,
  Award,
  TreePine
} from 'lucide-react';
import { SofiaFirefly } from '../sofia/SofiaFirefly';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface YearlyReflection {
  year: number;
  gardenState: 'seedling' | 'growing' | 'blooming' | 'flourishing' | 'eternal';
  milestonesCompleted: number;
  protectionScore: number;
  reflections: {
    proudest: string;
    grateful: string;
    learned: string;
    hopes: string;
  };
  timeCapsules: number;
  guardiansAdded: number;
  documentsAdded: number;
  personalNote: string;
  ceremonyDate: Date;
}

interface AnnualRitualProps {
  currentYear: number;
  previousReflections?: YearlyReflection[];
  currentStats: {
    protectionScore: number;
    milestonesCompleted: number;
    timeCapsules: number;
    guardians: number;
    documents: number;
  };
  onComplete?: (reflection: YearlyReflection) => void;
  onCancel?: () => void;
  className?: string;
}

type RitualPhase = 'welcome' | 'review' | 'reflection' | 'commitment' | 'ceremony' | 'celebration';

export function AnnualRitual({
  currentYear,
  currentStats,
  onComplete,
  onCancel,
  className = ''
}: AnnualRitualProps) {
  const [phase, setPhase] = useState<RitualPhase>('welcome');
  const [reflection, setReflection] = useState<YearlyReflection>({
    year: currentYear,
    gardenState: 'growing',
    milestonesCompleted: currentStats.milestonesCompleted,
    protectionScore: currentStats.protectionScore,
    reflections: {
      proudest: '',
      grateful: '',
      learned: '',
      hopes: ''
    },
    timeCapsules: currentStats.timeCapsules,
    guardiansAdded: currentStats.guardians,
    documentsAdded: currentStats.documents,
    personalNote: '',
    ceremonyDate: new Date()
  });

  const liquidGlassStyle = {
    background: `
      linear-gradient(135deg,
        rgba(15, 23, 42, 0.95) 0%,
        rgba(30, 41, 59, 0.9) 100%
      )
    `,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: `
      0 25px 50px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `
  };

  const getGardenState = () => {
    if (currentStats.protectionScore >= 90) return 'eternal';
    if (currentStats.protectionScore >= 75) return 'flourishing';
    if (currentStats.protectionScore >= 50) return 'blooming';
    if (currentStats.protectionScore >= 25) return 'growing';
    return 'seedling';
  };



  const getSofiaMessage = () => {
    switch (phase) {
      case 'welcome':
        return `Welcome to your ${currentYear} reflection ceremony. This is a sacred moment to honor your journey.`;
      case 'review':
        return "Look how far you've come! Your garden has grown beautifully this year.";
      case 'reflection':
        return "Take time to reflect deeply. Your thoughts today will guide your future.";
      case 'commitment':
        return "What do you want to cultivate in the year ahead? Your intentions have power.";
      case 'ceremony':
        return "This moment becomes part of your eternal story. Feel the significance.";
      case 'celebration':
        return "Your reflection is complete. You've honored your journey with grace.";
      default:
        return "I'm here to guide you through this meaningful ceremony.";
    }
  };

  useEffect(() => {
    setReflection(prev => ({
      ...prev,
      gardenState: getGardenState()
    }));
  }, [currentStats]);

  const handleContinue = () => {
    const phases: RitualPhase[] = ['welcome', 'review', 'reflection', 'commitment', 'ceremony', 'celebration'];
    const currentIndex = phases.indexOf(phase);
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      if (nextPhase) {
        setPhase(nextPhase);
      }
    }
  };

  const handleComplete = () => {
    onComplete?.(reflection);
  };

  const renderPhase = () => {
    switch (phase) {
      case 'welcome':
        return (
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative"
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
                  boxShadow: '0 0 60px rgba(147, 51, 234, 0.5)'
                }}
              >
                <Calendar size={48} className="text-purple-200" />
              </div>

              {/* Floating particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-purple-400 rounded-full"
                  animate={{
                    x: [0, Math.cos(i * 45 * Math.PI / 180) * 80],
                    y: [0, Math.sin(i * 45 * Math.PI / 180) * 80],
                    opacity: [1, 0],
                    scale: [1, 0.5]
                  }}
                  transition={{
                    duration: 3,
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

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">
                Annual Reflection Ceremony
              </h1>
              <h2 className="text-2xl text-purple-300">
                {currentYear}
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                One year ago, you began building your Garden of Legacy. Today, we pause
                to honor your journey and prepare for the year ahead.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-slate-400">
                This ceremony takes about 15 minutes and creates a permanent record
                of your growth and intentions.
              </p>

              <Button
                onClick={handleContinue}
                size="lg"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl"
              >
                Begin Ceremony
                <Sparkles className="ml-2" size={20} />
              </Button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Your Year in Review
              </h2>
              <p className="text-lg text-slate-300">
                Witness the beauty of what you've built
              </p>
            </div>

            {/* Stats showcase */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {[
                { label: 'Protection Score', value: `${currentStats.protectionScore}%`, icon: Shield, color: 'from-blue-500 to-cyan-500' },
                { label: 'Milestones', value: currentStats.milestonesCompleted, icon: Star, color: 'from-yellow-500 to-orange-500' },
                { label: 'Time Capsules', value: currentStats.timeCapsules, icon: Heart, color: 'from-pink-500 to-rose-500' },
                { label: 'Guardians', value: currentStats.guardians, icon: Users, color: 'from-green-500 to-emerald-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
                  className="text-center"
                >
                  <div
                    className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${stat.color})`,
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: `0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                    }}
                  >
                    <stat.icon size={28} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Garden visualization */}
            <div className="relative h-64 rounded-3xl overflow-hidden" style={liquidGlassStyle}>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🌳</div>
                    <div className="text-xl font-semibold text-white">
                      Your Garden: {reflection.gardenState.charAt(0).toUpperCase() + reflection.gardenState.slice(1)}
                    </div>
                    <div className="text-slate-300">
                      A testament to your dedication and love
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleContinue}
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-2xl"
              >
                Continue to Reflection
                <Heart className="ml-2" size={20} />
              </Button>
            </div>
          </div>
        );

      case 'reflection':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Deep Reflection
              </h2>
              <p className="text-lg text-slate-300">
                These thoughts will become part of your eternal record
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {[
                { key: 'proudest', question: 'What are you most proud of accomplishing this year?', placeholder: 'Reflect on your greatest achievement...' },
                { key: 'grateful', question: 'What are you most grateful for?', placeholder: 'Consider the blessings in your life...' },
                { key: 'learned', question: 'What important lesson did you learn?', placeholder: 'Think about your growth and wisdom...' },
                { key: 'hopes', question: 'What do you hope for in the year ahead?', placeholder: 'Share your dreams and aspirations...' }
              ].map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="space-y-3"
                >
                  <label className="block text-lg font-medium text-white">
                    {item.question}
                  </label>
                  <Textarea
                    value={reflection.reflections[item.key as keyof typeof reflection.reflections]}
                    onChange={(e) => setReflection(prev => ({
                      ...prev,
                      reflections: {
                        ...prev.reflections,
                        [item.key]: e.target.value
                      }
                    }))}
                    placeholder={item.placeholder}
                    className="min-h-[100px] bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 rounded-2xl resize-none"
                  />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={handleContinue}
                disabled={!Object.values(reflection.reflections).every(r => r.trim())}
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl"
              >
                Continue to Commitment
                <Crown className="ml-2" size={20} />
              </Button>
            </div>
          </div>
        );

      case 'commitment':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Your Sacred Commitment
              </h2>
              <p className="text-lg text-slate-300">
                Set your intentions for the year ahead
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-3">
                <label className="block text-lg font-medium text-white">
                  Personal Message to Future You
                </label>
                <Textarea
                  value={reflection.personalNote}
                  onChange={(e) => setReflection(prev => ({
                    ...prev,
                    personalNote: e.target.value
                  }))}
                  placeholder="Write a message to yourself one year from now. What do you want to remember? What do you commit to?"
                  className="min-h-[150px] bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 rounded-2xl resize-none"
                />
              </div>

              {/* Commitment pledges */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Sacred Commitments
                </h3>

                <div className="grid gap-4">
                  {[
                    { icon: Shield, text: 'I commit to protecting what matters most to me' },
                    { icon: Heart, text: 'I promise to nurture my relationships with love and care' },
                    { icon: Star, text: 'I will continue growing my Garden of Legacy with intention' },
                    { icon: Crown, text: 'I pledge to leave a positive impact for future generations' }
                  ].map((commitment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-center gap-4 p-4 rounded-2xl"
                      style={{
                        background: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(79, 70, 229, 0.6) 100%)'
                        }}
                      >
                        <commitment.icon size={20} className="text-purple-200" />
                      </div>
                      <span className="text-white font-medium">{commitment.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleContinue}
                disabled={!reflection.personalNote.trim()}
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-gold-500 to-yellow-500 hover:from-gold-600 hover:to-yellow-600 text-white font-semibold rounded-2xl"
              >
                Seal Your Commitments
                <Sparkles className="ml-2" size={20} />
              </Button>
            </div>
          </div>
        );

      case 'ceremony':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                The Sealing Ceremony
              </h2>
              <p className="text-lg text-slate-300">
                This moment becomes eternal
              </p>
            </div>

            {/* Ceremonial animation */}
            <div className="flex justify-center">
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div
                  className="w-48 h-48 rounded-full flex items-center justify-center relative"
                  style={{
                    background: `
                      radial-gradient(circle,
                        rgba(251, 191, 36, 0.8) 0%,
                        rgba(245, 158, 11, 0.6) 30%,
                        rgba(147, 51, 234, 0.4) 100%
                      )
                    `,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 0 100px rgba(251, 191, 36, 0.5)'
                  }}
                >
                  <Crown size={64} className="text-yellow-200" />

                  {/* Orbiting elements */}
                  {[Heart, Star, Shield, Sparkles].map((Icon, index) => (
                    <motion.div
                      key={index}
                      className="absolute"
                      animate={{
                        rotate: [0, 360],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        delay: index * 2
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translateX(${100 + index * 10}px)`,
                        transformOrigin: `-${100 + index * 10}px 0`
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <Icon size={16} className="text-purple-600" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="text-center space-y-6">
              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-slate-300 leading-relaxed">
                  Your reflections and commitments are now being sealed into your
                  eternal Garden of Legacy. This ceremony marks not an ending,
                  but a sacred beginning of your next chapter.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
              >
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl"
                >
                  Complete Ceremony
                  <Gift className="ml-2" size={20} />
                </Button>
              </motion.div>
            </div>
          </div>
        );

      case 'celebration':
        return (
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div
                className="w-40 h-40 rounded-full mx-auto flex items-center justify-center relative"
                style={{
                  background: `
                    radial-gradient(circle,
                      rgba(34, 197, 94, 0.8) 0%,
                      rgba(21, 128, 61, 0.6) 100%
                    )
                  `,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 0 80px rgba(34, 197, 94, 0.5)'
                }}
              >
                <Award size={56} className="text-green-200" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">
                Ceremony Complete
              </h2>
              <p className="text-xl text-green-300">
                {currentYear} Reflection Sealed Forever
              </p>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Your reflections and commitments have been added to your eternal story.
                They will guide you and inspire future generations who walk in your footsteps.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleComplete}
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-2xl"
              >
                Return to Garden
                <TreePine className="ml-2" size={20} />
              </Button>

              <p className="text-sm text-slate-400">
                This reflection will be waiting for you next year
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6 ${className}`}>

      {/* Background ceremonial effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: `hsl(${45 + Math.random() * 60}, 70%, 60%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 2, 1],
              y: [0, -50, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-5xl">
        <Card
          className="p-8 md:p-12"
          style={liquidGlassStyle}
        >
          {renderPhase()}

          {/* Phase indicator */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              {['welcome', 'review', 'reflection', 'commitment', 'ceremony', 'celebration'].map((p, index) => (
                <div
                  key={p}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    p === phase
                      ? 'bg-purple-400 scale-125'
                      : index < ['welcome', 'review', 'reflection', 'commitment', 'ceremony', 'celebration'].indexOf(phase)
                      ? 'bg-purple-600'
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Cancel option (only for early phases) */}
          {['welcome', 'review'].includes(phase) && (
            <div className="mt-8 text-center">
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-300 text-sm"
              >
                Maybe later
              </button>
            </div>
          )}
        </Card>

        {/* Sofia guide */}
        <SofiaFirefly
          size="lg"
          message={getSofiaMessage()}
          showDialog={true}
          position={{ x: 85, y: 15 }}
          className="absolute"
        />
      </div>
    </div>
  );
}