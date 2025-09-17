// Dead Man's Switch Manager - Core emergency detection system
// Migrated from Hollywood project with adaptations for Schwalbe

import React, { useCallback, useEffect, useState } from 'react';
import { logger } from '@schwalbe/shared/lib/logger';
import { motion } from 'framer-motion';
import { EmergencyService } from '@schwalbe/shared';
import type { 
  EmergencyRule, 
  HealthCheckStatus, 
  DeadMansSwitchProps,
  EmergencySystemStatus 
} from '@schwalbe/shared';

// Icons
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  XCircle,
  Zap,
} from 'lucide-react';

export const DeadMansSwitchManager: React.FC<DeadMansSwitchProps> = ({
  className = '',
  personalityMode = 'adaptive',
  onEmergencyTriggered: _onEmergencyTriggered,
  onHealthCheckMissed: _onHealthCheckMissed,
}) => {
  // State
  const [emergencyRules, setEmergencyRules] = useState<EmergencyRule[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheckStatus[]>([]);
  const [switchStatus, setSwitchStatus] = useState<EmergencySystemStatus>('inactive');
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [emergencyService] = useState<EmergencyService | null>(null);

  // Get personality-specific content
  const getPersonalityContent = () => {
    switch (personalityMode) {
      case 'empathetic':
        return {
          title: '💚 Family Care Shield',
          subtitle: "Loving protection that watches over your family when you can't",
          statusActive: 'Your loving protection is active',
          statusInactive: 'Care shield is paused',
          statusPending: 'Checking on your wellbeing',
          statusTriggered: 'Emergency care activated',
          activityButton: "Let your family know you're safe",
          bgGradient: 'from-emerald-50 to-green-50',
          borderColor: 'border-emerald-200',
          accentColor: 'text-emerald-600',
          icon: Heart,
        };
      case 'pragmatic':
        return {
          title: "🛡️ Dead Man's Switch Protocol",
          subtitle: 'Automated emergency detection and response system',
          statusActive: 'System operational - monitoring active',
          statusInactive: 'Protocol disabled',
          statusPending: 'Verification required',
          statusTriggered: 'Emergency protocol activated',
          activityButton: 'Confirm system status',
          bgGradient: 'from-blue-50 to-slate-50',
          borderColor: 'border-blue-200',
          accentColor: 'text-blue-600',
          icon: Shield,
        };
      default:
        return {
          title: '🔐 Family Protection Switch',
          subtitle: 'Intelligent guardian system that protects your legacy',
          statusActive: 'Protection system active',
          statusInactive: 'System standby',
          statusPending: 'Status verification needed',
          statusTriggered: 'Emergency protection engaged',
          activityButton: 'Update protection status',
          bgGradient: 'from-purple-50 to-indigo-50',
          borderColor: 'border-purple-200',
          accentColor: 'text-purple-600',
          icon: Zap,
        };
    }
  };

  const personalityContent = getPersonalityContent();
  const IconComponent = personalityContent.icon;

  // Get status color and message
  const getStatusConfig = () => {
    switch (switchStatus) {
      case 'active':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          message: personalityContent.statusActive,
        };
      case 'inactive':
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          icon: XCircle,
          message: personalityContent.statusInactive,
        };
      case 'pending':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: Clock,
          message: personalityContent.statusPending,
        };
      case 'triggered':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: AlertTriangle,
          message: personalityContent.statusTriggered,
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          icon: XCircle,
          message: 'Status unknown',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Load emergency rules and health check status
  const loadSwitchStatus = useCallback(async () => {
    if (!emergencyService) return;

    try {
      setLoading(true);
      
      // Load emergency detection rules
      const rules = await emergencyService.getEmergencyRules('current-user-id'); // TODO: Get from auth context
      setEmergencyRules(rules);

      // Load recent health checks
      const checks = await emergencyService.getHealthChecks('current-user-id', 10);
      setHealthChecks(checks);

      // Get system status
      const status = await emergencyService.getSystemStatus('current-user-id');
      setSwitchStatus(status);

      // Get shield settings for last activity
      const settings = await emergencyService.getShieldSettings('current-user-id');
      if (settings?.last_activity_check) {
        setLastActivity(new Date(settings.last_activity_check));
      }

      setError(null);
    } catch (err) {
      logger.error("Error loading Dead Man's Switch status:", err);
      setError(
        err instanceof Error ? err.message : 'Failed to load switch status'
      );
    } finally {
      setLoading(false);
    }
  }, [emergencyService]);

  // Record activity to reset the switch
  const recordActivity = useCallback(
    async (activityType: string = 'manual_confirmation') => {
      if (!emergencyService) return;

      try {
        await emergencyService.recordActivity({
          user_id: 'current-user-id', // TODO: Get from auth context
          activity_type: activityType,
          timestamp: new Date().toISOString(),
          metadata: { source: 'dead_mans_switch_manager' },
        });

        setLastActivity(new Date());
        setSwitchStatus('active');

        // Show success message
        logger.info('Activity recorded successfully');
      } catch (err) {
        logger.error('Error recording activity:', err);
      }
    },
    [emergencyService]
  );

  // Toggle emergency rule
  const toggleRule = useCallback(
    async (ruleId: string, enabled: boolean) => {
      if (!emergencyService) return;

      try {
        await emergencyService.updateEmergencyRule(ruleId, { is_enabled: enabled });

        setEmergencyRules(prev =>
          prev.map(rule =>
            rule.id === ruleId ? { ...rule, is_enabled: enabled } : rule
          )
        );

        logger.info(`Emergency rule ${enabled ? 'enabled' : 'disabled'}`);
      } catch (err) {
        logger.error('Error toggling rule:', err);
      }
    },
    [emergencyService]
  );

  // Initialize emergency service (this would be injected via context in real app)
  useEffect(() => {
    // TODO: Initialize with actual Supabase client from context
    // const service = new EmergencyService(supabaseClient);
    // setEmergencyService(service);
  }, []);

  // Load initial data
  useEffect(() => {
    if (emergencyService) {
      loadSwitchStatus();
    }
  }, [emergencyService, loadSwitchStatus]);

  if (loading) {
    return (
      <div
        className={`bg-gradient-to-br ${personalityContent.bgGradient} rounded-xl border ${personalityContent.borderColor} p-6 ${className}`}
      >
        <div className='flex items-center justify-center h-32'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Shield className='w-8 h-8 text-gray-400' />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200 p-6 ${className}`}
      >
        <div className='text-center'>
          <XCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-red-800 mb-2'>
            System Error
          </h3>
          <p className='text-sm text-red-600'>{error}</p>
          <button
            onClick={loadSwitchStatus}
            className='mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-gradient-to-br ${personalityContent.bgGradient} rounded-xl border ${personalityContent.borderColor} shadow-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className='p-6 pb-4'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-start gap-3'>
            <motion.div
              className={`p-2 rounded-lg bg-white/80 backdrop-blur-sm ${personalityContent.accentColor}`}
              whileHover={{ scale: 1.05 }}
            >
              <IconComponent className='w-6 h-6' />
            </motion.div>

            <div>
              <h3 className='text-lg font-semibold text-gray-800 mb-1'>
                {personalityContent.title}
              </h3>
              <p className='text-sm text-gray-600'>
                {personalityContent.subtitle}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}
          >
            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
            <span className={`text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.message}
            </span>
          </div>
        </div>

        {/* Last Activity */}
        {lastActivity && (
          <div className='flex items-center gap-2 text-xs text-gray-500 mb-4'>
            <Clock className='w-3 h-3' />
            <span>
              Last activity: {lastActivity.toLocaleDateString()} at{' '}
              {lastActivity.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Activity Confirmation Button */}
        <motion.button
          onClick={() => recordActivity()}
          className={`w-full bg-white/90 backdrop-blur-sm border border-white/20 text-gray-700 px-4 py-3 rounded-lg hover:bg-white transition-colors text-sm font-medium`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Activity className='w-4 h-4 inline mr-2' />
          {personalityContent.activityButton}
        </motion.button>
      </div>

      {/* Emergency Rules Status */}
      <div className='px-6 pb-4'>
        <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-sm font-medium text-gray-700'>
              {personalityMode === 'empathetic'
                ? 'Care Protocols'
                : personalityMode === 'pragmatic'
                  ? 'Detection Rules'
                  : 'Protection Rules'}
            </h4>
            <span className='text-xs text-gray-500'>
              {emergencyRules.filter(r => r.is_enabled).length}/
              {emergencyRules.length} active
            </span>
          </div>

          <div className='space-y-2'>
            {emergencyRules.slice(0, 3).map(rule => (
              <motion.div
                key={rule.id}
                className='flex items-center justify-between p-2 bg-white/80 rounded-lg'
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className='flex items-center gap-2'>
                  <div
                    className={`w-2 h-2 rounded-full ${rule.is_enabled ? 'bg-green-400' : 'bg-gray-300'}`}
                  />
                  <span className='text-xs text-gray-700'>
                    {rule.rule_name}
                  </span>
                </div>
                <button
                  onClick={() => toggleRule(rule.id, !rule.is_enabled)}
                  className={`text-xs px-2 py-1 rounded ${
                    rule.is_enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {rule.is_enabled ? 'ON' : 'OFF'}
                </button>
              </motion.div>
            ))}
          </div>

          {emergencyRules.length > 3 && (
            <button className='text-xs text-gray-500 hover:text-gray-700 mt-2'>
              View all {emergencyRules.length} rules →
            </button>
          )}
        </div>
      </div>

      {/* Recent Health Checks */}
      {healthChecks.length > 0 && (
        <div className='px-6 pb-6'>
          <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4'>
            <h4 className='text-sm font-medium text-gray-700 mb-3'>
              Recent Activity
            </h4>
            <div className='space-y-2'>
              {healthChecks.slice(0, 3).map(check => (
                <div key={check.id} className='flex items-center gap-2 text-xs'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      check.status === 'responded'
                        ? 'bg-green-400'
                        : check.status === 'missed'
                          ? 'bg-red-400'
                          : 'bg-yellow-400'
                    }`}
                  />
                  <span className='text-gray-600 capitalize'>
                    {check.check_type.replace('_', ' ')}
                  </span>
                  <span className='text-gray-500'>
                    {new Date(check.scheduled_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`ml-auto ${
                      check.status === 'responded'
                        ? 'text-green-600'
                        : check.status === 'missed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {check.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DeadMansSwitchManager;
