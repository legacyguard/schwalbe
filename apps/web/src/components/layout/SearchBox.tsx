import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import i18n from '@/lib/i18n'
import { useNavigate } from 'react-router-dom'

// Privacy note: Do NOT log raw search terms. All queries are sent to an Edge Function
// that hashes tokens server-side with a server-only salt. No plaintext terms are stored.

type SearchResult = {
  id: string
  title: string | null
  file_name: string | null
  category: string | null
  created_at: string
  rank: number
}

type QueryResponse = {
  results: SearchResult[]
}

export function SearchBox() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const locale = useMemo(() => i18n.language || 'en', [])
  const listboxId = 'search-results-listbox'
  const activeId = useMemo(() => (results[highlight] ? `search-option-${results[highlight].id}` : undefined), [results, highlight])

  // Open and focus input
  const openAndFocus = () => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  // Close and reset state
  const close = () => {
    setOpen(false)
    setQuery('')
    setResults([])
    setHighlight(0)
  }

  // Click outside to close
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) {
        close()
      }
    }
    if (open) document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!open) return
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        // Invoke hashed search Edge Function. The function performs server-side hashing
        // with SEARCH_INDEX_SALT and enforces RLS using the caller's auth context.
        const { data, error } = await supabase.functions.invoke('hashed-search-query', {
          body: { q: trimmed, locale, limit: 8 },
        })
        if (!cancelled) {
          if (error) throw error
          const payload = (data || {}) as QueryResponse
          setResults(Array.isArray(payload.results) ? payload.results : [])
        }
      } catch (_e) {
        // Intentionally avoid logging raw terms. Only surface a generic failure.
        // eslint-disable-next-line no-console
        console.error('Search failed')
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, open, locale])

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, Math.max(0, results.length - 1)))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
      return
    }
    if (e.key === 'Enter') {
      if (results[highlight]) {
        navigate(`/documents/${results[highlight].id}`)
        close()
      }
      return
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {!open ? (
        <Button
          aria-label={i18n.t('ui/search.ariaLabel')}
          className="text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded"
          title={i18n.t('ui/search.ariaLabel')}
          onClick={openAndFocus}
        >
          <Search className="w-4 h-4" />
        </Button>
      ) : (
        <div className="w-[280px] lg:w-[360px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              ref={inputRef}
              aria-label={i18n.t('ui/search.ariaLabel')}
              placeholder={i18n.t('ui/search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              aria-controls={listboxId}
              aria-activedescendant={activeId}
              className="pl-9 pr-8 bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-400"
              onBlur={() => {
                // Keep open briefly to allow click selection; click-outside handler closes.
              }}
            />
            {loading ? (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
            ) : null}
          </div>

          {/* Dropdown results */}
          {(loading || results.length > 0 || query.trim().length >= 2) && (
            <div
              role="listbox"
              id={listboxId}
              aria-label={i18n.t('ui/search.resultsAria')}
              className="absolute mt-2 w-[min(90vw,360px)] rounded-md border border-slate-700 bg-slate-900/95 backdrop-blur-sm shadow-xl z-50"
            >
              {results.length === 0 && !loading ? (
                <div className="p-3 text-sm text-slate-400">{i18n.t('ui/search.noResults')}</div>
              ) : (
                <ul className="max-h-80 overflow-auto">
                  {results.map((r, idx) => (
                    <li key={r.id}>
                      <button
                        id={`search-option-${r.id}`}
                        role="option"
                        aria-selected={highlight === idx}
                        onMouseEnter={() => setHighlight(idx)}
                        onClick={() => {
                          navigate(`/documents/${r.id}`)
                          close()
                        }}
                        className={
                          'w-full text-left px-3 py-2 text-sm hover:bg-slate-800 focus:bg-slate-800 ' +
                          (highlight === idx ? 'bg-slate-800 text-white' : 'text-slate-200')
                        }
                      >
                        <div className="font-medium truncate">{r.title || r.file_name || 'Untitled'}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          {r.category ? <span className="capitalize">{r.category}</span> : null}
                          <span className="opacity-60">•</span>
                          <span>{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
