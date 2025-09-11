// Simple Dead Man Switch Demo without external dependencies
// Demonstrates the migrated Dead Man Switch functionality

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface DeadMansSwitchProps {
  className?: string;
  onEmergencyTriggered?: (ruleId: string) => void;
  onHealthCheckMissed?: (checkId: string) => void;
  personalityMode?: 'empathetic' | 'pragmatic' | 'adaptive';
}

const DeadMansSwitchManager: React.FC<DeadMansSwitchProps> = ({
  className = '',
  personalityMode = 'adaptive',
  onEmergencyTriggered,
  onHealthCheckMissed,
}) => {
  const [switchStatus, setSwitchStatus] = useState<'active' | 'inactive' | 'pending' | 'triggered'>('inactive');
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

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
        };
    }
  };

  const personalityContent = getPersonalityContent();

  // Get status color and message
  const getStatusConfig = () => {
    switch (switchStatus) {
      case 'active':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '✅',
          message: personalityContent.statusActive,
        };
      case 'inactive':
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          icon: '❌',
          message: personalityContent.statusInactive,
        };
      case 'pending':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: '⏳',
          message: personalityContent.statusPending,
        };
      case 'triggered':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '🚨',
          message: personalityContent.statusTriggered,
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          icon: '❓',
          message: 'Status unknown',
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Record activity to reset the switch
  const recordActivity = () => {
    setLastActivity(new Date());
    setSwitchStatus('active');
    console.log('Activity recorded successfully');
  };

  // Toggle switch status
  const toggleSwitch = () => {
    if (switchStatus === 'inactive') {
      setSwitchStatus('active');
    } else if (switchStatus === 'active') {
      setSwitchStatus('inactive');
    }
  };

  const recordActivityToSupabase = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session?.user?.id) {
      alert('Please sign in first.');
      return;
    }
    const { error } = await supabase
      .from('user_health_checks')
      .insert({
        user_id: session.user.id,
        check_type: 'manual_confirmation',
        status: 'responded',
        responded_at: new Date().toISOString(),
        response_method: 'demo_button',
        metadata: { source: 'simple_demo' },
      });
    if (error) {
      alert('Failed to record activity: ' + error.message);
    } else {
      alert('Activity recorded via Supabase!');
    }
  };

  return (
    <div
      className={`bg-gradient-to-br ${personalityContent.bgGradient} rounded-xl border ${personalityContent.borderColor} shadow-sm p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-white/80 backdrop-blur-sm ${personalityContent.accentColor}`}>
              <span className="text-2xl">
                {personalityMode === 'empathetic' ? '💚' : personalityMode === 'pragmatic' ? '🛡️' : '🔐'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {personalityContent.title}
              </h3>
              <p className="text-sm text-gray-600">
                {personalityContent.subtitle}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}
          >
            <span className="text-sm">{statusConfig.icon}</span>
            <span className={`text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.message}
            </span>
          </div>
        </div>

        {/* Last Activity */}
        {lastActivity && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <span>🕐</span>
            <span>
              Last activity: {lastActivity.toLocaleDateString()} at{' '}
              {lastActivity.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Activity Confirmation Button */}
        <button
          onClick={recordActivity}
          className={`w-full bg-white/90 backdrop-blur-sm border border-white/20 text-gray-700 px-4 py-3 rounded-lg hover:bg-white transition-colors text-sm font-medium mb-4`}
        >
          <span className="mr-2">📝</span>
          {personalityContent.activityButton}
        </button>

        <button
          onClick={recordActivityToSupabase}
          className={`w-full bg-white/90 backdrop-blur-sm border border-white/20 text-gray-700 px-4 py-2 rounded-lg hover:bg-white transition-colors text-sm font-medium mb-4`}
        >
          ↪️ Record activity to Supabase
        </button>

        {/* Toggle Switch */}
        <button
          onClick={toggleSwitch}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            switchStatus === 'active'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {switchStatus === 'active' ? '🛑 Disable System' : '▶️ Enable System'}
        </button>
      </div>

      {/* System Info */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Migration Status
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Database Schema</span>
            <span className="text-green-600 font-medium">✅ Migrated</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">TypeScript Interfaces</span>
            <span className="text-green-600 font-medium">✅ Migrated</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">React Component</span>
            <span className="text-green-600 font-medium">✅ Migrated</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Edge Functions</span>
            <span className="text-green-600 font-medium">✅ Migrated</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Service Layer</span>
            <span className="text-green-600 font-medium">✅ Migrated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeadMansSwitchDemo: React.FC = () => {
  const [personalityMode, setPersonalityMode] = useState<'empathetic' | 'pragmatic' | 'adaptive'>('adaptive');

  const handleEmergencyTriggered = (ruleId: string) => {
    console.log('Emergency triggered for rule:', ruleId);
    alert(`Emergency protocol activated for rule: ${ruleId}`);
  };

  const handleHealthCheckMissed = (checkId: string) => {
    console.log('Health check missed:', checkId);
    alert(`Health check missed: ${checkId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dead Man Switch System Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Emergency protection system migrated from Hollywood project
          </p>
          
          {/* Personality Mode Selector */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setPersonalityMode('empathetic')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                personalityMode === 'empathetic'
                  ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              💚 Empathetic
            </button>
            <button
              onClick={() => setPersonalityMode('pragmatic')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                personalityMode === 'pragmatic'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              🛡️ Pragmatic
            </button>
            <button
              onClick={() => setPersonalityMode('adaptive')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                personalityMode === 'adaptive'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              🔐 Adaptive
            </button>
          </div>
        </div>

        {/* Dead Man Switch Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Current Mode: {personalityMode.charAt(0).toUpperCase() + personalityMode.slice(1)}
            </h2>
            <DeadMansSwitchManager
              personalityMode={personalityMode}
              onEmergencyTriggered={handleEmergencyTriggered}
              onHealthCheckMissed={handleHealthCheckMissed}
              className="w-full"
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                System Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Multi-layered detection system
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Personality-aware UI modes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Real-time activity monitoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Guardian notification system
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Emergency rule management
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Audit trail and logging
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Next Steps
              </h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Integrate with Supabase client</li>
                <li>• Add authentication context</li>
                <li>• Implement email notifications</li>
                <li>• Add guardian management</li>
                <li>• Test with real data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadMansSwitchDemo;
