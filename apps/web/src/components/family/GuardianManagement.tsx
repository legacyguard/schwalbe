/**
 * Guardian Management System
 * Handles guardian role assignment, permissions, and emergency protocols
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SofiaAffirmation from '@/components/sofia-ai/SofiaAffirmation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import { PersonalityAwareAnimation } from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';

interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  permissions: GuardianPermission[];
  status: 'pending' | 'accepted' | 'active' | 'inactive';
  emergencyPriority: number;
  lastContactDate?: Date;
  invitationSent?: Date;
}

interface GuardianPermission {
  id: string;
  type: 'document_access' | 'emergency_activation' | 'family_management' | 'financial_overview' | 'medical_decisions';
  granted: boolean;
  grantedDate?: Date;
}

interface GuardianManagementProps {
  guardians?: Guardian[];
  onAddGuardian?: (guardian: Omit<Guardian, 'id'>) => void;
  onUpdateGuardian?: (id: string, updates: Partial<Guardian>) => void;
  onRemoveGuardian?: (id: string) => void;
  onSendInvitation?: (guardianId: string) => void;
  onActivateEmergency?: (guardianId: string) => void;
}

const defaultPermissions: Omit<GuardianPermission, 'granted' | 'grantedDate'>[] = [
  { id: 'document_access', type: 'document_access' },
  { id: 'emergency_activation', type: 'emergency_activation' },
  { id: 'family_management', type: 'family_management' },
  { id: 'financial_overview', type: 'financial_overview' },
  { id: 'medical_decisions', type: 'medical_decisions' }
];

export default function GuardianManagement({
  guardians = [],
  onAddGuardian,
  onUpdateGuardian,
  onRemoveGuardian,
  onSendInvitation,
  onActivateEmergency
}: GuardianManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<string | null>(null);
  const [newGuardian, setNewGuardian] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    emergencyPriority: 1
  });
  const [isInteracting, setIsInteracting] = useState(false);
  const [showGuardianAffirmation, setShowGuardianAffirmation] = useState(false);

  // Initialize Sofia personality for guardian guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.trustBuilder);

  useEffect(() => {
    adaptToContext('trust');
  }, [adaptToContext]);

  const handleAddGuardian = () => {
    if (!newGuardian.name || !newGuardian.email) return;

    const guardian: Omit<Guardian, 'id'> = {
      ...newGuardian,
      permissions: defaultPermissions.map(p => ({
        ...p,
        granted: false
      })),
      status: 'pending'
    };

    onAddGuardian?.(guardian);
    setNewGuardian({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      emergencyPriority: guardians.length + 1
    });
    setShowAddForm(false);
    setIsInteracting(true);
    setShowGuardianAffirmation(true);

    learnFromInteraction({
      type: 'click',
      duration: 1000,
      context: 'trust'
    });
  };

  const getPermissionLabel = (type: GuardianPermission['type']) => {
    switch (type) {
      case 'document_access':
        return '📄 Document Access';
      case 'emergency_activation':
        return '🚨 Emergency Activation';
      case 'family_management':
        return '👨‍👩‍👧‍👦 Family Management';
      case 'financial_overview':
        return '💰 Financial Overview';
      case 'medical_decisions':
        return '🏥 Medical Decisions';
      default:
        return type;
    }
  };

  const getStatusColor = (status: Guardian['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'accepted':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const activeGuardians = guardians.filter(g => g.status === 'active').length;
  const pendingInvitations = guardians.filter(g => g.status === 'pending').length;

  return (
    <PersonalityAwareAnimation personality={personality} context="trust">
      <div className="w-full space-y-6">
        {/* Guardian Overview */}
        {showGuardianAffirmation && (
          <div className="mb-4">
            <SofiaAffirmation
              type="guardian_added"
              onClose={() => setShowGuardianAffirmation(false)}
            />
          </div>
        )}
        <LiquidMotion.ScaleIn delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🛡️</div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{activeGuardians}</p>
                    <p className="text-sm text-muted-foreground">Active Guardians</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📬</div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{pendingInvitations}</p>
                    <p className="text-sm text-muted-foreground">Pending Invitations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{guardians.length}</p>
                    <p className="text-sm text-muted-foreground">Total Guardians</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </LiquidMotion.ScaleIn>

        {/* Guardian List */}
        <LiquidMotion.ScaleIn delay={0.4}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  👥 Guardian Network
                </CardTitle>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  + Add Guardian
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {guardians.map((guardian, index) => (
                    <motion.div
                      key={guardian.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`cursor-pointer border-2 transition-all duration-300 ${
                          selectedGuardian === guardian.id
                            ? 'border-primary shadow-lg'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedGuardian(
                          selectedGuardian === guardian.id ? null : guardian.id
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">🛡️</div>
                              <div>
                                <h3 className="font-medium text-lg">{guardian.name}</h3>
                                <p className="text-sm text-muted-foreground">{guardian.relationship}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guardian.status)}`}>
                                {guardian.status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Priority #{guardian.emergencyPriority}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                            <div>📧 {guardian.email}</div>
                            <div>📱 {guardian.phone}</div>
                          </div>

                          {/* Permissions Overview */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {guardian.permissions.map(permission => (
                              <span
                                key={permission.id}
                                className={`px-2 py-1 rounded-full text-xs ${
                                  permission.granted
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {getPermissionLabel(permission.type).split(' ')[0]}
                              </span>
                            ))}
                          </div>

                          {/* Expanded Actions */}
                          <AnimatePresence>
                            {selectedGuardian === guardian.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t pt-3 space-y-3"
                              >
                                {/* Permission Management */}
                                <div>
                                  <h4 className="font-medium mb-2">Permissions:</h4>
                                  <div className="grid grid-cols-1 gap-2">
                                    {guardian.permissions.map(permission => (
                                      <div
                                        key={permission.id}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                      >
                                        <span className="text-sm">
                                          {getPermissionLabel(permission.type)}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant={permission.granted ? "default" : "outline"}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const updatedPermissions = guardian.permissions.map(p =>
                                              p.id === permission.id
                                                ? { ...p, granted: !p.granted, grantedDate: new Date() }
                                                : p
                                            );
                                            onUpdateGuardian?.(guardian.id, { permissions: updatedPermissions });
                                          }}
                                        >
                                          {permission.granted ? '✓' : 'Grant'}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                  {guardian.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSendInvitation?.(guardian.id);
                                      }}
                                    >
                                      Send Invitation
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveGuardian?.(guardian.id);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                  {guardian.status === 'active' && (
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onActivateEmergency?.(guardian.id);
                                      }}
                                    >
                                      🚨 Emergency Contact
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {guardians.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">👥</div>
                    <p>No guardians added yet.</p>
                    <p className="text-sm">Add trusted family members or friends to protect your legacy.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Add Guardian Form */}
        <AnimatePresence>
          {showAddForm && (
            <LiquidMotion.ScaleIn delay={0}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>Add New Guardian</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <Input
                          value={newGuardian.name}
                          onChange={(e) => setNewGuardian(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Relationship</label>
                        <Input
                          value={newGuardian.relationship}
                          onChange={(e) => setNewGuardian(prev => ({ ...prev, relationship: e.target.value }))}
                          placeholder="e.g., Spouse, Adult Child, Brother"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <Input
                          type="email"
                          value={newGuardian.email}
                          onChange={(e) => setNewGuardian(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <Input
                          type="tel"
                          value={newGuardian.phone}
                          onChange={(e) => setNewGuardian(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddGuardian}
                        disabled={!newGuardian.name || !newGuardian.email}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Add Guardian
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </LiquidMotion.ScaleIn>
          )}
        </AnimatePresence>

        {/* Sofia Guidance */}
        <LiquidMotion.ScaleIn delay={0.8}>
          <motion.div
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl px-4 py-3"
            animate={{
              boxShadow: [
                '0 0 15px rgba(34, 197, 94, 0.1)',
                '0 0 25px rgba(34, 197, 94, 0.15)',
                '0 0 15px rgba(34, 197, 94, 0.1)',
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
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-green-600 text-sm font-medium">
                ✨ Sofia: "{activeGuardians === 0
                  ? 'If it feels right, you might start by adding someone you trust as a guardian. You can always change this later.'
                  : activeGuardians < 2
                    ? 'When you’re ready, you could add a second trusted person as a backup. It’s okay to take your time.'
                    : 'You have support in place. If you prefer, you can review permissions or simply continue at your own pace.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}