"use client"

import { useState, useEffect } from 'react'
import ActivityCard from '@/components/ActivityCard'
import type { ActivityItem } from '@/components/ActivityCard'

export default function ActivityPage() {
  const [filter, setFilter] = useState<string>('all')
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchActivities() {
    try {
      const res = await fetch('/api/activity')
      const data = await res.json()
      
      // Map database results to ActivityItem format
      const mapped = data.activities.map((row: any) => ({
        id: String(row.id),
        timestamp: row.timestamp,
        type: row.action_type,
        tool: row.tool_name,
        status: row.success ? 'success' : 'error',
        description: row.result_summary,
        session_id: row.session_id
      }))
      
      console.log(`Loaded ${mapped.length} activities`)
      setActivities(mapped)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchActivities, 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredActivities = activities.filter(
    activity => filter === 'all' || activity.type === filter
  )

  const typeLabels: Record<string, string> = {
    'message_send': 'Messages',
    'file_write': 'File Changes',
    'heartbeat': 'Health Checks',
    'cron_fire': 'Cron Jobs',
    'subagent_complete': 'Sub-agents',
    'tool_call': 'Tool Calls'
  }

  const uniqueTypes = ['all', ...new Set(activities.map(a => a.type).filter(Boolean))]

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Activity Feed</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 px-6 py-3">
          <div className="flex space-x-2">
            {uniqueTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All' : typeLabels[type] || type}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No activities found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <ActivityCard key={activity.id} item={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
