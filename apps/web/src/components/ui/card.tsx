import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', ...props }: CardProps) {
  return <div className={`rounded-lg border border-slate-800 bg-slate-900/70 ${className}`.trim()} {...props} />;
}

export function CardHeader({ className = '', ...props }: CardProps) {
  return <div className={`mb-4 ${className}`.trim()} {...props} />;
}

export function CardTitle({ className = '', ...props }: CardProps) {
  return <h2 className={`text-lg font-semibold text-slate-100 ${className}`.trim()} {...props} />;
}

export function CardContent({ className = '', ...props }: CardProps) {
  return <div className={className} {...props} />;
}
