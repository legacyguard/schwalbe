import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: string;
  price: string; // e.g., "$19"
  period?: string; // e.g., "/mo"
  features?: string[];
  highlight?: boolean;
  ctaLabel?: string;
  onSelect?: () => void;
}

export function PricingCard({ plan, price, period = '', features = [], highlight, ctaLabel = 'Choose Plan', onSelect }: PricingCardProps) {
  return (
    <Card className={cn(
      "p-4",
      highlight ? "bg-blue-50 border-blue-200" : "bg-white"
    )}>
      <CardHeader className="p-0 pb-3">
        <h3 className="text-lg font-bold">{plan}</h3>
        <div className="text-2xl font-extrabold">
          {price} <span className="text-sm font-normal text-gray-500">{period}</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="space-y-1.5 mb-3 pl-4">
          {features.map((f, i) => (
            <li key={i} className="text-sm">{f}</li>
          ))}
        </ul>
        <Button
          onClick={onSelect}
          className="w-full"
          variant={highlight ? "default" : "outline"}
        >
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
