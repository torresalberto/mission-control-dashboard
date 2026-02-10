import { Clock, CheckCircle, AlertCircle, XCircle, Wrench, FileText, MessageCircle } from 'lucide-react'

export interface ActivityItem {
  id: string
  timestamp: string
  type: 'tool-call' | 'file-change' | 'message'
  tool?: string
  file?: string
  status: 'success' | 'error' | 'pending'
  description: string
  details?: string
}

const typeIcons = {
  'tool-call': Wrench,
  'file-change': FileText,
  'message': MessageCircle,
}

const statusColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  pending: 'text-yellow-400',
}

const statusBgColors = {
  success: 'bg-green-500/10',
  error: 'bg-red-500/10',
  pending: 'bg-yellow-500/10',
}

const statusIcons = {
  success: CheckCircle,
  error: XCircle,
  pending: AlertCircle,
}

interface ActivityCardProps {
  item: ActivityItem
}

export default function ActivityCard({ item }: ActivityCardProps) {
  const TypeIcon = typeIcons[item.type]
  const StatusIcon = statusIcons[item.status]
  const timeString = new Date(item.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div className={`p-4 rounded-lg border border-navy-700 bg-navy-800/50 hover:bg-navy-700/50 transition-colors`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full bg-navy-700`}>
            <TypeIcon className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="font-medium text-sm">{item.type.replace('-', ' ').toUpperCase()}</p>
            <p className="text-xs text-gray-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {timeString}
            </p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${item.status === 'pending' ? 'animate-pulse' : ''}`}>
          <StatusIcon className={`h-4 w-4 ${statusColors[item.status]}`} />
          <span className={`text-xs font-medium ${statusColors[item.status]}`}>
            {item.status.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="ml-9">
        <h4 className="text-sm font-medium mb-1">{item.description}</h4>
        {item.tool && (
          <p className="text-xs text-gray-300 mb-1">
            <span className="font-mono bg-navy-700 px-1.5 py-0.5 rounded">{item.tool}</span>
          </p>
        )}
        {item.file && (
          <p className="text-xs text-gray-300 mb-1">
            <span className="font-mono bg-navy-700 px-1.5 py-0.5 rounded">{item.file}</span>
          </p>
        )}
        {item.details && (
          <p className="text-xs text-gray-400">{item.details}</p>
        )}
      </div>
    </div>
  )
}