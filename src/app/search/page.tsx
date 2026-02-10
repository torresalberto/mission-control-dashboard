'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, FileText, Clock, ArrowRight } from 'lucide-react'

interface SearchResult {
  id: string
  source_path: string
  source_type: 'memory' | 'document' | 'task'
  content: string
  modified_date: string
  snippet: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      
      const mapped = data.results.map((row: any, i: number) => ({
        id: String(i),
        source_path: row.source_path || row.filePath || 'unknown',
        source_type: row.source_type || 'document',
        content: row.content || '',
        modified_date: row.modified_date || new Date().toISOString(),
        snippet: row.snippet || row.content?.substring(0, 200) || ''
      }))
      
      setResults(mapped)
    } catch (err) {
      console.error('Search failed:', err)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'memory':
        return <Clock className="h-4 w-4 text-blue-400" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'memory':
        return 'Memory'
      case 'task':
        return 'Task'
      default:
        return 'Document'
    }
  }

  const fileName = (path: string) => {
    return path.split('/').pop() || path
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold mb-4">Global Search</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search memories, documents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!hasSearched && (
            <div className="text-center py-12">
              <p className="text-gray-400">Start typing to search...</p>
              <p className="text-sm text-gray-500 mt-2">13,314 words indexed</p>
            </div>
          )}

          {isSearching && (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {!isSearching && hasSearched && query.trim() && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No results for &quot;{query}&quot;</p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{results.length} results</p>
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getTypeIcon(result.source_type)}
                        <span className="text-xs font-medium text-gray-500">
                          {getTypeLabel(result.source_type)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400">
                          {fileName(result.source_path)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {result.snippet}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
