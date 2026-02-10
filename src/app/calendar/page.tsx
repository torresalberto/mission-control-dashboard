'use client'

import { useState, useEffect } from 'react'
import CalendarGrid from '@/components/CalendarGrid'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'nexagua' | 'system' | 'maintenance' | 'success'
  description?: string
  color: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchTasks() {
    try {
      const res = await fetch('/api/calendar')
      const data = await res.json()
      
      // Map tasks to calendar events
      const mapped: CalendarEvent[] = data.tasks.map((task: any) => {
        const start = new Date(task.next_run)
        const end = new Date(start.getTime() + 30 * 60 * 1000) // 30 min duration
        
        return {
          id: String(task.id),
          title: task.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          start,
          end,
          type: task.category as CalendarEvent['type'],
          color: task.category === 'nexagua' ? '#FF6B35' : 
                 task.category === 'maintenance' ? '#3b82f6' : '#22c55e',
          description: task.description
        }
      })
      
      setEvents(mapped)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch calendar:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">Scheduled Tasks</h1>
        <p className="text-gray-500">{events.length} active cron jobs</p>
      </div>
      <CalendarGrid 
        events={events} 
        currentDate={currentDate} 
        onDateChange={setCurrentDate} 
      />
    </div>
  )
}
