import React from 'react'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

// Stub for future search implementation
export function SearchBox() {
  return (
    <Button
      aria-label="Search"
      className="text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded"
      title="Search (coming soon)"
    >
      <Search className="w-4 h-4" />
    </Button>
  )
}