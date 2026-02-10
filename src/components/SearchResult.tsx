import { FileText, Search, Calendar, MessageCircle } from 'lucide-react'

export interface SearchResult {
  id: string
  type: 'memory' | 'document' | 'task'
  title: string
  snippet: string
  lastModified: Date
  score: number
  path?: string
  meta?: Record<string, any>
}

interface SearchResultCardProps {
  result: SearchResult
  query: string
  onClick?: () => void
}

function highlightQuery(text: string, query: string) {
  if (!query || !text) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-orange-200 text-orange-800 font-semibold px-1 rounded">$1</mark>')
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

const typeIcons = {
  memory: MessageCircle,
  document: FileText,
  task: Calendar,
}

const typeColors = {
  memory: 'text-blue-400',
  document: 'text-green-400',
  task: 'text-orange-400',
}

const typeBgColors = {
  memory: 'bg-blue-500/10',
  document: 'bg-green-500/10',
  task: 'bg-orange-500/10',
}

export default function SearchResultCard({ result, query, onClick }: SearchResultCardProps) {
  const TypeIcon = typeIcons[result.type]
  
  return (
    <div 
      className="p-4 rounded-lg border border-navy-700 bg-navy-800/50 hover:bg-navy-700/50 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${typeBgColors[result.type]}`}>
            <TypeIcon className={`h-4 w-4 ${typeColors[result.type]}`} />
          </div>
          <div>
            <h4 className="font-medium text-white hover:text-orange-400 transition-colors mb-1">
              {result.title}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className="capitalize">{result.type}</span>
              {result.path && (
                <>
                  <span>•</span>
                  <span className="font-mono text-xs">{result.path}</span>
                </>
              )}
              <span>•</span>
              <span>{formatDate(result.lastModified)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-400">{Math.round(result.score * 100)}%</span>
          <div 
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: result.score >= 0.8 ? '#10b981' : result.score >= 0.6 ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>
      </div>
      
      {result.snippet && (
        <div className="ml-10">
          <p 
            className="text-sm text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: highlightQuery(result.snippet, query) 
            }}
          />
        </div>
      )}
      
      {result.meta && Object.keys(result.meta).length > 0 && (
        <div className="ml-10 mt-2 flex flex-wrap gap-1.5">
          {Object.entries(result.meta).slice(0, 3).map(([key, value]) => (
            <span key={key} className="text-xs bg-navy-700 text-gray-300 px-2 py-0.5 rounded">
              {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}