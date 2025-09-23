/**
 * Progressive Dashboard with Garden of Legacy
 * Premium Apple-style liquid glass design with immersive garden visualization
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  Star,
  Sparkles,
  ArrowRight,
  Play,
  Crown,
  Gift
} from 'lucide-react';
import { GardenOfLegacy, GuardianMilestones } from '../journey/GardenOfLegacy';
import { SofiaFirefly } from '../sofia/SofiaFirefly';
import { MilestoneCelebration, useMilestoneCelebration } from '../journey/MilestoneCelebration';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatRelativeTime } from '@/lib/utils';

interface DashboardData {
  protectionScore: number;
  completedMilestones: string[];
  currentChallenges: Challenge[];
  recentActivity: Activity[];
  nextMilestone?: Milestone;
  gardenPhase: 'seed' | 'sprout' | 'growth' | 'bloom' | 'legacy';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: '5min' | '15min' | '30min' | 'journey';
  reward: string;
  action: () => void;
  estimatedTime: string;
  priority: 'low' | 'medium' | 'high';
}

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'milestone' | 'document' | 'guardian' | 'capsule';
  icon: React.ComponentType<any>;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  progress: number;
  nextAction: string;
}

interface ProgressiveDashboardProps {
  data?: DashboardData;
  className?: string;
}

export function ProgressiveDashboard({
  data,
  className = ''
}: ProgressiveDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    protectionScore: 45,
    completedMilestones: ['seed', 'sprout'],
    currentChallenges: [],
    recentActivity: [],
    gardenPhase: 'sprout'
  });

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [sofiaMessage, setSofiaMessage] = useState<string>('');

  const {
    activeMilestone,
    isVisible: celebrationVisible,
    handleCelebrationComplete,
    handleContinue
  } = useMilestoneCelebration();

  useEffect(() => {
    if (data) {
      setDashboardData(data);
    } else {
      // Mock data for demonstration
      setDashboardData({
        protectionScore: 45,
        completedMilestones: ['seed', 'sprout'],
        currentChallenges: [
          {
            id: 'upload-will',
            title: 'Complete Your Will',
            description: 'Use our guided wizard to create your will in 15 minutes',
            type: '15min',
            reward: 'Protection Leaf milestone + Legal review',
            action: () => window.location.href = '/will/wizard',
            estimatedTime: '15 minutes',
            priority: 'high'
          },
          {
            id: 'add-guardian',
            title: 'Invite Your First Guardian',
            description: 'Add someone you trust to your circle of protection',
            type: '5min',
            reward: 'Guardian Tree milestone + Emergency protocols',
            action: () => window.location.href = '/family/invite',
            estimatedTime: '5 minutes',
            priority: 'high'
          },
          {
            id: 'record-message',
            title: 'Record a Time Capsule',
            description: 'Leave a voice message for your loved ones',
            type: '30min',
            reward: 'Legacy Fruit milestone + Advanced features',
            action: () => window.location.href = '/time-capsule/new',
            estimatedTime: '30 minutes',
            priority: 'medium'
          }
        ],
        recentActivity: [
          {
            id: '1',
            title: 'First document uploaded',
            description: 'Added identity document to vault',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            type: 'document',
            icon: FileText
          },
          {
            id: '2',
            title: 'Foundation Stone achieved',
            description: 'Completed your first milestone',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            type: 'milestone',
            icon: Star
          }
        ],
        nextMilestone: {
          id: 'protection-leaf',
          title: 'Protection Leaf',
          description: 'Complete your will to grow your first leaf',
          progress: 30,
          nextAction: 'Use Will Wizard'
        },
        gardenPhase: 'sprout'
      });
    }
  }, [data]);

  useEffect(() => {
    const messages = [
      "Your garden is growing beautifully! Ready for the next step?",
      "I see great progress in your journey. What shall we work on next?",
      "Each action you take makes your legacy stronger. Keep going!",
      "Your loved ones will be so grateful for the protection you're building."
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    if (randomMessage) {
      setSofiaMessage(randomMessage);
    }
  }, [dashboardData.protectionScore]);

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

  const getPhaseDescription = () => {
    switch (dashboardData.gardenPhase) {
      case 'seed': return 'The beginning of your journey - potential waiting to bloom';
      case 'sprout': return 'First growth appears - your protection is taking root';
      case 'growth': return 'Strong development - your legacy is flourishing';
      case 'bloom': return 'Full flower - comprehensive protection achieved';
      case 'legacy': return 'Eternal garden - your legacy will live forever';
      default: return 'Your journey continues...';
    }
  };

  const getChallengeColor = (priority: Challenge['priority']) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-pink-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getChallengeTypeIcon = (type: Challenge['type']) => {
    switch (type) {
      case '5min': return <Clock size={16} className="text-green-400" />;
      case '15min': return <Play size={16} className="text-yellow-400" />;
      case '30min': return <Star size={16} className="text-orange-400" />;
      case 'journey': return <Crown size={16} className="text-purple-400" />;
      default: return <Sparkles size={16} className="text-blue-400" />;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 ${className}`}>

      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Your Garden of Legacy
                </h1>
                <p className="text-xl text-slate-300">
                  {getPhaseDescription()}
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {dashboardData.protectionScore}%
                </div>
                <div className="text-sm text-slate-400">
                  Protection Score
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">
                  Journey Progress
                </span>
                <span className="text-sm text-slate-400">
                  {dashboardData.completedMilestones.length} / 7 milestones
                </span>
              </div>
              <Progress
                value={dashboardData.protectionScore}
                className="h-3 rounded-full overflow-hidden"
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Garden visualization */}
            <div className="lg:col-span-2">
              <Card
                className="p-0 overflow-hidden"
                style={liquidGlassStyle}
              >
                <div className="h-96 relative">
                  <GardenOfLegacy
                    milestones={GuardianMilestones.map(m => ({
                      ...m,
                      completed: dashboardData.completedMilestones.includes(m.id)
                    }))}
                    protectionScore={dashboardData.protectionScore}
                    onMilestoneClick={(milestone) => {
                      // Handle milestone click
                      console.log('Milestone clicked:', milestone);
                    }}
                    showSofia={true}
                    animated={true}
                  />
                </div>
              </Card>
            </div>

            {/* Side panel */}
            <div className="space-y-6">

              {/* Current challenges */}
              <Card
                className="p-6"
                style={liquidGlassStyle}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Current Challenges
                  </h3>
                  <Sparkles size={20} className="text-yellow-400" />
                </div>

                <div className="space-y-4">
                  {dashboardData.currentChallenges.slice(0, 3).map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      <div
                        className="p-4 rounded-2xl cursor-pointer transition-all duration-300"
                        style={{
                          background: `
                            linear-gradient(135deg,
                              rgba(15, 23, 42, 0.8) 0%,
                              rgba(30, 41, 59, 0.6) 100%
                            )
                          `,
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                        onClick={() => setSelectedChallenge(challenge)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getChallengeTypeIcon(challenge.type)}
                            <h4 className="font-medium text-white">
                              {challenge.title}
                            </h4>
                          </div>
                          <div
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: `linear-gradient(135deg, ${getChallengeColor(challenge.priority)})`
                            }}
                          >
                            {challenge.estimatedTime}
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 mb-3">
                          {challenge.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-yellow-400">
                            <Gift size={12} />
                            <span>{challenge.reward.split(' + ')[0]}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              challenge.action();
                            }}
                            className="px-3 py-1 h-auto text-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          >
                            Start
                            <ArrowRight size={12} className="ml-1" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  View All Challenges
                </Button>
              </Card>

              {/* Next milestone */}
              {dashboardData.nextMilestone && (
                <Card
                  className="p-6"
                  style={liquidGlassStyle}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">
                      Next Milestone
                    </h3>
                    <Star size={20} className="text-purple-400" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white mb-1">
                        {dashboardData.nextMilestone.title}
                      </h4>
                      <p className="text-sm text-slate-300">
                        {dashboardData.nextMilestone.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300">Progress</span>
                        <span className="text-slate-400">
                          {dashboardData.nextMilestone.progress}%
                        </span>
                      </div>
                      <Progress
                        value={dashboardData.nextMilestone.progress}
                        className="h-2"
                      />
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {dashboardData.nextMilestone.nextAction}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Recent activity */}
              <Card
                className="p-6"
                style={liquidGlassStyle}
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  Recent Activity
                </h3>

                <div className="space-y-3">
                  {dashboardData.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{
                        background: 'rgba(15, 23, 42, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 100%)'
                        }}
                      >
                        <activity.icon size={16} className="text-blue-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  View All Activity
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Sofia guide */}
      <SofiaFirefly
        size="lg"
        message={sofiaMessage}
        showDialog={true}
        position={{ x: 90, y: 15 }}
        onInteraction={() => {
          // Show next challenge or guidance
          if (dashboardData.currentChallenges.length > 0) {
            const firstChallenge = dashboardData.currentChallenges[0];
            if (firstChallenge) {
              firstChallenge.action();
            }
          }
        }}
        className="fixed z-30"
      />

      {/* Milestone celebration */}
      {activeMilestone && (
        <MilestoneCelebration
          milestone={activeMilestone}
          isVisible={celebrationVisible}
          onCelebrationComplete={handleCelebrationComplete}
          onContinue={handleContinue}
        />
      )}

      {/* Challenge detail modal */}
      <AnimatePresence>
        {selectedChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-6"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setSelectedChallenge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Card
                className="p-6"
                style={liquidGlassStyle}
              >
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    {getChallengeTypeIcon(selectedChallenge.type)}
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    {selectedChallenge.title}
                  </h3>

                  <p className="text-slate-300">
                    {selectedChallenge.description}
                  </p>

                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.2)'
                    }}
                  >
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <Gift size={16} />
                      <span className="font-medium">Reward</span>
                    </div>
                    <p className="text-yellow-200 text-sm">
                      {selectedChallenge.reward}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        selectedChallenge.action();
                        setSelectedChallenge(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Start Challenge
                    </Button>

                    <Button
                      onClick={() => setSelectedChallenge(null)}
                      variant="outline"
                      className="px-4 bg-slate-800/50 border-slate-600 text-slate-300"
                    >
                      Later
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}