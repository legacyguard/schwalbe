"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function AssistantPanel() {
  const search = useSearchParams();
  const intent = search?.get('intent') || '';
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6" data-testid="assistant-panel">
      <div className="text-slate-300">
        {intent ? (
          <span>Assistant is getting ready to help with: <span className="text-white font-medium">{intent}</span></span>
        ) : (
          <span>Assistant is getting ready…</span>
        )}
      </div>
    </div>
  );
}
