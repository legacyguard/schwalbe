/**
 * Real-Time Family Member Status Updates
 * Provides live status monitoring and updates for family members
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import { PersonalityAwareAnimation } from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';

interface FamilyMemberStatus {
  id: string;
  name: string;
  relationship: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'emergency' | 'unreachable';
  lastSeen: Date;
  location?: {
    type: 'home' | 'work' | 'travel' | 'unknown';
    description: string;
    coordinates?: { lat: number; lng: number };
    accuracy?: number;
  };
  healthCheck: {
    lastCheck: Date;
    nextScheduled: Date;
    frequency: 'daily' | 'weekly' | 'monthly';
    status: 'current' | 'overdue' | 'missed';
    streak: number;
  };
  deviceInfo: {
    type: 'mobile' | 'desktop' | 'tablet';
    battery?: number;
    connectivity: 'wifi' | 'cellular' | 'offline';
    lastHeartbeat: Date;
  };
  emergencyStatus: {
    isEmergencyContact: boolean;
    isReachable: boolean;
    lastEmergencyDrill: Date;
    responseTime: number; // in minutes
  };
  activityLog: StatusUpdate[];
}

interface StatusUpdate {
  id: string;
  timestamp: Date;
  type: 'status_change' | 'location_update' | 'health_check' | 'emergency_alert' | 'device_update';
  oldValue?: string;
  newValue: string;
  details?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface RealTimeFamilyStatusProps {
  familyMembers?: FamilyMemberStatus[];
  onStatusUpdate?: (memberId: string, status: Partial<FamilyMemberStatus>) => void;
  onSendHealthCheck?: (memberId: string) => Promise<void>;
  onTriggerEmergencyAlert?: (memberId: string) => Promise<void>;
  onUpdateLocation?: (memberId: string, location: FamilyMemberStatus['location']) => Promise<void>;
  isRealTimeEnabled?: boolean;
  onToggleRealTime?: (enabled: boolean) => void;
}

const statusConfig = {
  online: { color: 'bg-green-500', icon: '🟢', label: 'Online', description: 'Active and reachable' },
  offline: { color: 'bg-gray-500', icon: '⚫', label: 'Offline', description: 'Not currently connected' },
  away: { color: 'bg-yellow-500', icon: '🟡', label: 'Away', description: 'Connected but inactive' },
  emergency: { color: 'bg-red-500', icon: '🔴', label: 'Emergency', description: 'Emergency status active' },
  unreachable: { color: 'bg-red-700', icon: '❌', label: 'Unreachable', description: 'Cannot be contacted' }
};

const locationTypes = {
  home: { icon: '🏠', label: 'Home' },
  work: { icon: '🏢', label: 'Work' },
  travel: { icon: '✈️', label: 'Traveling' },
  unknown: { icon: '❓', label: 'Unknown' }
};

const healthCheckStatus = {
  current: { color: 'text-green-600', icon: '✅', label: 'Current' },
  overdue: { color: 'text-yellow-600', icon: '⚠️', label: 'Overdue' },
  missed: { color: 'text-red-600', icon: '❌', label: 'Missed' }
};

export default function RealTimeFamilyStatus({
  familyMembers = [],
  onStatusUpdate,
  onSendHealthCheck,
  onTriggerEmergencyAlert,
  onUpdateLocation,
  isRealTimeEnabled = true,
  onToggleRealTime
}: RealTimeFamilyStatusProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');

  // Initialize Sofia personality for family monitoring
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.nurturingUser);

  useEffect(() => {
    adaptToContext('monitoring');
  }, [adaptToContext]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate random status updates
      if (Math.random() < 0.1 && familyMembers.length > 0) {
        const randomMember = familyMembers[Math.floor(Math.random() * familyMembers.length)];
        learnFromInteraction({
          type: 'status_update',
          duration: 100,
          context: 'monitoring'
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, familyMembers, learnFromInteraction]);

  const getStatusInfo = (status: FamilyMemberStatus['status']) => statusConfig[status];

  const getTimeSinceLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getHealthCheckColor = (healthCheck: FamilyMemberStatus['healthCheck']) => {
    const now = new Date();
    const overdue = now > healthCheck.nextScheduled;
    const missed = now.getTime() - healthCheck.lastCheck.getTime() > 24 * 60 * 60 * 1000; // 24 hours

    if (missed) return healthCheckStatus.missed;
    if (overdue) return healthCheckStatus.overdue;
    return healthCheckStatus.current;
  };

  const filteredMembers = familyMembers.filter(member => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'emergency') return member.status === 'emergency' || member.emergencyStatus.isEmergencyContact;
    if (filterStatus === 'offline') return member.status === 'offline' || member.status === 'unreachable';
    return member.status === filterStatus;
  });

  const emergencyMembers = familyMembers.filter(m => m.status === 'emergency');
  const offlineMembers = familyMembers.filter(m => m.status === 'offline' || m.status === 'unreachable');
  const overdueHealthChecks = familyMembers.filter(m => getHealthCheckColor(m.healthCheck).label === 'Overdue' || getHealthCheckColor(m.healthCheck).label === 'Missed');

  return (
    <PersonalityAwareAnimation personality={personality} context="monitoring">
      <div className="w-full space-y-6">
        {/* Header & Status Overview */}
        <LiquidMotion.ScaleIn delay={0.1}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  🔄 Real-Time Family Status
                  <motion.div
                    className={`w-3 h-3 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500' :
                      connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    animate={connectionStatus === 'connected' ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </CardTitle>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Real-time updates:</span>
                  <Button
                    size="sm"
                    variant={isRealTimeEnabled ? "default" : "outline"}
                    onClick={() => onToggleRealTime?.(!isRealTimeEnabled)}
                  >
                    {isRealTimeEnabled ? '🔄 ON' : '⏸️ OFF'}
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground">
                Monitor your family members' status in real-time. Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            </CardHeader>
            <CardContent>
              {/* Alert Summary */}
              {(emergencyMembers.length > 0 || offlineMembers.length > 0 || overdueHealthChecks.length > 0) && (
                <motion.div
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-600">⚠️</span>
                    <h3 className="font-medium text-red-800">Attention Required</h3>
                  </div>
                  <div className="text-sm text-red-700 space-y-1">
                    {emergencyMembers.length > 0 && (
                      <p>🚨 {emergencyMembers.length} emergency status active</p>
                    )}
                    {offlineMembers.length > 0 && (
                      <p>📵 {offlineMembers.length} members unreachable</p>
                    )}
                    {overdueHealthChecks.length > 0 && (
                      <p>💓 {overdueHealthChecks.length} overdue health checks</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const count = familyMembers.filter(m => m.status === status).length;
                  return (
                    <motion.div
                      key={status}
                      className={`text-center p-3 rounded-lg cursor-pointer transition-all ${
                        filterStatus === status ? 'bg-primary/20 border-primary' : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-2xl">{config.icon}</div>
                      <div className="font-medium">{count}</div>
                      <div className="text-xs text-muted-foreground">{config.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* View Controls */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-muted rounded-lg p-1">
              {[
                { key: 'grid', label: 'Grid View', icon: '📋' },
                { key: 'list', label: 'List View', icon: '📄' },
                { key: 'timeline', label: 'Timeline', icon: '⏰' }
              ].map((view) => (
                <Button
                  key={view.key}
                  variant={activeView === view.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView(view.key as typeof activeView)}
                >
                  <span className="mr-1">{view.icon}</span>
                  {view.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border border-border rounded-md bg-background text-sm"
              >
                <option value="all">All Members</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="emergency">Emergency</option>
                <option value="away">Away</option>
              </select>
            </div>
          </div>
        </LiquidMotion.ScaleIn>

        {/* Family Status Content */}
        <AnimatePresence mode="wait">
          {activeView === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMembers.map((member, index) => {
                    const statusInfo = getStatusInfo(member.status);
                    const healthCheckInfo = getHealthCheckColor(member.healthCheck);

                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`cursor-pointer border-2 transition-all ${
                          selectedMember === member.id
                            ? 'border-primary shadow-lg'
                            : 'border-border hover:border-primary/50'
                        } ${member.status === 'emergency' ? 'animate-pulse border-red-500' : ''}`}
                        onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center text-xl">
                                  {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
                                  ) : (
                                    '👤'
                                  )}
                                </div>
                                <motion.div
                                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusInfo.color}`}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              </div>

                              <div className="flex-1">
                                <h3 className="font-medium">{member.name}</h3>
                                <p className="text-sm text-muted-foreground capitalize">{member.relationship}</p>
                                <p className="text-xs text-muted-foreground">
                                  {getTimeSinceLastSeen(member.lastSeen)}
                                </p>
                              </div>

                              <div className="text-right">
                                <div className={`text-xs px-2 py-1 rounded ${statusInfo.color} text-white`}>
                                  {statusInfo.label}
                                </div>
                                {member.location && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {locationTypes[member.location.type].icon} {member.location.type}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Health Check Status */}
                            <div className="flex items-center justify-between text-sm mb-3">
                              <span>Health Check:</span>
                              <span className={`flex items-center gap-1 ${healthCheckInfo.color}`}>
                                {healthCheckInfo.icon} {healthCheckInfo.label}
                                <span className="text-muted-foreground">({member.healthCheck.streak} streak)</span>
                              </span>
                            </div>

                            {/* Device Info */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <span>
                                {member.deviceInfo.type === 'mobile' ? '📱' :
                                 member.deviceInfo.type === 'desktop' ? '🖥️' : '📱'} {member.deviceInfo.connectivity}
                              </span>
                              {member.deviceInfo.battery && (
                                <span>🔋 {member.deviceInfo.battery}%</span>
                              )}
                            </div>

                            {/* Emergency Contact Status */}
                            {member.emergencyStatus.isEmergencyContact && (
                              <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded mb-3">
                                🚨 Emergency Contact • {member.emergencyStatus.responseTime}min avg
                              </div>
                            )}

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {selectedMember === member.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="border-t pt-3 space-y-2"
                                >
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSendHealthCheck?.(member.id);
                                      }}
                                    >
                                      💓 Health Check
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={member.status === 'emergency' ? "destructive" : "outline"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTriggerEmergencyAlert?.(member.id);
                                      }}
                                    >
                                      {member.status === 'emergency' ? '🔴 Active' : '🚨 Alert'}
                                    </Button>
                                  </div>

                                  {/* Recent Activity */}
                                  <div className="text-xs">
                                    <div className="font-medium mb-1">Recent Activity:</div>
                                    {member.activityLog.slice(-3).map(activity => (
                                      <div key={activity.id} className="text-muted-foreground">
                                        {activity.timestamp.toLocaleTimeString()}: {activity.newValue}
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeView === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardContent className="p-0">
                    <div className="space-y-0">
                      {filteredMembers.map((member, index) => {
                        const statusInfo = getStatusInfo(member.status);
                        const healthCheckInfo = getHealthCheckColor(member.healthCheck);

                        return (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center p-4 border-b last:border-b-0 hover:bg-muted/50 transition-all ${
                              member.status === 'emergency' ? 'bg-red-50 border-red-200' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                  {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                                  ) : (
                                    '👤'
                                  )}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${statusInfo.color}`} />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{member.name}</h3>
                                  <span className="text-sm text-muted-foreground capitalize">({member.relationship})</span>
                                  {member.emergencyStatus.isEmergencyContact && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Emergency Contact</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{statusInfo.label}</span>
                                  <span>Last seen: {getTimeSinceLastSeen(member.lastSeen)}</span>
                                  {member.location && (
                                    <span>{locationTypes[member.location.type].icon} {member.location.type}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className={`text-xs ${healthCheckInfo.color}`}>
                                    {healthCheckInfo.icon} Health
                                  </div>
                                  <div className="text-xs text-muted-foreground">{member.healthCheck.streak} streak</div>
                                </div>

                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground">Device</div>
                                  <div className="text-xs">
                                    {member.deviceInfo.type === 'mobile' ? '📱' :
                                     member.deviceInfo.type === 'desktop' ? '🖥️' : '📱'}
                                    {member.deviceInfo.battery && ` ${member.deviceInfo.battery}%`}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onSendHealthCheck?.(member.id)}
                                  >
                                    💓
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={member.status === 'emergency' ? "destructive" : "outline"}
                                    onClick={() => onTriggerEmergencyAlert?.(member.id)}
                                  >
                                    🚨
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeView === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {familyMembers
                        .flatMap(member =>
                          member.activityLog.slice(-3).map(activity => ({
                            ...activity,
                            memberName: member.name,
                            memberId: member.id
                          }))
                        )
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .slice(0, 10)
                        .map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-3 border-l-4 border-primary/20 bg-muted/50 rounded-r-lg"
                          >
                            <div className="text-2xl">
                              {activity.type === 'status_change' ? '🔄' :
                               activity.type === 'location_update' ? '📍' :
                               activity.type === 'health_check' ? '💓' :
                               activity.type === 'emergency_alert' ? '🚨' :
                               '📱'}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{activity.memberName}</div>
                              <div className="text-sm text-muted-foreground">
                                {activity.newValue}
                                {activity.details && ` • ${activity.details}`}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {activity.timestamp.toLocaleTimeString()}
                            </div>
                          </motion.div>
                        ))}
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
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3"
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
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-blue-700 text-sm font-medium">
                ✨ Sofia: "{emergencyMembers.length > 0
                  ? 'Emergency status detected! Check on family members immediately and consider triggering emergency protocols.'
                  : offlineMembers.length > 2
                    ? 'Multiple family members are offline. Consider checking their last known locations and reaching out.'
                    : overdueHealthChecks.length > 0
                      ? 'Some health checks are overdue. Send gentle reminders to maintain family safety habits.'
                      : 'Your family network is well-connected! All members are reachable and status is current.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}