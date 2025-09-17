'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { createClientComponentClient } from '@/lib/supabase-client';
import { UserIcon as LucideUserIcon } from 'lucide-react';

export function UserIcon() {
  const supabase = createClientComponentClient();
  const locale = useLocale();
  
  return (
    <Link
      href={`/${locale}/account`}
      className="text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded flex items-center"
      aria-label="Account"
    >
      <LucideUserIcon className="w-5 h-5" />
    </Link>
  );
}