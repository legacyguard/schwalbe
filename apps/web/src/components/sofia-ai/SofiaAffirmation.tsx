import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type AffirmationType = 'onboarding_completed' | 'document_uploaded' | 'guardian_added' | 'will_saved';

interface SofiaAffirmationProps {
  type: AffirmationType;
  className?: string;
  onClose?: () => void;
}

export default function SofiaAffirmation({ type, className = '', onClose }: SofiaAffirmationProps) {
  const { title, message, actions } = getCopy(type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="bg-slate-900/70 border-slate-700">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-700/30 border border-emerald-600/50 flex items-center justify-center text-emerald-300">✓</div>
          <div className="flex-1">
            <div className="text-slate-100 font-medium mb-1">{title}</div>
            <div className="text-slate-300 text-sm leading-relaxed">{message}</div>
            {actions?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {actions.map((a) => (
                  <Button key={a.href + a.label} variant={a.variant || 'outline'} size="sm" onClick={() => (window.location.href = a.href)}>
                    {a.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
          {onClose ? (
            <button aria-label="Close" className="text-slate-400 hover:text-slate-200" onClick={onClose}>×</button>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getCopy(type: AffirmationType) {
  switch (type) {
    case 'onboarding_completed':
      return {
        title: "You're creating safety for your family",
        message:
          "Thank you. This is a thoughtful step. From here, you can strengthen your Family Shield — add a trusted contact or begin a simple will when you feel ready.",
        actions: [
          { href: '/dashboard', label: 'Open Family Shield' },
          { href: '/guardians', label: 'Add a trusted contact', variant: 'outline' as const },
          { href: '/will/wizard/start', label: 'Start simple will', variant: 'outline' as const },
        ],
      };
    case 'document_uploaded':
      return {
        title: 'Safely added',
        message:
          "This helps your loved ones find what matters if they ever need it. You can add a reminder for renewals or connect a trusted contact.",
        actions: [
          { href: '/reminders', label: 'View reminders' },
          { href: '/guardians', label: 'Add trusted contact', variant: 'outline' as const },
        ],
      };
    case 'guardian_added':
      return {
        title: 'Someone you trust is now by your side',
        message:
          "You’ve invited support. If life takes an unexpected turn, there will be someone who can step in with care.",
        actions: [
          { href: '/documents', label: 'Organize important documents' },
          { href: '/will/wizard/start', label: 'Begin a will', variant: 'outline' as const },
        ],
      };
    case 'will_saved':
      return {
        title: 'A quiet act of love',
        message:
          "Your will draft is saved. Take your time. When you’re ready, we can review it together to make sure it reflects your wishes.",
        actions: [
          { href: '/will/wizard/review', label: 'Review draft' },
          { href: '/professional', label: 'Get a professional review', variant: 'outline' as const },
        ],
      };
  }
}