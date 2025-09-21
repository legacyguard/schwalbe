/**
 * Family Tree Visualization Component
 * Core component for the main dashboard "Rodinný Štít" (Family Shield)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import { PersonalityAwareAnimation } from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';

interface FamilyMember {
  id: string;
  name: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'guardian';
  protectionStatus: 'protected' | 'partial' | 'unprotected' | 'pending';
  avatar?: string;
  isEmergencyContact: boolean;
  isGuardian: boolean;
  lastActivity?: Date;
}

interface FamilyTreeProps {
  familyMembers?: FamilyMember[];
  onAddMember?: () => void;
  onEditMember?: (memberId: string) => void;
  onSetEmergencyContact?: (memberId: string) => void;
  onSetGuardian?: (memberId: string) => void;
}

const defaultFamilyMembers: FamilyMember[] = [
  {
    id: 'self',
    name: 'You',
    relationship: 'self',
    protectionStatus: 'partial',
    isEmergencyContact: false,
    isGuardian: false,
    lastActivity: new Date()
  }
];

export default function FamilyTreeVisualization({
  familyMembers = defaultFamilyMembers,
  onAddMember,
  onEditMember,
  onSetEmergencyContact,
  onSetGuardian
}: FamilyTreeProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Initialize Sofia personality for family guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.nurturingUser);

  useEffect(() => {
    adaptToContext('guiding');
  }, [adaptToContext]);

  const getProtectionColor = (status: FamilyMember['protectionStatus']) => {
    switch (status) {
      case 'protected':
        return 'bg-green-500';
      case 'partial':
        return 'bg-yellow-500';
      case 'unprotected':
        return 'bg-red-500';
      case 'pending':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRelationshipIcon = (relationship: FamilyMember['relationship']) => {
    switch (relationship) {
      case 'self':
        return '👤';
      case 'spouse':
        return '💑';
      case 'child':
        return '👶';
      case 'parent':
        return '👨‍👩‍👧‍👦';
      case 'sibling':
        return '👫';
      case 'guardian':
        return '🛡️';
      default:
        return '👤';
    }
  };

  const calculateFamilyProtectionScore = () => {
    if (familyMembers.length === 0) return 0;

    const scores = familyMembers.map(member => {
      switch (member.protectionStatus) {
        case 'protected': return 100;
        case 'partial': return 60;
        case 'pending': return 30;
        case 'unprotected': return 0;
        default: return 0;
      }
    });

    return Math.round(scores.reduce((acc: number, score) => acc + score, 0) / scores.length);
  };

  const handleMemberClick = (memberId: string) => {
    setSelectedMember(selectedMember === memberId ? null : memberId);
    setIsInteracting(true);
    learnFromInteraction({
      type: 'click',
      duration: 200,
      context: 'guiding'
    });
  };

  const protectionScore = calculateFamilyProtectionScore();

  return (
    <PersonalityAwareAnimation personality={personality} context="guiding">
      <div className="w-full space-y-6">
        {/* Family Protection Score */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                🛡️ Family Protection Shield
                <motion.div
                  className={`text-sm px-3 py-1 rounded-full text-white ${
                    protectionScore >= 80 ? 'bg-green-500' :
                    protectionScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {protectionScore}%
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your family's overall protection status. Each member's security contributes to the shield strength.
              </p>

              {/* Protection Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <motion.div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    protectionScore >= 80 ? 'bg-green-500' :
                    protectionScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${protectionScore}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Family Tree Grid */}
        <LiquidMotion.ScaleIn delay={0.4}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  👨‍👩‍👧‍👦 Family Tree
                  <span className="text-sm text-muted-foreground">
                    ({familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''})
                  </span>
                </CardTitle>
                <Button
                  onClick={() => {
                    setShowAddForm(true);
                    setIsInteracting(true);
                    onAddMember?.();
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  + Add Family Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {familyMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer border-2 transition-all duration-300 ${
                          selectedMember === member.id
                            ? 'border-primary shadow-lg'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleMemberClick(member.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl">
                              {getRelationshipIcon(member.relationship)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">{member.name}</h3>
                              <p className="text-sm text-muted-foreground capitalize">
                                {member.relationship}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <motion.div
                                className={`w-3 h-3 rounded-full ${getProtectionColor(member.protectionStatus)}`}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: index * 0.2
                                }}
                              />
                              {member.isGuardian && (
                                <span className="text-xs text-blue-600">🛡️ Guardian</span>
                              )}
                              {member.isEmergencyContact && (
                                <span className="text-xs text-red-600">🚨 Emergency</span>
                              )}
                            </div>
                          </div>

                          {/* Protection Status */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Protection Status:</span>
                              <span className={`capitalize font-medium ${
                                member.protectionStatus === 'protected' ? 'text-green-600' :
                                member.protectionStatus === 'partial' ? 'text-yellow-600' :
                                member.protectionStatus === 'pending' ? 'text-blue-600' :
                                'text-red-600'
                              }`}>
                                {member.protectionStatus}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <AnimatePresence>
                            {selectedMember === member.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 border-t pt-3"
                              >
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditMember?.(member.id);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSetGuardian?.(member.id);
                                    }}
                                    disabled={member.isGuardian}
                                  >
                                    {member.isGuardian ? 'Guardian' : 'Set Guardian'}
                                  </Button>
                                </div>
                                <Button
                                  size="sm"
                                  variant={member.isEmergencyContact ? "default" : "outline"}
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSetEmergencyContact?.(member.id);
                                  }}
                                >
                                  {member.isEmergencyContact ? '✓ Emergency Contact' : 'Set Emergency Contact'}
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Sofia Guidance */}
              <LiquidMotion.ScaleIn delay={1}>
                <motion.div
                  className="mt-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl px-4 py-3"
                  animate={{
                    boxShadow: [
                      '0 0 15px rgba(59, 130, 246, 0.1)',
                      '0 0 25px rgba(59, 130, 246, 0.15)',
                      '0 0 15px rgba(59, 130, 246, 0.1)',
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <p className="text-primary text-sm font-medium">
                      ✨ Sofia: "{protectionScore < 60
                        ? 'Your family shield needs strengthening. Consider adding guardians and emergency contacts.'
                        : protectionScore < 80
                          ? 'Great progress! A few more protections will make your family completely secure.'
                          : 'Excellent! Your family is well-protected. Your loved ones can rest easy.'}"
                    </p>
                  </div>
                </motion.div>
              </LiquidMotion.ScaleIn>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}