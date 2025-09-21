/**
 * Family Member Access Control System
 * Sophisticated access management for video time capsules with granular permissions
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

interface FamilyMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'guardian' | 'extended' | 'friend';
  age?: number;
  isMinor: boolean;
  guardianId?: string; // If minor, who is their guardian
  trustLevel: 'high' | 'medium' | 'low';
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  joinDate: Date;
  lastActive?: Date;
  verificationStatus: 'verified' | 'pending' | 'failed';
  accessHistory: AccessEvent[];
}

interface VideoAccessPermission {
  id: string;
  videoId: string;
  memberId: string;
  permissionLevel: 'view' | 'download' | 'share' | 'edit' | 'admin';
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  conditions: AccessCondition[];
  restrictions: AccessRestriction[];
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  accessWindows?: TimeWindow[];
}

interface AccessCondition {
  id: string;
  type: 'age_requirement' | 'date_range' | 'location' | 'device' | 'time_of_day' | 'guardian_approval' | 'milestone_achieved';
  configuration: {
    minAge?: number;
    maxAge?: number;
    startDate?: Date;
    endDate?: Date;
    allowedLocations?: string[];
    allowedDevices?: string[];
    timeRanges?: Array<{ start: string; end: string }>;
    requiredApprovers?: string[];
    milestoneType?: string;
  };
  isRequired: boolean;
  description: string;
}

interface AccessRestriction {
  id: string;
  type: 'download_limit' | 'view_duration' | 'sharing_disabled' | 'watermark_required' | 'screenshot_blocked' | 'offline_disabled';
  configuration: {
    maxDownloads?: number;
    maxViewDuration?: number; // in minutes
    watermarkText?: string;
    allowScreenshots?: boolean;
    allowOfflineAccess?: boolean;
  };
  description: string;
}

interface TimeWindow {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  daysOfWeek: number[]; // 0-6, Sunday = 0
  timezone: string;
  isActive: boolean;
}

interface AccessEvent {
  id: string;
  memberId: string;
  videoId: string;
  action: 'view' | 'download' | 'share' | 'attempt_blocked' | 'permission_granted' | 'permission_revoked';
  timestamp: Date;
  success: boolean;
  metadata: {
    ipAddress?: string;
    device?: string;
    location?: string;
    duration?: number;
    reason?: string;
  };
}

interface AccessGroup {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  defaultPermissions: VideoAccessPermission['permissionLevel'][];
  defaultConditions: AccessCondition[];
  defaultRestrictions: AccessRestriction[];
  createdAt: Date;
  isActive: boolean;
}

interface FamilyAccessControlProps {
  videoId?: string;
  familyMembers?: FamilyMember[];
  onPermissionGranted?: (permission: VideoAccessPermission) => void;
  onPermissionRevoked?: (permissionId: string) => void;
  onAccessAttempt?: (event: AccessEvent) => void;
  existingPermissions?: VideoAccessPermission[];
}

const relationshipTiers = {
  immediate: ['self', 'spouse', 'child', 'parent'],
  close: ['sibling', 'guardian'],
  extended: ['extended'],
  other: ['friend']
};

const defaultAccessGroups: AccessGroup[] = [
  {
    id: 'immediate_family',
    name: 'Immediate Family',
    description: 'Spouse, children, and parents with full access',
    memberIds: [],
    defaultPermissions: ['view', 'download', 'share'],
    defaultConditions: [],
    defaultRestrictions: [],
    createdAt: new Date(),
    isActive: true
  },
  {
    id: 'minors',
    name: 'Minor Children',
    description: 'Children under 18 with supervised access',
    memberIds: [],
    defaultPermissions: ['view'],
    defaultConditions: [
      {
        id: 'guardian_approval',
        type: 'guardian_approval',
        configuration: { requiredApprovers: [] },
        isRequired: true,
        description: 'Requires guardian approval before access'
      }
    ],
    defaultRestrictions: [
      {
        id: 'no_download',
        type: 'download_limit',
        configuration: { maxDownloads: 0 },
        description: 'Download disabled for minors'
      }
    ],
    createdAt: new Date(),
    isActive: true
  },
  {
    id: 'extended_family',
    name: 'Extended Family',
    description: 'Extended family members with limited access',
    memberIds: [],
    defaultPermissions: ['view'],
    defaultConditions: [],
    defaultRestrictions: [
      {
        id: 'view_limit',
        type: 'view_duration',
        configuration: { maxViewDuration: 30 },
        description: 'Limited to 30 minutes of viewing'
      }
    ],
    createdAt: new Date(),
    isActive: true
  }
];

const permissionLevels = [
  {
    level: 'view',
    label: 'View Only',
    description: 'Can watch the video but cannot download or share',
    icon: '👁️',
    color: 'text-blue-600'
  },
  {
    level: 'download',
    label: 'Download',
    description: 'Can download the video for offline viewing',
    icon: '📥',
    color: 'text-green-600'
  },
  {
    level: 'share',
    label: 'Share',
    description: 'Can share the video with others',
    icon: '🔗',
    color: 'text-purple-600'
  },
  {
    level: 'edit',
    label: 'Edit',
    description: 'Can edit video details and permissions',
    icon: '✏️',
    color: 'text-orange-600'
  },
  {
    level: 'admin',
    label: 'Admin',
    description: 'Full administrative control',
    icon: '👑',
    color: 'text-red-600'
  }
];

export default function FamilyAccessControl({
  videoId,
  familyMembers = [],
  onPermissionGranted,
  onPermissionRevoked,
  onAccessAttempt,
  existingPermissions = []
}: FamilyAccessControlProps) {
  const [activeTab, setActiveTab] = useState<'permissions' | 'groups' | 'conditions' | 'monitoring'>('permissions');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [accessGroups, setAccessGroups] = useState<AccessGroup[]>(defaultAccessGroups);
  const [permissions, setPermissions] = useState<VideoAccessPermission[]>(existingPermissions);
  const [accessEvents, setAccessEvents] = useState<AccessEvent[]>([]);
  const [showPermissionForm, setShowPermissionForm] = useState(false);

  // Permission form state
  const [permissionForm, setPermissionForm] = useState({
    memberId: '',
    permissionLevel: 'view' as VideoAccessPermission['permissionLevel'],
    expiresAt: '',
    maxUsage: '',
    conditions: [] as AccessCondition[],
    restrictions: [] as AccessRestriction[]
  });

  // Initialize Sofia personality for access control guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.professionalUser);

  useEffect(() => {
    adaptToContext('managing');
    loadAccessEvents();
  }, [adaptToContext]);

  const loadAccessEvents = () => {
    // Simulate loading access events
    const mockEvents: AccessEvent[] = [
      {
        id: 'event_1',
        memberId: 'member_1',
        videoId: videoId || 'video_1',
        action: 'view',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        success: true,
        metadata: { device: 'iPhone', duration: 5 }
      },
      {
        id: 'event_2',
        memberId: 'member_2',
        videoId: videoId || 'video_1',
        action: 'attempt_blocked',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        success: false,
        metadata: { reason: 'Access outside allowed time window' }
      }
    ];

    setAccessEvents(mockEvents);
  };

  const getMembersByTier = (tier: keyof typeof relationshipTiers) => {
    return familyMembers.filter(member =>
      relationshipTiers[tier].includes(member.relationship)
    );
  };

  const getPermissionIcon = (level: VideoAccessPermission['permissionLevel']) => {
    const permission = permissionLevels.find(p => p.level === level);
    return permission?.icon || '📋';
  };

  const getPermissionColor = (level: VideoAccessPermission['permissionLevel']) => {
    const permission = permissionLevels.find(p => p.level === level);
    return permission?.color || 'text-gray-600';
  };

  const getTrustLevelColor = (trustLevel: FamilyMember['trustLevel']) => {
    switch (trustLevel) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const canGrantPermission = (member: FamilyMember, permissionLevel: VideoAccessPermission['permissionLevel']): boolean => {
    // Business logic for permission granting
    if (member.isMinor && (permissionLevel === 'download' || permissionLevel === 'share')) {
      return false; // Minors can't download or share by default
    }

    if (member.trustLevel === 'low' && permissionLevel === 'admin') {
      return false; // Low trust members can't have admin access
    }

    if (member.status !== 'active') {
      return false; // Inactive members can't get new permissions
    }

    return true;
  };

  const grantPermission = async () => {
    if (!permissionForm.memberId || !videoId) return;

    const member = familyMembers.find(m => m.id === permissionForm.memberId);
    if (!member || !canGrantPermission(member, permissionForm.permissionLevel)) {
      alert('Cannot grant this permission level to the selected member');
      return;
    }

    const newPermission: VideoAccessPermission = {
      id: `permission_${Date.now()}`,
      videoId,
      memberId: permissionForm.memberId,
      permissionLevel: permissionForm.permissionLevel,
      grantedBy: 'current_user',
      grantedAt: new Date(),
      expiresAt: permissionForm.expiresAt ? new Date(permissionForm.expiresAt) : undefined,
      conditions: permissionForm.conditions,
      restrictions: permissionForm.restrictions,
      isActive: true,
      usageCount: 0,
      maxUsage: permissionForm.maxUsage ? parseInt(permissionForm.maxUsage) : undefined
    };

    setPermissions(prev => [...prev, newPermission]);
    onPermissionGranted?.(newPermission);

    // Log the event
    const accessEvent: AccessEvent = {
      id: `event_${Date.now()}`,
      memberId: permissionForm.memberId,
      videoId,
      action: 'permission_granted',
      timestamp: new Date(),
      success: true,
      metadata: { reason: `Granted ${permissionForm.permissionLevel} permission` }
    };

    setAccessEvents(prev => [accessEvent, ...prev]);

    // Reset form
    setPermissionForm({
      memberId: '',
      permissionLevel: 'view',
      expiresAt: '',
      maxUsage: '',
      conditions: [],
      restrictions: []
    });
    setShowPermissionForm(false);

    learnFromInteraction({
      type: 'permission_granted',
      duration: 1000,
      context: 'managing'
    });
  };

  const revokePermission = (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission) return;

    setPermissions(prev => prev.map(p =>
      p.id === permissionId ? { ...p, isActive: false } : p
    ));

    onPermissionRevoked?.(permissionId);

    // Log the event
    const accessEvent: AccessEvent = {
      id: `event_${Date.now()}`,
      memberId: permission.memberId,
      videoId: permission.videoId,
      action: 'permission_revoked',
      timestamp: new Date(),
      success: true,
      metadata: { reason: 'Permission manually revoked' }
    };

    setAccessEvents(prev => [accessEvent, ...prev]);
  };

  const addCondition = (type: AccessCondition['type']) => {
    const newCondition: AccessCondition = {
      id: `condition_${Date.now()}`,
      type,
      configuration: {},
      isRequired: true,
      description: `${type.replace('_', ' ')} condition`
    };

    setPermissionForm(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const addRestriction = (type: AccessRestriction['type']) => {
    const newRestriction: AccessRestriction = {
      id: `restriction_${Date.now()}`,
      type,
      configuration: {},
      description: `${type.replace('_', ' ')} restriction`
    };

    setPermissionForm(prev => ({
      ...prev,
      restrictions: [...prev.restrictions, newRestriction]
    }));
  };

  const getMemberPermissions = (memberId: string) => {
    return permissions.filter(p => p.memberId === memberId && p.isActive);
  };

  const getHighestPermissionLevel = (memberId: string): VideoAccessPermission['permissionLevel'] | null => {
    const memberPermissions = getMemberPermissions(memberId);
    if (memberPermissions.length === 0) return null;

    const levelHierarchy: VideoAccessPermission['permissionLevel'][] = ['view', 'download', 'share', 'edit', 'admin'];
    const memberLevels = memberPermissions.map(p => p.permissionLevel);

    for (let i = levelHierarchy.length - 1; i >= 0; i--) {
      if (memberLevels.includes(levelHierarchy[i])) {
        return levelHierarchy[i];
      }
    }

    return null;
  };

  const formatLastActive = (date?: Date): string => {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    return 'Recently';
  };

  return (
    <PersonalityAwareAnimation personality={personality} context="managing">
      <div className="w-full space-y-6">
        {/* Header */}
        <LiquidMotion.ScaleIn delay={0.1}>
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                🔐 Family Access Control
                <motion.div
                  className="text-sm px-3 py-1 rounded-full bg-emerald-500 text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Secure Access
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage who can access your video time capsules with sophisticated permission controls and monitoring.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-emerald-600">👥</div>
                  <div className="font-medium">{familyMembers.length}</div>
                  <div className="text-sm text-muted-foreground">Family Members</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-blue-600">🔑</div>
                  <div className="font-medium">{permissions.filter(p => p.isActive).length}</div>
                  <div className="text-sm text-muted-foreground">Active Permissions</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-green-600">✅</div>
                  <div className="font-medium">{familyMembers.filter(m => m.verificationStatus === 'verified').length}</div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-orange-600">📊</div>
                  <div className="font-medium">{accessEvents.filter(e => e.success).length}</div>
                  <div className="text-sm text-muted-foreground">Access Events</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Tab Navigation */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {[
              { key: 'permissions', label: 'Member Permissions', icon: '🔑' },
              { key: 'groups', label: 'Access Groups', icon: '👥' },
              { key: 'conditions', label: 'Access Rules', icon: '📋' },
              { key: 'monitoring', label: 'Activity Monitor', icon: '📊' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>
        </LiquidMotion.ScaleIn>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'permissions' && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Family Members List */}
                <LiquidMotion.ScaleIn delay={0.3}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          👥 Family Members
                        </CardTitle>
                        <Button
                          onClick={() => setShowPermissionForm(true)}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          + Grant Permission
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(relationshipTiers).map(([tier, relationships]) => {
                          const membersInTier = getMembersByTier(tier as keyof typeof relationshipTiers);
                          if (membersInTier.length === 0) return null;

                          return (
                            <div key={tier}>
                              <h3 className="font-medium text-sm text-muted-foreground mb-2 capitalize">
                                {tier.replace('_', ' ')} Family
                              </h3>
                              <div className="space-y-2">
                                {membersInTier.map((member, index) => {
                                  const highestPermission = getHighestPermissionLevel(member.id);

                                  return (
                                    <motion.div
                                      key={member.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                        selectedMember === member.id
                                          ? 'border-emerald-500 bg-emerald-50'
                                          : 'border-border hover:border-emerald-300'
                                      }`}
                                      onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                                            <span className="text-emerald-700 font-medium">
                                              {member.name.charAt(0)}
                                            </span>
                                          </div>
                                          <div>
                                            <h4 className="font-medium">{member.name}</h4>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                              <span className="capitalize">{member.relationship}</span>
                                              {member.isMinor && <span className="text-blue-600">Minor</span>}
                                              <span className={getTrustLevelColor(member.trustLevel)}>
                                                {member.trustLevel} trust
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          {highestPermission ? (
                                            <div className={`text-sm font-medium ${getPermissionColor(highestPermission)}`}>
                                              {getPermissionIcon(highestPermission)} {highestPermission}
                                            </div>
                                          ) : (
                                            <div className="text-sm text-gray-500">No Access</div>
                                          )}
                                          <div className="text-xs text-muted-foreground">
                                            {formatLastActive(member.lastActive)}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Expanded Member Details */}
                                      <AnimatePresence>
                                        {selectedMember === member.id && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-3 pt-3 border-t"
                                          >
                                            <div className="space-y-2">
                                              <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                  <span className="font-medium">Status:</span>
                                                  <span className={`ml-2 capitalize ${
                                                    member.status === 'active' ? 'text-green-600' :
                                                    member.status === 'pending' ? 'text-yellow-600' :
                                                    'text-red-600'
                                                  }`}>
                                                    {member.status}
                                                  </span>
                                                </div>
                                                <div>
                                                  <span className="font-medium">Verified:</span>
                                                  <span className={`ml-2 ${
                                                    member.verificationStatus === 'verified' ? 'text-green-600' :
                                                    member.verificationStatus === 'pending' ? 'text-yellow-600' :
                                                    'text-red-600'
                                                  }`}>
                                                    {member.verificationStatus === 'verified' ? '✅' :
                                                     member.verificationStatus === 'pending' ? '⏳' : '❌'}
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Current Permissions */}
                                              <div>
                                                <div className="font-medium text-sm mb-1">Current Permissions:</div>
                                                <div className="flex flex-wrap gap-1">
                                                  {getMemberPermissions(member.id).map(permission => (
                                                    <span
                                                      key={permission.id}
                                                      className={`px-2 py-1 rounded text-xs ${getPermissionColor(permission.permissionLevel)} bg-opacity-10`}
                                                      style={{ backgroundColor: `${getPermissionColor(permission.permissionLevel).replace('text-', '')}10` }}
                                                    >
                                                      {getPermissionIcon(permission.permissionLevel)} {permission.permissionLevel}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>

                                              {/* Actions */}
                                              <div className="flex gap-2 pt-2">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => {
                                                    setPermissionForm(prev => ({ ...prev, memberId: member.id }));
                                                    setShowPermissionForm(true);
                                                  }}
                                                >
                                                  Edit Access
                                                </Button>
                                                {getMemberPermissions(member.id).length > 0 && (
                                                  <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                      getMemberPermissions(member.id).forEach(p => revokePermission(p.id));
                                                    }}
                                                  >
                                                    Revoke All
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </LiquidMotion.ScaleIn>

                {/* Permission Grant Form */}
                <AnimatePresence>
                  {showPermissionForm && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <LiquidMotion.ScaleIn delay={0.4}>
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                🔑 Grant Permission
                              </CardTitle>
                              <Button
                                variant="ghost"
                                onClick={() => setShowPermissionForm(false)}
                              >
                                ✕
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Family Member *</label>
                                <select
                                  value={permissionForm.memberId}
                                  onChange={(e) => setPermissionForm(prev => ({ ...prev, memberId: e.target.value }))}
                                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                                >
                                  <option value="">Select family member</option>
                                  {familyMembers.map(member => (
                                    <option key={member.id} value={member.id}>
                                      {member.name} ({member.relationship})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Permission Level *</label>
                                <div className="space-y-2">
                                  {permissionLevels.map(level => (
                                    <label
                                      key={level.level}
                                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                        permissionForm.permissionLevel === level.level
                                          ? 'border-emerald-500 bg-emerald-50'
                                          : 'border-border hover:border-emerald-300'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name="permissionLevel"
                                        value={level.level}
                                        checked={permissionForm.permissionLevel === level.level}
                                        onChange={(e) => setPermissionForm(prev => ({ ...prev, permissionLevel: e.target.value as VideoAccessPermission['permissionLevel'] }))}
                                        className="mr-3"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className={`text-lg ${level.color}`}>{level.icon}</span>
                                          <span className="font-medium">{level.label}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{level.description}</p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Expires At</label>
                                  <Input
                                    type="datetime-local"
                                    value={permissionForm.expiresAt}
                                    onChange={(e) => setPermissionForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Usage Limit</label>
                                  <Input
                                    type="number"
                                    value={permissionForm.maxUsage}
                                    onChange={(e) => setPermissionForm(prev => ({ ...prev, maxUsage: e.target.value }))}
                                    placeholder="Unlimited"
                                  />
                                </div>
                              </div>

                              {/* Quick Conditions */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Access Conditions</label>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addCondition('age_requirement')}
                                  >
                                    + Age Requirement
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addCondition('time_of_day')}
                                  >
                                    + Time Window
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addCondition('guardian_approval')}
                                  >
                                    + Guardian Approval
                                  </Button>
                                </div>
                                {permissionForm.conditions.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {permissionForm.conditions.map(condition => (
                                      <div key={condition.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                                        <span>{condition.description}</span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setPermissionForm(prev => ({
                                            ...prev,
                                            conditions: prev.conditions.filter(c => c.id !== condition.id)
                                          }))}
                                        >
                                          ✕
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Quick Restrictions */}
                              <div>
                                <label className="block text-sm font-medium mb-2">Access Restrictions</label>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addRestriction('download_limit')}
                                  >
                                    + Download Limit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addRestriction('view_duration')}
                                  >
                                    + View Duration
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addRestriction('watermark_required')}
                                  >
                                    + Watermark
                                  </Button>
                                </div>
                                {permissionForm.restrictions.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {permissionForm.restrictions.map(restriction => (
                                      <div key={restriction.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                                        <span>{restriction.description}</span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setPermissionForm(prev => ({
                                            ...prev,
                                            restrictions: prev.restrictions.filter(r => r.id !== restriction.id)
                                          }))}
                                        >
                                          ✕
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  onClick={grantPermission}
                                  disabled={!permissionForm.memberId}
                                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                                >
                                  🔑 Grant Permission
                                </Button>
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </LiquidMotion.ScaleIn>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      👥 Access Groups
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {accessGroups.map((group, index) => (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium">{group.name}</h3>
                              <p className="text-sm text-muted-foreground">{group.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {group.memberIds.length} members
                              </div>
                              <div className={`text-xs ${group.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {group.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Default Permissions:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {group.defaultPermissions.map(permission => (
                                  <span
                                    key={permission}
                                    className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs"
                                  >
                                    {getPermissionIcon(permission)} {permission}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Conditions & Restrictions:</span>
                              <div className="text-xs text-muted-foreground mt-1">
                                {group.defaultConditions.length} conditions, {group.defaultRestrictions.length} restrictions
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'conditions' && (
            <motion.div
              key="conditions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📋 Access Rules & Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-4">⚙️</div>
                      <p>Advanced access rules configuration</p>
                      <p className="text-sm">Create sophisticated conditions for video access control</p>
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'monitoring' && (
            <motion.div
              key="monitoring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📊 Activity Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {accessEvents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-4xl mb-4">📊</div>
                          <p>No access events yet</p>
                          <p className="text-sm">Activity will appear here as family members access videos</p>
                        </div>
                      ) : (
                        accessEvents.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`border rounded-lg p-4 ${
                              event.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`text-2xl ${event.success ? 'text-green-600' : 'text-red-600'}`}>
                                  {event.action === 'view' ? '👁️' :
                                   event.action === 'download' ? '📥' :
                                   event.action === 'share' ? '🔗' :
                                   event.action === 'permission_granted' ? '🔑' :
                                   event.action === 'permission_revoked' ? '🚫' :
                                   '⚠️'}
                                </div>
                                <div>
                                  <div className="font-medium capitalize">
                                    {event.action.replace('_', ' ')}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {familyMembers.find(m => m.id === event.memberId)?.name || 'Unknown Member'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-medium ${event.success ? 'text-green-600' : 'text-red-600'}`}>
                                  {event.success ? 'Success' : 'Blocked'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {event.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            {event.metadata.reason && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                Reason: {event.metadata.reason}
                              </div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sofia Guidance */}
        <LiquidMotion.ScaleIn delay={0.5}>
          <motion.div
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-4 py-3"
            animate={{
              boxShadow: [
                '0 0 15px rgba(16, 185, 129, 0.1)',
                '0 0 25px rgba(16, 185, 129, 0.15)',
                '0 0 15px rgba(16, 185, 129, 0.1)',
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
                className="w-2 h-2 bg-emerald-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-emerald-700 text-sm font-medium">
                ✨ Sofia: "{activeTab === 'permissions'
                  ? 'Thoughtful permission management protects your precious memories while ensuring family can access them when appropriate. Consider each person\'s role and needs.'
                  : activeTab === 'groups'
                    ? 'Access groups simplify permission management for similar family members. Set up logical groupings based on relationships and trust levels.'
                    : activeTab === 'monitoring'
                      ? 'Regular monitoring helps you understand how your family accesses these special moments. Look for patterns and adjust permissions accordingly.'
                      : 'Sophisticated access rules ensure your videos reach the right people at the right time. Balance security with accessibility for your family\'s peace of mind.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}