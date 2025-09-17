'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, FileText, Filter, Calendar, ChevronDown } from 'lucide-react';
import { searchService, SearchResult, SearchOptions } from '@schwalbe/shared/lib/search-service';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';

interface SearchBoxProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  embedded?: boolean;
}

export function SearchBox({
  onResultClick,
  placeholder,
  className = '',
  showFilters = true,
  embedded = false,
}: SearchBoxProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState<SearchOptions>({
    limit: 10,
    documentTypes: [],
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFilterDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: SearchOptions) => {
      if (searchQuery.trim().length < 3) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchService.search(searchQuery, searchFilters);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Get suggestions as user types
  const getSuggestions = useCallback(
    debounce(async (prefix: string) => {
      if (prefix.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const suggestionList = await searchService.getSuggestions(prefix);
        setSuggestions(suggestionList);
      } catch (error) {
        setSuggestions([]);
      }
    }, 200),
    []
  );

  useEffect(() => {
    performSearch(query, filters);
    getSuggestions(query);
  }, [query, filters, performSearch, getSuggestions]);

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      router.push(`/documents/${result.documentId}`);
    }
    setShowResults(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion, filters);
  };

  const toggleDocumentType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      documentTypes: prev.documentTypes?.includes(type)
        ? prev.documentTypes.filter(t => t !== type)
        : [...(prev.documentTypes || []), type],
    }));
  };

  const documentTypes = [
    { id: 'personal', label: t('documents.categories.personal'), icon: '👤' },
    { id: 'financial', label: t('documents.categories.financial'), icon: '💰' },
    { id: 'legal', label: t('documents.categories.legal'), icon: '⚖️' },
    { id: 'medical', label: t('documents.categories.medical'), icon: '🏥' },
    { id: 'property', label: t('documents.categories.property'), icon: '🏠' },
    { id: 'insurance', label: t('documents.categories.insurance'), icon: '🛡️' },
  ];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder || t('common.search')}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search documents"
              onFocus={() => query.length >= 3 && setShowResults(true)}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setShowResults(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {loading && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Filter Button */}
          {showFilters && (
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-2 border rounded-lg hover:bg-gray-50 ${
                filters.documentTypes?.length ? 'border-blue-500 text-blue-600' : 'border-gray-300'
              }`}
              aria-label="Filter results"
            >
              <Filter className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        {showFilterDropdown && showFilters && (
          <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">
                {t('documents.categories.all')}
              </h3>
              <div className="space-y-2">
                {documentTypes.map(type => (
                  <label
                    key={type.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filters.documentTypes?.includes(type.id)}
                      onChange={() => toggleDocumentType(type.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && query.length > 1 && !showResults && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-md border border-gray-200 z-40">
          <div className="p-2">
            <p className="text-xs text-gray-500 px-2 pb-1">Suggestions</p>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className={`absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${
          embedded ? 'max-h-64' : 'max-h-96'
        } overflow-y-auto`}>
          <div className="p-2">
            <p className="text-xs text-gray-500 px-2 pb-2">
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </p>
            {results.map((result) => (
              <button
                key={result.documentId}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {result.documentName}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="capitalize">{result.documentType}</span>
                      <span>•</span>
                      <span>{formatDate(result.createdAt)}</span>
                      {result.fileSize && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(result.fileSize)}</span>
                        </>
                      )}
                    </div>
                    {result.snippet && (
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                        {result.snippet}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {Math.round(result.relevanceScore * 100)}% match
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && query.length >= 3 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="text-center">
            <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No results found for "{query}"</p>
            <p className="text-xs text-gray-500 mt-1">Try different keywords or adjust filters</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBox;