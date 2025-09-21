/**
 * Family Invitation System Component
 * Handles family member invitations via email/SMS with tracking and management
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface FamilyInvitation {
  id: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'guardian' | 'other';
  invitationType: 'email' | 'sms' | 'both';
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'accepted' | 'declined' | 'expired';
  sentDate?: Date;
  expiryDate?: Date;
  personalMessage?: string;
  role: 'family_member' | 'emergency_contact' | 'guardian';
  permissions: string[];
  resendCount: number;
  lastResent?: Date;
}

interface FamilyInvitationSystemProps {
  existingInvitations?: FamilyInvitation[];
  onSendInvitation?: (invitation: Omit<FamilyInvitation, 'id' | 'status' | 'sentDate'>) => Promise<void>;
  onResendInvitation?: (invitationId: string) => Promise<void>;
  onCancelInvitation?: (invitationId: string) => Promise<void>;
  onViewInvitation?: (invitationId: string) => void;
}

const relationshipOptions = [
  { value: 'spouse', label: 'Spouse/Partner', icon: '💑' },
  { value: 'child', label: 'Child', icon: '👶' },
  { value: 'parent', label: 'Parent', icon: '👨‍👩‍👧‍👦' },
  { value: 'sibling', label: 'Sibling', icon: '👫' },
  { value: 'guardian', label: 'Guardian', icon: '🛡️' },
  { value: 'other', label: 'Other Family', icon: '👤' }
];

const roleOptions = [
  {
    value: 'family_member',
    label: 'Family Member',
    icon: '👨‍👩‍👧‍👦',
    description: 'Basic family member access'
  },
  {
    value: 'emergency_contact',
    label: 'Emergency Contact',
    icon: '🚨',
    description: 'Receives emergency notifications'
  },
  {
    value: 'guardian',
    label: 'Guardian',
    icon: '🛡️',
    description: 'Full guardian responsibilities and permissions'
  }
];

const defaultPermissions: Record<string, string[]> = {
  family_member: ['view_family_tree', 'view_basic_documents'],
  emergency_contact: ['view_family_tree', 'receive_emergency_notifications', 'view_emergency_contacts'],
  guardian: ['view_family_tree', 'manage_family_members', 'access_documents', 'emergency_activation', 'financial_overview']
};

export default function FamilyInvitationSystem({
  existingInvitations = [],
  onSendInvitation,
  onResendInvitation,
  onCancelInvitation,
  onViewInvitation
}: FamilyInvitationSystemProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'create' | 'pending' | 'sent'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    relationship: 'spouse' as FamilyInvitation['relationship'],
    invitationType: 'email' as FamilyInvitation['invitationType'],
    role: 'family_member' as FamilyInvitation['role'],
    personalMessage: ''
  });

  // Initialize Sofia personality for invitation guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.nurturingUser);

  useEffect(() => {
    adaptToContext('inviting');
  }, [adaptToContext]);

  const getStatusColor = (status: FamilyInvitation['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500';
      case 'sent':
      case 'delivered':
      case 'opened':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'declined':
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: FamilyInvitation['status']) => {
    switch (status) {
      case 'accepted':
        return '✅';
      case 'sent':
        return '📤';
      case 'delivered':
        return '📥';
      case 'opened':
        return '👀';
      case 'pending':
        return '⏳';
      case 'declined':
        return '❌';
      case 'expired':
        return '⌛';
      default:
        return '📋';
    }
  };

  const validateForm = () => {
    if (!formData.recipientName.trim()) return false;
    if (formData.invitationType === 'email' || formData.invitationType === 'both') {
      if (!formData.recipientEmail.trim() || !formData.recipientEmail.includes('@')) return false;
    }
    if (formData.invitationType === 'sms' || formData.invitationType === 'both') {
      if (!formData.recipientPhone.trim()) return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const permissions = defaultPermissions[formData.role] || [];
      await onSendInvitation?.({
        ...formData,
        permissions,
        resendCount: 0,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      setFormData({
        recipientName: '',
        recipientEmail: '',
        recipientPhone: '',
        relationship: 'spouse',
        invitationType: 'email',
        role: 'family_member',
        personalMessage: ''
      });

      learnFromInteraction({
        type: 'invitation_sent',
        duration: 1000,
        context: 'inviting'
      });

      setSelectedTab('pending');
    } catch (error) {
      console.error('Failed to send invitation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingInvitations = existingInvitations.filter(inv =>
    ['pending', 'sent', 'delivered', 'opened'].includes(inv.status)
  );

  const completedInvitations = existingInvitations.filter(inv =>
    ['accepted', 'declined', 'expired'].includes(inv.status)
  );

  return (
    <PersonalityAwareAnimation personality={personality} context="inviting">
      <div className="w-full space-y-6">
        {/* Header */}
        <LiquidMotion.ScaleIn delay={0.1}>
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                📧 Family Invitation System
                <motion.div
                  className="text-sm px-3 py-1 rounded-full bg-primary text-primary-foreground"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {pendingInvitations.length} Pending
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Invite family members to join your protection network. Send secure invitations via email or SMS.
              </p>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Tab Navigation */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {[
              { key: 'create', label: 'Create Invitation', icon: '✉️' },
              { key: 'pending', label: `Pending (${pendingInvitations.length})`, icon: '⏳' },
              { key: 'sent', label: `History (${completedInvitations.length})`, icon: '📋' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={selectedTab === tab.key ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>
        </LiquidMotion.ScaleIn>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      ✉️ Create New Invitation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Recipient Name *
                          </label>
                          <Input
                            value={formData.recipientName}
                            onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                            placeholder="Enter full name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Relationship *
                          </label>
                          <select
                            value={formData.relationship}
                            onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value as FamilyInvitation['relationship'] }))}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                            required
                          >
                            {relationshipOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.icon} {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Invitation Method *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {['email', 'sms', 'both'].map(type => (
                            <motion.div
                              key={type}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                formData.invitationType === type
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, invitationType: type as FamilyInvitation['invitationType'] }))}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-1">
                                  {type === 'email' ? '📧' : type === 'sms' ? '📱' : '📧📱'}
                                </div>
                                <div className="text-sm font-medium capitalize">{type}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(formData.invitationType === 'email' || formData.invitationType === 'both') && (
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Email Address *
                            </label>
                            <Input
                              type="email"
                              value={formData.recipientEmail}
                              onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                              placeholder="email@example.com"
                              required={formData.invitationType === 'email' || formData.invitationType === 'both'}
                            />
                          </div>
                        )}

                        {(formData.invitationType === 'sms' || formData.invitationType === 'both') && (
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Phone Number *
                            </label>
                            <Input
                              type="tel"
                              value={formData.recipientPhone}
                              onChange={(e) => setFormData(prev => ({ ...prev, recipientPhone: e.target.value }))}
                              placeholder="+1 (555) 123-4567"
                              required={formData.invitationType === 'sms' || formData.invitationType === 'both'}
                            />
                          </div>
                        )}
                      </div>

                      {/* Role Selection */}
                      <div>
                        <label className="block text-sm font-medium mb-3">
                          Role & Permissions *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {roleOptions.map(role => (
                            <motion.div
                              key={role.value}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                formData.role === role.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, role: role.value as FamilyInvitation['role'] }))}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-2">{role.icon}</div>
                                <div className="font-medium mb-1">{role.label}</div>
                                <div className="text-xs text-muted-foreground">{role.description}</div>
                                <div className="mt-2 text-xs">
                                  <strong>Permissions:</strong>
                                  <div className="text-muted-foreground">
                                    {defaultPermissions[role.value]?.length || 0} included
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Personal Message */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Personal Message (Optional)
                        </label>
                        <Textarea
                          value={formData.personalMessage}
                          onChange={(e) => setFormData(prev => ({ ...prev, personalMessage: e.target.value }))}
                          placeholder="Add a personal message to the invitation..."
                          rows={3}
                        />
                      </div>

                      {/* Submit Button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90"
                          disabled={!validateForm() || isSubmitting}
                        >
                          {isSubmitting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                          ) : (
                            '📤 '
                          )}
                          {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {selectedTab === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      ⏳ Pending Invitations ({pendingInvitations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingInvitations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-4">📭</div>
                        <p>No pending invitations</p>
                        <p className="text-sm">Create your first invitation to get started!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingInvitations.map((invitation, index) => (
                          <motion.div
                            key={invitation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="border-2 hover:border-primary/50 transition-all">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="text-2xl">
                                      {relationshipOptions.find(r => r.value === invitation.relationship)?.icon}
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{invitation.recipientName}</h3>
                                      <p className="text-sm text-muted-foreground capitalize">
                                        {invitation.relationship} • {invitation.role.replace('_', ' ')}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {invitation.recipientEmail && `📧 ${invitation.recipientEmail}`}
                                        {invitation.recipientPhone && ` 📱 ${invitation.recipientPhone}`}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="text-center">
                                      <motion.div
                                        className={`w-3 h-3 rounded-full ${getStatusColor(invitation.status)} mb-1`}
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                      />
                                      <div className="text-xs">
                                        {getStatusIcon(invitation.status)} {invitation.status}
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onResendInvitation?.(invitation.id)}
                                        disabled={invitation.resendCount >= 3}
                                      >
                                        📤 Resend
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onViewInvitation?.(invitation.id)}
                                      >
                                        👀 View
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => onCancelInvitation?.(invitation.id)}
                                      >
                                        ❌ Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {invitation.personalMessage && (
                                  <div className="mt-3 p-3 bg-muted rounded-lg">
                                    <p className="text-sm">{invitation.personalMessage}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {selectedTab === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📋 Invitation History ({completedInvitations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {completedInvitations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-4">📝</div>
                        <p>No invitation history yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {completedInvitations.map((invitation, index) => (
                          <motion.div
                            key={invitation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className={`border-2 ${
                              invitation.status === 'accepted' ? 'border-green-200 bg-green-50' :
                              invitation.status === 'declined' ? 'border-red-200 bg-red-50' :
                              'border-yellow-200 bg-yellow-50'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="text-2xl">
                                      {relationshipOptions.find(r => r.value === invitation.relationship)?.icon}
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{invitation.recipientName}</h3>
                                      <p className="text-sm text-muted-foreground capitalize">
                                        {invitation.relationship} • {invitation.role.replace('_', ' ')}
                                      </p>
                                      {invitation.sentDate && (
                                        <p className="text-xs text-muted-foreground">
                                          Sent: {invitation.sentDate.toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-center">
                                    <div className={`text-2xl mb-1 ${
                                      invitation.status === 'accepted' ? 'text-green-600' :
                                      invitation.status === 'declined' ? 'text-red-600' :
                                      'text-yellow-600'
                                    }`}>
                                      {getStatusIcon(invitation.status)}
                                    </div>
                                    <div className="text-xs capitalize font-medium">
                                      {invitation.status}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sofia Guidance */}
        <LiquidMotion.ScaleIn delay={0.5}>
          <motion.div
            className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl px-4 py-3"
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
                ✨ Sofia: "{pendingInvitations.length === 0
                  ? 'Start building your family protection network by inviting your closest family members.'
                  : pendingInvitations.length === 1
                    ? 'Great start! Consider inviting additional emergency contacts for better coverage.'
                    : 'Excellent progress! Your family network is growing stronger with each invitation.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}