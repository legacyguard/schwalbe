import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Simple Dead Man Switch Demo without external dependencies
// Demonstrates the migrated Dead Man Switch functionality
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
const DeadMansSwitchManager = ({ className = '', personalityMode = 'adaptive', onEmergencyTriggered: _onEmergencyTriggered, onHealthCheckMissed: _onHealthCheckMissed, }) => {
    const [switchStatus, setSwitchStatus] = useState('inactive');
    const [lastActivity, setLastActivity] = useState(null);
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
        }
        else if (switchStatus === 'active') {
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
        }
        else {
            alert('Activity recorded via Supabase!');
        }
    };
    return (_jsxs("div", { className: `bg-gradient-to-br ${personalityContent.bgGradient} rounded-xl border ${personalityContent.borderColor} shadow-sm p-6 ${className}`, children: [_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `p-2 rounded-lg bg-white/80 backdrop-blur-sm ${personalityContent.accentColor}`, children: _jsx("span", { className: "text-2xl", children: personalityMode === 'empathetic' ? '💚' : personalityMode === 'pragmatic' ? '🛡️' : '🔐' }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-1", children: personalityContent.title }), _jsx("p", { className: "text-sm text-gray-600", children: personalityContent.subtitle })] })] }), _jsxs("div", { className: `flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`, children: [_jsx("span", { className: "text-sm", children: statusConfig.icon }), _jsx("span", { className: `text-xs font-medium ${statusConfig.color}`, children: statusConfig.message })] })] }), lastActivity && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 mb-4", children: [_jsx("span", { children: "\uD83D\uDD50" }), _jsxs("span", { children: ["Last activity: ", lastActivity.toLocaleDateString(), " at", ' ', lastActivity.toLocaleTimeString()] })] })), _jsxs("button", { onClick: recordActivity, className: `w-full bg-white/90 backdrop-blur-sm border border-white/20 text-gray-700 px-4 py-3 rounded-lg hover:bg-white transition-colors text-sm font-medium mb-4`, children: [_jsx("span", { className: "mr-2", children: "\uD83D\uDCDD" }), personalityContent.activityButton] }), _jsx("button", { onClick: recordActivityToSupabase, className: `w-full bg-white/90 backdrop-blur-sm border border-white/20 text-gray-700 px-4 py-2 rounded-lg hover:bg-white transition-colors text-sm font-medium mb-4`, children: "\u21AA\uFE0F Record activity to Supabase" }), _jsx("button", { onClick: toggleSwitch, className: `w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${switchStatus === 'active'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'}`, children: switchStatus === 'active' ? '🛑 Disable System' : '▶️ Enable System' })] }), _jsxs("div", { className: "bg-white/60 backdrop-blur-sm rounded-lg p-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "Migration Status" }), _jsxs("div", { className: "space-y-2 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Database Schema" }), _jsx("span", { className: "text-green-600 font-medium", children: "\u2705 Migrated" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-600", children: "TypeScript Interfaces" }), _jsx("span", { className: "text-green-600 font-medium", children: "\u2705 Migrated" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-600", children: "React Component" }), _jsx("span", { className: "text-green-600 font-medium", children: "\u2705 Migrated" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Edge Functions" }), _jsx("span", { className: "text-green-600 font-medium", children: "\u2705 Migrated" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Service Layer" }), _jsx("span", { className: "text-green-600 font-medium", children: "\u2705 Migrated" })] })] })] })] }));
};
const DeadMansSwitchDemo = () => {
    const [personalityMode, setPersonalityMode] = useState('adaptive');
    const handleEmergencyTriggered = (ruleId) => {
        console.log('Emergency triggered for rule:', ruleId);
        alert(`Emergency protocol activated for rule: ${ruleId}`);
    };
    const handleHealthCheckMissed = (checkId) => {
        console.log('Health check missed:', checkId);
        alert(`Health check missed: ${checkId}`);
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Dead Man Switch System Demo" }), _jsx("p", { className: "text-lg text-gray-600 mb-6", children: "Emergency protection system migrated from Hollywood project" }), _jsxs("div", { className: "flex justify-center gap-4 mb-8", children: [_jsx("button", { onClick: () => setPersonalityMode('empathetic'), className: `px-4 py-2 rounded-lg transition-colors ${personalityMode === 'empathetic'
                                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`, children: "\uD83D\uDC9A Empathetic" }), _jsx("button", { onClick: () => setPersonalityMode('pragmatic'), className: `px-4 py-2 rounded-lg transition-colors ${personalityMode === 'pragmatic'
                                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`, children: "\uD83D\uDEE1\uFE0F Pragmatic" }), _jsx("button", { onClick: () => setPersonalityMode('adaptive'), className: `px-4 py-2 rounded-lg transition-colors ${personalityMode === 'adaptive'
                                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`, children: "\uD83D\uDD10 Adaptive" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: ["Current Mode: ", personalityMode.charAt(0).toUpperCase() + personalityMode.slice(1)] }), _jsx(DeadMansSwitchManager, { personalityMode: personalityMode, onEmergencyTriggered: handleEmergencyTriggered, onHealthCheckMissed: handleHealthCheckMissed, className: "w-full" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg p-6 shadow-sm border", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "System Features" }), _jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 bg-green-400 rounded-full" }), "Multi-layered detection system"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 bg-green-400 rounded-full" }), "Personality-aware UI modes"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 bg-green-400 rounded-full" }), "Real-time activity monitoring"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 bg-green-400 rounded-full" }), "Guardian notification system"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 bg-green-400 rounded-full" }), "Emergency rule management"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 bg-green-400 rounded-full" }), "Audit trail and logging"] })] })] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-6 border border-blue-200", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-800 mb-2", children: "Next Steps" }), _jsxs("ul", { className: "space-y-1 text-sm text-blue-700", children: [_jsx("li", { children: "\u2022 Integrate with Supabase client" }), _jsx("li", { children: "\u2022 Add authentication context" }), _jsx("li", { children: "\u2022 Implement email notifications" }), _jsx("li", { children: "\u2022 Add guardian management" }), _jsx("li", { children: "\u2022 Test with real data" })] })] })] })] })] }) }));
};
export default DeadMansSwitchDemo;
