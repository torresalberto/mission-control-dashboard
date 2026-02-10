"use client"

import { useState, useEffect } from 'react'

interface ActivityItem {
  id: string
  type: 'director' | 'agent'
  agent: string
  action: string
  description: string
  status: 'running' | 'completed' | 'error' | 'pending'
  timestamp: string
  display_time: string
  duration?: string
}

interface ActivityResponse {
  activities: ActivityItem[]
  summary: {
    director_actions: number
    agent_actions: number
    total_duration: string
    last_update: string
  }
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<'all' | 'director' | 'agent'>('all')
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simple fetch function using static JSON
  async function fetchActivities() {
    try {
      setLoading(true)
      setError(null)
      
      // Try static file first (works on Vercel)
      let response
      try {
        response = await fetch('/activity.json?v=' + Date.now())
      } catch {
        // Fallback to development data
        response = { activities: [] }
      }
      
      let data: ActivityResponse
      
      if (response.ok) {
        data = await response.json()
      } else {
        // Use mock data for development
        data = {
          activities: [
            {
              id: 'mock_1',
              type: 'director',
              agent: 'Director',
              action: 'Task Analysis',
              description: 'Breaking into micro-tasks: generate static activity feed',
              status: 'completed',
              timestamp: new Date().toISOString(),
              display_time: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', minute: '2-digit',
                hour12: false 
              }),
              duration: '3s'
            },
            {
              id: 'mock_2',
              type: 'agent',
              agent: 'K2.5-Think',
              action: 'Architecture Design',
              description: 'Designing simple static file approach for Vercel',
              status: 'completed',
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              display_time: '10:25',
              duration: '2m 15s'
            }
          ],
          summary: {
            director_actions: 1,
            agent_actions: 1,
            total_duration: '2m 18s',
            last_update: new Date().toLocaleTimeString()
          }
        }
      }
      
      setActivities(data.activities)
    } catch (err) {
      console.error('Failed to load activities:', err)
      setError('Unable to load activity feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
    
    // Auto-refresh every 10 seconds - no rate limit risk with static files
    const interval = setInterval(fetchActivities, 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'running': return 'text-blue-400'
      case 'error': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10'
      case 'running': return 'bg-blue-500/10'
      case 'error': return 'bg-red-500/10'
      case 'pending': return 'bg-yellow-500/10'
      default: return 'bg-gray-500/10'
    }
  }

  return (
    <div className="h-full overflow-hidden bg-navy-900">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-navy-700 px-6 py-4 bg-navy-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center">
                Activity Monitor
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({activities.length} activities)
                </span>
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Tracking Director decisions and agent executions
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Auto-refreshing</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-navy-700 px-6 py-3 bg-navy-800/50">
          <div className="flex space-x-2">
            {(['all', 'director', 'agent'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-navy-600/50 text-gray-300 hover:bg-navy-500/50'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                ({activities.filter(a => a.type === type || type === 'all').length})
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && !activities.length ? (
            <div className="text-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-400 mt-4 text-sm">Initializing activity monitor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-300">
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No activities to display</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const isDirector = activity.type === 'director'
  
  return (
    <div className={`p-3 rounded-lg border ${
      isDirector 
        ? 'border-blue-500/20 bg-blue-500/5' 
        : 'border-navy-600/50 bg-navy-800/50'
    } hover:bg-navy-700/30 transition-colors`}>
      
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {/* Agent/Director indicator */}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            isDirector 
              ? 'bg-blue-600 text-white' 
              : 'bg-green-600 text-white'
          }`}>
            {isDirector ? 'D' : 'A'}
          </div>
          
          <div>
            <p className={`font-medium text-sm ${
              isDirector ? 'text-blue-300' : 'text-green-300'
            }`}>
              {activity.agent}
            </p>
            <p className="text-xs text-gray-400 flex items-center">
              {activity.display_time}
            </p>
          </div>
        </div>
        
        <div className={`text-xs font-medium px-2 py-1 rounded ${
          activity.status === 'completed' 
            ? 'text-green-300 bg-green-500/10'
            : activity.status === 'running'
            ? 'text-blue-300 bg-blue-500/10'
            : 'text-yellow-300 bg-yellow-500/10'
        }`}>
          {activity.status.toUpperCase()}
        </div>
      </div>
      
      <div className="ml-1">
        <h4 className="text-sm font-medium text-white mb-1">
          {activity.action}
        </h4>
        <p className="text-xs text-gray-300">
          {activity.description}
        </p>
        {activity.duration && (
          <p className="text-xs text-gray-500 mt-1">
            Duration: {activity.duration}
          </p>
        )}
      </div>
    </div>
  )
}
