import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import i18n from '@/lib/i18n';
import { useNavigate } from 'react-router-dom';
export function SearchBox() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [highlight, setHighlight] = useState(0);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const locale = useMemo(() => i18n.language || 'en', []);
    const listboxId = 'search-results-listbox';
    const activeId = useMemo(() => (results[highlight] ? `search-option-${results[highlight].id}` : undefined), [results, highlight]);
    // Open and focus input
    const openAndFocus = () => {
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };
    // Close and reset state
    const close = () => {
        setOpen(false);
        setQuery('');
        setResults([]);
        setHighlight(0);
    };
    // Click outside to close
    useEffect(() => {
        function onDocMouseDown(e) {
            if (!wrapperRef.current)
                return;
            if (!wrapperRef.current.contains(e.target)) {
                close();
            }
        }
        if (open)
            document.addEventListener('mousedown', onDocMouseDown);
        return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, [open]);
    // Debounced search
    useEffect(() => {
        if (!open)
            return;
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        const t = setTimeout(async () => {
            try {
                // Invoke hashed search Edge Function. The function performs server-side hashing
                // with SEARCH_INDEX_SALT and enforces RLS using the caller's auth context.
                const { data, error } = await supabase.functions.invoke('hashed-search-query', {
                    body: { q: trimmed, locale, limit: 8 },
                });
                if (!cancelled) {
                    if (error)
                        throw error;
                    const payload = (data || {});
                    setResults(Array.isArray(payload.results) ? payload.results : []);
                }
            }
            catch {
                // Intentionally avoid logging raw terms. Only surface a generic failure.
                console.error('Search failed');
                if (!cancelled)
                    setResults([]);
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [query, open, locale]);
    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            close();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, Math.max(0, results.length - 1)));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(0, h - 1));
            return;
        }
        if (e.key === 'Enter') {
            if (results[highlight]) {
                navigate(`/documents/${results[highlight].id}`);
                close();
            }
            return;
        }
    };
    return (_jsx("div", { ref: wrapperRef, className: "relative", children: !open ? (_jsx(Button, { "aria-label": i18n.t('ui/search.ariaLabel'), className: "text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded", title: i18n.t('ui/search.ariaLabel'), onClick: openAndFocus, children: _jsx(Search, { className: "w-4 h-4" }) })) : (_jsxs("div", { className: "w-[280px] lg:w-[360px]", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" }), _jsx(Input, { ref: inputRef, "aria-label": i18n.t('ui/search.ariaLabel'), placeholder: i18n.t('ui/search.placeholder'), value: query, onChange: (e) => setQuery(e.target.value), onKeyDown: onKeyDown, "aria-controls": listboxId, "aria-activedescendant": activeId, className: "pl-9 pr-8 bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-400", onBlur: () => {
                                // Keep open briefly to allow click selection; click-outside handler closes.
                            } }), loading ? (_jsx(Loader2, { className: "absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" })) : null] }), (loading || results.length > 0 || query.trim().length >= 2) && (_jsx("div", { role: "listbox", id: listboxId, "aria-label": i18n.t('ui/search.resultsAria'), className: "absolute mt-2 w-[min(90vw,360px)] rounded-md border border-slate-700 bg-slate-900/95 backdrop-blur-sm shadow-xl z-50", children: results.length === 0 && !loading ? (_jsx("div", { className: "p-3 text-sm text-slate-400", children: i18n.t('ui/search.noResults') })) : (_jsx("ul", { className: "max-h-80 overflow-auto", children: results.map((r, idx) => (_jsx("li", { children: _jsxs("button", { id: `search-option-${r.id}`, role: "option", "aria-selected": highlight === idx, onMouseEnter: () => setHighlight(idx), onClick: () => {
                                    navigate(`/documents/${r.id}`);
                                    close();
                                }, className: 'w-full text-left px-3 py-2 text-sm hover:bg-slate-800 focus:bg-slate-800 ' +
                                    (highlight === idx ? 'bg-slate-800 text-white' : 'text-slate-200'), children: [_jsx("div", { className: "font-medium truncate", children: r.title || r.file_name || 'Untitled' }), _jsxs("div", { className: "text-xs text-slate-400 flex items-center gap-2", children: [r.category ? _jsx("span", { className: "capitalize", children: r.category }) : null, _jsx("span", { className: "opacity-60", children: "\u2022" }), _jsx("span", { children: new Date(r.created_at).toLocaleDateString() })] })] }) }, r.id))) })) }))] })) }));
}
