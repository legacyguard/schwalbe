import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AssetSummary {
  type: string;
  count: number;
  value?: string;
  icon: string;
}

export function AssetsSummaryCards() {
  // Mock data - in a real implementation, this would come from an API
  const assetSummaries: AssetSummary[] = [
    {
      type: 'Documents',
      count: 12,
      icon: '📄'
    },
    {
      type: 'Financial Accounts',
      count: 3,
      value: '$125,000',
      icon: '💰'
    },
    {
      type: 'Properties',
      count: 2,
      value: '$450,000',
      icon: '🏠'
    },
    {
      type: 'Insurance Policies',
      count: 4,
      icon: '🛡️'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {assetSummaries.map((summary) => (
        <Card key={summary.type} className="bg-slate-900/70 border border-slate-700/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              {summary.type}
            </CardTitle>
            <div className="text-2xl" aria-hidden="true">{summary.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{summary.count}</div>
            {summary.value && (
              <p className="text-xs text-slate-400 mt-1">
                Total value: {summary.value}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}