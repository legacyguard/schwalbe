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
import { FamilyService, type FamilyMember as FamilyMemberType } from '@/services/familyService';
import { logger } from '@schwalbe/shared/src/lib/logger';

// Use the type from FamilyService, but keep local interface for component compatibility
interface FamilyMemberDisplay {
  id: string;
  name: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'guardian' | 'friend' | 'other';
  protectionStatus: 'protected' | 'partial' | 'unprotected' | 'pending';
  avatar?: string;
  isEmergencyContact: boolean;
  isGuardian: boolean;
  lastActivity?: Date;
}

interface FamilyTreeProps {
  familyMembers?: FamilyMemberDisplay[];
  onAddMember?: () => void;
  onEditMember?: (memberId: string) => void;
  onSetEmergencyContact?: (memberId: string) => void;
  onSetGuardian?: (memberId: string) => void;
}

// Transform Supabase data to display format
const transformFamilyMember = (member: FamilyMemberType): FamilyMemberDisplay => ({
  id: member.id,
  name: member.name,
  relationship: member.relationship,
  protectionStatus: member.protection_status,
  avatar: member.avatar_url,
  isEmergencyContact: member.is_emergency_contact,
  isGuardian: member.is_guardian,
  lastActivity: member.last_activity_at ? new Date(member.last_activity_at) : undefined
});

export default function FamilyTreeVisualization({
  familyMembers: propFamilyMembers,
  onAddMember,
  onEditMember,
  onSetEmergencyContact,
  onSetGuardian
}: FamilyTreeProps) {
  // State for family members from Supabase
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Load family members from Supabase
  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use prop data if provided, otherwise fetch from Supabase
      if (propFamilyMembers) {
        setFamilyMembers(propFamilyMembers);
        setIsLoading(false);
        return;
      }

      const members = await FamilyService.getFamilyMembers();
      const displayMembers = members.map(transformFamilyMember);

      setFamilyMembers(displayMembers);

      // If no family members exist, initialize with current user
      if (displayMembers.length === 0) {
        await initializeFamily();
      }

      logger.info('Loaded family members', { metadata: { count: displayMembers.length } });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load family members';
      setError(errorMessage);
      logger.error('Failed to load family members', { metadata: { error: errorMessage } });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeFamily = async () => {
    try {
      const selfMember = await FamilyService.initializeUserFamily('Ja'); // "Me" in Slovak
      const displayMember = transformFamilyMember(selfMember);
      setFamilyMembers([displayMember]);
    } catch (err) {
      logger.error('Failed to initialize family', { metadata: { error: err instanceof Error ? err.message : String(err) } });
    }
  };

  const handleAddMember = async (memberData: Omit<FamilyMemberType, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newMember = await FamilyService.addFamilyMember(memberData);
      const displayMember = transformFamilyMember(newMember);
      setFamilyMembers(prev => [...prev, displayMember]);
      setShowAddForm(false);

      if (onAddMember) onAddMember();
    } catch (err) {
      logger.error('Failed to add family member', { metadata: { error: err instanceof Error ? err.message : String(err) } });
    }
  };

  const handleUpdateMember = async (memberId: string, updates: Partial<FamilyMemberType>) => {
    try {
      const updatedMember = await FamilyService.updateFamilyMember(memberId, updates);
      const displayMember = transformFamilyMember(updatedMember);
      setFamilyMembers(prev => prev.map(m => m.id === memberId ? displayMember : m));

      if (onEditMember) onEditMember(memberId);
    } catch (err) {
      logger.error('Failed to update family member', { metadata: { error: err instanceof Error ? err.message : String(err) } });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await FamilyService.deleteFamilyMember(memberId);
      setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      logger.error('Failed to delete family member', { metadata: { error: err instanceof Error ? err.message : String(err) } });
    }
  };

  const handleSetEmergencyContact = async (memberId: string, isEmergencyContact: boolean) => {
    try {
      await handleUpdateMember(memberId, { is_emergency_contact: isEmergencyContact });
      if (onSetEmergencyContact) onSetEmergencyContact(memberId);
    } catch (err) {
      logger.error('Failed to set emergency contact', { metadata: { error: err instanceof Error ? err.message : String(err) } });
    }
  };

  const handleSetGuardian = async (memberId: string, isGuardian: boolean) => {
    try {
      await handleUpdateMember(memberId, { is_guardian: isGuardian });
      if (onSetGuardian) onSetGuardian(memberId);
    } catch (err) {
      logger.error('Failed to set guardian', { metadata: { error: err instanceof Error ? err.message : String(err) } });
    }
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Načítavam rodinnú štruktúru...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-red-500 text-4xl">⚠️</div>
            <h3 className="font-semibold">Chyba pri načítaní</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={loadFamilyMembers} variant="outline">
              Skúsiť znovu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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