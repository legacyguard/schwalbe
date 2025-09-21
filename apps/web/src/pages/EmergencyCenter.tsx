import React from 'react';
import EmergencyNotificationEngine from '@/components/emergency/EmergencyNotificationEngine';
import EmergencyContactValidation from '@/components/emergency/EmergencyContactValidation';
import DeadMansSwitchManager from '@/components/emergency/DeadMansSwitchManager';

export default function EmergencyCenter() {
  return (
    <div className="container mx-auto px-4 py-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">Emergency Center</h1>
      <p className="text-slate-300 mb-6">
        Configure Dead Man’s Switch triggers, validate emergency contacts, and test notification workflows.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="text-xl font-medium mb-3">Dead Man's Switch</h2>
          <DeadMansSwitchManager />
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="text-xl font-medium mb-3">Contact Validation</h2>
          <EmergencyContactValidation />
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h2 className="text-xl font-medium mb-3">Notification Engine</h2>
          <EmergencyNotificationEngine />
        </div>
      </div>
    </div>
  );
}