import React from 'react';
import SofiaConversationSystem from '@/components/sofia-ai/SofiaConversationSystem';

interface OnboardingSofiaPanelProps {
  step: number;
  boxItems?: string;
  trustedName?: string;
}

export default function OnboardingSofiaPanel({ step, boxItems, trustedName }: OnboardingSofiaPanelProps) {
  const initialMessage = (() => {
    if (step === 2 && boxItems && boxItems.trim().length > 0) {
      return "Beautiful choices. Based on what you wrote, I suggest adding at least one emergency contact and a note for your loved ones.";
    }
    if (step === 5 && trustedName && trustedName.trim().length > 0) {
      return `Great. I will remember that ${trustedName} is your trusted person. Next, we will prepare your Path of Peace.`;
    }
    return "I'm here to guide you through this journey. Ask me anything or pick a quick action below.";
  })();

  return (
    <div className="mt-6 border border-slate-700 rounded-lg bg-slate-900/60 p-3">
      <SofiaConversationSystem
        context="onboarding"
        personality="nurturing"
        initialMessage={initialMessage}
      />
    </div>
  );
}