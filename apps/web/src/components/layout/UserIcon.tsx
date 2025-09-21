import React from 'react'
import { User } from 'lucide-react'

import { Button } from '@/components/ui/button'

// Stub for future user/account menu
export function UserIcon() {
  return (
    <Button
      aria-label="User"
      className="text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded"
      title="User (coming soon)"
    >
      <User className="w-4 h-4" />
    </Button>
  )
}